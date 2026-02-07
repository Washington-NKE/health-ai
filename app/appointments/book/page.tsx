"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useDoctors } from "@/hooks/use-doctors";
import { ProtectedRoute } from "@/components/protected-route";

interface BookingFormData {
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes: string;
  reason: string;
  notes: string;
}

export default function BookAppointmentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { doctors, loading: doctorsLoading } = useDoctors();
  const [formData, setFormData] = useState<BookingFormData>({
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    durationMinutes: "30",
    reason: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (
        !formData.doctorId ||
        !formData.appointmentDate ||
        !formData.appointmentTime
      ) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      // Combine date and time into ISO datetime
      const appointmentDateTime = new Date(
        `${formData.appointmentDate}T${formData.appointmentTime}`,
      );

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId: formData.doctorId,
          appointmentDate: appointmentDateTime.toISOString(),
          durationMinutes: parseInt(formData.durationMinutes),
          reason: formData.reason || undefined,
          notes: formData.notes || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to book appointment");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/appointments");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <div className="min-h-screen bg-secondary/30">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Book an Appointment</h1>
              <p className="text-muted-foreground mt-2">
                Schedule a consultation with one of our doctors
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Appointment Details</CardTitle>
                <CardDescription>
                  Please provide your appointment preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                {success && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    Appointment booked successfully! Redirecting...
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="doctorId">
                      Select Doctor <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.doctorId}
                      onValueChange={(value) =>
                        handleSelectChange("doctorId", value)
                      }
                      disabled={doctorsLoading}
                    >
                      <SelectTrigger id="doctorId">
                        <SelectValue placeholder="Choose a doctor..." />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.firstName} {doctor.lastName} -{" "}
                            {doctor.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="appointmentDate">
                        Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="appointmentDate"
                        name="appointmentDate"
                        type="date"
                        value={formData.appointmentDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="appointmentTime">
                        Time <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="appointmentTime"
                        name="appointmentTime"
                        type="time"
                        value={formData.appointmentTime}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                    <Select
                      value={formData.durationMinutes}
                      onValueChange={(value) =>
                        handleSelectChange("durationMinutes", value)
                      }
                    >
                      <SelectTrigger id="durationMinutes">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Visit</Label>
                    <Input
                      id="reason"
                      name="reason"
                      placeholder="e.g., Regular checkup, Consultation"
                      value={formData.reason}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Any additional information for the doctor..."
                      value={formData.notes}
                      onChange={handleChange}
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={loading || doctorsLoading}
                      className="flex-1"
                    >
                      {loading ? "Booking..." : "Book Appointment"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
