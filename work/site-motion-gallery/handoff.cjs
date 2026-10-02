const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/Vraj Panchal/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const snapshot = (page) => page.evaluate(() => {
  const stage = document.querySelector('[data-gallery-stage]');
  const track = document.querySelector('[data-gallery-track]');
  return {
    position: Number(stage.dataset.galleryPosition),
    active: [...stage.querySelectorAll('[data-gallery-sample]')].findIndex((sample) => sample.dataset.active === 'true'),
    scrollY,
    start: Number(track.dataset.galleryScrollStart),
    end: Number(track.dataset.galleryScrollEnd),
  };
});

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
    await page.waitForSelector('html[data-scroll-motion="smooth"]');
    await page.waitForSelector('[data-gallery-position]');
    await page.waitForTimeout(800);
    const bounds = await snapshot(page);
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), bounds.start + (bounds.end - bounds.start) * .34);
    await page.waitForTimeout(900);
    const settled = await snapshot(page);
    await page.locator('[aria-label="Choose a sample"] button').nth(settled.active).click();
    await page.waitForTimeout(950);
    await page.getByRole('button', { name: 'Next sample', exact: true }).click();
    await page.waitForTimeout(65);
    const handoffStart = await snapshot(page);
    assert(handoffStart.position < handoffStart.active - .1, 'Test must interrupt an unfinished neighboring selection');
    await page.mouse.move(1100, 420);
    await page.mouse.wheel(0, 10);
    await page.waitForTimeout(90);
    const handoffEnd = await snapshot(page);
    assert(handoffEnd.position >= handoffStart.position - .03, 'Forward wheel reversed the manual transition');
    assert(handoffEnd.position - handoffStart.position < .45, 'Wheel takeover jumped to the unfinished manual destination');
    await page.waitForTimeout(700);
    await page.getByRole('button', { name: 'Next sample', exact: true }).click();
    const selectedForRefresh = (await snapshot(page)).active;
    await page.evaluate(() => document.querySelector('img').dispatchEvent(new Event('load')));
    await page.waitForTimeout(1000);
    const refreshed = await snapshot(page);
    assert(Math.abs(refreshed.position - selectedForRefresh) < .03, 'A layout refresh interrupted manual settling');
    await page.getByRole('button', { name: 'Inspect sample', exact: true }).click();
    await page.getByRole('dialog').waitFor({ state: 'visible' });
    const locked = await snapshot(page);
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(500);
    assert(Math.abs((await snapshot(page)).scrollY - locked.scrollY) < 2, 'Inspection background moved');
    assert(await page.getByRole('dialog').getAttribute('data-lenis-prevent') !== null, 'Inspection is missing native-scroll delegation');
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    assert(await page.evaluate(() => document.activeElement.matches('[data-gallery-sample]')), 'Inspection focus was not restored');
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(600);
    const unlocked = await snapshot(page);
    assert(unlocked.scrollY > locked.scrollY + 30, 'Page scroll did not resume after inspection');
    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 420 }, isMobile: true, hasTouch: true });
    const mobilePage = await mobileContext.newPage();
    mobilePage.on('pageerror', (error) => errors.push(error.message));
    await mobilePage.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
    await mobilePage.getByRole('button', { name: 'Inspect sample', exact: true }).click();
    const mobileDialog = mobilePage.getByRole('dialog');
    await mobileDialog.waitFor({ state: 'visible' });
    const mobileBefore = await mobileDialog.evaluate((dialog) => ({ pageY: scrollY, top: dialog.scrollTop, height: dialog.clientHeight, contentHeight: dialog.scrollHeight }));
    assert(mobileBefore.contentHeight > mobileBefore.height, 'Mobile dialog must overflow for this check');
    await mobilePage.mouse.move(195, 280);
    await mobilePage.mouse.wheel(0, 250);
    await mobilePage.waitForTimeout(400);
    const mobileAfter = await mobileDialog.evaluate((dialog) => ({ pageY: scrollY, top: dialog.scrollTop }));
    assert(mobileAfter.top > mobileBefore.top + 20, 'Mobile inspection content cannot scroll natively');
    assert(Math.abs(mobileAfter.pageY - mobileBefore.pageY) < 2, 'Native dialog scrolling moved the page');
    await mobilePage.keyboard.press('Escape');
    await mobileDialog.waitFor({ state: 'hidden' });
    await mobileContext.close();
    assert.equal(errors.length, 0, errors.join('\n'));
    const report = { settled, handoffStart, handoffEnd, refreshed, locked, unlocked, mobileBefore, mobileAfter, errors };
    fs.writeFileSync(path.join(__dirname, 'handoff-report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
