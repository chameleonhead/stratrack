import { RouterProvider, createMemoryRouter } from "react-router-dom";
import type { Meta, StoryObj } from "@storybook/react";
import { within, expect } from "storybook/test";
import { vi } from "vitest";
import DukascopyJobs from "./dukascopy-jobs";

const router = createMemoryRouter([{ path: "/", element: <DukascopyJobs /> }]);

const meta = {
  component: DukascopyJobs,
  render: () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }) as unknown as typeof fetch;
    return <RouterProvider router={router} />;
  },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof DukascopyJobs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Dukascopyジョブ管理")).toBeInTheDocument();
  },
};
