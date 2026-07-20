import type { LocalizedText } from "@/i18n/text";

export interface AboutMethodologyCard {
  title?: LocalizedText;
  description?: LocalizedText;
}

/**
 * Bloco "Nossa Metodologia" da página Sobre: título + cards de texto.
 * Não confundir com a section "Methodology" da Home (citação + lista).
 */
export interface AboutMethodologyProps {
  title?: LocalizedText;
  cards?: AboutMethodologyCard[];
}
