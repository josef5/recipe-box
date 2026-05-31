"use client";

import React, {
  ComponentPropsWithoutRef,
  useId,
  useImperativeHandle,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

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
    <div
      className={cn(
        "border-foreground rounded-lg border px-0",
        isOpen ? "pt-2 pb-4" : "py-0",
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <Button
          id={triggerId}
          type="button"
          variant="ghost"
          aria-controls={contentId}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex-1 justify-start text-left"
        >
          {headingNode ? (
            headingNode
          ) : heading ? (
            <h2 className="text-lg font-semibold">{heading}</h2>
          ) : null}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setIsOpen((prev) => !prev)}
          className="mr-1 text-xs"
        >
          {isOpen ? "⏶" : "⏷"}
        </Button>
      </div>
      <div
        id={contentId}
        aria-labelledby={triggerId}
        hidden={!isOpen}
        className="px-4"
      >
        {children}
      </div>
    </div>
  );
}
