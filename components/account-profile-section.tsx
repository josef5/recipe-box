"use client";

import { getRoles } from "@/lib/auth/roles";
import type { User } from "@/types";
import { ChangePasswordForm } from "./change-password-form";
import { Accordion } from "./ui/accordion";
import { EditableAccountName } from "./ui/editable-account-name";

export function AccountProfileSection({ user }: { user: User }) {
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
        titleNode={<h2 className="font-medium">Change Password</h2>}
        className="border-none px-0"
      >
        <ChangePasswordForm />
      </Accordion>
    </section>
  );
}
