"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Estado + comportamento de um carrossel com scroll-snap: swipe livre (mobile)
 * e paginação por setas/dots (desktop, `perPageDesktop` itens por página).
 *
 * Página ativa = posição do scroll como fração do percurso total (0 → 1),
 * mapeada pra página mais próxima. Não dá pra usar "qual item está no início":
 * quando o total de itens não é múltiplo de `perPageDesktop`, a última página
 * não tem como deixar seu 1º item exatamente no início (o navegador trava o
 * scroll no fim do conteúdo, sobrando itens "pra trás" visíveis) — a conta por
 * item errava a última página nesse caso. Por fração do scroll, o fim sempre
 * bate com a última página, não importa quantos itens sobraram nela.
 */
export function useCarousel(itemCount: number, perPageDesktop: number) {
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(itemCount / perPageDesktop));

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const maxScroll = el.scrollWidth - el.clientWidth;
        const progress = maxScroll > 0 ? el.scrollLeft / maxScroll : 0;
        setPage(Math.round(progress * (pages - 1)));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [pages]);

  const registerItem = (index: number) => (node: HTMLElement | null) => {
    itemRefs.current[index] = node;
  };

  // Página do meio: rola até o PRIMEIRO item dela — ponto de snap real
  // (scroll-snap-align:start). Última página: vai até o fim do scroll (não dá
  // pra alinhar um item ao início sem sobrar espaço vazio depois dele).
  const goTo = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    if (index >= pages - 1) {
      el.scrollTo({ left: el.scrollWidth - el.clientWidth, behavior: "smooth" });
      return;
    }
    itemRefs.current[index * perPageDesktop]?.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });
  };

  return { trackRef, registerItem, page, pages, goTo };
}

export default useCarousel;
