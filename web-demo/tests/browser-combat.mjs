import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const dir=new URL('../test-artifacts/combat/',import.meta.url);await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage({viewport:{width:1360,height:1080}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('http://127.0.0.1:4187');await page.evaluate(()=>window.__livingChessReady);await page.evaluate(()=>window.advanceTime(0));
 const snapshot=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
 const tick=ms=>page.evaluate(ms=>window.advanceTime(ms),ms);
 const clickSquare=async(x,y)=>{const r=await page.locator('canvas').boundingBox(),{board}=await snapshot();await page.mouse.click(r.x+(board.columns[x]+board.columns[x+1])/2/896*r.width,r.y+(board.rows[y]+board.rows[y+1])/2/896*r.height);};
 const capture=async name=>page.locator('canvas').screenshot({path:fileURLToPath(new URL(`${name}.png`,dir))});
 await clickSquare(6,1);assert.equal((await snapshot()).selected,'tower-black');assert.equal((await snapshot()).combat,null);
 await page.click('#reset');await clickSquare(3,4);
 assert.equal((await snapshot()).selected,'knight');assert.equal((await snapshot()).combat.defenderId,'rook');
 await tick(500);assert.equal((await snapshot()).pieces[1].mode,'move');await capture('approach');
 await clickSquare(1,6);assert.equal((await snapshot()).combat.defenderId,'rook');
 await tick(800);assert.equal((await snapshot()).pieces[1].mode,'strike');await capture('knight-strike');
 await tick(2000);assert.equal((await snapshot()).pieces[0].mode,'dead');assert.equal((await snapshot()).combat,null);
 await capture('defeated');
 await clickSquare(3,4);assert.equal((await snapshot()).selected,'knight');assert.equal((await snapshot()).combat,null);
 for(const [name,x,y,waypoint] of [['right',4,4,[4,1]],['left',2,4,[2,1]],['up',3,3,[3,1]],['down',3,5,[6,5]]]) {
  await page.click('#reset');await page.click('[data-character="tower-black"]');
  await clickSquare(...waypoint);await tick(2500);await clickSquare(x,y);await tick(2500);
  assert.deepEqual([(await snapshot()).pieces[3].x,(await snapshot()).pieces[3].y],[x,y]);
  await page.click('[data-character="rook"]');await clickSquare(x,y);
  assert.equal((await snapshot()).pieces[0].mode,'strike');
  await tick(400);const s=await snapshot(),p=s.pieces[0];
  assert(Math.abs(p.position.x-(3+(x-3)*.55))<.01);assert(Math.abs(p.position.y-(4+(y-4)*.55))<.01);
  assert.equal(s.pieces[3].mode,'death');await capture(`lunge-${name}`);
  await tick(2000);assert.deepEqual((await snapshot()).pieces[0].position,{x:3,y:4});assert.equal((await snapshot()).combat,null);
 }
 await page.click('#reset');await clickSquare(3,4);await tick(300);await page.click('#reset');await tick(5000);
 assert.equal((await snapshot()).combat,null);assert((await snapshot()).pieces.every(p=>p.mode==='idle'));
 await page.locator('canvas').focus();await page.keyboard.press('ArrowLeft');await page.keyboard.press('ArrowLeft');await page.keyboard.press('ArrowDown');await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');
 assert.equal((await snapshot()).combat.defenderId,'rook');await tick(5000);assert.equal((await snapshot()).pieces[0].mode,'dead');
 await page.click('#reset');await page.setViewportSize({width:390,height:844});
 await page.click('[data-character="tower"]');await clickSquare(6,1);
 assert.equal((await snapshot()).selected,'tower');await tick(15000);assert.equal((await snapshot()).pieces[3].mode,'dead');
 assert.equal((await snapshot()).combat,null);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:fileURLToPath(new URL('mobile.png',dir)),fullPage:true});
 await page.click('#reset');await page.click('#duel');await tick(5000);assert.equal((await snapshot()).demo,null);assert.equal((await snapshot()).pieces[0].mode,'dead');
 assert.deepEqual(errors,[]);
 await writeFile(new URL('validation.json',dir),JSON.stringify({passed:true,checks:['friendly selection','enemy click preserves selection','approach then attack','input lock','defeated target rejection','right/left/up/down visible lunge and recovery','reset cancels approach','keyboard enemy command','mobile tower approach and attack','duel uses same combat sequence'],errors},null,2));
 console.log('Combat browser checks passed: enemy click, route, four lunge directions, defeat, reset, keyboard, mobile, duel; no browser errors.');
} finally {await browser.close();}
