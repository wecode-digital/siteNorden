"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AnimatedText from "@/components/AnimatedText/AnimatedText";
import { rethinkSans } from "@/lib/fonts";
import styles from "./Header.module.scss";
import { LanguageSelector } from "./LanguageSelector";
import { MobileMenu } from "./MobileMenu";
import { MenuIcon, NordenLogo } from "./icons";
import { resolveContactUrl, type HeaderData } from "./types";

// Fallbacks até o CMS estar preenchido.
const DEFAULT_CONTACT = { pt: "Contato", en: "Contact", es: "Contacto" };
const DEFAULT_MENU_CONTACT = {
  pt: "Entre em contato",
  en: "Contact Us",
  es: "Contáctanos",
};

/**
 * Header do site (mobile e desktop). Transparente no topo; ao rolar, transita
 * para branco. No desktop os links de menu aparecem inline e o hambúrguer some;
 * no mobile os links ficam no drawer (MobileMenu).
 */
export function Header({ data }: { data?: HeaderData | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  // Só a Home tem o hero atrás do header (estado transparente no topo).
  // Nas demais páginas o header já vem branco.
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mede a altura real do header e expõe em `--norden-header-height`, usada como
  // espaçador no topo das páginas que não são a home (o header é fixed).
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () =>
      document.documentElement.style.setProperty(
        "--norden-header-height",
        `${el.offsetHeight}px`
      );
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const contactUrl = resolveContactUrl(data?.contactUrl);
  const menuItems = data?.showMenuItems ? data?.menuItems ?? [] : [];
  const solidHeader = scrolled || !isHome;

  return (
    <>
      <header
        ref={headerRef}
        className={`${styles.header} ${solidHeader ? styles.scrolled : ""}`}
      >
        <Link href="/" className={styles.logo} aria-label="Norden — página inicial">
          <NordenLogo />
        </Link>

        {/* Links de menu inline — apenas desktop. */}
        <nav className={styles.nav}>
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.url || "#"}
              className={`${styles.navLink} ${rethinkSans.className}`}
            >
              <AnimatedText value={item.label} />
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          {/* Contato desktop (copy expandida) */}
          <Link href={contactUrl} className={styles.contactDesktop}>
            <AnimatedText value={data?.menuContactLabel ?? DEFAULT_MENU_CONTACT} />
          </Link>

          {/* Contato mobile (copy compacta) */}
          <Link href={contactUrl} className={styles.contact}>
            <AnimatedText value={data?.contactLabel ?? DEFAULT_CONTACT} />
          </Link>

          <LanguageSelector />

          <button
            type="button"
            className={styles.menu}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      <MobileMenu open={menuOpen} data={data} onClose={() => setMenuOpen(false)} />
    </>
  );
}

export default Header;
