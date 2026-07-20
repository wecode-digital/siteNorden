"use client";

import AnimatedText from "@/components/AnimatedText/AnimatedText";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import { rethinkSans } from "@/lib/fonts";
import styles from "./Growth.module.scss";
import type { GrowthDataItem, GrowthDifferentiator, GrowthProps } from "./types";

function DataItem({ item }: { item: GrowthDataItem }) {
  if (!item.value && !item.label) return null;
  return (
    <div className={styles.dataItem}>
      {item.value && <p className={`${styles.dataValue} ${rethinkSans.className}`}>{item.value}</p>}
      {item.label && (
        <p className={styles.dataLabel}>
          <AnimatedText value={item.label} />
        </p>
      )}
    </div>
  );
}

function DifferentiatorItem({ item }: { item: GrowthDifferentiator }) {
  const mobileSrc = item.image || item.imageDesktop;
  const desktopSrc = item.imageDesktop || item.image;
  const sameImage = mobileSrc === desktopSrc;

  if (!mobileSrc && !desktopSrc && !item.title && !item.description) return null;

  return (
    <div className={styles.diffItem}>
      {(mobileSrc || desktopSrc) && (
        <div className={styles.diffImageWrap}>
          {sameImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.diffImage} src={mobileSrc} alt="" />
          ) : (
            <>
              {mobileSrc && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className={`${styles.diffImage} ${styles.mobileOnly}`} src={mobileSrc} alt="" />
              )}
              {desktopSrc && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className={`${styles.diffImage} ${styles.desktopOnly}`} src={desktopSrc} alt="" />
              )}
            </>
          )}
        </div>
      )}
      {item.title && <p className={`${styles.diffTitle} ${rethinkSans.className}`}><AnimatedText value={item.title} /></p>}
      {item.description && (
        <p className={styles.diffDescription}>
          <AnimatedText value={item.description} />
        </p>
      )}
    </div>
  );
}

export function Growth({ title, description, dataItems = [], differentiators = [] }: GrowthProps) {
  const { ref: sectionRef, visible } = useRevealOnScroll<HTMLElement>();

  if (!title && dataItems.length === 0 && differentiators.length === 0) return null;

  return (
    <section ref={sectionRef} className={`${styles.growth} ${visible ? styles.visible : ""}`}>
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

      {dataItems.length > 0 && (
        <div className={styles.dataGrid}>
          {dataItems.map((item, i) => (
            <DataItem key={i} item={item} />
          ))}
        </div>
      )}

      {differentiators.length > 0 && (
        <div className={styles.differentiatorsGrid}>
          {differentiators.map((item, i) => (
            <DifferentiatorItem key={i} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Growth;
