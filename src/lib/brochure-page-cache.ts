export type BrochurePageLoader = (source: string, signal: AbortSignal) => Promise<HTMLImageElement>;

type CacheOptions = { capacity?: number; load?: BrochurePageLoader };
type PageIndex = number | null;
type Entry = {
  controller: AbortController;
  promise: Promise<HTMLImageElement>;
  image?: HTMLImageElement;
  used: number;
  users: number;
};

function aborted(): DOMException {
  return new DOMException("The brochure page request was cancelled.", "AbortError");
}

const loadDecodedPage: BrochurePageLoader = async (source, signal) => {
  if (signal.aborted) throw aborted();
  const image = new Image();
  image.decoding = "async";
  const cancel = () => image.removeAttribute("src");
  signal.addEventListener("abort", cancel, { once: true });
  try {
    image.src = source;
    // A completed network request is insufficient: the turning surfaces must
    // have decoded pixels available before the current sheet can move away.
    await image.decode();
    if (signal.aborted) throw aborted();
    if (!image.naturalWidth || !image.naturalHeight) throw new Error(`Unable to decode brochure page: ${source}`);
    return image;
  } finally {
    signal.removeEventListener("abort", cancel);
  }
};

/**
 * Holds decoded Image objects, not just URLs, for the reader's working set.
 * Pin visible, turning and adjacent pages with retain() before ensure().
 * The capacity is a soft limit only while pages are pinned or being requested.
 */
export class BrochurePageCache {
  private readonly sources: readonly string[];
  private readonly capacity: number;
  private readonly load: BrochurePageLoader;
  private readonly entries = new Map<number, Entry>();
  private pinned = new Set<number>();
  private clock = 0;
  private disposed = false;

  constructor(sources: readonly string[], options: CacheOptions = {}) {
    this.sources = [...sources];
    this.capacity = Number.isFinite(options.capacity) ? Math.max(1, Math.floor(options.capacity!)) : 10;
    this.load = options.load ?? loadDecodedPage;
  }

  /** Null represents intentional endpaper and never requires an image. */
  has(index: PageIndex): boolean {
    if (this.disposed) return false;
    if (index === null) return true;
    const entry = this.entries.get(index);
    if (!entry?.image) return false;
    entry.used = ++this.clock;
    return true;
  }

  async ensure(indices: readonly PageIndex[]): Promise<void> {
    if (this.disposed) throw aborted();
    const entries = this.indices(indices).map((index) => {
      const entry = this.entries.get(index) ?? this.create(index);
      entry.used = ++this.clock;
      entry.users += 1;
      return entry;
    });
    try {
      await Promise.all(entries.map((entry) => entry.promise));
      if (this.disposed) throw aborted();
    } finally {
      entries.forEach((entry) => { entry.users -= 1; });
      this.prune();
    }
  }

  /** Replaces the protected working set without eagerly downloading it. */
  retain(indices: readonly PageIndex[]): void {
    if (this.disposed) return;
    this.pinned = new Set(this.indices(indices));
    this.prune();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.entries.forEach((entry) => entry.controller.abort());
    this.entries.clear();
    this.pinned.clear();
  }

  private indices(indices: readonly PageIndex[]): number[] {
    const valid = new Set<number>();
    for (const index of indices) {
      if (index === null) continue;
      if (!Number.isInteger(index) || index < 0 || index >= this.sources.length) {
        throw new RangeError(`Invalid brochure page index: ${index}`);
      }
      valid.add(index);
    }
    return [...valid];
  }

  private create(index: number): Entry {
    const controller = new AbortController();
    let cancel!: () => void;
    const cancellation = new Promise<never>((_, reject) => {
      cancel = () => reject(aborted());
      controller.signal.addEventListener("abort", cancel, { once: true });
    });
    const entry: Entry = {
      controller,
      used: ++this.clock,
      users: 0,
      promise: Promise.race([
        Promise.resolve().then(() => {
          if (controller.signal.aborted) throw aborted();
          return this.load(this.sources[index], controller.signal);
        }),
        cancellation,
      ]).then((image) => {
        if (this.disposed || controller.signal.aborted || this.entries.get(index) !== entry) throw aborted();
        entry.image = image;
        return image;
      }).catch((error: unknown) => {
        // A failed decode must be retriable, never a permanent ready marker.
        if (this.entries.get(index) === entry) this.entries.delete(index);
        throw error;
      }).finally(() => controller.signal.removeEventListener("abort", cancel)),
    };
    this.entries.set(index, entry);
    return entry;
  }

  private prune(): void {
    const available = [...this.entries]
      .filter(([index, entry]) => !this.pinned.has(index) && entry.users === 0)
      .sort(([, a], [, b]) => a.used - b.used);
    for (const [index, entry] of available) {
      if (this.entries.size <= this.capacity) break;
      this.entries.delete(index);
      entry.controller.abort();
    }
  }
}
