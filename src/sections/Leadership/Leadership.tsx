"use client";

import AnimatedText from "@/components/AnimatedText/AnimatedText";
import CarouselControls from "@/components/Carousel/CarouselControls";
import { useCarousel } from "@/components/Carousel/useCarousel";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import { rethinkSans } from "@/lib/fonts";
import styles from "./Leadership.module.scss";
import type { LeadershipPerson, LeadershipProps } from "./types";

const PEOPLE_PER_PAGE_DESKTOP = 5;
// Acima disso a linha estática vira slider (layout padrão de carrossel do site).
const SLIDER_THRESHOLD = 5;

function PersonCard({
  person,
  cardRef,
}: {
  person: LeadershipPerson;
  cardRef?: (node: HTMLElement | null) => void;
}) {
  const mobileSrc = person.photo || person.photoDesktop;
  const desktopSrc = person.photoDesktop || person.photo;
  const samePhoto = mobileSrc === desktopSrc;

  return (
    <div ref={cardRef} className={styles.card}>
      {(mobileSrc || desktopSrc) && (
        <div className={styles.photoWrap}>
          {samePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.photo} src={mobileSrc} alt="" />
          ) : (
            <>
              {mobileSrc && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className={`${styles.photo} ${styles.mobileOnly}`} src={mobileSrc} alt="" />
              )}
              {desktopSrc && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className={`${styles.photo} ${styles.desktopOnly}`} src={desktopSrc} alt="" />
              )}
            </>
          )}
        </div>
      )}
      <div className={styles.info}>
        {person.name && <p className={`${styles.name} ${rethinkSans.className}`}>{person.name}</p>}
        {person.description && (
          <p className={styles.role}>
            <AnimatedText value={person.description} />
          </p>
        )}
        {person.linkedin && (
          <a href={person.linkedin} target="_blank" rel="noopener noreferrer" className={styles.linkedin}>
            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
              <path d="M17.291 17.2911H14.284V12.5821C14.284 11.4591 14.264 10.0141 12.72 10.0141C11.154 10.0141 10.914 11.2371 10.914 12.5011V17.2911H7.908V7.60714H10.795V8.93014H10.835C11.424 7.92414 12.518 7.32314 13.683 7.36614C16.731 7.36614 17.292 9.37114 17.292 11.9781L17.291 17.2911ZM4.515 6.28314C3.551 6.28314 2.77 5.50214 2.77 4.53814C2.77 3.57414 3.551 2.79314 4.515 2.79314C5.479 2.79314 6.26 3.57414 6.26 4.53814C6.26 5.50214 5.479 6.28314 4.515 6.28314ZM6.018 17.2911H3.008V7.60714H6.018V17.2911ZM18.79 0.00113659H1.497C0.68 -0.00786341 0.01 0.647137 0 1.46414V18.8281C0.01 19.6461 0.68 20.3011 1.497 20.2921H18.79C19.609 20.3021 20.282 19.6471 20.293 18.8281V1.46314C20.281 0.644136 19.608 -0.0108635 18.79 0.000136545" fill="#000050" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

/** ≤5 pessoas: linha estática (sem scroll). Acima disso: carrossel padrão do site. */
function LeadershipGrid({ people }: { people: LeadershipPerson[] }) {
  const isSlider = people.length > SLIDER_THRESHOLD;
  const { trackRef, registerItem, page, pages, goTo } = useCarousel(
    isSlider ? people.length : 0,
    PEOPLE_PER_PAGE_DESKTOP
  );

  if (!isSlider) {
    return (
      <div className={styles.row}>
        {people.map((person, i) => (
          <PersonCard key={i} person={person} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.carouselWrap}>
      <div className={styles.track} ref={trackRef}>
        {people.map((person, i) => (
          <PersonCard key={i} person={person} cardRef={registerItem(i)} />
        ))}
      </div>
      <CarouselControls page={page} pages={pages} onGoTo={goTo} />
    </div>
  );
}

export function Leadership({ title, description, people = [] }: LeadershipProps) {
  const { ref: sectionRef, visible } = useRevealOnScroll<HTMLElement>();

  if (!title && people.length === 0) return null;

  return (
    <section ref={sectionRef} className={`${styles.leadership} ${visible ? styles.visible : ""}`}>
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

      {people.length > 0 && <LeadershipGrid people={people} />}
    </section>
  );
}

export default Leadership;
