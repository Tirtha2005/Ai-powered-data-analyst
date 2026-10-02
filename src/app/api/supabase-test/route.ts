import { NextResponse } from "next/server";
import { createClient } from "~/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Just verify the client initialized and can do a lightweight auth check
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return NextResponse.json(
        { status: "error", error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      status: "ok",
      message: "Supabase connection verified",
      sessionExists: !!data.session,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", error: err.message },
      { status: 500 },
    );
  }
}
