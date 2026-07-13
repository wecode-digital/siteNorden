import type { LocalizedText } from "@/i18n/text";

export interface CertificationCard {
  icon?: string;
  title?: LocalizedText;
  description?: LocalizedText;
}

/** Bloco "Tecnologias & Certificações": título + descrição, seguido de grid de cards. */
export interface CertificationsProps {
  title?: LocalizedText;
  description?: LocalizedText;
  cards?: CertificationCard[];
}
