import type { ComponentType } from "react";
import Atuacao from "./Atuacao/Atuacao";
import CasesShowcase from "./Cases/CasesShowcase";
import Certifications from "./Certifications/Certifications";
import Clients from "./Clients/Clients";
import Ecosystem from "./Ecosystem/Ecosystem";
import Methodology from "./Methodology/Methodology";
import Solutions from "./Solutions/Solutions";
import VideoHero from "./VideoHero/VideoHero";

/**
 * Registry de sections: mapeia o `name` de cada section vinda do Headless CMS
 * para o componente React que a renderiza.
 *
 * A chave DEVE ser idêntica ao `section.name` retornado pelo CMS e ao `"name"`
 * declarado em cms/faststore/sections.json.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sectionRegistry: Record<string, ComponentType<any>> = {
  VideoHero,
  Ecosystem,
  Methodology,
  Solutions,
  Atuacao,
  Certifications,
  // Exibição de cases (recebe a lista resolvida por id, injetada no SSR).
  CasesShowcase,
  // "ClientsList" = section de EXIBIÇÃO (posiciona o grid); os dados ficam no
  // content-type "clients" (section "Clients"), injetados no SSR.
  ClientsList: Clients,
};
