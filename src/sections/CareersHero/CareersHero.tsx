"use client";

import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import { rethinkSans } from "@/lib/fonts";
import styles from "./CareersHero.module.scss";
import type { CareersHeroProps } from "../Careers/types";

export function CareersHero({ title, description, images = [] }: CareersHeroProps) {
  const { ref: sectionRef, visible } = useRevealOnScroll<HTMLElement>();

  if (!title && !description && images.length === 0) return null;

  const [top, bottomLeft, bottomRight] = images;

  return (
    <section ref={sectionRef} className={`${styles.hero} ${visible ? styles.visible : ""}`}>
      <div className={styles.head}>
        {title && <h1 className={`${styles.title} ${rethinkSans.className}`}>{title}</h1>}
        {description && <p className={styles.description}>{description}</p>}
      </div>

      {(top?.image || bottomLeft?.image || bottomRight?.image) && (
        <div className={styles.mosaic}>
          {top?.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.top} src={top.image} alt="" />
          )}
          {(bottomLeft?.image || bottomRight?.image) && (
            <div className={styles.bottomRow}>
              {bottomLeft?.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className={styles.bottomLeft} src={bottomLeft.image} alt="" />
              )}
              {bottomRight?.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className={styles.bottomRight} src={bottomRight.image} alt="" />
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default CareersHero;
