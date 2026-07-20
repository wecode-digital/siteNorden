import type { LocalizedText } from "@/i18n/text";

export interface GrowthDataItem {
  value?: string;
  label?: LocalizedText;
}

export interface GrowthDifferentiator {
  /** Não localizadas — só variam por breakpoint (mobile/desktop). */
  image?: string;
  imageDesktop?: string;
  title?: LocalizedText;
  description?: LocalizedText;
}

/** Bloco "Nosso Crescimento": título/descrição + dados em destaque + diferenciais (sem carrossel). */
export interface GrowthProps {
  title?: LocalizedText;
  description?: LocalizedText;
  dataItems?: GrowthDataItem[];
  differentiators?: GrowthDifferentiator[];
}
