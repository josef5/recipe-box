"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

type IngredientSuggestion = {
  name: string;
  defaultUnit: string | null;
};

type IngredientField = {
  name: string;
  amount: string;
  unit: string;
  notes: string;
};

type StepField = {
  instruction: string;
};

type RecipeFormValues = {
  title: string;
  description?: string | null;
  servings?: number | null;
  prepTimeMins?: number | null;
  cookTimeMins?: number | null;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  sourceUrl?: string | null;
  sourceName?: string | null;
  ingredients: IngredientField[];
  steps: StepField[];
};

export function RecipeForm({
  action,
  ingredientSuggestions,
  initialValues,
}: {
  action: (formData: FormData) => void | Promise<void>;
  ingredientSuggestions: IngredientSuggestion[];
  initialValues?: RecipeFormValues;
  deleteAction?: () => void | Promise<void>;
} & React.ComponentProps<"div">) {
  const [ingredients, setIngredients] = useState<IngredientField[]>(
    initialValues?.ingredients.length
      ? initialValues.ingredients
      : [{ name: "", amount: "", unit: "", notes: "" }],
  );
  const [steps, setSteps] = useState<StepField[]>(
    initialValues?.steps.length ? initialValues.steps : [{ instruction: "" }],
  );
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl ?? "");
  const [imagePublicId, setImagePublicId] = useState(
    initialValues?.imagePublicId ?? "",
  );
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const ingredientDefaults = useMemo(
    () =>
      new Map(
        ingredientSuggestions.map((ingredient) => [
          ingredient.name.toLowerCase(),
          ingredient.defaultUnit ?? "",
        ]),
      ),
    [ingredientSuggestions],
  );

  function updateIngredient(
    index: number,
    field: keyof IngredientField,
    value: string,
  ) {
    setIngredients((current) => {
      const next = [...current];
      const ingredient = { ...next[index], [field]: value };

      if (field === "name" && !ingredient.unit.trim()) {
        ingredient.unit =
          ingredientDefaults.get(value.trim().toLowerCase()) ?? "";
      }

      next[index] = ingredient;
      return next;
    });
  }

  function updateStep(index: number, instruction: string) {
    setSteps((current) => {
      const next = [...current];
      next[index] = { instruction };
      return next;
    });
  }

  async function uploadSelectedImage() {
    if (!selectedImageFile || isUploadingImage) {
      return;
    }

    setIsUploadingImage(true);
    setImageUploadError(null);

    try {
      const signatureResponse = await fetch("/api/cloudinary/signature", {
        method: "POST",
      });

      const signaturePayload = (await signatureResponse.json()) as
        | {
            ok: true;
            data: {
              cloudName: string;
              apiKey: string;
              folder: string;
              timestamp: number;
              signature: string;
            };
          }
        | {
            ok: false;
            error: string;
          };

      if (!signatureResponse.ok || !signaturePayload.ok) {
        throw new Error(
          signaturePayload.ok
            ? "Unable to get upload signature."
            : signaturePayload.error,
        );
      }

      const uploadData = new FormData();
      uploadData.append("file", selectedImageFile);
      uploadData.append("folder", signaturePayload.data.folder);
      uploadData.append(
        "timestamp",
        signaturePayload.data.timestamp.toString(),
      );
      uploadData.append("signature", signaturePayload.data.signature);
      uploadData.append("api_key", signaturePayload.data.apiKey);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signaturePayload.data.cloudName}/image/upload`,
        {
          method: "POST",
          body: uploadData,
        },
      );

      const uploadPayload = (await uploadResponse.json()) as {
        secure_url?: string;
        public_id?: string;
        error?: { message?: string };
      };

      if (
        !uploadResponse.ok ||
        !uploadPayload.secure_url ||
        !uploadPayload.public_id
      ) {
        throw new Error(
          uploadPayload.error?.message ?? "Unable to upload image.",
        );
      }

      setImageUrl(uploadPayload.secure_url);
      setImagePublicId(uploadPayload.public_id);
      setSelectedImageFile(null);

      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    } catch (error) {
      setImageUploadError(
        error instanceof Error ? error.message : "Unable to upload image.",
      );
    } finally {
      setIsUploadingImage(false);
    }
  }

  return (
    <>
      <form
        action={action}
        id="recipe-form"
        className="flex max-w-3xl flex-col gap-8"
      >
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              defaultValue={initialValues?.title ?? ""}
              className="rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={initialValues?.description ?? ""}
              className="rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="servings" className="text-sm font-medium">
                Servings
              </label>
              <input
                id="servings"
                name="servings"
                type="number"
                min="1"
                defaultValue={initialValues?.servings ?? ""}
                className="rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="prepTimeMins" className="text-sm font-medium">
                Prep time (mins)
              </label>
              <input
                id="prepTimeMins"
                name="prepTimeMins"
                type="number"
                min="0"
                defaultValue={initialValues?.prepTimeMins ?? ""}
                className="rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cookTimeMins" className="text-sm font-medium">
                Cook time (mins)
              </label>
              <input
                id="cookTimeMins"
                name="cookTimeMins"
                type="number"
                min="0"
                defaultValue={initialValues?.cookTimeMins ?? ""}
                className="rounded-md border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="sourceName" className="text-sm font-medium">
                Source name
              </label>
              <input
                id="sourceName"
                name="sourceName"
                defaultValue={initialValues?.sourceName ?? ""}
                className="rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="sourceUrl" className="text-sm font-medium">
                Source URL
              </label>
              <input
                id="sourceUrl"
                name="sourceUrl"
                type="url"
                defaultValue={initialValues?.sourceUrl ?? ""}
                className="rounded-md border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="imageUrl" className="text-sm font-medium">
              Image URL
            </label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(event) => {
                setImageUrl(event.target.value);
                setImagePublicId("");
              }}
              className="rounded-md border px-3 py-2 text-sm"
            />
            <input name="imagePublicId" type="hidden" value={imagePublicId} />
            <p className="text-xs text-gray-600">
              Upload to Cloudinary or paste any external image URL.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={(event) => {
                  setSelectedImageFile(event.target.files?.[0] ?? null);
                  setImageUploadError(null);
                }}
                className="text-sm"
              />
              <button
                type="button"
                disabled={!selectedImageFile || isUploadingImage}
                onClick={uploadSelectedImage}
                className="rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isUploadingImage ? "Uploading..." : "Upload image"}
              </button>
              {imageUrl ? (
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl("");
                    setImagePublicId("");
                    setImageUploadError(null);
                  }}
                  className="rounded-md border px-3 py-2 text-sm"
                >
                  Remove image
                </button>
              ) : null}
            </div>
            {imageUploadError ? (
              <p className="text-sm text-red-700">{imageUploadError}</p>
            ) : null}
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Recipe preview"
                width={1200}
                height={800}
                sizes="(max-width: 768px) 100vw, 768px"
                unoptimized
                className="mt-2 max-h-64 w-full rounded-md border object-cover"
              />
            ) : null}
          </div>
        </section>
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Ingredients</h2>
            <button
              type="button"
              onClick={() =>
                setIngredients((current) => [
                  ...current,
                  { name: "", amount: "", unit: "", notes: "" },
                ])
              }
              className="rounded-md border px-3 py-2 text-sm"
            >
              Add ingredient
            </button>
          </div>
          <datalist id="ingredient-suggestions">
            {ingredientSuggestions.map((ingredient) => (
              <option key={ingredient.name} value={ingredient.name} />
            ))}
          </datalist>
          <div className="flex flex-col gap-4">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="rounded-lg border p-4">
                <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Ingredient</label>
                    <input
                      name="ingredientName"
                      list="ingredient-suggestions"
                      value={ingredient.name}
                      onChange={(event) =>
                        updateIngredient(index, "name", event.target.value)
                      }
                      className="rounded-md border px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Amount</label>
                    <input
                      name="ingredientAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={ingredient.amount}
                      onChange={(event) =>
                        updateIngredient(index, "amount", event.target.value)
                      }
                      className="rounded-md border px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Unit</label>
                    <input
                      name="ingredientUnit"
                      value={ingredient.unit}
                      onChange={(event) =>
                        updateIngredient(index, "unit", event.target.value)
                      }
                      className="rounded-md border px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Notes</label>
                  <div className="flex gap-3">
                    <input
                      name="ingredientNotes"
                      value={ingredient.notes}
                      onChange={(event) =>
                        updateIngredient(index, "notes", event.target.value)
                      }
                      className="flex-1 rounded-md border px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setIngredients((current) =>
                          current.length === 1
                            ? [{ name: "", amount: "", unit: "", notes: "" }]
                            : current.filter(
                                (_, currentIndex) => currentIndex !== index,
                              ),
                        )
                      }
                      className="rounded-md border px-3 py-2 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Steps</h2>
            <button
              type="button"
              onClick={() =>
                setSteps((current) => [...current, { instruction: "" }])
              }
              className="rounded-md border px-3 py-2 text-sm"
            >
              Add step
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {steps.map((step, index) => (
              <div key={index} className="rounded-lg border p-4">
                <label className="mb-2 block text-sm font-medium">
                  Step {index + 1}
                </label>
                <div className="flex gap-3">
                  <textarea
                    name="stepInstruction"
                    rows={3}
                    value={step.instruction}
                    onChange={(event) => updateStep(index, event.target.value)}
                    className="flex-1 rounded-md border px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setSteps((current) =>
                        current.length === 1
                          ? [{ instruction: "" }]
                          : current.filter(
                              (_, currentIndex) => currentIndex !== index,
                            ),
                      )
                    }
                    className="h-fit rounded-md border px-3 py-2 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </form>
    </>
  );
}

export function SubmitButton({
  label,
  form,
}: {
  label: string;
  form?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      form={form}
      disabled={pending}
      className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

export function DeleteButton({
  action,
}: {
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        formNoValidate
        onClick={(event) => {
          if (!window.confirm("Delete this recipe? This cannot be undone.")) {
            event.preventDefault();
          }
        }}
        className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700"
      >
        Delete
      </button>
    </form>
  );
}
