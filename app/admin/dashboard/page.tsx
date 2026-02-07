"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import {
  Users,
  UserCog,
  Calendar,
  DollarSign,
  Activity,
  FileText,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

interface Stats {
  overview: {
    totalPatients: number;
    totalDoctors: number;
    totalAppointments: number;
    totalStaff: number;
    totalPrescriptions: number;
    totalLabResults: number;
    pendingAppointments: number;
    completedAppointments: number;
    totalBillings: number;
    paidBillings: number;
    pendingBillings: number;
    totalRevenue: number;
    paidRevenue: number;
  };
  appointmentsByStatus: Array<{ status: string; count: number }>;
  appointmentsByDate: Array<{ date: string; count: number }>;
  revenueByMonth: Array<{ month: string; amount: number }>;
  topDoctors: Array<{
    id: string;
    name: string;
    specialization: string;
    appointmentCount: number;
  }>;
}

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/stats");
      if (!response.ok) throw new Error("Failed to fetch statistics");
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin", "staff"]}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !stats) {
    return (
      <ProtectedRoute allowedRoles={["admin", "staff"]}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
          <Card className="max-w-2xl mx-auto border-red-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <CardTitle className="text-red-700">
                  Error Loading Dashboard
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">
                {error || "Failed to load statistics"}
              </p>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  const statCards = [
    {
      title: "Total Patients",
      value: stats.overview.totalPatients,
      icon: Users,
      color: "bg-blue-500",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Total Doctors",
      value: stats.overview.totalDoctors,
      icon: UserCog,
      color: "bg-green-500",
      gradient: "from-green-500 to-green-600",
    },
    {
      title: "Appointments",
      value: stats.overview.totalAppointments,
      icon: Calendar,
      color: "bg-purple-500",
      gradient: "from-purple-500 to-purple-600",
      subtitle: `${stats.overview.pendingAppointments} pending`,
    },
    {
      title: "Total Revenue",
      value: `$${stats.overview.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-emerald-500",
      gradient: "from-emerald-500 to-emerald-600",
      subtitle: `$${stats.overview.paidRevenue.toLocaleString()} paid`,
    },
    {
      title: "Prescriptions",
      value: stats.overview.totalPrescriptions,
      icon: FileText,
      color: "bg-orange-500",
      gradient: "from-orange-500 to-orange-600",
    },
    {
      title: "Lab Results",
      value: stats.overview.totalLabResults,
      icon: Activity,
      color: "bg-pink-500",
      gradient: "from-pink-500 to-pink-600",
    },
  ];

  return (
    <ProtectedRoute allowedRoles={["admin", "staff"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-slate-600 mt-2">
                  Overview of system analytics and metrics
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-blue-600" />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {statCards.map((stat, index) => (
                <Card
                  key={index}
                  className="overflow-hidden hover:shadow-lg transition-all hover:scale-105 border-slate-200"
                >
                  <CardContent className="p-0">
                    <div
                      className={`bg-gradient-to-r ${stat.gradient} p-6 text-white`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <stat.icon className="h-8 w-8 opacity-90" />
                        <div className="text-3xl font-bold">{stat.value}</div>
                      </div>
                      <div className="text-sm font-medium opacity-90">
                        {stat.title}
                      </div>
                      {stat.subtitle && (
                        <div className="text-xs mt-1 opacity-75">
                          {stat.subtitle}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Appointments by Status */}
              <Card className="border-slate-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Appointments by Status
                  </CardTitle>
                  <CardDescription>
                    Distribution of appointment statuses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.appointmentsByStatus}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry) => `${entry.status}: ${entry.count}`}
                      >
                        {stats.appointmentsByStatus.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Revenue by Month */}
              <Card className="border-slate-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    Revenue Trend (6 Months)
                  </CardTitle>
                  <CardDescription>Monthly revenue overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.revenueByMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="amount"
                        fill="#10b981"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Appointments Timeline */}
              <Card className="border-slate-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-600" />
                    Appointments Timeline (30 Days)
                  </CardTitle>
                  <CardDescription>Daily appointment trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.appointmentsByDate}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Doctors */}
              <Card className="border-slate-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCog className="h-5 w-5 text-blue-600" />
                    Top Performing Doctors
                  </CardTitle>
                  <CardDescription>By appointment count</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.topDoctors.map((doctor, index) => (
                      <div
                        key={doctor.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">
                              {doctor.name}
                            </div>
                            <div className="text-sm text-slate-500">
                              {doctor.specialization}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-blue-600">
                            {doctor.appointmentCount}
                          </div>
                          <div className="text-xs text-slate-500">
                            appointments
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
