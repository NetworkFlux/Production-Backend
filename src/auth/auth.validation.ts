import { z } from "zod";

export const signUpSchema = z.object({
  username: z.string().min(2).max(255).trim(),
  password: z.string().min(6).max(128),
  role: z.enum(["user", "dev"]).default("user"),
});

export const signInSchema = z.object({
  username: z.string().min(2).max(255).trim(),
  password: z.string().min(1),
});
