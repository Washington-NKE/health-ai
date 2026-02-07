import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const doctors = await prisma.doctor.findMany({
      where: {
        isAvailable: true,
      },
      orderBy: {
        lastName: "asc",
      },
      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
        specialization: true,
        licenseNumber: true,
        department: true,
        consultationFee: true,
        bio: true,
      },
    });

    return NextResponse.json({ doctors });
  } catch (error) {
    console.error("Doctors API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
