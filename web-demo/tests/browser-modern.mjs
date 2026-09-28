import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const base = process.env.MODERN_URL || 'http://127.0.0.1:4187/modern/';
const out = new URL('../test-artifacts/modern/', import.meta.url);
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  const response = await page.goto(base);
  assert.equal(response.status(), 200, 'The modern chess prototype must be available');
  await page.waitForFunction(() => window.chessReady === true);
  const state = () => page.evaluate(() => JSON.parse(window.render_game_to_text()));
  assert.equal((await state()).pieces.length, 32);
  await page.click("#game-mode"); // Preserve the original free-arrangement acceptance coverage.
  await page.screenshot({ path: fileURLToPath(new URL('bone-board.png', out)) });
  // Catches style changes that reset an arrangement or display stale geometry.
  await page.locator('canvas').focus();
  await page.keyboard.press('Enter'); // e2 is the initial keyboard square.
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Enter');
  assert.equal((await state()).pieces.find(p => p.id === 'white-pawn-4').square, 'e4');
  for (const style of ['metal', 'simple', 'bone']) {
    await page.click(`[data-style="${style}"]`);
    assert.equal((await state()).style, style);
    assert.equal((await state()).pieces.find(p => p.id === 'white-pawn-4').square, 'e4');
    assert.equal(await page.locator(`[data-style="${style}"]`).getAttribute('aria-pressed'), 'true');
    await page.screenshot({ path: fileURLToPath(new URL(`${style}-arranged.png`, out)) });
  }
  await page.click('[data-view="pieces"]');
  assert.equal((await state()).view, 'pieces');
  await page.screenshot({ path: fileURLToPath(new URL('lineup.png', out)) });
  for (const style of ['bone', 'metal', 'simple']) {
    await page.click(`[data-style="${style}"]`);
    for (const piece of ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king']) {
      await page.click(`[data-piece="${piece}"]`);
      assert.equal((await state()).inspected, piece);
      assert.equal((await state()).view, 'piece');
    }
    await page.screenshot({ path: fileURLToPath(new URL(`${style}-king.png`, out)) });
  }
  await page.click('[data-side="black"]');
  assert.equal((await state()).side, 'black');
  await page.click('[data-view="board"]');
  assert.equal((await state()).view, 'board');
  await page.click('#reset-board');
  assert.equal((await state()).pieces.find(p => p.id === 'white-pawn-4').square, 'e2');
  await page.click('#top-view');
  assert.equal((await state()).camera, 'top');
  await page.screenshot({ path: fileURLToPath(new URL('top-view.png', out)) });
  // Use the visible top-down board to verify ordinary pointer selection/placement.
  // Project the centers of the visibly aligned top-down squares.
  const canvasBox = await page.locator('canvas').boundingBox();
  const tile = Math.min(canvasBox.width / 14.5, canvasBox.height / (14.5 * .74));
  const point = (file, row) => ({ x: canvasBox.x + canvasBox.width / 2 + (file - 3.5) * tile, y: canvasBox.y + canvasBox.height / 2 + (3.5 - row) * tile });
  const e2 = point(4, 1), e4 = point(4, 3);
  await page.mouse.click(e2.x, e2.y);
  assert.equal((await state()).selected, 'white-pawn-4');
  await page.mouse.click(e4.x, e4.y);
  assert.equal((await state()).pieces.find(p => p.id === 'white-pawn-4').square, 'e4');
  // Selecting an occupied destination changes selection without deleting a piece.
  await page.mouse.click(e4.x, e4.y);
  const d2 = point(3, 1); await page.mouse.click(d2.x, d2.y);
  assert.equal((await state()).pieces.length, 32);
  assert.equal((await state()).selected, 'white-pawn-3');
  for (const style of ['metal', 'bone', 'simple', 'bone']) await page.click(`[data-style="${style}"]`);
  assert.equal((await state()).pieces.find(p => p.id === 'white-pawn-4').square, 'e4');
  await page.click('#reset-view');
  assert.equal((await state()).camera, 'perspective');
  const beforeOrbit = await page.locator('canvas').screenshot();
  await page.mouse.move(canvasBox.x + canvasBox.width * .5, canvasBox.y + canvasBox.height * .4);
  await page.mouse.down();
  await page.mouse.move(canvasBox.x + canvasBox.width * .6, canvasBox.y + canvasBox.height * .4, { steps: 8 });
  await page.mouse.up();
  assert.notDeepEqual(await page.locator('canvas').screenshot(), beforeOrbit, 'Dragging rotates the actual scene');
  assert.equal((await state()).pieces.length, 32, 'Dragging does not remove pieces');
  await page.click('#reset-view');
  await page.click('#fullscreen');
  await page.waitForFunction(() => !!document.fullscreenElement);
  await page.evaluate(() => document.exitFullscreen());
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.click('#reset-board');
  await page.screenshot({ path: fileURLToPath(new URL('desktop-1280.png', out)) });
  const bounds = await page.locator('.workspace').boundingBox();
  assert(bounds.y + bounds.height <= 800, 'Board and style controls fit a standard desktop viewport');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: fileURLToPath(new URL('mobile.png', out)), fullPage: true });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.click('[data-style="bone"]');
  await page.click('[data-piece="knight"]');
  assert.equal((await state()).inspected, 'knight');
  await page.screenshot({ path: fileURLToPath(new URL('mobile-piece.png', out)), fullPage: true });
  assert.deepEqual(errors, []);
  await writeFile(new URL('validation.json', out), JSON.stringify({ passed: true, errors, checks: ['32-piece board', 'keyboard arrangement', 'style preserves arrangement', 'three styles', 'six individual figures per style', 'light/dark figures', 'board reset', 'top view', 'camera reset', 'fullscreen', 'mobile layout and style/piece controls'] }, null, 2));
  console.log('Modern chess browser checks passed.');
} finally { await browser.close(); }
