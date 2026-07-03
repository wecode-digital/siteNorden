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
import type { CaseSummary } from "@/sections/Cases/types";
import type { LocalizedText } from "@/i18n/text";

// --- Configuração (env-driven) ---
const TENANT = process.env.VTEX_TENANT ?? "cubomedia";
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

/**
 * Resumo de um case: busca a LP do case pelo id (documento) e lê a section
 * "CaseCard" (logo, título, tags, imagem) + o slug da LP (link do card).
 */
export async function getCaseCard(id: string): Promise<CaseSummary | null> {
  try {
    // Sem versionId/releaseId → retorna a versão publicada (o tipo do client
    // exige um deles, mas em runtime o endpoint por id devolve a publicada).
    const doc = (await client.getCMSPage({
      contentType: "landingPage",
      documentId: id,
    } as unknown as Parameters<typeof client.getCMSPage>[0])) as CmsDocument | undefined;
    const card = doc?.sections?.find((s) => s.name === "CaseCard")?.data as
      | { logo?: string; title?: LocalizedText; tags?: { label?: LocalizedText }[]; image?: string }
      | undefined;
    if (!card) return null;
    const url = (doc?.settings as { seo?: { slug?: string } } | undefined)?.seo?.slug;
    return { ...card, url };
  } catch (error) {
    logCmsError(`getCaseCard("${id}")`, error);
    return null;
  }
}

/** Resolve vários cases por id (ordem preservada; ignora os que falharem). */
export async function resolveCases(ids: string[]): Promise<CaseSummary[]> {
  const results = await Promise.all(ids.map((id) => getCaseCard(id)));
  return results.filter((c): c is CaseSummary => Boolean(c));
}

/**
 * Enriquece as sections de uma página com dados buscados no servidor:
 * - `ClientsList` recebe a config do content-type Clientes.
 * - `CasesShowcase` recebe os cases resolvidos a partir dos IDs cadastrados.
 * Usada pela Home e pela rota de landing pages.
 */
export async function enrichSections(sections: CmsSection[]): Promise<CmsSection[]> {
  return Promise.all(
    sections.map(async (section) => {
      if (section.name === "ClientsList") {
        return { ...section, data: { ...section.data, config: await getClientsConfig() } };
      }
      if (section.name === "CasesShowcase") {
        const ids = ((section.data?.caseIds as { id?: string }[] | undefined) ?? [])
          .map((c) => c?.id)
          .filter((id): id is string => Boolean(id));
        return { ...section, data: { ...section.data, cases: await resolveCases(ids) } };
      }
      return section;
    })
  );
}
