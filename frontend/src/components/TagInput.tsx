import { useCallback, useMemo, useRef, useState } from "react";
import { cn } from "../utils";
import { useLocalValue } from "../hooks/useLocalValue";

export type TagInputProps = {
  label: string;
  name: string;
  id?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string[];
  value?: string[];
  onChange?: (value: string[]) => void;
  error?: string;
  fullWidth?: boolean;
};

function TagInput({
  label,
  name,
  id,
  required,
  placeholder,
  defaultValue,
  value,
  onChange,
  error,
  fullWidth = false,
}: TagInputProps) {
  const uniqueId = useMemo(() => id || `tag-${Math.random().toString(36).slice(2, 9)}`, [id]);
  const [tags, setTags] = useLocalValue(defaultValue || [], value, onChange);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim();
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed]);
      }
      setInputValue("");
    },
    [tags, setTags]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim() !== "") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "") {
      e.preventDefault();
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <div className={cn(fullWidth ? "w-full" : null, "space-y-1")}>
      <label htmlFor={uniqueId} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        className={cn(
          "flex flex-wrap gap-2 p-2 border rounded min-h-[44px]",
          error ? "border-red-500 ring-red-500" : "border-gray-300",
          "focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center bg-blue-100 text-blue-800 text-sm px-2 rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 text-xs text-blue-500 hover:text-blue-700"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          id={uniqueId}
          name={name}
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[100px] border-none focus:outline-none text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
    </div>
  );
}

export default TagInput;
