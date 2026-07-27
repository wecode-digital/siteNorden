"use client";

import AnimatedText from "@/components/AnimatedText/AnimatedText";
import { rethinkSans } from "@/lib/fonts";
import styles from "./AboutMethodology.module.scss";
import type { AboutMethodologyProps } from "./types";

export function AboutMethodology({ title, cards = [] }: AboutMethodologyProps) {
  if (!title && cards.length === 0) return null;

  return (
    <section className={styles.methodology}>
      {title && (
        <AnimatedText as="h2" className={`${styles.title} ${rethinkSans.className}`} value={title} />
      )}

      {cards.length > 0 && (
        <div className={styles.row}>
          {cards.map((card, i) => (
            <div key={i} className={styles.card}>
              {card.title && (
                <p className={`${styles.cardTitle} ${rethinkSans.className}`}>
                  <AnimatedText value={card.title} />
                </p>
              )}
              {card.description && (
                <p className={styles.cardDescription}>
                  <AnimatedText value={card.description} />
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default AboutMethodology;
