"use client";

import { type CSSProperties } from "react";
import AnimatedText from "@/components/AnimatedText/AnimatedText";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import { rethinkSans } from "@/lib/fonts";
import styles from "./Certifications.module.scss";
import type { CertificationsProps } from "./types";

export function Certifications({ title, description, cards = [] }: CertificationsProps) {
  const { ref: sectionRef, visible } = useRevealOnScroll<HTMLElement>();

  if (!title && cards.length === 0) return null;

  return (
    <section ref={sectionRef} className={`${styles.certifications} ${visible ? styles.visible : ""}`}>
      {(title || description) && (
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
      )}

      {cards.length > 0 && (
        <div className={styles.grid}>
          {cards.map((card, i) => {
            const cardStyle = { "--card-delay": `${0.1 + i * 0.04}s` } as CSSProperties;
            return (
              <div key={i} className={styles.card} style={cardStyle}>
                {card.icon && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className={styles.cardIcon} src={card.icon} alt="" />
                )}
                <div className={styles.cardText}>
                  {card.title && <p className={styles.cardTitle}><AnimatedText value={card.title} /></p>}
                  {card.description && (
                    <p className={styles.cardDescription}><AnimatedText value={card.description} /></p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Certifications;
