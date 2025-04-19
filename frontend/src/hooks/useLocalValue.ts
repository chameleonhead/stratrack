import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";

export function useLocalValue<T>(
  defaultValue: T,
  value?: T | undefined,
  onChange?: (value: T) => void
): [T, Dispatch<SetStateAction<T>>] {
  const [localValue, setLocalValue] = useState<T>(value ?? defaultValue);
  const isValueUndefined = typeof value === "undefined";

  const updateValue = useCallback(
    (setStateAction: SetStateAction<T>) => {
      const promise = new Promise<T>((resolve) => {
        setLocalValue(prevState => {
          const newValue = typeof setStateAction === "function"
            ? (setStateAction as (prevState: T) => T)(prevState)
            : setStateAction;
          resolve(newValue);
          if (isValueUndefined) {
            return newValue
          } else {
            return prevState;
          }
        })
      });
      if (onChange) {
        promise.then(onChange)
      }
    },
    [onChange, isValueUndefined]
  );

  useEffect(() => {
    if (typeof value !== "undefined") {
      if (value !== localValue) {
        setLocalValue(value);
      }
    }
  }, [value, localValue]);

  return [localValue, updateValue];
}
