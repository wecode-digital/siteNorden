"use client";

import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import { rethinkSans } from "@/lib/fonts";
import styles from "./CareersHero.module.scss";
import type { CareersHeroImage, CareersHeroProps } from "../Careers/types";

/** Renderiza a foto com variação mobile/desktop (mesmo padrão de Atuacao/Trajectory/Growth). */
function MosaicPhoto({ photo, className }: { photo?: CareersHeroImage; className: string }) {
  const mobileSrc = photo?.image || photo?.imageDesktop;
  const desktopSrc = photo?.imageDesktop || photo?.image;
  if (!mobileSrc && !desktopSrc) return null;

  if (mobileSrc === desktopSrc) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={className} src={mobileSrc} alt="" />;
  }

  return (
    <>
      {mobileSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={`${className} ${styles.mobileOnly}`} src={mobileSrc} alt="" />
      )}
      {desktopSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={`${className} ${styles.desktopOnly}`} src={desktopSrc} alt="" />
      )}
    </>
  );
}

export function CareersHero({ title, description, images = [] }: CareersHeroProps) {
  const { ref: sectionRef, visible } = useRevealOnScroll<HTMLElement>();

  if (!title && !description && images.length === 0) return null;

  const [top, bottomLeft, bottomRight] = images;
  const hasPhotos = Boolean(
    top?.image || top?.imageDesktop || bottomLeft?.image || bottomLeft?.imageDesktop || bottomRight?.image || bottomRight?.imageDesktop
  );

  return (
    <section ref={sectionRef} className={`${styles.hero} ${visible ? styles.visible : ""}`}>
      <div className={styles.head}>
        {title && <h1 className={`${styles.title} ${rethinkSans.className}`}>{title}</h1>}
        {description && <p className={styles.description}>{description}</p>}
      </div>

      {hasPhotos && (
        <div className={styles.mosaic}>
          <MosaicPhoto photo={top} className={styles.top} />
          {(bottomLeft?.image || bottomLeft?.imageDesktop || bottomRight?.image || bottomRight?.imageDesktop) && (
            <div className={styles.bottomRow}>
              <MosaicPhoto photo={bottomLeft} className={styles.bottomLeft} />
              <MosaicPhoto photo={bottomRight} className={styles.bottomRight} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default CareersHero;
