import Input from "./Input";

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
};

function NumberInput({
  defaultValue,
  value,
  onChange,
  ...props
}: NumberInputProps) {
  return (
    <Input
      {...props}
      type="number"
      defaultValue={
        typeof defaultValue === "undefined"
          ? undefined
          : defaultValue.toString()
      }
      value={
        typeof value === "undefined"
          ? undefined
          : value === null
          ? ""
          : value.toString()
      }
      onChange={(newValue) => {
        const parsedValue = newValue ? parseFloat(newValue) : null;
        onChange?.(parsedValue);
      }}
    />
  );
}

export default NumberInput;