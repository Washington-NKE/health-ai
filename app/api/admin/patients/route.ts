import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            appointment: true,
            billings: true,
            prescriptions: true,
            labResults: true,
          },
        },
      },
      orderBy: {
        user: {
          createdAt: "desc",
        },
      },
    });

    return NextResponse.json({ patients });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 },
    );
  }
}
