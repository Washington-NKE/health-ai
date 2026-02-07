"use client";

import { ImplementationNotice } from "@/components/implementation-notice";
import { ProtectedRoute } from "@/components/protected-route";

export default function DoctorPatientsPage() {
  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <ImplementationNotice
        title="Doctor Patients"
        description="Patient management is being moved to a production-ready implementation."
      />
    </ProtectedRoute>
  );
}
