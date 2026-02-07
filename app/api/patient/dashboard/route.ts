import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id || (session.user as any).role !== "patient") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id },
      include: {
        appointment: {
          where: {
            status: {
              in: ["pending", "scheduled", "confirmed"],
            },
            appointmentDate: {
              gte: new Date(),
            },
          },
          take: 3,
          orderBy: {
            appointmentDate: "asc",
          },
          include: {
            doctor: {
              select: {
                firstName: true,
                lastName: true,
                specialization: true,
              },
            },
          },
        },
        prescriptions: {
          where: {
            expiresAt: {
              gt: new Date(),
            },
          },
          include: {
            doctor: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        labResults: {
          take: 5,
          orderBy: {
            reportedAt: "desc",
          },
          include: {
            doctor: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        billings: {
          where: {
            status: "pending",
          },
          orderBy: {
            issuedAt: "desc",
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Transform the data to match the frontend interface
    const appointments = patient.appointment.map((apt) => ({
      id: apt.id,
      date: apt.appointmentDate.toISOString().split("T")[0],
      time: apt.appointmentDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      doctorId: apt.doctorId,
      status: apt.status,
      doctorName: apt.doctor
        ? `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}`
        : "Unknown",
      specialization: apt.doctor?.specialization || "General Practitioner",
    }));

    const prescriptions = patient.prescriptions.map((rx) => ({
      id: rx.id,
      medicationName: rx.medication,
      dosage: rx.dosage || "N/A",
      frequency: rx.frequency || "As directed",
      doctor: rx.doctor
        ? `Dr. ${rx.doctor.firstName} ${rx.doctor.lastName}`
        : "Unknown",
    }));

    const labResults = patient.labResults.map((lab) => ({
      id: lab.id,
      testName: lab.type,
      testDate: lab.collectedAt
        ? lab.collectedAt.toISOString().split("T")[0]
        : lab.reportedAt.toISOString().split("T")[0],
      status: "completed",
      result: lab.result,
    }));

    const bills = patient.billings.map((bill) => ({
      id: bill.id,
      description: bill.description || "Medical Service",
      amount: bill.amount,
      dueDate: bill.issuedAt.toISOString().split("T")[0],
    }));

    return NextResponse.json({
      patientLastName: patient.lastName,
      upcomingAppointments: appointments,
      activePrescriptions: prescriptions,
      recentLabResults: labResults,
      pendingBills: bills,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
