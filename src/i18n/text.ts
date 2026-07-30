import { DEFAULT_LOCALE, type Locale } from "./config";

/**
 * Texto trilíngue vindo do CMS. Todo campo de texto traduzível deve ter esta
 * forma: um objeto com um valor por idioma. Ver specs/i18n-cms-text.md.
 */
export type LocalizedText = Partial<Record<Locale, string>>;

// Hífen normal é ponto de quebra de linha para o navegador — troca por um
// hífen que não quebra para a palavra não ser dividida ("e-" / "commerce")
// quando o texto aperta no fim da linha.
const NO_BREAK_HYPHEN = "‑";

function preventWordBreaks(text: string): string {
  return text.replace(/\be-commerce\b/gi, (match) => match.replace("-", NO_BREAK_HYPHEN));
}

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
  const resolved =
    typeof value === "string"
      ? value
      : value[locale] || value[DEFAULT_LOCALE] || Object.values(value).find(Boolean) || "";
  return preventWordBreaks(resolved);
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
