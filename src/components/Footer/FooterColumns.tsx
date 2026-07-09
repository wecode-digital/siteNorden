"use client";

import Link from "next/link";
import AnimatedText from "@/components/AnimatedText/AnimatedText";
import { useLocale } from "@/i18n/LocaleProvider";
import { localizedHref } from "@/i18n/routing";
import { draftToHtml } from "@/lib/draftToHtml";
import styles from "./Footer.module.scss";
import type { FooterColumn } from "./types";

/**
 * Renderiza as colunas polimórficas do footer. Cada coluna, conforme `type`:
 * - social: lista de ícones de rede social (ícone + link)
 * - links: lista de links (rótulo trilíngue + URL)
 * - richtext: texto em markdown (trilíngue)
 */
export function FooterColumns({ columns }: { columns?: FooterColumn[] }) {
  const { t, locale } = useLocale();
  if (!columns?.length) return null;

  return (
    <div className={styles.columns}>
      {columns.map((column, index) => {
        if (!column.active) return null

        return(
        <section key={index} className={styles.column}>
          {column.title && (
            <AnimatedText as="h3" className={styles.columnTitle} value={column.title} />
          )}

          {column.type === "social" && (
            <div className={styles.social}>
              {column.socialItems?.map((item, i) => {
                if (!item.icon || !item.url) return null;
                return (
                  <a
                    key={i}
                    href={item.url}
                    className={styles.socialLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {/* Ícone é uma imagem cadastrada no CMS (media-gallery). */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.icon} alt="" width={24} height={24} loading="lazy" />
                  </a>
                );
              })}
            </div>
          )}

          {column.type === "links" && (
            <ul className={styles.linkList}>
              {column.links?.map((item, i) => (
                <li key={i}>
                  <Link href={localizedHref(item.url || "#", locale)} className={styles.link}>
                    <AnimatedText value={item.label} />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {column.type === "richtext" && (
            // O widget draftjs-rich-text salva ContentState "raw" do draft-js;
            // convertemos para HTML (texto escapado, tags/links sanitizados).
            <div
              className={styles.richtext}
              dangerouslySetInnerHTML={{ __html: draftToHtml(t(column.body)) }}
            />
          )}

          {column.type === "email" && column.email && (
            <a href={`mailto:${column.email}`} className={styles.link}>
              {column.email}
            </a>
          )}

          {column.type === "phone" && column.phone && (
            <a href={`tel:${column.phone.replace(/[^\d+]/g, "")}`} className={styles.link}>
              {column.phone}
            </a>
          )}
        </section>
      )})}
    </div>
  );
}
