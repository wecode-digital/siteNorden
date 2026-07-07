"use client";

import { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Revela (one-shot) quando o topo do elemento cruza `viewportFraction` da tela
 * (0.5 = meio). Usa `getBoundingClientRect` + scroll/resize em vez de
 * IntersectionObserver com rootMargin percentual: essa combinação só ganhou
 * suporte confiável no Safari 16.4+, e navegadores embutidos de apps
 * (Instagram, WhatsApp etc.) costumam rodar um WebKit mais antigo mesmo em
 * iOS atualizado — o observer nunca dispara e a seção fica parada.
 */
export function useRevealOnScroll<T extends HTMLElement>(viewportFraction = 0.5) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setVisible(true);
      return;
    }

    let raf = 0;
    let done = false;
    const cleanup = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
    const check = () => {
      raf = 0;
      if (done) return;
      if (el.getBoundingClientRect().top <= window.innerHeight * viewportFraction) {
        done = true;
        setVisible(true);
        cleanup();
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };

    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return cleanup;
  }, [viewportFraction]);

  return { ref, visible };
}

export default useRevealOnScroll;
