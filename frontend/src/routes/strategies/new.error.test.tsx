// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import NewStrategy from "./new";
import * as api from "../../api/strategies";

vi.mock("../../api/strategies");

vi.mock("../../features/strategies/StrategyEditor", () => ({
  default: ({ onChange }: { onChange?: (v: unknown) => void }) => {
    onChange?.({ name: "test", template: {} });
    return null;
  },
}));

describe("NewStrategy", () => {
  it("displays error message when creation fails", async () => {
    vi.mocked(api.createStrategy).mockRejectedValue(new Error("failed"));

    const router = createMemoryRouter([{ path: "/", element: <NewStrategy /> }]);

    const div = document.createElement("div");
    await act(async () => {
      const root = createRoot(div);
      root.render(<RouterProvider router={router} />);
    });

    const form = div.querySelector("form")!;
    await act(async () => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    expect(div.querySelector(".text-error")?.textContent).toBe("failed");
  });
});
