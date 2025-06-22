import { RouterProvider, createMemoryRouter } from "react-router-dom";
import type { Meta, StoryObj } from "@storybook/react";
import { within, expect } from "storybook/test";
import EditStrategy from "./edit";

const sample = {
  id: "1",
  name: "Sample",
  description: "desc",
  tags: [],
  template: {},
  createdAt: "",
  updatedAt: "",
};

const meta = {
  component: EditStrategy,
  render: () => {
    window.fetch = async () => ({ ok: true, json: async () => sample }) as Response;
    const router = createMemoryRouter([{ path: "/:strategyId/edit", element: <EditStrategy /> }], {
      initialEntries: ["/1/edit"],
    });
    return <RouterProvider router={router} />;
  },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof EditStrategy>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("戦略編集")).toBeInTheDocument();
  },
};
