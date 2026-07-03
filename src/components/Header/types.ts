import type { LocalizedText } from "@/i18n/text";

/** Um item de menu cadastrado no CMS. */
export interface MenuItem {
  label?: LocalizedText;
  url?: string;
}

/** Dados do header vindos do CMS (section "Header" em globalSections). */
export interface HeaderData {
  menuItems?: MenuItem[];
  /** Exibe os links de menu no header/drawer. Desativado por padrão. */
  showMenuItems?: boolean;
  /** Texto do botão de contato no header. */
  contactLabel?: LocalizedText;
  /** Texto do botão de contato no menu mobile (copy diferente do header). */
  menuContactLabel?: LocalizedText;
  contactUrl?: string;
}

/**
 * Resolve o link do botão de contato. A página `/contato` não existe: tanto o
 * valor vazio quanto o legado `/contato` caem no âncora do formulário no rodapé
 * (`#contato`). Qualquer outro valor cadastrado no CMS é respeitado.
 */
export function resolveContactUrl(url?: string): string {
  if (!url || url === "/contato") return "#contato";
  return url;
}
