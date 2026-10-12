import test from "node:test";
import assert from "node:assert/strict";
import {
  getMaxSpread,
  getPageStrips,
  getSpread,
  getTurnPages,
} from "../src/lib/brochure-reader";

function close(actual: number, expected: number, message?: string): void {
  assert.ok(Math.abs(actual - expected) < 1e-8, message ?? `${actual} ≈ ${expected}`);
}

test("every PDF page appears once, in reading order, including an unpaired final page", () => {
  for (const pageCount of [0, 1, 2, 3, 6, 7, 40, 81]) {
    const pages: number[] = [];
    for (let spread = 0; spread <= getMaxSpread(pageCount); spread += 1) {
      const { left, right } = getSpread(pageCount, spread);
      if (left !== null) pages.push(left);
      if (right !== null) pages.push(right);
    }
    assert.deepEqual(pages, Array.from({ length: pageCount }, (_, index) => index));
  }

  assert.deepEqual(getSpread(6, 0), { left: null, right: 0 });
  assert.deepEqual(getSpread(6, 3), { left: 5, right: null });
  assert.deepEqual(getSpread(7, 3), { left: 5, right: 6 });
});

test("forward and backward turns expose the same physical sheet faces", () => {
  for (const pageCount of [2, 3, 6, 7, 40, 81]) {
    for (let spread = 0; spread < getMaxSpread(pageCount); spread += 1) {
      const forward = getTurnPages(pageCount, spread, 1);
      assert.ok(forward);
      const backward = getTurnPages(pageCount, forward.destination, -1);
      assert.ok(backward);

      assert.equal(forward.front, getSpread(pageCount, spread).right);
      assert.equal(forward.back, getSpread(pageCount, forward.destination).left);
      assert.equal(backward.front, forward.front);
      assert.equal(backward.back, forward.back);
      assert.equal(backward.destination, spread);
    }
    assert.equal(getTurnPages(pageCount, 0, -1), null);
    assert.equal(getTurnPages(pageCount, getMaxSpread(pageCount), 1), null);
  }
  assert.equal(getTurnPages(0, 0, 1), null);
  assert.equal(getTurnPages(1, 0, 1), null);
});

test("out-of-range spread input cannot produce a missing PDF index", () => {
  assert.deepEqual(getSpread(6, -12), { left: null, right: 0 });
  assert.deepEqual(getSpread(6, 800), { left: 5, right: null });
  assert.deepEqual(getSpread(6, Number.NaN), { left: null, right: 0 });
  assert.deepEqual(getSpread(Number.NaN, 1), { left: null, right: null });
  assert.deepEqual(getSpread(-1, 1), { left: null, right: null });
});

test("pages land exactly flat and the reverse turn retraces the forward turn", () => {
  for (const rigid of [false, true]) {
    for (const phase of [0, 0.1, 0.35, 0.5, 0.8, 1]) {
      const forward = getPageStrips(phase, 480, 12, rigid, 1);
      const backward = getPageStrips(1 - phase, 480, 12, rigid, -1);
      forward.forEach((strip, index) => {
        close(strip.x, backward[index].x);
        close(strip.z, backward[index].z);
        close(strip.angle, backward[index].angle);
      });
    }

    for (const phase of [0, 1]) {
      const strips = getPageStrips(phase, 480, 12, rigid, 1);
      strips.forEach((strip, index) => {
        assert.equal(strip.z, 0);
        assert.equal(strip.angle, phase === 0 ? 0 : -180);
        close(strip.x, index * 40 * (phase === 0 ? 1 : -1));
      });
    }
  }
});

test("strip edges stay connected, preserve sheet length, and rise above the book", () => {
  for (const progress of [0.001, 0.1, 0.49, 0.5, 0.51, 0.9, 0.999]) {
    const strips = getPageStrips(progress, 600, 16, false, 1);
    assert.equal(strips[0].x, 0);
    assert.equal(strips[0].z, 0);
    close(strips.reduce((sum, strip) => sum + strip.width, 0), 600);

    strips.forEach((strip, index) => {
      assert.ok(strip.z >= 0, "paper must not pass through the resting pages");
      assert.ok(strip.angle < 0 && strip.angle > -180);
      const next = strips[index + 1];
      if (!next) return;
      const radians = (strip.angle * Math.PI) / 180;
      close(next.x, strip.x + Math.cos(radians) * strip.width);
      close(next.z, strip.z - Math.sin(radians) * strip.width);
      close(Math.hypot(next.x - strip.x, next.z - strip.z), strip.width);
    });
  }

  const justBefore = getPageStrips(0.4999, 600, 16, false, 1);
  const justAfter = getPageStrips(0.5001, 600, 16, false, 1);
  justBefore.forEach((strip, index) => {
    assert.ok(Math.abs(strip.z - justAfter[index].z) < 1);
    assert.ok(Math.abs(strip.x - justAfter[index].x) < 1);
  });
});

test("hardcover remains rigid while internal paper develops curvature", () => {
  const hardcover = getPageStrips(0.4, 450, 12, true, 1);
  const paper = getPageStrips(0.4, 450, 12, false, 1);
  assert.ok(hardcover.every((strip) => strip.angle === hardcover[0].angle));
  assert.ok(Math.abs(paper[0].angle - paper.at(-1)!.angle) > 20);
});

test("geometry safely bounds malformed dimensions and animation overshoot", () => {
  assert.deepEqual(getPageStrips(0.5, Number.NaN, 12, false, 1), []);
  assert.deepEqual(getPageStrips(0.5, -100, 12, false, 1), []);
  assert.equal(getPageStrips(0.5, 450, 800, false, 1).length, 16);
  assert.equal(getPageStrips(0.5, 450, 0, false, 1).length, 1);
  for (const progress of [-3, 3, Number.NaN, Number.POSITIVE_INFINITY]) {
    const strips = getPageStrips(progress, 450, Number.NaN, false, 1);
    assert.ok(strips.length > 0);
    assert.ok(strips.every((strip) => Object.values(strip).every(Number.isFinite)));
    assert.ok(strips.every((strip) => strip.z === 0));
  }
});
