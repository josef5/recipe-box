"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";

const buttonVariants = cva(
  "rounded-md cursor-pointer items-center justify-center text-center text-sm disabled:cursor-default disabled:opacity-50 relative",
  {
    variants: {
      variant: {
        primary: "bg-foreground text-surface",
        secondary: "text-foreground border",
        destructive: "bg-danger text-surface",
        "destructive-secondary": "border border-danger text-danger",
        ghost: "bg-transparent text-foreground border-none",
      },
      size: {
        sm: "px-2 py-1.5 text-xs font-normal",
        md: "px-4 py-2 text-sm font-normal",
        lg: "px-5 py-3 text-base font-bold",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type CommonType = {
  label?: string;
  variant?:
    | "primary"
    | "secondary"
    | "destructive"
    | "destructive-secondary"
    | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  showSpinner?: boolean;
} & VariantProps<typeof buttonVariants>;

type ButtonType = CommonType &
  Omit<React.ComponentPropsWithRef<"button">, "className" | "href"> & {
    href?: undefined;
    ref?: React.Ref<HTMLButtonElement>;
  };

type LinkType = CommonType &
  Omit<React.ComponentPropsWithRef<"a">, "className"> & {
    href: string;
    ref?: React.Ref<HTMLAnchorElement>;
  };

type Props = ButtonType | LinkType;

export function Button(props: Props) {
  if (props.href == null) {
    const {
      label,
      variant,
      size,
      className,
      ref,
      disabled,
      showSpinner = false,
      href: _href,
      children,
      ...buttonProps
    } = props;
    void _href; // To prevent "href is declared but its value is never read" error

    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled}
        {...buttonProps}
      >
        {/* The spinner is absolutely positioned to prevent layout shift */}
        {showSpinner && <LoadingSpinner />}
        <div className={cn(showSpinner && "opacity-0")}>
          {label ?? children}
        </div>
      </button>
    );
  }

  const {
    label,
    href,
    variant,
    size,
    className,
    ref,
    disabled,
    showSpinner = false,
    children,
    ...linkProps
  } = props;

  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant, size }), className)}
      ref={ref}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : linkProps.tabIndex}
      onClick={disabled ? (e) => e.preventDefault() : linkProps.onClick}
      {...linkProps}
    >
      {showSpinner && <LoadingSpinner />}
      <div className={cn(showSpinner && "opacity-0")}>{label ?? children}</div>
    </Link>
  );
}

function LoadingSpinner() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-loader-circle-icon lucide-loader-circle absolute top-1/2 left-1/2 mx-auto -translate-x-1/2 -translate-y-1/2 animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
