"use client";

import Link from "next/link";
import AnimatedText from "@/components/AnimatedText/AnimatedText";
import styles from "./CasesShowcase.module.scss";
import type { CaseSummary, CasesShowcaseProps } from "./types";

const DEFAULT_MORE = { pt: "Ver mais cases", en: "See more cases", es: "Ver más casos" };

function Card({ item }: { item: CaseSummary }) {
  return (
    <>
      <div className={styles.cardBody}>
        {item.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.logo} alt="" className={styles.cardLogo} />
        )}
        <h3 className={styles.cardTitle}>
          <AnimatedText value={item.title} />
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
  if (cases.length === 0 && !title) return null;

  return (
    <section className={styles.cases}>
      {title && (
        <h2 className={styles.title}>
          <AnimatedText value={title} />
        </h2>
      )}

      <div className={styles.grid}>
        {cases.map((item, i) =>
          item.url ? (
            <Link key={i} href={item.url} className={styles.card}>
              <Card item={item} />
            </Link>
          ) : (
            <div key={i} className={styles.card}>
              <Card item={item} />
            </div>
          )
        )}
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
