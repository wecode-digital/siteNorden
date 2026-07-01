import type { CmsSection } from "@/lib/cms";
import { sectionRegistry } from "./registry";

/**
 * Percorre as sections de um documento do CMS e renderiza cada uma com o
 * componente correspondente no registry. Sections sem componente registrado
 * são ignoradas (com aviso em dev).
 */
export function SectionsRenderer({ sections }: { sections: CmsSection[] }) {
  return (
    <>
      {sections.map((section, index) => {
        const Component = sectionRegistry[section.name];

        if (!Component) {
          if (process.env.NODE_ENV !== "production") {
            // eslint-disable-next-line no-console
            console.warn(`[CMS] Section sem componente registrado: "${section.name}"`);
          }
          return null;
        }

        return <Component key={section.id ?? `${section.name}-${index}`} {...section.data} />;
      })}
    </>
  );
}
