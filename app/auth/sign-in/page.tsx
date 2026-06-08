"use client";

import Main from "@/components/main";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
// TODO: Add success toast

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

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<SignInFieldErrors>({});
  const [isPending, setIsPending] = useState(false);
  const searchParams = useSearchParams();
  const callbackURL = getSafeRedirectPath(searchParams.get("redirectTo"));
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
        className="flex min-h-[70vh] flex-col items-start gap-2"
      >
        <h1 className="font-bold">Sign in to Recipe Box</h1>
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
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
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
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
