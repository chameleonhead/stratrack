import { RouterProvider, createMemoryRouter } from "react-router-dom";
import type { Meta, StoryObj } from "@storybook/react";
import { within, expect } from "storybook/test";
import NewDukascopyJob from "./new";

const router = createMemoryRouter([{ path: "/", element: <NewDukascopyJob /> }]);

const meta = {
  component: NewDukascopyJob,
  render: () => <RouterProvider router={router} />,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof NewDukascopyJob>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Dukascopy抽出ジョブ作成")).toBeInTheDocument();
  },
};
