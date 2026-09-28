const { chromium } = require('C:/Users/Vraj Panchal/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
 const browser = await chromium.launch({channel:'chrome',headless:true});
 const page = await browser.newPage({viewport:{width:1440,height:960}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:3000', {waitUntil:'networkidle'});
 await page.locator('#work').scrollIntoViewIfNeeded();
 await page.screenshot({path:'work/gallery-scroll/before.png'});
 console.log(JSON.stringify({title:await page.title(), gallery:await page.locator('#gallery-heading').innerText(),buttons:await page.locator('#work button').count(),errors}));
 await browser.close();
})();
