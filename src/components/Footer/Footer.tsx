"use client";

import Link from "next/link";
import AnimatedText from "@/components/AnimatedText/AnimatedText";
import { NordenLogo } from "@/components/Header/icons";
import { useLocale } from "@/i18n/LocaleProvider";
import { FooterColumns } from "./FooterColumns";
import { Marquee } from "./Marquee";
import { NewsletterForm } from "./NewsletterForm";
import styles from "./Footer.module.scss";
import type { FooterData } from "./types";

const DEFAULT_MARQUEE = {
  pt: "Pronto para evoluir?",
  en: "Ready to evolve?",
  es: "¿Listo para evolucionar?",
};

const RIGHTS = {
  pt: "Todos os direitos reservados.",
  en: "All rights reserved.",
  es: "Todos los derechos reservados.",
};

export function Footer({ data }: { data?: FooterData | null }) {
  const { t } = useLocale();
  const copyrightName = data?.copyrightName || "Norden";
  const policyLinks = data?.policyLinks ?? [];

  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <Marquee phrase={data?.marqueePhrase ?? DEFAULT_MARQUEE} />
        <NewsletterForm form={data?.form} />
      </div>

      <div className={styles.main}>
        <FooterColumns columns={data?.columns} />

        <div className={styles.bottom}>
          <span className={styles.logo}>
            <NordenLogo />
          </span>
          <hr className={styles.divider} />
          <div className={styles.legal}>
            <p className={styles.copyright}>
              ©<span suppressHydrationWarning>{new Date().getFullYear()}</span>{" "}
              {copyrightName}. {t(RIGHTS)}
            </p>
            {policyLinks.length > 0 && (
              <div className={styles.policies}>
                {policyLinks.map((policy, index) => (
                  <Link key={index} href={policy.url || "#"} className={styles.policyLink}>
                    <AnimatedText value={policy.label} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
