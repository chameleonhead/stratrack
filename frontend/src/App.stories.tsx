import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routes } from "./routes";
import App from "./App";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, expect } from "storybook/test";

const router = createMemoryRouter(routes);

const meta: Meta<typeof App> = {
  component: App,
  render: () => {
    return <RouterProvider router={router} />;
  },
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof App>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("ダッシュボード")).toBeInTheDocument();
  },
};
