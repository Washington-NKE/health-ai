"use client";

import { ImplementationNotice } from "@/components/implementation-notice";

export default function PrescriptionsPage() {
  return (
    <ImplementationNotice
      title="Prescriptions"
      description="Prescription history is being moved to a production-ready implementation."
      actionHref="/patient/dashboard"
      actionLabel="Back to Dashboard"
    />
  );
}
