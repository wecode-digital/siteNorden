import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, LOCALES } from "@/i18n/config";

/**
 * Todo path precisa de um prefixo de idioma (`/pt`, `/en`, `/es`) — sem
 * exceção, nem para o padrão. Quem chega sem prefixo é redirecionado pro
 * idioma decidido por `?lang=` > cookie salvo > padrão (pt).
 *
 * Redirect temporário (307) enquanto validamos o comportamento — trocar para
 * permanente só depois de confirmado, já que 301 fica bem cacheado no navegador.
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const firstSegment = pathname.split("/")[1];
  if ((LOCALES as readonly string[]).includes(firstSegment)) {
    return NextResponse.next();
  }

  const fromQuery = searchParams.get("lang");
  const fromCookie = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(fromQuery) ? fromQuery : isLocale(fromCookie) ? fromCookie : DEFAULT_LOCALE;

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  url.searchParams.delete("lang");

  return NextResponse.redirect(url);
}

export const config = {
  // Exclui /api/*, /_next/* e qualquer caminho com extensão de arquivo
  // (robots.txt, sitemap.xml, favicon.svg, imagens, etc.) — nada disso deve
  // ganhar prefixo de idioma nem ser redirecionado.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
