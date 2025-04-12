import Input from "./Input";
import { useLocalValue } from "../hooks/useLocalValue";

export type NumberInputProps = {
  label?: string;
  id?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  defaultValue?: number;
  value?: number | null;
  onChange?: (value: number | null) => void;
  required?: boolean;
  error?: string;
  fullWidth?: boolean;
};

function NumberInput({ defaultValue, value, onChange, ...props }: NumberInputProps) {
  const [localValue, setLocalValue] = useLocalValue(
    defaultValue?.toString() || "",
    typeof value === "undefined" ? undefined : value?.toString() || "",
    (value) => {
      if (onChange) {
        if (value === "") {
          onChange(null);
        } else if (!isNaN(parseFloat(value))) {
          onChange(parseFloat(value));
        }
      }
    }
  );
  return <Input {...props} type="number" value={localValue} onChange={setLocalValue} />;
}

export default NumberInput;
