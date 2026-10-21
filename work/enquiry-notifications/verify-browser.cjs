/* End-to-end browser checks against the local app's isolated Neon branch.
 * All inquiry content is synthetic. This script does not load provider secrets.
 * Run: node work/enquiry-notifications/verify-browser.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const { require: tsxRequire } = require('tsx/cjs/api');
const { renderEnquiryEmail, ENQUIRY_DASHBOARD_URL } = tsxRequire('../../src/lib/enquiry-email.ts', __filename);
const baseURL = process.env.ENQUIRY_BASE_URL || 'http://127.0.0.1:3110';
const output = __dirname;
const report = { baseURL, createdAt: new Date().toISOString(), boundary: 'Local production build, isolated Neon branch, no real Resend credentials. Browser verifies saved form state; provider delivery is tested separately with test doubles.', scenarios: [] };
let contextNumber = 20;

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

function recordReport() {
  fs.writeFileSync(path.join(output, 'browser-report.json'), JSON.stringify(report, null, 2));
}

async function scenario(name, task) {
  const started = Date.now();
  try {
    const detail = await task();
    report.scenarios.push({ name, passed: true, durationMs: Date.now() - started, ...detail });
    console.log(`${name}: passed`);
  } catch (error) {
    report.scenarios.push({ name, passed: false, durationMs: Date.now() - started, error: error.message });
    console.error(`${name}: FAILED\n${error.stack}`);
  }
  recordReport();
}

async function setup(browser, width, label) {
  const context = await browser.newContext({
    viewport: { width, height: width < 600 ? 844 : 960 },
    reducedMotion: 'reduce', isMobile: width < 600, hasTouch: width < 600,
    extraHTTPHeaders: { 'x-forwarded-for': `198.51.100.${contextNumber++}` },
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.setDefaultTimeout(25_000);
  await page.goto(`${baseURL}/#enquiry`, { waitUntil: 'domcontentloaded' });
  await page.locator('#enquiry-name').fill(`Notification browser ${label}`);
  await page.locator('#enquiry-email').fill(`notification-browser-${label}@example.test`);
  await page.locator('#enquiry-idea').fill(`Synthetic verification ${label}: a botanical feature wall for a Toronto reading room.`);
  return { context, page, errors };
}

async function capture(page, name) {
  await page.locator('#enquiry').scrollIntoViewIfNeeded();
  await page.locator('#enquiry').screenshot({ path: path.join(output, `${name}.png`), animations: 'disabled', style: '.site-header, .skip-link { visibility: hidden !important; }' });
}

async function geometry(page) {
  const result = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
  assert.ok(result.document <= result.viewport + 1, `No horizontal overflow: ${JSON.stringify(result)}`);
  return result;
}

async function saved(page, reference) {
  await page.waitForFunction(reference => document.querySelector('#enquiry [role="status"]')?.textContent.includes(reference), reference);
  assert.equal(await page.locator('#enquiry button[type="submit"]').textContent().then(text => text.trim()), 'Enquiry saved✓');
  assert.equal(await page.locator('#enquiry button[type="submit"]').isDisabled(), true);
  assert.equal(await page.locator('#enquiry form').getAttribute('aria-busy'), 'false');
  const message = await page.locator('#enquiry [role="status"]').innerText();
  assert.match(message, /saved/i);
  assert.doesNotMatch(message, /email (?:sent|delivered)/i);
  return message;
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [1440, 390]) {
      const label = width === 1440 ? 'desktop' : 'mobile';
      await scenario(`${label} real save, loading and synchronous duplicate prevention`, async () => {
        const h = await setup(browser, width, label);
        const gate = deferred();
        const arrived = deferred();
        const posts = [];
        try {
          await h.page.route('**/api/enquiry', async route => {
            if (route.request().method() !== 'POST') return route.continue();
            const response = await route.fetch();
            const body = await response.json();
            posts.push({ key: route.request().headers()['idempotency-key'], status: response.status(), body });
            arrived.resolve();
            await gate.promise;
            await route.fulfill({ response });
          });
          await h.page.locator('#enquiry form').evaluate(form => { form.requestSubmit(); form.requestSubmit(); });
          await arrived.promise;
          assert.equal(await h.page.locator('#enquiry form').getAttribute('aria-busy'), 'true');
          assert.equal(await h.page.locator('#enquiry button[type="submit"]').isDisabled(), true);
          await h.page.locator('#enquiry form').evaluate(form => { form.requestSubmit(); form.requestSubmit(); });
          await h.page.waitForTimeout(200);
          assert.equal(posts.length, 1, 'Repeated events produce one HTTP request');
          assert.equal(posts[0].status, 201);
          assert.match(posts[0].key, /^[0-9a-f-]{36}$/);
          await capture(h.page, `${label}-pending`);
          gate.resolve();
          const message = await saved(h.page, posts[0].body.reference);
          await capture(h.page, `${label}-saved`);
          assert.deepEqual(h.errors, []);
          return { posts, message, geometry: await geometry(h.page), browserErrors: h.errors };
        } finally { gate.resolve(); await h.context.close(); }
      });
    }

    await scenario('lost successful response retries the same saved inquiry and UUID', async () => {
      const h = await setup(browser, 1440, 'lost-response');
      const posts = [];
      try {
        await h.page.route('**/api/enquiry', async route => {
          if (route.request().method() !== 'POST') return route.continue();
          const response = await route.fetch();
          const body = await response.json();
          posts.push({ key: route.request().headers()['idempotency-key'], status: response.status(), body });
          if (posts.length === 1) return route.abort('failed');
          return route.fulfill({ response });
        });
        await h.page.locator('#enquiry button[type="submit"]').click();
        await h.page.waitForFunction(() => document.querySelector('#enquiry button[type="submit"]')?.getAttribute('data-submission') === 'error');
        assert.equal(posts[0].status, 201, 'Server saved before browser lost response');
        assert.match(await h.page.locator('#enquiry [role="status"]').innerText(), /could not confirm receipt/i);
        assert.equal(await h.page.locator('#enquiry-name').inputValue(), 'Notification browser lost-response');
        await capture(h.page, 'lost-response-preserved');
        await h.page.locator('#enquiry button[type="submit"]').click();
        const message = await saved(h.page, posts[0].body.reference);
        assert.equal(posts.length, 2);
        assert.equal(posts[1].status, 201);
        assert.equal(posts[1].key, posts[0].key);
        assert.equal(posts[1].body.reference, posts[0].body.reference);
        await capture(h.page, 'lost-response-retry-saved');
        assert.deepEqual(h.errors, []);
        return { posts, message, browserErrors: h.errors };
      } finally { await h.context.close(); }
    });

    const email = renderEnquiryEmail({
      reference: 'cb6d2e8a-a4bb-4db7-a875-bdd987bd98f7', receivedAt: '2026-10-20T17:45:00.000Z',
      name: 'Alex Morgan', email: 'alex.morgan@example.test', phone: '+1 226 555 0100',
      idea: 'We are planning a botanical feature wall for a quiet reading room.\nPlease advise on the tile finish and installation options.',
      projectType: 'Residential', application: 'Feature wall', location: 'Canada', dimensions: '3 × 2 metres',
      company: 'Morgan Design Studio', desiredDate: '2027-01-20', inspiration: null,
    });
    fs.writeFileSync(path.join(output, 'email-preview.html'), email.html);
    fs.writeFileSync(path.join(output, 'email-preview.txt'), email.text);
    for (const width of [390, 600]) {
      await scenario(`email template ${width}px rendering and links`, async () => {
        const context = await browser.newContext({ viewport: { width, height: 900 } });
        try {
          const page = await context.newPage();
          await page.setContent(email.html);
          const layout = await geometry(page);
          assert.equal(await page.getByRole('heading', { name: 'You’ve received a new inquiry.' }).count(), 1);
          assert.equal(await page.getByRole('link', { name: 'View Inquiry Dashboard' }).getAttribute('href'), ENQUIRY_DASHBOARD_URL);
          assert.equal(await page.getByRole('link', { name: ENQUIRY_DASHBOARD_URL, exact: true }).getAttribute('href'), ENQUIRY_DASHBOARD_URL);
          assert.match(await page.locator('body').innerText(), /America\/Toronto/);
          await page.screenshot({ path: path.join(output, `email-${width}.png`), fullPage: true });
          return { geometry: layout, dashboardURL: ENQUIRY_DASHBOARD_URL };
        } finally { await context.close(); }
      });
    }

    await scenario('published dashboard URL reaches protected owner sign-in', async () => {
      const context = await browser.newContext();
      try {
        const page = await context.newPage();
        const response = await page.goto(ENQUIRY_DASHBOARD_URL, { waitUntil: 'domcontentloaded', timeout: 45_000 });
        await page.locator('h1').waitFor({ timeout: 20_000 });
        const detail = { requestedURL: ENQUIRY_DASHBOARD_URL, finalURL: page.url(), status: response.status(), title: await page.title(), heading: await page.locator('h1').allTextContents(), boundary: 'Unauthenticated browser check only. No credentials supplied or authentication bypassed.' };
        assert.equal(response.status(), 200);
        assert.equal(new URL(page.url()).hostname, new URL(ENQUIRY_DASHBOARD_URL).hostname);
        assert.match(new URL(page.url()).pathname, /^\/login\/?$/);
        assert.match(detail.heading.join(' '), /welcome|sign in|log in/i);
        await page.screenshot({ path: path.join(output, 'dashboard-login.png'), fullPage: true });
        return detail;
      } finally { await context.close(); }
    });
  } finally { await browser.close(); }
  recordReport();
  if (report.scenarios.some(result => !result.passed)) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
