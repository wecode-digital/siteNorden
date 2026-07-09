"use client";

import Link from "next/link";
import AnimatedText from "@/components/AnimatedText/AnimatedText";
import { useLocale } from "@/i18n/LocaleProvider";
import { localizedHref } from "@/i18n/routing";
import type { LocalizedText } from "@/i18n/text";
import { draftToHtml } from "@/lib/draftToHtml";
import styles from "./CaseDetail.module.scss";
import type { CaseDetailProps } from "./types";

const CASES_LABEL: LocalizedText = { pt: "Cases", en: "Cases", es: "Casos" };

/** True se o texto localizado tem ao menos um idioma preenchido. */
function hasText(value?: LocalizedText): boolean {
  return Boolean(value && Object.values(value).some((v) => typeof v === "string" && v.trim()));
}

/** Mídia do depoimento (imagem, arquivo de vídeo ou embed vimeo/youtube). */
function TestimonialMedia({ src }: { src: string }) {
  if (/\.(mp4|webm|ogg)(\?|#|$)/i.test(src)) {
    return <video className={styles.testimonialMedia} src={src} controls playsInline />;
  }
  if (/(?:player\.)?vimeo\.com|youtube\.com|youtu\.be/i.test(src)) {
    return (
      <iframe
        className={styles.testimonialMedia}
        src={src}
        title="Depoimento"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={styles.testimonialMedia} src={src} alt="" />;
}

/**
 * Bloco de texto rico (Desafio / Solução / Resultados). O título da seção é a
 * 1ª linha em negrito do próprio texto rico (assim é cadastrado no CMS e como
 * o design monta), estilizada via `.richText` — não há heading separado.
 */
function RichBlock({ value }: { value?: LocalizedText }) {
  const { t } = useLocale();
  const html = draftToHtml(t(value));
  if (!html) return null;
  return (
    <section
      key={t(value)}
      className={styles.block}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function CaseDetail({ content }: CaseDetailProps) {
  const { t, locale } = useLocale();
  const { client, title, summary, tags, gallery = [], testimonial } = content;

  return (
    <article className={styles.case}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="breadcrumb">
        <Link href={localizedHref("/cases", locale)} className={styles.crumbLink}>
          <AnimatedText value={CASES_LABEL} />
        </Link>
        <span className={styles.crumbSep}>/</span>
        <span className={styles.crumbCurrent}>{client || t(title)}</span>
      </nav>

      {/* Cabeçalho */}
      <header className={styles.header}>
        {hasText(title) && (
          <h1 className={styles.title}>
            <AnimatedText value={title} />
          </h1>
        )}
        {hasText(summary) && (
          <p className={styles.summary}>
            <AnimatedText value={summary} />
          </p>
        )}
        {tags && tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((tag, i) => (
              <span key={i} className={styles.tag}>
                <AnimatedText value={tag.label} />
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Galeria */}
      {gallery.length > 0 && (
        <div className={styles.gallery}>
          {gallery.map((g, i) =>
            g.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={g.image} alt={t(g.alt)} className={styles.galleryImage} />
            ) : null
          )}
        </div>
      )}

      <RichBlock value={content.challenge} />
      <RichBlock value={content.solution} />

      {/* Depoimento (só mídia — imagem ou vídeo, sem texto sobreposto) */}
      {testimonial?.image && (
        <figure className={styles.testimonial}>
          <div className={styles.testimonialImage}>
            <TestimonialMedia src={testimonial.image} />
          </div>
        </figure>
      )}

      <RichBlock value={content.results} />
    </article>
  );
}

export default CaseDetail;
