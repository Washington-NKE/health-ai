import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get("role");
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    let whereClause: any = {};

    // Filter based on role
    if (role === "patient" && userId) {
      // Get patient by userId
      const patient = await prisma.patient.findUnique({
        where: { userId },
      });
      if (patient) {
        whereClause.patientId = patient.id;
      }
    } else if (role === "doctor" && userId) {
      // Get doctor by userId
      const doctor = await prisma.doctor.findUnique({
        where: { userId },
      });
      if (doctor) {
        whereClause.doctorId = doctor.id;
      }
    }
    // For admin/staff, show all appointments (no filter)

    // Filter by status if provided
    if (status) {
      whereClause.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: true,
        doctor: true,
      },
      orderBy: {
        appointmentDate: "asc",
      },
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Appointments GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { doctorId, appointmentDate, durationMinutes, reason, notes } = body;

    // Validate required fields
    if (!doctorId || !appointmentDate || !durationMinutes) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get patient from userId
    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id! },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 },
      );
    }

    // Check if doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        appointmentDate: new Date(appointmentDate),
        durationMinutes,
        reason: reason || undefined,
        notes: notes || undefined,
        status: "pending",
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error("Appointments POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
