"use client";

import styles from "./CarouselControls.module.scss";

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      {direction === "left" ? (
        <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

interface CarouselControlsProps {
  page: number;
  pages: number;
  onGoTo: (index: number) => void;
}

/** Setas + dots do carrossel (só desktop — ver CarouselControls.module.scss). */
export function CarouselControls({ page, pages, onGoTo }: CarouselControlsProps) {
  if (pages <= 1) return null;

  return (
    <div className={styles.controls}>
      <button
        type="button"
        className={styles.arrow}
        aria-label="Anterior"
        disabled={page <= 0}
        onClick={() => onGoTo(Math.max(0, page - 1))}
      >
        <ArrowIcon direction="left" />
      </button>
      <div className={styles.dots}>
        {Array.from({ length: pages }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Página ${i + 1}`}
            className={`${styles.dot} ${i === page ? styles.dotActive : ""}`}
            onClick={() => onGoTo(i)}
          />
        ))}
      </div>
      <button
        type="button"
        className={styles.arrow}
        aria-label="Próximo"
        disabled={page >= pages - 1}
        onClick={() => onGoTo(Math.min(pages - 1, page + 1))}
      >
        <ArrowIcon direction="right" />
      </button>
    </div>
  );
}

export default CarouselControls;
