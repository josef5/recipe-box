"use client";

import { CreateAdminUserSchema } from "@/lib/validation/admin-users";
import { useState } from "react";
import { Button } from "./ui/button";
import { FieldErrorMessage } from "./ui/field-error-mesage";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type CreateUserFieldErrors = Partial<
  Record<"name" | "email" | "provisionalPassword", string>
>;

export function AddUserForm({
  onSubmit,
  isCreating,
}: {
  onSubmit: ({
    name,
    email,
    provisionalPassword,
  }: {
    name: string;
    email: string;
    provisionalPassword: string;
  }) => void;
  isCreating?: boolean;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [provisionalPassword, setProvisionalPassword] = useState("");
  const [createUserFieldErrors, setCreateUserFieldErrors] =
    useState<CreateUserFieldErrors>({});
  const isCreateUserValid = CreateAdminUserSchema.safeParse({
    name,
    email,
    provisionalPassword,
  }).success;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({ name, email, provisionalPassword });

    setName("");
    setEmail("");
    setProvisionalPassword("");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-4 grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="adminUserName">Name</Label>
        <Input
          id="adminUserName"
          name="name"
          type="text"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setCreateUserFieldErrors((current) => ({
              ...current,
              name: undefined,
            }));
          }}
        />
        <FieldErrorMessage text={createUserFieldErrors.name} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="adminUserEmail">Email</Label>
        <Input
          id="adminUserEmail"
          name="email"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setCreateUserFieldErrors((current) => ({
              ...current,
              email: undefined,
            }));
          }}
        />
        <FieldErrorMessage text={createUserFieldErrors.email} />
      </div>
      <div className="grid gap-1.5">
        <Label
          htmlFor="adminUserProvisionalPassword"
          className="text-sm font-medium"
        >
          Provisional password
        </Label>
        <Input
          id="adminUserProvisionalPassword"
          name="provisionalPassword"
          type="password"
          value={provisionalPassword}
          onChange={(event) => {
            setProvisionalPassword(event.target.value);
            setCreateUserFieldErrors((current) => ({
              ...current,
              provisionalPassword: undefined,
            }));
          }}
          autoComplete="new-password"
        />
        <FieldErrorMessage text={createUserFieldErrors.provisionalPassword} />
      </div>
      <Button type="submit" disabled={isCreating || !isCreateUserValid}>
        {isCreating ? "Creating..." : "Create user"}
      </Button>
    </form>
  );
}
