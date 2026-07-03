# Integração — VTEX Headless CMS (site institucional Next.js)

> **Status:** Fase 1 implementada e validada (build + `yarn dev`).
> **Stack:** Next.js 16 (App Router) · React 19 · TypeScript 5 · SCSS Modules · `@vtex/client-cms`.
> **Conta VTEX:** `norden` (por ora) · **workspace:** `master` · **projeto Headless CMS (builder):** `faststore`.

---

## 1. Arquitetura

Este é um **site institucional em Next.js** — **não é** um storefront VTEX FastStore. Usamos o ambiente **Headless CMS** da VTEX apenas como **fonte de conteúdo**: editores cadastram sections no Admin, e o site as **lê** via API e renderiza com componentes React próprios.

```
Editor (Admin VTEX → Storefront → Content, projeto "faststore")
        │  preenche as sections de uma página (ex.: home)
        ▼
VTEX Headless CMS ──GET /_v/cms/api/faststore/{contentType}──►  src/lib/cms.ts (ClientCMS)
        ▲                                                              │
        │ schema das sections (cms/faststore/sections.json)            ▼
        └──────────── vtex cms sync faststore ─────────    SectionsRenderer → componentes React
```

Duas vias, **independentes**:
- **Leitura (runtime do site):** `@vtex/client-cms`, pública, só conteúdo publicado. Não exige login nem `discovery.config.js`.
- **Escrita de schema (dev):** `vtex cms sync faststore` (CLI VTEX). Exige `vtex login`. Ver §5.

## 2. Como o conteúdo é puxado (`ClientCMS`)

`src/lib/cms.ts` instancia o `ClientCMS` com `tenant`/`workspace`/`builder` vindos de env (ver `.env.example`). A URL montada é:

```
GET https://{workspace}--{tenant}.myvtex.com/_v/cms/api/{builder}/{contentType}
    ex.: https://master--norden.myvtex.com/_v/cms/api/faststore/home
```

Helpers expostos (todos com try/catch → fallback seguro, para a página nunca quebrar):
- `getHomeSections()` — sections do content type `home` (singleton) → `CmsSection[]`;
- `getContentByType(ct, {page, perPage, filters})` — 1 página de documentos → `ContentPage`;
- `getAllContent(ct, perPage?)` — todos os documentos (segue `hasNextPage`);
- `getContentBySlug(ct, slug, slugField='settings.seo.slug')` — sections de 1 documento por slug.

Cada documento traz `sections: [{ id, name, data }]`. O `SectionsRenderer` mapeia `name` → componente (via `registry.tsx`) e passa `data` como props. Sections sem componente registrado são ignoradas (aviso em dev).

## 3. Estrutura do projeto

```
next.config.mjs · tsconfig.json · package.json
.env.example                     # VTEX_TENANT / VTEX_WORKSPACE / VTEX_CMS_BUILDER / CMS_REVALIDATE_SECRET
cms/faststore/
  sections.json                  # schema das sections (enviado com `yarn cms:sync`)
  content-types.json             # ⚠️ hoje vazio ([]) — ver §5 antes de sincronizar
src/
  app/
    layout.tsx · page.tsx        # Home (Server Component) → getHomeSections()
    globals.scss                 # reset + tokens (@use themes/norden-theme)
    api/revalidate/route.ts      # webhook de revalidação on-demand (ISR)
  lib/cms.ts                     # ClientCMS env-driven + helpers
  sections/
    registry.tsx                 # name (CMS) -> componente React
    SectionsRenderer.tsx
    VideoHero/                   # 1ª section (Client Component + SCSS module)
  themes/norden-theme.scss       # tokens de marca
```

## 4. Registrar uma nova section (fluxo)

1. Criar o componente em `src/sections/<Nome>/<Nome>.tsx` (+ `.module.scss`).
2. Registrar em `src/sections/registry.tsx` com a **chave idêntica** ao `"name"`.
3. Declarar o schema em `cms/faststore/sections.json` (`"name"` em PascalCase, prefixo de título `[Norden]`, **sem campos obrigatórios** — convenção do projeto).
4. Enviar o schema para o CMS: `yarn cms:sync` (→ `vtex cms sync faststore`). Ver §5.
5. No Admin VTEX (**Storefront → Content**), adicionar a section à página e publicar.

## 5. Enviar schema — `yarn cms:sync` (⚠️ ler antes de rodar)

`vtex cms sync faststore` lê a pasta `cms/faststore/` (`sections.json` + `content-types.json`) do repo e envia para o **workspace em uso**.

**Cuidados obrigatórios:**
- **Não faz merge com o core.** Diferente do antigo `faststore cms-sync`, o comando standalone empurra **apenas** o que está na pasta. Como `content-types.json` está **vazio (`[]`)** e `sections.json` tem só `VideoHero`, rodar agora **apagaria** os content types (home, landingPage, …) e as sections starter que existem no builder `faststore` da norden — quebrando a Home publicada no editor.
- **Antes de sincronizar:** (1) popular `content-types.json` com ao menos o `home` (copiar o shape de `GET /_v/cms/api/faststore/`); (2) decidir quais sections manter; (3) **usar um workspace de dev** (`vtex use <dev-ws>`), validar no Admin e só então promover — nunca a primeira execução em `master`/produção. Não há `--dry-run` no plugin.
- `VideoHero` **já está registrada e publicada** na norden (sync anterior), então não há sync pendente até adicionar uma section nova.

## 6. Revalidação (ISR on-demand)

- A Home é gerada estaticamente (`export const revalidate = false` em `app/page.tsx`).
- Configurar o webhook de releases do CMS para chamar `POST /api/revalidate?secret=<CMS_REVALIDATE_SECRET>`. Ao publicar, a Home é regenerada. Outras páginas: `?path=/rota`.

## 7. Rodar localmente

```bash
yarn install
cp .env.example .env.local      # ajustar se necessário
yarn dev                        # http://localhost:3000  (leitura do CMS é pública, sem login)
```

## 8. Troca de conta (futuro)

Trocar de conta = editar o `.env.local` (`VTEX_TENANT` / `VTEX_WORKSPACE` / `VTEX_CMS_BUILDER`). Para enviar schema na nova conta: `vtex login <conta>` + `vtex use <ws>` + `yarn cms:sync` (respeitando §5).

## 9. Cases (content-type `case`)

Cada **case** é UM documento do content-type próprio **`case`** (não é `landingPage`). Toda a informação do case é cadastrada **uma única vez** e reaproveitada em todas as páginas.

- **Content-type `case`** (`content-types.json`): não-singleton, com `Settings → SEO`. O `slug` é o **caminho público completo** — use `/cases/<nome>` (ex.: `/cases/luz-da-lua`).
- **Section `Case`** (`sections.json`): concentra o conteúdo — card (`client`, `logo`, `title`, `summary`, `tags[]`, `image`) + corpo (`gallery[]`, `challenge`/`solution`/`results` em rich-text, `testimonial`). Não é registrada no `registry` (é dado; a página do case é montada pela rota, não pelo `SectionsRenderer`).
- **Section `CasesShowcase`** (registrada): exibe cards. `allCases` (todos) **ou** `caseSlugs[]` (por slug, ordem preservada; aceita `luz-da-lua` ou `/cases/luz-da-lua`). Usada na Home e reaproveitada como "cases similares".
- **Leitura** (`src/lib/cms.ts`): `getCase(slug)` (documento por `settings.seo.slug`), `getAllCases()` (todos os cards), `resolveCasesBySlug(slugs)`. `enrichSections` injeta `cases[]` no `CasesShowcase` no SSR.
- **Rotas:** `/cases` (`app/cases/page.tsx`, lista todos) e `/cases/[slug]` (`app/cases/[slug]/page.tsx` → `CaseDetail`). Ambas mais específicas que `[...slug]`, que ignora `/cases*` no `generateStaticParams`.
- **Cadastro (editor):** criar documento no content-type **Case**, preencher a section **Case**, definir o path em SEO como `/cases/<nome>` e publicar. Para listar na Home/`/cases`, adicionar `CasesShowcase` (por slug ou `allCases`).

> ⚠️ Antes de aparecer no site, o schema precisa ir ao CMS via `yarn cms:sync` (ver §5 — em workspace de dev primeiro) e os cases precisam ser (re)cadastrados no content-type `case`.
