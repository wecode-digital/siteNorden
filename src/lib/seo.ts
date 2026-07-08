import type { Metadata } from "next";

/**
 * Configuração central de SEO. Dados da empresa (razão social, endereço,
 * telefone, redes sociais) ficam hardcoded aqui — ainda não cadastrados no
 * CMS. Preencher os campos marcados com TODO assim que os dados existirem;
 * campos vazios são omitidos automaticamente do JSON-LD (ver `organizationJsonLd`).
 */
export const SITE_URL = "https://norden.ec";
export const SITE_NAME = "Norden";

export const ORGANIZATION = {
  name: "Norden",
  legalName: "Norden",
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.svg`,
  email: "ola@norden.ec",
  telephone: "+555422220235",
  address: {
    streetAddress: "Rua Olavo Bilac, 503 - Sala 4 - Rio Branco",
    addressLocality: "Caxias do Sul",
    addressRegion: "RS",
    postalCode: "95010-080",
    addressCountry: "BR",
  } as
    | {
        streetAddress?: string;
        addressLocality?: string;
        addressRegion?: string;
        addressCountry?: string;
        postalCode?: string;
      }
    | undefined,
  sameAs: ["https://www.instagram.com/ec.norden/","https://www.linkedin.com/company/nordenec/posts/?feedView=all" , "https://www.facebook.com/Norden.ec"] as string[],
};

interface PageMetaInput {
  title?: string;
  description?: string;
  /** Caminho público da página (ex.: "/", "/cases/luz-da-lua"), usado se `canonical` não vier do CMS. */
  path: string;
  /** URL canônica explícita (campo `settings.seo.canonical` do CMS), sobrepõe `path`. */
  canonical?: string;
  image?: string;
}

/** Monta um `Metadata` padronizado (title/description/canonical/OpenGraph/Twitter). */
export function buildMetadata({ title, description, path, canonical, image }: PageMetaInput): Metadata {
  const url = canonical || `${SITE_URL}${path}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

/** JSON-LD Organization — inclui só os campos de `ORGANIZATION` já preenchidos. */
export function organizationJsonLd(): Record<string, unknown> {
  const org: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORGANIZATION.name,
    url: ORGANIZATION.url,
  };

  if (ORGANIZATION.legalName) org.legalName = ORGANIZATION.legalName;
  if (ORGANIZATION.logo) org.logo = ORGANIZATION.logo;
  if (ORGANIZATION.email) org.email = ORGANIZATION.email;
  if (ORGANIZATION.telephone) org.telephone = ORGANIZATION.telephone;
  if (ORGANIZATION.sameAs.length > 0) org.sameAs = ORGANIZATION.sameAs;
  if (ORGANIZATION.address && Object.values(ORGANIZATION.address).some(Boolean)) {
    org.address = { "@type": "PostalAddress", ...ORGANIZATION.address };
  }

  return org;
}
