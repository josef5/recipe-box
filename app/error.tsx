"use client";

import { Main } from "@/components/main";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Main>
      <div className="space-y-4">
        <h2>Something went wrong!</h2>
        <Button
          variant="primary"
          onClick={
            // Attempt to recover by re-fetching and re-rendering the segment
            () => unstable_retry()
          }
        >
          Try again
        </Button>
      </div>
    </Main>
  );
}
