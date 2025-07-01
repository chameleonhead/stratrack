import { RouterProvider, createMemoryRouter } from "react-router-dom";
import type { Meta, StoryObj } from "@storybook/react";
import UploadTickFile from "./upload";

const router = createMemoryRouter([{ path: "/", element: <UploadTickFile /> }]);

const meta = {
  component: UploadTickFile,
  render: () => <RouterProvider router={router} />,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof UploadTickFile>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
