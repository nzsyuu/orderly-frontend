import { z } from "zod";
import type { AuthUser } from "@/modules/auth/types/user";

export const authUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
});

export function parseAuthUser(data: unknown): AuthUser {
  return authUserSchema.parse(data);
}
