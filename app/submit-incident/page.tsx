import { Suspense } from "react";
import { IncidentSubmissionForm } from "@/components/forms/IncidentSubmissionForm";
import { Loader2 } from "lucide-react";

export default function SubmitIncidentPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        }
      >
        <IncidentSubmissionForm />
      </Suspense>
    </div>
  );
}
