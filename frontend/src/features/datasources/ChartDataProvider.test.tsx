// @vitest-environment jsdom
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChartDataProvider, useChartData } from "./ChartDataProvider";
import * as apiDs from "../../api/datasources";
import type { DataSourceDetail } from "../../api/datasources";
import * as apiData from "../../api/data";
import * as idb from "../../idb";
import * as indicatorSvc from "../../services/indicatorEngine";

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

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ChartDataProvider dataSourceId="ds">{children}</ChartDataProvider>
);

describe("ChartDataProvider", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(indicatorSvc, "calculateIndicators").mockResolvedValue({});
  });

  it("loads data on mount", async () => {
    vi.mocked(apiDs.getDataSource).mockResolvedValue(dsDetail);
    vi.mocked(apiData.getDataHistory).mockResolvedValue({
      data: [{ time: "2024-01-01T00:00:00Z", open: 1, high: 2, low: 0, close: 1 }],
      startTime: "2023-12-31T00:00:00Z",
      endTime: "2024-01-01T00:00:00Z",
    });
    vi.mocked(idb.loadCandles).mockResolvedValue([]);
    vi.mocked(idb.hasCandles).mockResolvedValue(false);
    vi.mocked(idb.saveCandles).mockResolvedValue();

    const { result } = renderHook(() => useChartData(), { wrapper });

    await waitFor(() => {
      expect(apiDs.getDataSource).toHaveBeenCalledWith("ds");
    });
    expect(apiData.getDataHistory).toHaveBeenCalled();
    expect(result.current.candleData.length).toBe(1);
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

    const { result } = renderHook(() => useChartData(), { wrapper });

    await waitFor(() => {
      expect(result.current.candleData[0].open).toBe(1);
    });
    expect(apiData.getDataHistory).not.toHaveBeenCalled();
  });

  it("sets error when data fetch fails", async () => {
    vi.mocked(apiDs.getDataSource).mockResolvedValue(dsDetail);
    vi.mocked(apiData.getDataHistory).mockRejectedValue(new Error("fail"));
    vi.mocked(idb.loadCandles).mockResolvedValue([]);
    vi.mocked(idb.hasCandles).mockResolvedValue(false);

    const { result } = renderHook(() => useChartData(), { wrapper });

    await waitFor(() => {
      expect(result.current.error).toBe("fail");
    });
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

    const { result } = renderHook(() => useChartData(), { wrapper });

    await waitFor(() => {
      expect(result.current.candleData.length).toBe(1);
    });

    await act(async () => {
      result.current.setTimeframe("1h");
    });

    await waitFor(() => {
      expect(result.current.candleData.length).toBe(0);
    });
  });

  it("loads additional data when range moves outside the loaded area", async () => {
    const extendedDs = {
      ...dsDetail,
      endTime: new Date(baseTime + 2 * 86400000).toISOString(),
    };
    vi.mocked(apiDs.getDataSource).mockResolvedValue(extendedDs);
    vi.mocked(apiData.getDataHistory).mockResolvedValue({
      data: [{ time: "2024-01-02T00:00:00Z", open: 1, high: 2, low: 0, close: 1 }],
      startTime: "2024-01-01T00:00:00Z",
      endTime: "2024-01-02T00:00:00Z",
    });
    vi.mocked(idb.loadCandles).mockResolvedValue([]);
    vi.mocked(idb.hasCandles).mockResolvedValue(false);
    vi.mocked(idb.saveCandles).mockResolvedValue();

    const { result } = renderHook(() => useChartData(), { wrapper });

    await waitFor(() => {
      expect(apiData.getDataHistory).toHaveBeenCalledTimes(1);
    });
    const initialRange = result.current.range!;

    await act(async () => {
      await result.current.handleRangeChange({
        from: initialRange.from - 3600000,
        to: initialRange.to - 3600000,
      });
    });

    await waitFor(() => {
      expect(apiData.getDataHistory).toHaveBeenCalledTimes(2);
    });
  });

  it("recalculates indicators when timeframe or source changes", async () => {
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

    const { result } = renderHook(() => useChartData(), { wrapper });

    await waitFor(() => {
      expect(indicatorSvc.calculateIndicators).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      result.current.setTimeframe("1h");
    });

    await waitFor(() => {
      expect(indicatorSvc.calculateIndicators).toHaveBeenCalledTimes(2);
    });

    await act(async () => {
      indicatorSvc.setIndicatorSource({ foo: "bar" });
    });

    await waitFor(() => {
      expect(indicatorSvc.calculateIndicators).toHaveBeenCalledTimes(3);
    });
  });
});
