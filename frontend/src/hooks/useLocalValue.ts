import { useCallback, useEffect, useState } from "react";

export function useLocalValue<T>(
  defaultValue: T,
  value?: T,
  onChange?: (value: T) => void
): [T, (newValue: T) => void] {
  const [localValue, setLocalValue] = useState(value ?? defaultValue);

  const updateValue = useCallback(
    (newValue: T) => {
      onChange?.(newValue);
      if (typeof value === "undefined") {
        setLocalValue(newValue);
      }
    },
    [onChange, value]
  );

  useEffect(() => {
    if (typeof value !== "undefined") {
      setLocalValue(value);
    }
  }, [value]);

  return [localValue, updateValue];
}
