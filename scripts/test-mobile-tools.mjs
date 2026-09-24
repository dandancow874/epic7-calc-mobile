import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch();
try {
  for (const width of [320, 360, 412, 480, 600]) {
    const page = await browser.newPage({ viewport: { width, height: 800 }, isMobile: true, hasTouch: true });
    await page.goto('http://127.0.0.1:5184');
    await page.locator('.mobile-combatant.attack').waitFor();
    for (const label of ['速度推算', '速攻值推算']) {
      await page.getByRole('button', { name: '打开工具导航' }).click();
      await page.waitForTimeout(250);
      assert.ok(await page.locator('.mobile-drawer').evaluate(el => el.contains(document.elementFromPoint(90, 350))), 'drawer is behind page');
      await page.locator('.mobile-drawer nav button').filter({ hasText: label }).click();
      await page.locator(label === '速度推算' ? '.speed-row' : '.readiness-row').first().waitFor();
      const bad = await page.locator('.speed-row input, .readiness-row input, .readiness-result').evaluateAll(els => els.filter(el => {
        const r = el.getBoundingClientRect(); return r.left < 0 || r.right > innerWidth;
      }).map(el => el.className));
      assert.deepEqual(bad, [], `clipped ${label} at ${width}`);
      if (width === 360) await page.screenshot({ path: `mobile-${label}-fixed.png` });
    }
    await page.getByRole('button', { name: '打开工具导航' }).click();
    await page.locator('.mobile-drawer nav button').filter({ hasText: '伤害计算' }).click();
    await page.locator('.mobile-combatant.attack .mobile-combatant__summary').click();
    await page.locator('.mobile-combatant.attack .artifact-icon-button').click();
    await page.locator('.picker-row').nth(1).click();
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => document.activeElement?.tagName === 'INPUT'), false, 'artifact selection focused input');
    console.log(`PASS ${width}px: drawer overlay, speed/CR bounds, artifact focus`);
    await page.close();
  }
} finally { await browser.close(); }
