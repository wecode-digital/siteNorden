import type { LocalizedText } from "@/i18n/text";

export interface CaseTag {
  label?: LocalizedText;
}

/** Resumo de um case (lido da section "CaseCard" da LP do case + slug da LP). */
export interface CaseSummary {
  logo?: string;
  title?: LocalizedText;
  tags?: CaseTag[];
  image?: string;
  /** URL da LP do case (settings.seo.slug), usada como link do card. */
  url?: string;
}

/** Props do componente de exibição de cases (dados injetados no SSR). */
export interface CasesShowcaseProps {
  title?: LocalizedText;
  cases?: CaseSummary[];
  moreLabel?: LocalizedText;
  moreUrl?: string;
  showMore?: boolean;
}
