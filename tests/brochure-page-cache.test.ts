import test from "node:test";
import assert from "node:assert/strict";
import { BrochurePageCache, type BrochurePageLoader } from "../src/lib/brochure-page-cache";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

const page = (src: string) => ({ src, naturalWidth: 1200, naturalHeight: 1600 }) as HTMLImageElement;
const sources = Array.from({ length: 81 }, (_, index) => `/page-${index}.webp`);

test("a slow first spread is not ready until every required image decodes", async () => {
  const first = deferred<HTMLImageElement>();
  const second = deferred<HTMLImageElement>();
  const cache = new BrochurePageCache(sources, { load: (src) => src === sources[0] ? first.promise : second.promise });
  let ready = false;
  const pending = cache.ensure([0, 1, null]).then(() => { ready = true; });
  await Promise.resolve();
  assert.equal(cache.has(0), false);
  assert.equal(cache.has(1), false);
  first.resolve(page(sources[0]));
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(cache.has(0), true);
  assert.equal(cache.has(1), false);
  assert.equal(ready, false);
  second.resolve(page(sources[1]));
  await pending;
  assert.equal(ready, true);
  assert.equal(cache.has(1), true);
  cache.dispose();
});

test("overlapping and repeated navigation shares one request per page", async () => {
  const decoded = deferred<HTMLImageElement>();
  const calls: string[] = [];
  const cache = new BrochurePageCache(sources, { load: (src) => { calls.push(src); return decoded.promise; } });
  const first = cache.ensure([1, 1, null]);
  const second = cache.ensure([1]);
  await Promise.resolve();
  assert.deepEqual(calls, [sources[1]]);
  decoded.resolve(page(sources[1]));
  await Promise.all([first, second]);
  await cache.ensure([1]);
  assert.deepEqual(calls, [sources[1]]);
  cache.dispose();
});

test("decode failure rejects readiness and permits a real retry", async () => {
  let attempts = 0;
  const cache = new BrochurePageCache(sources, { load: async (src) => {
    attempts += 1;
    if (attempts === 1) throw new Error("Image decode failed");
    return page(src);
  } });
  await assert.rejects(cache.ensure([3]), /decode failed/);
  assert.equal(cache.has(3), false);
  await cache.ensure([3]);
  assert.equal(cache.has(3), true);
  assert.equal(attempts, 2);
  cache.dispose();
});

test("retaining nearby pages does not fetch the whole brochure", async () => {
  const calls: string[] = [];
  const cache = new BrochurePageCache(sources, { load: async (src) => { calls.push(src); return page(src); } });
  cache.retain([0, 1, 2]);
  assert.deepEqual(calls, []);
  await cache.ensure([0, 1, 2]);
  assert.deepEqual(calls, sources.slice(0, 3));
  assert.equal(cache.has(80), false);
  cache.dispose();
});

test("a bounded LRU preserves visible sheets and evicts old unpinned pixels", async () => {
  const calls: string[] = [];
  const cache = new BrochurePageCache(sources, { capacity: 3, load: async (src) => { calls.push(src); return page(src); } });
  cache.retain([0]);
  await cache.ensure([0, 1, 2]);
  assert.equal(cache.has(1), true); // Page 2 is now the least recently used.
  await cache.ensure([3]);
  assert.equal(cache.has(0), true);
  assert.equal(cache.has(1), true);
  assert.equal(cache.has(2), false);
  assert.equal(cache.has(3), true);
  cache.retain([2, 3]);
  await cache.ensure([2]);
  assert.equal(cache.has(2), true);
  assert.equal(calls.filter((src) => src === sources[2]).length, 2);
  cache.dispose();
});

test("active turns may pin more than the capacity, then release their old surfaces", async () => {
  const cache = new BrochurePageCache(sources, { capacity: 2, load: async (src) => page(src) });
  cache.retain([0, 1, 2, 3]);
  await cache.ensure([0, 1, 2, 3]);
  assert.ok([0, 1, 2, 3].every((index) => cache.has(index)));
  cache.retain([2, 3]);
  assert.equal(cache.has(0), false);
  assert.equal(cache.has(1), false);
  assert.equal(cache.has(2), true);
  assert.equal(cache.has(3), true);
  cache.dispose();
});

test("disposal immediately aborts pending work and ignores late image completion", async () => {
  const decoded = deferred<HTMLImageElement>();
  let signal: AbortSignal | undefined;
  const load: BrochurePageLoader = (_, activeSignal) => { signal = activeSignal; return decoded.promise; };
  const cache = new BrochurePageCache(sources, { load });
  const pending = cache.ensure([1]);
  const rejected = assert.rejects(pending, { name: "AbortError" });
  await Promise.resolve();
  cache.dispose();
  assert.equal(signal?.aborted, true);
  await rejected;
  decoded.resolve(page(sources[1]));
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(cache.has(1), false);
  await assert.rejects(cache.ensure([1]), { name: "AbortError" });
  cache.dispose();
});

test("intentional endpapers need no load and malformed indices cannot become ready", async () => {
  let calls = 0;
  const cache = new BrochurePageCache(sources, { load: async (src) => { calls += 1; return page(src); } });
  await cache.ensure([null]);
  assert.equal(cache.has(null), true);
  for (const index of [-1, 81, 0.5, Number.NaN]) {
    await assert.rejects(cache.ensure([0, index]), RangeError);
    assert.equal(cache.has(index), false);
  }
  assert.equal(calls, 0);
  cache.dispose();
});

test("the browser loader awaits decode, validates pixels and cancels the image on dispose", async () => {
  const original = globalThis.Image;
  const instances: FakeImage[] = [];
  class FakeImage {
    src = "";
    decoding = "auto";
    naturalWidth = 1200;
    naturalHeight = 1600;
    decoded = deferred<void>();
    constructor() { instances.push(this); }
    decode() { return this.decoded.promise; }
    removeAttribute(name: string) { if (name === "src") this.src = ""; }
  }
  globalThis.Image = FakeImage as unknown as typeof Image;
  const cache = new BrochurePageCache(sources);
  try {
    const pending = cache.ensure([0]);
    await Promise.resolve();
    assert.equal(instances[0].src, sources[0]);
    assert.equal(instances[0].decoding, "async");
    assert.equal(cache.has(0), false);
    instances[0].decoded.resolve();
    await pending;
    assert.equal(cache.has(0), true);

    const broken = cache.ensure([1]);
    const rejected = assert.rejects(broken, /Unable to decode/);
    await Promise.resolve();
    instances[1].naturalWidth = 0;
    instances[1].decoded.resolve();
    await rejected;
    assert.equal(cache.has(1), false);

    const interrupted = cache.ensure([2]);
    const cancelled = assert.rejects(interrupted, { name: "AbortError" });
    await Promise.resolve();
    cache.dispose();
    assert.equal(instances[2].src, "");
    await cancelled;
    instances[2].decoded.resolve();
  } finally {
    cache.dispose();
    globalThis.Image = original;
  }
});
