"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/protected-route";

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
}

interface Appointment {
  id: string;
  appointmentDate: string;
  durationMinutes: number;
  status: string;
  reason?: string;
  doctor: Doctor;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  scheduled: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-orange-100 text-orange-800",
};

export default function AppointmentsPage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchAppointments();
  }, [session]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/appointments?role=patient&userId=${session?.user?.id}`,
      );
      if (!response.ok) throw new Error("Failed to fetch appointments");
      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === "all") return true;
    return apt.status === filter;
  });

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (!response.ok) throw new Error("Failed to cancel appointment");
      await fetchAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <div className="min-h-screen bg-secondary/30">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">My Appointments</h1>
                <p className="text-muted-foreground mt-1">
                  View and manage your scheduled appointments
                </p>
              </div>
              <Button asChild>
                <Link href="/appointments/book">Book New Appointment</Link>
              </Button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Appointments</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading appointments...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    {filter === "all"
                      ? "No appointments scheduled yet"
                      : `No ${filter} appointments`}
                  </p>
                  <div className="mt-4 text-center">
                    <Button asChild variant="outline">
                      <Link href="/appointments/book">
                        Book your first appointment
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>
                            Dr. {appointment.doctor.firstName}{" "}
                            {appointment.doctor.lastName}
                          </CardTitle>
                          <CardDescription>
                            {appointment.doctor.specialization}
                          </CardDescription>
                        </div>
                        <Badge className={statusColors[appointment.status]}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Date & Time
                          </p>
                          <p className="font-semibold">
                            {new Date(
                              appointment.appointmentDate,
                            ).toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            at{" "}
                            {new Date(
                              appointment.appointmentDate,
                            ).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Duration
                          </p>
                          <p className="font-semibold">
                            {appointment.durationMinutes} minutes
                          </p>
                        </div>
                        {appointment.reason && (
                          <div className="sm:col-span-2">
                            <p className="text-sm text-muted-foreground">
                              Reason
                            </p>
                            <p className="font-semibold">
                              {appointment.reason}
                            </p>
                          </div>
                        )}
                      </div>

                      {(appointment.status === "pending" ||
                        appointment.status === "scheduled") && (
                        <div className="mt-4 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleCancelAppointment(appointment.id)
                            }
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
