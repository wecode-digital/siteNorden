import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { enrichSections, getHomeSections, getHomeSeo } from "@/lib/cms";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import { SectionsRenderer } from "@/sections/SectionsRenderer";

/**
 * ISR on-demand: a Home é gerada estaticamente e só é revalidada quando o
 * webhook de releases do CMS chama /api/revalidate. `false` = sem revalidação
 * por tempo (puramente sob demanda).
 */
export const revalidate = false;

type Params = { params: Promise<{ locale: Locale }> };

// Imagem de compartilhamento (OG) da Home — hardcoded no repo (não vem do CMS).
// Arquivo em public/og-home.png (ideal: 1200x630px).
const HOME_OG_IMAGE = `${SITE_URL}/og-home.png`;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const seo = await getHomeSeo();
  return buildMetadata({
    title: seo?.title || "Norden",
    description: seo?.description,
    path: `/${locale}`,
    canonical: seo?.canonical,
    image: HOME_OG_IMAGE,
  });
}

export default async function HomePage() {
  // enrichSections injeta, no servidor, os dados de ClientsList (config) e
  // CasesShowcase (cases resolvidos por id).
  const enriched = await enrichSections(await getHomeSections());

  return (
    <main>
      <SectionsRenderer sections={enriched} />
    </main>
  );
}
