"use client";

import { signInAction } from "@/actions/auth";
import Main from "@/components/main";
import { Button } from "@/components/ui/button";
import { FieldErrorMessage } from "@/components/ui/field-error-mesage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TOAST_OPTIONS } from "@/constants/toast-options";
import { SignInInput, signInSchema } from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const dynamic = "force-dynamic";

function getSafeRedirectPath(redirectTo: string | null) {
  if (
    !redirectTo ||
    !redirectTo.startsWith("/") ||
    redirectTo.startsWith("//")
  ) {
    return "/";
  }

  return redirectTo;
}

function withToastParam(path: string, toastValue: string) {
  const [pathAndQuery, hash = ""] = path.split("#", 2);
  const [pathname, queryString = ""] = pathAndQuery.split("?", 2);
  const params = new URLSearchParams(queryString);
  params.set("toast", toastValue);
  const nextQuery = params.toString();
  const nextHash = hash ? `#${hash}` : "";

  return `${pathname}${nextQuery ? `?${nextQuery}` : ""}${nextHash}`;
}

function SignInForm() {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
  });
  const searchParams = useSearchParams();
  const callbackURL = withToastParam(
    getSafeRedirectPath(searchParams.get("redirectTo")),
    "signed-in",
  );
  const router = useRouter();

  async function onSubmit({ email, password }: SignInInput) {
    try {
      const result = await signInAction({ email, password });

      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [field, message] of Object.entries(result.fieldErrors)) {
            if (message) {
              setError(field as keyof SignInInput, { message });
            }
          }
        } else if (result.error) {
          throw new Error(result.error);
        }

        return;
      }

      reset();

      if (callbackURL) {
        router.push(callbackURL);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to sign in.",
        TOAST_OPTIONS,
      );
    }
  }

  const canSubmit =
    Boolean(dirtyFields.email) &&
    Boolean(dirtyFields.password) &&
    !errors.email &&
    !errors.password;

  return (
    <Main>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex min-h-[70vh] flex-col items-start gap-3"
      >
        <h1 className="font-bold">Sign in to Recipe Box</h1>
        <div className="flex w-full flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            aria-describedby={errors.email ? "sign-in-email-error" : undefined}
            aria-invalid={errors.email ? true : undefined}
          />
          <FieldErrorMessage
            text={errors.email?.message}
            id="sign-in-email-error"
          />
        </div>
        <div className="flex w-full flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="*****"
            {...register("password")}
            aria-describedby={
              errors.password ? "sign-in-password-error" : undefined
            }
            aria-invalid={errors.password ? true : undefined}
          />
          <FieldErrorMessage
            text={errors.password?.message}
            id="sign-in-password-error"
          />
        </div>
        <Button
          type="submit"
          disabled={isSubmitting || !canSubmit}
          className="mt-4 min-w-1/2"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </Main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
