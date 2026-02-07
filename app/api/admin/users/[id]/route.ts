import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
        staff: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { email, password, phone, isActive, role, ...extraData } = body;

    // Build update data
    const updateData: any = {};
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (role) updateData.role = role;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        patient: true,
        doctor: true,
        staff: true,
      },
    });

    // Update role-specific data
    if (user.patient?.length) {
      const patientUpdateData: any = {};
      if (extraData.firstName)
        patientUpdateData.firstName = extraData.firstName;
      if (extraData.lastName) patientUpdateData.lastName = extraData.lastName;
      if (extraData.gender !== undefined)
        patientUpdateData.gender = extraData.gender;
      if (extraData.bloodType !== undefined)
        patientUpdateData.bloodType = extraData.bloodType;
      if (extraData.address !== undefined)
        patientUpdateData.address = extraData.address;
      if (extraData.dateOfBirth)
        patientUpdateData.dateOfBirth = new Date(extraData.dateOfBirth);

      if (Object.keys(patientUpdateData).length > 0) {
        await prisma.patient.update({
          where: { userId: user.id },
          data: patientUpdateData,
        });
      }
    }

    if (user.doctor?.length) {
      const doctorUpdateData: any = {};
      if (extraData.firstName) doctorUpdateData.firstName = extraData.firstName;
      if (extraData.lastName) doctorUpdateData.lastName = extraData.lastName;
      if (extraData.specialization !== undefined)
        doctorUpdateData.specialization = extraData.specialization;
      if (extraData.department !== undefined)
        doctorUpdateData.department = extraData.department;
      if (extraData.consultationFee !== undefined)
        doctorUpdateData.consultationFee = extraData.consultationFee;
      if (extraData.licenseNumber !== undefined)
        doctorUpdateData.licenseNumber = extraData.licenseNumber;
      if (extraData.isAvailable !== undefined)
        doctorUpdateData.isAvailable = extraData.isAvailable;

      if (Object.keys(doctorUpdateData).length > 0) {
        await prisma.doctor.update({
          where: { userId: user.id },
          data: doctorUpdateData,
        });
      }
    }

    if (user.staff?.length && extraData.staffRole) {
      await prisma.staff.update({
        where: { userId: user.id },
        data: { role: extraData.staffRole },
      });
    }

    return NextResponse.json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
