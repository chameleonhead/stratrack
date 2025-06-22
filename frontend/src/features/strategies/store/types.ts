export type Strategy = {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  version?: string;
  createdAt?: string;
  updatedAt?: string;
  template: Record<string, number | string | boolean | object | null>;
};

export type StrategyDraft = {
  id: string;
  original: Strategy;
  draft: Strategy;
  isDirty: boolean;
  conflict: boolean;
};

export type SaveStatus = "idle" | "pending" | "success" | "error" | "conflict";
export type SyncStatus = "online" | "offline" | "syncing" | "queued";

export type SyncJobType = "upload-local-changes" | "merge-remote-data";

export type SyncJobStatus = "pending" | "running" | "completed" | "failed";

export type SyncJob = {
  id: string;
  type: SyncJobType;
  name: string;
  status: SyncJobStatus;
  error?: string;
  lastUpdated: string; // ISO 8601形式の日時
};

export type UseStrategyStore = {
  // 戦略一覧（SSOT）
  strategies: Strategy[];
  refetchStrategies: () => Promise<void>;

  // ドラフト管理（複数）
  drafts: Record<string, StrategyDraft>;
  currentDraftId: string | null;
  setCurrentDraft: (id: string) => void;

  createDraft: (strategy: Strategy) => void;
  updateDraft: (changes: Partial<Strategy>) => void;
  resetDraft: (id?: string) => void;
  discardDraft: (id: string) => void;

  // 保存処理
  saveStatus: SaveStatus;
  saveDraft: (id: string) => Promise<void>;

  // オフライン・同期状態
  syncStatus: SyncStatus;
  retrySync: () => Promise<void>;

  // ジョブ管理（バックテストなし）
  syncJobs: SyncJob[];
  addSyncJob: (job: Omit<SyncJob, "id" | "lastUpdated">) => void;
  updateSyncJobStatus: (jobId: string, status: SyncJobStatus, error?: string) => void;
  clearCompletedJobs: () => void;

  // キャッシュ操作
  loadFromCache: () => Promise<void>;
  persistToCache: () => Promise<void>;
};
