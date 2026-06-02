import { getManagedUsersForAccountPage } from "@/actions/admin-users";
import { AccountProfileSection } from "@/components/account-profile-section";
import { AdminUsersSection } from "@/components/admin-users-section";
import Main from "@/components/main";
import Header from "@/components/header";
import { requireCurrentUser, userHasAdminRole } from "@/lib/auth/session";
import { getPublicRecipes } from "@/lib/recipes";
import Sidebar from "@/components/sidebar";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireCurrentUser({ redirectTo: "/account" });
  const isAdmin = userHasAdminRole(user);
  const adminUsers = isAdmin ? await getManagedUsersForAccountPage() : [];
  const recipes = await getPublicRecipes();

  return (
    <Main>
      <Header
        title="Account"
        description={`Manage your account settings for ${user.name ?? user.email ?? "your profile"}.`}
      />
      <div className="col-span-full row-start-2 flex flex-col gap-8 sm:col-span-1">
        <AccountProfileSection user={user} recipes={recipes} />
        {isAdmin ? (
          <AdminUsersSection
            initialUsers={adminUsers}
            currentUserId={user.id}
          />
        ) : null}
      </div>
      <Sidebar className="flex items-start gap-3 sm:col-start-2 sm:row-start-1 sm:flex-col">
        {/* <SignOutButton /> */}
      </Sidebar>
    </Main>
  );
}
