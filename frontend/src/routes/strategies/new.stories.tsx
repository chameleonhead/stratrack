import { RouterProvider, createMemoryRouter } from "react-router-dom";
import type { Meta, StoryObj } from "@storybook/react";
import { within, expect } from "storybook/test";
import NewStrategy from "./new";

const router = createMemoryRouter([{ path: "/", element: <NewStrategy /> }]);

const meta = {
  component: NewStrategy,
  render: () => <RouterProvider router={router} />,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof NewStrategy>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("戦略新規作成")).toBeInTheDocument();
  },
};
