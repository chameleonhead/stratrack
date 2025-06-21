export type NewStrategyRequest = {
  name: string;
  description?: string;
  tags?: string[];
  template: Record<string, unknown>;
  generatedCode?: string;
};

export type StrategySummary = {
  id: string;
  name: string;
  latestVersion: number;
  latestVersionId: string;
  createdAt: string;
  updatedAt: string;
};

export type StrategyDetail = {
  id: string;
  latestVersion?: number;
  latestVersionId?: string;
  name: string;
  description?: string;
  tags: string[];
  template: Record<string, unknown>;
  generatedCode?: string;
  createdAt: string;
  updatedAt: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export async function listStrategies(): Promise<StrategySummary[]> {
  const res = await fetch(`${API_BASE_URL}/api/strategies`);
  if (!res.ok) {
    throw new Error(`Failed to fetch strategies: ${res.status}`);
  }
  return res.json();
}

export async function getStrategy(id: string): Promise<StrategyDetail> {
  const res = await fetch(`${API_BASE_URL}/api/strategies/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch strategy: ${res.status}`);
  }
  return res.json();
}

export async function createStrategy(data: NewStrategyRequest) {
  const res = await fetch(`${API_BASE_URL}/api/strategies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Failed to create strategy: ${res.status}`);
  }
  return res.json();
}
