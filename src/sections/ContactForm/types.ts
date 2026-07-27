import type { LocalizedText } from "@/i18n/text";
import type { FooterFormData } from "@/components/Footer/types";

/** Bloco "marquee + formulário de contato", igual ao topo do Footer, para uso em outras páginas. */
export interface ContactFormProps {
  marqueePhrase?: LocalizedText;
  form?: FooterFormData;
}
