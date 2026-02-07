import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const updateData: any = { status };

    // If marking as paid, set paidAt timestamp
    if (status === "paid") {
      updateData.paidAt = new Date();
    }

    const billing = await prisma.billing.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ billing });
  } catch (error) {
    console.error("Error updating billing:", error);
    return NextResponse.json(
      { error: "Failed to update billing" },
      { status: 500 },
    );
  }
}
