import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";

export function useLocalValue<T>(
  defaultValue: T,
  value?: T,
  onChange?: (value: T) => void
): [T, Dispatch<SetStateAction<T>>] {
  const [localValue, setLocalValue] = useState<T>(value ?? defaultValue);
  const isControlled = typeof value !== "undefined";

  const updateValue = useCallback(
    (setStateAction: SetStateAction<T>) => {
      setLocalValue((prevState) => {
        const current = isControlled ? (value as T) : prevState;
        const newValue =
          typeof setStateAction === "function"
            ? (setStateAction as (prev: T) => T)(current)
            : setStateAction;

        if (onChange && newValue !== current) {
          onChange(newValue);
        }

        return isControlled ? prevState : newValue;
      });
    },
    [isControlled, onChange, value]
  );

  useEffect(() => {
    if (isControlled && value !== localValue) {
      setLocalValue(value as T);
    }
  }, [isControlled, value, localValue]);

  return [localValue, updateValue];
}
