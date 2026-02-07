import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Get counts
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      totalStaff,
      pendingAppointments,
      completedAppointments,
      totalBillings,
      paidBillings,
      pendingBillings,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.appointment.count(),
      prisma.staff.count(),
      prisma.appointment.count({ where: { status: "pending" } }),
      prisma.appointment.count({ where: { status: "completed" } }),
      prisma.billing.count(),
      prisma.billing.count({ where: { status: "paid" } }),
      prisma.billing.count({ where: { status: "pending" } }),
    ]);

    // Get revenue stats
    const revenueStats = await prisma.billing.groupBy({
      by: ["status"],
      _sum: {
        amount: true,
      },
    });

    const totalRevenue = revenueStats.reduce(
      (sum, item) => sum + (item._sum.amount || 0),
      0,
    );
    const paidRevenue =
      revenueStats.find((item) => item.status === "paid")?._sum.amount || 0;

    // Get appointment stats by status
    const appointmentsByStatus = await prisma.appointment.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    // Get recent appointments (last 30 days grouped by date)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAppointments = await prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        appointmentDate: true,
      },
    });

    // Group appointments by date
    const appointmentsByDate = recentAppointments.reduce(
      (acc: { [key: string]: number }, apt) => {
        const date = new Date(apt.appointmentDate).toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {},
    );

    // Get revenue over last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentBillings = await prisma.billing.findMany({
      where: {
        issuedAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        issuedAt: true,
        amount: true,
        status: true,
      },
    });

    // Group billings by month
    const revenueByMonth = recentBillings.reduce(
      (acc: { [key: string]: number }, billing) => {
        const month = new Date(billing.issuedAt).toISOString().substring(0, 7); // YYYY-MM
        acc[month] = (acc[month] || 0) + billing.amount;
        return acc;
      },
      {},
    );

    // Get top doctors by appointment count
    const topDoctors = await prisma.doctor.findMany({
      include: {
        _count: {
          select: { appointment: true },
        },
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        appointment: {
          _count: "desc",
        },
      },
      take: 5,
    });

    // Get prescription count
    const totalPrescriptions = await prisma.prescription.count();

    // Get lab results count
    const totalLabResults = await prisma.labResult.count();

    return NextResponse.json({
      overview: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        totalStaff,
        totalPrescriptions,
        totalLabResults,
        pendingAppointments,
        completedAppointments,
        totalBillings,
        paidBillings,
        pendingBillings,
        totalRevenue,
        paidRevenue,
      },
      appointmentsByStatus: appointmentsByStatus.map((item) => ({
        status: item.status,
        count: item._count.id,
      })),
      appointmentsByDate: Object.entries(appointmentsByDate).map(
        ([date, count]) => ({ date, count }),
      ),
      revenueByMonth: Object.entries(revenueByMonth).map(([month, amount]) => ({
        month,
        amount,
      })),
      topDoctors: topDoctors.map((doctor) => ({
        id: doctor.id,
        name: `${doctor.firstName} ${doctor.lastName}`,
        specialization: doctor.specialization,
        appointmentCount: doctor._count.appointment,
      })),
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 },
    );
  }
}
