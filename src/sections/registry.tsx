import type { ComponentType } from "react";
import Clients from "./Clients/Clients";
import Ecosystem from "./Ecosystem/Ecosystem";
import Methodology from "./Methodology/Methodology";
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
  // "ClientsList" = section de EXIBIÇÃO (posiciona o grid); os dados ficam no
  // content-type "clients" (section "Clients"), injetados no SSR.
  ClientsList: Clients,
};
