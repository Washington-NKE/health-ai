import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (
      !session ||
      (session.user?.role !== "admin" && session.user?.role !== "staff")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { type, format, dateRange } = await request.json();

    // Calculate date range
    const getDateRange = (range: string) => {
      const now = new Date();
      const ranges: Record<string, Date> = {
        week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        quarter: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        year: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
        all: new Date(0),
      };
      return ranges[range] || ranges.month;
    };

    const startDate = getDateRange(dateRange);

    // Generate report data based on type
    let reportData: any = {
      generatedAt: new Date().toISOString(),
      type,
      dateRange,
      startDate: startDate.toISOString(),
    };

    switch (type) {
      case "overview":
      case "System Overview":
        const [totalPatients, totalDoctors, totalAppointments, totalBillings] =
          await Promise.all([
            prisma.patient.count(),
            prisma.doctor.count(),
            prisma.appointment.count({
              where: { appointmentDate: { gte: startDate } },
            }),
            prisma.billing.aggregate({
              where: { issuedAt: { gte: startDate } },
              _sum: { amount: true },
              _count: true,
            }),
          ]);

        reportData = {
          ...reportData,
          summary: {
            totalPatients,
            totalDoctors,
            totalAppointments,
            totalRevenue: totalBillings._sum.amount || 0,
            totalBillings: totalBillings._count,
          },
        };
        break;

      case "patients":
      case "Patient Analytics":
        const patients = await prisma.patient.findMany({
          where: { user: { createdAt: { gte: startDate } } },
          include: {
            user: { select: { email: true, createdAt: true } },
            _count: { select: { appointment: true } },
          },
        });
        reportData.patients = patients;
        reportData.totalPatients = patients.length;
        break;

      case "appointments":
      case "Appointment Report":
        const appointments = await prisma.appointment.findMany({
          where: { appointmentDate: { gte: startDate } },
          include: {
            patient: { select: { firstName: true, lastName: true } },
            doctor: {
              select: { firstName: true, lastName: true, specialization: true },
            },
          },
          orderBy: { appointmentDate: "desc" },
        });
        reportData.appointments = appointments;
        reportData.totalAppointments = appointments.length;
        reportData.statusBreakdown = appointments.reduce((acc: any, apt) => {
          acc[apt.status] = (acc[apt.status] || 0) + 1;
          return acc;
        }, {});
        break;

      case "revenue":
      case "Revenue Analysis":
        const billings = await prisma.billing.findMany({
          where: { issuedAt: { gte: startDate } },
          include: {
            patient: { select: { firstName: true, lastName: true } },
          },
          orderBy: { issuedAt: "desc" },
        });
        reportData.billings = billings;
        reportData.totalRevenue = billings.reduce(
          (sum, b) => sum + (b.amount || 0),
          0,
        );
        reportData.paidRevenue = billings
          .filter((b) => b.status === "paid")
          .reduce((sum, b) => sum + (b.amount || 0), 0);
        reportData.pendingRevenue = billings
          .filter((b) => b.status === "pending")
          .reduce((sum, b) => sum + (b.amount || 0), 0);
        break;

      case "doctors":
      case "Doctor Performance":
        const doctors = await prisma.doctor.findMany({
          include: {
            user: { select: { email: true } },
            _count: { select: { appointment: true } },
            appointment: {
              where: { appointmentDate: { gte: startDate } },
              select: { status: true },
            },
          },
        });
        reportData.doctors = doctors.map((d) => ({
          id: d.id,
          name: `${d.firstName} ${d.lastName}`,
          specialization: d.specialization,
          totalAppointments: d._count.appointment,
          recentAppointments: d.appointment.length,
          consultationFee: d.consultationFee,
          isAvailable: d.isAvailable,
        }));
        break;

      case "prescriptions":
      case "Prescription Report":
        const prescriptions = await prisma.prescription.findMany({
          where: { issuedAt: { gte: startDate } },
          include: {
            patient: { select: { firstName: true, lastName: true } },
            doctor: { select: { firstName: true, lastName: true } },
          },
          orderBy: { issuedAt: "desc" },
        });
        reportData.prescriptions = prescriptions;
        reportData.totalPrescriptions = prescriptions.length;
        break;

      default:
        reportData.message = "Report type not fully implemented";
    }

    // Generate file based on format
    if (format === "csv") {
      const csv = generateCSV(reportData, type);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${type.replace(/\s+/g, "-")}-${dateRange}-report.csv"`,
        },
      });
    }

    if (format === "excel" || format === "pdf") {
      const json = JSON.stringify(reportData, null, 2);
      return new NextResponse(json, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="${type.replace(/\s+/g, "-")}-${dateRange}-report.json"`,
        },
      });
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  } catch (error) {
    console.error("Failed to generate report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 },
    );
  }
}

function generateCSV(data: any, type: string): string {
  let csv = "";

  // Add report header
  csv += `Report Type: ${type}\n`;
  csv += `Generated: ${new Date(data.generatedAt).toLocaleString()}\n`;
  csv += `Date Range: ${data.dateRange}\n`;
  csv += `\n`;

  // Generate CSV based on data type
  if (data.patients && Array.isArray(data.patients)) {
    csv += "Patient Report\n";
    csv += "ID,First Name,Last Name,Email,Total Appointments,Created At\n";
    data.patients.forEach((p: any) => {
      csv += `${p.id},"${p.firstName}","${p.lastName}","${p.user.email}",${p._count.appointment},"${new Date(p.user.createdAt).toLocaleDateString()}"\n`;
    });
  } else if (data.appointments && Array.isArray(data.appointments)) {
    csv += "Appointment Report\n";
    csv += "ID,Patient,Doctor,Date,Time,Status,Duration (min),Notes\n";
    data.appointments.forEach((apt: any) => {
      const date = new Date(apt.appointmentDate);
      csv += `${apt.id},"${apt.patient.firstName} ${apt.patient.lastName}","Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}","${date.toLocaleDateString()}","${date.toLocaleTimeString()}","${apt.status}",${apt.durationMinutes},"${apt.notes || ""}"\n`;
    });
  } else if (data.billings && Array.isArray(data.billings)) {
    csv += "Revenue Report\n";
    csv += "ID,Patient,Amount,Currency,Status,Description,Issued At,Paid At\n";
    data.billings.forEach((b: any) => {
      csv += `${b.id},"${b.patient.firstName} ${b.patient.lastName}",${b.amount},"${b.currency}","${b.status}","${b.description || ""}","${new Date(b.issuedAt).toLocaleDateString()}","${b.paidAt ? new Date(b.paidAt).toLocaleDateString() : "N/A"}"\n`;
    });
  } else if (data.doctors && Array.isArray(data.doctors)) {
    csv += "Doctor Performance Report\n";
    csv +=
      "ID,Name,Specialization,Total Appointments,Recent Appointments,Consultation Fee,Available\n";
    data.doctors.forEach((d: any) => {
      csv += `${d.id},"${d.name}","${d.specialization}",${d.totalAppointments},${d.recentAppointments},${d.consultationFee || "N/A"},${d.isAvailable}\n`;
    });
  } else if (data.prescriptions && Array.isArray(data.prescriptions)) {
    csv += "Prescription Report\n";
    csv +=
      "ID,Patient,Doctor,Medication,Dosage,Frequency,Instructions,Issued At,Expires At\n";
    data.prescriptions.forEach((p: any) => {
      csv += `${p.id},"${p.patient.firstName} ${p.patient.lastName}","Dr. ${p.doctor.firstName} ${p.doctor.lastName}","${p.medication}","${p.dosage || ""}","${p.frequency || ""}","${p.instructions || ""}","${new Date(p.issuedAt).toLocaleDateString()}","${p.expiresAt ? new Date(p.expiresAt).toLocaleDateString() : "N/A"}"\n`;
    });
  } else if (data.summary) {
    csv += "System Overview\n";
    csv += "Metric,Value\n";
    csv += `Total Patients,${data.summary.totalPatients}\n`;
    csv += `Total Doctors,${data.summary.totalDoctors}\n`;
    csv += `Total Appointments,${data.summary.totalAppointments}\n`;
    csv += `Total Revenue,${data.summary.totalRevenue}\n`;
    csv += `Total Billings,${data.summary.totalBillings}\n`;
  } else {
    csv += "No data available for this report type\n";
  }

  return csv;
}
