import type { LocalizedText } from "@/i18n/text";

export interface SolutionCard {
  icon?: string;
  title?: LocalizedText;
  label?: LocalizedText;
}

export interface SolutionCategory {
  name?: LocalizedText;
  tags?: SolutionCard[];
}

/** Bloco "Nossas soluções": título, descrição, categorias com cards em swiper. */
export interface SolutionsProps {
  title?: LocalizedText;
  description?: LocalizedText;
  categories?: SolutionCategory[];
}
