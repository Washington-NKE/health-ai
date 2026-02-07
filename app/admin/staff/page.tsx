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
  Users,
} from "lucide-react";

interface StaffMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const query = searchTerm
        ? `?search=${encodeURIComponent(searchTerm)}`
        : "";
      const response = await fetch(`/api/admin/staff${query}`);
      if (!response.ok) throw new Error("Failed to fetch staff");
      const data = await response.json();
      setStaff(data.staff);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load staff",
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
      fetchStaff();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleOpenDialog = (member?: StaffMember) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        email: member.email,
        firstName: member.firstName,
        lastName: member.lastName,
        phone: member.phone || "",
        password: "",
      });
    } else {
      setEditingMember(null);
      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        password: "",
      });
    }
    setOpenDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!editingMember && !formData.password) {
      toast({
        title: "Error",
        description: "Password is required for new staff members",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingMember) {
        // Update staff
        const response = await fetch(`/api/admin/staff/${editingMember.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone || undefined,
            ...(formData.password && { password: formData.password }),
          }),
        });
        if (!response.ok) throw new Error("Failed to update staff member");
        toast({
          title: "Success",
          description: "Staff member updated successfully",
        });
      } else {
        // Create new staff
        const response = await fetch("/api/admin/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            phone: formData.phone || undefined,
          }),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create staff member");
        }
        toast({
          title: "Success",
          description: "Staff member created successfully",
        });
      }
      setOpenDialog(false);
      fetchStaff();
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
        "Are you sure you want to delete this staff member? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/staff/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete staff member");
      toast({
        title: "Success",
        description: "Staff member deleted successfully",
      });
      fetchStaff();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete staff member",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <main className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Staff</h1>
                  <p className="text-slate-600">Manage administrative staff</p>
                </div>
              </div>
            </div>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Staff Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingMember ? "Edit Staff Member" : "Add New Staff"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingMember
                      ? "Update staff information"
                      : "Register a new staff member"}
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
                      placeholder="staff@hospital.com"
                      disabled={!!editingMember}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      {editingMember ? "New Password (optional)" : "Password *"}
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

                  <Button type="submit" className="w-full">
                    {editingMember ? "Update Staff Member" : "Register Staff"}
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
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Staff List */}
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </CardContent>
            </Card>
          ) : staff.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-slate-300 mb-3" />
                <p className="text-slate-500">No staff members found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {staff.map((member) => (
                <Card
                  key={member.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {member.firstName} {member.lastName}
                          </h3>
                          {member.isActive ? (
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
                        <div className="text-sm text-slate-600">
                          <p>
                            <span className="font-medium text-slate-700">
                              Email:
                            </span>{" "}
                            {member.email}
                          </p>
                          <p>
                            <span className="font-medium text-slate-700">
                              Phone:
                            </span>{" "}
                            {member.phone || "N/A"}
                          </p>
                          <p>
                            <span className="font-medium text-slate-700">
                              Joined:
                            </span>{" "}
                            {formatDate(member.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDialog(member)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(member.id)}
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
