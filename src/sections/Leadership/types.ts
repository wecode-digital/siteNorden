import type { LocalizedText } from "@/i18n/text";

export interface LeadershipPerson {
  /** Nome próprio — não localizado (igual em qualquer idioma). */
  name?: string;
  description?: LocalizedText;
  /** Não localizadas — só variam por breakpoint (mobile/desktop). */
  photo?: string;
  photoDesktop?: string;
  linkedin?: string;
}

/** Bloco "Nossas Lideranças": título/descrição + cards de pessoas. */
export interface LeadershipProps {
  title?: LocalizedText;
  description?: LocalizedText;
  people?: LeadershipPerson[];
}
