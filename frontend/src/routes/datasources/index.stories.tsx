import { RouterProvider, createMemoryRouter, useNavigate } from "react-router-dom";
import type { Meta, StoryObj } from "@storybook/react";
import IndexDataSource from "./index";

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

const Page = ({ content }: { content: string }) => {
  const navigate = useNavigate()
  return <div>
    <div>{content}</div>
    <div><button onClick={() => navigate(-1)}>戻る</button></div>
  </div>
}

const meta = {
  component: IndexDataSource,
  render: () => {
    window.fetch = async () => ({ ok: true, json: async () => [sample] }) as Response;
    const router = createMemoryRouter(
      [
        { path: "/data-sources", element: <IndexDataSource /> },
        { path: "/data-sources/:dataSourceId/edit", element: <Page content="編集" /> },
        { path: "/data-sources/:dataSourceId/upload", element: <Page content="アップロード" /> },
        { path: "/data-sources/:dataSourceId/chart", element: <Page content="チャート" /> },
        { path: "/data-sources/new", element: <Page content="新規" /> }
      ],
      {
        initialEntries: ["/data-sources"],
      }
    );
    return <RouterProvider router={router} />;
  },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof IndexDataSource>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
};
