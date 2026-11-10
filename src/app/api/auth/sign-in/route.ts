import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServer } from "@/lib/supabaseServer";

const CredentialsSchema = z.strictObject({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

function reply(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return reply({ error: "Send valid JSON." }, 400);
  }

  const parsed = CredentialsSchema.safeParse(body);
  if (!parsed.success) {
    return reply({ error: "Enter a valid email and password." }, 400);
  }

  try {
    const supabase = createSupabaseServer();
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error || !data.session || !data.user) {
      return reply({ error: "Unable to sign in. Check your email and password." }, 401);
    }

    return reply({
      accessToken: data.session.access_token,
      expiresAt: data.session.expires_at,
      email: data.user.email,
    }, 200);
  } catch {
    return reply({ error: "Sign-in is unavailable. Please try again." }, 503);
  }
}
