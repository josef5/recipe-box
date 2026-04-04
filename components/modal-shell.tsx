"use client";

import { navigateBackOrFallback } from "@/components/history-back-button";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export function ModalShell({
  title,
  description,
  fallbackHref,
  children,
}: {
  title: string;
  description?: string;
  fallbackHref: string;
  children: ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      navigateBackOrFallback(router, fallbackHref);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fallbackHref, router]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 px-4 py-6 sm:px-6 sm:py-10">
      <button
        type="button"
        aria-label="Close modal"
        onClick={() => navigateBackOrFallback(router, fallbackHref)}
        className="absolute inset-0"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative z-10 max-h-full w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 id="modal-title" className="text-2xl font-bold">
              {title}
            </h1>
            {description ? (
              <p className="text-sm text-gray-600">{description}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => navigateBackOrFallback(router, fallbackHref)}
            className="rounded-md border px-3 py-2 text-sm font-medium"
          >
            Close
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
