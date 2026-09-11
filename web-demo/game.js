import { createCourtyardMotion } from './courtyard-motion.js';
import { createState, selectedPiece, busy, legalMove, movePiece, selectPiece, action, startDemo, advance, isEnemy, attackTarget } from './game-model.mjs';

const canvas = document.querySelector('canvas'), ctx = canvas.getContext('2d');
const state = createState(), assets = {};
// Calibrated to the painted tile seams in the 1254px courtyard asset.
const artScale = canvas.width / 1254;
const board = {
  x: 200 * artScale, y: 165 * artScale, cell: 107 * artScale,
  columns: [200, 311, 418, 523, 628, 733, 839, 945, 1056].map(n => n * artScale),
  rows: [165, 275, 382, 488, 595, 701, 808, 915, 1030].map(n => n * artScale),
};
const names = { rook: 'The Blue Rook', knight: 'The Crimson Knight', tower: 'The Royal Tower', 'tower-black': 'The Dread Tower' };
let loaded = false, error = null, hover = null, keyboard = { x: 5, y: 2 }, invalid = null, lastUI = '';
let deterministic = false, totalFrames = 0, sceneryTime = 0, scenery = null;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const status = document.querySelector('#status');

function loadImage(url) {
  return new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error(`Could not load ${url}`)); image.src = url; });
}
window.__livingChessReady = (async () => {
  try {
    const [courtyard,cleanPlate,flames,flags] = await Promise.all([
      'assets/courtyard/courtyard.png',
      'assets/courtyard/animation/clean-plate.png',
      'assets/courtyard/animation/flames-sheet-chroma.png',
      'assets/courtyard/animation/flags-sheet.png',
    ].map(loadImage));
    drawCourtyard(courtyard,cleanPlate);
    scenery = createCourtyardMotion(flames,flags,cleanPlate,courtyard);
    await Promise.all(['rook', 'knight', 'tower', 'tower-black'].map(async id => {
      const folder = id === 'rook' ? 'rook-v2' : id;
      const revision = id === 'rook' ? '?v=alpha-restored-1' : '';
      const response = await fetch(`assets/${folder}/${id.startsWith('tower') ? 'tower' : id}-animation.json${revision}`);
      if (!response.ok) throw new Error('Could not load character information.');
      const meta = await response.json(), frames = {};
      await Promise.all(Object.entries(meta.animations).map(async ([name, spec]) => {
        frames[name] = await Promise.all(Array.from({ length: spec.frames }, (_, i) => loadImage(`assets/${folder}/${name}/${name}-${String(i + 1).padStart(2, '0')}.png${revision}`)));
        totalFrames += frames[name].length;
      }));
      assets[id] = { meta, frames };
    }));
    loaded = true;
  } catch (e) { error = e.message; status.textContent = 'The courtyard could not load. Please refresh to try again.'; }
  syncUI(); render();
})();

// Cache the base artwork, then animate only its flags and flames.
const background = document.createElement('canvas');
background.width = canvas.width; background.height = canvas.height;
const b = background.getContext('2d');
function drawCourtyard(image,cleanPlate) {
  b.imageSmoothingEnabled = false;
  b.drawImage(image, 0, 0, background.width, background.height);
  // Replace only the outer flag/fire regions. Original board pixels stay untouched.
  for(const [x,y,w,h] of [[0,175,190,590],[1065,175,189,590]])
    b.drawImage(cleanPlate,x,y,w,h,x*artScale,y*artScale,w*artScale,h*artScale);
  // Coordinates belong to the interactive board, not to the painted scenery.
  b.font = '10px Georgia'; b.textAlign = 'left';
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const [px, py, width, height] = squareRect(x, y);
    b.fillStyle = (x + y) % 2 === 0 ? '#ffdf9cc0' : '#5c392ac0';
    if (x === 0) b.fillText(String(8 - y), px + 6, py + 13);
    if (y === 7) b.fillText('abcdefgh'[x], px + width - 12, py + height - 7);
  }
}
function seam(edges, position) {
  const index = Math.min(7, Math.floor(position));
  return edges[index] + (edges[index + 1] - edges[index]) * (position - index);
}
function squareRect(x, y, inset = 0) {
  const left = seam(board.columns, x), top = seam(board.rows, y);
  return [left + inset, top + inset, seam(board.columns, x + 1) - left - 2 * inset, seam(board.rows, y + 1) - top - 2 * inset];
}
function squareCentre(x,y) {
  const [left, top, width, height] = squareRect(x, y);
  return { x: left + width / 2, y: top + height / 2 };
}
function render() {
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(background,0,0);
  if(scenery)scenery.render(ctx,reducedMotion.matches?0:sceneryTime,artScale);
  if (!loaded) {
    ctx.fillStyle = '#222a32de'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#e4ceb0'; ctx.font = '20px Georgia'; ctx.textAlign = 'center'; ctx.fillText(error ? 'Please refresh to load the courtyard.' : 'The courtyard awaits…',448,448); return;
  }
  const selected = selectedPiece(state);
  if (!busy(state)) {
    for(let y=0;y<8;y++) for(let x=0;x<8;x++) if(legalMove(state,selected,x,y)) {
      const c=squareCentre(x,y); ctx.fillStyle='#6b4319a0';ctx.beginPath();ctx.arc(c.x,c.y,6,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ffdfaeb0';ctx.lineWidth=2;ctx.stroke();
    }
  }
  for (const enemy of state.pieces.filter(p => p.mode !== 'dead' && isEnemy(selected, p))) {
    const active = state.combat?.defenderId === enemy.id;
    if (!active && (busy(state) || selected.mode === 'dead')) continue;
    const pointed = hover?.x === enemy.x && hover?.y === enemy.y;
    ctx.fillStyle = active || pointed ? '#c94b373d' : '#a5332419';
    ctx.fillRect(...squareRect(enemy.x, enemy.y, 2));
    ctx.strokeStyle = active || pointed ? '#ffb49a' : '#ad5140';
    ctx.lineWidth = active || pointed ? 3 : 2;
    ctx.strokeRect(...squareRect(enemy.x, enemy.y, 5));
  }
  if(hover&&!busy(state)) { ctx.fillStyle=legalMove(state,selected,hover.x,hover.y)?'#ffe0a445':'#fff7d912';ctx.fillRect(...squareRect(hover.x,hover.y)); }
  if(invalid) { ctx.strokeStyle='#aa3939';ctx.lineWidth=4;ctx.strokeRect(...squareRect(invalid.x,invalid.y,2)); }
  if(document.activeElement===canvas) { ctx.strokeStyle='#fff1c5';ctx.lineWidth=3;ctx.setLineDash([6,5]);ctx.strokeRect(...squareRect(keyboard.x,keyboard.y,4));ctx.setLineDash([]); }
  for(const p of [...state.pieces].sort((a,b)=>a.position.y-b.position.y)) {
    const c=squareCentre(p.position.x,p.position.y), anchor={x:c.x,y:c.y+board.cell*.32};
    const tile = p.mode === 'move' ? p.position : p;
    if(p.id===state.selected&&p.mode!=='dead') { ctx.fillStyle=['knight','tower-black'].includes(p.id)?'#75372c30':'#28456535';ctx.fillRect(...squareRect(tile.x,tile.y,2));ctx.strokeStyle=['knight','tower-black'].includes(p.id)?'#a36049':'#557c8f';ctx.lineWidth=2;ctx.strokeRect(...squareRect(tile.x,tile.y,3)); }
    ctx.fillStyle='#211c1940';ctx.beginPath();ctx.ellipse(anchor.x,anchor.y-2,p.id==='knight'?37:24,8,0,0,Math.PI*2);ctx.fill();
    const a=assets[p.id], mode=p.mode==='dead'?'death':p.mode, img=a.frames[mode][p.frame];
    const scale=(p.id==='knight'?.64:.52)*board.cell/94;
    ctx.save();ctx.translate(anchor.x,anchor.y);ctx.scale(p.facing,1);
    ctx.drawImage(img,-a.meta.pivot.x*scale,-a.meta.pivot.y*scale,img.width*scale,img.height*scale);ctx.restore();
  }
}

function syncUI() {
  const p=selectedPiece(state), locked=busy(state), key=JSON.stringify([loaded,error,state.selected,state.message,p.mode,locked]);
  if(key===lastUI)return;lastUI=key;
  if(!error)status.textContent=loaded?state.message:'Preparing the pieces…';
  document.querySelectorAll('[data-character]').forEach(el=>{el.disabled=!loaded||locked;el.setAttribute('aria-pressed',String(el.dataset.character===state.selected));});
  document.querySelectorAll('[data-action]').forEach(el=>{el.disabled=!loaded||locked||p.mode==='dead';});
  document.querySelector('#duel').disabled=!loaded||locked;
  document.querySelector('#duel').innerHTML=p.mode==='dead'||state.pieces.some(q=>q.mode==='dead')?'<span>▶</span> Replay the duel':'<span>▶</span> Watch the duel';
  document.querySelector('#reset').disabled=!loaded;
  document.querySelector('#move-hint').textContent=p.id==='knight'?'Moves in an L: two squares over, one across.':'Moves straight along a row or column.';
  document.querySelector('#piece-symbol').textContent=p.id==='knight'?'♞':'♜';
}
function reset(){Object.assign(state,createState());keyboard={x:5,y:2};invalid=null;syncUI();render();}
function chooseSquare(x,y) {
  if(!loaded||busy(state))return;
  const occupied=state.pieces.find(p=>p.x===x&&p.y===y), selected=selectedPiece(state);
  if(occupied?.mode==='dead') { invalid={x,y};state.message='That unit has fallen. Choose another target, or reset the board.'; }
  else if(occupied && selected.mode!=='dead' && isEnemy(selected,occupied)) {
    if(attackTarget(state,occupied.id))invalid=null;
    else invalid={x,y};
  }
  else if(occupied) { selectPiece(state,occupied.id);invalid=null; }
  else if(movePiece(state,selectedPiece(state),x,y)){state.message=`${names[state.selected]} → ${'abcdefgh'[x]}${8-y}`;invalid=null;}
  else {invalid={x,y};state.message=selectedPiece(state).mode==='dead'?'Reset the board to revive the pieces.':'Choose one of the glowing squares.';}
  syncUI();render();
}
function point(event) {
  const r = canvas.getBoundingClientRect();
  const px = (event.clientX - r.left) * canvas.width / r.width;
  const py = (event.clientY - r.top) * canvas.height / r.height;
  const x = board.columns.findIndex((edge, i) => i < 8 && px >= edge && px < board.columns[i + 1]);
  const y = board.rows.findIndex((edge, i) => i < 8 && py >= edge && py < board.rows[i + 1]);
  return x >= 0 && y >= 0 ? { x, y } : null;
}
canvas.addEventListener('pointermove',e=>{hover=point(e);});canvas.addEventListener('pointerleave',()=>{hover=null;});
canvas.addEventListener('click',e=>{const q=point(e);if(q){keyboard=q;chooseSquare(q.x,q.y);}});
canvas.addEventListener('keydown',e=>{const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(delta){e.preventDefault();keyboard.x=Math.max(0,Math.min(7,keyboard.x+delta[0]));keyboard.y=Math.max(0,Math.min(7,keyboard.y+delta[1]));render();}else if(['Enter',' '].includes(e.key)){e.preventDefault();chooseSquare(keyboard.x,keyboard.y);}});
document.querySelectorAll('[data-character]').forEach(el=>el.addEventListener('click',()=>{selectPiece(state,el.dataset.character);invalid=null;syncUI();render();}));
document.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click',()=>{
  const mode=el.dataset.action;
  if(mode==='move') {
    const p=selectedPiece(state), options=[];
    for(let y=0;y<8;y++)for(let x=0;x<8;x++)if(legalMove(state,p,x,y))options.push({x,y});
    options.sort((a,b)=>Math.hypot(a.x-3.5,a.y-3.5)-Math.hypot(b.x-3.5,b.y-3.5));
    if(options.length)chooseSquare(options[0].x,options[0].y);
  } else action(state,mode);
  syncUI();render();
}));
document.querySelector('#reset').addEventListener('click',reset);
document.querySelector('#duel').addEventListener('click',()=>{startDemo(state);invalid=null;syncUI();render();});
async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.arena').requestFullscreen();}catch{toast('Fullscreen is unavailable in this browser.');}}
document.querySelector('#fullscreen').addEventListener('click',fullscreen);document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='f'&&!e.ctrlKey&&!e.metaKey)fullscreen();});
let toastTimer;
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3000);}
document.querySelector('#share').addEventListener('click',async()=>{try{if(navigator.share){await navigator.share({title:'Boneboard — Living Chess',url:location.href});}else{await navigator.clipboard.writeText(location.href);toast('Preview link copied. Send it to a friend.');}}catch(e){if(e.name!=='AbortError')toast('Copy the page address to share this preview.');}});
window.render_game_to_text=()=>JSON.stringify({loaded,error,loadedFrames:totalFrames,scenery:{animated:!!scenery&&!reducedMotion.matches,frames:scenery?.frameCount??0,timeMs:sceneryTime},coordinates:'0-based columns left-to-right, rows top-to-bottom; a8 = (0,0)',selected:state.selected,inputLocked:busy(state),demo:state.demo,combat:state.combat,pieces:state.pieces.map(p=>({id:p.id,square:`${'abcdefgh'[p.x]}${8-p.y}`,x:p.x,y:p.y,position:p.position,target:p.target,mode:p.mode,frame:p.frame,facing:p.facing})),message:state.message,board});
window.advanceTime=ms=>{deterministic=true;if(Number.isFinite(ms)&&ms>=0)sceneryTime+=ms;advance(state,ms);syncUI();render();};
let previous=performance.now();
function loop(now){if(loaded&&!deterministic){const dt=Math.min(now-previous,80);sceneryTime+=dt;advance(state,dt);}previous=now;syncUI();render();requestAnimationFrame(loop);}
requestAnimationFrame(loop);
