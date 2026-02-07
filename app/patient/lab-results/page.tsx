"use client";

import { ImplementationNotice } from "@/components/implementation-notice";

export default function LabResultsPage() {
  return (
    <ImplementationNotice
      title="Lab Results"
      description="Lab results are being moved to a production-ready implementation."
      actionHref="/patient/dashboard"
      actionLabel="Back to Dashboard"
    />
  );
}
