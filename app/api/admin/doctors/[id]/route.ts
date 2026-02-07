import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Doctor ID is required" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      specialization,
      licenseNumber,
      department,
      consultationFee,
      bio,
      isAvailable,
    } = body;

    const doctor = await prisma.doctor.update({
      where: { id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(specialization && { specialization }),
        ...(licenseNumber && { licenseNumber }),
        ...(department && { department }),
        ...(consultationFee && {
          consultationFee: parseFloat(consultationFee),
        }),
        ...(bio && { bio }),
        ...(isAvailable !== undefined && { isAvailable }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            isActive: true,
          },
        },
      },
    });

    // Update phone on user if provided
    if (phone !== undefined) {
      await prisma.user.update({
        where: { id: doctor.userId },
        data: { phone: phone || null },
      });
    }

    return NextResponse.json(doctor);
  } catch (error) {
    console.error("Doctor PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Doctor ID is required" },
        { status: 400 },
      );
    }

    // Get the doctor to get userId
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Delete doctor first, then user
    await prisma.doctor.delete({
      where: { id },
    });

    await prisma.user.delete({
      where: { id: doctor.userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Doctor DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
