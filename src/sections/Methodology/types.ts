import type { LocalizedText } from "@/i18n/text";

export interface MethodologyItem {
  label?: LocalizedText;
}

/** Seção Metodologia (só na Home): citação (texto rico) + lista animada no scroll. */
export interface MethodologyProps {
  /** Citação em texto rico (draftjs, por idioma). */
  quote?: LocalizedText;
  listTitle?: LocalizedText;
  items?: MethodologyItem[];
}
