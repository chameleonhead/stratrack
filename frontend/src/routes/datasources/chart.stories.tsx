import { RouterProvider, createMemoryRouter } from "react-router-dom";
import type { Meta, StoryObj } from "@storybook/react";
import { within, expect, userEvent } from "storybook/test";
import ChartDataSource from "./chart";
import type { HistoryOhlc } from "../../api/data";

// サンプルデータソース
const sampleDataSource = {
  id: "1",
  name: "EUR/USD Sample",
  symbol: "EURUSD",
  timeframe: "1m",
  format: "candle",
  volume: "none",
  description: "サンプルのEUR/USDデータソース",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

// サンプルチャートデータ - API形式
const generateSampleHistoryData = (count: number = 100) => {
  const data: HistoryOhlc[] = [];
  const baseTime = Date.now() - count * 60000; // 1分間隔
  let price = 1.1;

  for (let i = 0; i < count; i++) {
    const change = (Math.random() - 0.5) * 0.01;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * 0.005;
    const low = Math.min(open, close) - Math.random() * 0.005;

    data.push({
      time: new Date(baseTime + i * 60000).toISOString(),
      open,
      high,
      low,
      close,
    });

    price = close;
  }

  const startTime = new Date(baseTime).toISOString();
  const endTime = new Date(baseTime + count * 60000).toISOString();

  return { data, startTime, endTime };
};

const createStoryRouter = (
  mockFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
) => {
  window.fetch = mockFetch;
  return createMemoryRouter([{ path: "/:dataSourceId/chart", element: <ChartDataSource /> }], {
    initialEntries: ["/1/chart"],
  });
};

const meta = {
  component: ChartDataSource,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "チャート表示コンポーネントのストーリー。様々な状態やシナリオを確認できます。",
      },
    },
  },
} satisfies Meta<typeof ChartDataSource>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const router = createStoryRouter(async (url) => {
      const urlString = url.toString();

      if (urlString.includes("/data-sources/1") && !urlString.includes("/history")) {
        // データソース情報API
        return { ok: true, json: async () => sampleDataSource } as Response;
      } else if (urlString.includes("/history")) {
        // チャートデータAPI
        const historyData = generateSampleHistoryData(50);
        const mockHeaders = new Headers({
          "X-Start-Time": historyData.startTime,
          "X-End-Time": historyData.endTime,
        });
        return {
          ok: true,
          json: async () => historyData.data,
          headers: { get: (name: string) => mockHeaders.get(name) },
        } as Response;
      }

      return { ok: false, status: 404 } as Response;
    });
    return <RouterProvider router={router} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("チャート表示")).toBeInTheDocument();
  },
};

export const WithChartData: Story = {
  render: () => {
    const historyData = generateSampleHistoryData(50);
    const router = createStoryRouter(async (url) => {
      const urlString = url.toString();

      if (urlString.includes("/data-sources/1") && !urlString.includes("/history")) {
        // データソース情報API
        return { ok: true, json: async () => sampleDataSource } as Response;
      } else if (urlString.includes("/history")) {
        // チャートデータAPI
        const mockHeaders = new Headers({
          "X-Start-Time": historyData.startTime,
          "X-End-Time": historyData.endTime,
        });
        return {
          ok: true,
          json: async () => historyData.data,
          headers: { get: (name: string) => mockHeaders.get(name) },
        } as Response;
      }

      return { ok: false, status: 404 } as Response;
    });
    return <RouterProvider router={router} />;
  },
  parameters: {
    docs: {
      description: {
        story: "実際のチャートデータが表示される状態",
      },
    },
  },
};

export const LoadingState: Story = {
  render: () => {
    const router = createStoryRouter(async (url) => {
      const urlString = url.toString();

      if (urlString.includes("/data-sources/1") && !urlString.includes("/history")) {
        // データソース情報は早く返す
        return { ok: true, json: async () => sampleDataSource } as Response;
      } else if (urlString.includes("/history")) {
        // チャートデータは遅く返す（ローディング状態をシミュレート）
        await new Promise((resolve) => setTimeout(resolve, 10000));
        const historyData = generateSampleHistoryData(50);
        const mockHeaders = new Headers({
          "X-Start-Time": historyData.startTime,
          "X-End-Time": historyData.endTime,
        });
        return {
          ok: true,
          json: async () => historyData.data,
          headers: { get: (name: string) => mockHeaders.get(name) },
        } as Response;
      }

      return { ok: false, status: 404 } as Response;
    });
    return <RouterProvider router={router} />;
  },
  parameters: {
    docs: {
      description: {
        story: "データ読み込み中の状態",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText("チャート表示");
  },
};

export const ErrorState: Story = {
  render: () => {
    const router = createStoryRouter(async (url) => {
      const urlString = url.toString();

      if (urlString.includes("/data-sources/1") && !urlString.includes("/history")) {
        // データソース情報は正常に返す
        return { ok: true, json: async () => sampleDataSource } as Response;
      } else if (urlString.includes("/history")) {
        // チャートデータでエラーを発生
        return { ok: false, status: 500, statusText: "Internal Server Error" } as Response;
      }

      return { ok: false, status: 404 } as Response;
    });
    return <RouterProvider router={router} />;
  },
  parameters: {
    docs: {
      description: {
        story: "エラーが発生した状態",
      },
    },
  },
};

export const DifferentTimeframes: Story = {
  render: () => {
    const router = createStoryRouter(async (url) => {
      const urlString = url.toString();

      if (urlString.includes("/data-sources/1") && !urlString.includes("/history")) {
        // 1時間足のデータソース
        return {
          ok: true,
          json: async () => ({ ...sampleDataSource, timeframe: "1h" }),
        } as Response;
      } else if (urlString.includes("/history")) {
        // チャートデータAPI
        const historyData = generateSampleHistoryData(24); // 24時間分
        const mockHeaders = new Headers({
          "X-Start-Time": historyData.startTime,
          "X-End-Time": historyData.endTime,
        });
        return {
          ok: true,
          json: async () => historyData.data,
          headers: { get: (name: string) => mockHeaders.get(name) },
        } as Response;
      }

      return { ok: false, status: 404 } as Response;
    });
    return <RouterProvider router={router} />;
  },
  parameters: {
    docs: {
      description: {
        story: "異なる時間足（1時間足）でのチャート表示",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 時間足セレクトボックスが表示されることを確認
    const timeframeSelect = await canvas.findByLabelText("時間足");
    await expect(timeframeSelect).toBeInTheDocument();
  },
};

export const InteractiveTimeframeChange: Story = {
  render: () => {
    const router = createStoryRouter(async (url) => {
      const urlString = url.toString();

      if (urlString.includes("/data-sources/1") && !urlString.includes("/history")) {
        return { ok: true, json: async () => sampleDataSource } as Response;
      } else if (urlString.includes("/history")) {
        // URLから時間足パラメータを取得
        const urlObj = new URL(urlString, "http://localhost");
        const timeframe = urlObj.searchParams.get("timeframe") || "1m";

        // 時間足に応じてデータ数を調整
        let count = 50;
        if (timeframe === "5m") count = 30;
        else if (timeframe === "1h") count = 24;

        const historyData = generateSampleHistoryData(count);
        const mockHeaders = new Headers({
          "X-Start-Time": historyData.startTime,
          "X-End-Time": historyData.endTime,
        });
        return {
          ok: true,
          json: async () => historyData.data,
          headers: { get: (name: string) => mockHeaders.get(name) },
        } as Response;
      }

      return { ok: false, status: 404 } as Response;
    });
    return <RouterProvider router={router} />;
  },
  parameters: {
    docs: {
      description: {
        story: "時間足を変更する操作のテスト",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 時間足セレクトボックスを見つけて操作
    const timeframeSelect = await canvas.findByLabelText("時間足");
    await userEvent.selectOptions(timeframeSelect, "5m");

    // 選択が変更されたことを確認
    await expect(timeframeSelect).toHaveValue("5m");
  },
};

export const LargeDataset: Story = {
  render: () => {
    const router = createStoryRouter(async (url) => {
      const urlString = url.toString();

      if (urlString.includes("/data-sources/1") && !urlString.includes("/history")) {
        return { ok: true, json: async () => sampleDataSource } as Response;
      } else if (urlString.includes("/history")) {
        // 大量データ（1000本のローソク足）
        const historyData = generateSampleHistoryData(1000);
        const mockHeaders = new Headers({
          "X-Start-Time": historyData.startTime,
          "X-End-Time": historyData.endTime,
        });
        return {
          ok: true,
          json: async () => historyData.data,
          headers: { get: (name: string) => mockHeaders.get(name) },
        } as Response;
      }

      return { ok: false, status: 404 } as Response;
    });
    return <RouterProvider router={router} />;
  },
  parameters: {
    docs: {
      description: {
        story: "大量データでのパフォーマンステスト（1000本のローソク足）",
      },
    },
  },
};

export const DifferentSymbols: Story = {
  render: () => {
    const gbpusdDataSource = {
      ...sampleDataSource,
      id: "2",
      name: "GBP/USD Sample",
      symbol: "GBPUSD",
      description: "サンプルのGBP/USDデータソース",
    };
    const router = createStoryRouter(async (url) => {
      const urlString = url.toString();

      if (urlString.includes("/data-sources/2") && !urlString.includes("/history")) {
        return { ok: true, json: async () => gbpusdDataSource } as Response;
      } else if (urlString.includes("/history")) {
        // GBP/USD向けのデータ（価格帯は1.2付近）
        const historyData = generateSampleHistoryData(50);
        // 価格を調整
        historyData.data = historyData.data.map((item) => ({
          ...item,
          open: item.open + 0.1,
          high: item.high + 0.1,
          low: item.low + 0.1,
          close: item.close + 0.1,
        }));

        const mockHeaders = new Headers({
          "X-Start-Time": historyData.startTime,
          "X-End-Time": historyData.endTime,
        });
        return {
          ok: true,
          json: async () => historyData.data,
          headers: { get: (name: string) => mockHeaders.get(name) },
        } as Response;
      }

      return { ok: false, status: 404 } as Response;
    });
    return <RouterProvider router={router} />;
  },
  parameters: {
    docs: {
      description: {
        story: "異なる通貨ペア（GBP/USD）でのチャート表示",
      },
    },
  },
};

export const EmptyData: Story = {
  render: () => {
    const router = createStoryRouter(async (url) => {
      const urlString = url.toString();

      if (urlString.includes("/data-sources/1") && !urlString.includes("/history")) {
        return { ok: true, json: async () => sampleDataSource } as Response;
      } else if (urlString.includes("/history")) {
        // 空のデータ
        const emptyData = {
          data: [],
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
        };
        const mockHeaders = new Headers({
          "X-Start-Time": emptyData.startTime,
          "X-End-Time": emptyData.endTime,
        });
        return {
          ok: true,
          json: async () => emptyData.data,
          headers: { get: (name: string) => mockHeaders.get(name) },
        } as Response;
      }

      return { ok: false, status: 404 } as Response;
    });
    return <RouterProvider router={router} />;
  },
  parameters: {
    docs: {
      description: {
        story: "データが空の状態",
      },
    },
  },
};

export const NetworkError: Story = {
  render: () => {
    const router = createStoryRouter(async (url) => {
      const urlString = url.toString();

      if (urlString.includes("/data-sources/1") && !urlString.includes("/history")) {
        return { ok: true, json: async () => sampleDataSource } as Response;
      } else if (urlString.includes("/history")) {
        // ネットワークエラーをシミュレート
        return { ok: false, status: 500, statusText: "Internal Server Error" } as Response;
      }

      return { ok: false, status: 404 } as Response;
    });
    return <RouterProvider router={router} />;
  },
  parameters: {
    docs: {
      description: {
        story: "ネットワークエラーが発生した状態",
      },
    },
  },
};

export const VolatileData: Story = {
  render: () => {
    const router = createStoryRouter(async (url) => {
      const urlString = url.toString();

      if (urlString.includes("/data-sources/1") && !urlString.includes("/history")) {
        return { ok: true, json: async () => sampleDataSource } as Response;
      } else if (urlString.includes("/history")) {
        // 変動の激しいデータを生成
        const volatileData: HistoryOhlc[] = [];
        const baseTime = Date.now() - 100 * 60000;
        let price = 1.1;

        for (let i = 0; i < 100; i++) {
          const change = (Math.random() - 0.5) * 0.05; // より大きな変動
          const open = price;
          const close = price + change;
          const high = Math.max(open, close) + Math.random() * 0.02;
          const low = Math.min(open, close) - Math.random() * 0.02;

          volatileData.push({
            time: new Date(baseTime + i * 60000).toISOString(),
            open,
            high,
            low,
            close,
          });

          price = close;
        }

        const startTime = new Date(baseTime).toISOString();
        const endTime = new Date(baseTime + 100 * 60000).toISOString();
        const mockHeaders = new Headers({
          "X-Start-Time": startTime,
          "X-End-Time": endTime,
        });
        return {
          ok: true,
          json: async () => volatileData,
          headers: { get: (name: string) => mockHeaders.get(name) },
        } as Response;
      }

      return { ok: false, status: 404 } as Response;
    });
    return <RouterProvider router={router} />;
  },
  parameters: {
    docs: {
      description: {
        story: "変動の激しいマーケットデータでのチャート表示",
      },
    },
  },
};

export const DifferentCurrencyPairs: Story = {
  render: () => {
    const usdjpyDataSource = {
      ...sampleDataSource,
      id: "3",
      name: "USD/JPY Sample",
      symbol: "USDJPY",
      description: "サンプルのUSD/JPYデータソース",
    };

    const router = createStoryRouter(async (url) => {
      const urlString = url.toString();

      if (urlString.includes("/data-sources/3") && !urlString.includes("/history")) {
        return { ok: true, json: async () => usdjpyDataSource } as Response;
      } else if (urlString.includes("/history")) {
        // USD/JPY向けのデータ（価格帯が異なる）
        const usdjpyData: HistoryOhlc[] = [];
        const baseTime = Date.now() - 50 * 60000;
        let price = 150.0;

        for (let i = 0; i < 50; i++) {
          const change = (Math.random() - 0.5) * 2.0;
          const open = price;
          const close = price + change;
          const high = Math.max(open, close) + Math.random() * 1.0;
          const low = Math.min(open, close) - Math.random() * 1.0;

          usdjpyData.push({
            time: new Date(baseTime + i * 60000).toISOString(),
            open,
            high,
            low,
            close,
          });

          price = close;
        }

        const startTime = new Date(baseTime).toISOString();
        const endTime = new Date(baseTime + 50 * 60000).toISOString();
        const mockHeaders = new Headers({
          "X-Start-Time": startTime,
          "X-End-Time": endTime,
        });
        return {
          ok: true,
          json: async () => usdjpyData,
          headers: { get: (name: string) => mockHeaders.get(name) },
        } as Response;
      }

      return { ok: false, status: 404 } as Response;
    });
    return <RouterProvider router={router} />;
  },
  parameters: {
    docs: {
      description: {
        story: "USD/JPYのような価格帯の異なる通貨ペア",
      },
    },
  },
};

export const SlowLoading: Story = {
  render: () => {
    const router = createStoryRouter(async (url) => {
      const urlString = url.toString();

      if (urlString.includes("/data-sources/1") && !urlString.includes("/history")) {
        // データソース情報は早く返す
        return { ok: true, json: async () => sampleDataSource } as Response;
      } else if (urlString.includes("/history")) {
        // チャートデータは遅く返す
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const historyData = generateSampleHistoryData(30);
        const mockHeaders = new Headers({
          "X-Start-Time": historyData.startTime,
          "X-End-Time": historyData.endTime,
        });
        return {
          ok: true,
          json: async () => historyData.data,
          headers: { get: (name: string) => mockHeaders.get(name) },
        } as Response;
      }

      return { ok: false, status: 404 } as Response;
    });
    return <RouterProvider router={router} />;
  },
  parameters: {
    docs: {
      description: {
        story: "チャートデータの読み込みが遅い状態",
      },
    },
  },
};
