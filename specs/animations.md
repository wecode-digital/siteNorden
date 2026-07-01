# Animações — convenção global

> **Regra do projeto:** todo componente com **movimento** deve ser animado. Isso inclui:
> - **abre/fecha** (menus, drawers, modais, acordeões, dropdowns);
> - **troca de conteúdo dinâmico** (ex.: troca de idioma que altera os textos).
>
> Padrão de easing: **`ease-in-out`** (entrada e saída suaves). Duração típica: **0.25s–0.4s**.

## 1. Abre/fecha (open/close)

Mantenha o elemento **montado** e alterne uma classe de estado, transicionando `opacity` + `transform` (+ `visibility` para acessibilidade). Assim a animação ocorre **nas duas direções** (abrir e fechar), diferente de montar/desmontar (que só anima a entrada).

Exemplo (dropdown do seletor de idioma — [`Header.module.scss`](../src/components/Header/Header.module.scss)):

```scss
.menu {
  opacity: 0;
  transform: translateY(-6px);
  visibility: hidden;
  transition: opacity 0.25s ease-in-out, transform 0.25s ease-in-out,
    visibility 0s linear 0.25s; // esconde só depois do fade
}
.menuOpen {
  opacity: 1;
  transform: translateY(0);
  visibility: visible;
  transition: opacity 0.25s ease-in-out, transform 0.25s ease-in-out;
}
```

No componente, sempre renderize o elemento e apenas alterne a classe:
`className={`${styles.menu} ${open ? styles.menuOpen : ""}`}`.

## 2. Troca de conteúdo dinâmico (ex.: troca de idioma)

Quando o conteúdo muda em tela (sem sair/entrar do DOM), reexecute uma animação de fade **remontando o nó** com uma `key` que muda junto com o conteúdo.

Para **textos traduzíveis**, use o componente [`AnimatedText`](../src/components/AnimatedText/AnimatedText.tsx) — ele resolve o texto pelo idioma atual e anima a troca (`key={locale}`):

```tsx
import AnimatedText from "@/components/AnimatedText/AnimatedText";

<AnimatedText value={data?.titulo} />; // faz fade ao trocar de idioma
```

```scss
// AnimatedText.module.scss
.text { display: inline-block; animation: fadeSwap 0.3s ease-in-out; }
@keyframes fadeSwap {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

> Regra prática: **todo texto do CMS visível deve ser renderizado via `AnimatedText`** (integra i18n + animação de troca). Ver [i18n-cms-text.md](./i18n-cms-text.md).

## 3. Onde já está aplicado

- **Header** — fundo transparente ↔ branco no scroll (`transition: background-color … ease-in-out`).
- **Seletor de idioma** — dropdown com animação de abre/fecha; rótulo e textos via `AnimatedText`.

## 4. Checklist ao criar um componente

- [ ] Tem abre/fecha? → transição `opacity`/`transform` com `ease-in-out`, elemento montado + classe de estado.
- [ ] Tem troca de conteúdo em tela? → remontar com `key` + animação de fade (ou `AnimatedText` para textos).
- [ ] Respeita `ease-in-out` e duração 0.25s–0.4s.
- [ ] (Recomendado) Respeitar `prefers-reduced-motion` quando a animação for proeminente.
