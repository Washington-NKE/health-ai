"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

import { useState } from "react";
import { useDoctors } from "@/hooks/use-doctors";

export default function DoctorsPage() {
  const { doctors, loading, error } = useDoctors();
  const [searchTerm, setSearchTerm] = useState("");
  const [specialization, setSpecialization] = useState("all");

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecialization =
      specialization === "all" || doctor.specialization === specialization;

    return matchesSearch && matchesSpecialization;
  });

  const specializations = Array.from(
    new Set(doctors.map((doc) => doc.specialization)),
  );

  return (
    <div className="min-h-screen bg-secondary/30">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Find a Doctor</h1>
            <p className="text-muted-foreground mt-1">
              Browse our healthcare professionals and book an appointment
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search by name or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={specialization} onValueChange={setSpecialization}>
              <SelectTrigger className="sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Card className="border-destructive/50 bg-destructive/10">
              <CardContent className="py-6 text-center">
                <p className="text-sm text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Loading doctors...</p>
              </CardContent>
            </Card>
          ) : filteredDoctors.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No doctors found matching your criteria.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <Card key={doctor.id} className="flex flex-col">
                  <CardHeader>
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                      <svg
                        className="w-8 h-8 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <CardTitle>
                      Dr. {doctor.firstName} {doctor.lastName}
                    </CardTitle>
                    <CardDescription>{doctor.specialization}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    {doctor.department && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          Department:
                        </span>{" "}
                        {doctor.department}
                      </div>
                    )}
                    {doctor.bio && (
                      <p className="text-sm text-muted-foreground">
                        {doctor.bio}
                      </p>
                    )}
                    <div className="text-sm font-medium">
                      Consultation Fee: ${doctor.consultationFee}
                    </div>
                    <Button asChild className="w-full">
                      <Link href="/appointments/book">Book Appointment</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
