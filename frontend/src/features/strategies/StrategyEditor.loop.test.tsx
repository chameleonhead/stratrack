// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { useState } from "react";
import StrategyEditor from "./StrategyEditor";

function Wrapper() {
  const [state, setState] = useState({ template: {} });
  return <StrategyEditor value={state} onChange={setState} />;
}

describe("StrategyEditor controlled mode", () => {
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
