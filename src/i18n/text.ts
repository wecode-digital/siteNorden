import { DEFAULT_LOCALE, type Locale } from "./config";

/**
 * Texto trilíngue vindo do CMS. Todo campo de texto traduzível deve ter esta
 * forma: um objeto com um valor por idioma. Ver specs/i18n-cms-text.md.
 */
export type LocalizedText = Partial<Record<Locale, string>>;

/**
 * Resolve um texto localizado para o idioma dado.
 * Fallback: idioma pedido → português (padrão) → primeiro valor preenchido → "".
 * Aceita `string` cru também (compatibilidade com campos não migrados).
 */
export function t(
  value: LocalizedText | string | undefined | null,
  locale: Locale
): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value[locale] || value[DEFAULT_LOCALE] || Object.values(value).find(Boolean) || "";
}

/**
 * Verifica se há cadastro explícito para o idioma pedido, sem aplicar o
 * fallback de `t()`. Use quando a ausência de tradução deve ocultar o texto
 * em vez de cair para outro idioma (ex.: footer).
 */
export function hasLocale(
  value: LocalizedText | string | undefined | null,
  locale: Locale
): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim() !== "";
  return Boolean(value[locale] && value[locale]!.trim() !== "");
}
