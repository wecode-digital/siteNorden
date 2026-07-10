import type { LocalizedText } from "@/i18n/text";

/**
 * Conteúdo da página de Política de Privacidade (section "PrivacyPolicy" do
 * content-type `privacyPolicy`, singleton).
 */
export interface PrivacyPolicyContent {
  title?: LocalizedText;
  /** Texto rico (draftjs por idioma). */
  description?: LocalizedText;
}

/** Props do componente de exibição (content resolvido no SSR). */
export interface PrivacyPolicyProps {
  content: PrivacyPolicyContent;
}
