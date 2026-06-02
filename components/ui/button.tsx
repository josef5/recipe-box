"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";

const buttonVariants = cva(
  "rounded-md cursor-pointer items-center justify-center text-center text-sm disabled:cursor-default disabled:opacity-50",
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
        md: "px-4 py-2 text-sm font-bold",
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
        {label ?? children}
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
      {label ?? children}
    </Link>
  );
}
