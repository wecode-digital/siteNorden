# siteNorden

Site **institucional** da Norden em **Next.js (App Router)**, com conteúdo gerenciado no **VTEX Headless CMS**.

> Este projeto **não é** um storefront VTEX FastStore. Usamos o ambiente Headless CMS da VTEX apenas como **fonte de conteúdo** (leitura via `@vtex/client-cms`) e o CLI da VTEX para **enviar os schemas** das sections.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript 5**
- **SCSS Modules** (tokens de marca em `src/themes/norden-theme.scss`)
- **`@vtex/client-cms`** — leitura do Headless CMS
- **ISR on-demand** — revalidação via webhook do CMS
- Deploy: **Vercel**

## Conta / projeto CMS (por ora)

- Conta VTEX (tenant): **`norden`** · workspace **`master`** · projeto CMS (builder): **`faststore`**
- Tudo parametrizado por env (ver `.env.example`) — trocar de conta = editar o `.env`.

## Estrutura

```
next.config.mjs · tsconfig.json · package.json
.env.example                     # variáveis: VTEX_TENANT / VTEX_WORKSPACE / VTEX_CMS_BUILDER / CMS_REVALIDATE_SECRET
cms/faststore/
  sections.json                  # schema das sections (enviado com `yarn cms:sync`)
  content-types.json
src/
  app/
    layout.tsx · page.tsx        # Home (Server Component) puxa o content type `home`
    globals.scss                 # reset + tokens do tema
    api/revalidate/route.ts      # webhook de revalidação on-demand (ISR)
  lib/cms.ts                     # ClientCMS env-driven + helpers (getHomeSections, getContentBySlug, ...)
  sections/
    registry.tsx                 # mapa: section.name (CMS) -> componente React
    SectionsRenderer.tsx         # renderiza as sections de um documento
    VideoHero/                   # 1ª section
  themes/norden-theme.scss
```

## Desenvolvimento

```bash
yarn install
cp .env.example .env.local       # ajustar valores se necessário
yarn dev                         # http://localhost:3000
```

A leitura do CMS é pública (só conteúdo publicado), então **não é preciso `vtex login` para rodar o site**. Login só é necessário para **enviar schema** (`yarn cms:sync`).

## Como o conteúdo é puxado

`src/lib/cms.ts` instancia o `ClientCMS` com `tenant/workspace/builder` (env) e busca:
`GET https://{workspace}--{tenant}.myvtex.com/_v/cms/api/{builder}/{contentType}`.
Cada documento traz `sections: [{ name, data }]`; o `SectionsRenderer` mapeia `name` → componente e passa `data` como props.

## Adicionar / atualizar uma section

1. Componente em `src/sections/<Nome>/`.
2. Registrar em `src/sections/registry.tsx` (chave == `name`).
3. Declarar o schema em `cms/faststore/sections.json` (prefixo `[Norden]`, sem campos obrigatórios).
4. Enviar o schema para o CMS: `yarn cms:sync` (→ `vtex cms sync faststore`). **Requer `vtex login <conta>`** e sincroniza com o workspace em uso — use um workspace de dev antes de mexer em produção.
5. No Admin VTEX (**Storefront → Content**), adicionar a section à página e publicar.

## Revalidação (ISR on-demand)

Configurar o webhook de releases do CMS para chamar:
`POST https://<dominio>/api/revalidate?secret=<CMS_REVALIDATE_SECRET>`
Ao publicar, a Home é regenerada. Para outras páginas: `?path=/rota`.
