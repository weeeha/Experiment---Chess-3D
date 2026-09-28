import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const browser = await chromium.launch({ headless: true });
const out = new URL('../test-artifacts/silly/', import.meta.url);
await mkdir(out, { recursive: true });
try {
  for (const route of ['modern/', 'modern/rendered/']) {
    const name = route.includes('rendered') ? 'rendered' : 'modern';
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.clock.install({ time: new Date('2026-09-10T12:00:00Z') });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(`http://127.0.0.1:4187/${route}`);
    await page.waitForFunction(() => window.chessReady);
    // Advance timers deliberately so slow 3D renders cannot race the next click.
    await page.clock.pauseAt(new Date('2026-09-10T13:00:00Z'));
    const state = () => page.evaluate(() => JSON.parse(window.render_game_to_text()));
    assert.equal((await state()).game?.mode, 'silly-ai', 'The board should open with its playful opponent');
    const choose = async square => {
      const current = (await state()).keyboard;
      const file = 'abcdefgh'.indexOf(square[0]), row = Number(square[1]) - 1;
      await page.locator('#chess-canvas').focus();
      for (let i = 0; i < Math.abs(file - current.file); i++) await page.keyboard.press(file > current.file ? 'ArrowRight' : 'ArrowLeft');
      for (let i = 0; i < Math.abs(row - current.row); i++) await page.keyboard.press(row > current.row ? 'ArrowUp' : 'ArrowDown');
      await page.keyboard.press('Enter');
    };
    await choose('e7'); assert.equal((await state()).selected, null, 'Cannot play the opponent’s pieces');
    await choose('e2');
    assert.deepEqual((await state()).legalMoves.sort(), ['e3', 'e4']);
    await page.screenshot({ path: fileURLToPath(new URL(`${name}-selected.png`, out)) });
    await choose('e5'); assert.equal((await state()).game.moveCount, 0, 'Illegal moves do not change the board');
    await choose('e4');
    assert.equal((await state()).game.thinking, true);
    await page.click('[data-view="pieces"]');
    await page.evaluate(() => window.advanceTime(5000));
    assert.equal((await state()).game.moveCount, 1, 'The opponent waits during piece inspection');
    await page.click('[data-style="metal"]');
    await page.click('[data-view="board"]');
    await page.clock.runFor(1200);
    assert.equal((await state()).game.moveCount, 2, 'The scheduled browser timer delivers a reply');
    assert.equal((await state()).game.turn, 'white');
    assert.equal((await state()).pieces.find(p => p.id === 'white-pawn-4').square, 'e4');
    assert.equal((await state()).game.lastMove.side, 'black');
    assert.equal((await state()).style, 'metal');
    await page.screenshot({ path: fileURLToPath(new URL(`${name}-reply.png`, out)) });
    await page.click('#reset-board');
    await choose('e2'); await choose('e4');
    if (name === 'rendered') {
      await page.click('#toggle-pieces');
      await page.evaluate(() => window.advanceTime(5000));
      assert.equal((await state()).game.moveCount, 1);
      await page.click('#toggle-pieces');
    }
    await page.click('#reset-board');
    await page.clock.runFor(1400);
    assert.equal((await state()).game.moveCount, 0, 'A stale reply must not move the reset board');
    await choose('e2'); await choose('e4');
    await page.click('#game-mode');
    await page.evaluate(() => window.advanceTime(5000));
    assert.equal((await state()).game.mode, 'arrange');
    assert.equal((await state()).game.moveCount, 1);
    await choose('a7'); await choose('a5');
    assert.equal((await state()).pieces.find(p => p.id === 'black-pawn-0').square, 'a5');
    await page.click('#game-mode');
    assert.equal((await state()).game.mode, 'silly-ai');
    assert.equal((await state()).pieces.find(p => p.id === 'black-pawn-0').square, 'a7');
    assert.equal((await state()).style, 'metal');
    assert.equal((await state()).game.moveCount, 0);
    const bounds = await page.locator('.workspace').boundingBox();
    assert(bounds.y + bounds.height <= 800, 'The style showcase still fits on desktop');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.click('#reset-board');
    if (name === 'modern') await page.click('#top-view');
    await page.locator('#chess-canvas').scrollIntoViewIfNeeded();
    const box = await page.locator('#chess-canvas').boundingBox(), board = (await state()).board;
    const tile = name === 'rendered' ? board.tile : Math.min(box.width / 14.5, box.height / (14.5 * .74));
    const point = row => name === 'rendered' ? { x: box.x + board.x + 4.5 * tile, y: box.y + board.y + (7.5 - row) * tile } : { x: box.x + box.width / 2 + .5 * tile, y: box.y + box.height / 2 + (3.5 - row) * tile };
    for (const row of [1, 3]) { const p = point(row); await page.mouse.click(p.x, p.y); }
    assert.equal((await state()).pieces.find(p => p.id === 'white-pawn-4').square, 'e4', 'Pointer input plays the same legal move on mobile');
    await page.evaluate(() => window.advanceTime(2000));
    assert.equal((await state()).game.moveCount, 2);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: fileURLToPath(new URL(`${name}-mobile.png`, out)), fullPage: true });
    assert.deepEqual(errors, []);
    await page.close();
    console.log(`${name}: AI turns, legal hints, inspection pause, reset cancellation, free arrangement and mobile passed.`);
  }
} finally { await browser.close(); }
