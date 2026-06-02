"use client";

import Image from "next/image";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Dialog } from "./ui/dialog";
import {
  type RecipeFormState,
  validateRecipeFormData,
} from "@/lib/validation/recipes";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

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

// TODO: Decompose label component?

export function RecipeForm({
  action,
  ingredientSuggestions,
  initialValues,
}: {
  action: (
    prevState: RecipeFormState,
    formData: FormData,
  ) => Promise<RecipeFormState>;
  ingredientSuggestions: IngredientSuggestion[];
  initialValues?: RecipeFormValues;
  deleteAction?: () => void | Promise<void>;
} & React.ComponentProps<"div">) {
  const [state, formAction] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isClientValid, setIsClientValid] = useState(false);
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

  function syncClientValidity() {
    const form = formRef.current;

    if (!form) {
      return;
    }

    const validated = validateRecipeFormData(new FormData(form));
    const nextIsValid = validated.success;

    setIsClientValid(nextIsValid);
    form.dataset.clientValid = nextIsValid ? "true" : "false";
  }

  function scheduleClientValiditySync() {
    if (typeof window === "undefined") {
      return;
    }

    window.requestAnimationFrame(() => {
      syncClientValidity();
    });
  }

  useEffect(() => {
    syncClientValidity();
  }, [ingredients, steps]);

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
        ref={formRef}
        action={formAction}
        id="recipe-form"
        noValidate
        data-client-valid={isClientValid ? "true" : "false"}
        onInput={scheduleClientValiditySync}
        className="bg-surface flex max-w-3xl flex-col gap-8 rounded-lg p-4"
      >
        {state?.errors._form && (
          <p
            id="recipe-form-error"
            role="alert"
            className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {state.errors._form}
          </p>
        )}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              name="title"
              defaultValue={initialValues?.title ?? ""}
              aria-describedby={state?.errors.title ? "title-error" : undefined}
              aria-invalid={state?.errors.title ? true : undefined}
            />
            {state?.errors.title && (
              <p id="title-error" className="text-sm text-red-600">
                {state.errors.title}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            {/* TODO: Set word limit */}
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={initialValues?.description ?? ""}
              className="bg-input rounded-md p-3 text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="servings" className="text-sm font-medium">
                Servings
              </label>
              <Input
                id="servings"
                name="servings"
                type="number"
                defaultValue={initialValues?.servings ?? 4}
                aria-describedby={
                  state?.errors.servings ? "servings-error" : undefined
                }
                aria-invalid={state?.errors.servings ? true : undefined}
              />
              {state?.errors.servings && (
                <p id="servings-error" className="text-sm text-red-600">
                  {state.errors.servings}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="prepTimeMins"
                className="truncate text-sm font-medium"
              >
                Prep time (mins)
              </label>
              <Input
                id="prepTimeMins"
                name="prepTimeMins"
                type="number"
                defaultValue={initialValues?.prepTimeMins ?? ""}
                aria-describedby={
                  state?.errors.prepTimeMins ? "prep-time-error" : undefined
                }
                aria-invalid={state?.errors.prepTimeMins ? true : undefined}
              />
              {state?.errors.prepTimeMins && (
                <p id="prep-time-error" className="text-sm text-red-600">
                  {state.errors.prepTimeMins}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="cookTimeMins"
                className="truncate text-sm font-medium"
              >
                Cook time (mins)
              </label>
              <Input
                id="cookTimeMins"
                name="cookTimeMins"
                type="number"
                defaultValue={initialValues?.cookTimeMins ?? ""}
                aria-describedby={
                  state?.errors.cookTimeMins ? "cook-time-error" : undefined
                }
                aria-invalid={state?.errors.cookTimeMins ? true : undefined}
              />
              {state?.errors.cookTimeMins && (
                <p id="cook-time-error" className="text-sm text-red-600">
                  {state.errors.cookTimeMins}
                </p>
              )}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="sourceName" className="text-sm font-medium">
                Source name
              </label>
              <Input
                id="sourceName"
                name="sourceName"
                defaultValue={initialValues?.sourceName ?? ""}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="sourceUrl" className="text-sm font-medium">
                Source URL
              </label>
              <Input
                id="sourceUrl"
                name="sourceUrl"
                type="url"
                defaultValue={initialValues?.sourceUrl ?? ""}
                aria-describedby={
                  state?.errors.sourceUrl ? "source-url-error" : undefined
                }
                aria-invalid={state?.errors.sourceUrl ? true : undefined}
              />
              {state?.errors.sourceUrl && (
                <p id="source-url-error" className="text-sm text-red-600">
                  {state.errors.sourceUrl}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="imageUrl" className="text-sm font-medium">
              Image URL
            </label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(event) => {
                setImageUrl(event.target.value);
                setImagePublicId("");
              }}
              aria-describedby={
                state?.errors.imageUrl ? "image-url-error" : "image-url-help"
              }
              aria-invalid={state?.errors.imageUrl ? true : undefined}
            />
            <input name="imagePublicId" type="hidden" value={imagePublicId} />
            <p id="image-url-help" className="text-xs text-gray-600">
              Upload to Cloudinary or paste any external image URL.
            </p>
            <div
              aria-live="polite"
              className="flex flex-wrap items-center gap-3"
            >
              <label
                htmlFor="recipe-image-file"
                className="text-sm font-medium"
              >
                Upload image file
              </label>
              <Input
                id="recipe-image-file"
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={(event) => {
                  setSelectedImageFile(event.target.files?.[0] ?? null);
                  setImageUploadError(null);
                }}
                className="w-full"
              />
              <Button
                type="button"
                variant="secondary"
                disabled={!selectedImageFile || isUploadingImage}
                onClick={uploadSelectedImage}
                aria-busy={isUploadingImage}
              >
                {isUploadingImage ? "Uploading..." : "Upload image"}
              </Button>
              {imageUrl ? (
                <Button
                  type="button"
                  variant="destructive-secondary"
                  onClick={() => {
                    setImageUrl("");
                    setImagePublicId("");
                    setImageUploadError(null);
                  }}
                >
                  Remove image
                </Button>
              ) : null}
            </div>
            {imageUploadError ? (
              <p role="alert" className="text-danger text-sm">
                {imageUploadError}
              </p>
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
            {state?.errors.imageUrl && (
              <p id="image-url-error" className="text-danger text-sm">
                {state.errors.imageUrl}
              </p>
            )}
          </div>
        </section>
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-semibold">Ingredients</h2>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setIngredients((current) => [
                  ...current,
                  { name: "", amount: "", unit: "", notes: "" },
                ])
              }
            >
              Add ingredient
            </Button>
          </div>
          <datalist id="ingredient-suggestions">
            {ingredientSuggestions.map((ingredient) => (
              <option key={ingredient.name} value={ingredient.name} />
            ))}
          </datalist>
          <div className="flex flex-col gap-4">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-full flex flex-col gap-1.5">
                    <label
                      htmlFor={`ingredient-name-${index}`}
                      className="text-sm font-medium"
                    >
                      Ingredient
                    </label>
                    <Input
                      id={`ingredient-name-${index}`}
                      name="ingredientName"
                      list="ingredient-suggestions"
                      value={ingredient.name}
                      onChange={(event) =>
                        updateIngredient(index, "name", event.target.value)
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor={`ingredient-amount-${index}`}
                      className="text-sm font-medium"
                    >
                      Amount
                    </label>
                    <Input
                      id={`ingredient-amount-${index}`}
                      name="ingredientAmount"
                      type="number"
                      value={ingredient.amount}
                      onChange={(event) =>
                        updateIngredient(index, "amount", event.target.value)
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor={`ingredient-unit-${index}`}
                      className="text-sm font-medium"
                    >
                      Unit
                    </label>
                    <Input
                      id={`ingredient-unit-${index}`}
                      name="ingredientUnit"
                      value={ingredient.unit}
                      onChange={(event) =>
                        updateIngredient(index, "unit", event.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-1.5">
                  <label
                    htmlFor={`ingredient-notes-${index}`}
                    className="text-sm font-medium"
                  >
                    Notes
                  </label>
                  <div className="flex gap-3">
                    <Input
                      id={`ingredient-notes-${index}`}
                      name="ingredientNotes"
                      value={ingredient.notes}
                      onChange={(event) =>
                        updateIngredient(index, "notes", event.target.value)
                      }
                      className="w-full"
                    />
                    <Button
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
                      aria-label={`Remove ingredient ${index + 1}`}
                      variant="destructive-secondary"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-semibold">Steps</h2>
            <Button
              type="button"
              onClick={() =>
                setSteps((current) => [...current, { instruction: "" }])
              }
              variant="secondary"
            >
              Add step
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            {steps.map((step, index) => (
              <div key={index} className="">
                <label
                  htmlFor={`step-instruction-${index}`}
                  className="mb-2 block text-sm font-medium"
                >
                  Step {index + 1}
                </label>
                <div className="flex items-start gap-3">
                  <textarea
                    id={`step-instruction-${index}`}
                    name="stepInstruction"
                    rows={3}
                    value={step.instruction}
                    onChange={(event) => updateStep(index, event.target.value)}
                    className="bg-input flex-1 rounded-md px-3 py-2 text-sm"
                  />
                  <Button
                    type="button"
                    variant="destructive-secondary"
                    onClick={() =>
                      setSteps((current) =>
                        current.length === 1
                          ? [{ instruction: "" }]
                          : current.filter(
                              (_, currentIndex) => currentIndex !== index,
                            ),
                      )
                    }
                    aria-label={`Remove step ${index + 1}`}
                  >
                    Remove
                  </Button>
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
  disabled = false,
  ...props
}: {
  label: string;
  form?: string;
  disabled?: boolean;
} & React.ComponentProps<typeof Button>) {
  const { pending } = useFormStatus();
  const [isFormValid, setIsFormValid] = useState(!form);

  useEffect(() => {
    if (!form) {
      return;
    }

    const formElement = document.getElementById(form);

    if (!(formElement instanceof HTMLFormElement)) {
      return;
    }

    const updateFormValidity = () => {
      setIsFormValid(formElement.dataset.clientValid === "true");
    };

    queueMicrotask(updateFormValidity);

    const observer = new MutationObserver(updateFormValidity);
    observer.observe(formElement, {
      attributes: true,
      attributeFilter: ["data-client-valid"],
    });

    return () => {
      observer.disconnect();
    };
  }, [form]);

  const isDisabled = pending || disabled || (form ? !isFormValid : false);

  return (
    <Button
      type="submit"
      form={form}
      disabled={isDisabled}
      variant="primary"
      {...props}
    >
      {pending ? "Saving..." : label}
    </Button>
  );
}

export function DeleteButton({
  action,
  ...props
}: {
  action: () => string | void | Promise<string | void>;
} & React.ComponentProps<typeof Button>) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <Button
        type="button"
        disabled={isPending}
        onClick={async () => {
          dialogRef.current?.showModal();
        }}
        variant="destructive-secondary"
        {...props}
      >
        {isPending ? "Deleting..." : "Delete"}
      </Button>
      <Dialog
        title="Delete this recipe? This cannot be undone."
        onConfirm={async () => {
          setIsPending(true);

          try {
            const destination = await action();
            router.push(destination ?? "/");
          } finally {
            setIsPending(false);
          }
        }}
        dialogRef={dialogRef}
        confirmButtonText="Delete"
      />
    </>
  );
}
