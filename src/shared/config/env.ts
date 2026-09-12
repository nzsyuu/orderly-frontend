import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.union([z.url(), z.literal("")]).default(""),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "",
});

if (!parsed.success) {
  throw new Error(`Invalid environment variables: ${parsed.error.message}`);
}

export const env = {
  apiUrl: parsed.data.NEXT_PUBLIC_API_URL,
};
