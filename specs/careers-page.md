# Página de Carreiras (`/carreiras`)

> **Status:** Implementado. Este documento reflete o que está construído —
> ver §7 para o histórico de decisões tomadas ao longo do caminho.
> **Figma:** mobile [node 765:268482](https://www.figma.com/design/lShet4Yhaok9o2Je562HfE/Norden?node-id=765-268482) ·
> desktop [node 766:273756](https://www.figma.com/design/lShet4Yhaok9o2Je562HfE/Norden?node-id=766-273756).

---

## 1. O que a página tem

1. **Hero** (section `CareersHero`, registrada normalmente em `registry.tsx`)
   — título ("It's all about people"), descrição e um mosaico de 3 fotos.
2. **Filtro** (dentro da section `JobsList`) — duas tabs: **"Em aberto"**
   (default, ativa) e **"Todas"**. Cada vaga tem um campo `open` (boolean) que
   alimenta esse filtro.
3. **Lista de vagas** — cada vaga é um item que **expande no lugar** (não
   navega para outra página) revelando descrição + formulário de candidatura:
   - **Mobile:** acordeão. Fechado = só título + seta (chevron) + linha
     divisória. Aberto = título + seta invertida + descrição (rich text) +
     blocos extras + formulário.
   - **Desktop:** grid de até 3 colunas. Fechado = card com título + descrição
     **sempre visíveis** + botão "Quero me candidatar". Clicar no botão troca o
     card para o estado aberto (mesmo conteúdo + formulário no lugar do botão).
   - Mais de um card pode estar aberto ao mesmo tempo (não é accordion
     exclusivo) — cada vaga controla seu próprio `expanded` independentemente.
   - Além da descrição geral, cada vaga tem um array `sections` de blocos
     extras (ex.: "Responsabilidades", "Requisitos", "Benefícios" — o texto do
     botão é livre). Cada bloco abre/fecha de forma independente dos outros e
     independente do `expanded` da vaga (dois níveis de estado: o da vaga, e
     um por bloco dentro dela).
4. **Formulário de candidatura** (dentro de cada vaga expandida) — campos:
   Nome, Empresa, E-mail, Telefone, "Anexe seu currículo aqui", botão "Enviar".

   > O campo "Empresa" reaproveita o mesmo formulário usado no rodapé do site
   > (Nome/Empresa/E-mail/Telefone) — mantido como está; se algum dia fizer
   > mais sentido trocar por outra coisa (LinkedIn, portfólio etc.), é só
   > ajustar o formulário em `JobsList.tsx` e o Master Data correspondente.

## 2. Modelo de conteúdo (Headless CMS)

**Não há content-type próprio para vaga.** Como não existe rota por vaga (o
Figma mostra tudo expandindo na mesma página `/carreiras`), um content-type
separado — com SEO/slug próprio por documento, mais pesado de cadastrar/
publicar por vaga — seria complexidade sem benefício real. As vagas são
cadastradas como um **array direto na própria section `JobsList`**, do mesmo
jeito que `Solutions.categories`, `Growth.dataItems` etc.

### `cms/faststore/sections.json`

**`CareersHero`** (registrada em `registry.tsx`):
```
title:       string, default "It's all about people"
description: string
images:      array de { image: string (media-gallery) }
             1ª imagem = foto grande de cima; 2ª e 3ª = par de baixo, lado a lado
```

**`JobsList`** (registrada em `registry.tsx`):
```
title: string, default "Confira as vagas e faça parte do nosso time!"
jobs:  array de vagas, cada uma:
  title:       string
  description: string, widget draftjs-rich-text (informações gerais — aparece
               sempre no desktop; no mobile só depois de expandir a vaga)
  open:        boolean, default true — alimenta o filtro "Em aberto" / "Todas"
  sections:    array de blocos extras, cada um:
    buttonLabel: string — texto do botão que abre/fecha o bloco
    content:     string, widget draftjs-rich-text — conteúdo revelado ao clicar
```

> **Sem `LocalizedText` nesta página inteira — tudo em PT.** Diferente do
> resto do site (`{pt,en,es}` em todo campo visível), Carreiras usa `string`
> simples direto, sem sub-objeto por idioma nem `AnimatedText`/`t()` — decisão
> explícita do usuário.

## 3. Leitura (`src/lib/cms.ts`)

Nenhuma — `jobs` chega para o componente `JobsList` como qualquer outro campo
de section (`section.data.jobs`), sem enriquecimento no SSR. Não passa por
`enrichSections` (isso é só para `ClientsList`/`CasesShowcase`, que buscam
dados de OUTRO content-type).

## 4. Rota — página normal, sem código dedicado

`/carreiras` é uma **landing page comum**, exatamente como `/clientes` ou
qualquer outra página custom do site: um documento do content-type
`landingPage` com `settings.seo.slug = "/carreiras"` (sem barra no final —
importa, porque a rota `[...slug]/page.tsx` monta o caminho de busca sem
barra final) e sections `CareersHero` + `JobsList` adicionadas nele. Não existe
`src/app/[locale]/carreiras/page.tsx` — a rota `[...slug]` já cobre isso.

Componentes:
- `src/sections/CareersHero/CareersHero.tsx` (+ `.module.scss`, `types.ts`)
- `src/sections/Careers/JobsList.tsx` (+ `.module.scss`) — guarda o estado do
  filtro (`"open" | "all"`), o `expanded` de cada vaga, e — dentro de cada
  vaga — o `expanded` de cada item do array `sections`. Renderiza o acordeão
  mobile / grid desktop; monta e envia o formulário de candidatura.
- `src/sections/Careers/types.ts` — tipos compartilhados pelos dois.

## 5. Candidatura → Master Data

Mesmo padrão de `src/app/api/form-submit/route.ts` (formulário do rodapé →
entity `FN`): uma API route no servidor guarda `VTEX_APP_KEY`/`VTEX_APP_TOKEN`
e faz o POST pro Master Data — o browser nunca vê as credenciais.

### `src/app/api/job-application/route.ts`

Data entity: `process.env.JOB_APPLICATION_ENTITY || "CAND"` — ajuste a env var
(ou o fallback no código) quando a entity for criada com o nome final.

Campos enviados:

| Campo         | Tipo   | Origem                                                | Obrigatório |
|---------------|--------|--------------------------------------------------------|:---:|
| `name`        | string | campo "Nome" do formulário                              | sim |
| `company`     | string | campo "Empresa" do formulário                            | não |
| `email`       | string | campo "E-mail"                                           | sim |
| `phone`       | string | campo "Telefone"                                         | não |
| **`job`**     | string | **oculto — não aparece no formulário.** Título da vaga que estava expandida quando o candidato clicou "Enviar" — `JobsList` inclui isso no `FormData` antes de mandar pro `/api/job-application`. Permite depois filtrar/segmentar candidaturas por vaga. | sim |
| `submittedAt` | string (datetime) | gerado no servidor, não confia no cliente     | sim |
| currículo (arquivo) | anexo | ver abaixo                                        | não |

### 5.1 Currículo (upload)

Usa o endpoint de anexo do Master Data v2: a rota primeiro cria o documento
(POST JSON com os campos acima) e, se um arquivo foi enviado, faz um segundo
`POST /api/dataentities/{entity}/documents/{id}/resume/attachments` — o
arquivo vai dentro de um `FormData` (campo `file`), não como binário cru; o
`Content-Type` multipart com boundary é montado automaticamente pelo `fetch`
ao passar um `FormData` como body (setar na mão quebra o parse). Isso depende
de a data entity ter um campo do tipo arquivo chamado `resume`. Se esse passo
falhar, a candidatura em si já foi salva (nome/e-mail/vaga) — não bloqueia o
candidato por causa do anexo.

## 6. Cadastro no Admin (fluxo para quem edita conteúdo)

1. Criar (ou editar) uma **Landing Page** com `settings.seo.slug = "/carreiras"`
   (sem barra no final).
2. Adicionar a section **CareersHero** e preencher título/descrição/fotos.
3. Adicionar a section **JobsList**, preencher o título da lista, e no array
   **jobs** adicionar um item por vaga (título, descrição, "em aberto?", e os
   blocos extras que quiser).
4. Publicar.

Não há necessidade de criar nenhum documento separado por vaga — tudo fica
dentro do array `jobs` da própria section `JobsList`.

## 7. Histórico de decisões

- **Content-type `job` dedicado → descartado.** A primeira versão desta spec
  propunha um content-type próprio (um documento por vaga, espelhando `case`).
  Na prática isso exige SEO/slug e publicação por vaga sem nenhum benefício,
  já que não existe rota por vaga — tudo mostra na mesma `/carreiras`. Vagas
  viraram um array na própria section `JobsList` (§2).
- **Identificador da vaga no Master Data**: como não há mais slug por vaga, o
  campo oculto `job` manda o **título** da vaga em vez de um slug (§5).
- **Hero**: virou section de CMS (`CareersHero`), registrada normalmente —
  editável pelo Admin sem deploy, mesmo padrão do resto do site.
- **Campo "Empresa"** no formulário: mantido como está (reaproveita o form do
  rodapé), sem confirmação final de que faz sentido pra um candidato — ajustar
  se necessário.
- **Upload de currículo**: cria o documento, depois anexa o arquivo num 2º
  request pro endpoint `/documents/{id}/resume/attachments`, com o arquivo
  dentro de um `FormData` (campo `file`) — o formato inicial (PUT com o
  binário cru direto em `/documents/{id}/resume`) não funcionava; corrigido
  com base num endpoint equivalente já validado em outro app da conta.
