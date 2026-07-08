import type { Metadata } from "next";
import { getAllCases } from "@/lib/cms";
import { buildMetadata } from "@/lib/seo";
import CasesShowcase from "@/sections/Cases/CasesShowcase";

/**
 * Listagem de todos os cases (/cases). Página fixa — mais específica que a rota
 * dinâmica [...slug], então tem prioridade. Lista todos os cases publicados
 * (content-type `case`), sem botão "ver mais". ISR on-demand.
 */
export const revalidate = false;

const TITLE = { pt: "Nossos Cases", en: "Our Cases", es: "Nuestros Casos" };

export const metadata: Metadata = buildMetadata({
  title: "Cases",
  description: "Cases de sucesso de e-commerce da Norden: resultados reais de estratégia, implantação e growth.",
  path: "/cases",
});

export default async function CasesPage() {
  const cases = await getAllCases();

  return (
    <main style={{ paddingTop: "var(--norden-header-height)" }}>
      <CasesShowcase title={TITLE} cases={cases} showMore={false} featured={false} />
    </main>
  );
}
