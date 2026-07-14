"use client";

import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { Button } from "./button";
import { Dialog } from "./dialog";
import { deleteRecipe } from "@/actions/recipes";
import { TOAST_OPTIONS } from "@/constants/toast-options";
import { toast } from "sonner";

export function DeleteRecipeButton({
  recipeId,
  ...props
}: {
  recipeId: string;
} & Omit<React.ComponentProps<"button">, "type" | "form" | "disabled">) {
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
        {isPending ? "..." : "Delete"}
      </Button>
      <Dialog
        title="Delete this recipe? This cannot be undone."
        onConfirm={async () => {
          setIsPending(true);

          try {
            await deleteRecipe(recipeId);
            router.push("/");
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Unable to delete recipe.",
              TOAST_OPTIONS,
            );
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
