import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getAllCases, getCase } from "@/lib/cms";
import { buildMetadata } from "@/lib/seo";
import CaseDetail from "@/sections/Cases/CaseDetail";
import CasesShowcase from "@/sections/Cases/CasesShowcase";

/**
 * Página de um case (content-type `case`). O slug do documento é o caminho
 * público completo, ex.: /cases/luz-da-lua (sem prefixo de idioma — é a chave
 * de busca no CMS; o prefixo é só de roteamento, ver `params.locale`). ISR
 * on-demand (webhook do CMS).
 */
export const revalidate = false;

type Params = { params: Promise<{ locale: Locale; slug: string }> };

const SIMILAR_TITLE = { pt: "Cases similares", en: "Similar cases", es: "Casos similares" };

/** Pré-renderiza (SSG) todos os cases publicados. */
export async function generateStaticParams() {
  const cases = await getAllCases();
  return cases
    .map((c) => c.slug)
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => ({ slug: slug.replace(/^\/cases\//, "").replace(/^\//, "") }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const path = `/cases/${slug}`;
  const found = await getCase(path);
  if (!found?.seo) return {};
  return buildMetadata({
    title: found.seo.title,
    description: found.seo.description,
    path: `/${locale}${path}`,
    canonical: found.seo.canonical,
    image: found.content.gallery?.find((g) => g?.image)?.image,
  });
}

export default async function CasePage({ params }: Params) {
  const { slug } = await params;
  const path = `/cases/${slug}`;
  const found = await getCase(path);
  if (!found) notFound();

  // "Cases similares": os demais cases publicados (exclui o atual).
  const similar = (await getAllCases()).filter((c) => c.slug !== path).slice(0, 3);

  return (
    <main style={{ paddingTop: "var(--norden-header-height)" }}>
      <CaseDetail content={found.content} />
      {similar.length > 0 && (
        <CasesShowcase title={SIMILAR_TITLE} cases={similar} showMore moreUrl="/cases" featured={false} />
      )}
    </main>
  );
}
