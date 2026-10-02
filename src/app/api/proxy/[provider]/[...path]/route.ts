import { type NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string; path: string[] }> },
) {
  const { provider, path: pathArray } = await params;
  const path = pathArray.join("/");

  let targetUrl = "";
  let authHeader = "";

  if (provider === "openai") {
    targetUrl = `https://api.openai.com/v1/${path}`;
    authHeader = `Bearer ${process.env.OPENAI_API_KEY}`;
  } else if (provider === "groq") {
    targetUrl = `https://api.groq.com/openai/v1/${path}`;
    authHeader = `Bearer ${process.env.GROQ_API_KEY}`;
  } else if (provider === "openrouter") {
    targetUrl = `https://openrouter.ai/api/v1/${path}`;
    authHeader = `Bearer ${process.env.OPENROUTER_API_KEY}`;
  } else if (provider === "gemini" || provider === "google") {
    const searchParams = req.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
    targetUrl = `https://generativelanguage.googleapis.com/v1beta/${path}?key=${key}${queryString ? "&" + queryString : ""}`;
  } else {
    return new Response("Unknown provider", { status: 400 });
  }

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  if (authHeader) {
    headers.set("Authorization", authHeader);
  }

  const body = await req.text();

  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      headers,
      body,
    });

    return new Response(res.body, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
