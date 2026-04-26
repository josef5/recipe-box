"use client";

import { authClient } from "@/lib/auth/client";
import {
  SignInSchema,
  type SignInFieldErrors,
  validateSignInFormData,
} from "@/lib/validation/auth";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

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
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const searchParams = useSearchParams();
  const callbackURL = getSafeRedirectPath(searchParams.get("redirectTo"));
  const isFormValid = SignInSchema.safeParse({ email, password }).success;

  async function handleSubmit(formData: FormData) {
    const validated = validateSignInFormData(formData);

    if (!validated.success) {
      setFieldErrors(validated.errors);
      setError(null);
      return;
    }

    const { email, password } = validated.data;

    setFieldErrors({});
    setError(null);
    setIsPending(true);

    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
        callbackURL,
      });

      if (result.error) {
        setError(result.error.message ?? "Unable to sign in.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center gap-5"
    >
      <form
        action={handleSubmit}
        noValidate
        className="flex flex-col items-center gap-5"
      >
        <h1 className="text-2xl font-bold">Sign in to recipe-box</h1>

        <div className="flex w-80 flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
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
            className="rounded-md border px-3 py-2 text-sm"
          />
          {fieldErrors.email ? (
            <p id="sign-in-email-error" className="text-sm text-red-600">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="flex w-80 flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
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
            className="rounded-md border px-3 py-2 text-sm"
          />
          {fieldErrors.password ? (
            <p id="sign-in-password-error" className="text-sm text-red-600">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        <div aria-live="polite" className="w-80">
          {error ? (
            <p role="alert" className="text-sm text-red-500">
              {error}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isPending || !isFormValid}
          className="w-80 rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
        >
          {isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
