import { useCallback } from "react";
import Input from "../../components/Input";
import TagInput from "../../components/TagInput";
import Textarea from "../../components/Textarea";
import { Strategy } from "../types";

export type BasicInfoProps = {
  value: Partial<Strategy>;
  onChange?: (value: Partial<Strategy>) => void;
};

function BasicInfo({ value, onChange }: BasicInfoProps) {
  return (
    <section id="basic-info" className="space-y-4">
      <h2>基本情報</h2>
      <Input
        label="戦略名"
        value={value.name || ""}
        onChange={useCallback(
          (newvalue: string) => {
            if (onChange) {
              onChange({ ...value, name: newvalue });
            }
          },
          [onChange, value]
        )}
        required
        fullWidth
      />
      <Input
        label="戦略名（英語名）"
        value={value.nameEn || ""}
        onChange={useCallback(
          (newvalue: string) => {
            if (onChange) {
              onChange({ ...value, nameEn: newvalue });
            }
          },
          [onChange, value]
        )}
        required
        fullWidth
      />
      <Textarea
        label="説明"
        value={value.description || ""}
        onChange={useCallback(
          (newvalue: string) => {
            if (onChange) {
              onChange({ ...value, description: newvalue });
            }
          },
          [onChange, value]
        )}
        name="description"
        rows={3}
        fullWidth
      />
      <TagInput
        label="タグ"
        value={value.tags || []}
        onChange={useCallback(
          (newvalue: string[]) => {
            if (onChange) {
              onChange({ ...value, tags: newvalue });
            }
          },
          [onChange, value]
        )}
        name="tags"
        fullWidth
      />
    </section>
  );
}

export default BasicInfo;
