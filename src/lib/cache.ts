type Entry<T> = { value: T; expires: number };

export class TtlCache<T> {
  private store = new Map<string, Entry<T>>();
  private readonly ttlMs: number;

  constructor(ttlMs: number) {
    this.ttlMs = ttlMs;
  }

  get(key: string): T | undefined {
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (Date.now() > hit.expires) {
      this.store.delete(key);
      return undefined;
    }
    return hit.value;
  }

  set(key: string, value: T): void {
    this.store.set(key, { value, expires: Date.now() + this.ttlMs });
  }

  invalidate(key?: string): void {
    if (key === undefined) this.store.clear();
    else this.store.delete(key);
  }
}
