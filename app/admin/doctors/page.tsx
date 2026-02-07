"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  Stethoscope,
} from "lucide-react";

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  licenseNumber: string;
  department: string;
  consultationFee: number;
  bio: string;
  isAvailable: boolean;
  user: {
    email: string;
    phone: string | null;
    isActive: boolean;
  };
}

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    specialization: "",
    licenseNumber: "",
    department: "",
    consultationFee: "50",
    bio: "",
    password: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const query = searchTerm
        ? `?search=${encodeURIComponent(searchTerm)}`
        : "";
      const response = await fetch(`/api/admin/doctors${query}`);
      if (!response.ok) throw new Error("Failed to fetch doctors");
      const data = await response.json();
      setDoctors(data.doctors);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load doctors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctors();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleOpenDialog = (doctor?: Doctor) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData({
        email: doctor.user.email,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        phone: doctor.user.phone || "",
        specialization: doctor.specialization,
        licenseNumber: doctor.licenseNumber,
        department: doctor.department,
        consultationFee: doctor.consultationFee.toString(),
        bio: doctor.bio,
        password: "",
      });
    } else {
      setEditingDoctor(null);
      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        specialization: "",
        licenseNumber: "",
        department: "",
        consultationFee: "50",
        bio: "",
        password: "",
      });
    }
    setOpenDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.specialization
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!editingDoctor && !formData.password) {
      toast({
        title: "Error",
        description: "Password is required for new doctors",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingDoctor) {
        // Update doctor
        const response = await fetch(`/api/admin/doctors/${editingDoctor.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone || undefined,
            specialization: formData.specialization,
            licenseNumber: formData.licenseNumber,
            department: formData.department,
            consultationFee: formData.consultationFee,
            bio: formData.bio,
          }),
        });
        if (!response.ok) throw new Error("Failed to update doctor");
        toast({
          title: "Success",
          description: "Doctor updated successfully",
        });
      } else {
        // Create new doctor
        const response = await fetch("/api/admin/doctors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            phone: formData.phone || undefined,
          }),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create doctor");
        }
        toast({
          title: "Success",
          description: "Doctor created successfully",
        });
      }
      setOpenDialog(false);
      fetchDoctors();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this doctor? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/doctors/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete doctor");
      toast({
        title: "Success",
        description: "Doctor deleted successfully",
      });
      fetchDoctors();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete doctor",
        variant: "destructive",
      });
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <main className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Stethoscope className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Doctors</h1>
                  <p className="text-slate-600">
                    Manage hospital doctors and medical staff
                  </p>
                </div>
              </div>
            </div>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Register Doctor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingDoctor ? "Edit Doctor" : "Register New Doctor"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingDoctor
                      ? "Update doctor information"
                      : "Add a new doctor to the system"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        First Name *
                      </label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        Last Name *
                      </label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+1-234-567-8900"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Email *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="doctor@hospital.com"
                      disabled={!!editingDoctor}
                    />
                  </div>

                  {!editingDoctor && (
                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        Password *
                      </label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="••••••••"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Specialization *
                    </label>
                    <Input
                      value={formData.specialization}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specialization: e.target.value,
                        })
                      }
                      placeholder="Cardiology"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        License Number
                      </label>
                      <Input
                        value={formData.licenseNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            licenseNumber: e.target.value,
                          })
                        }
                        placeholder="LIC-123456"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        Consultation Fee ($)
                      </label>
                      <Input
                        type="number"
                        value={formData.consultationFee}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            consultationFee: e.target.value,
                          })
                        }
                        placeholder="50"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Department
                    </label>
                    <Input
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      placeholder="Cardiology Department"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      placeholder="Briefly describe the doctor's qualifications..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    {editingDoctor ? "Update Doctor" : "Register Doctor"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email, or specialization..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Doctors List */}
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </CardContent>
            </Card>
          ) : doctors.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-slate-300 mb-3" />
                <p className="text-slate-500">No doctors found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {doctors.map((doctor) => (
                <Card
                  key={doctor.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            Dr. {doctor.firstName} {doctor.lastName}
                          </h3>
                          <Badge
                            variant={
                              doctor.isAvailable ? "default" : "secondary"
                            }
                          >
                            {doctor.isAvailable ? "Available" : "Unavailable"}
                          </Badge>
                          {doctor.user.isActive ? (
                            <Badge
                              variant="outline"
                              className="border-green-300 bg-green-50 text-green-700"
                            >
                              Active
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-red-300 bg-red-50 text-red-700"
                            >
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                          <div>
                            <span className="font-medium text-slate-700">
                              Specialization:
                            </span>{" "}
                            {doctor.specialization}
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">
                              Department:
                            </span>{" "}
                            {doctor.department || "N/A"}
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">
                              Email:
                            </span>{" "}
                            {doctor.user.email}
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">
                              Phone:
                            </span>{" "}
                            {doctor.user.phone || "N/A"}
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">
                              License:
                            </span>{" "}
                            {doctor.licenseNumber || "N/A"}
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">
                              Consultation Fee:
                            </span>{" "}
                            ${doctor.consultationFee}
                          </div>
                        </div>
                        {doctor.bio && (
                          <p className="text-sm text-slate-600 mt-2 italic">
                            "{doctor.bio}"
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDialog(doctor)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(doctor.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
