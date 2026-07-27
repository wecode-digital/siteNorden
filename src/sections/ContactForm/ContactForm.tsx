"use client";

import { Marquee } from "@/components/Footer/Marquee";
import { NewsletterForm } from "@/components/Footer/NewsletterForm";
import styles from "./ContactForm.module.scss";
import type { ContactFormProps } from "./types";

const DEFAULT_MARQUEE = {
  pt: "Pronto para evoluir?",
  en: "Ready to evolve?",
  es: "¿Listo para evolucionar?",
};

/**
 * Marquee + formulário de contato, igual ao bloco de topo do Footer — para
 * uso em páginas que precisam do form sem o restante do rodapé (colunas,
 * copyright). Reaproveita os mesmos componentes do Footer.
 *
 * Como o Footer é global (layout.tsx), evite adicionar esta section em
 * páginas que já exibem o Footer padrão — geraria formulário/marquee
 * duplicados e dois elementos com id="contato" na mesma página.
 */
export function ContactForm({ marqueePhrase, form }: ContactFormProps) {
  return (
    <section className={styles.contactForm}>
      <Marquee phrase={marqueePhrase ?? DEFAULT_MARQUEE} />
      <NewsletterForm form={form} />
    </section>
  );
}

export default ContactForm;
