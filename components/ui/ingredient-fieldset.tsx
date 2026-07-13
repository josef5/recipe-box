"use client";

import { RecipeInput } from "@/lib/schemas/recipe";
import { Ingredient } from "@/types";
import {
  Controller,
  FieldArrayWithId,
  type Control,
  type FieldErrors,
  type UseFormGetValues,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";
import { Button } from "./button";
import { FieldErrorMessage } from "./field-error-mesage";
import { IngredientCombobox } from "./ingredient-combobox";
import { Input } from "./input";
import { Label } from "./label";
import { useState } from "react";

export function IngredientFieldset({
  title,
  ingredient,
  ingredientSuggestions,
  index,
  control,
  errors,
  getValues,
  setValue,
  register,
  moveIngredient,
  removeIngredient,
  ingredientFields,
}: {
  title?: string;
  ingredient: FieldArrayWithId<Ingredient>;
  ingredientSuggestions: Ingredient[];
  index: number;
  control: Control<RecipeInput>;
  errors: FieldErrors<RecipeInput>;
  getValues: UseFormGetValues<RecipeInput>;
  setValue: UseFormSetValue<RecipeInput>;
  register: UseFormRegister<RecipeInput>;
  moveIngredient: (from: number, to: number) => void;
  removeIngredient: (index: number) => void;
  ingredientFields: FieldArrayWithId<Ingredient>[];
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div key={ingredient.id}>
      {isOpen ? (
        <div className="">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-full flex flex-col gap-1.5">
              <Label htmlFor={`ingredient-name-${index}`}>Ingredient</Label>
              <Controller
                control={control}
                name={`ingredients.${index}.name`}
                render={({ field: { ref, onBlur, onChange, value } }) => {
                  return (
                    <IngredientCombobox
                      id={`ingredient-name-${index}`}
                      value={value ?? ""}
                      suggestions={ingredientSuggestions ?? []}
                      inputRef={ref}
                      onBlur={onBlur}
                      onChange={onChange}
                      ariaDescribedBy={
                        errors.ingredients?.[index]?.name
                          ? `ingredient-name-${index}-error`
                          : undefined
                      }
                      ariaInvalid={Boolean(errors.ingredients?.[index]?.name)}
                      onSelect={(selectedIngredient) => {
                        const unitField = `ingredients.${index}.unit` as const;
                        const currentUnit = getValues(unitField)?.trim();

                        if (currentUnit || !selectedIngredient.defaultUnit) {
                          return;
                        }

                        setValue(unitField, selectedIngredient.defaultUnit, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                      className="w-full"
                    />
                  );
                }}
              />
              <FieldErrorMessage
                text={errors.ingredients?.[index]?.name?.message}
                id={`ingredient-name-${index}-error`}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`ingredient-amount-${index}`}>Amount</Label>
              <Input
                id={`ingredient-amount-${index}`}
                type="number"
                {...register(`ingredients.${index}.amount`)}
              />
              <FieldErrorMessage
                text={errors.ingredients?.[index]?.amount?.message}
                id={`ingredient-amount-${index}-error`}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`ingredient-unit-${index}`}>Unit</Label>
              <Input
                id={`ingredient-unit-${index}`}
                {...register(`ingredients.${index}.unit`)}
              />
              <FieldErrorMessage
                text={errors.ingredients?.[index]?.unit?.message}
                id={`ingredient-unit-${index}-error`}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-1.5">
            <Label htmlFor={`ingredient-notes-${index}`}>Notes</Label>
            <Input
              id={`ingredient-notes-${index}`}
              {...register(`ingredients.${index}.notes`)}
              className="w-full"
            />
            <FieldErrorMessage
              text={errors.ingredients?.[index]?.notes?.message}
              id={`ingredient-notes-${index}-error`}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => removeIngredient(index)}
                disabled={ingredientFields.length === 1}
                aria-label={`Remove ingredient ${index + 1}`}
                variant="destructive-secondary"
                className="flex-1"
              >
                Delete
              </Button>
              <Button
                type="button"
                onClick={() => setIsOpen(false)}
                // Disable the save button if there are validation errors or if the ingredient name is empty
                disabled={
                  Boolean(errors.ingredients?.[index]?.name) ||
                  Boolean(errors.ingredients?.[index]?.amount) ||
                  Boolean(errors.ingredients?.[index]?.unit) ||
                  String(getValues(`ingredients.${index}.name`) ?? "").trim()
                    .length === 0
                }
                aria-label={`Close ingredient ${index + 1}`}
                variant="secondary"
                className="flex-1"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between text-sm">
          <h3>{title}</h3>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={index === 0}
              onClick={() => moveIngredient(index, index - 1)}
            >
              ↑
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={index === ingredientFields.length - 1}
              onClick={() => moveIngredient(index, index + 1)}
            >
              ↓
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setIsOpen(true)}
            >
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive-secondary"
              onClick={() => removeIngredient(index)}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
