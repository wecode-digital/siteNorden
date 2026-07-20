import type { LocalizedText } from "@/i18n/text";

export interface TrajectoryItem {
  year?: string;
  description?: LocalizedText;
  /** Opcional — se vazia (mobile e desktop), o item não exibe imagem. Não localizada (só varia por breakpoint). */
  image?: string;
  imageDesktop?: string;
}

/** Bloco "Trajetória": título/descrição + linha do tempo em carrossel. */
export interface TrajectoryProps {
  title?: LocalizedText;
  description?: LocalizedText;
  items?: TrajectoryItem[];
}
