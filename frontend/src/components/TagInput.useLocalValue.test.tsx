// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import TagInput from "./TagInput";
import { useState } from "react";

function Wrapper() {
  const [tags, setTags] = useState<string[]>([]);
  return <TagInput label="タグ" name="tags" value={tags} onChange={setTags} />;
}

describe("TagInput with useLocalValue", () => {
  it("mounts without infinite loop", () => {
    const div = document.createElement("div");
    expect(() => {
      act(() => {
        const root = createRoot(div);
        root.render(<Wrapper />);
      });
    }).not.toThrow();
  });
});
