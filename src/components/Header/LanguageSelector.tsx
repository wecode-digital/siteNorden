"use client";

import { useEffect, useRef, useState } from "react";
import AnimatedText from "@/components/AnimatedText/AnimatedText";
import { LOCALES, LOCALE_LABELS } from "@/i18n/config";
import { useLocale } from "@/i18n/LocaleProvider";
import styles from "./Header.module.scss";
import { GlobeIcon } from "./icons";

interface LanguageSelectorProps {
  /** Direção das opções no dropdown. Header = vertical; menu mobile = horizontal. */
  orientation?: "vertical" | "horizontal";
  /** Classe extra no container (define tamanho/cor via CSS vars --lang-*). */
  className?: string;
}

/**
 * Seletor de idioma. Exibe o idioma ativo; ao clicar, abre a lista PT/EN/ES
 * (com animação de abre/fecha). A opção ativa é destacada com underline.
 * Mesma lógica em qualquer lugar; só a orientação/estilo mudam via props.
 */
export function LanguageSelector({
  orientation = "vertical",
  className,
}: LanguageSelectorProps) {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div className={`${styles.lang} ${className ?? ""}`} ref={ref}>
      <button
        type="button"
        className={styles.langButton}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Selecionar idioma"
      >
        <GlobeIcon className={styles.langIcon} />
        <AnimatedText value={LOCALE_LABELS[locale]} />
      </button>

      {/* Sempre montado: .langMenuOpen controla a animação de abre/fecha. */}
      <ul
        className={[
          styles.langMenu,
          orientation === "horizontal" ? styles.langMenuHorizontal : "",
          open ? styles.langMenuOpen : "",
        ].join(" ")}
        role="listbox"
      >
        {LOCALES.map((option) => (
          <li key={option}>
            <button
              type="button"
              role="option"
              aria-selected={option === locale}
              className={`${styles.langOption} ${option === locale ? styles.langOptionActive : ""}`}
              onClick={() => {
                setLocale(option);
                setOpen(false);
              }}
            >
              {LOCALE_LABELS[option]}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
