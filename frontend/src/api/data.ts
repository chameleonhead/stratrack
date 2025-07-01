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

export async function uploadDataFile(dataSourceId: string, file: File) {
  const buf = await file.arrayBuffer();
  const base64Data = btoa(String.fromCharCode(...new Uint8Array(buf)));
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
