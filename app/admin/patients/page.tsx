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
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Search,
  Eye,
  Calendar,
  FileText,
  DollarSign,
  Check,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender?: string;
  bloodType?: string;
  address?: string;
  user: {
    email: string;
    phone?: string;
    isActive: boolean;
  };
  _count: {
    appointment: number;
    billings: number;
    prescriptions: number;
    labResults: number;
  };
}

interface PatientDetail extends Patient {
  appointment: Array<{
    id: string;
    appointmentDate: string;
    status: string;
    doctor: {
      firstName: string;
      lastName: string;
      specialization: string;
    };
  }>;
  billings: Array<{
    id: string;
    amount: number;
    status: string;
    issuedAt: string;
  }>;
  prescriptions: Array<{
    id: string;
    medication: string;
    dosage?: string;
    issuedAt: string;
  }>;
  labResults: Array<{
    id: string;
    type: string;
    result: string;
    reportedAt: string;
  }>;
}

interface EditData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodType: string;
  address: string;
  email: string;
  phone: string;
  isActive: boolean;
}

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientDetail | null>(
    null,
  );
  const [showDetails, setShowDetails] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<EditData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    bloodType: "",
    address: "",
    email: "",
    phone: "",
    isActive: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/patients");
      if (!response.ok) throw new Error("Failed to fetch patients");
      const data = await response.json();
      setPatients(data.patients || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientDetails = async (patientId: string) => {
    try {
      const response = await fetch(`/api/admin/patients/${patientId}`);
      if (!response.ok) throw new Error("Failed to fetch patient details");
      const data = await response.json();
      setSelectedPatient(data.patient);
      setShowDetails(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch patient details",
        variant: "destructive",
      });
    }
  };

  const startEditing = (patient: Patient) => {
    setEditingId(patient.id);
    setEditData({
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth.split("T")[0],
      gender: patient.gender || "",
      bloodType: patient.bloodType || "",
      address: patient.address || "",
      email: patient.user.email,
      phone: patient.user.phone || "",
      isActive: patient.user.isActive,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      bloodType: "",
      address: "",
      email: "",
      phone: "",
      isActive: true,
    });
  };

  const saveEditing = async (patientId: string) => {
    try {
      const response = await fetch(`/api/admin/patients/${patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (!response.ok) throw new Error("Failed to update patient");

      toast({
        title: "Success",
        description: "Patient updated successfully",
      });

      setEditingId(null);
      fetchPatients(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update patient",
        variant: "destructive",
      });
    }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <ProtectedRoute allowedRoles={["admin", "staff"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Users className="h-8 w-8 text-blue-600" />
                Patient Management
              </h1>
              <p className="text-slate-600 mt-1">
                View and manage patient records
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {patients.length}
                      </div>
                      <div className="text-sm text-slate-600">
                        Total Patients
                      </div>
                    </div>
                    <Users className="h-8 w-8 text-blue-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {patients.filter((p) => p.user.isActive).length}
                      </div>
                      <div className="text-sm text-slate-600">
                        Active Patients
                      </div>
                    </div>
                    <Users className="h-8 w-8 text-green-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {patients.reduce(
                          (sum, p) => sum + p._count.appointment,
                          0,
                        )}
                      </div>
                      <div className="text-sm text-slate-600">
                        Total Appointments
                      </div>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {patients.reduce(
                          (sum, p) => sum + p._count.prescriptions,
                          0,
                        )}
                      </div>
                      <div className="text-sm text-slate-600">
                        Total Prescriptions
                      </div>
                    </div>
                    <FileText className="h-8 w-8 text-orange-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Patients Table */}
            <Card className="border-slate-200 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Patients</CardTitle>
                    <CardDescription>
                      Comprehensive patient records
                    </CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-slate-600 mt-2">Loading patients...</p>
                  </div>
                ) : filteredPatients.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No patients found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Age</TableHead>
                          <TableHead>Gender</TableHead>
                          <TableHead>Blood Type</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Appointments</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPatients.map((patient) => {
                          const isEditing = editingId === patient.id;
                          return (
                            <>
                              <TableRow key={patient.id}>
                                <TableCell className="font-medium">
                                  {isEditing ? (
                                    <div className="flex gap-2">
                                      <Input
                                        value={editData.firstName}
                                        onChange={(e) =>
                                          setEditData({
                                            ...editData,
                                            firstName: e.target.value,
                                          })
                                        }
                                        className="w-24"
                                        placeholder="First"
                                      />
                                      <Input
                                        value={editData.lastName}
                                        onChange={(e) =>
                                          setEditData({
                                            ...editData,
                                            lastName: e.target.value,
                                          })
                                        }
                                        className="w-24"
                                        placeholder="Last"
                                      />
                                    </div>
                                  ) : (
                                    <span
                                      onClick={() => startEditing(patient)}
                                      className="cursor-pointer hover:text-blue-600"
                                    >
                                      {patient.firstName} {patient.lastName}
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {isEditing ? (
                                    <Input
                                      type="date"
                                      value={editData.dateOfBirth}
                                      onChange={(e) =>
                                        setEditData({
                                          ...editData,
                                          dateOfBirth: e.target.value,
                                        })
                                      }
                                      className="w-36"
                                    />
                                  ) : (
                                    `${calculateAge(patient.dateOfBirth)} yrs`
                                  )}
                                </TableCell>
                                <TableCell>
                                  {isEditing ? (
                                    <Select
                                      value={editData.gender}
                                      onValueChange={(value) =>
                                        setEditData({
                                          ...editData,
                                          gender: value,
                                        })
                                      }
                                    >
                                      <SelectTrigger className="w-28">
                                        <SelectValue placeholder="Gender" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Male">
                                          Male
                                        </SelectItem>
                                        <SelectItem value="Female">
                                          Female
                                        </SelectItem>
                                        <SelectItem value="Other">
                                          Other
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    patient.gender || "N/A"
                                  )}
                                </TableCell>
                                <TableCell>
                                  {isEditing ? (
                                    <Select
                                      value={editData.bloodType}
                                      onValueChange={(value) =>
                                        setEditData({
                                          ...editData,
                                          bloodType: value,
                                        })
                                      }
                                    >
                                      <SelectTrigger className="w-24">
                                        <SelectValue placeholder="Blood" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="A+">A+</SelectItem>
                                        <SelectItem value="A-">A-</SelectItem>
                                        <SelectItem value="B+">B+</SelectItem>
                                        <SelectItem value="B-">B-</SelectItem>
                                        <SelectItem value="AB+">AB+</SelectItem>
                                        <SelectItem value="AB-">AB-</SelectItem>
                                        <SelectItem value="O+">O+</SelectItem>
                                        <SelectItem value="O-">O-</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    patient.bloodType || "N/A"
                                  )}
                                </TableCell>
                                <TableCell>
                                  {isEditing ? (
                                    <div className="space-y-1">
                                      <Input
                                        value={editData.email}
                                        onChange={(e) =>
                                          setEditData({
                                            ...editData,
                                            email: e.target.value,
                                          })
                                        }
                                        className="w-40"
                                        placeholder="Email"
                                      />
                                      <Input
                                        value={editData.phone}
                                        onChange={(e) =>
                                          setEditData({
                                            ...editData,
                                            phone: e.target.value,
                                          })
                                        }
                                        className="w-40"
                                        placeholder="Phone"
                                      />
                                    </div>
                                  ) : (
                                    <div className="text-sm">
                                      <div>{patient.user.email}</div>
                                      {patient.user.phone && (
                                        <div className="text-slate-500">
                                          {patient.user.phone}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {patient._count.appointment}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {isEditing ? (
                                    <Select
                                      value={
                                        editData.isActive
                                          ? "Active"
                                          : "Inactive"
                                      }
                                      onValueChange={(value) =>
                                        setEditData({
                                          ...editData,
                                          isActive: value === "Active",
                                        })
                                      }
                                    >
                                      <SelectTrigger className="w-28">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Active">
                                          Active
                                        </SelectItem>
                                        <SelectItem value="Inactive">
                                          Inactive
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <Badge
                                      variant={
                                        patient.user.isActive
                                          ? "default"
                                          : "secondary"
                                      }
                                    >
                                      {patient.user.isActive
                                        ? "Active"
                                        : "Inactive"}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {isEditing ? (
                                    <div className="flex gap-2 justify-end">
                                      <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => saveEditing(patient.id)}
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={cancelEditing}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        fetchPatientDetails(patient.id)
                                      }
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                              {isEditing && (
                                <TableRow>
                                  <TableCell
                                    colSpan={8}
                                    className="bg-slate-50"
                                  >
                                    <div className="p-4 space-y-2">
                                      <div className="font-medium text-sm text-slate-700">
                                        Additional Information
                                      </div>
                                      <div className="grid grid-cols-1 gap-3">
                                        <div>
                                          <label className="text-xs text-slate-600 mb-1 block">
                                            Address
                                          </label>
                                          <Input
                                            value={editData.address}
                                            onChange={(e) =>
                                              setEditData({
                                                ...editData,
                                                address: e.target.value,
                                              })
                                            }
                                            placeholder="Full address"
                                            className="w-full"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Patient Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Patient Details:{" "}
              {selectedPatient &&
                `${selectedPatient.firstName} ${selectedPatient.lastName}`}
            </DialogTitle>
            <DialogDescription>
              Comprehensive patient information and medical history
            </DialogDescription>
          </DialogHeader>

          {selectedPatient && (
            <div className="space-y-6">
              {/* Personal Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-600">Email</div>
                    <div className="font-medium">
                      {selectedPatient.user.email}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Phone</div>
                    <div className="font-medium">
                      {selectedPatient.user.phone || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Age</div>
                    <div className="font-medium">
                      {calculateAge(selectedPatient.dateOfBirth)} years
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Blood Type</div>
                    <div className="font-medium">
                      {selectedPatient.bloodType || "N/A"}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-slate-600">Address</div>
                    <div className="font-medium">
                      {selectedPatient.address || "N/A"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Appointments ({selectedPatient.appointment.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPatient.appointment.length > 0 ? (
                    <div className="space-y-2">
                      {selectedPatient.appointment.slice(0, 5).map((apt) => (
                        <div
                          key={apt.id}
                          className="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
                        >
                          <div>
                            <div className="font-medium">
                              Dr. {apt.doctor.firstName} {apt.doctor.lastName}
                            </div>
                            <div className="text-sm text-slate-600">
                              {apt.doctor.specialization}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm">
                              {new Date(
                                apt.appointmentDate,
                              ).toLocaleDateString()}
                            </div>
                            <Badge className="mt-1">{apt.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-slate-500">
                      No appointments
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Prescriptions & Lab Results */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Prescriptions ({selectedPatient.prescriptions.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPatient.prescriptions.length > 0 ? (
                      <div className="space-y-2">
                        {selectedPatient.prescriptions.slice(0, 3).map((rx) => (
                          <div key={rx.id} className="p-2 bg-slate-50 rounded">
                            <div className="font-medium text-sm">
                              {rx.medication}
                            </div>
                            <div className="text-xs text-slate-600">
                              {rx.dosage || "N/A"}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-sm text-slate-500">
                        No prescriptions
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Lab Results ({selectedPatient.labResults.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPatient.labResults.length > 0 ? (
                      <div className="space-y-2">
                        {selectedPatient.labResults.slice(0, 3).map((lab) => (
                          <div key={lab.id} className="p-2 bg-slate-50 rounded">
                            <div className="font-medium text-sm">
                              {lab.type}
                            </div>
                            <div className="text-xs text-slate-600">
                              {lab.result}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-sm text-slate-500">
                        No lab results
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
