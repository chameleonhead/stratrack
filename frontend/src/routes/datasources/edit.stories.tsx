import { RouterProvider, createMemoryRouter } from "react-router-dom";
import type { Meta, StoryObj } from "@storybook/react";
import { within, expect } from "storybook/test";
import EditDataSource from "./edit";

const sample = {
  id: "1",
  name: "Sample",
  symbol: "EURUSD",
  timeframe: "1m",
  format: "tick",
  volume: "none",
  description: "desc",
  createdAt: "",
  updatedAt: "",
};

const meta = {
  component: EditDataSource,
  render: () => {
    window.fetch = async () => ({ ok: true, json: async () => sample }) as Response;
    const router = createMemoryRouter(
      [{ path: "/:dataSourceId/edit", element: <EditDataSource /> }],
      {
        initialEntries: ["/1/edit"],
      }
    );
    return <RouterProvider router={router} />;
  },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof EditDataSource>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("データソース編集")).toBeInTheDocument();
  },
};
