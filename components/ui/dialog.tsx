"use client";

import { useId, useRef } from "react";

export function Dialog({
  title,
  onConfirm,
  confirmButtonText = "Confirm",
  dialogRef,
}: {
  title: string;
  onConfirm: () => void;
  confirmButtonText?: string;
  dialogRef: React.RefObject<HTMLDialogElement | null>;
}) {
  const titleId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Native <dialog> handles Escape key natively.
  // Click-outside closes by comparing target to the dialog backdrop.
  const handleClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) {
      dialogRef.current?.close();
    }
  };

  // Trap focus within the dialog.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== "Tab") return;

    const focusableElements = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    );

    if (focusableElements.length === 0) return;

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  // Move focus to Cancel when dialog opens.
  const handleToggle = (event: React.ToggleEvent<HTMLDialogElement>) => {
    if (event.newState === "open") {
      queueMicrotask(() => cancelButtonRef.current?.focus());
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-modal="true"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onToggle={handleToggle}
      className="backdrop:bg-opacity-70 m-auto rounded-md border p-6 backdrop:bg-gray-900 backdrop:opacity-70"
    >
      <h2 id={titleId} className="text-lg font-semibold">
        {title}
      </h2>
      <div className="mt-4 flex justify-end gap-3">
        <button
          ref={cancelButtonRef}
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="rounded-md border px-4 py-2 text-sm"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400"
        >
          {confirmButtonText}
        </button>
      </div>
    </dialog>
  );
}
