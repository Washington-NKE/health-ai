import { z } from "zod";
import { prisma } from "@/lib/prisma"; // Assuming you have a prisma client instance here
import { tool } from "ai";

export const getHealthcareTools = (
  currentUserId: string,
  userRole?: string,
) => {
  // Determine if user is admin (has full access) or staff (limited access)
  const isAdmin = userRole === "admin";
  return {
    // 1. Tool to get Patient Profile
    getPatientProfile: tool({
      description: isAdmin
        ? "Get patient profile information (admin can query any patient)"
        : "Get the profile details of the current logged-in patient, including name and insurance.",
      parameters: z.object({
        patientId: z
          .string()
          .optional()
          .describe(isAdmin ? "Patient ID (admin only)" : undefined),
      }),
      execute: async ({ patientId }) => {
        try {
          let targetPatientId = patientId;

          // Non-admin: use currentUserId to find patient
          if (!isAdmin) {
            const patient = await prisma.patient.findUnique({
              where: { userId: currentUserId },
            });
            if (!patient) return "Patient profile not found.";
            targetPatientId = patient.id;
          }

          const patient = await prisma.patient.findUnique({
            where: { id: targetPatientId },
            include: { user: true },
          });
          return patient || "Patient profile not found.";
        } catch (error) {
          console.error("Error in getPatientProfile:", error);
          return "Unable to fetch patient profile at this time.";
        }
      },
    }),

    // 2. Tool to List Appointments
    getAppointments: tool({
      description: isAdmin
        ? "Get a list of appointments for all patients or a specific patient. Admins can query any patient."
        : "Get a list of upcoming or past appointments for the current patient.",
      parameters: z.object({
        status: z
          .enum(["pending", "scheduled", "completed", "cancelled"])
          .optional(),
        patientId: z
          .string()
          .optional()
          .describe(
            isAdmin
              ? "Patient ID to filter appointments (admin only)"
              : undefined,
          ),
      }),
      execute: async ({ status, patientId }) => {
        // For non-admins, fetch current patient
        let targetPatientId = patientId;
        if (!isAdmin) {
          const patient = await prisma.patient.findUnique({
            where: { userId: currentUserId },
          });
          if (!patient) return "Patient record not found.";
          targetPatientId = patient.id;
        } else if (!patientId) {
          // Admin without patientId parameter: fetch all appointments
          const appointments = await prisma.appointment.findMany({
            where: status ? { status } : {},
            include: { patient: true, doctor: true },
            orderBy: { appointmentDate: "asc" },
            take: 100,
          });
          if (appointments.length === 0) return "No appointments found.";
          return appointments.map((a) => ({
            id: a.id,
            date: a.appointmentDate,
            patient: `${a.patient?.firstName || "Unknown"} ${a.patient?.lastName || ""}`,
            doctor: `Dr. ${a.doctor?.lastName || "Unknown"}`,
            status: a.status,
            reason: a.reason || "No reason provided",
          }));
        }

        // Fetch for specific patient
        const appointments = await prisma.appointment.findMany({
          where: {
            patientId: targetPatientId,
            ...(status ? { status } : {}),
          },
          include: { patient: true, doctor: true },
          orderBy: { appointmentDate: "asc" },
        });

        if (appointments.length === 0) return "No appointments found.";

        return appointments.map((a) => ({
          id: a.id,
          date: a.appointmentDate,
          patient: `${a.patient?.firstName || "Unknown"} ${a.patient?.lastName || ""}`,
          doctor: `Dr. ${a.doctor?.lastName}`,
          status: a.status,
          reason: a.reason || "No reason provided",
        }));
      },
    }),

    // 3. Tool to Search Doctors
    searchDoctors: tool({
      description: "Search for doctors by specialization or name.",
      parameters: z.object({
        query: z
          .string()
          .describe("Specialization (e.g. Cardiologist) or name"),
      }),
      execute: async ({ query }) => {
        const doctors = await prisma.doctor.findMany({
          where: {
            OR: [
              { specialization: { contains: query, mode: "insensitive" } },
              { lastName: { contains: query, mode: "insensitive" } },
              { firstName: { contains: query, mode: "insensitive" } },
            ],
          },
        });
        return doctors.map((d) => ({
          id: d.id,
          name: `Dr. ${d.firstName} ${d.lastName}`,
          specialization: d.specialization,
          fee: d.consultationFee,
        }));
      },
    }),

    // 4. Tool to Book Appointment
    bookAppointment: tool({
      description: isAdmin
        ? "Book a new appointment with a doctor for a patient (admin can book for any patient)"
        : "Book a new appointment with a specific doctor.",
      parameters: z.object({
        doctorId: z.string(),
        date: z.string().describe("ISO Date string for the appointment"),
        reason: z.string().optional(),
        patientId: z
          .string()
          .optional()
          .describe(
            isAdmin ? "Patient ID (admin only, defaults to self)" : undefined,
          ),
      }),
      execute: async ({ doctorId, date, reason, patientId }) => {
        try {
          let targetPatientId = patientId;

          // Non-admin: use currentUserId to find patient
          if (!isAdmin) {
            const patient = await prisma.patient.findUnique({
              where: { userId: currentUserId },
            });
            if (!patient) return "Could not find your patient record.";
            targetPatientId = patient.id;
          }

          // Real app should check for overlapping appointments here
          const appointment = await prisma.appointment.create({
            data: {
              patientId: targetPatientId,
              doctorId: doctorId,
              appointmentDate: new Date(date),
              durationMinutes: 30,
              reason: reason,
              status: "pending",
            },
          });

          return `Appointment request sent for ${appointment.appointmentDate}. ID: ${appointment.id}`;
        } catch (error) {
          console.error("Error in bookAppointment:", error);
          return "Unable to book appointment at this time.";
        }
      },
    }),

    // 5. Tool to Get Billing Information
    getBillingInfo: tool({
      description: isAdmin
        ? "Get patient billing information, invoices, and payment status (admin can query any patient)"
        : "Get billing information, invoices, and payment status for the current patient.",
      parameters: z.object({
        status: z
          .enum(["pending", "paid", "refunded", "cancelled"])
          .optional()
          .describe("Filter by billing status"),
        patientId: z
          .string()
          .optional()
          .describe(isAdmin ? "Patient ID (admin only)" : undefined),
      }),
      execute: async ({ status, patientId }) => {
        try {
          let targetPatientId = patientId;

          // Non-admin: use currentUserId to find patient
          if (!isAdmin) {
            const patient = await prisma.patient.findUnique({
              where: { userId: currentUserId },
            });
            if (!patient) return "Patient record not found.";
            targetPatientId = patient.id;
          }

          const billings = await prisma.billing.findMany({
            where: {
              patientId: targetPatientId,
              ...(status ? { status } : {}),
            },
            orderBy: { issuedAt: "desc" },
          });

          if (billings.length === 0) return "No billing records found.";

          return billings.map((b) => ({
            id: b.id,
            amount: `$${b.amount} ${b.currency}`,
            status: b.status,
            description: b.description || "Invoice",
            issuedAt: new Date(b.issuedAt).toLocaleDateString(),
            paidAt: b.paidAt
              ? new Date(b.paidAt).toLocaleDateString()
              : "Not yet paid",
          }));
        } catch (error) {
          console.error("Error in getBillingInfo:", error);
          return "Unable to fetch billing information at this time.";
        }
      },
    }),

    // 6. Tool to Get Lab Results
    getLabResults: tool({
      description: isAdmin
        ? "Get patient lab test results and medical test reports (admin can query any patient)"
        : "Get personal lab test results and medical test reports.",
      parameters: z.object({
        testType: z
          .string()
          .optional()
          .describe("Filter by lab test type (e.g., Blood, Urine)"),
        patientId: z
          .string()
          .optional()
          .describe(isAdmin ? "Patient ID (admin only)" : undefined),
      }),
      execute: async ({ testType, patientId }) => {
        try {
          let targetPatientId = patientId;

          // Non-admin: use currentUserId to find patient
          if (!isAdmin) {
            const patient = await prisma.patient.findUnique({
              where: { userId: currentUserId },
            });
            if (!patient) return "Patient record not found.";
            targetPatientId = patient.id;
          }

          const results = await prisma.labResult.findMany({
            where: {
              patientId: targetPatientId,
              ...(testType
                ? { type: { contains: testType, mode: "insensitive" } }
                : {}),
            },
            orderBy: { reportedAt: "desc" },
            include: { doctor: true },
          });

          if (results.length === 0) return "No lab results found.";

          return results.map((r) => ({
            id: r.id,
            testType: r.type,
            result: r.result,
            units: r.units || "N/A",
            referenceRange: r.referenceRange || "N/A",
            collectedAt: r.collectedAt
              ? new Date(r.collectedAt).toLocaleDateString()
              : "N/A",
            reportedAt: new Date(r.reportedAt).toLocaleDateString(),
            orderedBy: r.doctor
              ? `Dr. ${r.doctor.firstName} ${r.doctor.lastName}`
              : "N/A",
            notes: r.labNotes || "No additional notes",
          }));
        } catch (error) {
          console.error("Error in getLabResults:", error);
          return "Unable to fetch lab results at this time.";
        }
      },
    }),

    // 7. Tool to Get Prescriptions
    getPrescriptions: tool({
      description: isAdmin
        ? "Get patient prescriptions and medication information (admin can query any patient)"
        : "Get personal prescriptions and medication information.",
      parameters: z.object({
        active: z
          .boolean()
          .optional()
          .default(true)
          .describe("Show only active prescriptions"),
        patientId: z
          .string()
          .optional()
          .describe(isAdmin ? "Patient ID (admin only)" : undefined),
      }),
      execute: async ({ active, patientId }) => {
        try {
          let targetPatientId = patientId;

          // Non-admin: use currentUserId to find patient
          if (!isAdmin) {
            const patient = await prisma.patient.findUnique({
              where: { userId: currentUserId },
            });
            if (!patient) return "Patient record not found.";
            targetPatientId = patient.id;
          }

          const prescriptions = await prisma.prescription.findMany({
            where: {
              patientId: targetPatientId,
              ...(active ? { expiresAt: { gt: new Date() } } : {}),
            },
            orderBy: { issuedAt: "desc" },
            include: { doctor: true },
          });

          if (prescriptions.length === 0) return "No prescriptions found.";

          return prescriptions.map((p) => ({
            id: p.id,
            medication: p.medication,
            dosage: p.dosage || "As prescribed",
            frequency: p.frequency || "As needed",
            instructions: p.instructions || "No special instructions",
            issuedAt: new Date(p.issuedAt).toLocaleDateString(),
            expiresAt: p.expiresAt
              ? new Date(p.expiresAt).toLocaleDateString()
              : "No expiration",
            prescribedBy: p.doctor
              ? `Dr. ${p.doctor.firstName} ${p.doctor.lastName}`
              : "N/A",
          }));
        } catch (error) {
          console.error("Error in getPrescriptions:", error);
          return "Unable to fetch prescriptions at this time.";
        }
      },
    }),

    // 8. Tool to List All Available Doctors
    listAvailableDoctors: tool({
      description:
        "Get a comprehensive list of all available doctors with their specializations and fees.",
      parameters: z.object({
        specialization: z
          .string()
          .optional()
          .describe("Filter by medical specialization (e.g., Cardiology)"),
        available: z
          .boolean()
          .optional()
          .default(true)
          .describe("Show only available doctors"),
      }),
      execute: async ({ specialization, available }) => {
        try {
          const doctors = await prisma.doctor.findMany({
            where: {
              isAvailable: available ? true : undefined,
              ...(specialization
                ? {
                    specialization: {
                      contains: specialization,
                      mode: "insensitive",
                    },
                  }
                : {}),
            },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialization: true,
              department: true,
              consultationFee: true,
              bio: true,
              verified: true,
              isAvailable: true,
            },
            orderBy: { lastName: "asc" },
          });

          if (doctors.length === 0)
            return "No doctors found matching your criteria.";

          return doctors.map((d) => ({
            id: d.id,
            name: `Dr. ${d.firstName} ${d.lastName}`,
            specialization: d.specialization,
            department: d.department,
            fee: `$${d.consultationFee || "TBD"}`,
            bio: d.bio,
            verified: d.verified ? "Verified" : "Unverified",
            available: d.isAvailable ? "Available" : "Not Available",
          }));
        } catch (error) {
          console.error("Error in listAvailableDoctors:", error);
          return "Unable to fetch doctor list at this time.";
        }
      },
    }),

    // 9. Admin tool: Get all patients
    ...(isAdmin && {
      getAllPatients: tool({
        description:
          "Admin only: Get a list of all patients in the system with their information.",
        parameters: z.object({
          search: z.string().optional().describe("Search by name or email"),
        }),
        execute: async ({ search }) => {
          try {
            const patients = await prisma.patient.findMany({
              where: search
                ? {
                    OR: [
                      { firstName: { contains: search, mode: "insensitive" } },
                      { lastName: { contains: search, mode: "insensitive" } },
                      {
                        user: {
                          email: { contains: search, mode: "insensitive" },
                        },
                      },
                    ],
                  }
                : {},
              include: {
                user: { select: { email: true, phone: true } },
                _count: { select: { appointment: true } },
              },
              orderBy: { lastName: "asc" },
              take: 50,
            });

            if (patients.length === 0) return "No patients found.";

            return patients.map((p) => ({
              id: p.id,
              name: `${p.firstName} ${p.lastName}`,
              email: p.user?.email || "Not provided",
              phone: p.user?.phone || "Not provided",
              bloodType: p.bloodType || "Not provided",
              appointmentCount: p._count.appointment,
            }));
          } catch (error) {
            console.error("Error in getAllPatients:", error);
            return "Unable to fetch patient list.";
          }
        },
      }),
    }),

    // 10. Admin tool: Get detailed patient info
    ...(isAdmin && {
      getPatientDetails: tool({
        description:
          "Admin only: Get detailed information about a specific patient.",
        parameters: z.object({
          patientId: z.string().describe("The patient ID"),
        }),
        execute: async ({ patientId }) => {
          try {
            const patient = await prisma.patient.findUnique({
              where: { id: patientId },
              include: {
                user: { select: { email: true, phone: true, isActive: true } },
                appointment: {
                  include: { doctor: true },
                  orderBy: { appointmentDate: "desc" },
                  take: 10,
                },
                billings: { orderBy: { issuedAt: "desc" }, take: 10 },
                prescriptions: { orderBy: { issuedAt: "desc" }, take: 10 },
              },
            });

            if (!patient) return "Patient not found.";

            return {
              id: patient.id,
              name: `${patient.firstName} ${patient.lastName}`,
              email: patient.user?.email,
              phone: patient.user?.phone,
              bloodType: patient.bloodType,
              status: patient.user?.isActive ? "Active" : "Inactive",
              upcomingAppointments: patient.appointment.filter(
                (a) => a.appointmentDate > new Date(),
              ).length,
              totalAppointments: patient.appointment.length,
              pendingBillings: patient.billings.filter(
                (b) => b.status === "pending",
              ).length,
              activePrescriptions: patient.prescriptions.filter(
                (p) => !p.expiresAt || p.expiresAt > new Date(),
              ).length,
            };
          } catch (error) {
            console.error("Error in getPatientDetails:", error);
            return "Unable to fetch patient details.";
          }
        },
      }),
    }),
  };
};
