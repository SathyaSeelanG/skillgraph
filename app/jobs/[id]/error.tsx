"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/StateMessage";

export default function JobDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-8">
      <ErrorState
        title="We couldn't load this job."
        description="Something went wrong. Please try again."
      />
      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="outline" onClick={reset}>
          Try again
        </Button>
        <Button variant="ghost" render={<Link href="/jobs" />}>
          Back to jobs
        </Button>
      </div>
    </div>
  );
}
