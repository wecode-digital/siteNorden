import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Revalidação on-demand (ISR). Configurar o webhook de releases do VTEX
 * Headless CMS para chamar:
 *   POST https://<dominio>/api/revalidate?secret=<CMS_REVALIDATE_SECRET>
 *
 * Ao publicar conteúdo no CMS, o webhook dispara e a Home é regenerada.
 * Quando houver mais páginas, passar `?path=/rota` para revalidar caminhos específicos.
 */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (!process.env.CMS_REVALIDATE_SECRET || secret !== process.env.CMS_REVALIDATE_SECRET) {
    return NextResponse.json(
      { revalidated: false, message: "Segredo inválido." },
      { status: 401 }
    );
  }

  const path = request.nextUrl.searchParams.get("path") || "/";
  revalidatePath(path);

  return NextResponse.json({ revalidated: true, path, now: Date.now() });
}
