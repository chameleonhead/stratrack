function toPlain<T>(value: T): T {
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value));
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const API_KEY = import.meta.env.VITE_API_KEY ?? "";

export type DukascopyJobSummary = {
  id: string;
  dataSourceId: string;
  symbol: string;
  startTime: string;
  isEnabled: boolean;
  isRunning: boolean;
  lastProcessStartedAt?: string;
  lastProcessFinishedAt?: string;
  lastProcessSucceeded?: boolean;
  lastProcessError?: string;
  updatedAt: string;
};

export type CreateDukascopyJobRequest = {
  symbol: string;
  startTime: string;
};

type CreateDukascopyJobResponse = { id: string; dataSourceId: string };

export async function createDukascopyJob(
  data: CreateDukascopyJobRequest
): Promise<CreateDukascopyJobResponse> {
  const res = await fetch(`${API_BASE_URL}/api/dukascopy-job`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-functions-key": API_KEY,
    },
    body: JSON.stringify(toPlain(data)),
  });
  if (!res.ok) {
    throw new Error(`Failed to create dukascopy job: ${res.status}`);
  }
  return res.json();
}

export async function enableDukascopyJob(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/dukascopy-job/${id}/enable`, {
    method: "POST",
    headers: { "x-functions-key": API_KEY },
  });
  if (!res.ok) {
    throw new Error(`Failed to enable dukascopy job: ${res.status}`);
  }
}

export async function disableDukascopyJob(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/dukascopy-job/${id}/disable`, {
    method: "POST",
    headers: { "x-functions-key": API_KEY },
  });
  if (!res.ok) {
    throw new Error(`Failed to disable dukascopy job: ${res.status}`);
  }
}

export async function startDukascopyJobExecution(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/dukascopy-job/${id}/execute`, {
    method: "POST",
    headers: { "x-functions-key": API_KEY },
  });
  if (!res.ok) {
    throw new Error(`Failed to start dukascopy job execution: ${res.status}`);
  }
}

export type UpdateDukascopyJobRequest = {
  dataSourceId: string;
  startTime: string;
};

export async function updateDukascopyJob(id: string, data: UpdateDukascopyJobRequest) {
  const res = await fetch(`${API_BASE_URL}/api/dukascopy-job/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-functions-key": API_KEY,
    },
    body: JSON.stringify(toPlain(data)),
  });
  if (!res.ok) {
    throw new Error(`Failed to update dukascopy job: ${res.status}`);
  }
}

export async function listDukascopyJobs(): Promise<DukascopyJobSummary[]> {
  const res = await fetch(`${API_BASE_URL}/api/dukascopy-job`, {
    headers: { "x-functions-key": API_KEY },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch dukascopy jobs: ${res.status}`);
  }
  return res.json();
}

export type DukascopyJobLog = {
  executedAt: string;
  isSuccess: boolean;
  symbol: string;
  targetTime: string;
  errorMessage?: string;
  duration: number;
};

export async function listDukascopyJobLogs(id: string): Promise<DukascopyJobLog[]> {
  const res = await fetch(`${API_BASE_URL}/api/dukascopy-job/${id}/logs`, {
    headers: { "x-functions-key": API_KEY },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch dukascopy job logs: ${res.status}`);
  }
  return res.json();
}

export async function listAllDukascopyJobLogs(
  page = 1,
  pageSize = 100
): Promise<DukascopyJobLog[]> {
  const res = await fetch(
    `${API_BASE_URL}/api/dukascopy-job/logs?page=${page}&pageSize=${pageSize}`,
    { headers: { "x-functions-key": API_KEY } }
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch dukascopy job logs: ${res.status}`);
  }
  return res.json();
}
