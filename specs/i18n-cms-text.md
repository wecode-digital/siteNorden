# i18n — Textos trilíngues no CMS (PT / EN / ES)

> Convenção **obrigatória** do siteNorden: **todo texto** exibido no site e cadastrado no CMS deve existir em **3 idiomas** — português (padrão), inglês e espanhol.

## 1. Idiomas

- Idiomas: **`pt`** (padrão), **`en`**, **`es`** — ver [`src/i18n/config.ts`](../src/i18n/config.ts).
- O usuário troca o idioma pelo **seletor no header**. A escolha é salva em cookie (`norden_locale`, 1 ano) e vale para o site inteiro.
- A troca é **client-side**: o servidor renderiza em PT e, ao montar, o app aplica a preferência salva. Não há URL por idioma.

## 2. Modelo de dado — `LocalizedText`

Todo campo de texto traduzível é um **objeto com um valor por idioma**:

```ts
type LocalizedText = { pt?: string; en?: string; es?: string };
```

No **schema do CMS** (`cms/faststore/sections.json`), um texto traduzível é declarado assim (copie este bloco para cada texto):

```jsonc
"meuTexto": {
  "title": "Meu texto",
  "type": "object",
  "properties": {
    "pt": { "title": "Português", "type": "string" },
    "en": { "title": "English", "type": "string" },
    "es": { "title": "Español", "type": "string" }
  }
}
```

> Convenções do projeto: sem campos obrigatórios; título da section com prefixo `[Norden]`. Ver [cms-integration.md](./cms-integration.md).

## 3. Como consumir no componente

Todo componente que exibe texto do CMS é (ou está dentro de) um **Client Component** e resolve o texto pelo idioma atual com o helper `t` do contexto:

```tsx
"use client";
import { useLocale } from "@/i18n/LocaleProvider";
import type { LocalizedText } from "@/i18n/text";

export function Exemplo({ titulo }: { titulo?: LocalizedText }) {
  const { t } = useLocale();
  return <h2>{t(titulo)}</h2>; // t() escolhe o idioma atual, com fallback para PT
}
```

- `t(valor)` resolve na ordem: **idioma atual → PT → primeiro valor preenchido → `""`**.
- `t()` também aceita `string` cru (compatibilidade com campos ainda não migrados).
- Fora de React (ex.: utilidades), use `t(valor, locale)` de [`src/i18n/text.ts`](../src/i18n/text.ts).

## 4. Checklist para adicionar/migrar um texto

1. **Schema** (`sections.json`): declarar o campo como objeto `{ pt, en, es }` (bloco acima).
2. **Tipo** do componente: usar `LocalizedText` em vez de `string`.
3. **Render**: exibir com `const { t } = useLocale(); t(campo)`.
4. **Sync**: enviar o schema com `yarn cms:sync` (workspace de dev primeiro — ver [cms-integration.md §5](./cms-integration.md)).
5. **Conteúdo**: no Admin, preencher os 3 idiomas (PT obrigatório na prática; EN/ES recomendados — sem EN/ES, o fallback exibe PT).

## 5. Estado atual

- Infra: [`src/i18n/`](../src/i18n) (`config.ts`, `text.ts`, `LocaleProvider.tsx`). O provider envolve todo o app em [`src/app/layout.tsx`](../src/app/layout.tsx).
- Seletor de idioma: [`src/components/Header/LanguageSelector.tsx`](../src/components/Header/LanguageSelector.tsx) — exibe o idioma ativo e, no dropdown, destaca o ativo com **underline**.
- Já usam o padrão: **Header** (`contactLabel`, `menuItems[].label`) e **VideoHero** (`alt`).

## 6. Header cadastrável (globalSections)

O header é a section **`Header`** do content type **`globalSections`** (singleton global). O [layout](../src/app/layout.tsx) busca esses dados via `getHeaderData()` ([`src/lib/cms.ts`](../src/lib/cms.ts)) e passa para o componente. Campos: `menuItems[] = { label: LocalizedText, url }`, `contactLabel: LocalizedText`, `contactUrl`.

Para ativar no CMS: `yarn cms:sync` (dev) → no Admin, adicionar a section **Header** ao **globalSections** e publicar. Enquanto não houver conteúdo, o Header usa fallbacks (ex.: "Contato/Contact/Contacto") e menu vazio.
