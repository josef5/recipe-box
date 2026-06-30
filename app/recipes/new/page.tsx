import Main from "@/components/main";
import { RecipeFormPageContent } from "@/components/recipe-form-page-content";
import { requireCurrentUserId } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function NewRecipePage() {
  await requireCurrentUserId({ redirectTo: "/recipes/new" });

  return (
    <Main>
      <RecipeFormPageContent
        title="Add recipe"
        description="Create a new recipe with ingredients and ordered steps."
      />
    </Main>
  );
}
