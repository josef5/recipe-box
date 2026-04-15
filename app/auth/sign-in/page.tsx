"use client";

import { authClient } from "@/lib/auth/client";
import Link from "next/link";
import { useState } from "react";

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    const email = formData.get("email");
    const password = formData.get("password");

    if (typeof email !== "string" || typeof password !== "string") {
      setError("Invalid form submission.");
      return;
    }

    setError(null);
    setIsPending(true);

    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
        callbackURL: "/",
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
    <form
      action={handleSubmit}
      className="flex min-h-screen flex-col items-center justify-center gap-5"
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
          required
          placeholder="you@example.com"
          className="rounded-md border px-3 py-2 text-sm"
        />
      </div>

      <div className="flex w-80 flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="*****"
          className="rounded-md border px-3 py-2 text-sm"
        />
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-80 rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-sm text-gray-600">
        Need an account?{" "}
        <Link
          href="/auth/sign-up"
          className="font-medium text-indigo-600 hover:underline"
        >
          Sign up
        </Link>
      </p>

      <hr className="w-80" />

      <button
        type="button"
        onClick={() =>
          authClient.signIn.social({ provider: "google", callbackURL: "/" })
        }
        className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
      >
        Continue with Google
      </button>
    </form>
  );
}
