import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { enrichSections, getAllContent, getLandingPage } from "@/lib/cms";
import { SectionsRenderer } from "@/sections/SectionsRenderer";

/**
 * Rota dinâmica para landing pages do CMS (content-type `landingPage`).
 * Ex.: /clientes → busca a landing page com `settings.seo.slug === "/clientes"`
 * e renderiza as sections. ISR on-demand (revalida via webhook do CMS).
 */
export const revalidate = false;

type Params = { params: Promise<{ slug: string[] }> };

const toPath = (slug: string[]) => `/${slug.join("/")}`;

interface LandingSeo {
  title?: string;
  description?: string;
}

/** Pré-renderiza (SSG) todas as landing pages publicadas com slug válido. */
export async function generateStaticParams() {
  const docs = await getAllContent("landingPage");
  return docs
    .map((doc) => (doc.settings as { seo?: { slug?: string } } | undefined)?.seo?.slug)
    .filter((slug): slug is string => Boolean(slug && slug.startsWith("/") && slug !== "/"))
    // /cases e /cases/* têm rotas dedicadas (app/cases/**) — evita duplicar.
    .filter((slug) => slug !== "/cases" && !slug.startsWith("/cases/"))
    .map((slug) => ({ slug: slug.replace(/^\//, "").split("/") }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getLandingPage(toPath(slug));
  const seo = (doc?.settings as { seo?: LandingSeo } | undefined)?.seo;
  if (!seo) return {};
  return { title: seo.title, description: seo.description };
}

export default async function LandingPageRoute({ params }: Params) {
  const { slug } = await params;
  const doc = await getLandingPage(toPath(slug));
  if (!doc) notFound();

  const enriched = await enrichSections(doc.sections ?? []);

  return (
    // Espaço no topo = altura do header (fixed). Só nas páginas que não são a home.
    <main style={{ paddingTop: "var(--norden-header-height)" }}>
      <SectionsRenderer sections={enriched} />
    </main>
  );
}
