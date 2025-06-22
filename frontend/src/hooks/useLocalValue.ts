import { Dispatch, SetStateAction, useCallback, useState } from "react";

export function useLocalValue<T>(
  defaultValue: T,
  value?: T,
  onChange?: (value: T) => void
): [T, Dispatch<SetStateAction<T>>] {
  const [internalValue, setInternalValue] = useState<T>(defaultValue);

  const isControlled = typeof value !== "undefined";
  const currentValue = isControlled ? (value as T) : internalValue;

  const updateValue = useCallback(
    (action: SetStateAction<T>) => {
      const newValue =
        typeof action === "function" ? (action as (prev: T) => T)(currentValue) : action;

      if (!isControlled) {
        setInternalValue(newValue);
      }

      if (onChange && newValue !== currentValue) {
        onChange(newValue);
      }
    },
    [currentValue, isControlled, onChange]
  );

  return [currentValue, updateValue];
}
