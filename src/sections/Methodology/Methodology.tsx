"use client";

import { useEffect, useRef, useState } from "react";
import AnimatedText from "@/components/AnimatedText/AnimatedText";
import { useLocale } from "@/i18n/LocaleProvider";
import { draftToHtml } from "@/lib/draftToHtml";
import styles from "./Methodology.module.scss";
import type { MethodologyProps } from "./types";

export function Methodology({ quote, listTitle, items = [] }: MethodologyProps) {
  const { t } = useLocale();
  const [active, setActive] = useState(0);
  // "engaged" = a lista está sendo percorrida pelo scroll (dentro da zona de foco).
  const [engaged, setEngaged] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (items.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const compute = () => {
      raf = 0;
      const focus = window.innerHeight * 0.4;

      const listEl = listRef.current;
      if (listEl) {
        const rect = listEl.getBoundingClientRect();
        setEngaged(rect.top <= focus && rect.bottom >= focus);
      }

      let best = 0;
      let bestDist = Infinity;
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top + rect.height / 2 - focus);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      setActive(best);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items.length]);

  const quoteHtml = draftToHtml(t(quote));

  return (
    <section className={styles.methodology}>
      {quoteHtml && (
        <div className={styles.quoteBlock}>
          <div className={styles.quote} dangerouslySetInnerHTML={{ __html: quoteHtml }} />
        </div>
      )}

      {(listTitle || items.length > 0) && (
        <div className={styles.listBlock}>
          {listTitle && (
            <h2 className={`${styles.listTitle} ${engaged ? styles.listTitleEngaged : ""}`}>
              <AnimatedText value={listTitle} />
            </h2>
          )}
          <ul className={styles.list} ref={listRef}>
            {items.map((item, i) => (
              <li key={i} className={styles.listItem}>
                <span
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  className={`${styles.item} ${engaged && i === active ? styles.itemActive : ""}`}
                >
                  <AnimatedText value={item.label} />
                </span>
                <span className={styles.divider} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default Methodology;
