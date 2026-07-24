/**
 * Página de Carreiras — sem LocalizedText (decisão do usuário: só PT nesta
 * página inteira). Ver specs/careers-page.md.
 */

export interface JobSectionItem {
  buttonLabel?: string;
  content?: string;
}

/**
 * Uma vaga — item do array `jobs` da section "JobsList" (não é mais um
 * content-type/documento separado: não há rota por vaga, então não precisa
 * de SEO/slug próprio).
 */
export interface JobContent {
  title?: string;
  description?: string;
  /** `false` = só aparece na aba "Todas" do filtro. */
  open?: boolean;
  sections?: JobSectionItem[];
}

export interface CareersHeroImage {
  image?: string;
  imageDesktop?: string;
}

/** Bloco fixo do topo de /carreiras. */
export interface CareersHeroProps {
  title?: string;
  description?: string;
  images?: CareersHeroImage[];
}

/** Props da section "JobsList" — `jobs` vem direto do CMS (array cadastrado nesta mesma section). */
export interface JobsListProps {
  title?: string;
  jobs?: JobContent[];
}
