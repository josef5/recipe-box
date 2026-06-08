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
