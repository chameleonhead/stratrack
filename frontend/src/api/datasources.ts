export type DataFormat = "tick" | "ohlc";
export type VolumeType = "none" | "actual" | "tickCount";

export type NewDataSourceRequest = {
  name: string;
  symbol: string;
  timeframe: string;
  format: DataFormat;
  volume?: VolumeType;
  description?: string;
};

export type DataSourceSummary = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type DataSourceDetail = {
  id: string;
  name: string;
  symbol: string;
  timeframe: string;
  format: DataFormat;
  volume: VolumeType;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const API_KEY = import.meta.env.VITE_API_KEY ?? "";

export async function listDataSources(): Promise<DataSourceSummary[]> {
  const res = await fetch(`${API_BASE_URL}/api/data-sources`, {
    headers: { "x-functions-key": API_KEY },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch data sources: ${res.status}`);
  }
  return res.json();
}

export async function getDataSource(id: string): Promise<DataSourceDetail> {
  const res = await fetch(`${API_BASE_URL}/api/data-sources/${id}`, {
    headers: { "x-functions-key": API_KEY },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch data source: ${res.status}`);
  }
  return res.json();
}

function toPlain<T>(value: T): T {
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value));
  }
}

export async function createDataSource(data: NewDataSourceRequest) {
  const res = await fetch(`${API_BASE_URL}/api/data-sources`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-functions-key": API_KEY,
    },
    body: JSON.stringify(toPlain(data)),
  });
  if (!res.ok) {
    throw new Error(`Failed to create data source: ${res.status}`);
  }
  return res.json();
}

export type UpdateDataSourceRequest = {
  name: string;
  description?: string;
};

export async function updateDataSource(id: string, data: UpdateDataSourceRequest) {
  const res = await fetch(`${API_BASE_URL}/api/data-sources/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-functions-key": API_KEY,
    },
    body: JSON.stringify(toPlain(data)),
  });
  if (!res.ok) {
    throw new Error(`Failed to update data source: ${res.status}`);
  }
  return res.json();
}

export async function deleteDataSource(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/data-sources/${id}`, {
    method: "DELETE",
    headers: { "x-functions-key": API_KEY },
  });
  if (!res.ok) {
    throw new Error(`Failed to delete data source: ${res.status}`);
  }
}
