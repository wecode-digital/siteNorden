import type { Metadata } from "next";
import Header from "@/components/Header/Header";
import { inter } from "@/lib/fonts";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { getHeaderData } from "@/lib/cms";
import "./globals.scss";

export const metadata: Metadata = {
  title: {
    default: "Norden",
    template: "%s | Norden",
  },
  description: "Norden",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const header = await getHeaderData();

  return (
    <html lang="pt-BR">
      {/* Inter aplicada diretamente no body; os filhos herdam. */}
      <body className={inter.className}>
        <LocaleProvider>
          <Header data={header} />
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
