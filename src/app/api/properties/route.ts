import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { ListingCreateSchema } from "@/schemas/listing";

export async function GET() {
  try {
    const supabase = createSupabaseServer();

    const { data, error } = await supabase
      .from("properties")
      .select("id, title, price")
      .eq("is_approved", true);

    if (error) {
      return NextResponse.json(
        { error: "Failed to load properties." },
        { status: 500 }
      );
    }

    return NextResponse.json({ listings: data ?? [] });
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to the database." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("Authorization");
    const token = authorization?.match(/^Bearer (\S+)$/i)?.[1];

    if (!token) {
      return NextResponse.json(
        { error: "Sign in to create a listing." },
        { status: 401 }
      );
    }

    const supabase = createSupabaseServer(token);
    const { data: auth, error: authError } =
      await supabase.auth.getUser(token);

    if (authError || !auth.user) {
      return NextResponse.json(
        { error: "Invalid or expired sign-in." },
        { status: 401 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Send valid JSON." },
        { status: 400 }
      );
    }

    const result = ListingCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid listing.",
          details: result.error.issues,
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("properties")
      .insert({
        owner_id: auth.user.id,
        title: result.data.title,
        price: result.data.price,
      })
      .select("id, title, price, is_approved")
      .single();

    if (error) {
      if (error.code === "42501" || error.code === "23503") {
        return NextResponse.json(
          { error: "Draft creation is not allowed. Check your owner profile." },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: "Unable to save the draft." },
        { status: 500 }
      );
    }

    return NextResponse.json({ listing: data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to create the listing." },
      { status: 500 }
    );
  }
}