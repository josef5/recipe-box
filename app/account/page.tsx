import { AppMenu } from "@/components/app-menu";
import { SignOutButton } from "@/components/sign-out-button";
import { requireCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireCurrentUser();

  return (
    <main>
      <AppMenu variant="recipe" backHref="/" />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Account</h1>
          <p className="text-sm text-gray-600">
            Manage your account settings for{" "}
            {user.name || user.email || "your profile"}.
          </p>
        </header>

        <section className="rounded-lg border p-4">
          <dl className="grid gap-3 sm:grid-cols-[140px_1fr]">
            <dt className="font-medium">Name</dt>
            <dd>{user.name || "Not set"}</dd>
            <dt className="font-medium">Email</dt>
            <dd>{user.email || "Not available"}</dd>
            <dt className="font-medium">User ID</dt>
            <dd className="break-all text-sm text-gray-600">{user.id}</dd>
          </dl>
        </section>

        <section className="rounded-lg border p-4">
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Account actions</h2>
            <p className="text-sm text-gray-600">
              This page is the starting point for account management. It
              currently lets the user review their profile details and sign out
              safely.
            </p>
            <div>
              <SignOutButton />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
