import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true });
try {
  for (const width of [360, 412, 480]) {
    const page = await browser.newPage({ viewport: { width, height: 850 }, isMobile: true, hasTouch: true });
    await page.goto('http://127.0.0.1:5184');
    const cdp = await page.context().newCDPSession(page);
    for (const [side, name, value] of [['attack', '攻击', '2500'], ['defense', '额外伤害减少', '0']]) {
      const card = page.locator(`.mobile-combatant.${side}`);
      await card.locator('.mobile-combatant__summary').tap();
      const preset = card.getByRole('checkbox', { name: '使用预设' });
      if (await preset.isChecked()) await preset.uncheck();
      const row = card.getByRole('group', { name, exact: true });
      const slider = row.locator('input[type=range]');
      const input = row.locator('input[type=text]');
      const reset = async () => { await input.fill(value); await input.press('Enter'); await row.scrollIntoViewIfNeeded(); };
      async function gesture(dx, dy, cancel = false) {
        const box = await slider.boundingBox();
        const x = box.x + box.width * .7, y = box.y + box.height / 2;
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
        // Touch-down must never commit even at a different point on the track.
        assert.equal(await input.inputValue(), value);
        for (let i = 1; i <= 5; i++) await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchMove', touchPoints: [{ x: x + dx * i / 5, y: y + dy * i / 5 }],
        });
        await cdp.send('Input.dispatchTouchEvent', { type: cancel ? 'touchCancel' : 'touchEnd', touchPoints: [] });
      }
      for (const [dx, dy, cancel] of [[0, 0, false], [0, -65, false], [3, 65, false], [2, -3, true]]) {
        await reset();
        await gesture(dx, dy, cancel);
        assert.equal(await slider.inputValue(), value, `${name} changed on tap/vertical/cancel`);
        assert.equal(await input.inputValue(), value);
        assert.equal(await card.locator('.mobile-combatant__body').isVisible(), true);
      }
      await reset();
      await gesture(30, 0);
      assert.notEqual(await input.inputValue(), value, `${name} horizontal drag must work`);
      // Numeric editing remains available after touch.
      await reset();
      assert.equal(await input.inputValue(), value);
    }
    console.log(`PASS ${width}: touch-down/tap/vertical/cancel preserved stats; horizontal drag and input work`);
    await page.close();
  }
  const mousePage = await browser.newPage({ viewport: { width: 412, height: 850 } });
  await mousePage.goto('http://127.0.0.1:5184');
  const defense = mousePage.locator('.mobile-combatant.defense');
  await defense.locator('.mobile-combatant__summary').click();
  const mouseSlider = defense.getByRole('slider', { name: '额外伤害减少', exact: true });
  const before = await mouseSlider.inputValue();
  await mouseSlider.click();
  assert.notEqual(await mouseSlider.inputValue(), before);
  console.log('PASS mouse click still changes slider');
  await mousePage.close();
} finally { await browser.close(); }
