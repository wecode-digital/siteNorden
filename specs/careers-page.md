# Página de Carreiras (`/carreiras`)

> **Status:** Spec — nada implementado ainda. Este documento existe para alinhar
> o modelo de dados (content-type `job` no Headless CMS + nova Master Data
> entity das candidaturas) antes de começar a construir.
> **Figma:** mobile [node 765:268482](https://www.figma.com/design/lShet4Yhaok9o2Je562HfE/Norden?node-id=765-268482) ·
> desktop [node 766:273756](https://www.figma.com/design/lShet4Yhaok9o2Je562HfE/Norden?node-id=766-273756).

---

## 1. O que a página tem

1. **Hero** — título ("It's all about people"), descrição e um mosaico de 3 fotos.
2. **Filtro** — duas tabs: **"Em aberto"** (default, ativa) e **"Todas"**. Comentário do
   próprio Figma (anotação no node do filtro) confirma a intenção: *"filtro para
   que o usuário possa visualizar apenas as vagas em aberto ou todas que já
   foram criadas [...] necessário criar alguma tag para indicar se a vaga é
   antiga ou não"* — ou seja, cada vaga precisa de um campo de status.
3. **Lista de vagas** — cada vaga é um item que **expande no lugar** (não navega
   para outra página) revelando descrição + formulário de candidatura:
   - **Mobile:** acordeão. Fechado = só título + seta (chevron) + linha
     divisória. Aberto = título + seta invertida + descrição (rich text) +
     formulário.
   - **Desktop:** grid de até 3 colunas. Fechado = card com título + descrição
     **sempre visíveis** + botão "Quero me candidatar". Clicar no botão troca o
     card para o estado aberto (mesmo conteúdo + formulário no lugar do botão).
   - Pelo Figma, mais de um card pode estar aberto ao mesmo tempo (não é
     radio/accordion exclusivo) — cada vaga controla seu próprio
     `expanded` independentemente.

   > **Mudança de escopo (não está no Figma):** a descrição de cada vaga deixa
   > de ser um bloco único de texto. Ela passa a ter duas partes:
   > 1. **Informações gerais** — o texto livre que já existe no Figma
   >    (aparece do jeito que está desenhado, sem mudança).
   > 2. **Seções adicionais (array)** — logo depois das informações gerais,
   >    uma lista de blocos extras cadastráveis (ex.: "Responsabilidades",
   >    "Requisitos", "Benefícios" — o texto do botão é livre, quem cadastra
   >    decide). Cada bloco tem **seu próprio botão** que abre/fecha **só
   >    aquele bloco**, com o mesmo tipo de interação de clique-pra-abrir do
   >    botão que revela o formulário — só que aqui é por seção, e cada uma
   >    abre de forma independente das outras (não é um accordion exclusivo
   >    entre elas, igual ao comportamento entre vagas).
   >
   > Ou seja, dentro de uma vaga expandida agora existem **dois níveis** de
   > estado de abrir/fechar: o da vaga em si (título/botão → mostra a
   > descrição) e, dentro dela, um estado por seção do array (cada botão da
   > lista abre só o próprio conteúdo).
4. **Formulário de candidatura** (dentro de cada vaga expandida) — campos:
   Nome, Empresa, E-mail, Telefone, "Anexe seu currículo aqui", botão "Enviar".

   > ⚠️ **Campo "Empresa" estranho no contexto**: esse formulário parece ser o
   > mesmo componente reaproveitado do formulário de contato do rodapé (que
   > tem exatamente os mesmos 4 campos: Nome/Empresa/E-mail/Telefone). Faz
   > sentido perguntar "Empresa" para um lead comercial, mas não
   > necessariamente para um candidato a vaga. **Confirmar com quem desenhou**
   > se é intencional (ex.: "empresa atual do candidato") ou se deveria virar
   > outro campo (LinkedIn, portfólio, pretensão salarial etc.) antes de
   > implementar.

## 2. Modelo de conteúdo (Headless CMS) — content-type `job`

Segue exatamente o padrão já usado para `case` (ver `specs/cms-integration.md`
§9): um content-type próprio, não-singleton, com SEO, e uma section de dados
que **não é registrada no `sections/registry.tsx`** (é dado consumido direto
pela rota, não uma section genérica renderizável em qualquer página).

### `cms/faststore/content-types.json` — novo content-type `job`

```json
{
  "id": "job",
  "name": "Vaga",
  "scopes": ["job", "custom"],
  "configurationSchemaSets": [
    {
      "name": "Settings",
      "configurations": [
        {
          "name": "seo",
          "schema": {
            "title": "SEO",
            "type": "object",
            "widget": { "ui:ObjectFieldTemplate": "GoogleSeoPreview" },
            "required": ["slug", "title"],
            "properties": {
              "slug": {
                "title": "Path",
                "description": "Identificador único da vaga (não é uma rota navegável — a candidatura acontece na própria /carreiras). Ex.: /carreiras/ux-ui-designer",
                "type": "string",
                "default": "/carreiras/"
              },
              "title": { "title": "Título (para SEO)", "type": "string" },
              "description": { "title": "Descrição (para SEO)", "type": "string" }
            }
          }
        }
      ]
    }
  ]
}
```

> O `slug` aqui não vira uma página própria (ver §4) — serve só como
> identificador único da vaga e é o valor que vai no campo oculto do
> formulário (§3).

### `cms/faststore/sections.json` — nova section `Job` (não registrada)

```
title:       string simples (só PT — ver observação abaixo)
description: string, widget draftjs-rich-text (2 parágrafos no Figma)
             — "informações gerais", continua exatamente como no Figma
open:        boolean, default true — alimenta o filtro "Em aberto" / "Todas"
sections:    array de blocos extras (cadastrados depois da descrição), cada um:
  buttonLabel: string — texto do botão que abre/fecha o bloco
               (livre; ex.: "Responsabilidades", "Requisitos", "Benefícios")
  content:     string, widget draftjs-rich-text — conteúdo revelado
               ao clicar no botão
```

> **Decidido: sem `LocalizedText` nessa página — tudo em PT.** Diferente do
> resto do site (que usa `{pt,en,es}` em todo campo visível), a página de
> Carreiras usa `string` simples direto, sem sub-objeto por idioma. Isso vale
> pra todos os campos de texto do content-type `job` (`title`, `description`,
> `buttonLabel`/`content` do array `sections`) e também pro Hero da página
> (§6), caso vire uma section de CMS. Também não precisa de `AnimatedText`
> nesses campos — é só renderizar a string direto (sem passar por `t()`).

> `sections` é a mudança de escopo pedida: um array de itens
> `{ buttonLabel, content }` — o cadastrador escolhe tanto o texto do botão
> quanto o conteúdo de cada bloco, e pode adicionar quantos quiser por vaga.
> Cada item vira um mini-accordion independente dentro da descrição da vaga
> (ver §1 e §4).

## 3. Leitura (`src/lib/cms.ts`) — espelha `getCase`/`getAllCases`

```ts
export async function getAllJobs(): Promise<JobSummary[]> {
  const docs = await getAllContent("job");
  return docs.map(jobFromDoc).filter((j) => Boolean(j.slug));
}
```

Sem chamada separada por filtro de status — busca **todas** as vagas uma vez
no Server Component da página e o toggle "Em aberto"/"Todas" é só um filtro
client-side sobre o array já carregado (`jobs.filter(j => j.open)` vs `jobs`).
Mais simples e mais rápido que ida-e-volta ao CMS a cada troca de tab, e seguro
porque a listagem inteira já é conteúdo público.

## 4. Rotas — só UMA página, sem `/carreiras/[slug]`

Diferente de `case` (que tem `/cases/[slug]` como página própria), aqui **não
há detalhe navegável por vaga** — tudo acontece em `/carreiras` via
expand/collapse no cliente. Então:

- `src/app/[locale]/carreiras/page.tsx` — Server Component: busca todas as
  vagas (`getAllJobs()`) + o hero (ver §6), renderiza `<JobsList jobs={...} />`.
- `src/sections/Careers/JobsList.tsx` (+ `.module.scss`, `types.ts`) — Client
  Component: guarda o estado do filtro (`"open" | "all"`), o `expanded` de
  cada vaga, **e** — dentro de cada vaga — o `expanded` de cada item do array
  `sections` (um booleano por bloco, independente entre si e independente do
  `expanded` da vaga). Renderiza o acordeão mobile / grid desktop; dentro da
  descrição, o mini-accordion dos blocos extras; monta e envia o formulário de
  candidatura.

Não precisa de `generateStaticParams` por vaga (não existe rota por vaga).

## 5. Candidatura → Master Data (entity nova)

Segue exatamente o padrão já existente em `src/app/api/form-submit/route.ts`
(formulário do rodapé → entity `FN`): uma API route no servidor guarda
`VTEX_APP_KEY`/`VTEX_APP_TOKEN` e faz o POST pro Master Data — o browser nunca
vê as credenciais.

### Nova rota: `src/app/api/job-application/route.ts`

Mesmo esqueleto do `form-submit`, apontando para uma **nova data entity**
(sugestão de código: `CAND` ou `JOBAPP` — o nome final é com você, é só um
identificador de 3-4 letras no Master Data).

### Estrutura sugerida da data entity (você cria no Master Data)

| Campo         | Tipo   | Origem                                                | Obrigatório |
|---------------|--------|--------------------------------------------------------|:---:|
| `name`        | string | campo "Nome" do formulário                              | sim |
| `company`     | string | campo "Empresa" do formulário (ver ressalva §1)          | não |
| `email`       | string | campo "E-mail"                                           | sim |
| `phone`       | string | campo "Telefone"                                         | não |
| `resumeUrl`   | string | URL do currículo anexado (ver §5.1)                       | não |
| **`job`**     | string | **oculto — não aparece no formulário.** Slug/id da vaga em que o candidato clicou "Enviar". É o que permite depois filtrar/segmentar candidaturas por vaga. | sim |
| `submittedAt` | string (datetime) | timestamp do envio, gerado no servidor (a API route seta, não confia no cliente) | sim |

> O campo `job` é exatamente o que você pediu: **não fica visível no
> formulário**, mas o componente sabe qual vaga está expandida/sendo enviada
> (é o mesmo componente `JobsList` que renderiza o card), então ele inclui
> `job: <slug-da-vaga>` no corpo da requisição antes de mandar pro
> `/api/job-application`, que por sua vez grava esse valor na data entity.
> Sem isso não dá pra saber depois pra qual vaga cada candidatura era.

### 5.1 Currículo (upload) — decisão pendente

O Figma só mostra um campo de texto "Anexe seu currículo aqui" (parece um link,
não necessariamente um `<input type="file">" nativo) — duas formas de resolver,
com trade-offs diferentes:

- **(a) Master Data com campo de arquivo nativo:** MD v2 suporta anexar
  arquivo diretamente num documento. Mais simples (uma API só), mas precisa
  confirmar se a conta VTEX tem esse recurso habilitado e qual o limite de
  tamanho.
- **(b) Upload separado + guarda só a URL:** o front sobe o arquivo pra algum
  storage (ex.: VTEX Files/Media API, ou outro serviço) e manda só a URL
  resultante (`resumeUrl`) no payload da candidatura. Mais flexível (funciona
  com qualquer storage), mas é uma chamada a mais e mais uma peça de infra.

Recomendo (b) por ser mais previsível e desacoplado, mas isso depende do que
já está disponível na conta VTEX da Norden — validar antes de implementar.

## 6. Hero da página (título + descrição + 3 fotos)

Não é uma "vaga" — é conteúdo fixo do topo da página. Duas opções:
- **Section de CMS nova** (ex. `"CareersHero"`, registrada normalmente em
  `registry.tsx`), se quiser poder editar copy/fotos pelo Admin sem deploy —
  mesmo padrão de qualquer outra section do site.
- **Hardcoded na própria rota** (como o `og-home.png` da Home), se esse
  conteúdo muda raramente e não vale o cadastro de mais uma section.

Sem preferência forte aqui — a página funciona igual, é só uma questão de
"quem edita isso depois" (editor no Admin vs. deploy de código).

## 7. Resumo do que falta decidir antes de implementar

1. ~~Título/descrição da vaga: `{pt,en,es}` ou só PT?~~ **Decidido: só PT, sem
   `LocalizedText`** (§2).
2. Campo "Empresa" no formulário de candidatura: mantém, remove ou vira outra
   coisa? (§1)
3. Nome da data entity nova no Master Data (§5).
4. Upload de currículo: campo de arquivo nativo do MD ou storage separado +
   URL? (§5.1)
5. Hero da página: section de CMS nova ou hardcoded? (§6)

Depois de bater as 4 decisões restantes, dá pra sair direto pra implementação
— o resto (schema do content-type, rota, componente de acordeão/grid, API
route) já está desenhado acima seguindo os mesmos padrões do resto do site.
