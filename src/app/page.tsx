import { getClientsConfig, getHomeSections } from "@/lib/cms";
import { SectionsRenderer } from "@/sections/SectionsRenderer";

/**
 * ISR on-demand: a Home é gerada estaticamente e só é revalidada quando o
 * webhook de releases do CMS chama /api/revalidate. `false` = sem revalidação
 * por tempo (puramente sob demanda).
 */
export const revalidate = false;

export default async function HomePage() {
  const [sections, clientsConfig] = await Promise.all([
    getHomeSections(),
    getClientsConfig(),
  ]);

  // A section de exibição "ClientsList" recebe a config (título, logos, contagem,
  // ver mais) do content-type Clientes injetada no servidor, preservando seu
  // próprio `showMore`.
  const enriched = sections.map((section) =>
    section.name === "ClientsList"
      ? { ...section, data: { ...section.data, config: clientsConfig } }
      : section
  );

  return (
    <main>
      <SectionsRenderer sections={enriched} />
    </main>
  );
}
