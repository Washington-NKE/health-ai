import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            isActive: true,
          },
        },
        appointment: {
          include: {
            doctor: {
              select: {
                firstName: true,
                lastName: true,
                specialization: true,
              },
            },
          },
          orderBy: {
            appointmentDate: "desc",
          },
        },
        billings: {
          orderBy: {
            issuedAt: "desc",
          },
        },
        prescriptions: {
          orderBy: {
            issuedAt: "desc",
          },
        },
        labResults: {
          orderBy: {
            reportedAt: "desc",
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
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({ patient });
  } catch (error) {
    console.error("Error fetching patient:", error);
    return NextResponse.json(
      { error: "Failed to fetch patient" },
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
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      bloodType,
      address,
      email,
      phone,
      isActive,
    } = body;

    // Get the patient to access userId
    const existingPatient = await prisma.patient.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingPatient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Update patient data
    const patientUpdateData: any = {};
    if (firstName !== undefined) patientUpdateData.firstName = firstName;
    if (lastName !== undefined) patientUpdateData.lastName = lastName;
    if (dateOfBirth !== undefined)
      patientUpdateData.dateOfBirth = new Date(dateOfBirth);
    if (gender !== undefined) patientUpdateData.gender = gender;
    if (bloodType !== undefined) patientUpdateData.bloodType = bloodType;
    if (address !== undefined) patientUpdateData.address = address;

    // Update user data
    const userUpdateData: any = {};
    if (email !== undefined) userUpdateData.email = email;
    if (phone !== undefined) userUpdateData.phone = phone;
    if (isActive !== undefined) userUpdateData.isActive = isActive;

    // Perform updates in transaction
    const [updatedPatient, updatedUser] = await prisma.$transaction([
      prisma.patient.update({
        where: { id },
        data: patientUpdateData,
      }),
      prisma.user.update({
        where: { id: existingPatient.userId },
        data: userUpdateData,
      }),
    ]);

    return NextResponse.json({
      message: "Patient updated successfully",
      patient: updatedPatient,
    });
  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json(
      { error: "Failed to update patient" },
      { status: 500 },
    );
  }
}
