import { Inter, Rethink_Sans } from "next/font/google";

/**
 * Fontes do site (Google Fonts, self-hosted via next/font).
 * Aplicadas **diretamente nos elementos** com `.className` (ex.: `inter.className`),
 * não por variável CSS herdada.
 */
export const inter = Inter({ subsets: ["latin"], display: "swap" });

export const rethinkSans = Rethink_Sans({ subsets: ["latin"], display: "swap" });
