"use client";

import AnimatedText from "@/components/AnimatedText/AnimatedText";
import CarouselControls from "@/components/Carousel/CarouselControls";
import { useCarousel } from "@/components/Carousel/useCarousel";
import { rethinkSans } from "@/lib/fonts";
import styles from "./Solutions.module.scss";
import type { SolutionCard, SolutionsProps } from "./types";

const badge = (n: number) => `[${String(n).padStart(2, "0")}]`;
const CARDS_PER_PAGE_DESKTOP = 4;

/** Carrossel de cards de uma categoria: swipe livre no mobile, setas + dots no desktop. */
function SolutionsCarousel({ cards }: { cards: SolutionCard[] }) {
  const { trackRef, registerItem, page, pages, goTo } = useCarousel(cards.length, CARDS_PER_PAGE_DESKTOP);

  return (
    <div className={styles.carouselWrap}>
      <div className={styles.track} ref={trackRef}>
        {cards.map((card, i) => (
          <div key={i} ref={registerItem(i)} className={styles.card}>
            {card.icon && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={styles.cardIcon} src={card.icon} alt="" />
            )}
            {card.title && <p className={styles.cardTitle}><AnimatedText value={card.title} /></p>}
            {card.label && <p className={styles.cardLabel}><AnimatedText value={card.label} /></p>}
          </div>
        ))}
      </div>

      <CarouselControls page={page} pages={pages} onGoTo={goTo} />
    </div>
  );
}

export function Solutions({ title, description, categories = [] }: SolutionsProps) {
  if (!title && categories.length === 0) return null;

  return (
    <section className={styles.solutions}>
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
        const cards = category.tags ?? [];
        if (!category.name && cards.length === 0) return null;
        return (
          <div key={i} className={styles.category}>
            <div className={`${styles.categoryHead} ${rethinkSans.className}`}>
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
