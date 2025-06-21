// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { useState } from "react";
import BasicInfo from "./BasicInfo";
import { Strategy } from "../../../codegen/dsl/strategy";

function Wrapper() {
  const [state, setState] = useState<Partial<Strategy>>({});
  return <BasicInfo value={state} onChange={setState} />;
}

describe("BasicInfo", () => {
  it("mounts without infinite loop when tags are undefined", () => {
    const div = document.createElement("div");
    expect(() => {
      act(() => {
        const root = createRoot(div);
        root.render(<Wrapper />);
      });
    }).not.toThrow();
  });
});
