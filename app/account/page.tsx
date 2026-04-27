import { getManagedUsersForAccountPage } from "@/actions/admin-users";
import { AccountProfileSection } from "@/components/account-profile-section";
import { AdminUsersSection } from "@/components/admin-users-section";
import Main from "@/components/main";
import { requireCurrentUser, userHasAdminRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireCurrentUser({ redirectTo: "/account" });
  const isAdmin = userHasAdminRole(user);
  const adminUsers = isAdmin ? await getManagedUsersForAccountPage() : [];

  return (
    <Main>
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Account</h1>
          <p className="text-sm text-gray-600">
            Manage your account settings for{" "}
            {user.name ?? user.email ?? "your profile"}.
          </p>
        </header>
        <AccountProfileSection user={user} />

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
    </Main>
  );
}
