import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getPrivacyPolicy } from "@/lib/cms";
import { buildMetadata } from "@/lib/seo";
import PrivacyPolicy from "@/sections/PrivacyPolicy/PrivacyPolicy";

/**
 * Página de Política de Privacidade (content-type `privacyPolicy`, singleton).
 * ISR on-demand (webhook do CMS).
 */
export const revalidate = false;

type Params = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const found = await getPrivacyPolicy();
  if (!found?.seo) return {};
  return buildMetadata({
    title: found.seo.title,
    description: found.seo.description,
    path: `/${locale}/privacy-policy`,
    canonical: found.seo.canonical,
  });
}

export default async function PrivacyPolicyPage() {
  const found = await getPrivacyPolicy();
  if (!found) notFound();

  return (
    <main style={{ paddingTop: "var(--norden-header-height)" }}>
      <PrivacyPolicy content={found.content} />
    </main>
  );
}
