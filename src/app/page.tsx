import { enrichSections, getHomeSections } from "@/lib/cms";
import { SectionsRenderer } from "@/sections/SectionsRenderer";

/**
 * ISR on-demand: a Home é gerada estaticamente e só é revalidada quando o
 * webhook de releases do CMS chama /api/revalidate. `false` = sem revalidação
 * por tempo (puramente sob demanda).
 */
export const revalidate = false;

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
