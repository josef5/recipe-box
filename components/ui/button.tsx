"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";

const buttonVariants = cva(
  "px-8 py-2 rounded-md font-bold cursor-pointer items-center justify-center text-center",
  {
    variants: {
      variant: {
        primary: "bg-foreground text-surface",
        secondary: "text-foreground border",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

export function Button({
  label,
  href,
  variant,
  className,
  ...props
}: {
  label: string;
  href?: string;
  variant?: "primary" | "secondary";
} & VariantProps<typeof buttonVariants> &
  React.ComponentPropsWithoutRef<"a"> &
  React.ComponentPropsWithoutRef<"button">) {
  if (!href) {
    return (
      <button className={cn(buttonVariants({ variant }), className)} {...props}>
        {label}
      </button>
    );
  }

  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    >
      {label}
    </Link>
  );
}
