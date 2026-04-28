"use client";

import { useMemo, useState } from "react";
import { RecipeIngredient } from "@/types";

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

export function ScaledIngredientsList({
  recipeIngredients,
  baseServings,
}: {
  recipeIngredients?: RecipeIngredient[];
  baseServings: number | null | undefined;
}) {
  const normalizedBaseServings = normalizeBaseServings(baseServings);
  const [selectedServings, setSelectedServings] = useState(
    normalizedBaseServings,
  );

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

  return (
    <>
      <div className="mb-3 flex items-center gap-2">
        <label htmlFor="servings-adjust" className="text-sm font-medium">
          Servings
        </label>
        <select
          id="servings-adjust"
          value={selectedServings}
          onChange={(event) => {
            setSelectedServings(Number(event.target.value));
          }}
          className="rounded-md border px-2 py-1 text-sm"
        >
          {servingsOptions.map((servingsOption) => (
            <option key={servingsOption} value={servingsOption}>
              {servingsOption}
            </option>
          ))}
        </select>
      </div>
      <ul>
        {recipeIngredients?.map((recipeIngredient) => {
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
              {recipeIngredient.notes && (
                <span> ({recipeIngredient.notes})</span>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
