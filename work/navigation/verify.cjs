const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('C:/Users/Vraj Panchal/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const output = 'work/navigation';
const results = [];
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const errors = [];
  try {
    const page = await browser.newPage();
    page.on('pageerror', error => errors.push(error.message));
    for (const [name, width, height] of [['wide',1920,1080],['desktop',1440,960],['laptop',1280,800],['boundary-desktop',1024,768],['tablet',820,1180],['mobile',390,844],['small-mobile',320,640]]) {
      await page.setViewportSize({ width, height });
      await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
      await page.locator('.brand-logo').first().evaluate(img => img.decode());
      const geometry = await page.evaluate(() => {
        const header = document.querySelector('.site-header');
        const nav = document.querySelector('.desktop-nav');
        const cta = document.querySelector('.desktop-cta');
        const logo = header.querySelector('img');
        const r = el => { const b = el.getBoundingClientRect(); return { left:b.left, right:b.right, top:b.top, bottom:b.bottom, width:b.width, height:b.height }; };
        return {header:r(header),nav:r(nav),cta:r(cta),logo:r(logo),naturalRatio:logo.naturalWidth/logo.naturalHeight,overflow:document.documentElement.scrollWidth>innerWidth,menu:getComputedStyle(document.querySelector('.menu-toggle')).display,active:header.querySelector('[aria-current]')?.getAttribute('href')??null};
      });
      assert.equal(geometry.header.height,width>=1024?96:80,name+' header height');
      assert.equal(geometry.overflow,false,name+' overflow');
      assert.equal(geometry.active,null,name+' top active');
      assert.ok(Math.abs(geometry.logo.width/geometry.logo.height-geometry.naturalRatio)<.01,name+' logo ratio');
      if(width>=1024){
        assert.equal(geometry.menu,'none');
        assert.ok(geometry.nav.right + 10 < geometry.cta.left,name+' CTA separation');
        assert.ok(Math.abs((geometry.nav.left+geometry.nav.right)/2-width/2)<1,name+' nav centered');
        assert.ok(geometry.logo.bottom<geometry.header.bottom,name+' logo fits');
      } else {
        await page.getByRole('button',{name:'Open menu',exact:true}).click();
        const targets=await page.locator('#mobile-nav a').evaluateAll(els=>els.map(el=>({height:el.getBoundingClientRect().height,width:el.getBoundingClientRect().width})));
        assert.ok(targets.every(t=>t.height>=44&&t.width>=44),name+' touch targets');
        await page.waitForFunction(()=>getComputedStyle(document.querySelector("#mobile-nav")).opacity==="1");
        await page.screenshot({path:`${output}/${name}-menu.png`});
        await page.keyboard.press('Tab');
        assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('href')),'#work');
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#mobile-nav').isVisible(),false);
        assert.equal(await page.evaluate(()=>document.activeElement.className),'menu-toggle');
      }
      await page.screenshot({ path:`${output}/${name}.png` });
      results.push({name,...geometry});
    }
    // Each original anchor works, reflects the visible section, and transfers focus.
    await page.setViewportSize({width:1440,height:1000});
    await page.goto('http://127.0.0.1:3000',{waitUntil:'networkidle'});
    for(const id of ['possibilities','work','process','specifications']){
      await page.locator(`.desktop-nav a[href="#${id}"]`).click();
      await page.waitForTimeout(1200);
      console.log('anchor',id,await page.evaluate(id=>({top:document.getElementById(id).getBoundingClientRect().top,active:document.querySelector('.desktop-nav [aria-current]')?.getAttribute('href'),focus:document.activeElement.id,hash:location.hash,scrollY,scrollMotion:document.documentElement.dataset.scrollMotion}),id));
      await page.waitForFunction(id=>document.querySelector(`.desktop-nav a[href="#${id}"]`).getAttribute('aria-current')==='location',id);
      await page.waitForFunction(id=>Math.abs(document.getElementById(id).getBoundingClientRect().top-112)<2,id);
      assert.equal(await page.evaluate(()=>document.activeElement.id),id);
      assert.equal(await page.locator('.site-header').getAttribute('data-scrolled'),'true');
      results.push({anchor:id,offset:await page.locator(`#${id}`).evaluate(el=>el.getBoundingClientRect().top)});
    }
    await page.screenshot({path:`${output}/desktop-scrolled.png`});
    await page.locator('.desktop-cta').click();
    await page.waitForFunction(()=>Math.abs(document.getElementById('enquiry').getBoundingClientRect().top-112)<2);
    await page.waitForFunction(()=>!document.querySelector('.desktop-nav [aria-current]'));
    assert.equal(await page.evaluate(()=>document.activeElement.id),'enquiry');
    // Gallery still pins below the sticky header while moving through samples.
    await page.locator('.desktop-nav a[href="#work"]').click();
    await page.waitForFunction(()=>Math.abs(document.getElementById('work').getBoundingClientRect().top-112)<2);
    const mode=await page.locator('[data-gallery-track]').getAttribute('data-scroll-mode');
    assert.equal(mode,'pinned');
    await page.mouse.wheel(0,650);
    await page.waitForFunction(()=>Math.abs(document.querySelector('[data-gallery-panel]').getBoundingClientRect().top-120)<2);
    assert.equal(await page.locator('.desktop-nav [aria-current]').getAttribute('href'),'#work');
    await page.screenshot({path:`${output}/gallery-sticky.png`});
    results.push({galleryMode:mode,stickyTop:await page.locator('[data-gallery-panel]').evaluate(el=>el.getBoundingClientRect().top)});
    // Mobile link closes the disclosure and releases the existing scroll lock.
    await page.setViewportSize({width:390,height:844});
    await page.goto('http://127.0.0.1:3000',{waitUntil:'networkidle'});
    await page.getByRole('button',{name:'Open menu',exact:true}).click();
    await page.locator('#mobile-nav a[href="#process"]').click();
    await page.waitForFunction(()=>Math.abs(document.getElementById('process').getBoundingClientRect().top-96)<2);
    assert.equal(await page.locator('#mobile-nav').isVisible(),false);
    assert.equal(await page.evaluate(()=>document.activeElement.id),'process');
    assert.notEqual(await page.evaluate(()=>document.documentElement.style.overflow),'hidden');
    await page.getByRole('button',{name:'Open menu',exact:true}).click();
    await page.waitForFunction(()=>getComputedStyle(document.querySelector('#mobile-nav')).opacity==='1');
    await page.screenshot({path:`${output}/mobile-active-menu.png`});
    await page.locator('#mobile-nav .header-cta').click();
    await page.waitForFunction(()=>Math.abs(document.getElementById('enquiry').getBoundingClientRect().top-96)<2);
    assert.equal(await page.evaluate(()=>document.activeElement.id),'enquiry');
    // Resizing an open disclosure never leaves focus hidden or the body locked.
    await page.getByRole('button',{name:'Open menu',exact:true}).click();
    await page.keyboard.press('Tab');
    await page.setViewportSize({width:1280,height:800});
    await page.waitForFunction(()=>document.documentElement.style.overflow!=='hidden');
    assert.equal(await page.locator('#mobile-nav').isVisible(),false);
    assert.equal(await page.evaluate(()=>document.activeElement.className),'wordmark');
    // Reduced motion uses the same anchor offset and disables menu/arrow motion.
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.setViewportSize({width:390,height:844});
    await page.goto('http://127.0.0.1:3000/#specifications',{waitUntil:'networkidle'});
    await page.waitForFunction(()=>Math.abs(document.getElementById('specifications').getBoundingClientRect().top-96)<2);
    await page.getByRole('button',{name:'Open menu',exact:true}).click();
    assert.equal(await page.locator('#mobile-nav').evaluate(el=>getComputedStyle(el).animationName),'none');
    await page.locator('#mobile-nav a[href="#possibilities"]').click();
    await page.waitForFunction(()=>Math.abs(document.getElementById('possibilities').getBoundingClientRect().top-96)<2);
    assert.equal(await page.locator('#mobile-nav [aria-current]').getAttribute('href'),'#possibilities');
    assert.equal(await page.locator('[data-nextjs-dialog]').count(),0);
    assert.deepEqual(errors,[]);
    results.push({mobileNavigation:'passed',resizeFocus:'passed',reducedMotion:'passed',deepLink:'passed',errors});
    fs.writeFileSync(`${output}/verification.json`,JSON.stringify(results,null,2));
    console.log(JSON.stringify({pass:true,viewports:7,anchors:5,gallery:mode,keyboard:true,reducedMotion:true,errors}));
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);fs.writeFileSync(`${output}/verification-partial.json`,JSON.stringify(results,null,2));process.exit(1)});
