"use client";

import { ImplementationNotice } from "@/components/implementation-notice";

export default function PatientBillingPage() {
  return (
    <ImplementationNotice
      title="Billing"
      description="Billing statements are being moved to a production-ready implementation."
      actionHref="/patient/dashboard"
      actionLabel="Back to Dashboard"
    />
  );
}
