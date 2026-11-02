import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServer } from "@/lib/supabaseServer";

const inquirySchema = z
  .object({
    property_id: z.string().uuid(),
    inquirer_email: z.string().trim().email().max(254),
    message: z.string().trim().min(10).max(5000),
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

  const parsed = inquirySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Enter a valid email and a message of 10–5000 characters.",
      },
      { status: 400 }
    );
  }

  try {
    const supabase = createSupabaseServer();

    const { error } = await supabase
      .from("inquiries")
      .insert(parsed.data);

    if (error) {
      return NextResponse.json(
        { error: "Unable to send your inquiry." },
        { status: error.code === "42501" ? 403 : 500 }
      );
    }

    return NextResponse.json(
      { message: "Your inquiry was sent to the property owner." },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Inquiry service unavailable." },
      { status: 500 }
    );
  }
}