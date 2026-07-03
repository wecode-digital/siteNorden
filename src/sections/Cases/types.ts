import type { LocalizedText } from "@/i18n/text";

export interface CaseTag {
  label?: LocalizedText;
}

/**
 * Resumo de um case (dados do card): lidos da section "Case" do documento do
 * content-type `case`. Usado nas listagens (Home, /cases, "cases similares").
 */
export interface CaseSummary {
  /** Slug/caminho do case (settings.seo.slug), ex.: "/cases/luz-da-lua". */
  slug?: string;
  logo?: string;
  title?: LocalizedText;
  tags?: CaseTag[];
  /** Foto do card: derivada da 1ª imagem da galeria (mosaico), não é campo próprio. */
  image?: string;
  /** URL do card (= slug). */
  url?: string;
}

export interface CaseGalleryImage {
  image?: string;
  alt?: LocalizedText;
}

export interface CaseTestimonial {
  /** Imagem ou vídeo do depoimento (sem texto sobreposto). */
  image?: string;
}

/**
 * Conteúdo completo de um case (section "Case" do content-type `case`).
 * É a fonte única: o card reaproveita alguns campos; a página /cases/<slug>
 * usa todos.
 */
export interface CaseContent {
  slug?: string;
  client?: string;
  logo?: string;
  title?: LocalizedText;
  summary?: LocalizedText;
  tags?: CaseTag[];
  gallery?: CaseGalleryImage[];
  /** Texto rico (draftjs por idioma). */
  challenge?: LocalizedText;
  /** Texto rico (draftjs por idioma). */
  solution?: LocalizedText;
  testimonial?: CaseTestimonial;
  /** Texto rico (draftjs por idioma). */
  results?: LocalizedText;
}

/** Props do componente de exibição de cases (dados injetados no SSR). */
export interface CasesShowcaseProps {
  title?: LocalizedText;
  cases?: CaseSummary[];
  moreLabel?: LocalizedText;
  moreUrl?: string;
  showMore?: boolean;
  /**
   * @deprecated Sem efeito. O layout agora é uniforme (3 cards/linha no desktop,
   * hover expande para 50% e encolhe os irmãos). Mantido por compatibilidade
   * com o schema do CMS e chamadas existentes.
   */
  featured?: boolean;
}

/** Props da página de um case (content resolvido no SSR). */
export interface CaseDetailProps {
  content: CaseContent;
}
