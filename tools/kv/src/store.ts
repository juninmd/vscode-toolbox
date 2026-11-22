import { mkdirSync } from "node:fs";

export interface Entry {
  value: unknown;
  updatedAt: number;
  expiresAt: number | null;
}

const DATA_DIR = process.env.DATA_DIR ?? "data";
const FILE = `${DATA_DIR}/kv.json`;

export class KVStore {
  private map = new Map<string, Entry>();
  // Resolves once the on-disk snapshot is merged in; writes wait on it so an
  // early set() is not clobbered by the late load.
  private ready: Promise<void> = Promise.resolve();

  constructor(private persist = true) {
    if (this.persist) {
      mkdirSync(DATA_DIR, { recursive: true });
      this.ready = this.load();
    }
  }

  private async load(): Promise<void> {
    try {
      this.map = new Map(Object.entries(await Bun.file(FILE).json()));
      this.sweep();
    } catch {}
  }

  private async flush(): Promise<void> {
    if (this.persist) await Bun.write(FILE, JSON.stringify(Object.fromEntries(this.map)));
  }

  private live(key: string, now: number): Entry | undefined {
    const e = this.map.get(key);
    if (!e) return undefined;
    if (e.expiresAt !== null && e.expiresAt <= now) {
      this.map.delete(key);
      return undefined;
    }
    return e;
  }

  get(key: string, now = Date.now()): unknown | undefined {
    return this.live(key, now)?.value;
  }

  async set(key: string, value: unknown, ttlSec?: number): Promise<Entry> {
    await this.ready;
    return this.put(key, value, ttlSec && ttlSec > 0 ? Date.now() + ttlSec * 1000 : null);
  }

  private async put(key: string, value: unknown, expiresAt: number | null): Promise<Entry> {
    const entry: Entry = { value, updatedAt: Date.now(), expiresAt };
    this.map.set(key, entry);
    await this.flush();
    return entry;
  }

  async del(key: string): Promise<boolean> {
    await this.ready;
    const ok = this.map.delete(key);
    if (ok) await this.flush();
    return ok;
  }

  // Atomically adds `by` to a numeric value (missing/expired = 0). Throws if the
  // existing value isn't a number. Keeps the entry's TTL.
  async incr(key: string, by = 1, now = Date.now()): Promise<number> {
    await this.ready;
    const existing = this.live(key, now);
    const cur = existing?.value ?? 0;
    if (typeof cur !== "number") throw new Error("value is not a number");
    const next = cur + by;
    await this.put(key, next, existing?.expiresAt ?? null);
    return next;
  }

  list(now = Date.now()): Array<{ key: string; updatedAt: number; expiresAt: number | null; bytes: number }> {
    const out = [];
    for (const [key] of this.map) {
      const e = this.live(key, now);
      if (!e) continue;
      out.push({ key, updatedAt: e.updatedAt, expiresAt: e.expiresAt, bytes: Buffer.byteLength(JSON.stringify(e.value)) });
    }
    return out.sort((a, b) => a.key.localeCompare(b.key));
  }

  sweep(now = Date.now()): number {
    let n = 0;
    for (const [key, e] of this.map) {
      if (e.expiresAt !== null && e.expiresAt <= now) {
        this.map.delete(key);
        n++;
      }
    }
    if (n) void this.flush();
    return n;
  }
}
