import { NextResponse, type NextRequest } from "next/server";

/**
 * Envio do formulário de candidatura (página de Carreiras) para o Master Data
 * da VTEX. Mesma conta/credenciais do form-submit (footer) — ver aquele
 * arquivo para o porquê da conta ser "wecode".
 *
 * dataEntity: sugestão "CAND" — ainda não existe, ver specs/careers-page.md
 * §5. Ajuste `DATA_ENTITY` (ou defina JOB_APPLICATION_ENTITY no .env) assim
 * que a entity for criada com o nome final.
 *
 * Campos: name, company, email, phone, job (slug da vaga — nunca aparece no
 * formulário, vem junto no FormData), submittedAt (gerado aqui, não confia no
 * cliente) + resume (arquivo, anexado num 2º passo — ver §5.1 da spec).
 *
 * ⚠️ O upload do currículo usa o campo de arquivo nativo do Master Data v2
 * (POST /documents/{id}/{field} com o binário do arquivo). Essa parte
 * depende de a data entity ter um campo do tipo arquivo chamado "resume" —
 * validar contra a conta real antes de confiar em produção (não foi possível
 * testar contra uma instância viva). Se esse passo falhar, a candidatura em
 * si (nome/e-mail/vaga) já foi salva — não bloqueia o candidato por causa do
 * anexo.
 */
const VTEX_ACCOUNT = "wecode";
const VTEX_ENV = "myvtex";
const DATA_ENTITY = process.env.JOB_APPLICATION_ENTITY || "CAND";
const BASE_URL = `https://${VTEX_ACCOUNT}.${VTEX_ENV}.com/api/dataentities/${DATA_ENTITY}/documents`;

export const dynamic = "force-dynamic";

function authHeaders(appKey: string, appToken: string) {
  return {
    Accept: "application/json",
    "X-VTEX-API-AppKey": appKey,
    "X-VTEX-API-AppToken": appToken,
  };
}

export async function POST(request: NextRequest) {
  const appKey = process.env.VTEX_APP_KEY;
  const appToken = process.env.VTEX_APP_TOKEN;

  if (!appKey || !appToken) {
    return NextResponse.json(
      { message: "Credenciais VTEX (VTEX_APP_KEY/VTEX_APP_TOKEN) não configuradas." },
      { status: 500 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ message: "Corpo inválido." }, { status: 400 });
  }

  const name = formData.get("name");
  const email = formData.get("email");
  const job = formData.get("job");

  if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ message: "Nome e e-mail são obrigatórios." }, { status: 400 });
  }

  // Repassa apenas os campos esperados (não confia em dados extras do cliente).
  const payload = {
    name,
    company: formData.get("company") || undefined,
    email,
    phone: formData.get("phone") || undefined,
    job: typeof job === "string" ? job : undefined,
    submittedAt: new Date().toISOString(),
  };

  let documentId: string | undefined;
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: { ...authHeaders(appKey, appToken), "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const details = await response.text();
      return NextResponse.json(
        { message: "Erro ao enviar candidatura", details },
        { status: response.status }
      );
    }

    const data = (await response.json().catch(() => ({}))) as { DocumentId?: string; Id?: string };
    documentId = data.DocumentId || data.Id;
  } catch (error) {
    return NextResponse.json(
      { message: "Erro interno no servidor", error: String(error) },
      { status: 500 }
    );
  }

  // Currículo é opcional e é um passo à parte — se falhar, a candidatura em
  // si já foi salva, então avisamos mas não retornamos erro pro candidato.
  const resume = formData.get("resume");
  let resumeWarning: string | undefined;
  if (documentId && resume instanceof File && resume.size > 0) {
    try {
      const uploadResponse = await fetch(`${BASE_URL}/${documentId}/resume`, {
        method: "POST",
        headers: {
          ...authHeaders(appKey, appToken),
          "Content-Type": resume.type || "application/octet-stream",
        },
        body: resume,
      });
      if (!uploadResponse.ok) {
        resumeWarning = "Candidatura enviada, mas houve um problema ao anexar o currículo.";
      }
    } catch {
      resumeWarning = "Candidatura enviada, mas houve um problema ao anexar o currículo.";
    }
  }

  return NextResponse.json({ message: resumeWarning ?? "Enviado com sucesso", documentId });
}
