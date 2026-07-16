"use client";

import { RecipeIngredient } from "@/types";
import { useMemo, useState } from "react";
import { Label } from "./ui/label";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const DEFAULT_SERVINGS = 4;
const MIN_DROPDOWN_SERVINGS = 1;
const MAX_DROPDOWN_SERVINGS = 16;

function normalizeBaseServings(servings: number | null | undefined) {
  if (!servings || servings < 1) {
    return DEFAULT_SERVINGS;
  }

  return servings;
}

function formatScaledAmount(value: number) {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;

  if (Number.isInteger(rounded)) {
    return rounded.toString();
  }

  return rounded.toFixed(2).replace(/\.?0+$/, "");
}

function scaleIngredientAmount(
  amount: string | null,
  baseServings: number | null | undefined,
  selectedServings?: number,
) {
  if (!amount) {
    return null;
  }

  const parsedAmount = Number.parseFloat(amount);

  if (Number.isNaN(parsedAmount)) {
    return amount;
  }

  return formatScaledAmount(
    (parsedAmount * (selectedServings ?? baseServings ?? DEFAULT_SERVINGS)) /
      (baseServings ?? DEFAULT_SERVINGS),
  );
}

/**
 * Renders an adjustable list of recipe ingredients with scaled amounts based on the selected servings and applies the servings adjustment to the parent page's URL query parameters.
 *
 * @param param0 - The component props.
 * @param param0.recipeIngredients - The list of recipe ingredients.
 * @param param0.baseServings - The base number of servings for the recipe.
 * @returns A React element displaying the scaled ingredients list.
 */
export function ScaledIngredients({
  recipeIngredients,
  baseServings,
}: {
  recipeIngredients: RecipeIngredient[];
  baseServings: number | null | undefined;
}) {
  const normalizedBaseServings = normalizeBaseServings(baseServings);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const initialFromUrl = Number.parseInt(
    searchParams.get("servings") ?? "",
    10,
  );
  const initialServings =
    Number.isFinite(initialFromUrl) && initialFromUrl > 0
      ? initialFromUrl
      : normalizedBaseServings;

  const [selectedServings, setSelectedServings] = useState(initialServings);

  function handleServingsChange(nextServings: number) {
    setSelectedServings(nextServings);

    const next = new URLSearchParams(searchParams.toString());
    next.set("servings", String(nextServings));
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  const servingsOptions = useMemo(() => {
    const options = Array.from(
      { length: MAX_DROPDOWN_SERVINGS - MIN_DROPDOWN_SERVINGS + 1 },
      (_, index) => index + MIN_DROPDOWN_SERVINGS,
    );

    if (!options.includes(normalizedBaseServings)) {
      options.push(normalizedBaseServings);
      options.sort((a, b) => a - b);
    }

    return options;
  }, [normalizedBaseServings]);

  if (!recipeIngredients || recipeIngredients.length === 0) {
    return <p>No ingredients listed.</p>;
  }

  return (
    <>
      <div className="mb-3 flex items-center gap-2">
        <Label htmlFor="servings-adjust">Servings</Label>
        <select
          id="servings-adjust"
          value={selectedServings}
          onChange={(event) => {
            handleServingsChange(Number(event.target.value));
          }}
          className="rounded-md border px-2 py-0.5 text-sm"
        >
          {servingsOptions.map((servingsOption) => (
            <option key={servingsOption} value={servingsOption}>
              {servingsOption}
            </option>
          ))}
        </select>
      </div>
      <ScaledIngredientsList
        recipeIngredients={recipeIngredients}
        baseServings={baseServings}
        selectedServings={selectedServings}
      />
    </>
  );
}

export function ScaledIngredientsList({
  recipeIngredients,
  baseServings,
  selectedServings,
  ...props
}: {
  recipeIngredients: RecipeIngredient[];
  baseServings: number | null | undefined;
  selectedServings?: number;
} & React.ComponentPropsWithoutRef<"ul">) {
  const normalizedBaseServings = normalizeBaseServings(baseServings);

  if (!recipeIngredients || recipeIngredients.length === 0) {
    return <p>No ingredients listed.</p>;
  }

  return (
    <ul {...props}>
      {recipeIngredients.map((recipeIngredient) => {
        const scaledAmount = scaleIngredientAmount(
          recipeIngredient.amount,
          normalizedBaseServings,
          selectedServings,
        );

        return (
          <li key={recipeIngredient.id}>
            {scaledAmount && <span>{scaledAmount} </span>}
            {recipeIngredient.unit && <span>{recipeIngredient.unit} </span>}
            <span>{recipeIngredient.ingredient.name}</span>
            {recipeIngredient.notes && <span> ({recipeIngredient.notes})</span>}
          </li>
        );
      })}
    </ul>
  );
}
