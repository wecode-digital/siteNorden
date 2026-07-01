"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "./config";
import { t as translate, type LocalizedText } from "./text";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  /** Resolve um texto localizado para o idioma atual. */
  t: (value: LocalizedText | string | undefined | null) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readCookieLocale(): Locale | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  return isLocale(match?.[1]) ? (match![1] as Locale) : null;
}

/**
 * Provider de idioma (client-side). Renderiza no idioma padrão (PT) no servidor
 * e, ao montar, aplica a preferência salva no cookie — evitando divergência de
 * hidratação. A troca persiste em cookie por 1 ano.
 */
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const saved = readCookieLocale();
    if (saved && saved !== locale) setLocaleState(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t: (v) => translate(v, locale) }),
    [locale, setLocale]
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
