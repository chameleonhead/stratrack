// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import {
  ChartDataProvider,
  useChartData,
  type ChartDataContextValue,
} from "./ChartDataProvider";
import * as apiDs from "../../api/datasources";
import type { DataSourceDetail } from "../../api/datasources";
import * as apiData from "../../api/data";
import * as idb from "../../idb";

vi.mock("../../api/datasources");
vi.mock("../../api/data");
vi.mock("../../idb");

const baseTime = Date.parse("2024-01-01T00:00:00Z");
const dsDetail: DataSourceDetail = {
  id: "ds",
  name: "ds",
  symbol: "EURUSD",
  timeframe: "1m",
  format: "ohlc" as const,
  volume: "tickCount" as const,
  createdAt: "",
  updatedAt: "",
  startTime: new Date(baseTime).toISOString(),
  endTime: new Date(baseTime + 86400000).toISOString(),
};

function Consumer({ onValue }: { onValue: (v: ChartDataContextValue) => void }) {
  const value = useChartData();
  onValue(value);
  return null;
}

describe("ChartDataProvider", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("loads data on mount", async () => {
    vi.mocked(apiDs.getDataSource).mockResolvedValue(dsDetail);
    vi.mocked(apiData.getDataStream).mockResolvedValue(
      "time,open,high,low,close\n2024-01-01T00:00:00Z,1,2,0,1"
    );
    vi.mocked(idb.loadCandles).mockResolvedValue([]);
    vi.mocked(idb.hasCandles).mockResolvedValue(false);
    vi.mocked(idb.saveCandles).mockResolvedValue();

    let ctx: ChartDataContextValue | undefined;
    const div = document.createElement("div");
    await act(async () => {
      const root = createRoot(div);
      root.render(
        <ChartDataProvider dataSourceId="ds">
          <Consumer onValue={(v) => (ctx = v)} />
        </ChartDataProvider>
      );
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(apiDs.getDataSource).toHaveBeenCalledWith("ds");
    expect(apiData.getDataStream).toHaveBeenCalled();
    expect(ctx?.candleData.length).toBe(1);
  });

  it("uses cached data when available", async () => {
    vi.mocked(apiDs.getDataSource).mockResolvedValue(dsDetail);
    vi.mocked(idb.hasCandles).mockResolvedValue(true);
    vi.mocked(idb.loadCandles).mockResolvedValue([
      {
        dataSourceId: "ds",
        timeframe: "5m",
        time: baseTime,
        open: 1,
        high: 2,
        low: 0,
        close: 1,
      },
    ]);

    let ctx: ChartDataContextValue | undefined;
    const div = document.createElement("div");
    await act(async () => {
      const root = createRoot(div);
      root.render(
        <ChartDataProvider dataSourceId="ds">
          <Consumer onValue={(v) => (ctx = v)} />
        </ChartDataProvider>
      );
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(apiData.getDataStream).not.toHaveBeenCalled();
    expect(ctx?.candleData[0].open).toBe(1);
  });

  it("sets error when data fetch fails", async () => {
    vi.mocked(apiDs.getDataSource).mockResolvedValue(dsDetail);
    vi.mocked(apiData.getDataStream).mockRejectedValue(new Error("fail"));
    vi.mocked(idb.loadCandles).mockResolvedValue([]);
    vi.mocked(idb.hasCandles).mockResolvedValue(false);

    let ctx: ChartDataContextValue | undefined;
    const div = document.createElement("div");
    await act(async () => {
      const root = createRoot(div);
      root.render(
        <ChartDataProvider dataSourceId="ds">
          <Consumer onValue={(v) => (ctx = v)} />
        </ChartDataProvider>
      );
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(ctx?.error).toBe("fail");
  });

  it("clears data when timeframe changes", async () => {
    vi.mocked(apiDs.getDataSource).mockResolvedValue(dsDetail);
    vi.mocked(idb.hasCandles).mockResolvedValue(true);
    vi.mocked(idb.loadCandles).mockResolvedValue([
      {
        dataSourceId: "ds",
        timeframe: "5m",
        time: baseTime,
        open: 1,
        high: 2,
        low: 0,
        close: 1,
      },
    ]);

    let ctx: ChartDataContextValue | undefined;
    const div = document.createElement("div");
    await act(async () => {
      const root = createRoot(div);
      root.render(
        <ChartDataProvider dataSourceId="ds">
          <Consumer onValue={(v) => (ctx = v)} />
        </ChartDataProvider>
      );
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(ctx?.candleData.length).toBe(1);

    await act(async () => {
      ctx?.setTimeframe("1h");
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(ctx?.candleData.length).toBe(0);
  });
});
