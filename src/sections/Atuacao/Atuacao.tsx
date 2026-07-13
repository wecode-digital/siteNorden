"use client";

import AnimatedText from "@/components/AnimatedText/AnimatedText";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import { useLocale } from "@/i18n/LocaleProvider";
import { rethinkSans } from "@/lib/fonts";
import styles from "./Atuacao.module.scss";
import type { AtuacaoProps } from "./types";

export function Atuacao({ title, description, image, imageDesktop }: AtuacaoProps) {
  const { t } = useLocale();
  const { ref: sectionRef, visible } = useRevealOnScroll<HTMLElement>();

  const mobileSrc = t(image) || t(imageDesktop);
  const desktopSrc = t(imageDesktop) || t(image);
  const sameImage = mobileSrc === desktopSrc;

  if (!title && !description && !mobileSrc && !desktopSrc) return null;

  return (
    <section ref={sectionRef} className={`${styles.atuacao} ${visible ? styles.visible : ""}`}>
      {(title || description) && (
        <div className={styles.text}>
          {title && (
            <AnimatedText as="h2" className={`${styles.title} ${rethinkSans.className}`} value={title} />
          )}
          {description && (
            <p className={styles.description}>
              <AnimatedText value={description} />
            </p>
          )}
        </div>
      )}

      {(mobileSrc || desktopSrc) && (
        <div className={styles.imageWrap}>
          {sameImage ? (
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
          )}
        </div>
      )}
    </section>
  );
}

export default Atuacao;
