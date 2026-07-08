/**
 * Camada de acesso ao VTEX Headless CMS via @vtex/client-cms.
 *
 * Este é o site institucional (NÃO é FastStore) — usamos o CMS apenas como
 * fonte de conteúdo. A leitura é pública (só conteúdo publicado) e vai para:
 *   GET https://{workspace}--{tenant}.myvtex.com/_v/cms/api/{builder}/{contentType}
 *
 * Conta/workspace/builder vêm de variáveis de ambiente (ver .env.example), então
 * trocar de conta no futuro é só editar o .env — sem caçar valores hardcoded.
 *
 * Usar somente no servidor (Server Components / route handlers).
 */
import ClientCMS from "@vtex/client-cms";
import type { ContentData, ContentPage } from "@vtex/client-cms";
import type { HeaderData } from "@/components/Header/types";
import type { FooterData } from "@/components/Footer/types";
import type { ClientsConfig } from "@/sections/Clients/types";
import type { CaseContent, CaseSummary } from "@/sections/Cases/types";

// --- Configuração (env-driven) ---
const TENANT = process.env.VTEX_TENANT ?? "norden";
const WORKSPACE = process.env.VTEX_WORKSPACE ?? "master";
const BUILDER = process.env.VTEX_CMS_BUILDER ?? "faststore";

// --- Tipos expostos ao restante do app ---
/** Uma section retornada pelo CMS: `name` mapeia para um componente React; `data` são as props. */
export interface CmsSection {
  id?: string;
  name: string;
  data?: Record<string, unknown>;
}

/** Documento de conteúdo do CMS (ex.: uma página `home` ou `landingPage`). */
export type CmsDocument = ContentData & { sections: CmsSection[] };

// Instância única (o cliente é leve e stateless).
const client = new ClientCMS({
  tenant: TENANT,
  workspace: WORKSPACE,
  builder: BUILDER,
});

const EMPTY_PAGE: ContentPage = { hasNextPage: false, totalItems: 0, data: [] };

function logCmsError(where: string, error: unknown): void {
  // eslint-disable-next-line no-console
  console.error(`[CMS] Falha em ${where} (tenant=${TENANT}, builder=${BUILDER}):`, error);
}

/**
 * Retorna a primeira página de documentos publicados de um content type.
 * Em caso de falha do CMS, loga e retorna uma página vazia (não quebra a página).
 */
export async function getContentByType(
  contentType: string,
  opts: { page?: number; perPage?: number; filters?: Record<string, string> } = {}
): Promise<ContentPage> {
  try {
    return await client.getCMSPagesByContentType(contentType, opts);
  } catch (error) {
    logCmsError(`getContentByType("${contentType}")`, error);
    return EMPTY_PAGE;
  }
}

/**
 * Retorna TODOS os documentos publicados de um content type (segue a paginação).
 * Em caso de falha, loga e retorna o que já tiver coletado até ali.
 */
export async function getAllContent(
  contentType: string,
  perPage = 100
): Promise<CmsDocument[]> {
  const all: CmsDocument[] = [];
  let page = 1;

  try {
    for (;;) {
      const res = await client.getCMSPagesByContentType(contentType, { page, perPage });
      all.push(...((res?.data as CmsDocument[]) ?? []));
      if (!res?.hasNextPage) break;
      page += 1;
    }
  } catch (error) {
    logCmsError(`getAllContent("${contentType}")`, error);
  }

  return all;
}

/**
 * Localiza um documento por content type + slug e retorna suas sections.
 * O campo de slug padrão no schema do CMS é `settings.seo.slug`.
 * Retorna `null` se não encontrar ou em caso de falha do CMS.
 */
export async function getContentBySlug(
  contentType: string,
  slug: string,
  slugField = "settings.seo.slug"
): Promise<CmsSection[] | null> {
  try {
    const res = await client.getCMSPagesByContentType(contentType, {
      filters: { [slugField]: slug },
      perPage: 1,
    });
    const doc = res?.data?.[0] as CmsDocument | undefined;
    return doc?.sections ?? null;
  } catch (error) {
    logCmsError(`getContentBySlug("${contentType}", "${slug}")`, error);
    return null;
  }
}

/**
 * Documento completo de uma landing page pelo slug (`settings.seo.slug`).
 * Retorna sections + settings (SEO) — usado pela rota dinâmica.
 */
export async function getLandingPage(slug: string): Promise<CmsDocument | null> {
  try {
    const res = await client.getCMSPagesByContentType("landingPage", {
      filters: { "settings.seo.slug": slug },
      perPage: 1,
    });
    return (res?.data?.[0] as CmsDocument) ?? null;
  } catch (error) {
    logCmsError(`getLandingPage("${slug}")`, error);
    return null;
  }
}

/**
 * Sections da Home (content type `home`, singleton no CMS).
 * Retorna `[]` se não houver conteúdo publicado ou em caso de falha do CMS,
 * para a página nunca quebrar.
 */
export async function getHomeSections(): Promise<CmsSection[]> {
  try {
    const res = await client.getCMSPagesByContentType("home", { perPage: 1 });
    const doc = res?.data?.[0] as CmsDocument | undefined;
    return doc?.sections ?? [];
  } catch (error) {
    logCmsError("getHomeSections()", error);
    return [];
  }
}

/** SEO (`settings.seo`) do content type `home`: title/description/canonical. */
export interface PageSeo {
  title?: string;
  description?: string;
  canonical?: string;
}

export async function getHomeSeo(): Promise<PageSeo | null> {
  try {
    const res = await client.getCMSPagesByContentType("home", { perPage: 1 });
    const doc = res?.data?.[0] as CmsDocument | undefined;
    return (doc?.settings as { seo?: PageSeo } | undefined)?.seo ?? null;
  } catch (error) {
    logCmsError("getHomeSeo()", error);
    return null;
  }
}

/**
 * Todos os caminhos públicos conhecidos do site: Home, listagem de cases,
 * cada case e cada landing page publicados. Usado pelo sitemap e pela
 * revalidação on-demand (`?path=all`, já que o webhook do CMS é uma única URL
 * fixa e não distingue content type).
 */
export async function getAllKnownPaths(): Promise<string[]> {
  const [cases, landingPages] = await Promise.all([
    getAllCases(),
    getAllContent("landingPage"),
  ]);

  const casePaths = cases.map((c) => c.slug).filter((slug): slug is string => Boolean(slug));
  const landingPaths = landingPages
    .map((doc) => (doc.settings as { seo?: { slug?: string } } | undefined)?.seo?.slug)
    .filter((slug): slug is string => Boolean(slug));

  return [...new Set(["/", "/cases", ...casePaths, ...landingPaths])];
}

/**
 * Dados do header (section "Header" dentro do content type global `globalSections`).
 * Retorna `null` se ainda não houver conteúdo publicado ou em caso de falha —
 * o componente Header usa fallbacks nesse caso.
 */
export async function getHeaderData(): Promise<HeaderData | null> {
  try {
    const res = await client.getCMSPagesByContentType("globalSections", {
      perPage: 1,
    });
    const doc = res?.data?.[0] as CmsDocument | undefined;
    const section = doc?.sections?.find((s) => s.name === "Header");
    return (section?.data as HeaderData) ?? null;
  } catch (error) {
    logCmsError("getHeaderData()", error);
    return null;
  }
}

/**
 * Dados do footer (section "Footer" dentro de `globalSections`).
 */
export async function getFooterData(): Promise<FooterData | null> {
  try {
    const res = await client.getCMSPagesByContentType("globalSections", {
      perPage: 1,
    });
    const doc = res?.data?.[0] as CmsDocument | undefined;
    const section = doc?.sections?.find((s) => s.name === "Footer");
    return (section?.data as FooterData) ?? null;
  } catch (error) {
    logCmsError("getFooterData()", error);
    return null;
  }
}

/**
 * Config do bloco de clientes — content-type `clients` (singleton), section
 * "Clients": título, lista de logos, quantidade (mobile/desktop) e botão "ver mais".
 * Fonte única, reutilizada na Home e na futura página /clientes.
 */
export async function getClientsConfig(): Promise<ClientsConfig | null> {
  try {
    const res = await client.getCMSPagesByContentType("clients", { perPage: 1 });
    const doc = res?.data?.[0] as CmsDocument | undefined;
    const section = doc?.sections?.find((s) => s.name === "Clients");
    return (section?.data as ClientsConfig) ?? null;
  } catch (error) {
    logCmsError("getClientsConfig()", error);
    return null;
  }
}

// --- Cases (content-type `case`) ---
// Cada case é UM documento do content-type `case`, com uma section "Case" que
// concentra todo o conteúdo (card + corpo da página) e o slug em settings.seo.

/** Slug (settings.seo.slug) de um documento do CMS. */
function docSlug(doc: CmsDocument | undefined): string | undefined {
  return (doc?.settings as { seo?: { slug?: string } } | undefined)?.seo?.slug;
}

/** Dados da section "Case" de um documento. */
function caseSectionData(doc: CmsDocument | undefined): Record<string, unknown> {
  return (doc?.sections?.find((s) => s.name === "Case")?.data ?? {}) as Record<string, unknown>;
}

/** Normaliza um slug informado pelo editor para o caminho público /cases/<handle>. */
export function normalizeCasePath(input: string): string {
  const handle = input.trim().replace(/^\/+/, "").replace(/^cases\//, "");
  return `/cases/${handle}`;
}

/** Extrai o resumo (card) de um documento de case. */
function caseSummaryFromDoc(doc: CmsDocument): CaseSummary {
  const d = caseSectionData(doc);
  const slug = docSlug(doc);
  // A foto do card é a 1ª imagem da galeria (mosaico) — não há mais campo próprio.
  const gallery = (d.gallery as { image?: string }[] | undefined) ?? [];
  const cardImage = gallery.find((g) => g?.image)?.image;
  return {
    slug,
    url: slug,
    logo: d.logo as string | undefined,
    title: d.title as CaseSummary["title"],
    tags: d.tags as CaseSummary["tags"],
    image: cardImage,
  };
}

/** Extrai o conteúdo completo de um documento de case. */
function caseContentFromDoc(doc: CmsDocument): CaseContent {
  return { ...(caseSectionData(doc) as CaseContent), slug: docSlug(doc) };
}

/**
 * Documento completo de um case pelo slug (`settings.seo.slug`, ex.:
 * "/cases/luz-da-lua"). Retorna o conteúdo (section "Case") + SEO — usado pela
 * rota /cases/[slug]. `null` se não encontrar ou em caso de falha.
 */
export async function getCase(
  slug: string
): Promise<{ content: CaseContent; seo?: { title?: string; description?: string; canonical?: string } } | null> {
  try {
    const res = await client.getCMSPagesByContentType("case", {
      filters: { "settings.seo.slug": slug },
      perPage: 1,
    });
    const doc = res?.data?.[0] as CmsDocument | undefined;
    if (!doc) return null;
    const seo = (doc.settings as { seo?: { title?: string; description?: string; canonical?: string } } | undefined)
      ?.seo;
    return { content: caseContentFromDoc(doc), seo };
  } catch (error) {
    logCmsError(`getCase("${slug}")`, error);
    return null;
  }
}

/** Resumo (card) de TODOS os cases publicados (ordem do CMS). */
export async function getAllCases(): Promise<CaseSummary[]> {
  const docs = await getAllContent("case");
  console.log("casese ", docs)
  return docs.map(caseSummaryFromDoc).filter((c) => Boolean(c.slug));
}

/**
 * Resolve cases por slug informado pelo editor (ordem preservada; ignora os que
 * não existirem). Faz uma única leitura de todos os cases e casa por caminho.
 */
export async function resolveCasesBySlug(slugs: string[]): Promise<CaseSummary[]> {
  if (slugs.length === 0) return [];
  const all = await getAllCases();
  const byPath = new Map(all.map((c) => [c.slug, c]));
  return slugs
    .map((s) => byPath.get(normalizeCasePath(s)))
    .filter((c): c is CaseSummary => Boolean(c));
}

/**
 * Enriquece as sections de uma página com dados buscados no servidor:
 * - `ClientsList` recebe a config do content-type Clientes.
 * - `CasesShowcase` recebe os cases resolvidos (todos, ou pela lista de slugs).
 * Usada pela Home e pela rota de landing pages.
 */
export async function enrichSections(sections: CmsSection[]): Promise<CmsSection[]> {
  return Promise.all(
    sections.map(async (section) => {
      if (section.name === "ClientsList") {
        return { ...section, data: { ...section.data, config: await getClientsConfig() } };
      }
      if (section.name === "CasesShowcase") {
        const allCases = Boolean(section.data?.allCases);
        const slugs = ((section.data?.caseSlugs as { slug?: string }[] | undefined) ?? [])
          .map((c) => c?.slug)
          .filter((s): s is string => Boolean(s));
        const cases = allCases ? await getAllCases() : await resolveCasesBySlug(slugs);
        return { ...section, data: { ...section.data, cases } };
      }
      return section;
    })
  );
}
