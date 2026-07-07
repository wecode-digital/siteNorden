import type { LocalizedText } from "@/i18n/text";

/** Coluna de ícones sociais (ícone = imagem do CMS + link). */
export interface SocialColumn {
  active: boolean;
  type: "social";
  title?: LocalizedText;
  socialItems?: { icon?: string; url?: string }[];
}

/** Coluna de links (rótulo trilíngue + URL). */
export interface LinksColumn {
  active: boolean;
  type: "links";
  title?: LocalizedText;
  links?: { label?: LocalizedText; url?: string }[];
}

/** Coluna de texto rico/markdown (trilíngue). */
export interface RichTextColumn {
  active: boolean;
  type: "richtext";
  title?: LocalizedText;
  body?: LocalizedText;
}

/** Coluna de e-mail (link mailto). */
export interface EmailColumn {
  active: boolean;
  type: "email";
  title?: LocalizedText;
  email?: string;
}

/** Coluna de telefone (link tel). */
export interface PhoneColumn {
  active: boolean;
  type: "phone";
  title?: LocalizedText;
  phone?: string;
}

export type FooterColumn =
  | SocialColumn
  | LinksColumn
  | RichTextColumn
  | EmailColumn
  | PhoneColumn;

/** Dados do formulário do footer (textos do CMS). */
export interface FooterFormData {
  title?: LocalizedText;
  heading?: LocalizedText;
  namePlaceholder?: LocalizedText;
  companyPlaceholder?: LocalizedText;
  emailPlaceholder?: LocalizedText;
  phonePlaceholder?: LocalizedText;
  submitLabel?: LocalizedText;
}

/** Dados do footer vindos do CMS (section "Footer" em globalSections). */
export interface FooterData {
  marqueePhrase?: LocalizedText;
  form?: FooterFormData;
  columns?: FooterColumn[];
  copyrightName?: string;
  policyLinks?: { label?: LocalizedText; url?: string }[];
}
