import { RouterProvider, createMemoryRouter } from "react-router-dom";
import type { Meta, StoryObj } from "@storybook/react";
import { within, expect } from "storybook/test";
import Settings from "./index";

const router = createMemoryRouter([{ path: "/", element: <Settings /> }]);

const meta = {
  component: Settings,
  render: () => <RouterProvider router={router} />,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Settings>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("設定")).toBeInTheDocument();
    await expect(canvas.getByLabelText("通貨ペア")).toBeInTheDocument();
  },
};
