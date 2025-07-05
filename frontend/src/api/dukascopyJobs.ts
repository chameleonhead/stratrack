function toPlain<T>(value: T): T {
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value));
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const API_KEY = import.meta.env.VITE_API_KEY ?? "";

export type CreateDukascopyJobRequest = {
  symbol: string;
  startTime: string;
};

export async function createDukascopyJob(data: CreateDukascopyJobRequest) {
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
