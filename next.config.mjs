import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fixa a raiz do projeto (há um lockfile solto no home do usuário que o Next
  // detectaria como raiz por engano).
  turbopack: {
    root: __dirname,
  },
  images: {
    // Imagens/posters cadastrados no VTEX (media gallery do CMS) vêm de *.vtexassets.com.
    remotePatterns: [
      { protocol: "https", hostname: "**.vtexassets.com" },
    ],
  },
};

export default nextConfig;
