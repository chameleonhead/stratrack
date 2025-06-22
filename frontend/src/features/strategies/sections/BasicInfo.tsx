import { useCallback } from "react";
import Input from "../../../components/Input";
import TagInput from "../../../components/TagInput";
import Textarea from "../../../components/Textarea";
import { Strategy } from "../../../codegen/dsl/strategy";
import { useLocalValue } from "../../../hooks/useLocalValue";

export type BasicInfoProps = {
  value?: Partial<Strategy>;
  onChange?: (value: Partial<Strategy>) => void;
};

function BasicInfo({ value, onChange }: BasicInfoProps) {
  const [localValue, setLocalValue] = useLocalValue({ tags: [] }, value, onChange);
  return (
    <section id="basic-info" className="space-y-4">
      <h2>基本情報</h2>
      <Input
        label="戦略名"
        value={localValue.name || ""}
        onChange={useCallback(
          (newvalue: string) => {
            setLocalValue((currentValue) => ({ ...currentValue, name: newvalue }));
          },
          [setLocalValue]
        )}
        required
        fullWidth
      />
      <Input
        label="戦略名（英語名）"
        value={localValue.nameEn || ""}
        onChange={useCallback(
          (newvalue: string) => {
            setLocalValue((currentValue) => ({ ...currentValue, nameEn: newvalue }));
          },
          [setLocalValue]
        )}
        required
        fullWidth
      />
      <Textarea
        label="説明"
        value={localValue.description || ""}
        onChange={useCallback(
          (newvalue: string) => {
            setLocalValue((currentValue) => ({ ...currentValue, description: newvalue }));
          },
          [setLocalValue]
        )}
        name="description"
        rows={3}
        fullWidth
      />
      <TagInput
        label="タグ"
        value={localValue.tags}
        onChange={useCallback(
          (newvalue: string[]) => {
            setLocalValue((currentValue) => ({ ...currentValue, tags: newvalue }));
          },
          [setLocalValue]
        )}
        name="tags"
        fullWidth
      />
    </section>
  );
}

export default BasicInfo;
