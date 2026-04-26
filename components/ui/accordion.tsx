"use client";

import React, {
  ComponentPropsWithoutRef,
  useId,
  useImperativeHandle,
  useState,
} from "react";
import { cn } from "@/lib/utils";

export function Accordion({
  heading,
  headingNode,
  children,
  className,
  ref,
  ...props
}: {
  heading?: string;
  headingNode?: React.ReactNode;
  children: React.ReactNode;
} & ComponentPropsWithoutRef<"div"> &
  React.RefAttributes<{
    open: () => void;
    close: () => void;
  }>) {
  const [isOpen, setIsOpen] = useState(false);
  // Use dynamic ids to keep the ARIA linkage unique per Accordion instance.
  // This ensures that if multiple Accordions are rendered on the same page, their ARIA attributes won't conflict with each other.
  const contentId = useId();
  const triggerId = useId();

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  }));

  return (
    <div className={cn("rounded-lg border p-4", className)} {...props}>
      <button
        id={triggerId}
        type="button"
        aria-controls={contentId}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {headingNode ? (
          headingNode
        ) : heading ? (
          <h2 className="text-lg font-semibold">{heading}</h2>
        ) : null}
      </button>
      <div id={contentId} aria-labelledby={triggerId} hidden={!isOpen}>
        {children}
      </div>
    </div>
  );
}
