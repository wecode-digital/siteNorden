"use client";

import Link from "next/link";
import AnimatedText from "@/components/AnimatedText/AnimatedText";
import { rethinkSans } from "@/lib/fonts";
import styles from "./Ecosystem.module.scss";
import type { EcosystemProps } from "./types";

/** Número da categoria, ex.: [01], [02] — automático pela posição. */
const badge = (n: number) => `[${String(n).padStart(2, "0")}]`;

export function Ecosystem({
  title,
  description,
  categories = [],
  ctaLabel,
  ctaUrl,
}: EcosystemProps) {
  if (!title && categories.length === 0) return null;

  return (
    <section className={styles.ecosystem}>
      <div className={styles.head}>
        {title && (
          <AnimatedText as="h2" className={`${styles.title} ${rethinkSans.className}`} value={title} />
        )}
        {description && (
          <p className={styles.description}>
            <AnimatedText value={description} />
          </p>
        )}
      </div>

      {categories.map((category, i) => (
        <div key={i} className={styles.category}>
          <div className={`${styles.categoryHead} ${rethinkSans.className}`}>
            <span className={styles.number}>{badge(i + 1)}</span>
            <AnimatedText className={styles.categoryName} value={category.name} />
          </div>
          {category.tags && category.tags.length > 0 && (
            <div className={styles.tags}>
              {category.tags.map((tag, j) => (
                <span key={j} className={styles.tag}>
                  <AnimatedText value={tag.label} />
                </span>
              ))}
            </div>
          )}
        </div>
      ))}

      {ctaLabel && (
        <Link href={ctaUrl || "/solucoes"} className={styles.cta}>
          <AnimatedText value={ctaLabel} />
        </Link>
      )}
    </section>
  );
}

export default Ecosystem;
