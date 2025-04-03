import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "../utils";

export type CheckboxProps = {
  label: string;
  id?: string;
  name?: string;
  value?: string;
  onChange?: (value: boolean) => void;
  checked?: boolean;
  error?: string;
  className?: string;
};

function Checkbox({
  label,
  id,
  name,
  value,
  onChange,
  checked,
  error,
  className,
}: CheckboxProps) {
  const uniqueId = useMemo(
    () => id || `checkbox-${Math.random().toString(36).slice(2, 9)}`,
    [id]
  );

  const [localChecked, setLocalChecked] = useState(checked ?? false);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const isChecked = event.target.checked;
      onChange?.(isChecked);

      if (typeof checked === "undefined") {
        setLocalChecked(isChecked);
      }
    },
    [onChange, checked]
  );

  useEffect(() => {
    if (typeof checked !== "undefined") {
      setLocalChecked(checked);
    }
  }, [checked]);

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <input
        id={uniqueId}
        name={name}
        value={value}
        type="checkbox"
        checked={localChecked}
        onChange={handleChange}
        className={cn(
          "h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition",
          error ? "border-red-500 ring-red-500 focus:ring-red-500" : ""
        )}
      />
      <label
        htmlFor={uniqueId}
        className="text-sm text-gray-800 select-none cursor-pointer"
      >
        {label}
      </label>
      {error && (
        <p className="text-sm text-red-600 font-medium ml-2">{error}</p>
      )}
    </div>
  );
}

export default Checkbox;
