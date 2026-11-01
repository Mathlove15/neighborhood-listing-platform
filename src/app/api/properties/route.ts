import { NextResponse } from "next/server";
import { createSupabaseServer } from "../../../lib/supabaseServer";
import { propertySchema } from "../../../schemas/property";

const publicFields =
  "id,address,price,bedrooms,bathrooms,square_feet";

export async function GET() {
  try {
    const supabase = createSupabaseServer();

    const { data, error } = await supabase
      .from("properties")
      .select(publicFields)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Unable to load listings." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { properties: data },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Listing service unavailable." },
      { status: 500 }
    );
  }
}

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

  const parsed = propertySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid listing.",
        issues: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 }
    );
  }

  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];

  if (!token) {
    return NextResponse.json(
      { error: "Sign in to create a listing." },
      { status: 401 }
    );
  }

  try {
    const supabase = createSupabaseServer(token);
    const { data: auth, error: authError } =
      await supabase.auth.getUser(token);

    if (authError || !auth.user) {
      return NextResponse.json(
        { error: "Your sign-in is invalid or expired." },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("properties")
      .insert({
        ...parsed.data,
        owner_id: auth.user.id,
      })
      .select(`${publicFields},status`)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Unable to create listing." },
        { status: error.code === "42501" ? 403 : 500 }
      );
    }

    return NextResponse.json(
      { property: data },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Listing service unavailable." },
      { status: 500 }
    );
  }
}