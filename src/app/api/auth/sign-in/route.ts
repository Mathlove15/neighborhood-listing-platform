import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServer } from "@/lib/supabaseServer";

const signInSchema = z
  .object({
    email: z.string().trim().email().max(254),
    password: z.string().min(1).max(4096),
  })
  .strict();

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request must contain valid JSON." },
      { status: 400 }
    );
  }

  const parsed = signInSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid email and password." },
      { status: 400 }
    );
  }

  try {
    const supabase = createSupabaseServer();

    const { data, error } = await supabase.auth.signInWithPassword(
      parsed.data
    );

    if (error || !data.session) {
      return NextResponse.json(
        { error: "Unable to sign in. Check your email and password." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { accessToken: data.session.access_token },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Sign-in service unavailable." },
      { status: 500 }
    );
  }
}