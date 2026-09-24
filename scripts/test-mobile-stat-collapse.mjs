import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true });
try {
  for (const width of [360, 412, 480]) {
    const page = await browser.newPage({ viewport: { width, height: 800 }, isMobile: true, hasTouch: true });
    await page.goto('http://127.0.0.1:5184');
    for (const [side, name] of [['attack', '攻击'], ['defense', '减伤']]) {
      const card = page.locator(`.mobile-combatant.${side}`);
      const body = card.locator('.mobile-combatant__body');
      const open = () => card.locator('.mobile-combatant__summary').tap();
      await open();
      const preset = card.getByRole('checkbox', { name: '使用预设' });
      if (await preset.isChecked()) await preset.uncheck();
      const row = card.locator('.stat-field').filter({ has: page.locator('span', { hasText: new RegExp(`^${name}$`) }) });
      const slider = row.locator('input[type=range]');
      const input = row.locator('input[type=text]');
      await input.fill(name === '攻击' ? '2500' : '25');
      await input.press('Enter');
      const before = await input.inputValue();
      for (const location of ['text', 'gap']) {
        await row.scrollIntoViewIfNeeded();
        if (location === 'text') await row.locator('span').tap();
        else {
          const box = await row.boundingBox();
          await page.touchscreen.tap(box.x + box.width / 2, box.y + 1);
        }
        assert.equal(await body.isVisible(), false, `${width} ${side} ${location} must collapse`);
        await open();
        assert.equal(await input.inputValue(), before, 'blank collapse changed numeric input');
        assert.equal(await slider.inputValue(), before, 'blank collapse changed slider');
      }
      await slider.tap();
      assert.equal(await body.isVisible(), true, 'slider must not collapse panel');
      const tapped = await slider.inputValue();
      assert.equal(tapped, before, 'touch tap must not change slider value');
      await slider.press('ArrowRight');
      assert.equal(Number(await slider.inputValue()), Number(tapped) + 1);
      await input.fill(name === '攻击' ? '3000' : '30');
      await input.press('Enter');
      assert.equal(await body.isVisible(), true, 'editing input must not collapse panel');
      assert.equal(await slider.inputValue(), name === '攻击' ? '3000' : '30');
    }
    console.log(`PASS ${width}px: attack/reduction blank taps preserve values; controls remain usable`);
    await page.close();
  }
} finally { await browser.close(); }
