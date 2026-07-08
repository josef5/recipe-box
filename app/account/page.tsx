import { getManagedUsersAction } from "@/actions/account";
import { AccountProfileSection } from "@/components/account-profile-section";
import { AccountUsersSection } from "@/components/account-users-section";
import { Header } from "@/components/header";
import { Main } from "@/components/main";
import { Sidebar } from "@/components/sidebar";
import { requireCurrentUser, userHasAdminRole } from "@/lib/auth/session";
import { getPublicRecipes } from "@/lib/recipes";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireCurrentUser({ redirectTo: "/account" });
  const isAdmin = userHasAdminRole(user);
  const recipes = await getPublicRecipes();

  async function fetchManagedUsers() {
    const managedUsersResult = await getManagedUsersAction();

    if (!managedUsersResult.ok) {
      throw new Error(
        managedUsersResult.error || "Unable to fetch managed users.",
      );
    }

    return managedUsersResult.data;
  }

  const managedUsers = isAdmin ? await fetchManagedUsers() : [];

  return (
    <Main>
      <Header
        title="Account"
        description={`Manage your account settings for ${user.name ?? user.email ?? "your profile"}.`}
      />
      <div className="col-span-full row-start-2 flex flex-col gap-8 sm:col-span-1">
        <AccountProfileSection user={user} recipes={recipes} />
        {isAdmin ? (
          <AccountUsersSection
            initialUsers={managedUsers}
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
