"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import AnimatedText from "@/components/AnimatedText/AnimatedText";
import { rethinkSans } from "@/lib/fonts";
import styles from "./Ecosystem.module.scss";
import type { EcosystemProps } from "./types";

/** Número da categoria, ex.: [01], [02] — automático pela posição. */
const badge = (n: number) => `[${String(n).padStart(2, "0")}]`;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Ecosystem({
  title,
  description,
  categories = [],
  ctaLabel,
  ctaUrl,
}: EcosystemProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  // Revela a seção quando ela aparece "pela metade" (o topo cruza o meio da
  // tela — rootMargin -50% na base). One-shot. As tags surgem da esquerda para
  // a direita, uma por vez (delay por --tag-delay).
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -50% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

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

      {ctaLabel && (
        <Link href={ctaUrl || "/solucoes"} className={styles.cta}>
          <AnimatedText value={ctaLabel} />
        </Link>
      )}
    </section>
  );
}

export default Ecosystem;
