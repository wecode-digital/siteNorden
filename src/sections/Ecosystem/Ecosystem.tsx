"use client";

import { type CSSProperties } from "react";
import Link from "next/link";
import AnimatedText from "@/components/AnimatedText/AnimatedText";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
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
  active
}: EcosystemProps) {
  // Revela a seção quando ela aparece "pela metade" (o topo cruza o meio da
  // tela). One-shot. As tags surgem da esquerda para a direita, uma por vez
  // (delay por --tag-delay).

  console.log("props ", ctaUrl, active)
  const { ref: sectionRef, visible } = useRevealOnScroll<HTMLElement>();

  if (!title && categories.length === 0) return null;

  // Índice inicial das tags de cada categoria — para o stagger ser contínuo
  // (esquerda→direita, uma por vez) ao longo de toda a seção.
  const tagStart: number[] = [];
  categories.reduce((acc, c, i) => {
    tagStart[i] = acc;
    return acc + (c.tags?.length ?? 0);
  }, 0);

  return (
    <section
      ref={sectionRef}
      className={`${styles.ecosystem} ${visible ? styles.visible : ""}`}
    >
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

      {categories.map((category, i) => {
        const catStyle = { "--cat-delay": `${0.1 + i * 0.06}s` } as CSSProperties;
        return (
          <div key={i} className={styles.category}>
            <div
              className={`${styles.categoryHead} ${rethinkSans.className}`}
              style={catStyle}
            >
              <span className={styles.number}>{badge(i + 1)}</span>
              <AnimatedText className={styles.categoryName} value={category.name} />
            </div>
            {category.tags && category.tags.length > 0 && (
              <div className={styles.tags}>
                {category.tags.map((tag, j) => {
                  const style = {
                    "--tag-delay": `${0.2 + (tagStart[i] + j) * 0.06}s`,
                  } as CSSProperties;
                  return (
                    <span key={j} className={styles.tag} style={style}>
                      <AnimatedText value={tag.label} />
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {active && ctaLabel && (
        <Link href={ctaUrl || "/solucoes"} className={styles.cta}>
          <AnimatedText value={ctaLabel} />
        </Link>
      )}
    </section>
  );
}

export default Ecosystem;
