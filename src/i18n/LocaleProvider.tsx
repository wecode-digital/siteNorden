"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { LOCALE_COOKIE, type Locale } from "./config";
import { swapLocaleInPath } from "./routing";
import { t as translate, type LocalizedText } from "./text";

interface LocaleContextValue {
  locale: Locale;
  /** Navega para a mesma página no novo idioma (troca o prefixo da URL) e salva a preferência. */
  setLocale: (next: Locale) => void;
  /** Resolve um texto localizado para o idioma atual. */
  t: (value: LocalizedText | string | undefined | null) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * Provider de idioma. O idioma vem do segmento `[locale]` da URL (resolvido no
 * servidor, via `initialLocale`) — não é mais um estado adivinhado no cliente,
 * então não precisa de `useState`/efeito de sincronização: `locale` sempre
 * reflete a URL atual. Trocar de idioma navega para o path equivalente no novo
 * prefixo; o cookie só serve pra lembrar a preferência em futuras visitas sem
 * prefixo (o middleware decide pra onde redirecionar com base nele).
 */
export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.lang = initialLocale;
  }, [initialLocale]);

  const setLocale = useCallback(
    (next: Locale) => {
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      router.push(swapLocaleInPath(pathname, next));
    },
    [pathname, router]
  );

  const value = useMemo<LocaleContextValue>(
    () => ({ locale: initialLocale, setLocale, t: (v) => translate(v, initialLocale) }),
    [initialLocale, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale deve ser usado dentro de <LocaleProvider>.");
  }
  return ctx;
}
