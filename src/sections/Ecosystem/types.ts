import type { LocalizedText } from "@/i18n/text";

export interface EcosystemTag {
  label?: LocalizedText;
}

export interface EcosystemCategory {
  name?: LocalizedText;
  tags?: EcosystemTag[];
}

/** Bloco "Nosso ecossistema" (serviços/soluções) — só na Home. */
export interface EcosystemProps {
  title?: LocalizedText;
  description?: LocalizedText;
  categories?: EcosystemCategory[];
  ctaLabel?: LocalizedText;
  ctaUrl?: string;
}
