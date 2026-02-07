import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (
      !session ||
      (session.user?.role !== "admin" && session.user?.role !== "staff")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
      orderBy: {
        firstName: "asc",
      },
    });

    return NextResponse.json({ patients });
  } catch (error) {
    console.error("Failed to fetch patients:", error);
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 },
    );
  }
}
