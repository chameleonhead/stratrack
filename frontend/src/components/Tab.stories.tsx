import Tab from "./Tab";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

const meta: Meta<typeof Tab> = {
  component: Tab,
  args: {
    tabs: [
      {
        id: "info",
        label: "基本情報",
        content: <div>ユーザーの基本情報です。</div>,
      },
      {
        id: "history",
        label: "履歴",
        content: <div>利用履歴を表示します。</div>,
      },
      {
        id: "notifications",
        label: "通知設定",
        content: <div>通知の設定内容です。</div>,
      },
    ],
    onSelectedIndexChnage: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof Tab>;

export const Basic: Story = {};

export const Controlled: Story = {
  args: {
    selectedIndex: 1,
  },
};

export const Error: Story = {
  args: {
    tabs: [
      {
        id: "info",
        label: "基本情報",
        content: <div>ユーザーの基本情報です。</div>,
      },
      {
        id: "history",
        label: "履歴",
        content: <div>利用履歴を表示します。</div>,
        error: true,
      },
      {
        id: "notifications",
        label: "通知設定",
        content: <div>通知の設定内容です。</div>,
      },
    ],
  },
};

export const Disabled: Story = {
  args: {
    tabs: [
      {
        id: "info",
        label: "基本情報",
        content: <div>ユーザーの基本情報です。</div>,
      },
      {
        id: "history",
        label: "履歴",
        content: <div>利用履歴を表示します。</div>,
        disabled: true,
      },
      {
        id: "notifications",
        label: "通知設定",
        content: <div>通知の設定内容です。</div>,
      },
    ],
  },
};
