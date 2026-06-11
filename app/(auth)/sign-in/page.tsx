"use client";

import Main from "@/components/main";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TOAST_OPTIONS } from "@/constants/toast-options";
import { authClient } from "@/lib/auth/client";
import {
  SignInSchema,
  validateSignInFormData,
  type SignInFieldErrors,
} from "@/lib/validation/auth";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

// TODO: Implement React-Hook-Form and Zod

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<SignInFieldErrors>({});
  const [isPending, setIsPending] = useState(false);
  const searchParams = useSearchParams();
  const callbackURL = withToastParam(
    getSafeRedirectPath(searchParams.get("redirectTo")),
    "signed-in",
  );
  const isFormValid = SignInSchema.safeParse({ email, password }).success;

  async function handleSubmit(formData: FormData) {
    const validated = validateSignInFormData(formData);

    if (!validated.success) {
      setFieldErrors(validated.errors);
      return;
    }

    const { email, password } = validated.data;

    setFieldErrors({});
    setIsPending(true);

    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
        callbackURL,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to sign in.",
        TOAST_OPTIONS.error,
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Main>
      <form
        action={handleSubmit}
        noValidate
        className="flex min-h-[70vh] flex-col items-start gap-3"
      >
        <h1 className="font-bold">Sign in to Recipe Box</h1>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setFieldErrors((current) => ({ ...current, email: undefined }));
          }}
          placeholder="you@example.com"
          aria-describedby={
            fieldErrors.email ? "sign-in-email-error" : undefined
          }
          aria-invalid={fieldErrors.email ? true : undefined}
          className="w-full"
        />
        {fieldErrors.email ? (
          <p id="sign-in-email-error" className="text-danger text-sm">
            {fieldErrors.email}
          </p>
        ) : null}
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setFieldErrors((current) => ({
              ...current,
              password: undefined,
            }));
          }}
          placeholder="*****"
          aria-describedby={
            fieldErrors.password ? "sign-in-password-error" : undefined
          }
          aria-invalid={fieldErrors.password ? true : undefined}
          className="w-full"
        />
        {fieldErrors.password ? (
          <p id="sign-in-password-error" className="text-danger text-sm">
            {fieldErrors.password}
          </p>
        ) : null}
        <Button
          type="submit"
          disabled={isPending || !isFormValid}
          className="mt-4 min-w-1/2"
        >
          {isPending ? "Signing in..." : "Sign in"}
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
