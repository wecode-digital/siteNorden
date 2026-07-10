import type { Metadata } from "next";
import {
  GoogleTagManagerNoScript,
  GoogleTagManagerScript,
} from "@/components/GoogleTagManager/GoogleTagManager";
import { inter } from "@/lib/fonts";
import { organizationJsonLd, SITE_URL } from "@/lib/seo";
import "./globals.scss";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Norden",
    template: "%s | Norden",
  },
  description: "Norden",
  icons: {
    // SVG pros navegadores (mais nítido na aba); PNG à parte porque o Google
    // não lê favicon em SVG no resultado de busca — precisa de um raster.
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-192.png", type: "image/png", sizes: "192x192" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // O `lang` aqui é só o valor inicial (SSR) — o `[locale]/layout.tsx`
  // (dentro de `children`) não pode renderizar sua própria <html>, então
  // quem corrige esse atributo pro idioma real é o LocaleProvider no
  // cliente. Aceitável para esta fase de validação de rotas; ajuste fino de
  // `lang` sem esperar hidratação fica pro trabalho de SEO por idioma.
  return (
    <html lang="pt-BR">
      <head>
        <GoogleTagManagerScript />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        {/* Desliga a restauração automática de scroll do navegador (reload/voltar
            "lembra" a posição por padrão) e força o topo em todo carregamento. */}
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; } window.scrollTo(0, 0);`,
          }}
        />
      </head>
      {/* Inter aplicada diretamente no body; os filhos herdam. */}
      <body className={inter.className}>
        <GoogleTagManagerNoScript />
        {children}
      </body>
    </html>
  );
}
