import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const billings = await prisma.billing.findMany({
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        issuedAt: "desc",
      },
    });

    return NextResponse.json({ billings });
  } catch (error) {
    console.error("Error fetching billings:", error);
    return NextResponse.json(
      { error: "Failed to fetch billings" },
      { status: 500 },
    );
  }
}
