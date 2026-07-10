"use client";

import AnimatedText from "@/components/AnimatedText/AnimatedText";
import { useLocale } from "@/i18n/LocaleProvider";
import type { LocalizedText } from "@/i18n/text";
import { draftToHtml } from "@/lib/draftToHtml";
import styles from "./PrivacyPolicy.module.scss";
import type { PrivacyPolicyProps } from "./types";

/** True se o texto localizado tem ao menos um idioma preenchido. */
function hasText(value?: LocalizedText): boolean {
  return Boolean(value && Object.values(value).some((v) => typeof v === "string" && v.trim()));
}

/** Bloco de texto rico (draftjs) da política. */
function RichBlock({ value }: { value?: LocalizedText }) {
  const { t } = useLocale();
  const html = draftToHtml(t(value));
  if (!html) return null;
  return <div className={styles.block} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function PrivacyPolicy({ content }: PrivacyPolicyProps) {
  const { title, description } = content;

  return (
    <article className={styles.page}>
      <header className={styles.header}>
        {hasText(title) && (
          <h1 className={styles.title}>
            <AnimatedText value={title} />
          </h1>
        )}
      </header>

      <RichBlock value={description} />
    </article>
  );
}

export default PrivacyPolicy;
