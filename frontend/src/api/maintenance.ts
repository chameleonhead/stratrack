const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const API_KEY = import.meta.env.VITE_API_KEY ?? "";

export async function resetDatabase() {
  const res = await fetch(`${API_BASE_URL}/api/maintenance/reset`, {
    method: "POST",
    headers: { "x-functions-key": API_KEY },
  });
  if (!res.ok) {
    throw new Error(`Failed to reset database: ${res.status}`);
  }
}
