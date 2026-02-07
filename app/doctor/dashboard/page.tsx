"use client";

import { ImplementationNotice } from "@/components/implementation-notice";
import { ProtectedRoute } from "@/components/protected-route";

export default function DoctorDashboard() {
  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <ImplementationNotice
        title="Doctor Dashboard"
        description="Doctor dashboard data is being moved to a production-ready implementation."
      />
    </ProtectedRoute>
  );
}
