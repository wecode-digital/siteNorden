import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getAllKnownPaths } from "@/lib/cms";

/**
 * Revalidação on-demand (ISR). Configurar o webhook de releases do VTEX
 * Headless CMS para chamar:
 *   https://<dominio>/api/revalidate?secret=<CMS_REVALIDATE_SECRET>&path=all
 *
 * Aceita GET e POST: o campo de webhook do CMS é uma URL única (sem opção de
 * escolher método) e costuma disparar GET, então não dá pra depender de POST.
 *
 * `path=all` revalida TODAS as páginas conhecidas de uma vez — é o valor
 * recomendado para o campo do CMS, já que essa URL única não distingue content
 * type. `?path=/rota` revalida só um caminho específico (útil para testar
 * manualmente uma página isolada).
 */
export const dynamic = "force-dynamic";

async function handleRevalidate(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (!process.env.CMS_REVALIDATE_SECRET || secret !== process.env.CMS_REVALIDATE_SECRET) {
    return NextResponse.json(
      { revalidated: false, message: "Segredo inválido." },
      { status: 401 }
    );
  }

  const path = request.nextUrl.searchParams.get("path") || "/";

  if (path === "all") {
    // "/sitemap.xml" não é uma página de conteúdo (não entra na própria listagem
    // do sitemap), mas segue o mesmo cache estático — sem isso, ficaria
    // desatualizado do mesmo jeito que as páginas ficavam antes.
    const paths = [...(await getAllKnownPaths()), "/sitemap.xml"];
    paths.forEach((p) => revalidatePath(p));
    return NextResponse.json({ revalidated: true, paths, now: Date.now() });
  }

  revalidatePath(path);

  return NextResponse.json({ revalidated: true, path, now: Date.now() });
}

export async function POST(request: NextRequest) {
  return handleRevalidate(request);
}

export async function GET(request: NextRequest) {
  return handleRevalidate(request);
}
