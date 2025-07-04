import { useEffect, useState } from "react";
import { ZodSchema } from "zod";

export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export function useZodValidation<T>(schema: ZodSchema<T>, value: T) {
  const [errors, setErrors] = useState<ValidationErrors<T>>({});

  useEffect(() => {
    const result = schema.safeParse(value);
    if (!result.success) {
      const fieldErrors = result.error.formErrors.fieldErrors;
      const newErrors: ValidationErrors<T> = {};
      for (const key in fieldErrors) {
        const message = fieldErrors[key as keyof typeof fieldErrors]?.[0];
        if (message) {
          newErrors[key as keyof T] = message;
        }
      }
      setErrors(newErrors);
    } else {
      setErrors({});
    }
  }, [schema, value]);

  return errors;
}
