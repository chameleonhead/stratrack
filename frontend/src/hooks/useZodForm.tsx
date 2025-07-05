import { useCallback, useEffect, useState } from "react";
import { ZodSchema } from "zod";
import { ValidationErrors } from "./useZodValidation";

export type ZodFormHandle = {
  validate: () => boolean;
  reset: () => void;
};

export function useZodForm<T>(
  schema: ZodSchema<T>,
  value: T
): {
  errors: ValidationErrors<T>;
  validate: () => boolean;
  reset: () => void;
} {
  const [errors, setErrors] = useState<ValidationErrors<T>>({});
  const [showErrors, setShowErrors] = useState(false);

  const runValidation = useCallback(() => {
    const result = schema.safeParse(value);
    if (!result.success) {
      const fieldErrors = result.error.formErrors.fieldErrors;
      const newErrors: ValidationErrors<T> = {} as ValidationErrors<T>;
      for (const key in fieldErrors) {
        const message = (fieldErrors as Record<string, string[]>)[key]?.[0];
        if (message) {
          newErrors[key as keyof T] = message;
        }
      }
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [schema, value]);

  useEffect(() => {
    if (showErrors) {
      runValidation();
    }
  }, [showErrors, runValidation]);

  const validate = useCallback(() => {
    setShowErrors(true);
    return runValidation();
  }, [runValidation]);

  const reset = useCallback(() => {
    setShowErrors(false);
    setErrors({});
  }, []);

  return { errors: showErrors ? errors : {}, validate, reset };
}
