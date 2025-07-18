function toPlain<T>(value: T): T {
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value));
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const API_KEY = import.meta.env.VITE_API_KEY ?? "";

type DataFileUploadRequest = {
  fileName: string;
  base64Data: string;
};

export function toBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      resolve(base64String.split(",")[1]); // Remove the data URL prefix
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export async function uploadDataFile(dataSourceId: string, file: File) {
  const base64Data = await toBase64(file);
  const body: DataFileUploadRequest = { fileName: file.name, base64Data };

  const res = await fetch(`${API_BASE_URL}/api/data-sources/${dataSourceId}/file`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-functions-key": API_KEY },
    body: JSON.stringify(toPlain(body)),
  });
  if (!res.ok) {
    throw new Error(`Failed to upload data file: ${res.status}`);
  }
  return res;
}

export async function getDataStream(
  dataSourceId: string,
  startTime: string,
  endTime: string,
  format = "tick",
  timeframe?: string
): Promise<string> {
  const params = new URLSearchParams({ startTime, endTime, format });
  if (timeframe) params.append("timeframe", timeframe);
  const res = await fetch(
    `${API_BASE_URL}/api/data-sources/${dataSourceId}/stream?${params.toString()}`,
    {
      headers: { "x-functions-key": API_KEY },
    }
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch data stream: ${res.status}`);
  }
  return res.text();
}

export async function deleteDataChunks(dataSourceId: string, startTime?: string, endTime?: string) {
  const params = new URLSearchParams();
  if (startTime) params.append("startTime", startTime);
  if (endTime) params.append("endTime", endTime);
  const query = params.toString();
  const url = `${API_BASE_URL}/api/data-sources/${dataSourceId}/chunks${query ? `?${query}` : ""}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { "x-functions-key": API_KEY },
  });
  if (!res.ok) {
    throw new Error(`Failed to delete data chunks: ${res.status}`);
  }
}
