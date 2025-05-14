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
    <div className={cn(fullWidth ? "fieldset" : "")}>
      <label htmlFor={uniqueId} className={cn(fullWidth ? "fieldset-legend" : "label block")}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        className={cn("input", error ? "input-error" : "")}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="badge badge-primary"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text"
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
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}

export default TagInput;
