import { openDB, type DBSchema } from "idb";

export interface Candle {
  dataSourceId: string;
  timeframe: string;
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface StratrackDB extends DBSchema {
  candles: {
    key: [string, string, number];
    value: Candle;
  };
}

const dbPromise = openDB<StratrackDB>("stratrack", 1, {
  upgrade(db) {
    db.createObjectStore("candles", { keyPath: ["dataSourceId", "timeframe", "time"] });
  },
});

export async function saveCandles(dsId: string, timeframe: string, candles: Candle[]) {
  const db = await dbPromise;
  const tx = db.transaction("candles", "readwrite");
  for (const c of candles) {
    await tx.store.put({ ...c, dataSourceId: dsId, timeframe });
  }
  await tx.done;
}

export async function loadCandles(
  dsId: string,
  timeframe: string,
  from: number,
  to: number
): Promise<Candle[]> {
  const db = await dbPromise;
  const range = IDBKeyRange.bound([dsId, timeframe, from], [dsId, timeframe, to]);
  return db.getAll("candles", range);
}
