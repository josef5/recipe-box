import { getManagedUsersForAccountPage } from "@/actions/admin-users";
import { AdminUsersSection } from "@/components/admin-users-section";
import { ChangePasswordForm } from "@/components/change-password-form";
import { Accordion } from "@/components/ui/accordion";
import {
  deriveRole,
  requireCurrentUser,
  userHasAdminRole,
} from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// TODO: Close change pw accordion on success -> decompose to client component

export default async function AccountPage() {
  const user = await requireCurrentUser({ redirectTo: "/account" });
  const isAdmin = userHasAdminRole(user);
  const adminUsers = isAdmin ? await getManagedUsersForAccountPage() : [];

  return (
    <main className="grid items-start gap-8 sm:grid-cols-[3fr_1fr]">
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Account</h1>
          <p className="text-sm text-gray-600">
            Manage your account settings for{" "}
            {user.name ?? user.email ?? "your profile"}.
          </p>
        </header>
        <section className="rounded-lg border p-4">
          <dl className="grid gap-3 sm:grid-cols-[140px_1fr]">
            <dt className="font-medium">Name</dt>
            <dd>{user.name ?? "Not set"}</dd>
            <dt className="font-medium">Email</dt>
            <dd>{user.email ?? "Not available"}</dd>
            <dt className="font-medium">Role</dt>
            <dd>{deriveRole(user).join(", ") ?? "user"}</dd>
            <dt className="font-medium">User ID</dt>
            <dd className="text-sm break-all text-gray-600">{user.id}</dd>
          </dl>
          <Accordion
            titleNode={<h2 className="font-medium">Change Password</h2>}
            className="border-none px-0"
          >
            <ChangePasswordForm />
          </Accordion>
        </section>

        {isAdmin ? (
          <AdminUsersSection
            initialUsers={adminUsers}
            currentUserId={user.id}
          />
        ) : null}
      </div>
      <aside className="flex items-start gap-3 sm:col-start-2 sm:row-start-1 sm:flex-col">
        {/* <SignOutButton /> */}
      </aside>
    </main>
  );
}
