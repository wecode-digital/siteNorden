import type { LocalizedText } from "@/i18n/text";

/** Bloco "Atuação 360º": texto + imagem, lado a lado no desktop, empilhado no mobile. */
export interface AtuacaoProps {
  title?: LocalizedText;
  description?: LocalizedText;
  image?: LocalizedText;
  imageDesktop?: LocalizedText;
}
