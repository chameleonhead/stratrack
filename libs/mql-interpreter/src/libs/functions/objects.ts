import { BuiltinFunction } from "./types";

// Store for chart objects - in a real implementation this would be more sophisticated
const chartObjects: Record<string, Record<string, any>> = {};

const getObjectKey = (chartId: number, objectName: string) => `${chartId}:${objectName}`;

export const ObjectCreate: BuiltinFunction = (
  chartIdOrName: number | string,
  objectNameOrType?: string,
  typeOrParam1?: number,
  _param1?: any,
  _param2?: any,
  _param3?: any,
  _param4?: any
) => {
  // Handle overloaded parameters
  let chartId: number, objectName: string, type: number;
  
  if (typeof chartIdOrName === "string") {
    // First parameter is object name
    chartId = 0;
    objectName = chartIdOrName;
    type = Number(objectNameOrType) || 0;
  } else {
    // First parameter is chart ID
    chartId = chartIdOrName;
    objectName = objectNameOrType as string;
    type = typeOrParam1 as number;
  }
  
  const key = getObjectKey(chartId, objectName);
  chartObjects[key] = {
    type,
    properties: {},
    created: true
  };
  
  return true;
};

export const ObjectDelete: BuiltinFunction = (
  chartIdOrName: number | string,
  objectName?: string
) => {
  let chartId: number, objName: string;
  
  if (typeof chartIdOrName === "string") {
    chartId = 0;
    objName = chartIdOrName;
  } else {
    chartId = chartIdOrName;
    objName = objectName as string;
  }
  
  const key = getObjectKey(chartId, objName);
  delete chartObjects[key];
  return true;
};

export const ObjectFind: BuiltinFunction = (
  chartIdOrName: number | string,
  objectName?: string
) => {
  let chartId: number, objName: string;
  
  if (typeof chartIdOrName === "string") {
    chartId = 0;
    objName = chartIdOrName;
  } else {
    chartId = chartIdOrName;
    objName = objectName as string;
  }
  
  const key = getObjectKey(chartId, objName);
  return chartObjects[key] ? 0 : -1;
};

export const ObjectGetDouble: BuiltinFunction = (
  chartIdOrName: number | string,
  objectNameOrProp?: string | number,
  propId?: number
) => {
  let chartId: number, objName: string, prop: number;
  
  if (typeof chartIdOrName === "string") {
    chartId = 0;
    objName = chartIdOrName;
    prop = objectNameOrProp as number;
  } else {
    chartId = chartIdOrName;
    objName = objectNameOrProp as string;
    prop = propId as number;
  }
  
  const key = getObjectKey(chartId, objName);
  const obj = chartObjects[key];
  return obj?.properties[prop] || 0.0;
};

export const ObjectGetInteger: BuiltinFunction = (
  chartIdOrName: number | string,
  objectNameOrProp?: string | number,
  propId?: number
) => {
  let chartId: number, objName: string, prop: number;
  
  if (typeof chartIdOrName === "string") {
    chartId = 0;
    objName = chartIdOrName;
    prop = objectNameOrProp as number;
  } else {
    chartId = chartIdOrName;
    objName = objectNameOrProp as string;
    prop = propId as number;
  }
  
  const key = getObjectKey(chartId, objName);
  const obj = chartObjects[key];
  return obj?.properties[prop] || 0;
};

export const ObjectGetString: BuiltinFunction = (
  chartIdOrName: number | string,
  objectNameOrProp?: string | number,
  propId?: number
) => {
  let chartId: number, objName: string, prop: number;
  
  if (typeof chartIdOrName === "string") {
    chartId = 0;
    objName = chartIdOrName;
    prop = objectNameOrProp as number;
  } else {
    chartId = chartIdOrName;
    objName = objectNameOrProp as string;
    prop = propId as number;
  }
  
  const key = getObjectKey(chartId, objName);
  const obj = chartObjects[key];
  return obj?.properties[prop] || "";
};

export const ObjectSetDouble: BuiltinFunction = (
  chartIdOrName: number | string,
  objectNameOrProp?: string | number,
  propIdOrValue?: number,
  value?: number
) => {
  let chartId: number, objName: string, prop: number, val: number;
  
  if (typeof chartIdOrName === "string") {
    chartId = 0;
    objName = chartIdOrName;
    prop = objectNameOrProp as number;
    val = propIdOrValue as number;
  } else {
    chartId = chartIdOrName;
    objName = objectNameOrProp as string;
    prop = propIdOrValue as number;
    val = value as number;
  }
  
  const key = getObjectKey(chartId, objName);
  if (!chartObjects[key]) {
    chartObjects[key] = { type: 0, properties: {}, created: false };
  }
  chartObjects[key].properties[prop] = val;
  return true;
};

export const ObjectSetInteger: BuiltinFunction = (
  chartIdOrName: number | string,
  objectNameOrProp?: string | number,
  propIdOrValue?: number,
  value?: number
) => {
  let chartId: number, objName: string, prop: number, val: number;
  
  if (typeof chartIdOrName === "string") {
    chartId = 0;
    objName = chartIdOrName;
    prop = objectNameOrProp as number;
    val = propIdOrValue as number;
  } else {
    chartId = chartIdOrName;
    objName = objectNameOrProp as string;
    prop = propIdOrValue as number;
    val = value as number;
  }
  
  const key = getObjectKey(chartId, objName);
  if (!chartObjects[key]) {
    chartObjects[key] = { type: 0, properties: {}, created: false };
  }
  chartObjects[key].properties[prop] = val;
  return true;
};

export const ObjectSetString: BuiltinFunction = (
  chartIdOrName: number | string,
  objectNameOrProp?: string | number,
  propIdOrValue?: number | string,
  value?: string
) => {
  let chartId: number, objName: string, prop: number, val: string;
  
  if (typeof chartIdOrName === "string") {
    chartId = 0;
    objName = chartIdOrName;
    prop = objectNameOrProp as number;
    val = propIdOrValue as string;
  } else {
    chartId = chartIdOrName;
    objName = objectNameOrProp as string;
    prop = propIdOrValue as number;
    val = value as string;
  }
  
  const key = getObjectKey(chartId, objName);
  if (!chartObjects[key]) {
    chartObjects[key] = { type: 0, properties: {}, created: false };
  }
  chartObjects[key].properties[prop] = val;
  return true;
};

export const ObjectsTotal: BuiltinFunction = (chartId = 0, _subWindow = -1, _type = -1) => {
  // Basic implementation - return number of objects for the chart
  return Object.keys(chartObjects).filter(key => key.startsWith(`${chartId}:`)).length;
};

export const ObjectName: BuiltinFunction = (chartId = 0, index: number, _subWindow = -1, _type = -1) => {
  // Basic implementation - return object name by index
  const objects = Object.keys(chartObjects).filter(key => key.startsWith(`${chartId}:`));
  if (index >= 0 && index < objects.length) {
    return objects[index].split(':')[1];
  }
  return "";
};

export const ObjectType: BuiltinFunction = (
  chartIdOrName: number | string,
  objectName?: string
) => {
  let chartId: number, objName: string;
  
  if (typeof chartIdOrName === "string") {
    chartId = 0;
    objName = chartIdOrName;
  } else {
    chartId = chartIdOrName;
    objName = objectName as string;
  }
  
  const key = getObjectKey(chartId, objName);
  const obj = chartObjects[key];
  return obj?.type || -1;
};

