/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ExecutionContext } from "../domain/types";
import type { BuiltinFunction } from "./types";

export function createChartOperations(context: ExecutionContext): Record<string, BuiltinFunction> {
  const terminal = context.terminal;

  return {
    // Chart operations
    ChartRedraw: (chartId?: number) => {
      if (!terminal) return false;
      return terminal.redrawChart(chartId);
    },

    ChartGetDouble: (chartId: number, propId: number, subWindow: number = 0) => {
      if (!terminal) return 0.0;
      return terminal.getChartProperty(chartId, propId, subWindow);
    },

    ChartGetInteger: (chartId: number, propId: number, subWindow: number = 0) => {
      if (!terminal) return 0;
      return terminal.getChartProperty(chartId, propId, subWindow);
    },

    ChartGetString: (chartId: number, propId: number, subWindow: number = 0) => {
      if (!terminal) return "";
      return terminal.getChartProperty(chartId, propId, subWindow);
    },

    ChartSetDouble: (chartId: number, propId: number, value: number) => {
      if (!terminal) return false;
      return terminal.setChartProperty(chartId, propId, value);
    },

    ChartSetInteger: (chartId: number, propId: number, value: number) => {
      if (!terminal) return false;
      return terminal.setChartProperty(chartId, propId, value);
    },

    ChartSetString: (chartId: number, propId: number, value: string) => {
      if (!terminal) return false;
      return terminal.setChartProperty(chartId, propId, value);
    },

    ChartID: () => {
      if (!terminal) return 0;
      return terminal.getChartId();
    },

    ChartPeriod: (chartId: number = 0) => {
      if (!terminal) return 15;
      return terminal.getChartPeriod(chartId);
    },

    ChartSymbol: (chartId: number = 0) => {
      if (!terminal) return "GBPUSD";
      return terminal.getChartSymbol(chartId);
    },

    // Window operations
    WindowRedraw: () => {
      if (!terminal) return;
      terminal.redrawChart();
    },

    WindowScreenShot: (
      filename: string,
      sizeX: number = 800,
      sizeY: number = 600,
      startBar: number = -1,
      chartScale: number = -1,
      chartMode: number = -1
    ) => {
      // Basic implementation - just return success
      return true;
    },

    // Symbol operations
    Symbol: () => {
      if (!terminal) return "GBPUSD";
      return terminal.getChartSymbol();
    },

    // Additional chart operations based on signatures
    ChartApplyTemplate: (chartId: number, filename: string) => {
      // Basic implementation - just return success
      return true;
    },

    ChartClose: (chartId?: number) => {
      // Basic implementation - just return success
      return true;
    },

    ChartFirst: () => {
      // Basic implementation - return default chart ID
      return 0;
    },

    ChartIndicatorDelete: (chartId: number, windowIndex: number, indicatorShortname: string) => {
      // Basic implementation - just return success
      return true;
    },

    ChartIndicatorName: (chartId: number, windowIndex: number, index: number) => {
      // Basic implementation - return empty string
      return "";
    },

    ChartIndicatorsTotal: (chartId: number, windowIndex: number) => {
      // Basic implementation - return 0
      return 0;
    },

    ChartNavigate: (chartId: number, position: number, shift: number) => {
      // Basic implementation - just return success
      return true;
    },

    ChartNext: (chartId: number) => {
      // Basic implementation - return next chart ID
      return chartId + 1;
    },

    ChartOpen: (symbol: string, period: number) => {
      // Basic implementation - return new chart ID
      return 1;
    },

    ChartPriceOnDropped: () => {
      // Basic implementation - return default price
      return 1.0;
    },

    ChartSaveTemplate: (chartId: number, filename: string) => {
      // Basic implementation - just return success
      return true;
    },

    ChartScreenShot: (
      chartId: number,
      filename: string,
      width: number,
      height: number,
      alignMode?: number
    ) => {
      // Basic implementation - just return success
      return true;
    },

    ChartSetSymbolPeriod: (chartId: number, symbol: string, period: number) => {
      // Basic implementation - just return success
      return true;
    },

    ChartTimeOnDropped: () => {
      // Basic implementation - return current time
      return Math.floor(Date.now() / 1000);
    },

    ChartTimePriceToXY: (
      chartId: number,
      subWindow: number,
      time: number,
      price: number,
      x: number,
      y: number
    ) => {
      // Basic implementation - just return success
      return true;
    },

    ChartWindowFind: (chartId: number, indicatorShortname: string) => {
      // Basic implementation - return default window index
      return 0;
    },

    ChartWindowOnDropped: () => {
      // Basic implementation - return default window index
      return 0;
    },

    ChartXOnDropped: () => {
      // Basic implementation - return default X coordinate
      return 0;
    },

    ChartXYToTimePrice: (
      chartId: number,
      subWindow: number,
      x: number,
      y: number,
      time: number,
      price: number
    ) => {
      // Basic implementation - just return success
      return true;
    },

    ChartYOnDropped: () => {
      // Basic implementation - return default Y coordinate
      return 0;
    },

    // Window information functions
    WindowBarsPerChart: () => {
      if (!terminal) return 100;
      const windowInfo = terminal.getWindowInfo();
      return windowInfo.barsPerChart;
    },

    WindowExpertName: () => {
      // Basic implementation - return default name
      return "Expert";
    },

    WindowFind: () => {
      // Basic implementation - return default window index
      return 0;
    },

    WindowFirstVisibleBar: () => {
      if (!terminal) return 0;
      const windowInfo = terminal.getWindowInfo();
      return windowInfo.firstVisibleBar;
    },

    WindowHandle: () => {
      // Basic implementation - return default handle
      return 0;
    },

    WindowIsVisible: () => {
      if (!terminal) return true;
      const windowInfo = terminal.getWindowInfo();
      return windowInfo.isVisible;
    },

    WindowOnDropped: () => {
      // Basic implementation - return default window index
      return 0;
    },

    WindowPriceMax: () => {
      if (!terminal) return 2.0;
      return terminal.getChartProperty(0, 0); // CHART_PRICE_MAX
    },

    WindowPriceMin: () => {
      if (!terminal) return 1.0;
      return terminal.getChartProperty(0, 1); // CHART_PRICE_MIN
    },

    WindowPriceOnDropped: () => {
      // Basic implementation - return default price
      return 1.0;
    },

    WindowsTotal: () => {
      // Basic implementation - return default total
      return 1;
    },

    WindowTimeOnDropped: () => {
      // Basic implementation - return current time
      return Math.floor(Date.now() / 1000);
    },

    WindowXOnDropped: () => {
      // Basic implementation - return default X coordinate
      return 0;
    },

    WindowYOnDropped: () => {
      // Basic implementation - return default Y coordinate
      return 0;
    },
  };
}
