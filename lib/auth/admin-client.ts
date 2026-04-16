import { auth } from "./server";

export type AdminClient = {
  listUsers: (input: {
    query: {
      limit: number;
      sortBy: string;
      sortDirection: "asc" | "desc";
    };
  }) => Promise<unknown>;
  createUser: (input: {
    name: string;
    email: string;
    password: string;
    role: "user" | "admin";
  }) => Promise<unknown>;
  removeUser: (input: { userId: string }) => Promise<unknown>;
};

export function getAdminClient(): AdminClient {
  return (auth as unknown as { admin: AdminClient }).admin;
}
