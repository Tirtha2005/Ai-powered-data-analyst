import { runPython } from "~/lib/coding";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { code, session_id, files, apiKey } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }
    // Fallback to server API keys if not provided by client
    const finalApiKey =
      apiKey ||
      process.env.TOGETHER_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.GROQ_API_KEY;
    if (!finalApiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 },
      );
    }

    // Timeout logic: 60 seconds
    const TIMEOUT_MS = 60000;
    let timeoutHandle: NodeJS.Timeout | undefined = undefined;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(new Error("Code execution timed out after 60 seconds."));
      }, TIMEOUT_MS);
    });

    let result;
    try {
      result = await Promise.race([
        runPython(code, finalApiKey, session_id, files),
        timeoutPromise,
      ]);
    } catch (err: any) {
      if (err.message && err.message.includes("timed out")) {
        return NextResponse.json({ error: err.message }, { status: 504 });
      }
      throw err;
    } finally {
      if (timeoutHandle) clearTimeout(timeoutHandle);
    }

    if (req.signal.aborted) {
      console.log("Request aborted already from the client");
      return new Response("Request aborted", { status: 200 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
