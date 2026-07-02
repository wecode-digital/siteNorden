import type { LocalizedText } from "@/i18n/text";

/** Um logo de cliente (item do array `logos` da section Clients). */
export interface ClientLogo {
  logo?: string;
  /** Opcional — usado apenas no alt da imagem. */
  name?: string;
}

/** Config do bloco de clientes (section "Clients" em globalSections). */
export interface ClientsConfig {
  title?: LocalizedText;
  logos?: ClientLogo[];
  countMobile?: number;
  countDesktop?: number;
  moreLabel?: LocalizedText;
  moreUrl?: string;
}

/** Props do bloco Clients (a config vem do content-type, injetada no SSR). */
export interface ClientsProps {
  config?: ClientsConfig | null;
  /**
   * Exibir o botão "ver mais" (e limitar à contagem mobile/desktop).
   * `false` → mostra todos os logos, sem botão (ex.: página /clientes).
   */
  showMore?: boolean;
}
