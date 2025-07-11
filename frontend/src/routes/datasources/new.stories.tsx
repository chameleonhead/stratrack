import { RouterProvider, createMemoryRouter } from "react-router-dom";
import type { Meta, StoryObj } from "@storybook/react";
import { within, expect } from "storybook/test";
import NewDataSource from "./new";

const router = createMemoryRouter([{ path: "/", element: <NewDataSource /> }]);

const meta = {
  component: NewDataSource,
  render: () => <RouterProvider router={router} />,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof NewDataSource>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("データソース新規作成")).toBeInTheDocument();
  },
};
