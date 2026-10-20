/* Safe browser checks: all /api/enquiry GET and POST requests are mocked.
 * ENQUIRY_BASE_URL=http://127.0.0.1:3000 ENQUIRY_OUTPUT_DIR=/tmp/enquiry-checks node work/enquiry-redesign/verify.cjs
 * Uses the bundled Playwright runtime without changing application dependencies. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));

const baseURL = process.env.ENQUIRY_BASE_URL || 'http://127.0.0.1:3000';
const output = process.env.ENQUIRY_OUTPUT_DIR || __dirname;
fs.mkdirSync(output, { recursive: true });
const results = [];
const reference = 'cb6d2e8a-a4bb-4db7-a875-bdd987bd98f7';
const success = { status: 201, body: { message: 'Your enquiry has been received. Thank you for sharing your idea.', reference } };
const tick = page => page.waitForTimeout(200);

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

async function harness(browser, options = {}, capabilities = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, reducedMotion: 'reduce', ...options });
  const state = { available: true, uploadsAvailable: true, posts: [], gets: 0, next: success, errors: [], ...capabilities };
  await context.route('**/api/enquiry', async route => {
    const request = route.request();
    if (request.method() === 'GET') {
      state.gets++;
      if (state.availabilityGate) await state.availabilityGate.promise;
      if (state.capabilityAbort) return route.abort('failed');
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ available: state.available, uploadsAvailable: state.uploadsAvailable }) });
    }
    if (request.method() === 'POST') {
      state.posts.push(request.postData() || '');
      const reply = state.next;
      if (reply.wait) await reply.wait.promise;
      if (reply.abort) return route.abort('failed');
      return route.fulfill({ status: reply.status, contentType: 'application/json', body: JSON.stringify(reply.body) });
    }
    return route.fulfill({ status: 405, body: 'Mock only: method rejected' });
  });
  const page = await context.newPage();
  page.on('pageerror', error => state.errors.push(error.message));
  page.setDefaultTimeout(20000);
  return { context, page, state };
}

async function open(page, query = '') {
  await page.goto(`${baseURL}/${query}#enquiry`, { waitUntil: 'domcontentloaded' });
  await page.locator('#enquiry').waitFor();
  await page.waitForFunction(() => document.querySelector('#enquiry-name') !== null);
}

async function ready(page) {
  await page.waitForFunction(() => !document.querySelector('#enquiry button[type="submit"]')?.disabled);
}

async function fillRequired(page) {
  await page.locator('#enquiry-name').fill('Browser Verification');
  await page.locator('#enquiry-email').fill('verification@example.test');
  await page.locator('#enquiry-idea').fill('A quiet botanical tile wall for a reading room.');
}

async function submit(page) {
  await page.locator('#enquiry button[type="submit"]').click();
}

async function waitText(page, text) {
  await page.waitForFunction(text => document.querySelector('#enquiry')?.textContent.includes(text), text);
}

async function checkValues(page) {
  assert.equal(await page.locator('#enquiry-name').inputValue(), 'Browser Verification');
  assert.equal(await page.locator('#enquiry-email').inputValue(), 'verification@example.test');
  assert.equal(await page.locator('#enquiry-idea').inputValue(), 'A quiet botanical tile wall for a reading room.');
}

async function checkNoAvailabilityBanner(page) {
  assert.equal(await page.locator('#enquiry').getByText('Checking enquiry availability…', { exact: true }).count(), 0);
  assert.equal(await page.locator('#enquiry').getByText(/Online enquiries are currently unavailable/).count(), 0);
  assert.equal(await page.locator('#enquiry').getByRole('button', { name: /Check availability/i }).count(), 0);
}

async function checkLayout(page) {
  const geometry = await page.locator('#enquiry').evaluate(section => {
    const rect = section.getBoundingClientRect();
    const bad = [...section.querySelectorAll('input:not([type="hidden"]), textarea, select, button, summary, h2')]
      .filter(el => el.getClientRects().length && !el.closest('[aria-hidden="true"]'))
      .filter(el => {
        const box = el.getBoundingClientRect();
        return box.left < -1 || box.right > innerWidth + 1;
      }).map(el => ({ tag: el.tagName, id: el.id, text: el.textContent.slice(0, 60) }));
    return { viewport: innerWidth, document: document.documentElement.scrollWidth, section: { width: rect.width, left: rect.left, right: rect.right }, bad };
  });
  assert(geometry.document <= geometry.viewport + 1, `Document overflow: ${JSON.stringify(geometry)}`);
  assert.deepEqual(geometry.bad, [], 'Enquiry controls remain inside viewport');
  assert.equal(await page.locator('[data-nextjs-dialog]').count(), 0, 'No Next.js error overlay');
  return geometry;
}

async function capture(page, name) {
  await page.locator('#enquiry').scrollIntoViewIfNeeded();
  await tick(page);
  // Isolate this section in tall element captures; otherwise the fixed site header
  // is composited halfway through a mobile image while Playwright stitches it.
  await page.locator('#enquiry').screenshot({ path: path.join(output, `${name}.png`), animations: 'disabled', style: '.site-header, .skip-link { visibility: hidden !important; }' });
}

async function scenario(name, task) {
  if (process.env.ENQUIRY_TEST_FILTER && !name.includes(process.env.ENQUIRY_TEST_FILTER)) return;
  const started = Date.now();
  try {
    const detail = await task();
    results.push({ name, passed: true, durationMs: Date.now() - started, ...detail });
    console.log(`${name}: passed`);
  } catch (error) {
    results.push({ name, passed: false, error: error.message, durationMs: Date.now() - started });
    console.error(`${name}: FAILED\n${error.stack}`);
  }
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    await scenario('capability check, pending, success and reset', async () => {
      const checking = deferred();
      const h = await harness(browser, {}, { availabilityGate: checking });
      try {
        const { page, state } = h;
        await open(page);
        await ready(page);
        await checkNoAvailabilityBanner(page);
        await submit(page);
        assert.equal(state.posts.length, 0, 'Native required validation prevents empty submission');
        await fillRequired(page);
        await page.locator('#enquiry details summary').click();
        await page.locator('#enquiry-projectType').selectOption('Residential');
        await page.locator('#enquiry-application').selectOption('Feature wall');
        await page.locator('#enquiry-location').fill('Canada');
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await page.locator('#enquiry-dimensions').fill('3 x 2 metres');
        const invalid = await page.locator('#enquiry form').evaluate(form => [...form.elements].filter(el => el.willValidate && !el.validity.valid).map(el => ({ name: el.name, value: el.value, message: el.validationMessage })));
        assert.deepEqual(invalid, [], 'Required and optional test inputs are valid before submission');
        const pending = deferred();
        state.next = { ...success, wait: pending };
        await submit(page);
        await page.waitForFunction(() => document.querySelector('#enquiry form')?.getAttribute('aria-busy') === 'true');
        assert(await page.locator('#enquiry button[type="submit"]').isDisabled(), 'Submit disabled during request');
        await page.locator('#enquiry form').evaluate(form => form.requestSubmit());
        await tick(page);
        assert.equal(state.posts.length, 1, 'Pending state prevents duplicate requests');
        assert(state.gets > 0, 'Upload capability is checked in the background');
        await checkValues(page);
        pending.resolve();
        await waitText(page, reference);
        assert(await page.locator('#enquiry button[type="submit"]').isDisabled(), 'Successful request cannot be repeated');
        await checkValues(page);
        await capture(page, 'desktop-success');
        await page.getByRole('button', { name: /Start another enquiry/i }).click();
        await ready(page);
        for (const id of ['name', 'email', 'idea', 'dimensions']) assert.equal(await page.locator(`#enquiry-${id}`).inputValue(), '', `${id} cleared`);
        assert.equal(await page.locator('#enquiry-projectType').inputValue(), 'Not sure yet');
        assert.equal(await page.locator('#enquiry-application').inputValue(), 'Not sure yet');
        assert.equal(await page.locator('#enquiry input[name="location"]').inputValue(), '');
        assert.deepEqual(state.errors, [], 'No browser exceptions');
        return { mockedPosts: state.posts.length };
      } finally { checking.resolve(); await h.context.close(); }
    });

    for (const [name, capabilities] of [
      ['unavailable capability', { available: false }],
      ['database-only capability', { uploadsAvailable: false }],
      ['failed capability request', { capabilityAbort: true }],
    ]) {
      await scenario(`${name} permits text submission without upload`, async () => {
        const h = await harness(browser, {}, capabilities);
        try {
          const { page, state } = h;
          await open(page); await ready(page); await fillRequired(page);
          await page.locator('#enquiry details summary').click();
          await tick(page);
          assert(state.gets > 0, 'Upload capability was requested');
          await checkNoAvailabilityBanner(page);
          assert.equal(await page.locator('#enquiry-inspiration').count(), 0, 'Unsupported uploads are not offered');
          await submit(page);
          await waitText(page, reference);
          assert.equal(state.posts.length, 1, 'Capability response never blocks a text enquiry');
          assert(!state.posts[0].includes('name="inspiration"'), 'Text enquiry has no attachment field');
          await checkValues(page);
          assert.deepEqual(state.errors, []);
          return { mockedPosts: state.posts.length };
        } finally { await h.context.close(); }
      });
    }

    await scenario('failure preservation and optional error focus', async () => {
      const h = await harness(browser);
      try {
        const { page, state } = h;
        await open(page); await ready(page); await fillRequired(page);
        state.next = { status: 502, body: { message: 'We could not confirm receipt. Your information is still here; please try again later.' } };
        await submit(page); await waitText(page, 'could not confirm receipt'); await checkValues(page);
        assert.equal(await page.locator('#enquiry').getByText(reference).count(), 0);
        state.next = { status: 422, body: { message: 'Please check the highlighted fields. Your idea has not been sent.', errors: { dimensions: 'Please include dimensions in plain text.' } } };
        await submit(page); await waitText(page, 'Please include dimensions');
        assert(await page.locator('#enquiry details').evaluate(el => el.open), 'Optional details open for backend error');
        await page.waitForFunction(() => document.activeElement?.id === 'enquiry-dimensions');
        assert.equal(await page.locator('#enquiry-dimensions').getAttribute('aria-invalid'), 'true');
        assert((await page.locator('#enquiry-dimensions').getAttribute('aria-describedby')).includes('enquiry-dimensions-error'));
        await checkValues(page); await capture(page, 'desktop-error');
        state.next = { abort: true };
        await submit(page); await waitText(page, 'check your connection'); await checkValues(page);
        assert.equal(state.posts.length, 3, 'Failures are not automatically retried');
        assert.deepEqual(state.errors, []);
        return { mockedPosts: state.posts.length };
      } finally { await h.context.close(); }
    });

    await scenario('503 preserves values and permits direct retry', async () => {
      const h = await harness(browser);
      try {
        const { page, state } = h;
        await open(page); await ready(page); await fillRequired(page);
        state.next = { status: 503, body: { message: 'Online enquiries are not connected yet. Your idea has not been sent.' } };
        await submit(page); await waitText(page, 'not connected yet');
        await ready(page);
        await checkValues(page);
        await checkNoAvailabilityBanner(page);
        assert.equal(await page.locator('#enquiry').getByText(reference).count(), 0, '503 never shows success');
        const before = state.gets;
        assert.equal(state.posts.length, 1, 'Failed submissions are not retried automatically');
        state.next = success;
        await submit(page);
        await waitText(page, reference);
        assert.equal(state.posts.length, 2, 'Manual retry reaches the submission endpoint directly');
        assert.equal(state.gets, before, 'Manual retry does not depend on another availability check');
        await checkValues(page);
        assert.deepEqual(state.errors, []);
        return { mockedPosts: state.posts.length };
      } finally { await h.context.close(); }
    });

    await scenario('oversized upload stays local', async () => {
      const h = await harness(browser);
      try {
        const { page, state } = h;
        await open(page); await ready(page); await fillRequired(page);
        await page.locator('#enquiry details summary').click();
        await page.locator('#enquiry-inspiration').setInputFiles({ name: 'oversized.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(5 * 1024 * 1024 + 1) });
        await submit(page); await waitText(page, 'no larger than 5 MB');
        assert.equal(state.posts.length, 0, 'Oversized file never leaves the browser');
        await page.waitForFunction(() => document.activeElement?.id === 'enquiry-inspiration');
        await checkValues(page);
        assert.deepEqual(state.errors, []);
      } finally { await h.context.close(); }
    });

    await scenario('URL, catalogue and event prefill', async () => {
      const h = await harness(browser);
      try {
        const { page, state } = h;
        await open(page, '?projectType=Hospitality&application=Custom%20mural&product=artful-surfaces-01');
        await ready(page);
        await page.waitForFunction(() => document.querySelector('#enquiry-idea')?.value.includes('Golden cranes'));
        assert.equal(await page.locator('#enquiry-projectType').inputValue(), 'Hospitality');
        assert.equal(await page.locator('#enquiry-application').inputValue(), 'Custom mural');
        assert(await page.locator('#enquiry details').evaluate(el => el.open));
        await page.evaluate(() => window.dispatchEvent(new CustomEvent('vavi:application', { detail: { projectType: 'Art & collaboration', application: 'Art installation' } })));
        assert.equal(await page.locator('#enquiry-projectType').inputValue(), 'Art & collaboration');
        assert.equal(await page.locator('#enquiry-application').inputValue(), 'Art installation');
        assert.equal(state.posts.length, 0);
        assert.deepEqual(state.errors, []);
      } finally { await h.context.close(); }
    });

    for (const width of [320, 390, 768, 1024, 1440]) {
      await scenario(`responsive ${width}px`, async () => {
        const h = await harness(browser, { viewport: { width, height: width < 600 ? 844 : 960 }, isMobile: width < 600, hasTouch: width < 600 });
        try {
          const { page, state } = h;
          await open(page); await ready(page);
          const closed = await checkLayout(page);
          await capture(page, `${width}-closed`);
          await page.locator('#enquiry details summary').click();
          await page.locator('#enquiry-location').fill('Canada');
          const expanded = await checkLayout(page);
          await page.keyboard.press('Escape');
          await capture(page, `${width}-expanded`);
          if (width < 600) {
            const fontSize = await page.locator('#enquiry-name').evaluate(el => parseFloat(getComputedStyle(el).fontSize));
            assert(fontSize >= 16, 'Mobile field text avoids automatic zoom');
          }
          assert.deepEqual(state.errors, []);
          return { closed, expanded };
        } finally { await h.context.close(); }
      });
    }

    await scenario('normal-motion form remains visible and keyboard accessible', async () => {
      const h = await harness(browser, { reducedMotion: 'no-preference' });
      try {
        const { page, state } = h;
        await open(page); await ready(page);
        await page.locator('#enquiry-name').focus();
        await page.keyboard.type('Keyboard visitor');
        await page.keyboard.press('Tab');
        assert.equal(await page.evaluate(() => document.activeElement?.id), 'enquiry-email');
        assert.equal(await page.locator('#enquiry-name').inputValue(), 'Keyboard visitor');
        const visible = await page.locator('#enquiry form').evaluate(el => getComputedStyle(el).visibility !== 'hidden' && Number(getComputedStyle(el).opacity) > 0);
        assert(visible, 'Form is not hidden behind an animation');
        await checkLayout(page); await capture(page, 'desktop-motion');
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await tick(page);
        await checkLayout(page);
        assert.deepEqual(state.errors, []);
      } finally { await h.context.close(); }
    });
  } finally { await browser.close(); }
  const failed = results.filter(result => !result.passed);
  console.log(`${results.length - failed.length}/${results.length} browser scenarios passed. All enquiry requests were mocked.`);
  if (failed.length) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
