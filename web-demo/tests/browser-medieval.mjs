import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const url=process.env.PLAY_URL||'http://127.0.0.1:4187/play/?style=medieval';
const output=new URL('../test-artifacts/medieval/',import.meta.url);
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true});
try {
  const page=await browser.newPage({viewport:{width:1440,height:960}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(url);
  await page.waitForFunction(()=>document.querySelector('#loading').hidden);
  assert.equal(await page.locator('[data-style]').count(),8);
  assert.equal(await page.locator('#style-count').textContent(),'08');
  assert.equal(await page.locator('[data-style="medieval"]').getAttribute('aria-pressed'),'true');
  await page.waitForFunction(()=>document.querySelector('#thumb-medieval').naturalWidth>0);
  const spriteReport=await page.evaluate(async()=>{
    const {loadStyle}=await import('./assets.js');
    const {pieces}=await loadStyle('medieval');
    const report=[];
    for(const [name,src] of Object.entries(pieces)){
      const im=new Image();im.src=src;await im.decode();
      const c=document.createElement('canvas');c.width=im.width;c.height=im.height;
      const g=c.getContext('2d');g.drawImage(im,0,0);
      const pixels=g.getImageData(0,0,c.width,c.height).data;
      let clear=0,visible=0,green=0;
      for(let i=0;i<pixels.length;i+=4){
        if(pixels[i+3]===0)clear++;
        if(pixels[i+3]>35){visible++;if(pixels[i+1]>Math.max(pixels[i],pixels[i+2])+25)green++;}
      }
      report.push({name,clear,visible,green,width:im.width,height:im.height});
    }
    return report;
  });
  assert.equal(spriteReport.length,12);
  for(const sprite of spriteReport){
    assert(sprite.visible>5000,sprite.name+' should contain a complete miniature');
    assert(sprite.clear>2000,sprite.name+' should have transparent space around the silhouette');
    assert.equal(sprite.green,0,sprite.name+' should have no visible green-screen background or spill');
  }
  await page.selectOption('#time-control','0');
  await page.click('#new-game');
  assert.equal(await page.locator('#board img').count(),32);
  assert.match(await page.locator('#player-bottom').innerText(),/Azure pieces · White/);
  assert.match(await page.locator('#player-top').innerText(),/Crimson pieces · Black/);
  await page.click('[data-square="e2"]');
  assert(await page.locator('[data-square="e4"]').evaluate(el=>el.classList.contains('legal')));
  await page.click('[data-square="e4"]');
  const position=()=>page.locator('#board .occupied').evaluateAll(nodes=>nodes.map(el=>el.getAttribute('aria-label')).sort());
  const moved=await position();
  assert(moved.includes('e4, white pawn'));
  for(const style of ['royal','khokhloma','medieval']){
    await page.click('[data-style="'+style+'"]');
    await page.waitForFunction(s=>document.querySelector('[data-style="'+s+'"]').getAttribute('aria-pressed')==='true',style);
    assert.deepEqual(await position(),moved,'Style changes should preserve the game');
  }
  await page.screenshot({path:fileURLToPath(new URL('play-desktop.png',output)),fullPage:true});
  await page.click('#undo');
  assert.equal(await page.locator('[data-square="e2"]').getAttribute('aria-label'),'e2, white pawn');
  await page.click('#flip');
  assert.equal(await page.locator('#board > button').first().getAttribute('data-square'),'h1');
  await page.click('#flip');
  await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile content must fit');
  await page.screenshot({path:fileURLToPath(new URL('play-mobile.png',output)),fullPage:true});
  const cards=await page.locator('[data-style="medieval"],[data-style="khokhloma"]').evaluateAll(els=>els.map(el=>({width:el.getBoundingClientRect().width,y:el.getBoundingClientRect().y})));
  assert(Math.abs(cards[0].width-cards[1].width)<1,'The final two mobile cards should have equal widths');
  assert(Math.abs(cards[0].y-cards[1].y)<1,'The final two mobile cards should share a row');
  assert.deepEqual(errors,[]);
  await writeFile(new URL('play-validation.json',output),JSON.stringify({passed:true,spriteReport,errors,checks:['eight set picker entries','medieval deep link','twelve transparent sprites with no green spill','32-piece fresh game','Azure/Crimson side mapping','legal moves','style changes preserve game','undo','flip','mobile layout']},null,2));
  console.log('Heraldic Europe play acceptance passed.');
} finally {await browser.close();}
