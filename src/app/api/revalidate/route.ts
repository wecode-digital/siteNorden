import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getAllCases, getAllContent } from "@/lib/cms";

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

/** Home + listagem de cases + cada case + cada landing page publicada. */
async function getAllKnownPaths(): Promise<string[]> {
  const [cases, landingPages] = await Promise.all([
    getAllCases(),
    getAllContent("landingPage"),
  ]);

  const casePaths = cases.map((c) => c.slug).filter((slug): slug is string => Boolean(slug));
  const landingPaths = landingPages
    .map((doc) => (doc.settings as { seo?: { slug?: string } } | undefined)?.seo?.slug)
    .filter((slug): slug is string => Boolean(slug));

  return [...new Set(["/", "/cases", ...casePaths, ...landingPaths])];
}

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
    const paths = await getAllKnownPaths();
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
