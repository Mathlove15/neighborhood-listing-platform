import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { ListingUpdateSchema } from "@/schemas/listing";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authorization = request.headers.get("Authorization");
    const token = authorization?.match(/^Bearer (\S+)$/i)?.[1];

    if (!token) {
      return NextResponse.json(
        { error: "Sign in to update a listing." },
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

    const { id } = await context.params;
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidPattern.test(id)) {
      return NextResponse.json(
        { error: "Invalid listing ID." },
        { status: 400 }
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

    const result = ListingUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid listing update.",
          details: result.error.issues,
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("properties")
      .update(result.data)
      .eq("id", id)
      .eq("owner_id", auth.user.id)
      .eq("is_approved", false)
      .select("id, title, price, is_approved")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: "Unable to update the listing." },
        { status: error.code === "42501" ? 403 : 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "You can only update your own unapproved listings." },
        { status: 403 }
      );
    }

    return NextResponse.json({ listing: data });
} catch {
return NextResponse.json(
{ error: "Unable to process the update." },
{ status: 500 }
);
}
}