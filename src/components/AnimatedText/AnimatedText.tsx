"use client";

import type { ElementType } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { hasLocale, type LocalizedText } from "@/i18n/text";
import styles from "./AnimatedText.module.scss";

interface AnimatedTextProps {
  value?: LocalizedText | string | null;
  className?: string;
  /** Tag a renderizar (span por padrão). Ex.: "h1", "p". */
  as?: ElementType;
  /**
   * Se true, não renderiza nada quando não houver cadastro explícito para o
   * idioma atual, em vez de cair no fallback de `t()` (pt ou outro idioma
   * preenchido). Use em contextos onde exibir outro idioma seria pior do que
   * não exibir nada (ex.: footer).
   */
  strict?: boolean;
}

/**
 * Exibe um texto do CMS resolvido para o idioma atual e **anima a troca de copy**:
 * ao mudar de idioma, o nó remonta (key={locale}) e a animação de fade reexecuta.
 *
 * Use este componente para todo texto traduzível visível — ver specs/animations.md
 * e specs/i18n-cms-text.md.
 */
export function AnimatedText({ value, className, as: Tag = "span", strict }: AnimatedTextProps) {
  const { locale, t } = useLocale();

  if (strict && !hasLocale(value, locale)) return null;

  return (
    <Tag key={locale} className={`${styles.text} ${className ?? ""}`}>
      {t(value)}
    </Tag>
  );
}

export default AnimatedText;
