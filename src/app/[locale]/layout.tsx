import { notFound } from "next/navigation";
import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import { isLocale, LOCALES } from "@/i18n/config";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { getFooterData, getHeaderData } from "@/lib/cms";

/** Pré-renderiza as 3 variantes de idioma — combinado automaticamente pelo
 * Next com o `generateStaticParams` de cada rota filha (locale × slug). */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [header, footer] = await Promise.all([getHeaderData(), getFooterData()]);

  return (
    <LocaleProvider initialLocale={locale}>
      <Header data={header} />
      {children}
      <Footer data={footer} />
    </LocaleProvider>
  );
}
