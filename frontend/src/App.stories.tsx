import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routes } from "./routes";
import App from "./App";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, expect, userEvent, waitFor } from "storybook/test";

const meta: Meta<typeof App> = {
  component: App,
  render: () => {
    const router = createMemoryRouter(routes);
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
    await expect(canvas.getAllByText("ダッシュボード")[0]).toBeInTheDocument();
  },
};

export const NewStrategy: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /新規戦略作成/ }));
    await waitFor(async () => {
      await expect(canvas.getByRole("heading", { name: "戦略新規作成" })).toBeInTheDocument();
    });

    await userEvent.type(canvas.getByLabelText("戦略名"), "Test Strategy");
    await userEvent.click(canvas.getByRole("button", { name: "作成" }));
  },
};
