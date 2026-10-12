export type BrochureSpread = {
  left: number | null;
  right: number | null;
};

export type BrochureTurn = {
  /** Texture facing the reader when the sheet lies to the right of its spine. */
  front: number | null;
  /** Texture facing the reader when the sheet lies to the left of its spine. */
  back: number | null;
  destination: number;
};

export type PageStrip = {
  /** Position of this strip's spine-side edge, relative to the book's spine. */
  x: number;
  z: number;
  /** CSS rotateY angle in degrees. Use transform-origin: left center. */
  angle: number;
  width: number;
};

function safePageCount(pageCount: number): number {
  return Number.isFinite(pageCount) ? Math.max(0, Math.floor(pageCount)) : 0;
}

export function getMaxSpread(pageCount: number): number {
  return Math.floor(safePageCount(pageCount) / 2);
}

function safeSpread(pageCount: number, spread: number): number {
  const index = Number.isFinite(spread) ? Math.floor(spread) : 0;
  return Math.max(0, Math.min(getMaxSpread(pageCount), index));
}

/** PDF indices are zero based. The closed front cover is spread zero. */
export function getSpread(pageCount: number, spread: number): BrochureSpread {
  const count = safePageCount(pageCount);
  const index = safeSpread(count, spread);
  const right = index * 2;

  return {
    left: index > 0 ? right - 1 : null,
    right: right < count ? right : null,
  };
}

/**
 * Front/back refer to physical faces, not travel direction. During a backward
 * turn the back starts visible at -180deg and the front ends visible at 0deg.
 */
export function getTurnPages(
  pageCount: number,
  spread: number,
  direction: 1 | -1,
): BrochureTurn | null {
  const count = safePageCount(pageCount);
  const current = safeSpread(count, spread);
  const destination = current + direction;

  if (count === 0 || destination < 0 || destination > getMaxSpread(count)) {
    return null;
  }

  const from = getSpread(count, current);
  const to = getSpread(count, destination);

  return {
    front: direction === 1 ? from.right : to.right,
    back: direction === 1 ? to.left : from.left,
    destination,
  };
}

/**
 * Build a continuous sheet from up to 16 adjoining CSS strips. Each transform
 * is translate3d(x, 0, z) rotateY(angle), anchored at its left edge. Increasing
 * strip indices follow the front texture from spine to outer edge. The back
 * texture's crop order must be reversed, with its face rotated by 180deg.
 *
 * Positive z lifts toward the reader. The hinge remains fixed, and integrating
 * strip angles preserves paper length throughout the turn. A rigid cover has
 * no curvature. Backward turns retrace the same geometry in reverse.
 */
export function getPageStrips(
  progress: number,
  width: number,
  count: number,
  rigid: boolean,
  direction: 1 | -1,
): PageStrip[] {
  if (!Number.isFinite(width) || width <= 0) return [];

  const segments = Number.isFinite(count)
    ? Math.max(1, Math.min(16, Math.floor(count)))
    : 12;
  const clamped = Number.isFinite(progress)
    ? Math.max(0, Math.min(1, progress))
    : 0;
  const phase = direction === 1 ? clamped : 1 - clamped;
  const stripWidth = width / segments;

  // Exact flat endpoints prevent tiny residual transforms and visible seams.
  if (phase === 0 || phase === 1) {
    return Array.from({ length: segments }, (_, index) => ({
      x: index * stripWidth * (phase === 0 ? 1 : -1),
      z: 0,
      angle: phase === 0 ? 0 : -180,
      width: stripWidth,
    }));
  }

  const baseAngle = -Math.PI * phase;
  const bend = rigid ? 0 : Math.sin(Math.PI * phase) * 0.38;
  const strips: PageStrip[] = [];
  let x = 0;
  let z = 0;

  for (let index = 0; index < segments; index += 1) {
    const alongSheet = (index + 0.5) / segments;
    const angle = baseAngle + bend * (alongSheet * 2 - 1);

    strips.push({ x, z, angle: (angle * 180) / Math.PI, width: stripWidth });
    x += Math.cos(angle) * stripWidth;
    z -= Math.sin(angle) * stripWidth;
  }

  return strips;
}
