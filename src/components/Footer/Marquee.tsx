"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import { rethinkSans } from "@/lib/fonts";
import type { LocalizedText } from "@/i18n/text";
import styles from "./Footer.module.scss";

/**
 * Frase em loop horizontal infinito. Duplica a sequência e anima translateX
 * até -50%, garantindo repetição contínua e sem emenda. Respeita reduced-motion.
 */
export function Marquee({ phrase }: { phrase?: LocalizedText | string }) {
  const { t } = useLocale();
  const text = t(phrase);
  if (!text) return null;

  const sequence = Array.from({ length: 4 }, (_, i) => (
    <span key={i} className={styles.marqueeItem}>
      {text}
    </span>
  ));

  return (
    <div className={`${styles.marquee} ${rethinkSans.className}`} aria-label={text}>
      <div className={styles.marqueeTrack} aria-hidden="true">
        {sequence}
        {sequence}
      </div>
    </div>
  );
}
