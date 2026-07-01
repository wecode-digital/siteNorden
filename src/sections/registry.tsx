import type { ComponentType } from "react";
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
};
