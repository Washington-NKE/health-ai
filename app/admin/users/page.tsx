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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Edit, Trash2, Search, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  patient?: Array<{
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: string;
    bloodType?: string;
    address?: string;
  }>;
  doctor?: Array<{
    firstName: string;
    lastName: string;
    specialization: string;
    department?: string;
    consultationFee?: number;
    licenseNumber?: string;
  }>;
  staff?: Array<{ role: string }>;
}

interface EditData {
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodType: string;
  address: string;
  specialization: string;
  department: string;
  consultationFee: string;
  licenseNumber: string;
  staffRole: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<EditData | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone: "",
    role: "patient",
    firstName: "",
    lastName: "",
    specialization: "",
    department: "",
    licenseNumber: "",
    consultationFee: "",
    dateOfBirth: "",
    gender: "",
    bloodType: "",
    address: "",
    staffRole: "receptionist",
  });

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users?role=${filter}`);
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create user");
      }

      toast({
        title: "Success",
        description: "User created successfully",
      });
      setShowDialog(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error("Failed to update user");

      toast({
        title: "Success",
        description: "User updated successfully",
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete user");

      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      phone: "",
      role: "patient",
      firstName: "",
      lastName: "",
      specialization: "",
      department: "",
      licenseNumber: "",
      consultationFee: "",
      dateOfBirth: "",
      gender: "",
      bloodType: "",
      address: "",
      staffRole: "receptionist",
    });
    setEditingUser(null);
  };

  const startEditing = (user: User) => {
    const patient = user.patient?.[0];
    const doctor = user.doctor?.[0];
    const staff = user.staff?.[0];

    setEditingId(user.id);
    setEditingUser(user);
    setEditData({
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      isActive: user.isActive,
      firstName: patient?.firstName || doctor?.firstName || "",
      lastName: patient?.lastName || doctor?.lastName || "",
      dateOfBirth: patient?.dateOfBirth
        ? new Date(patient.dateOfBirth).toISOString().split("T")[0]
        : "",
      gender: patient?.gender || "",
      bloodType: patient?.bloodType || "",
      address: patient?.address || "",
      specialization: doctor?.specialization || "",
      department: doctor?.department || "",
      consultationFee: doctor?.consultationFee
        ? String(doctor.consultationFee)
        : "",
      licenseNumber: doctor?.licenseNumber || "",
      staffRole: staff?.role || "receptionist",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingUser(null);
    setEditData(null);
  };

  const saveEditing = async (userId: string) => {
    if (!editData) return;

    const payload = {
      email: editData.email,
      phone: editData.phone || null,
      role: editData.role,
      isActive: editData.isActive,
      firstName: editData.firstName,
      lastName: editData.lastName,
      dateOfBirth: editData.dateOfBirth || undefined,
      gender: editData.gender || undefined,
      bloodType: editData.bloodType || undefined,
      address: editData.address || undefined,
      specialization: editData.specialization || undefined,
      department: editData.department || undefined,
      consultationFee: editData.consultationFee
        ? Number(editData.consultationFee)
        : undefined,
      licenseNumber: editData.licenseNumber || undefined,
      staffRole: editData.staffRole || undefined,
    };

    await handleUpdateUser(userId, payload);
    cancelEditing();
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.patient?.[0]?.firstName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.doctor?.[0]?.firstName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getUserName = (user: User) => {
    if (user.patient?.[0]) {
      return `${user.patient[0].firstName} ${user.patient[0].lastName}`;
    }
    if (user.doctor?.[0]) {
      return `${user.doctor[0].firstName} ${user.doctor[0].lastName}`;
    }
    return user.email.split("@")[0];
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-red-100 text-red-800",
      doctor: "bg-blue-100 text-blue-800",
      patient: "bg-green-100 text-green-800",
      staff: "bg-purple-100 text-purple-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Users className="h-8 w-8 text-blue-600" />
                  User Management
                </h1>
                <p className="text-slate-600 mt-1">
                  Manage system users and permissions
                </p>
              </div>
              <Button
                onClick={() => {
                  resetForm();
                  setShowDialog(true);
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>

            {/* Filters */}
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="patient">Patients</SelectItem>
                      <SelectItem value="doctor">Doctors</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle>Users ({filteredUsers.length})</CardTitle>
                <CardDescription>
                  View and manage all registered users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-slate-600 mt-2">Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No users found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => {
                          const isEditing = editingId === user.id;
                          return (
                            <>
                              <TableRow key={user.id}>
                                <TableCell className="font-medium">
                                  {isEditing && editData ? (
                                    <div className="grid grid-cols-2 gap-2">
                                      <Input
                                        value={editData.firstName}
                                        onChange={(e) =>
                                          setEditData({
                                            ...editData,
                                            firstName: e.target.value,
                                          })
                                        }
                                        placeholder="First name"
                                      />
                                      <Input
                                        value={editData.lastName}
                                        onChange={(e) =>
                                          setEditData({
                                            ...editData,
                                            lastName: e.target.value,
                                          })
                                        }
                                        placeholder="Last name"
                                      />
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => startEditing(user)}
                                      className="text-left hover:underline"
                                    >
                                      {getUserName(user)}
                                    </button>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {isEditing && editData ? (
                                    <Input
                                      value={editData.email}
                                      onChange={(e) =>
                                        setEditData({
                                          ...editData,
                                          email: e.target.value,
                                        })
                                      }
                                    />
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => startEditing(user)}
                                      className="text-left hover:underline"
                                    >
                                      {user.email}
                                    </button>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {isEditing && editData ? (
                                    <Select
                                      value={editData.role}
                                      onValueChange={(value) =>
                                        setEditData({
                                          ...editData,
                                          role: value,
                                        })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="patient">
                                          Patient
                                        </SelectItem>
                                        <SelectItem value="doctor">
                                          Doctor
                                        </SelectItem>
                                        <SelectItem value="staff">
                                          Staff
                                        </SelectItem>
                                        <SelectItem value="admin">
                                          Admin
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <Badge className={getRoleBadge(user.role)}>
                                      {user.role}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {isEditing && editData ? (
                                    <Select
                                      value={
                                        editData.isActive
                                          ? "active"
                                          : "inactive"
                                      }
                                      onValueChange={(value) =>
                                        setEditData({
                                          ...editData,
                                          isActive: value === "active",
                                        })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="active">
                                          Active
                                        </SelectItem>
                                        <SelectItem value="inactive">
                                          Inactive
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <Badge
                                      variant={
                                        user.isActive ? "default" : "secondary"
                                      }
                                    >
                                      {user.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {new Date(
                                    user.createdAt,
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    {isEditing ? (
                                      <>
                                        <Button
                                          size="sm"
                                          onClick={() => saveEditing(user.id)}
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
                                      </>
                                    ) : (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => startEditing(user)}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() =>
                                            handleDeleteUser(user.id)
                                          }
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                              {isEditing && editData && (
                                <TableRow>
                                  <TableCell colSpan={6}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                      <div>
                                        <Label>Phone</Label>
                                        <Input
                                          value={editData.phone}
                                          onChange={(e) =>
                                            setEditData({
                                              ...editData,
                                              phone: e.target.value,
                                            })
                                          }
                                        />
                                      </div>

                                      {editData.role === "staff" && (
                                        <div>
                                          <Label>Staff Role</Label>
                                          <Select
                                            value={editData.staffRole}
                                            onValueChange={(value) =>
                                              setEditData({
                                                ...editData,
                                                staffRole: value,
                                              })
                                            }
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="receptionist">
                                                Receptionist
                                              </SelectItem>
                                              <SelectItem value="nurse">
                                                Nurse
                                              </SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}

                                      {editData.role === "patient" && (
                                        <>
                                          <div>
                                            <Label>Date of Birth</Label>
                                            <Input
                                              type="date"
                                              value={editData.dateOfBirth}
                                              onChange={(e) =>
                                                setEditData({
                                                  ...editData,
                                                  dateOfBirth: e.target.value,
                                                })
                                              }
                                            />
                                          </div>
                                          <div>
                                            <Label>Gender</Label>
                                            <Select
                                              value={editData.gender}
                                              onValueChange={(value) =>
                                                setEditData({
                                                  ...editData,
                                                  gender: value,
                                                })
                                              }
                                            >
                                              <SelectTrigger>
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="male">
                                                  Male
                                                </SelectItem>
                                                <SelectItem value="female">
                                                  Female
                                                </SelectItem>
                                                <SelectItem value="other">
                                                  Other
                                                </SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div>
                                            <Label>Blood Type</Label>
                                            <Input
                                              value={editData.bloodType}
                                              onChange={(e) =>
                                                setEditData({
                                                  ...editData,
                                                  bloodType: e.target.value,
                                                })
                                              }
                                            />
                                          </div>
                                          <div className="md:col-span-3">
                                            <Label>Address</Label>
                                            <Input
                                              value={editData.address}
                                              onChange={(e) =>
                                                setEditData({
                                                  ...editData,
                                                  address: e.target.value,
                                                })
                                              }
                                            />
                                          </div>
                                        </>
                                      )}

                                      {editData.role === "doctor" && (
                                        <>
                                          <div>
                                            <Label>Specialization</Label>
                                            <Input
                                              value={editData.specialization}
                                              onChange={(e) =>
                                                setEditData({
                                                  ...editData,
                                                  specialization:
                                                    e.target.value,
                                                })
                                              }
                                            />
                                          </div>
                                          <div>
                                            <Label>Department</Label>
                                            <Input
                                              value={editData.department}
                                              onChange={(e) =>
                                                setEditData({
                                                  ...editData,
                                                  department: e.target.value,
                                                })
                                              }
                                            />
                                          </div>
                                          <div>
                                            <Label>Consultation Fee</Label>
                                            <Input
                                              type="number"
                                              value={editData.consultationFee}
                                              onChange={(e) =>
                                                setEditData({
                                                  ...editData,
                                                  consultationFee:
                                                    e.target.value,
                                                })
                                              }
                                            />
                                          </div>
                                          <div>
                                            <Label>License Number</Label>
                                            <Input
                                              value={editData.licenseNumber}
                                              onChange={(e) =>
                                                setEditData({
                                                  ...editData,
                                                  licenseNumber: e.target.value,
                                                })
                                              }
                                            />
                                          </div>
                                        </>
                                      )}
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

      {/* Create User Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Add a new user to the system</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.role !== "admin" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      required
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      required
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                    />
                  </div>
                </div>

                {formData.role === "doctor" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        value={formData.specialization}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            specialization: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            department: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                {formData.role === "patient" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dateOfBirth: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) =>
                          setFormData({ ...formData, gender: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-blue-700"
              >
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
