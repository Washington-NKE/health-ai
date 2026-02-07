"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { JSX } from "react";

interface Appointment {
  id: string;
  date: string;
  time: string;
  doctorId: string;
  status: string;
  doctorName?: string;
  specialization?: string;
  specialty?: string;
}

interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  doctor: string;
}

interface LabResult {
  id: string;
  testName: string;
  testDate: string;
  status: string;
}

interface Bill {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
}

interface Stat {
  title: string;
  value: number | string;
  icon: JSX.Element;
  link: string;
}

export default function PatientDashboard() {
  const { data: session } = useSession();
  const user = session?.user;
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [activePrescriptions, setActivePrescriptions] = useState<
    Prescription[]
  >([]);
  const [recentLabResults, setRecentLabResults] = useState<LabResult[]>([]);
  const [pendingBills, setPendingBills] = useState<Bill[]>([]);
  const [patientLastName, setPatientLastName] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/patient/dashboard");

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        setPatientLastName(data.patientLastName);
        setUpcomingAppointments(data.upcomingAppointments);
        setActivePrescriptions(data.activePrescriptions);
        setRecentLabResults(data.recentLabResults);
        setPendingBills(data.pendingBills);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchDashboardData();
    }
  }, [session?.user?.id]);

  const stats: Stat[] = [
    {
      title: "Upcoming Appointments",
      value: upcomingAppointments.length,
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      link: "/appointments",
    },
    {
      title: "Active Prescriptions",
      value: activePrescriptions.length,
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      link: "/patient/prescriptions",
    },
    {
      title: "Lab Results",
      value: recentLabResults.length,
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      link: "/patient/lab-results",
    },
    {
      title: "Pending Bills",
      value: `$${pendingBills.reduce((sum, bill) => sum + bill.amount, 0)}`,
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      link: "/patient/billing",
    },
  ];

  return (
    <div className="min-h-screen bg-secondary/30">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {patientLastName || user?.email?.split("@")[0]}
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's an overview of your health information
            </p>
          </div>

          {error && (
            <Card className="border-destructive/50 bg-destructive/10">
              <CardContent className="pt-6">
                <p className="text-sm text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading your data...</p>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <Link key={stat.title} href={stat.link}>
                    <Card className="hover:bg-accent transition-colors cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {stat.title}
                            </p>
                            <p className="text-2xl font-bold mt-2">
                              {stat.value}
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                            {stat.icon}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Button
                      asChild
                      variant="outline"
                      className="h-auto py-4 flex-col gap-2 bg-transparent"
                    >
                      <Link href="/appointments/book">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        <span>Book Appointment</span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="h-auto py-4 flex-col gap-2 bg-transparent"
                    >
                      <Link href="/doctors">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        <span>Find a Doctor</span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="h-auto py-4 flex-col gap-2 bg-transparent"
                    >
                      <Link href="/chat">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          />
                        </svg>
                        <span>Chat with AI</span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="h-auto py-4 flex-col gap-2 bg-transparent"
                    >
                      <Link href="/patient/profile">
                        <svg
                          className="w-6 h-6"
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
                        <span>My Profile</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Upcoming Appointments */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Upcoming Appointments</CardTitle>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/appointments">View All</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {upcomingAppointments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No upcoming appointments</p>
                        <Button asChild size="sm" className="mt-4">
                          <Link href="/appointments/book">Book Now</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {upcomingAppointments.map((apt) => (
                          <div
                            key={apt.id}
                            className="flex items-start gap-4 p-4 border rounded-lg"
                          >
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                              <svg
                                className="w-5 h-5 text-primary"
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
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">
                                {apt.doctorName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {apt.specialization}
                              </div>
                              <div className="text-sm mt-1">
                                {new Date(apt.date).toLocaleDateString()} at{" "}
                                {apt.time}
                              </div>
                            </div>
                            <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                              {apt.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Active Prescriptions */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Active Prescriptions</CardTitle>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/patient/prescriptions">View All</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activePrescriptions.map((rx) => (
                        <div
                          key={rx.id}
                          className="flex items-start gap-4 p-4 border rounded-lg"
                        >
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                            <svg
                              className="w-5 h-5 text-primary"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">
                              {rx.medicationName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {rx.dosage} - {rx.frequency}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Prescribed by {rx.doctor}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Lab Results */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Recent Lab Results</CardTitle>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/patient/lab-results">View All</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentLabResults.map((lab) => (
                        <div
                          key={lab.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <div className="font-medium">{lab.testName}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(lab.testDate).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                            {lab.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Pending Bills */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Pending Bills</CardTitle>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/patient/billing">View All</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {pendingBills.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No pending bills</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingBills.map((bill) => (
                          <div
                            key={bill.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div>
                              <div className="font-medium">
                                {bill.description}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Due: {bill.dueDate}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">${bill.amount}</div>
                              <Button size="sm" className="mt-2">
                                Pay Now
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
