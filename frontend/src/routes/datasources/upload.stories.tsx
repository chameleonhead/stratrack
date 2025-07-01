import { RouterProvider, createMemoryRouter } from "react-router-dom";
import type { Meta, StoryObj } from "@storybook/react";
import UploadDataFile from "./upload";

const router = createMemoryRouter([{ path: "/", element: <UploadDataFile /> }]);

const meta = {
  component: UploadDataFile,
  render: () => <RouterProvider router={router} />,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof UploadDataFile>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
