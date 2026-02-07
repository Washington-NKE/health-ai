import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

interface ImplementationNoticeProps {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}

export function ImplementationNotice({
  title,
  description,
  actionHref,
  actionLabel,
}: ImplementationNoticeProps) {
  return (
    <div className="min-h-screen bg-secondary/30">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>
                {description ||
                  "This experience is being moved to a production-ready implementation."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We are wiring this feature to live data, permissions, and audit
                logging. Please check back soon.
              </p>
              {actionHref && actionLabel ? (
                <Button asChild>
                  <Link href={actionHref}>{actionLabel}</Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
