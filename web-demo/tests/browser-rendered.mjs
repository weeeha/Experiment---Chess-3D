import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const url=process.env.RENDERED_URL||'http://127.0.0.1:4187/modern/rendered/';
const output=new URL('../test-artifacts/rendered/',import.meta.url);
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true});
try {
  const page=await browser.newPage({viewport:{width:1440,height:960}});
  const errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('request',r=>requests.push(r.url()));
  await page.goto(url);await page.waitForFunction(()=>window.chessReady);
  const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
  assert.equal((await state()).pieces.length,32);
  await page.click("#game-mode"); // Preserve the original free-arrangement acceptance coverage.
  assert.equal((await state()).camera,'fixed top-down');
  assert(!requests.some(r=>/three\.|OrbitControls|RoomEnvironment/.test(r)),'The photographic version must not load a 3D renderer');
  await page.locator('canvas').focus();
  await page.keyboard.press('Enter');await page.keyboard.press('ArrowUp');await page.keyboard.press('ArrowUp');await page.keyboard.press('Enter');
  assert.equal((await state()).pieces.find(p=>p.id==='white-pawn-4').square,'e4');
  for(const style of ['bone','metal','simple','porcelain','fashion','royal','medieval','khokhloma']) {
    await page.click(`[data-style="${style}"]`);
    assert.equal((await state()).style,style);
    assert.equal((await state()).pieces.find(p=>p.id==='white-pawn-4').square,'e4');
    await page.screenshot({path:fileURLToPath(new URL(`${style}-board.png`,output))});
    await page.click('#toggle-pieces');assert.equal((await state()).showPieces,false);
    await page.screenshot({path:fileURLToPath(new URL(`${style}-board-only.png`,output))});
    await page.click('#toggle-pieces');assert.equal((await state()).showPieces,true);
    await page.click('[data-view="pieces"]');
    await page.click('[data-side="white"]');
    await page.screenshot({path:fileURLToPath(new URL(`${style}-collection.png`,output))});
    for(const side of ['white','black']) {
      await page.click(`[data-side="${side}"]`);
      for(const type of ['pawn','rook','knight','bishop','queen','king']) {
        await page.click(`[data-piece="${type}"]`);
        assert.equal((await state()).inspected,type);assert.equal((await state()).side,side);
      }
      await page.screenshot({path:fileURLToPath(new URL(`${style}-${side}-king.png`,output))});
    }
    await page.click('[data-view="board"]');
  }
  await page.click('#reset-board');
  assert.equal((await state()).pieces.find(p=>p.id==='white-pawn-4').square,'e2');
  const geometry=(await state()).board,box=await page.locator('canvas').boundingBox();
  const point=(file,row)=>({x:box.x+geometry.x+(file+.5)*geometry.tile,y:box.y+geometry.y+(7.5-row)*geometry.tile});
  let p=point(4,1);await page.mouse.click(p.x,p.y);p=point(4,3);await page.mouse.click(p.x,p.y);
  assert.equal((await state()).pieces.find(p=>p.id==='white-pawn-4').square,'e4');
  p=point(3,1);await page.mouse.click(p.x,p.y);p=point(2,1);await page.mouse.click(p.x,p.y);
  assert.equal((await state()).pieces.length,32,'An occupied square selects without deleting another piece');
  await page.click('#fullscreen');await page.waitForFunction(()=>!!document.fullscreenElement);await page.evaluate(()=>document.exitFullscreen());
  await page.setViewportSize({width:1280,height:800});await page.click('[data-style="bone"]');await page.click('#reset-board');
  await page.screenshot({path:fileURLToPath(new URL('desktop-1280.png',output))});
  const bounds=await page.locator('.workspace').boundingBox();assert(bounds.y+bounds.height<=800);
  await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:fileURLToPath(new URL('mobile-board.png',output)),fullPage:true});
  await page.click('[data-view="pieces"]');await page.click('[data-side="white"]');
  await page.screenshot({path:fileURLToPath(new URL('mobile-collection.png',output)),fullPage:true});
  await page.click('[data-piece="knight"]');
  await page.screenshot({path:fileURLToPath(new URL('mobile-knight.png',output)),fullPage:true});
  assert.deepEqual(errors,[]);
  assert.equal(new Set(requests.filter(r=>/assets\/.*-board\.png$/.test(r))).size,8,'Each set loads its matching board materials');
  assert.equal(new Set(requests.filter(r=>/assets\/(bone|metal|simple|porcelain|fashion|royal|medieval|khokhloma)\.png$/.test(r))).size,8);
  await writeFile(new URL('validation.json',output),JSON.stringify({passed:true,errors,checks:['photographic assets with no Three.js','32-piece orientation','keyboard and pointer arrangement','style switching retains arrangement','all 96 style-color-type combinations','reset','fullscreen','desktop fit','mobile board collection and individual figure']},null,2));
  console.log('Rendered collection browser checks passed.');
}finally{await browser.close();}
