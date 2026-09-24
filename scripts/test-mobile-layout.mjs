import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true });
try {
  for (const width of [360, 384, 412, 480, 600, 720]) {
    const page = await browser.newPage({ viewport: { width, height: 800 }, isMobile: true, hasTouch: true });
    await page.goto('http://127.0.0.1:5184');
    const attack = page.locator('.mobile-combatant.attack');
    const defense = page.locator('.mobile-combatant.defense');
    await attack.waitFor();
    assert.equal(await attack.locator('.mobile-combatant__body').isVisible(), false);
    assert.equal(await defense.locator('.mobile-combatant__body').isVisible(), false);
    await attack.locator('.mobile-combatant__summary').click();
    assert.equal(await attack.locator('.mobile-combatant__body').isVisible(), true);
    assert.equal(await attack.locator('.mobile-combatant__summary').isVisible(), false);
    const panel = attack.locator('.combat-panel');
    await panel.dispatchEvent('click');
    assert.equal(await attack.locator('.mobile-combatant__body').isVisible(), false, 'bottom blank area should collapse');
    await attack.locator('.mobile-combatant__summary').click();
    await attack.locator('.panel-head').click({ position: { x: 2, y: 2 } });
    assert.equal(await attack.locator('.mobile-combatant__body').isVisible(), false);
    await attack.locator('.mobile-combatant__summary').click();
    await attack.locator('[data-artifact-level]').click();
    assert.equal(await attack.locator('.mobile-combatant__body').isVisible(), true);
    await attack.getByRole('button', { name: '收起攻击对象', exact: true }).click({ position: { x: 5, y: 10 } });
    assert.equal(await attack.locator('.mobile-combatant__body').isVisible(), false);
    await attack.locator('.mobile-combatant__summary').click();
    await attack.getByRole('button', { name: '收起攻击对象', exact: true }).click();
    assert.equal(await attack.locator('.mobile-combatant__body').isVisible(), false);
    await attack.locator('.mobile-combatant__summary').click();
    await defense.locator('.mobile-combatant__summary').click();
    assert.equal(await attack.locator('.mobile-combatant__body').isVisible(), false);
    await defense.locator('.portrait-button').click();
    await page.locator('.searchbox input').fill('雅碧凯');
    await page.locator('.picker-row').first().waitFor();
    // Reduced height approximates the space remaining above a software keyboard.
    await page.setViewportSize({ width, height: 360 });
    const row = await page.locator('.picker-row').first().boundingBox();
    assert.ok(row && row.y >= 0 && row.y + row.height <= 360, `search row clipped at ${width}`);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${width}`);
    await page.locator('.picker-row').first().click();
    await page.setViewportSize({ width, height: 800 });
    await page.getByRole('button', { name: '打开工具导航' }).click();
    await page.locator('.mobile-drawer nav button').filter({ hasText: '角色装备' }).click();
    await page.locator('.build-workbench').waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `build page overflow at ${width}`);
    console.log(`PASS ${width}px: calculator collapse/search and build-page width`);
    await page.close();
  }
} finally { await browser.close(); }
