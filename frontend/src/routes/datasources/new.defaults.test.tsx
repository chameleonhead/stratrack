// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import NewDataSource from "./new";
import * as api from "../../api/datasources";

vi.mock("../../api/datasources");

vi.mock("../../features/datasources/DataSourceForm", () => ({
  default: ({ onChange }: { onChange?: (v: unknown) => void }) => {
    onChange?.({ name: "ds1", symbol: "EURUSD" });
    return null;
  },
}));

describe("NewDataSource", () => {
  it("submits default values when optional fields are untouched", async () => {
    const router = createMemoryRouter([{ path: "/", element: <NewDataSource /> }]);

    const div = document.createElement("div");
    await act(async () => {
      const root = createRoot(div);
      root.render(<RouterProvider router={router} />);
    });

    const form = div.querySelector("form")!;
    await act(async () => {
      form.requestSubmit();
    });

    expect(api.createDataSource).toHaveBeenCalledWith({
      name: "ds1",
      symbol: "EURUSD",
      timeframe: "1m",
      format: "tick",
      volume: "none",
    });
  });
});
