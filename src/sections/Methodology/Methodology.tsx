"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AnimatedText from "@/components/AnimatedText/AnimatedText";
import { useLocale } from "@/i18n/LocaleProvider";
import { draftToHtml } from "@/lib/draftToHtml";
import styles from "./Methodology.module.scss";
import type { MethodologyProps } from "./types";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Methodology({ quote, listTitle, items = [] }: MethodologyProps) {
  const { t } = useLocale();
  const [active, setActive] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const [quoteVisible, setQuoteVisible] = useState(false);
  const [quoteAppeared, setQuoteAppeared] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const quoteBlockRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const inViewRef = useRef(false);

  // Metodologia: destaque no item do CENTRO da tela; o ÚLTIMO permanece em
  // evidência quando o usuário rola para baixo do bloco.
  useEffect(() => {
    if (items.length === 0) return;
    let raf = 0;
    const compute = () => {
      raf = 0;
      const focus = window.innerHeight * 0.5; // centro da tela

      const listEl = listRef.current;
      if (listEl) {
        const rect = listEl.getBoundingClientRect();
        // engaged assim que a lista alcança o centro — e continua ao passar dela.
        setEngaged(rect.top <= focus);
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

  // Reexecuta o desenho do underline (off → on em 2 frames, para reiniciar a transição).
  const replay = useCallback(() => {
    setQuoteVisible(false);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setQuoteVisible(true))
    );
  }, []);

  // Dispara quando ~40% do bloco da citação aparece (faixa 30-50%): a citação
  // "surge" (fade + subida, uma vez) e os sublinhados se desenham (reinicia a
  // cada nova entrada).
  useEffect(() => {
    const el = quoteBlockRef.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      inViewRef.current = true;
      setQuoteAppeared(true);
      setQuoteVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !inViewRef.current) {
          inViewRef.current = true;
          setQuoteAppeared(true);
          replay();
        } else if (!entry.isIntersecting && inViewRef.current) {
          inViewRef.current = false;
          setQuoteVisible(false);
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [replay]);

  const quoteHtml = draftToHtml(t(quote));

  // Atraso por palavra (underline desenha uma de cada vez) + reexecuta ao TROCAR
  // de idioma (o HTML muda e as palavras são recriadas).
  useEffect(() => {
    const el = quoteRef.current;
    if (!el) return;
    // Base 0.3s: o traço começa depois de a citação surgir; passo 0.22s (mais
    // curto → o desenho flui, uma palavra "puxando" a outra, sem parecer duro).
    el.querySelectorAll("u").forEach((word, i) => {
      (word as HTMLElement).style.setProperty("--u-delay", `${0.3 + i * 0.22}s`);
    });
    if (inViewRef.current && !prefersReducedMotion()) replay();
  }, [quoteHtml, replay]);

  return (
    <section className={styles.methodology}>
      {quoteHtml && (
        <div ref={quoteBlockRef} className={styles.quoteBlock}>
          <div
            ref={quoteRef}
            className={`${styles.quote} ${quoteAppeared ? styles.quoteAppeared : ""} ${
              quoteVisible ? styles.quoteVisible : ""
            }`}
            dangerouslySetInnerHTML={{ __html: quoteHtml }}
          />
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
