import type { MouseEvent } from "react";
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

/**
 * Clique no botão de contato: quando aponta pro âncora do formulário
 * (`#contato`), rola manualmente até ele em vez de depender do hash da URL.
 * Necessário porque, se a URL já termina em `#contato` (clique anterior), o
 * hash não muda de novo e o navegador não dispara o scroll nativo.
 */
export function handleContactClick(url: string, event: MouseEvent): void {
  if (url !== "#contato") return;
  const target = document.getElementById("contato");
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}
