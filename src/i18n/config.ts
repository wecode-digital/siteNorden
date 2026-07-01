/** Configuração de idiomas do site. */
export const LOCALES = ["pt", "en", "es"] as const;

export type Locale = (typeof LOCALES)[number];

/** Idioma padrão (exibido antes de qualquer escolha do usuário). */
export const DEFAULT_LOCALE: Locale = "pt";

/** Cookie que persiste a preferência de idioma. */
export const LOCALE_COOKIE = "norden_locale";

/** Rótulos exibidos no seletor de idioma. */
export const LOCALE_LABELS: Record<Locale, string> = {
  pt: "PT",
  en: "EN",
  es: "ES",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
