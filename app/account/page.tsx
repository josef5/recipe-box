import { requireCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireCurrentUser();

  return (
    <main className="grid sm:grid-cols-[3fr_1fr] gap-8 items-start">
      <div className="flex flex-col gap-8">
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
      </div>
      <aside className="flex sm:flex-col items-start gap-3 sm:col-start-2 sm:row-start-1">
        {/* <SignOutButton /> */}
      </aside>
    </main>
  );
}
