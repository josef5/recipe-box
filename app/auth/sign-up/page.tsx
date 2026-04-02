"use client";

import { authClient } from "@/lib/auth/client";
import Link from "next/link";
import { useState } from "react";

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof confirmPassword !== "string"
    ) {
      setError("Invalid form submission.");
      return;
    }

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setIsPending(true);

    const result = await authClient.signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
      callbackURL: "/",
    });

    setIsPending(false);

    if (result.error) {
      setError(result.error.message ?? "Unable to sign up.");
    }
  }

  return (
    <form
      action={handleSubmit}
      className="flex min-h-screen flex-col items-center justify-center gap-5"
    >
      <h1 className="text-2xl font-bold">Create a recipe-box account</h1>

      <div className="flex w-80 flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Jane Doe"
          className="rounded-md border px-3 py-2 text-sm"
        />
      </div>

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

      <div className="flex w-80 flex-col gap-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
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
        {isPending ? "Creating account..." : "Create account"}
      </button>

      <p className="text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          href="/auth/sign-in"
          className="font-medium text-indigo-600 hover:underline"
        >
          Sign in
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
