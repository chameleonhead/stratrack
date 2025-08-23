import { BuiltinFunction } from "./types";

export const ChartRedraw: BuiltinFunction = (_chartId?: number) => {
  // Basic implementation - just return success
  // In a real implementation, this would trigger chart redraw
  return true;
};

export const ChartGetDouble: BuiltinFunction = (_chartId: number, propId: number, _subWindow = 0) => {
  // Basic implementation - return dummy values for common chart properties
  switch (propId) {
    case 0: // CHART_PRICE_MAX
      return 2.0;
    case 1: // CHART_PRICE_MIN  
      return 1.0;
    default:
      return 0.0;
  }
};

export const ChartGetInteger: BuiltinFunction = (_chartId: number, propId: number, _subWindow = 0) => {
  // Basic implementation - return dummy values for common chart properties
  switch (propId) {
    case 0: // CHART_BRING_TO_TOP
      return 1;
    case 1: // CHART_HEIGHT_IN_PIXELS
      return 600;
    case 2: // CHART_WIDTH_IN_PIXELS
      return 800;
    case 3: // CHART_WIDTH_IN_BARS
      return 100;
    default:
      return 0;
  }
};

export const ChartGetString: BuiltinFunction = (_chartId: number, propId: number, _subWindow = 0) => {
  // Basic implementation - return dummy values
  switch (propId) {
    case 0: // CHART_COMMENT
      return "";
    default:
      return "";
  }
};

export const ChartSetDouble: BuiltinFunction = (_chartId: number, _propId: number, _value: number) => {
  // Basic implementation - just return success
  return true;
};

export const ChartSetInteger: BuiltinFunction = (_chartId: number, _propId: number, _value: number) => {
  // Basic implementation - just return success
  return true;
};

export const ChartSetString: BuiltinFunction = (_chartId: number, _propId: number, _value: string) => {
  // Basic implementation - just return success
  return true;
};

export const ChartID: BuiltinFunction = () => {
  // Return default chart ID
  return 0;
};

export const ChartPeriod: BuiltinFunction = (_chartId = 0) => {
  // Return M15 period (15 minutes)
  return 15;
};

export const ChartSymbol: BuiltinFunction = (_chartId = 0) => {
  // Return default symbol
  return "GBPUSD";
};

export const WindowRedraw: BuiltinFunction = () => {
  // Basic implementation - just return success
  return;
};

export const WindowScreenShot: BuiltinFunction = (
  _filename: string,
  _sizeX = 800,
  _sizeY = 600,
  _startBar = -1,
  _chartScale = -1,
  _chartMode = -1
) => {
  // Basic implementation - just return success
  return true;
};

export const Symbol: BuiltinFunction = () => {
  // Return default symbol
  return "GBPUSD";
};
