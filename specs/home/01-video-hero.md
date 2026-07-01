# Home · 01 — Video Hero

> **Status:** implementado (base) · detalhes visuais aguardando Figma
> **Escopo:** Home (primeiro componente da página)
> **Stack:** FastStore v3 — section de CMS (Headless CMS, projeto `norden2`)

> **Convenções do projeto (valem para todos os componentes):**
> - Nenhum campo é obrigatório no schema (sem array `required`). O componente deve tratar campos ausentes com fallbacks/valores padrão.
> - O `title` de cada section usa o prefixo **`[Norden]`**.

---

## Visão geral

Primeiro bloco da Home: um **vídeo em tela cheia** (hero) com um **botão de "pular"** no canto, que permite ao usuário avançar/encerrar o vídeo e seguir para o conteúdo abaixo.

O header **não** faz parte deste componente — no FastStore ele é a section nativa `Navbar` (customizável via `getOverriddenSection`), especificada à parte.

## Arquivos (FastStore)

| Arquivo | Papel |
|---|---|
| `cms/faststore/sections.json` → `VideoHero` | Schema editável no CMS |
| `src/components/index.tsx` → chave `VideoHero` | Registro (chave == `name` do schema) |
| `src/components/sections/Home/VideoHero/VideoHero.tsx` | Componente React |
| `src/components/sections/Home/VideoHero/videohero.module.scss` | Estilos (SCSS module) |

O conteúdo preenchido pelo editor chega como props (campos do schema), buscado pelo Core do projeto `norden2` (`contentSource.project` no `discovery.config.js`). Para aparecer na Home, a section precisa ser adicionada à página em **Admin → Storefront → Content** (projeto `norden2`).

## Comportamento

| Aspecto | Definição | Origem |
|---|---|---|
| Reprodução | `autoplay` + `muted` + `playsInline` (necessário para autoplay em mobile) | padrão |
| Loop | configurável (`loop`), padrão **desligado** | a confirmar |
| Poster | imagem de fallback exibida antes do vídeo carregar | padrão |
| Botão "pular" | fixo no canto do vídeo; ao clicar, rola até a próxima section (ou segue `skipLink` se preenchido) | **confirmar no Figma** |
| Vídeo mobile | fonte separada opcional; se vazio, usa a do desktop | a confirmar |

## Section (`cms/faststore/sections.json`)

Entrada já cadastrada em `cms/faststore/sections.json`:

```json
{
    "name": "VideoHero",
    "schema": {
        "title": "[Norden] Video Hero",
        "description": "Vídeo em tela cheia no topo da Home, com botão de pular no canto.",
        "type": "object",
        "properties": {
            "videoDesktop": {
                "title": "Vídeo Desktop",
                "type": "string",
                "widget": { "ui:widget": "media-gallery" }
            },
            "videoMobile": {
                "title": "Vídeo Mobile (opcional)",
                "description": "Se vazio, usa o vídeo de desktop.",
                "type": "string",
                "widget": { "ui:widget": "media-gallery" }
            },
            "poster": {
                "title": "Imagem de fallback (poster)",
                "description": "Exibida antes do vídeo carregar e como fallback.",
                "type": "string",
                "widget": { "ui:widget": "media-gallery" }
            },
            "alt": {
                "title": "Texto alternativo / descrição (SEO e acessibilidade)",
                "type": "string"
            },
            "autoplay": {
                "title": "Reproduzir automaticamente?",
                "type": "boolean",
                "default": true
            },
            "loop": {
                "title": "Repetir em loop?",
                "type": "boolean",
                "default": false
            },
            "muted": {
                "title": "Iniciar sem som?",
                "description": "Necessário para o autoplay funcionar nos navegadores.",
                "type": "boolean",
                "default": true
            },
            "showSkip": {
                "title": "Mostrar botão de pular?",
                "type": "boolean",
                "default": true
            },
            "skipText": {
                "title": "Texto do botão de pular",
                "type": "string",
                "default": "Pular"
            },
            "skipLink": {
                "title": "Link do botão de pular (opcional)",
                "description": "Se vazio, o botão apenas rola para a próxima seção da Home.",
                "type": "string"
            }
        }
    }
}
```

## Campos

| Campo | Tipo | Padrão | Observação |
|---|---|---|---|
| `videoDesktop` | media-gallery | — | Vídeo principal (desktop) |
| `videoMobile` | media-gallery | — | Fallback para o desktop se vazio |
| `poster` | media-gallery | — | Frame inicial / fallback |
| `alt` | string | — | Acessibilidade + SEO |
| `autoplay` | boolean | `true` | — |
| `loop` | boolean | `false` | — |
| `muted` | boolean | `true` | Requisito p/ autoplay |
| `showSkip` | boolean | `true` | — |
| `skipText` | string | `"Pular"` | — |
| `skipLink` | string | — | Vazio = scroll p/ próxima section |

> Nenhum campo é obrigatório (convenção do projeto). Sem `videoDesktop` cadastrado, o componente deve exibir apenas o `poster`, ou não renderizar.

## Pendências — confirmar no Figma (nó selecionado)

- [ ] Posição exata e estilo do botão "pular" (canto superior/inferior, direita/esquerda; ícone vs. texto; cor)
- [ ] Comportamento do botão: rolar para a próxima seção **ou** pular a reprodução do vídeo
- [ ] Altura do hero (100vh ou altura fixa) e proporção do vídeo
- [ ] Há overlay/máscara sobre o vídeo? Há texto/CTA sobreposto?
- [ ] Diferenças entre desktop e mobile (vídeo vertical vs. horizontal)
- [ ] Tokens de cor/tipografia usados (alimentam `src/themes/norden-theme.scss`)

> Assim que o servidor MCP `figma-desktop` estiver disponível na sessão, estes itens serão verificados contra o design e a spec finalizada.
