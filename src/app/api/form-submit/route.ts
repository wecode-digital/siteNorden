import { NextResponse, type NextRequest } from "next/server";

/**
 * Envio do formulário do footer para o Master Data da VTEX (conta wecode).
 * As credenciais (APP_KEY/APP_TOKEN) ficam SOMENTE no servidor — nunca no browser.
 * dataEntity: FN · campos: email, name, company, phone.
 */
const VTEX_ACCOUNT = "wecode";
const VTEX_ENV = "myvtex";
const DATA_ENTITY = "FN";
const VTEX_API_URL = `https://${VTEX_ACCOUNT}.${VTEX_ENV}.com/api/dataentities/${DATA_ENTITY}/documents`;

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const appKey = process.env.VTEX_APP_KEY;
  const appToken = process.env.VTEX_APP_TOKEN;

  if (!appKey || !appToken) {
    return NextResponse.json(
      { message: "Credenciais VTEX (VTEX_APP_KEY/VTEX_APP_TOKEN) não configuradas." },
      { status: 500 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: "Corpo inválido." }, { status: 400 });
  }

  // Repassa apenas os campos esperados (não confia em dados extras do cliente).
  const payload = {
    name: body.name,
    company: body.company,
    email: body.email,
    phone: body.phone,
  };

  try {
    const response = await fetch(VTEX_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-VTEX-API-AppKey": appKey,
        "X-VTEX-API-AppToken": appToken,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const details = await response.text();
      return NextResponse.json(
        { message: "Erro ao enviar ao Master Data", details },
        { status: response.status }
      );
    }

    const data = await response.json().catch(() => ({}));
    return NextResponse.json({ message: "Enviado com sucesso", data });
  } catch (error) {
    return NextResponse.json(
      { message: "Erro interno no servidor", error: String(error) },
      { status: 500 }
    );
  }
}
