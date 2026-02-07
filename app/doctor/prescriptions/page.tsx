"use client";

import { ImplementationNotice } from "@/components/implementation-notice";
import { ProtectedRoute } from "@/components/protected-route";

export default function DoctorPrescriptionsPage() {
  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <ImplementationNotice
        title="Doctor Prescriptions"
        description="Prescription management is being moved to a production-ready implementation."
      />
    </ProtectedRoute>
  );
}
