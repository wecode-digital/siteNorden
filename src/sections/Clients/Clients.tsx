"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { rethinkSans } from "@/lib/fonts";
import styles from "./Clients.module.scss";
import type { ClientsProps } from "./types";

const FADE_MS = 600;
const CYCLE_MS = 2200;
const SLOTS_PER_TICK = 1;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Slot = { index: number; visible: boolean };

/**
 * Vitrine de logos de clientes. Mostra `count` logos (mobile/desktop) de uma
 * coleção maior e vai **alternando os logos com fade in/out** (ref.: hikecc.com.br).
 * Título, logos e config vêm da section global "Clients" (injetada no SSR).
 */
export function Clients({ config, showMore = true }: ClientsProps) {
  const { t } = useLocale();
  const pool = (config?.logos ?? []).filter((c) => c?.logo);
  const n = pool.length;

  // `showMore` só controla a exibição do botão — a contagem (mobile/desktop) sempre se aplica.
  const initialCount = config?.countDesktop ?? 18;
  const [count, setCount] = useState(initialCount);
  const [slots, setSlots] = useState<Slot[]>(() =>
    Array.from({ length: Math.min(initialCount, n) }, (_, i) => ({
      index: i % (n || 1),
      visible: true,
    }))
  );
  const pointerRef = useRef(Math.min(initialCount, n) % (n || 1));

  // Quantidade de logos conforme o breakpoint.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 769px)");
    const apply = () =>
      setCount(mq.matches ? config?.countDesktop ?? 18 : config?.countMobile ?? 9);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [config?.countMobile, config?.countDesktop]);

  // (Re)inicializa os slots quando muda a contagem ou a coleção.
  useEffect(() => {
    if (n === 0) return;
    const slotCount = Math.min(count, n);
    setSlots(Array.from({ length: slotCount }, (_, i) => ({ index: i % n, visible: true })));
    pointerRef.current = slotCount % n;
  }, [count, n]);

  // Alterna os logos com fade (só se houver mais logos do que slots).
  useEffect(() => {
    if (n <= count) return;
    if (prefersReducedMotion()) return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const tick = () => {
      // Sorteia até SLOTS_PER_TICK posições distintas para trocar juntas.
      const available = Array.from({ length: count }, (_, i) => i);
      const chosen: number[] = [];
      while (chosen.length < Math.min(SLOTS_PER_TICK, available.length)) {
        const idx = Math.floor(Math.random() * available.length);
        chosen.push(available.splice(idx, 1)[0]);
      }

      setSlots((prev) => prev.map((s, i) => (chosen.includes(i) ? { ...s, visible: false } : s)));
      const to = setTimeout(() => {
        setSlots((cur) => {
          const shown = new Set(cur.map((s) => s.index));
          const next = [...cur];
          for (const slot of chosen) {
            let p = pointerRef.current % n;
            let tries = 0;
            while (shown.has(p) && tries < n) {
              p = (p + 1) % n;
              tries++;
            }
            shown.add(p);
            pointerRef.current = (p + 1) % n;
            next[slot] = { index: p, visible: true };
          }
          return next;
        });
      }, FADE_MS);
      timeouts.push(to);
    };

    const id = setInterval(tick, CYCLE_MS);
    return () => {
      clearInterval(id);
      timeouts.forEach(clearTimeout);
    };
  }, [n, count]);

  if (n === 0) return null;

  const title = t(config?.title);
  const moreLabel = t(config?.moreLabel) || "Ver mais";
  const moreUrl = config?.moreUrl || "/clientes";

  return (
    <section className={styles.clients}>
      {title && <h2 className={`${styles.title} ${rethinkSans.className}`}>{title}</h2>}

      <div className={styles.grid}>
        {slots.map((slot, i) => {
          const client = pool[slot.index];
          if (!client?.logo) return null;
          return (
            <div key={i} className={styles.slot}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={client.logo}
                alt={client.name || ""}
                className={styles.logo}
                style={{ opacity: slot.visible ? 1 : 0 }}
                loading="lazy"
              />
            </div>
          );
        })}
      </div>

      {showMore && (
        <div className={styles.more}>
          <Link href={moreUrl} className={styles.moreButton}>
            {moreLabel}
          </Link>
        </div>
      )}
    </section>
  );
}

export default Clients;
