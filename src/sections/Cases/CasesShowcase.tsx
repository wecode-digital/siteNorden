"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import AnimatedText from "@/components/AnimatedText/AnimatedText";
import styles from "./CasesShowcase.module.scss";
import type { CaseSummary, CasesShowcaseProps } from "./types";

const DEFAULT_MORE = { pt: "Ver mais cases", en: "See more cases", es: "Ver más casos" };

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Agrupa os cases em linhas de 3 — cada linha é um flex container, o que
 * permite o hover expandir 1 card (50%) e encolher os irmãos da linha (25%). */
function chunk<T>(arr: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < arr.length; i += size) rows.push(arr.slice(i, i + size));
  return rows;
}

function Card({ item }: { item: CaseSummary }) {
  return (
    <>
      <div className={styles.cardBody}>
        {/* Wrapper com largura "congelável": no hover (desktop) a largura do
            texto é fixada na do card em repouso, para o texto NÃO refluir
            enquanto o card cresce — só a caixa/imagem ganham espaço. */}
        <div className={styles.cardContent}>
          {item.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.logo} alt="" className={styles.cardLogo} />
          )}
          <h3 className={styles.cardTitle}>
            <AnimatedText value={item.title} className={styles.cardTitleText} />
          </h3>
          {item.tags && item.tags.length > 0 && (
            <div className={styles.tags}>
              {item.tags.map((tag, i) => (
                <span key={i} className={styles.tag}>
                  <AnimatedText value={tag.label} />
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      {item.image && (
        <div className={styles.cardImage}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image} alt="" />
        </div>
      )}
    </>
  );
}

export function CasesShowcase({
  title,
  cases = [],
  moreLabel,
  moreUrl,
  showMore = true,
}: CasesShowcaseProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  // Revela a seção (fade + subida do título e dos cards, em cascata) quando ela
  // entra na viewport. One-shot: anima uma vez ao aparecer.
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
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (cases.length === 0 && !title) return null;

  const rows = chunk(cases, 3);

  return (
    <section
      ref={sectionRef}
      className={`${styles.cases} ${visible ? styles.visible : ""}`}
    >
      {title && (
        <h2 className={styles.title}>
          <AnimatedText value={title} />
        </h2>
      )}

      {/* Desktop: 3 cards por linha (33%); no hover, o card vai a 50% e os
          irmãos da linha a 25%. Mobile: coluna única. */}
      <div className={styles.grid}>
        {rows.map((row, r) => (
          <div className={styles.row} key={r}>
            {row.map((item, c) => {
              const idx = r * 3 + c;
              const style = { "--reveal-delay": `${idx * 0.08}s` } as CSSProperties;
              return item.url ? (
                <Link key={c} href={item.url} className={styles.card} style={style}>
                  <Card item={item} />
                </Link>
              ) : (
                <div key={c} className={styles.card} style={style}>
                  <Card item={item} />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {showMore && (
        <div className={styles.more}>
          <Link href={moreUrl || "/cases"} className={styles.moreButton}>
            <AnimatedText value={moreLabel ?? DEFAULT_MORE} />
          </Link>
        </div>
      )}
    </section>
  );
}

export default CasesShowcase;
