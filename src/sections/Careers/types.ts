/**
 * Página de Carreiras — sem LocalizedText (decisão do usuário: só PT nesta
 * página inteira). Ver specs/careers-page.md.
 */

export interface JobSectionItem {
  buttonLabel?: string;
  content?: string;
}

/** Conteúdo de uma vaga (section "Job" de um documento do content-type `job`). */
export interface JobContent {
  /** Slug (settings.seo.slug) — identificador único, não é uma rota navegável. */
  slug?: string;
  title?: string;
  description?: string;
  /** `false` = só aparece na aba "Todas" do filtro. */
  open?: boolean;
  sections?: JobSectionItem[];
}

export interface CareersHeroImage {
  image?: string;
}

/** Bloco fixo do topo de /carreiras. */
export interface CareersHeroProps {
  title?: string;
  description?: string;
  images?: CareersHeroImage[];
}

/** Props da section que exibe a lista (dados injetados no SSR via enrichSections). */
export interface JobsListProps {
  title?: string;
  jobs?: JobContent[];
}
