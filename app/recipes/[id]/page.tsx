import { getRecipe } from "@/actions/recipes";
import { notFound } from "next/navigation";

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) notFound();

  return (
    <main>
      <pre>{JSON.stringify(recipe, null, 2)}</pre>
    </main>
  );
}
