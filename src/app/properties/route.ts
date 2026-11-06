import { NextResponse } from "next/server";
import { PropertySchema } from "@/types/property";

const mockProperties = [
  {
    id: "p1",
    address: "1221 Minorca Dr",
    price: 1650000,
    bedrooms: 2,
    bathrooms: 1,
    square_feet: 900,
    status: "approved",
  },
];

export async function GET() {
  try {
    const approvedProperties = mockProperties
      .filter((property) => property.status === "approved")
      .map(
        ({
          id,
          address,
          price,
          bedrooms,
          bathrooms,
          square_feet,
        }) => ({
          id,
          address,
          price,
          bedrooms,
          bathrooms,
          square_feet,
        })
      );

    return NextResponse.json(approvedProperties);
  } catch {
    return NextResponse.json(
      { error: "Failed to load properties" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = PropertySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          errors: result.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        message: "Property created",
        data: result.data,
      },
      {
        status: 201,
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 500 }
    );
  }
}