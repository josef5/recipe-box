import { getManagedUsersForAccountPage } from "@/actions/admin-users";
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
    // If fetching managed users fails, we return an empty array to avoid breaking the page. This ensures that the account page can still render even if there are issues with the managed users data.
    try {
      return await getManagedUsersForAccountPage();
    } catch {
      return [];
    }
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
