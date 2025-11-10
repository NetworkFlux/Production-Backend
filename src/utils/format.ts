import { ZodError } from "zod";

export const formatValidationError = (
  errors: ZodError<{
    username: string;
    password: string;
    role?: "user" | "dev";
  }>
): string => {
  if (!errors || !errors.issues) return "Validation failed";

  if (Array.isArray(errors.issues))
    return errors.issues.map(i => i.message).join(", ");

  return JSON.stringify(errors);
};
