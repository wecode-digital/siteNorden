import type { LocalizedText } from "@/i18n/text";

/** Um item de menu cadastrado no CMS. */
export interface MenuItem {
  label?: LocalizedText;
  url?: string;
}

/** Dados do header vindos do CMS (section "Header" em globalSections). */
export interface HeaderData {
  menuItems?: MenuItem[];
  /** Texto do botão de contato no header. */
  contactLabel?: LocalizedText;
  /** Texto do botão de contato no menu mobile (copy diferente do header). */
  menuContactLabel?: LocalizedText;
  contactUrl?: string;
}
