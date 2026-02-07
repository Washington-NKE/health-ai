"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
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
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/protected-route";
import {
  Calendar,
  Clock,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
}

interface Appointment {
  id: string;
  appointmentDate: string;
  durationMinutes: number;
  status: string;
  reason?: string;
  notes: string;
  location: string;
  appointmentType: string;
  doctor: Doctor;
  patient: Patient;
  doctorId: string;
  patientId: string;
}

type AppointmentDraft = Pick<
  Appointment,
  | "appointmentDate"
  | "durationMinutes"
  | "reason"
  | "status"
  | "notes"
  | "location"
  | "appointmentType"
  | "doctorId"
  | "patientId"
>;

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  scheduled: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-orange-100 text-orange-800",
};

export default function AdminAppointmentsPage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AppointmentDraft>({
    appointmentDate: "",
    durationMinutes: 30,
    reason: "",
    status: "pending",
    notes: "",
    location: "Main Clinic",
    appointmentType: "general",
    doctorId: "",
    patientId: "",
  });
  const [savingId, setSavingId] = useState<string | null>(null);

  const toDateTimeLocal = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate(),
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const startEdit = (appointment: Appointment) => {
    setEditingId(appointment.id);
    setDraft({
      appointmentDate: toDateTimeLocal(appointment.appointmentDate),
      durationMinutes: appointment.durationMinutes,
      reason: appointment.reason || "",
      status: appointment.status,
      notes: appointment.notes || "",
      location: appointment.location || "Main Clinic",
      appointmentType: appointment.appointmentType || "general",
      doctorId: appointment.doctorId || appointment.doctor.id,
      patientId: appointment.patientId || appointment.patient.id,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({
      appointmentDate: "",
      durationMinutes: 30,
      reason: "",
      status: "pending",
      notes: "",
      location: "Main Clinic",
      appointmentType: "general",
      doctorId: "",
      patientId: "",
    });
  };

  const saveEdit = async (appointmentId: string) => {
    try {
      setSavingId(appointmentId);
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentDate: new Date(draft.appointmentDate).toISOString(),
          durationMinutes: Number(draft.durationMinutes),
          reason: draft.reason?.trim() || undefined,
          status: draft.status,
          notes: draft.notes?.trim() || "",
          location: draft.location?.trim() || "Main Clinic",
          appointmentType: draft.appointmentType?.trim() || "general",
          doctorId: draft.doctorId,
          patientId: draft.patientId,
        }),
      });

      if (!response.ok) throw new Error("Failed to update appointment");
      await fetchAppointments();
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSavingId(null);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchPatients();
  }, [session]);

  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/doctors");
      if (!response.ok) throw new Error("Failed to fetch doctors");
      const data = await response.json();
      setDoctors(data.doctors || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch doctors");
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch("/api/patients");
      if (!response.ok) throw new Error("Failed to fetch patients");
      const data = await response.json();
      setPatients(data.patients || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch patients");
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/appointments");
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
    const matchesFilter = filter === "all" || apt.status === filter;
    const matchesSearch =
      apt.patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleStatusChange = async (
    appointmentId: string,
    newStatus: string,
  ) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update appointment");
      await fetchAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete appointment");
      await fetchAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin", "staff"]}>
      <div className="min-h-screen bg-secondary/30">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold">Appointment Management</h1>
              <p className="text-muted-foreground mt-1">
                View and manage all appointments
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search by patient or doctor name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
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
                    No appointments found
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => {
                  const isEditing = editingId === appointment.id;

                  return (
                    <Card key={appointment.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>
                              {appointment.patient.firstName}{" "}
                              {appointment.patient.lastName} with Dr.{" "}
                              {appointment.doctor.firstName}{" "}
                              {appointment.doctor.lastName}
                            </CardTitle>
                            <CardDescription>
                              {appointment.doctor.specialization}
                              {appointment.reason && ` • ${appointment.reason}`}
                            </CardDescription>
                          </div>
                          <Badge
                            className={
                              statusColors[
                                isEditing ? draft.status : appointment.status
                              ]
                            }
                          >
                            {isEditing ? draft.status : appointment.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid sm:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Date & Time
                            </p>
                            {isEditing ? (
                              <Input
                                type="datetime-local"
                                value={draft.appointmentDate}
                                onChange={(e) =>
                                  setDraft((d) => ({
                                    ...d,
                                    appointmentDate: e.target.value,
                                  }))
                                }
                              />
                            ) : (
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
                            )}
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">
                              Duration
                            </p>
                            {isEditing ? (
                              <Input
                                type="number"
                                min={5}
                                step={5}
                                value={draft.durationMinutes}
                                onChange={(e) =>
                                  setDraft((d) => ({
                                    ...d,
                                    durationMinutes: Number(e.target.value),
                                  }))
                                }
                              />
                            ) : (
                              <p className="font-semibold">
                                {appointment.durationMinutes} minutes
                              </p>
                            )}
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">
                              Status
                            </p>
                            {isEditing ? (
                              <Select
                                value={draft.status}
                                onValueChange={(status) =>
                                  setDraft((d) => ({ ...d, status }))
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">
                                    Pending
                                  </SelectItem>
                                  <SelectItem value="scheduled">
                                    Scheduled
                                  </SelectItem>
                                  <SelectItem value="confirmed">
                                    Confirmed
                                  </SelectItem>
                                  <SelectItem value="completed">
                                    Completed
                                  </SelectItem>
                                  <SelectItem value="cancelled">
                                    Cancelled
                                  </SelectItem>
                                  <SelectItem value="no_show">
                                    No Show
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Select
                                value={appointment.status}
                                onValueChange={(newStatus) =>
                                  handleStatusChange(appointment.id, newStatus)
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">
                                    Pending
                                  </SelectItem>
                                  <SelectItem value="scheduled">
                                    Scheduled
                                  </SelectItem>
                                  <SelectItem value="confirmed">
                                    Confirmed
                                  </SelectItem>
                                  <SelectItem value="completed">
                                    Completed
                                  </SelectItem>
                                  <SelectItem value="cancelled">
                                    Cancelled
                                  </SelectItem>
                                  <SelectItem value="no_show">
                                    No Show
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Doctor
                            </p>
                            {isEditing ? (
                              <Select
                                value={draft.doctorId}
                                onValueChange={(doctorId) =>
                                  setDraft((d) => ({ ...d, doctorId }))
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {doctors.map((doc) => (
                                    <SelectItem key={doc.id} value={doc.id}>
                                      Dr. {doc.firstName} {doc.lastName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <p className="font-semibold">
                                Dr. {appointment.doctor.firstName}{" "}
                                {appointment.doctor.lastName}
                              </p>
                            )}
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">
                              Patient
                            </p>
                            {isEditing ? (
                              <Select
                                value={draft.patientId}
                                onValueChange={(patientId) =>
                                  setDraft((d) => ({ ...d, patientId }))
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {patients.map((pat) => (
                                    <SelectItem key={pat.id} value={pat.id}>
                                      {pat.firstName} {pat.lastName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <p className="font-semibold">
                                {appointment.patient.firstName}{" "}
                                {appointment.patient.lastName}
                              </p>
                            )}
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">
                              Appointment Type
                            </p>
                            {isEditing ? (
                              <Input
                                value={draft.appointmentType}
                                onChange={(e) =>
                                  setDraft((d) => ({
                                    ...d,
                                    appointmentType: e.target.value,
                                  }))
                                }
                              />
                            ) : (
                              <p className="font-semibold">
                                {appointment.appointmentType}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Location
                            </p>
                            {isEditing ? (
                              <Input
                                value={draft.location}
                                onChange={(e) =>
                                  setDraft((d) => ({
                                    ...d,
                                    location: e.target.value,
                                  }))
                                }
                              />
                            ) : (
                              <p className="font-semibold">
                                {appointment.location}
                              </p>
                            )}
                          </div>

                          <div className="sm:col-span-2">
                            <p className="text-sm text-muted-foreground">
                              Notes
                            </p>
                            {isEditing ? (
                              <Input
                                value={draft.notes}
                                onChange={(e) =>
                                  setDraft((d) => ({
                                    ...d,
                                    notes: e.target.value,
                                  }))
                                }
                              />
                            ) : (
                              <p className="font-semibold">
                                {appointment.notes || "—"}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {isEditing ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => saveEdit(appointment.id)}
                                disabled={savingId === appointment.id}
                              >
                                {savingId === appointment.id
                                  ? "Saving..."
                                  : "Save"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={cancelEdit}
                                disabled={savingId === appointment.id}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(appointment)}
                            >
                              Edit
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDeleteAppointment(appointment.id)
                            }
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
