"use client";

import { getRoles } from "@/lib/auth/roles";
import type { User, Recipe } from "@/types";
import { ChangePasswordForm } from "./change-password-form";
import { Accordion } from "./ui/accordion";
import { EditableAccountName } from "./ui/editable-account-name";
import { useRef } from "react";
import Link from "next/link";

export function AccountProfileSection({
  user,
  recipes = [],
}: {
  user: User;
  recipes: Recipe[];
}) {
  const accordionRef = useRef<{
    open: () => void;
    close: () => void;
  }>(null);

  return (
    <section className="rounded-lg border p-4">
      <dl className="grid gap-3 sm:grid-cols-[140px_1fr]">
        <EditableAccountName initialName={user.name ?? null} />
        <dt className="font-medium">Email</dt>
        <dd>{user.email ?? "Not available"}</dd>
        <dt className="font-medium">Role</dt>
        <dd>{getRoles(user).join(", ")}</dd>
        <dt className="font-medium">User ID</dt>
        <dd className="text-sm break-all text-gray-600">{user.id}</dd>
      </dl>
      <Accordion
        headingNode={<h2 className="font-medium">Change Password</h2>}
        className="border-none px-0"
        ref={accordionRef}
      >
        <ChangePasswordForm
          onSuccess={() => {
            accordionRef.current?.close();
          }}
        />
      </Accordion>
      {recipes.length > 0 ? (
        <div className="mt-6">
          <h2 className="font-medium">Your Recipes</h2>
          <ul className="list-inside list-disc">
            {recipes.map((recipe) => (
              <li key={recipe.id}>
                <Link href={`/recipes/${recipe.slug}`}>{recipe.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
