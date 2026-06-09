"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { TOAST_OPTIONS } from "@/constants/toast-options";

type FlashToastVariant = "success" | "error" | "info";

type FlashToastConfig = {
  message: string;
  variant?: FlashToastVariant;
};

/**
 * FlashToast component for displaying toast notifications after a redirect
 * Usage:
 * 1. Include <FlashToast /> in your root layout (e.g., app/layout.tsx).
 * 2. When redirecting, add a query parameter to the URL to indicate the toast to show, e.g.:
 *    router.push("/some-page?toast=recipe-saved");
 * 3. Configure the messages and variants for each toast value in the FlashToast's configByValue prop.
 */
export function FlashToast({
  param = "toast",
  configByValue,
}: {
  param?: string;
  configByValue: Record<string, FlashToastConfig>;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const lastHandledKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    const flashValue = nextSearchParams.get(param);
    const nextSearch = nextSearchParams.toString();
    const navigationKey = `${pathname}?${nextSearch}`;

    if (lastHandledKeyRef.current === navigationKey) {
      return;
    }

    lastHandledKeyRef.current = navigationKey;

    if (!flashValue) {
      return;
    }

    const config = configByValue[flashValue];
    const variant = config?.variant ?? "success";

    if (config) {
      if (variant === "error") {
        toast.error(config.message, TOAST_OPTIONS.error);
      } else if (variant === "info") {
        toast.info(config.message, TOAST_OPTIONS.info);
      } else {
        toast.success(config.message, TOAST_OPTIONS.success);
      }
    }

    nextSearchParams.delete(param);
    const cleanedSearch = nextSearchParams.toString();
    const cleanedUrl = `${pathname}${cleanedSearch ? `?${cleanedSearch}` : ""}`;
    router.replace(cleanedUrl, { scroll: false });
  }, [configByValue, param, pathname, router, searchParams]);

  return null;
}
