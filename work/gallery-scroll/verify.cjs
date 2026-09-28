/* Browser regression coverage for the existing gallery choreography.
 * Run after the dev server is ready: node work/gallery-scroll/verify.cjs
 * Optional: GALLERY_CASE=desktop-tall or GALLERY_BASE_URL=http://127.0.0.1:3000
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/Vraj Panchal/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const baseURL = process.env.GALLERY_BASE_URL || 'http://127.0.0.1:3000';
const output = process.env.GALLERY_OUTPUT_DIR || path.join(__dirname, 'verification');
const cases = [
  { name: 'desktop-tall', width: 1440, height: 960, interactions: true },
  { name: 'desktop-short', width: 1440, height: 800 },
  { name: 'mobile', width: 390, height: 844, mobile: true, interactions: true },
  { name: 'mobile-small', width: 320, height: 568, mobile: true },
  { name: 'mobile-landscape', width: 844, height: 390, mobile: true },
  { name: 'reduced-motion', width: 1440, height: 960, reduced: true },
  { name: 'orientation', width: 390, height: 844, mobile: true, scenario: 'orientation' },
  { name: 'manual-motion', width: 1440, height: 960, scenario: 'manual-motion' },
  { name: 'desktop-resize', width: 1440, height: 960, scenario: 'desktop-resize' },
  { name: 'restored-scroll', width: 1440, height: 960, scenario: 'restored-scroll' },
].filter((item) => !process.env.GALLERY_CASE || process.env.GALLERY_CASE.split(',').includes(item.name));

const sleep = (page, ms = 550) => page.waitForTimeout(ms);

async function state(page) {
  return page.evaluate(() => {
    const track = document.querySelector('#work [data-gallery-track]');
    const panel = document.querySelector('#work [data-gallery-panel]');
    const stage = document.querySelector('#work [data-gallery-stage]');
    const heading = document.querySelector('#gallery-heading');
    if (!track || !panel || !stage || !heading) throw new Error('Gallery observability elements are absent');
    const rect = (element) => {
      const r = element.getBoundingClientRect();
      return { x: r.x, y: r.y, top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
    };
    const samples = [...stage.querySelectorAll('[data-gallery-sample]')].map((sample, index) => {
      const css = getComputedStyle(sample);
      const bounds = rect(sample);
      const image = sample.querySelector('img');
      return {
        index,
        active: sample.dataset.active === 'true',
        transform: css.transform,
        opacity: Number(css.opacity),
        visibility: css.visibility,
        bounds,
        label: sample.getAttribute('aria-label'),
        hasImage: Boolean(image),
        loaded: Boolean(image && image.complete && image.naturalWidth > 0),
        onscreen: bounds.right > 0 && bounds.left < innerWidth && bounds.bottom > 0 && bounds.top < innerHeight,
      };
    });
    const stagePosition = Number(stage.dataset.galleryPosition);
    const css = getComputedStyle(track);
    const panelCSS = getComputedStyle(panel);
    return {
      mode: track.dataset.scrollMode,
      position: stagePosition,
      hasPosition: stage.hasAttribute('data-gallery-position') && Number.isFinite(stagePosition),
      scrollY,
      viewport: { width: innerWidth, height: innerHeight },
      pageWidth: document.documentElement.scrollWidth,
      track: rect(track), panel: rect(panel), stage: rect(stage), heading: rect(heading),
      stickyTop: Number.parseFloat(panelCSS.top) || 0,
      scrollDistance: Number.parseFloat(css.getPropertyValue('--gallery-scroll-distance')) || 0,
      exposedStart: Number(track.dataset.galleryScrollStart),
      exposedEnd: Number(track.dataset.galleryScrollEnd),
      active: samples.findIndex((sample) => sample.active),
      sampleCount: samples.length,
      samples,
      overlay: Boolean(document.querySelector('[data-nextjs-dialog], .vite-error-overlay')),
    };
  });
}

async function range(page) {
  const current = await state(page);
  if (Number.isFinite(current.exposedStart) && Number.isFinite(current.exposedEnd) && current.exposedEnd > current.exposedStart) {
    return { start: current.exposedStart, end: current.exposedEnd, distance: current.exposedEnd - current.exposedStart };
  }
  if (current.mode === 'pinned' && current.scrollDistance > 0) {
    const start = current.scrollY + current.track.top - current.stickyTop;
    return { start, end: start + current.scrollDistance, distance: current.scrollDistance };
  }
  // Inline fallback only guides setup; actual assertions observe motion, never a copied implementation formula.
  const start = current.scrollY + current.stage.top - current.viewport.height * 0.65;
  const end = current.scrollY + current.stage.bottom - current.viewport.height * 0.35;
  return { start, end, distance: Math.max(1, end - start) };
}

async function jump(page, y, settle = 650) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), Math.max(0, y));
  await sleep(page, settle);
}

async function atProgress(page, progress, settle) {
  const bounds = await range(page);
  await jump(page, bounds.start + bounds.distance * progress, settle);
  return state(page);
}

function checkLayout(current, label) {
  assert(!current.overlay, `${label}: framework error overlay`);
  assert(current.hasPosition, `${label}: data-gallery-position must expose the painted fractional pose`);
  assert(current.pageWidth <= current.viewport.width + 2, `${label}: page overflows horizontally (${current.pageWidth}px)`);
  assert.equal(current.samples.filter((sample) => sample.active).length, 1, `${label}: exactly one active sample`);
  if (current.mode === 'pinned') {
    assert(current.heading.top >= -2, `${label}: pinned heading is clipped above viewport`);
    assert(current.heading.bottom < current.viewport.height, `${label}: pinned heading is below viewport`);
    assert(current.stage.bottom <= current.viewport.height + 3, `${label}: pinned tile composition extends below viewport (${current.stage.bottom}px)`);
  }
}

async function checkImages(page, label) {
  await page.waitForFunction(() => [...document.querySelectorAll('#work [data-gallery-sample]')].every((sample) => {
    const css = getComputedStyle(sample);
    const r = sample.getBoundingClientRect();
    if (css.visibility === 'hidden' || Number(css.opacity) < 0.05 || r.right <= 0 || r.left >= innerWidth || r.bottom <= 0 || r.top >= innerHeight) return true;
    const image = sample.querySelector('img');
    return image && image.complete && image.naturalWidth > 0;
  }), { timeout: 10000 });
  const current = await state(page);
  const visible = current.samples.filter((sample) => sample.onscreen && sample.visibility !== 'hidden' && sample.opacity >= 0.05);
  assert(visible.length, `${label}: no visible gallery tiles`);
  assert(visible.every((sample) => sample.hasImage && sample.loaded), `${label}: blank or unloaded visible tile`);
  return current;
}

async function nativeTouchScroll(page) {
  const viewport = page.viewportSize();
  const stage = await page.locator('#work [data-gallery-stage]').boundingBox();
  const x = Math.min(viewport.width - 20, Math.max(20, stage.x + stage.width * 0.8));
  const y = Math.min(viewport.height - 45, Math.max(180, stage.y + stage.height * 0.7));
  const distance = Math.min(220, y - 40);
  const session = await page.context().newCDPSession(page);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let step = 1; step <= 10; step++) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - distance * step / 10 }] });
    await sleep(page, 30);
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await session.detach();
  await sleep(page, 850);
}

async function captureWheelFrames(page, delta) {
  await page.evaluate(() => {
    const frames = window.__galleryVerificationFrames = [];
    const started = performance.now();
    const capture = () => {
      frames.push({
        elapsed: performance.now() - started,
        position: Number(document.querySelector('#work [data-gallery-stage]').dataset.galleryPosition),
      });
      if (performance.now() - started < 240) requestAnimationFrame(capture);
    };
    capture();
  });
  await page.mouse.wheel(0, delta);
  await sleep(page, 280);
  return page.evaluate(() => {
    const frames = window.__galleryVerificationFrames;
    delete window.__galleryVerificationFrames;
    return frames;
  });
}

async function scrollSequence(page, item, result) {
  let current = await atProgress(page, 0.07);
  checkLayout(current, item.name);
  assert.notEqual(current.mode, 'still', `${item.name}: regular motion unexpectedly disabled`);
  result.mode = current.mode;
  result.range = await range(page);

  const parked = current.position;
  const parkedTransform = current.samples[current.active].transform;
  await sleep(page, 650);
  current = await state(page);
  assert(Math.abs(current.position - parked) < 0.02, `${item.name}: animation advances while scrolling is stopped`);
  assert.equal(current.samples[current.active].transform, parkedTransform, `${item.name}: tile transform moves without input`);
  result.noAutoplay = true;

  await page.mouse.move(item.width * 0.7, item.height * 0.55);
  const slow = [current];
  for (let index = 0; index < 7; index++) {
    await page.mouse.wheel(0, 14);
    await sleep(page, 110);
    slow.push(await state(page));
  }
  await sleep(page, 500);
  slow.push(await state(page));
  assert(slow.at(-1).position > slow[0].position + 0.02, `${item.name}: slow scrolling does not advance tiles`);
  assert(slow.every((sample, index) => index === 0 || sample.position >= slow[index - 1].position - 0.015), `${item.name}: forward slow scrolling reverses unexpectedly`);
  assert(slow.some((sample) => Math.abs(sample.position - Math.round(sample.position)) > 0.025), `${item.name}: motion snaps between whole samples instead of scrubbing`);
  assert.notEqual(slow[0].samples[0].transform, slow.at(-1).samples[0].transform, `${item.name}: pose changes without corresponding tile transforms`);
  result.slowPositions = slow.map((sample) => sample.position);
  await checkImages(page, `${item.name} slow scroll`);

  const fastBefore = await atProgress(page, 0.2);
  await page.mouse.wheel(0, result.range.distance * 0.43);
  await sleep(page, 850);
  const fastAfter = await checkImages(page, `${item.name} fast scroll`);
  assert(fastAfter.position > fastBefore.position + 0.2, `${item.name}: fast scrolling does not advance sequence`);
  checkLayout(fastAfter, `${item.name} fast scroll`);
  await page.screenshot({ path: path.join(output, `${item.name}-scroll.png`) });

  await page.mouse.wheel(0, -result.range.distance * 0.22);
  await sleep(page, 700);
  const reverse = await checkImages(page, `${item.name} reverse scroll`);
  assert(reverse.position < fastAfter.position - 0.15, `${item.name}: reverse scrolling does not reverse sequence`);
  result.fastAndReverse = [fastBefore.position, fastAfter.position, reverse.position];

  const remembered = await atProgress(page, 0.43);
  const rememberedY = remembered.scrollY;
  await jump(page, result.range.end + item.height + 100);
  const following = await state(page);
  assert(following.panel.top < remembered.panel.top - 40, `${item.name}: panel did not release into following content`);
  await jump(page, rememberedY);
  const returned = await checkImages(page, `${item.name} viewport re-entry`);
  assert(Math.abs(returned.position - remembered.position) < 0.06, `${item.name}: re-entry restarts or changes the sequence position`);
  result.reentry = { before: remembered.position, after: returned.position };

  if (item.mobile) {
    const touchBefore = await atProgress(page, 0.2);
    await nativeTouchScroll(page);
    const touchAfter = await state(page);
    assert(touchAfter.scrollY > touchBefore.scrollY + 20, `${item.name}: touch pan is trapped by gallery`);
    assert(touchAfter.position > touchBefore.position + 0.02, `${item.name}: touch scrolling does not advance tiles`);
    result.touch = { scrollDelta: touchAfter.scrollY - touchBefore.scrollY, before: touchBefore.position, after: touchAfter.position };
  }
}

async function interactions(page, item, result) {
  await atProgress(page, 0.35);
  const beforeArrow = await state(page);
  const nextButton = page.getByRole('button', { name: 'Next sample', exact: true });
  await nextButton.click();
  await sleep(page, 950);
  const afterArrow = await checkImages(page, `${item.name} next arrow`);
  assert.equal(afterArrow.active, beforeArrow.active + 1, `${item.name}: next arrow did not preserve selection`);
  assert(Math.abs(afterArrow.position - afterArrow.active) < 0.06, `${item.name}: manual arrow failed to settle on chosen sample`);

  await page.getByRole('button', { name: 'Show Graphic squares', exact: true }).click();
  await sleep(page, 650);
  const direct = await checkImages(page, `${item.name} direct selection`);
  assert.equal(direct.active, 4, `${item.name}: direct choice not selected`);
  await sleep(page, 400);
  assert.equal((await state(page)).active, 4, `${item.name}: scroll controller overwrote parked manual choice`);
  const directY = direct.scrollY;
  await page.mouse.move(item.width * 0.72, Math.min(item.height - 60, direct.stage.top + direct.stage.height * 0.55));
  const directFrames = await captureWheelFrames(page, 10);
  assert(directFrames.every((frame) => frame.position >= direct.position - 0.04 && frame.position < direct.position + 0.7), `${item.name}: manual choice visibly jumps during scroll takeover: ${JSON.stringify(directFrames)}`);
  const resumed = await state(page);
  assert(resumed.position > direct.position, `${item.name}: scroll did not resume from manual choice`);
  assert(resumed.position - direct.position < 0.7, `${item.name}: first scroll after manual choice jumps (${direct.position} -> ${resumed.position})`);
  assert(resumed.scrollY > directY, `${item.name}: normal page scrolling did not resume`);

  // Put the manual selection on an integer before the drag, then drag one neighbor.
  await page.getByRole('button', { name: 'Show Graphic squares', exact: true }).click();
  await sleep(page, 650);
  const dragBefore = await state(page);
  const tile = page.locator('#work [data-gallery-sample][data-active="true"]');
  const box = await tile.boundingBox();
  const x = box.x + box.width * 0.55;
  const y = Math.max(10, Math.min(item.height - 10, box.y + box.height * 0.6));
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(Math.max(4, x - Math.max(160, dragBefore.stage.width * 0.38)), y + 1, { steps: 10 });
  await page.mouse.up();
  await sleep(page, 950);
  const dragAfter = await checkImages(page, `${item.name} drag`);
  assert.equal(dragAfter.active, dragBefore.active + 1, `${item.name}: horizontal drag failed to choose next sample`);
  assert.equal(await page.locator('dialog[open]').count(), 0, `${item.name}: dragging accidentally opens inspection`);
  const dragFrames = await captureWheelFrames(page, -10);
  assert(dragFrames.every((frame) => frame.position <= dragAfter.position + 0.04 && frame.position > dragAfter.position - 0.7), `${item.name}: dragged choice visibly jumps during scroll takeover: ${JSON.stringify(dragFrames)}`);
  const dragResume = await state(page);
  assert(dragResume.position < dragAfter.position, `${item.name}: reverse scrolling did not resume after drag`);
  assert(dragAfter.position - dragResume.position < 0.7, `${item.name}: reverse scroll jumps after drag`);
  result.manual = { arrow: [beforeArrow.active, afterArrow.active], direct: direct.active, resumed: resumed.position, directFrames, drag: [dragBefore.active, dragAfter.active], dragResume: dragResume.position, dragFrames };

  // Opening while a scrub is settling must not swap the asset under the visitor.
  await atProgress(page, 0.4);
  await page.mouse.wheel(0, 150);
  await sleep(page, 50);
  await page.getByRole('button', { name: 'Inspect sample', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor({ state: 'visible' });
  const labelId = await dialog.getAttribute('aria-labelledby');
  const titleBefore = await page.locator(`[id="${labelId}"]`).textContent();
  const lockedY = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 300);
  await sleep(page, 850);
  const labelAfter = await dialog.getAttribute('aria-labelledby');
  const titleAfter = await page.locator(`[id="${labelAfter}"]`).textContent();
  assert.equal(titleAfter, titleBefore, `${item.name}: inspection changes asset during scrub settling`);
  assert(Math.abs((await page.evaluate(() => scrollY)) - lockedY) < 2, `${item.name}: inspection fails to lock page scroll`);
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });
  assert(await page.evaluate(() => document.activeElement?.matches('#work [data-gallery-sample]')), `${item.name}: inspection does not restore sample focus`);
  result.inspection = titleAfter;

  // Keyboard remains a way to browse without moving the page.
  const keyboardBefore = await state(page);
  await page.keyboard.press('ArrowLeft');
  await sleep(page, 950);
  const keyboardAfter = await state(page);
  assert.equal(keyboardAfter.active, Math.max(0, keyboardBefore.active - 1), `${item.name}: keyboard selection failed`);
  assert(Math.abs(keyboardAfter.scrollY - keyboardBefore.scrollY) < 2, `${item.name}: keyboard selection scrolls page unexpectedly`);
  result.keyboard = true;
}

async function reducedMotion(page, item, result) {
  await page.locator('#gallery-heading').scrollIntoViewIfNeeded();
  await sleep(page, 550);
  const before = await state(page);
  assert.equal(before.mode, 'still', `${item.name}: reduced-motion mode is not stable`);
  assert(before.track.height <= before.panel.height + 5, `${item.name}: reduced motion retains an empty scroll runway`);
  await page.mouse.wheel(0, 180);
  await sleep(page, 650);
  const after = await state(page);
  assert.equal(after.active, before.active, `${item.name}: reduced-motion scroll changes sample`);
  assert(Math.abs(after.position - before.position) < 0.02, `${item.name}: reduced-motion scroll changes tile pose`);
  await page.getByRole('button', { name: 'Show Angular lines', exact: true }).click();
  await sleep(page, 250);
  const chosen = await checkImages(page, `${item.name} manual browsing`);
  assert.equal(chosen.active, 1, `${item.name}: reduced-motion manual selection failed`);
  assert(chosen.samples.filter((sample) => sample.visibility !== 'hidden').length === 1, `${item.name}: reduced-motion gallery should show a stable selected sample`);
  await page.screenshot({ path: path.join(output, `${item.name}.png`) });
  result.stableAndBrowsable = true;
}

async function runtimeReducedMotion(page, result) {
  await atProgress(page, 0.45);
  const before = await state(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await sleep(page, 650);
  const switched = await state(page);
  assert.equal(switched.mode, 'still', 'Runtime reduced motion does not disable scroll animation');
  assert(Math.abs(switched.panel.top - before.panel.top) < 48, `Runtime reduced motion displaces the gallery (${before.panel.top}px -> ${switched.panel.top}px)`);
  assert(switched.heading.top >= -2 && switched.heading.bottom < switched.viewport.height, 'Runtime reduced motion moves the gallery heading out of view');
  const selected = switched.active;
  await page.mouse.wheel(0, 90);
  await sleep(page, 400);
  const after = await state(page);
  assert.equal(after.active, selected, 'Runtime reduced motion still changes sample on scroll');
  result.runtimeReduced = { beforeY: before.scrollY, afterY: switched.scrollY, beforePanelTop: before.panel.top, afterPanelTop: switched.panel.top, sample: selected };
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await sleep(page, 700);
  await atProgress(page, 0.3);
  const resumed = await state(page);
  assert.notEqual(resumed.mode, 'still', 'Motion does not return after reduced-motion preference clears');
}

function compactState(current) {
  return {
    mode: current.mode, position: current.position, active: current.active,
    scrollY: current.scrollY, viewport: current.viewport,
    panelTop: current.panel.top, panelBottom: current.panel.bottom,
    headingTop: current.heading.top, headingBottom: current.heading.bottom,
    stageTop: current.stage.top, stageBottom: current.stage.bottom,
    scrollDistance: current.scrollDistance,
    futureRunway: Math.max(0, current.track.bottom - current.panel.height - current.panel.top),
  };
}

function assertGalleryStayedVisible(before, after, label) {
  assert(after.pageWidth <= after.viewport.width + 2, `${label}: horizontal page overflow`);
  assert(Math.abs(after.position - before.position) < 0.075, `${label}: resizing restarted or jumped the pose (${before.position} -> ${after.position})`);
  assert(after.heading.top >= -2 && after.heading.bottom < after.viewport.height, `${label}: heading leaves viewport (${after.heading.top}px)`);
  assert(after.stage.top < after.viewport.height && after.stage.bottom > 0, `${label}: gallery tile area leaves viewport`);
  assert(Math.abs(after.panel.top - before.panel.top) < 48, `${label}: gallery panel jumps (${before.panel.top}px -> ${after.panel.top}px)`);
}

async function orientation(page, result) {
  const portrait = await atProgress(page, 0.48);
  assert.equal(portrait.mode, 'pinned', 'Portrait baseline must exercise a pinned sequence');
  await page.setViewportSize({ width: 844, height: 390 });
  await sleep(page, 1000);
  const landscape = await state(page);
  result.portrait = compactState(portrait);
  result.landscape = compactState(landscape);
  assertGalleryStayedVisible(portrait, landscape, 'Portrait-to-landscape handoff');
  assert.equal(landscape.mode, 'inline', 'Short landscape should allow normal document flow');
  assert(result.landscape.futureRunway < 48, 'Orientation change leaves an empty future scroll runway');
  await checkImages(page, 'Landscape orientation change');
  await page.screenshot({ path: path.join(output, 'orientation-landscape.png') });

  // The short viewport must let the visitor leave through normal touch scrolling.
  await nativeTouchScroll(page);
  const scrolled = await state(page);
  assert(scrolled.scrollY > landscape.scrollY + 20, 'Landscape touch scrolling is trapped after orientation change');
  assert(scrolled.panel.top < landscape.panel.top - 20, 'Landscape panel does not release after orientation change');
  result.landscapeAfterTouch = compactState(scrolled);

  // Return to the same document location and restore portrait without restarting.
  await jump(page, landscape.scrollY);
  const beforeReturn = await state(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await sleep(page, 1000);
  const restored = await state(page);
  assertGalleryStayedVisible(beforeReturn, restored, 'Landscape-to-portrait handoff');
  result.portraitRestored = compactState(restored);
}

async function manualMotion(page, result) {
  const before = await atProgress(page, 0.45);
  const toggle = page.locator('#work').getByRole('button', { name: 'View without motion', exact: true });
  await toggle.click();
  await sleep(page, 700);
  const stable = await state(page);
  result.before = compactState(before);
  result.stable = compactState(stable);
  assert.equal(await toggle.getAttribute('aria-pressed'), 'true', 'Manual motion control is not pressed');
  assert.equal(stable.mode, 'still', 'Manual motion control does not disable scroll animation');
  assert(Math.abs(stable.panel.top - before.panel.top) < 48, 'Manual motion control displaces the gallery');
  assert(stable.heading.top >= -2 && stable.heading.bottom < stable.viewport.height, 'Manual motion control moves heading out of view');
  assert(result.stable.futureRunway < 48, 'Manual motion control retains unnecessary future scrolling');
  await sleep(page, 650);
  const idle = await state(page);
  assert.equal(idle.position, stable.position, 'Manual motion-off gallery autoplays');
  await checkImages(page, 'Manual motion-off state');
  await page.screenshot({ path: path.join(output, 'manual-motion-off.png') });
  await page.mouse.wheel(0, 160);
  await sleep(page, 550);
  const afterScroll = await state(page);
  assert.equal(afterScroll.active, stable.active, 'Scroll changes selected sample after manual motion-off');
  assert.equal(afterScroll.position, stable.position, 'Scroll changes pose after manual motion-off');
  assert(afterScroll.panel.top < stable.panel.top - 80, 'Manual motion-off leaves a trapped scroll runway');
  result.afterScroll = compactState(afterScroll);
  await page.getByRole('button', { name: 'Show Angular lines', exact: true }).click();
  await sleep(page, 250);
  assert.equal((await state(page)).active, 1, 'Manual motion-off breaks direct sample selection');
  await toggle.click();
  await sleep(page, 750);
  const resumed = await state(page);
  assert.notEqual(resumed.mode, 'still', 'Manual motion-on does not restore scroll sequence');
  result.resumed = compactState(resumed);
}

async function desktopResize(page, result) {
  let before = await atProgress(page, 0.5);
  result.initial = compactState(before);
  result.resizes = [];
  for (const viewport of [{ width: 1280, height: 900 }, { width: 1440, height: 600 }, { width: 1440, height: 960 }]) {
    await page.setViewportSize(viewport);
    await sleep(page, 950);
    const after = await state(page);
    result.resizes.push(compactState(after));
    assertGalleryStayedVisible(before, after, `Desktop resize to ${viewport.width}x${viewport.height}`);
    if (after.mode === 'inline') assert(result.resizes.at(-1).futureRunway < 48, 'Short desktop viewport retains an empty future scroll runway');
    before = after;
  }
  await page.mouse.wheel(0, 45);
  await sleep(page, 450);
  const afterScroll = await state(page);
  assert(afterScroll.position > before.position + 0.02, 'Scrolling does not resume after restoring desktop viewport');
  assert(afterScroll.position - before.position < 0.7, 'Scrolling jumps after restoring desktop viewport');
  result.afterScroll = compactState(afterScroll);
  await checkImages(page, 'Desktop resize');
  await page.screenshot({ path: path.join(output, 'desktop-resize-restored.png') });
}

async function restoredScroll(page, result) {
  const before = await atProgress(page, 0.42);
  result.beforeReload = compactState(before);
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => document.querySelector('#work [data-gallery-track]')?.dataset.scrollMode);
  await page.evaluate(() => document.fonts.ready);
  await sleep(page, 1300);
  const restored = await state(page);
  result.afterReload = compactState(restored);
  // The browser may restore a different document Y as upstream sections hydrate.
  // Verify the gallery follows that actual location, then revisit the original one.
  const restoredRange = await range(page);
  const progress = Math.max(0, Math.min(1, (restored.scrollY - restoredRange.start) / restoredRange.distance));
  const expectedPosition = progress * (restored.sampleCount - 1);
  result.nativeRestoration = { beforeY: before.scrollY, restoredY: restored.scrollY, range: restoredRange, expectedPosition };
  assert(Math.abs(restored.position - expectedPosition) < 0.075, `Reload does not map actual restored scroll location to gallery pose (${restored.position}, expected ${expectedPosition})`);
  checkLayout(restored, 'Restored scroll position');
  await checkImages(page, 'Restored scroll position');
  await jump(page, before.scrollY);
  const revisited = await state(page);
  result.revisitedOriginalY = compactState(revisited);
  assert(Math.abs(revisited.position - before.position) < 0.075, `Returning to original document Y after reload changes gallery pose (${before.position} -> ${revisited.position})`);
  await hoverCheck(page, result);
  await page.screenshot({ path: path.join(output, 'restored-scroll.png') });
}

async function hoverCheck(page, result) {
  const active = page.locator('#work [data-gallery-sample][data-active="true"]');
  await page.mouse.move(8, 8);
  await sleep(page, 450);
  const read = () => active.evaluate((sample) => ({
    transform: getComputedStyle(sample).transform,
    shadow: getComputedStyle(sample.firstElementChild).boxShadow,
    hovered: sample.matches(':hover'),
  }));
  const before = await read();
  const box = await active.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await sleep(page, 450);
  const hovered = await read();
  assert(hovered.hovered, 'Active tile did not receive hover');
  assert.equal(hovered.transform, before.transform, 'Hover changes the tile transform and competes with scroll motion');
  assert.notEqual(hovered.shadow, before.shadow, 'Existing active-tile hover shadow no longer responds');
  result.hover = { transformStable: true, shadowResponds: true };
}

async function main() {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const results = [];
  try {
    for (const item of cases) {
      const context = await browser.newContext({
        viewport: { width: item.width, height: item.height },
        deviceScaleFactor: 1,
        isMobile: Boolean(item.mobile),
        hasTouch: Boolean(item.mobile),
        reducedMotion: item.reduced ? 'reduce' : 'no-preference',
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
      const result = { case: item.name, viewport: `${item.width}x${item.height}`, status: 'running' };
      console.log(`Checking ${item.name} (${result.viewport})`);
      try {
        await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForFunction(() => document.querySelector('#work [data-gallery-track]')?.dataset.scrollMode, { timeout: 20000 });
        await page.evaluate(() => document.fonts.ready);
        await sleep(page, 1000);
        if (item.scenario === 'orientation') await orientation(page, result);
        else if (item.scenario === 'manual-motion') await manualMotion(page, result);
        else if (item.scenario === 'desktop-resize') await desktopResize(page, result);
        else if (item.scenario === 'restored-scroll') await restoredScroll(page, result);
        else if (item.reduced) await reducedMotion(page, item, result);
        else {
          await scrollSequence(page, item, result);
          if (item.interactions) await interactions(page, item, result);
          if (item.name === 'desktop-tall') await runtimeReducedMotion(page, result);
        }
        assert.equal(errors.length, 0, `Browser errors: ${errors.join(' | ')}`);
        result.status = 'passed';
        console.log(`PASS ${item.name}`);
      } catch (error) {
        result.status = 'failed';
        result.error = error.stack || String(error);
        result.browserErrors = errors;
        try { result.state = await state(page); } catch {}
        await page.screenshot({ path: path.join(output, `${item.name}-failure.png`) }).catch(() => {});
        console.error(`FAIL ${item.name}: ${error.message}`);
      }
      results.push(result);
      fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(results, null, 2));
      await context.close();
    }
  } finally {
    await browser.close();
  }
  console.log(JSON.stringify(results.map(({ case: name, status, error }) => ({ case: name, status, error: error?.split('\n')[0] })), null, 2));
  if (results.some((result) => result.status === 'failed')) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
