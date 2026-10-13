/* Local enquiry/footer transition verification. All enquiry traffic is mocked.
 * ENQUIRY_BASE_URL=http://127.0.0.1:3000 node work/enquiry-redesign/verify-transition.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/Vraj Panchal/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const baseURL = process.env.ENQUIRY_BASE_URL || 'http://127.0.0.1:3000';
const output = __dirname;
const results = [];
const sectionIds = ['work', 'possibilities', 'process', 'specifications', 'faq', 'enquiry'];
const reference = 'cb6d2e8a-a4bb-4db7-a875-bdd987bd98f7';
const pause = page => page.waitForTimeout(250);

async function setup(browser, width, reducedMotion = 'reduce') {
  const context = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 960 }, reducedMotion, isMobile: width < 600, hasTouch: width < 600 });
  const state = { posts: 0, errors: [] };
  await context.route('**/api/enquiry', route => {
    if (route.request().method() === 'GET') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ available: true }) });
    if (route.request().method() === 'POST') {
      state.posts++;
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ message: 'Your enquiry has been received. Thank you for sharing your idea.', reference }) });
    }
    return route.fulfill({ status: 405, body: 'Mock only' });
  });
  const page = await context.newPage();
  page.on('pageerror', error => state.errors.push(error.message));
  page.setDefaultTimeout(20000);
  return { context, page, state };
}

async function home(page) {
  await page.goto(`${baseURL}/#enquiry`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => {
    const button = document.querySelector('#enquiry button[type="submit"]');
    return button && !button.disabled;
  });
  await page.locator('footer.site-footer').waitFor();
}

async function boundary(page, name) {
  // Put the footer boundary in the lower half: the enquiry CTA stays visible above it.
  await page.evaluate(() => {
    const footer = document.querySelector('footer.site-footer');
    const footerTop = footer.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: footerTop - innerHeight * 0.54, behavior: 'instant' });
  });
  await pause(page);
  const visibility = await page.evaluate(() => {
    const submit = document.querySelector('#enquiry button[type="submit"]').getBoundingClientRect();
    const footer = document.querySelector('footer.site-footer').getBoundingClientRect();
    return { submitTop: submit.top, submitBottom: submit.bottom, footerTop: footer.top, height: innerHeight };
  });
  assert(visibility.submitTop >= 0 && visibility.submitBottom < visibility.height, `Submit remains visible with footer: ${JSON.stringify(visibility)}`);
  assert(visibility.footerTop > 0 && visibility.footerTop < visibility.height * 0.8, `Footer boundary is visible: ${JSON.stringify(visibility)}`);
  // Only hide fixed overlays for a clean viewport capture; document geometry is unchanged.
  await page.screenshot({ path: path.join(output, `transition-${name}.png`), animations: 'disabled', style: '.site-header, .skip-link { visibility: hidden !important; }' });
  return visibility;
}

async function layout(page) {
  const geometry = await page.evaluate(() => {
    const section = document.querySelector('#enquiry');
    const surface = section?.querySelector('[class*="surface"]');
    const footer = document.querySelector('footer.site-footer');
    const rect = el => {
      const b = el.getBoundingClientRect();
      return { left: b.left, right: b.right, top: b.top, bottom: b.bottom, width: b.width, height: b.height };
    };
    const bad = [...document.querySelectorAll('#enquiry input:not([type="hidden"]), #enquiry textarea, #enquiry select, #enquiry button, footer a, footer nav, footer img')]
      .filter(el => el.getClientRects().length && !el.closest('[aria-hidden="true"]') && getComputedStyle(el).visibility !== 'hidden')
      .filter(el => { const b = el.getBoundingClientRect(); return b.left < -1 || b.right > innerWidth + 1; })
      .map(el => ({ tag: el.tagName, id: el.id, text: el.textContent.slice(0, 50) }));
    return { viewport: innerWidth, document: document.documentElement.scrollWidth, section: section && rect(section), surface: surface && rect(surface), footer: rect(footer), bad };
  });
  assert(geometry.document <= geometry.viewport + 1, `No horizontal page overflow: ${JSON.stringify(geometry)}`);
  assert.deepEqual(geometry.bad, [], 'Enquiry and footer controls stay within viewport');
  if (geometry.section) {
    assert(geometry.surface, 'Enquiry has a distinct inset surface wrapper');
    assert(geometry.surface.left - geometry.section.left >= 12, 'Panel has a visible physical left inset');
    assert(geometry.section.right - geometry.surface.right >= 12, 'Panel has a visible physical right inset');
    assert(geometry.section.bottom - geometry.surface.bottom >= 20, 'Panel has clear space below, beyond color contrast');
    assert(geometry.footer.top >= geometry.section.bottom - 1, 'Footer does not overlap the enquiry section');
  }
  assert.equal(await page.locator('[data-nextjs-dialog]').count(), 0);
  return geometry;
}

async function footerContract(page, onHome) {
  const footer = page.locator('footer.site-footer');
  assert.equal(await footer.count(), 1, 'One semantic footer');
  assert((await footer.getByRole('navigation').count()) >= 1, 'Footer has semantic navigation');
  for (const id of sectionIds) assert.equal(await footer.locator(`a[href="${onHome ? '' : '/'}#${id}"]`).count(), 1, `Preserved ${id} destination`);
  assert.equal(await footer.locator('a[href="/brochures"]').count(), 1, 'Brochure destination preserved');
  assert.equal(await footer.locator(`a[aria-label="VAVI Tile Studio home"][href="${onHome ? '' : '/'}#top"]`).count(), 1, 'Brand home destination preserved');
  assert.equal(await footer.getByRole('link', { name: /Back to top/ }).getAttribute('href'), '#top', 'Back to top remains local');
  const small = await footer.locator('a').evaluateAll(links => links.filter(link => link.getClientRects().length && (link.getBoundingClientRect().height < 43.5 || link.getBoundingClientRect().width < 43.5)).map(link => ({ text: link.textContent, width: link.getBoundingClientRect().width, height: link.getBoundingClientRect().height })));
  assert.deepEqual(small, [], 'Footer links provide at least 44px targets');
  assert.equal(await footer.locator('[data-motion-image]').count(), 0, 'Footer photograph has no parallax hook');
  const labelled = await footer.locator('nav').evaluateAll(nodes => nodes.every(node => node.getAttribute('aria-label') || node.getAttribute('aria-labelledby')));
  assert(labelled, 'Footer navigation landmarks have labels');
}

async function scenario(name, task) {
  if (process.env.ENQUIRY_TEST_FILTER && !name.includes(process.env.ENQUIRY_TEST_FILTER)) return;
  try {
    const detail = await task();
    results.push({ name, passed: true, ...detail });
    console.log(`${name}: passed`);
  } catch (error) {
    results.push({ name, passed: false, error: error.message });
    console.error(`${name}: FAILED\n${error.stack}`);
  }
  fs.writeFileSync(path.join(output, 'transition-results.json'), JSON.stringify(results, null, 2));
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [320, 390, 768, 1024, 1440]) {
      await scenario(`transition ${width}px`, async () => {
        const h = await setup(browser, width);
        try {
          const { page, state } = h;
          await home(page);
          const geometry = await layout(page);
          await footerContract(page, true);
          const closed = await boundary(page, `${width}-closed`);
          await page.locator('#enquiry details summary').click();
          await layout(page);
          const expanded = await boundary(page, `${width}-expanded`);
          if (width === 390 || width === 1440) {
            await page.locator('#enquiry-name').fill('Boundary verification');
            await page.locator('#enquiry-email').fill('boundary@example.test');
            await page.locator('#enquiry-idea').fill('A botanical tile wall. Mocked browser verification only.');
            await page.locator('#enquiry button[type="submit"]').click();
            await page.waitForFunction(ref => document.querySelector('#enquiry')?.textContent.includes(ref), reference);
            await boundary(page, `${width}-success`);
            assert.equal(state.posts, 1, 'One mocked success request');
          } else assert.equal(state.posts, 0);
          assert.deepEqual(state.errors, []);
          return { geometry, closed, expanded };
        } finally { await h.context.close(); }
      });
    }
    await scenario('homepage footer anchors and keyboard focus', async () => {
      const h = await setup(browser, 1440);
      try {
        const { page, state } = h;
        await home(page);
        const enquiry = page.locator('footer a[href="#enquiry"]');
        await enquiry.focus();
        await page.keyboard.press('Tab');
        const focus = await page.evaluate(() => {
          const el = document.activeElement;
          const css = getComputedStyle(el);
          return { tag: el.tagName, footer: !!el.closest('footer'), outline: css.outlineStyle, width: parseFloat(css.outlineWidth) };
        });
        assert(focus.footer && focus.tag === 'A', 'Keyboard continues through footer links');
        assert(focus.outline !== 'none' && focus.width > 0, 'Footer keyboard focus is visible');
        await enquiry.click();
        await page.waitForFunction(() => location.hash === '#enquiry' && document.activeElement?.id === 'enquiry');
        await page.locator('footer a[href="#process"]').click();
        await page.waitForFunction(() => location.hash === '#process' && document.activeElement?.id === 'process');
        await page.locator('footer').getByRole('link', { name: /Back to top/ }).click();
        await page.waitForFunction(() => scrollY < 3);
        assert.equal(state.posts, 0);
        assert.deepEqual(state.errors, []);
      } finally { await h.context.close(); }
    });
    for (const width of [390, 1440]) {
      await scenario(`brochures footer ${width}px`, async () => {
        const h = await setup(browser, width);
        try {
          const { page, state } = h;
          await page.goto(`${baseURL}/brochures`, { waitUntil: 'domcontentloaded' });
          await page.locator('footer.site-footer').waitFor();
          await footerContract(page, false);
          const geometry = await layout(page);
          await page.locator('footer').scrollIntoViewIfNeeded();
          await page.locator('footer').screenshot({ path: path.join(output, `transition-brochures-${width}.png`), animations: 'disabled', style: '.site-header, .skip-link { visibility: hidden !important; }' });
          await page.locator('footer').getByRole('link', { name: /Back to top/ }).click();
          await page.waitForFunction(() => scrollY < 3);
          assert.equal(new URL(page.url()).pathname, '/brochures', 'Back to top stays on brochures');
          await page.locator('footer a[href="/#enquiry"]').click();
          await page.waitForURL('**/#enquiry');
          await page.locator('#enquiry').waitFor();
          await page.waitForFunction(() => { const rect = document.querySelector('#enquiry')?.getBoundingClientRect(); return rect && rect.top >= 0 && rect.top < 200; });
          assert.equal(state.posts, 0);
          assert.deepEqual(state.errors, []);
          return { geometry };
        } finally { await h.context.close(); }
      });
    }
    await scenario('normal-motion transition remains steady', async () => {
      const h = await setup(browser, 1440, 'no-preference');
      try {
        const { page, state } = h;
        await home(page);
        await boundary(page, '1440-motion');
        await footerContract(page, true);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await pause(page);
        await layout(page);
        assert.equal(state.posts, 0);
        assert.deepEqual(state.errors, []);
      } finally { await h.context.close(); }
    });
  } finally { await browser.close(); }
  const failed = results.filter(result => !result.passed);
  console.log(`${results.length - failed.length}/${results.length} transition checks passed. Enquiry traffic was mocked.`);
  if (failed.length) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
