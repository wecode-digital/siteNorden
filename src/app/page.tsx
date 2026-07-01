import { getHomeSections } from "@/lib/cms";
import { SectionsRenderer } from "@/sections/SectionsRenderer";

/**
 * ISR on-demand: a Home é gerada estaticamente e só é revalidada quando o
 * webhook de releases do CMS chama /api/revalidate. `false` = sem revalidação
 * por tempo (puramente sob demanda).
 */
export const revalidate = false;

export default async function HomePage() {
  const sections = await getHomeSections();

  return (
    <main>
      <SectionsRenderer sections={sections} />
    </main>
  );
}
