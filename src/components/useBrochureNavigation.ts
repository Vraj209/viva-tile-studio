"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject, type PointerEvent as ReactPointerEvent } from "react";
import type { Brochure } from "@/lib/brochures";
import { BrochurePageCache } from "@/lib/brochure-page-cache";
import { getSpread, getTurnPages } from "@/lib/brochure-reader";
import type { ReaderTurn, TurnMotion } from "./BrochureTurningLeaf";

type Transaction = ReaderTurn & { id: number; ready: boolean; animate: boolean; layout?: boolean; motion: TurnMotion };
type Pointer = { id: number; x: number; y: number; lastX: number; lastTime: number; velocity: number; direction: 1 | -1 | null };

export function useBrochureNavigation(brochure: Brochure, desiredCompact: boolean, reduced: boolean, arena: RefObject<HTMLDivElement | null>, enabled: boolean) {
  const [compact, setCompact] = useState(desiredCompact);
  const [position, setPosition] = useState(0);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [error, setError] = useState(false);
  const current = useRef(0);
  const active = useRef<Transaction | null>(null);
  const sequence = useRef(0);
  const queued = useRef<1 | -1 | null>(null);
  const pointer = useRef<Pointer | null>(null);
  const suppressClick = useRef(false);
  const cache = useRef<BrochurePageCache | null>(null);
  const live = useRef({ compact, reduced, enabled });
  useLayoutEffect(() => { live.current = { compact, reduced, enabled }; });

  const getCache = useCallback(() => {
    if (!cache.current) cache.current = new BrochurePageCache(brochure.pages.map((page) => page.src));
    return cache.current;
  }, [brochure]);

  const request = useCallback((direction: 1 | -1, dragging = false, initial = false) => {
    const mode = live.current;
    if (!initial && !mode.enabled) return;
    if (active.current) {
      if (!dragging) queued.current = direction; // At most one intent waits; no runaway click backlog.
      return;
    }
    const page = current.current;
    let turn: ReaderTurn;
    if (mode.compact) {
      const destination = page + direction;
      if (destination < 0 || destination >= brochure.pageCount) return;
      turn = { from: { left: null, right: page }, to: { left: null, right: destination }, front: page, back: destination, destination, direction, rigid: Math.min(page, destination) === 0 };
    } else {
      const next = getTurnPages(brochure.pageCount, Math.ceil(page / 2), direction);
      if (!next) return;
      turn = { ...next, from: getSpread(brochure.pageCount, Math.ceil(page / 2)), to: getSpread(brochure.pageCount, next.destination), destination: next.destination === 0 ? 0 : next.destination * 2 - 1, direction, rigid: page === 0 || next.destination === 0 };
    }
    const next = { ...turn, id: ++sequence.current, ready: false, animate: true, motion: { progress: 0, dragging, target: 1 as const } };
    active.current = next;
    setTransaction(next);
    setError(false);
  }, [brochure.pageCount]);

  const finish = useCallback((committed: boolean) => {
    const turn = active.current;
    if (!turn) return;
    if (committed) {
      current.current = turn.destination;
      setPosition(turn.destination);
      if (turn.layout !== undefined) setCompact(turn.layout);
    }
    active.current = null;
    setTransaction(null);
    const direction = queued.current;
    queued.current = null;
    // Wait for React to promote the already-mounted destination surfaces.
    if (direction) requestAnimationFrame(() => { if (sequence.current === turn.id) request(direction); });
  }, [request]);

  const jump = useCallback((index: number) => {
    if (!live.current.enabled || active.current) return;
    const destination = Math.max(0, Math.min(brochure.pageCount - 1, index));
    if (destination === current.current) return;
    const from = live.current.compact ? { left: null, right: current.current } : getSpread(brochure.pageCount, Math.ceil(current.current / 2));
    const to = live.current.compact ? { left: null, right: destination } : getSpread(brochure.pageCount, Math.ceil(destination / 2));
    const next: Transaction = { from, to, front: from.right, back: to.left, direction: destination > current.current ? 1 : -1, rigid: false, destination, id: ++sequence.current, ready: false, animate: false, motion: { progress: 0, dragging: false, target: 1 } };
    active.current = next;
    setTransaction(next);
    setError(false);
  }, [brochure.pageCount]);

  useEffect(() => {
    if (!transaction || transaction.ready) return;
    const turn = transaction;
    let cancelled = false;
    const indices = [turn.from.left, turn.from.right, turn.to.left, turn.to.right, turn.front, turn.back];
    const images = getCache();
    images.retain(indices);
    void images.ensure(indices).then(async () => {
      // Decode the actual resident DOM images too. A cached response alone does
      // not guarantee that a newly mounted async <img> is ready to be painted.
      await Promise.all(Array.from(arena.current?.querySelectorAll<HTMLImageElement>("[data-page] img") ?? []).map((image) => image.decode()));
      if (cancelled || active.current?.id !== turn.id) return;
      if (!turn.animate || live.current.reduced) {
        if (!turn.motion.dragging) finish(turn.motion.target === 1);
        else { const ready = { ...turn, ready: true }; active.current = ready; setTransaction(ready); }
        return;
      }
      const ready = { ...turn, ready: true };
      active.current = ready;
      setTransaction(ready);
    }).catch(() => {
      if (cancelled || active.current?.id !== turn.id) return;
      queued.current = null;
      finish(false);
      setError(true);
    });
    return () => { cancelled = true; };
  }, [transaction, arena, getCache, finish]);

  useLayoutEffect(() => {
    if (reduced && transaction?.ready && !transaction.motion.dragging) finish(transaction.motion.target === 1);
  }, [reduced, transaction, finish]);

  useEffect(() => {
    if (transaction) return;
    const nearby = Array.from({ length: Math.min(brochure.pageCount, position + 5) - Math.max(0, position - 2) }, (_, index) => Math.max(0, position - 2) + index);
    const images = getCache();
    images.retain(nearby);
    void images.ensure(nearby).catch(() => { /* Speculative failures are retried on navigation. */ });
  }, [position, transaction, brochure.pageCount, getCache]);

  useLayoutEffect(() => {
    if (desiredCompact === compact && active.current?.layout === undefined) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      sequence.current++;
      queued.current = null;
      pointer.current = null;
      if (desiredCompact === compact) {
        active.current = null;
        setTransaction(null);
        return;
      }
      const page = current.current;
      const single = { left: null, right: page };
      const spread = getSpread(brochure.pageCount, Math.ceil(page / 2));
      // A wider viewport may need an unreadied facing page. Keep the original
      // layout and its pixels until that resident counterpart has decoded.
      const next: Transaction = { from: compact ? single : spread, to: desiredCompact ? single : spread, front: null, back: null, destination: page, direction: 1, rigid: false, id: sequence.current, ready: false, animate: false, layout: desiredCompact, motion: { progress: 0, dragging: false, target: 1 } };
      active.current = next;
      setTransaction(next);
    });
    return () => { cancelled = true; };
  }, [desiredCompact, compact, brochure.pageCount]);

  useEffect(() => () => {
    sequence.current++;
    queued.current = null;
    cache.current?.dispose();
    cache.current = null;
  }, []);

  useEffect(() => {
    const cancelGesture = () => {
      pointer.current = null;
      const turn = active.current;
      if (!turn?.motion.dragging) return;
      queued.current = null;
      turn.motion.dragging = false;
      turn.motion.target = 0;
      if (turn.ready && !live.current.reduced) turn.motion.settle?.();
      else { sequence.current++; finish(false); }
    };
    const visibilityChanged = () => { if (document.hidden) cancelGesture(); };
    window.addEventListener("blur", cancelGesture);
    document.addEventListener("visibilitychange", visibilityChanged);
    return () => {
      window.removeEventListener("blur", cancelGesture);
      document.removeEventListener("visibilitychange", visibilityChanged);
    };
  }, [finish]);

  function release(event: ReactPointerEvent<HTMLDivElement>, cancelled: boolean) {
    const start = pointer.current;
    if (!start || start.id !== event.pointerId) return;
    pointer.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const turn = active.current;
    if (!start.direction || !turn?.motion.dragging) return;
    const motion = turn.motion;
    const recentVelocity = performance.now() - start.lastTime < 100 ? start.velocity : 0;
    motion.target = !cancelled && (motion.progress > .32 || (motion.progress > .06 && recentVelocity * turn.direction > .45)) ? 1 : 0;
    motion.dragging = false;
    if (!turn.ready) {
      if (motion.target === 0) { sequence.current++; queued.current = null; finish(false); }
      return;
    }
    if (live.current.reduced) finish(motion.target === 1);
    else motion.settle?.();
  }

  const pointerHandlers = {
    onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
      if (!live.current.enabled || active.current || !event.isPrimary || event.button !== 0) return;
      if (event.target instanceof Element && event.target.closest("a, input, select, textarea")) return;
      suppressClick.current = false;
      pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX, lastTime: performance.now(), velocity: 0, direction: null };
    },
    onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
      const start = pointer.current;
      if (!start || start.id !== event.pointerId) return;
      const dx = start.x - event.clientX;
      const dy = start.y - event.clientY;
      if (!start.direction) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
        if (Math.abs(dy) > Math.abs(dx)) { pointer.current = null; suppressClick.current = true; return; }
        start.direction = dx > 0 ? 1 : -1;
        suppressClick.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        request(start.direction, true);
      }
      const now = performance.now();
      start.velocity = (start.lastX - event.clientX) / Math.max(1, now - start.lastTime);
      start.lastX = event.clientX; start.lastTime = now;
      const turn = active.current;
      if (!turn?.motion.dragging) return;
      const pageWidth = arena.current?.querySelector<HTMLElement>("[data-page]")?.clientWidth ?? 300;
      turn.motion.progress = Math.max(0, Math.min(1, dx * turn.direction / (pageWidth * (live.current.compact ? 1 : 1.35))));
      if (!live.current.reduced && turn.ready) turn.motion.render?.();
    },
    onPointerUp(event: ReactPointerEvent<HTMLDivElement>) { release(event, false); },
    onPointerCancel(event: ReactPointerEvent<HTMLDivElement>) { release(event, true); },
    onLostPointerCapture(event: ReactPointerEvent<HTMLDivElement>) {
      // Touch begins with implicit capture on the image/hotspot. Its bubbling
      // loss during handoff to the arena must not cancel the arena's gesture.
      if (event.target === event.currentTarget) release(event, true);
    },
    onClickCapture(event: ReactPointerEvent<HTMLDivElement>) {
      if (suppressClick.current && event.detail !== 0) { suppressClick.current = false; event.preventDefault(); event.stopPropagation(); }
    },
  };

  return { compact, position, transaction, error, request, jump, finish, getCache, pointerHandlers };
}
