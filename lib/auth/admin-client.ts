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

/**
 * Returns an instance of the AdminClient for performing administrative actions.
 * @returns {AdminClient} The admin client instance.
 */
export function getAdminClient(): AdminClient {
  return (auth as unknown as { admin: AdminClient }).admin;
}
