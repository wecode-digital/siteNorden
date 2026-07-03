"use client";

import Link from "next/link";
import { useEffect } from "react";
import AnimatedText from "@/components/AnimatedText/AnimatedText";
import { rethinkSans } from "@/lib/fonts";
import { LanguageSelector } from "./LanguageSelector";
import styles from "./MobileMenu.module.scss";
import { CloseIcon, NordenLogo } from "./icons";
import { resolveContactUrl, type HeaderData } from "./types";

const DEFAULT_MENU_CONTACT = {
  pt: "Entre em contato",
  en: "Get in touch",
  es: "Contáctanos",
};

/**
 * Menu mobile (drawer full-screen). Abre a partir do hambúrguer do header.
 * Links vêm do CMS (data.menuItems); textos traduzíveis via AnimatedText.
 * O seletor de idioma reusa a mesma lógica do header, mas na horizontal.
 */
export function MobileMenu({
  open,
  data,
  onClose,
}: {
  open: boolean;
  data?: HeaderData | null;
  onClose: () => void;
}) {
  // Trava o scroll do body enquanto aberto.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Fecha ao pressionar ESC.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const menuItems = data?.showMenuItems ? data?.menuItems ?? [] : [];

  return (
    <div
      className={`${styles.overlay} ${open ? styles.open : ""}`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
    >
      <div className={styles.top}>
        <span className={styles.logo}>
          <NordenLogo />
        </span>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Fechar menu"
        >
          <CloseIcon />
        </button>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.url || "#"}
            className={`${styles.link} ${rethinkSans.className}`}
            onClick={onClose}
          >
            <AnimatedText value={item.label} />
          </Link>
        ))}

        <LanguageSelector orientation="horizontal" className={styles.drawerLang} />

        <Link
          href={resolveContactUrl(data?.contactUrl)}
          className={styles.contact}
          onClick={onClose}
        >
          <AnimatedText value={data?.menuContactLabel ?? DEFAULT_MENU_CONTACT} />
        </Link>
      </nav>
    </div>
  );
}

export default MobileMenu;
