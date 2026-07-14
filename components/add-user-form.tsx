"use client";

import { Button } from "./ui/button";
import { FieldErrorMessage } from "./ui/field-error-mesage";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useForm } from "react-hook-form";
import { addUserSchema, type AddUserInput } from "@/lib/schemas/account";
import { zodResolver } from "@hookform/resolvers/zod";

export function AddUserForm({
  onSubmit,
  isCreating,
}: {
  onSubmit: (
    {
      name,
      email,
      provisionalPassword,
    }: {
      name: string;
      email: string;
      provisionalPassword: string;
    },
    setError: ReturnType<typeof useForm<AddUserInput>>["setError"],
  ) => void;
  isCreating?: boolean;
}) {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, dirtyFields },
  } = useForm<AddUserInput>({
    resolver: zodResolver(addUserSchema),
    mode: "onChange",
  });

  const canSubmit =
    Boolean(dirtyFields.name) &&
    Boolean(dirtyFields.email) &&
    Boolean(dirtyFields.provisionalPassword) &&
    !errors.name &&
    !errors.email &&
    !errors.provisionalPassword;

  function submitHandler({ name, email, provisionalPassword }: AddUserInput) {
    onSubmit({ name, email, provisionalPassword }, setError);

    reset();
  }

  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      noValidate
      className="mt-4 grid gap-4"
    >
      <div className="grid gap-1.5">
        <Label htmlFor="adminUserName">Name</Label>
        <Input id="adminUserName" {...register("name")} type="text" />
        <FieldErrorMessage text={errors.name?.message} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="adminUserEmail">Email</Label>
        <Input id="adminUserEmail" {...register("email")} type="email" />
        <FieldErrorMessage text={errors.email?.message} />
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
          {...register("provisionalPassword")}
          type="password"
        />
        <FieldErrorMessage text={errors.provisionalPassword?.message} />
      </div>
      <Button type="submit" disabled={isCreating || !canSubmit}>
        {isCreating ? "..." : "Create user"}
      </Button>
    </form>
  );
}
