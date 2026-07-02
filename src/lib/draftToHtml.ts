/**
 * Converte o ContentState "raw" do draft-js (formato salvo pelo widget
 * `draftjs-rich-text` do VTEX CMS) em HTML.
 *
 * Escapa todo o texto e emite apenas tags conhecidas + links sanitizados —
 * seguro para uso com dangerouslySetInnerHTML. Offsets seguem a semântica do
 * draft-js (índices UTF-16 da string). Profundidade de lista aninhada é ignorada.
 */

interface RawRange {
  offset: number;
  length: number;
  style?: string;
  key?: number;
}

interface RawBlock {
  text?: string;
  type?: string;
  inlineStyleRanges?: RawRange[];
  entityRanges?: RawRange[];
}

interface RawEntity {
  type?: string;
  data?: Record<string, unknown>;
}

interface RawContent {
  blocks?: RawBlock[];
  entityMap?: Record<string, RawEntity>;
}

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const STYLE_TAGS: Record<string, string> = {
  BOLD: "strong",
  ITALIC: "em",
  UNDERLINE: "u",
  STRIKETHROUGH: "s",
  CODE: "code",
};

const BLOCK_TAGS: Record<string, string> = {
  unstyled: "p",
  "header-one": "h1",
  "header-two": "h2",
  "header-three": "h3",
  "header-four": "h4",
  "header-five": "h5",
  "header-six": "h6",
  blockquote: "blockquote",
  "code-block": "pre",
};

/** Permite apenas esquemas seguros em links. */
function safeHref(url: unknown): string | null {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  return /^(https?:|mailto:|tel:|\/|#)/i.test(trimmed) ? trimmed : null;
}

function renderInline(block: RawBlock, entityMap: Record<string, RawEntity>): string {
  const text = block.text ?? "";
  const n = text.length;
  if (n === 0) return "";

  const styleAt: string[][] = Array.from({ length: n }, () => []);
  const entityAt: (number | null)[] = Array.from({ length: n }, () => null);

  for (const r of block.inlineStyleRanges ?? []) {
    if (!r.style) continue;
    for (let i = r.offset; i < r.offset + r.length && i < n; i++) styleAt[i].push(r.style);
  }
  for (const r of block.entityRanges ?? []) {
    for (let i = r.offset; i < r.offset + r.length && i < n; i++) entityAt[i] = r.key ?? null;
  }

  let html = "";
  let i = 0;
  while (i < n) {
    const styleKey = styleAt[i].slice().sort().join(",");
    const entity = entityAt[i];
    let j = i + 1;
    while (
      j < n &&
      styleAt[j].slice().sort().join(",") === styleKey &&
      entityAt[j] === entity
    ) {
      j++;
    }

    let segment = escapeHtml(text.substring(i, j));
    for (const style of styleAt[i]) {
      const tag = STYLE_TAGS[style];
      if (tag) segment = `<${tag}>${segment}</${tag}>`;
    }
    if (entity != null) {
      const ent = entityMap[String(entity)];
      if (ent?.type === "LINK") {
        const href = safeHref(ent.data?.url ?? ent.data?.href);
        if (href) segment = `<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${segment}</a>`;
      }
    }
    html += segment;
    i = j;
  }
  return html;
}

export function draftToHtml(value: string | null | undefined): string {
  if (!value) return "";

  let raw: RawContent;
  try {
    raw = JSON.parse(value);
  } catch {
    // Não é draft-js raw (ex.: texto simples/HTML já pronto) — trata como texto.
    return `<p>${escapeHtml(value)}</p>`;
  }

  const blocks = raw.blocks ?? [];
  const entityMap = raw.entityMap ?? {};
  let html = "";
  let listType: "ul" | "ol" | null = null;

  const closeList = () => {
    if (listType) {
      html += `</${listType}>`;
      listType = null;
    }
  };

  for (const block of blocks) {
    const inner = renderInline(block, entityMap);
    if (block.type === "unordered-list-item" || block.type === "ordered-list-item") {
      const want = block.type === "unordered-list-item" ? "ul" : "ol";
      if (listType !== want) {
        closeList();
        html += `<${want}>`;
        listType = want;
      }
      html += `<li>${inner}</li>`;
    } else {
      closeList();
      const tag = BLOCK_TAGS[block.type ?? "unstyled"] ?? "p";
      html += `<${tag}>${inner || "<br/>"}</${tag}>`;
    }
  }
  closeList();

  return html;
}
