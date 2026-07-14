"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import AnimatedText from "@/components/AnimatedText/AnimatedText";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import { rethinkSans } from "@/lib/fonts";
import styles from "./Solutions.module.scss";
import type { SolutionCard, SolutionsProps } from "./types";

const badge = (n: number) => `[${String(n).padStart(2, "0")}]`;
const CARDS_PER_PAGE_DESKTOP = 4;

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      {direction === "left" ? (
        <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

/** Carrossel de cards de uma categoria: swipe livre no mobile, setas + dots no desktop. */
function SolutionsCarousel({ cards }: { cards: SolutionCard[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(cards.length / CARDS_PER_PAGE_DESKTOP));

  // Página ativa = posição do scroll como fração do percurso total (0 → 1),
  // mapeada pra página mais próxima. Não dá pra usar "qual card está no início":
  // quando o total de cards não é múltiplo de 4, a última página não tem como
  // deixar seu 1º card exatamente no início (o navegador trava o scroll no fim
  // do conteúdo, sobrando cards "pra trás" visíveis) — a conta por card errava
  // a última página nesse caso. Por fração do scroll, o fim sempre bate com a
  // última página, não importa quantos cards sobraram nela.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const maxScroll = el.scrollWidth - el.clientWidth;
        const progress = maxScroll > 0 ? el.scrollLeft / maxScroll : 0;
        setPage(Math.round(progress * (pages - 1)));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [pages]);

  // Página do meio: rola até o PRIMEIRO card dela — ponto de snap real
  // (scroll-snap-align:start). Última página: vai até o fim do scroll (não dá
  // pra alinhar um card ao início sem sobrar espaço vazio depois dele).
  const goTo = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    if (index >= pages - 1) {
      el.scrollTo({ left: el.scrollWidth - el.clientWidth, behavior: "smooth" });
      return;
    }
    cardRefs.current[index * CARDS_PER_PAGE_DESKTOP]?.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });
  };

  return (
    <div className={styles.carouselWrap}>
      <div className={styles.track} ref={trackRef}>
        {cards.map((card, i) => (
          <div
            key={i}
            ref={(node) => {
              cardRefs.current[i] = node;
            }}
            className={styles.card}
          >
            {card.icon && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={styles.cardIcon} src={card.icon} alt="" />
            )}
            {card.title && <p className={styles.cardTitle}><AnimatedText value={card.title} /></p>}
            {card.label && <p className={styles.cardLabel}><AnimatedText value={card.label} /></p>}
          </div>
        ))}
      </div>

      {pages > 1 && (
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.arrow}
            aria-label="Anterior"
            disabled={page <= 0}
            onClick={() => goTo(Math.max(0, page - 1))}
          >
            <ArrowIcon direction="left" />
          </button>
          <div className={styles.dots}>
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Página ${i + 1}`}
                className={`${styles.dot} ${i === page ? styles.dotActive : ""}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
          <button
            type="button"
            className={styles.arrow}
            aria-label="Próximo"
            disabled={page >= pages - 1}
            onClick={() => goTo(Math.min(pages - 1, page + 1))}
          >
            <ArrowIcon direction="right" />
          </button>
        </div>
      )}
    </div>
  );
}

export function Solutions({ title, description, categories = [] }: SolutionsProps) {
  const { ref: sectionRef, visible } = useRevealOnScroll<HTMLElement>();

  if (!title && categories.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className={`${styles.solutions} ${visible ? styles.visible : ""}`}
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
        const cards = category.tags ?? [];
        if (!category.name && cards.length === 0) return null;
        return (
          <div key={i} className={styles.category}>
            <div className={`${styles.categoryHead} ${rethinkSans.className}`} style={catStyle}>
              <span className={styles.number}>{badge(i + 1)}</span>
              <AnimatedText className={styles.categoryName} value={category.name} />
            </div>
            {cards.length > 0 && <SolutionsCarousel cards={cards} />}
          </div>
        );
      })}
    </section>
  );
}

export default Solutions;
