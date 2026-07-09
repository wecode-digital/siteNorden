import { LOCALES, type Locale } from "./config";

/**
 * Prefixa um caminho interno com o idioma (`/en/cases/bibi`). Todo link
 * interno do site precisa passar por aqui — não existe mais idioma "sem
 * prefixo" (nem o pt): as 3 URLs são simétricas.
 *
 * Âncoras (`#contato`), URLs externas (`http://...`) e esquemas especiais
 * (`mailto:`, `tel:`) passam direto, sem prefixo — só caminhos internos
 * (começam com `/`) são prefixados.
 */
export function localizedHref(path: string, locale: Locale): string {
  if (!path.startsWith("/")) return path;
  const suffix = path === "/" ? "" : path;
  return `/${locale}${suffix}`;
}

/**
 * Troca o prefixo de idioma de um pathname atual (ex.: de `/es/cases/bibi`
 * pra `/en/cases/bibi`). Usado pelo seletor de idioma para navegar mantendo a
 * página atual. Se o pathname não tiver um prefixo de locale reconhecido,
 * trata como se fosse a raiz nesse idioma.
 */
export function swapLocaleInPath(pathname: string, nextLocale: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  const [first, ...rest] = segments;
  const hasLocalePrefix = (LOCALES as readonly string[]).includes(first);
  const restPath = hasLocalePrefix ? rest : segments;
  return localizedHref(restPath.length ? `/${restPath.join("/")}` : "/", nextLocale);
}
