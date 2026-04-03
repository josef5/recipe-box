import { db } from "../db";
import { recipes, ingredients, recipeIngredients, steps } from "../db/schema";
import { generateSlug } from "../lib/slug";
import { eq, inArray, isNull } from "drizzle-orm";

const ingredientData = [
  { name: "Plain flour", defaultUnit: "g" },
  { name: "Unsalted butter", defaultUnit: "g" },
  { name: "Whole milk", defaultUnit: "ml" },
  { name: "Free range eggs", defaultUnit: "" },
  { name: "Olive oil", defaultUnit: "tbsp" },
  { name: "Garlic cloves", defaultUnit: "" },
  { name: "Brown onion", defaultUnit: "" },
  { name: "Sea salt", defaultUnit: "tsp" },
  { name: "Black pepper", defaultUnit: "tsp" },
  { name: "Chicken breast", defaultUnit: "g" },
  { name: "Canned tomatoes", defaultUnit: "g" },
  { name: "Dried oregano", defaultUnit: "tsp" },
];

const recipeData = [
  {
    title: "Lorem Ipsum Soup",
    description:
      "A simple, hearty soup perfect for cold evenings. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    servings: 4,
    prepTimeMins: 15,
    cookTimeMins: 30,
    sourceName: "Lorem Kitchen, p.42",
    ingredients: [
      { name: "Brown onion", amount: 2, unit: "" },
      { name: "Garlic cloves", amount: 3, unit: "" },
      { name: "Olive oil", amount: 2, unit: "tbsp" },
      { name: "Canned tomatoes", amount: 400, unit: "g" },
      { name: "Sea salt", amount: 1, unit: "tsp" },
      { name: "Black pepper", amount: 0.5, unit: "tsp" },
    ],
    steps: [
      "Dice the onions and mince the garlic.",
      "Heat the olive oil in a large pan over medium heat.",
      "Soften the onion for 8 minutes, then add the garlic and cook for 2 minutes more.",
      "Add the canned tomatoes and season with salt and pepper.",
      "Simmer for 20 minutes, then blend until smooth.",
    ],
  },
  {
    title: "Dolor Sit Chicken",
    description:
      "Tender chicken in a rich sauce. Consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    servings: 2,
    prepTimeMins: 10,
    cookTimeMins: 25,
    sourceName: "Ipsum Cooking",
    ingredients: [
      { name: "Chicken breast", amount: 500, unit: "g" },
      { name: "Olive oil", amount: 1, unit: "tbsp" },
      { name: "Garlic cloves", amount: 2, unit: "" },
      { name: "Canned tomatoes", amount: 200, unit: "g" },
      { name: "Dried oregano", amount: 1, unit: "tsp" },
      { name: "Sea salt", amount: 0.5, unit: "tsp" },
    ],
    steps: [
      "Season the chicken breasts with salt and pepper.",
      "Heat oil in a pan over high heat and sear the chicken for 3 minutes each side.",
      "Remove chicken and set aside. Reduce heat to medium.",
      "Add garlic and cook for 1 minute, then add tomatoes and oregano.",
      "Return chicken to the pan and simmer for 15 minutes until cooked through.",
    ],
  },
  {
    title: "Adipiscing Pancakes",
    description:
      "Light and fluffy pancakes for a lazy morning. Ut enim ad minim veniam, quis nostrud exercitation.",
    servings: 4,
    prepTimeMins: 5,
    cookTimeMins: 15,
    sourceUrl: "https://example.com/pancakes",
    ingredients: [
      { name: "Plain flour", amount: 200, unit: "g" },
      { name: "Whole milk", defaultUnit: "ml", amount: 300, unit: "ml" },
      { name: "Free range eggs", amount: 2, unit: "" },
      { name: "Unsalted butter", amount: 30, unit: "g" },
      { name: "Sea salt", amount: 0.25, unit: "tsp" },
    ],
    steps: [
      "Whisk together the flour, eggs and a pinch of salt.",
      "Gradually add the milk, whisking until you have a smooth batter.",
      "Melt the butter and stir into the batter. Rest for 5 minutes.",
      "Heat a non-stick pan over medium heat and add a small knob of butter.",
      "Pour in a ladleful of batter and cook for 2 minutes, then flip and cook for 1 minute more.",
      "Repeat with remaining batter.",
    ],
  },
];

async function seed() {
  console.log("Seeding database...");

  const seedUserId = process.env.SEED_USER_ID?.trim() || undefined;

  if (seedUserId) {
    const backfilledRecipes = await db
      .update(recipes)
      .set({ userId: seedUserId })
      .where(isNull(recipes.userId))
      .returning({ id: recipes.id });

    console.log(
      `Assigned owner to ${backfilledRecipes.length} existing unowned recipes`,
    );
  } else {
    console.log("No SEED_USER_ID provided; recipes will remain unowned.");
  }

  // Insert ingredients
  const insertedIngredients = await db
    .insert(ingredients)
    .values(ingredientData)
    .onConflictDoNothing()
    .returning();

  console.log(`Inserted ${insertedIngredients.length} ingredients`);

  // Build a name -> id lookup
  const allIngredients = await db.query.ingredients.findMany();
  const ingredientMap = new Map(allIngredients.map((i) => [i.name, i.id]));

  const existingRecipes = await db.query.recipes.findMany({
    where: inArray(
      recipes.title,
      recipeData.map((recipe) => recipe.title),
    ),
    columns: {
      id: true,
      title: true,
      userId: true,
    },
  });

  const existingRecipeMap = new Map(
    existingRecipes.map((recipe) => [recipe.title, recipe]),
  );

  // Insert recipes
  for (const recipe of recipeData) {
    const existingRecipe = existingRecipeMap.get(recipe.title);

    if (existingRecipe) {
      if (seedUserId && !existingRecipe.userId) {
        await db
          .update(recipes)
          .set({ userId: seedUserId })
          .where(eq(recipes.id, existingRecipe.id));

        console.log(`Assigned owner to existing recipe: ${recipe.title}`);
      } else {
        console.log(`Skipped existing recipe: ${recipe.title}`);
      }

      continue;
    }

    const slug = await generateSlug(recipe.title);

    const [inserted] = await db
      .insert(recipes)
      .values({
        userId: seedUserId,
        slug,
        title: recipe.title,
        description: recipe.description,
        servings: recipe.servings,
        prepTimeMins: recipe.prepTimeMins,
        cookTimeMins: recipe.cookTimeMins,
        sourceName: recipe.sourceName,
        sourceUrl: recipe.sourceUrl,
      })
      .returning();

    await db.insert(recipeIngredients).values(
      recipe.ingredients.map((ing, index) => ({
        recipeId: inserted.id,
        ingredientId: ingredientMap.get(ing.name)!,
        amount: ing.amount.toString(),
        unit: ing.unit,
        sortOrder: index,
      })),
    );

    await db.insert(steps).values(
      recipe.steps.map((instruction, index) => ({
        recipeId: inserted.id,
        stepNumber: index + 1,
        instruction,
      })),
    );

    console.log(`Inserted recipe: ${recipe.title}`);
  }

  console.log("Done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
