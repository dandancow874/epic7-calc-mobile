import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true });
try {
  for (const [hero, additional] of [['abigail', false], ['young_senya', true]]) {
    const page = await browser.newPage({ viewport: { width: 412, height: 850 }, isMobile: true, hasTouch: true });
    await page.addInitScript(id => localStorage.setItem('epic7.tools.calculatorHero.attacker.v1', id), hero);
    await page.goto('http://127.0.0.1:5184');
    const card = page.locator('.mobile-combatant.attack');
    await card.locator('.mobile-combatant__summary').tap();
    const common = card.locator('.buff-row');
    for (const name of ['激流套', '穿透套', '全力套装']) {
      await common.getByRole('button', { name: new RegExp(name) }).waitFor();
      assert.equal(await common.getByRole('button', { name: new RegExp(name) }).count(), 1);
    }
    if (additional) await common.getByRole('button', { name: /追击套/ }).waitFor();
    else assert.equal(await common.getByRole('button', { name: /追击套/ }).count(), 0);
    for (const name of ['攻击力降低', '攻击大提升']) assert.equal(await common.getByRole('button', { name: new RegExp(name) }).count(), 0);
    await common.getByRole('button', { name: /更多/ }).tap();
    const modal = page.locator('.state-modal');
    for (const name of ['攻击力降低', '攻击大提升']) await modal.getByRole('button', { name: new RegExp(name) }).waitFor();
    for (const name of ['激流套', '穿透套', '全力套装']) assert.equal(await modal.getByRole('button', { name: new RegExp(name) }).count(), 0);
    assert.equal(await modal.getByRole('button', { name: /追击套/ }).count(), additional ? 0 : 1);
    await modal.getByRole('button', { name: /攻击力降低/ }).tap();
    await modal.getByRole('button', { name: '关闭', exact: true }).tap();
    assert.equal(await common.getByRole('button', { name: /攻击力降低/ }).count(), 0);
    console.log(`PASS ${hero}: common buffs and folded states`);
    await page.close();
  }
} finally { await browser.close(); }
