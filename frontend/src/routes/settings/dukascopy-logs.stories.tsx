import { RouterProvider, createMemoryRouter } from "react-router-dom";
import type { Meta, StoryObj } from "@storybook/react";
import { within, expect } from "storybook/test";
import { vi } from "vitest";
import DukascopyLogs from "./dukascopy-logs";

const router = createMemoryRouter([{ path: "/", element: <DukascopyLogs /> }]);

const meta = {
  component: DukascopyLogs,
  render: () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }) as unknown as typeof fetch;
    return <RouterProvider router={router} />;
  },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof DukascopyLogs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Dukascopyログ/)).toBeInTheDocument();
  },
};
