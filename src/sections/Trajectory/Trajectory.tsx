"use client";

import AnimatedText from "@/components/AnimatedText/AnimatedText";
import CarouselControls from "@/components/Carousel/CarouselControls";
import { useCarousel } from "@/components/Carousel/useCarousel";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import { rethinkSans } from "@/lib/fonts";
import styles from "./Trajectory.module.scss";
import type { TrajectoryItem, TrajectoryProps } from "./types";

const ITEMS_PER_PAGE_DESKTOP = 4;

/**
 * Linha do tempo: swipe livre no mobile, setas + dots no desktop (ver useCarousel).
 * A linha (com o marcador) fica sempre alinhada entre os itens; o bloco de texto
 * (ano + descrição) alterna de lado a cada item (1º abaixo, 2º acima, ...) — pedido
 * explícito do usuário, não vem do Figma. O alinhamento da linha usa CSS subgrid:
 * as 4 "fatias" do item (texto acima / linha / texto abaixo / imagem) são linhas
 * de grid compartilhadas por todos os itens, então a altura da fatia "texto acima"
 * é a mesma para todo mundo — a linha nunca se desloca por causa de um texto maior.
 */
function TrajectoryTimeline({ items }: { items: TrajectoryItem[] }) {
  const { trackRef, registerItem, page, pages, goTo } = useCarousel(items.length, ITEMS_PER_PAGE_DESKTOP);

  return (
    <div className={styles.carouselWrap}>
      <div className={styles.track} ref={trackRef}>
        {items.map((item, i) => {
          const mobileSrc = item.image || item.imageDesktop;
          const desktopSrc = item.imageDesktop || item.image;
          const sameImage = mobileSrc === desktopSrc;
          const textAbove = i % 2 === 1;

          const textBlock = (item.year || item.description) && (
            <div className={`${styles.textBlock} ${textAbove ? styles.textAbove : styles.textBelow}`}>
              {item.year && (
                <span className={`${styles.year} ${rethinkSans.className}`}>{item.year}</span>
              )}
              {item.description && (
                <p className={styles.itemDescription}>
                  <AnimatedText value={item.description} />
                </p>
              )}
            </div>
          );

          return (
            <div key={i} ref={registerItem(i)} className={styles.item}>
              {textBlock}
              <div className={styles.lineRow}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <circle cx="10.6284" cy="10.6284" r="10.6284" fill="#000050" fill-opacity="0.1" />
                  <circle cx="10.6281" cy="10.6284" r="4.5705" fill="#000050" />
                </svg>
                <span className={styles.line} />
              </div>
              {(mobileSrc || desktopSrc) && (
                sameImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className={styles.image} src={mobileSrc} alt="" />
                ) : (
                  <>
                    {mobileSrc && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className={`${styles.image} ${styles.mobileOnly}`} src={mobileSrc} alt="" />
                    )}
                    {desktopSrc && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className={`${styles.image} ${styles.desktopOnly}`} src={desktopSrc} alt="" />
                    )}
                  </>
                )
              )}
            </div>
          );
        })}
      </div>

      <CarouselControls page={page} pages={pages} onGoTo={goTo} />
    </div>
  );
}

export function Trajectory({ title, description, items = [] }: TrajectoryProps) {
  const { ref: sectionRef, visible } = useRevealOnScroll<HTMLElement>();

  if (!title && items.length === 0) return null;

  return (
    <section ref={sectionRef} className={`${styles.trajectory} ${visible ? styles.visible : ""}`}>
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

      {items.length > 0 && <TrajectoryTimeline items={items} />}
    </section>
  );
}

export default Trajectory;
