import { z } from "zod";

export const formatZodErrors = (
  input: z.ZodError | z.ZodIssue[],
  options?: {
    maxToShow?: number;
    page?: number;
    showField?: boolean;
  },
) => {
  const { maxToShow = 4, page = 1, showField = true } = options ?? {};

  const issues: z.ZodIssue[] = Array.isArray(input) ? input : input.issues;

  const start = Math.max(0, (page - 1) * maxToShow);
  const displayErrors = issues.slice(start, start + maxToShow);
  const remaining = Math.max(0, issues.length - (start + displayErrors.length));

  const formattedErrors = displayErrors
    .map((err) => {
      const field = err.path.join(".").replace(/_/g, " ");
      const formattedField = field
        ? field.charAt(0).toUpperCase() + field.slice(1)
        : "Field";

      return showField
        ? `• ${formattedField}: ${err.message}`
        : `• ${err.message}`;
    })
    .join("\n");

  return remaining > 0
    ? `${formattedErrors}\n\n... +${remaining} more ${remaining === 1 ? "error" : "errors"}`
    : formattedErrors;
};
