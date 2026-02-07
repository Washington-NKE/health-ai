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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
  Tooltip,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Billing {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  issuedAt: string;
  paidAt?: string;
  patient: {
    firstName: string;
    lastName: string;
  };
}

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6b7280"];

export default function AdminBillingPage() {
  const [billings, setBillings] = useState<Billing[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchBillings();
  }, []);

  const fetchBillings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/billings");
      if (!response.ok) throw new Error("Failed to fetch billings");
      const data = await response.json();
      setBillings(data.billings || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch billing data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (billingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/billings/${billingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update billing");

      toast({
        title: "Success",
        description: "Billing status updated successfully",
      });
      fetchBillings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update billing status",
        variant: "destructive",
      });
    }
  };

  const filteredBillings = billings.filter(
    (b) => statusFilter === "all" || b.status === statusFilter,
  );

  // Calculate statistics
  const totalRevenue = billings.reduce((sum, b) => sum + b.amount, 0);
  const paidRevenue = billings
    .filter((b) => b.status === "paid")
    .reduce((sum, b) => sum + b.amount, 0);
  const pendingRevenue = billings
    .filter((b) => b.status === "pending")
    .reduce((sum, b) => sum + b.amount, 0);
  const refundedAmount = billings
    .filter((b) => b.status === "refunded")
    .reduce((sum, b) => sum + b.amount, 0);

  // Group by status for chart
  const statusData = [
    {
      name: "Paid",
      value: billings.filter((b) => b.status === "paid").length,
      amount: paidRevenue,
    },
    {
      name: "Pending",
      value: billings.filter((b) => b.status === "pending").length,
      amount: pendingRevenue,
    },
    {
      name: "Refunded",
      value: billings.filter((b) => b.status === "refunded").length,
      amount: refundedAmount,
    },
    {
      name: "Cancelled",
      value: billings.filter((b) => b.status === "cancelled").length,
      amount: 0,
    },
  ];

  // Revenue over time (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentBillings = billings.filter(
    (b) => new Date(b.issuedAt) >= thirtyDaysAgo,
  );

  const revenueByDay = recentBillings.reduce(
    (acc: { [key: string]: number }, billing) => {
      const date = new Date(billing.issuedAt).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + billing.amount;
      return acc;
    },
    {},
  );

  const revenueTimelineData = Object.entries(revenueByDay)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      refunded: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const collectionRate =
    totalRevenue > 0 ? ((paidRevenue / totalRevenue) * 100).toFixed(1) : 0;

  return (
    <ProtectedRoute allowedRoles={["admin", "staff"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <DollarSign className="h-8 w-8 text-green-600" />
                Billing Management
              </h1>
              <p className="text-slate-600 mt-1">
                Revenue analytics and billing oversight
              </p>
            </div>

            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign className="h-6 w-6" />
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div className="text-2xl font-bold">
                      ${paidRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm opacity-90">Collected Revenue</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <Receipt className="h-6 w-6" />
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div className="text-2xl font-bold">
                      ${pendingRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm opacity-90">Pending Revenue</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="h-6 w-6" />
                      <span className="text-lg font-semibold">
                        {collectionRate}%
                      </span>
                    </div>
                    <div className="text-2xl font-bold">Collection Rate</div>
                    <div className="text-sm opacity-90">Of total revenue</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <Receipt className="h-6 w-6" />
                      <span className="text-lg font-semibold">
                        {billings.length}
                      </span>
                    </div>
                    <div className="text-2xl font-bold">Total Invoices</div>
                    <div className="text-sm opacity-90">All time</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue by Status */}
              <Card className="border-slate-200 shadow-lg">
                <CardHeader>
                  <CardTitle>Revenue by Status</CardTitle>
                  <CardDescription>
                    Distribution of billing amounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="amount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry) =>
                          `${entry.name}: $${entry.amount.toLocaleString()}`
                        }
                      >
                        {statusData.map((entry, index) => (
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

              {/* Revenue Timeline */}
              <Card className="border-slate-200 shadow-lg">
                <CardHeader>
                  <CardTitle>Revenue Timeline (30 Days)</CardTitle>
                  <CardDescription>Daily revenue trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueTimelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Billings Table */}
            <Card className="border-slate-200 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Billings</CardTitle>
                    <CardDescription>
                      Manage and track billing records
                    </CardDescription>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-slate-600 mt-2">Loading billings...</p>
                  </div>
                ) : filteredBillings.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No billings found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Issued</TableHead>
                          <TableHead>Paid</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBillings.map((billing) => (
                          <TableRow key={billing.id}>
                            <TableCell className="font-medium">
                              {billing.patient.firstName}{" "}
                              {billing.patient.lastName}
                            </TableCell>
                            <TableCell>
                              {billing.description || "N/A"}
                            </TableCell>
                            <TableCell className="font-semibold text-green-600">
                              ${billing.amount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusBadge(billing.status)}>
                                {billing.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(billing.issuedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {billing.paidAt
                                ? new Date(billing.paidAt).toLocaleDateString()
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Select
                                value={billing.status}
                                onValueChange={(newStatus) =>
                                  handleStatusChange(billing.id, newStatus)
                                }
                              >
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">
                                    Pending
                                  </SelectItem>
                                  <SelectItem value="paid">Paid</SelectItem>
                                  <SelectItem value="refunded">
                                    Refunded
                                  </SelectItem>
                                  <SelectItem value="cancelled">
                                    Cancelled
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
