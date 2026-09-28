import { SillyGame, squareName } from '../silly-game.js';
import { mountSillyUI } from '../silly-ui.js';

const $ = s => document.querySelector(s);
const types = ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king'];
const title = s => s[0].toUpperCase() + s.slice(1);
const themes = {
  bone: { name: 'Bone & Gold', subtitle: 'Warmth, with an edge.', note: 'Satin ivory. Champagne gold. A little everyday grandeur.', floor: '#e8e4da', tiles: ['#ebe1cc', '#41463d'], frame: '#a68a57', inner: '#272d26', accent: '#bb9653' },
  metal: { name: 'Metal', subtitle: 'Precision, in every detail.', note: 'Brushed silver. Dark gunmetal. Quietly industrial.', floor: '#e1e4e4', tiles: ['#b9c2c5', '#515e67'], frame: '#727f86', inner: '#303b43', accent: '#bed1dc' },
  simple: { name: 'Modern Simple', subtitle: 'Only the essentials.', note: 'Chalk porcelain. Soft charcoal. Form without the fuss.', floor: '#e9e7df', tiles: ['#d9d5c9', '#7b8472'], frame: '#b4b7a8', inner: '#b4b7a8', accent: '#e9e4ce' },
  porcelain: { name: 'Blue Porcelain', subtitle: 'A tradition, freshly painted.', note: 'Cobalt florals. Glazed porcelain. A hand-painted world.', floor: '#e6e8e4', tiles: ['#f2f1e6','#a6bdd1'], frame: '#eeede4', inner: '#536d89', accent: '#4474a4' },
  fashion: { name: 'Fashion House', subtitle: 'Tailored for the table.', note: 'Sculpted lapels. Oxblood leather. Every detail tailored.', floor: '#e4dfda', tiles: ['#c9c1b6','#723b43'], frame: '#302b2c', inner: '#9a725b', accent: '#d7ac77' },
  royal: { name: 'Royal Court', subtitle: 'An entire world, in miniature.', note: 'Intricate carving. Ceremonial figures. An engraved board.', floor: '#e8e2d6', tiles: ['#e4d6b8','#3a3029'], frame: '#d5c29e', inner: '#6e5c3f', accent: '#c1a16b' },
  medieval: { name: 'Heraldic Europe', subtitle: 'Two courts. A colorful rivalry.', note: 'Painted knights. Heraldic robes. Limestone, slate, and walnut.', floor: '#e8e2d6', tiles: ['#e1ceb0','#646566'], frame: '#654024', inner: '#b28b48', accent: '#b69352', sideLabels: ['Azure','Crimson'], sideColors: ['#1856ad','#b42535'], greenScreen: true, atlasColumns: [0,240,488,778,1018,1274,1536] },
  khokhloma: { name: 'Khokhloma', subtitle: 'A flourish, on every square.', note: 'Red lacquer. Black lacquer. Hand-painted gold florals.', floor: '#e7e0d6', tiles: ['#c43724','#22221e'], frame: '#a72218', inner: '#bd9048', accent: '#f0c96c', sideLabels: ['Red','Black'], sideColors: ['#cc3826','#24221f'] }
};
const canvas = $('#chess-canvas'), ctx = canvas.getContext('2d');
const state = { style: 'bone', view: 'board', side: 'white', inspected: null, selected: null, showPieces: true, keyboard: { file: 4, row: 1 }, keyboardActive: false };
const requestedStyle=new URLSearchParams(location.search).get('style');
if(Object.hasOwn(themes,requestedStyle))state.style=requestedStyle;
const sprites = {}, textures = {}, hits = [];
const game = new SillyGame();
let pieces = game.pieces, width = 0, height = 0, board = null;
const opponent = mountSillyUI({ game, state, onChange: () => { pieces = game.pieces; update(); }, sideLabels: () => themes[state.style].sideLabels || ['Light', 'Dark'] });
function initialPosition() {
  opponent.reset(); pieces = game.pieces;
  state.selected = null;
}
function roundRect(x,y,w,h,r,fill) { ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill(); }
function drawPiece(type, side, centerX, baseline, scale, shadow = true, style = state.style) {
  const s = sprites[`${style}-${side}-${type}`];
  if (!s) return;
  const dw=s.w*scale, dh=s.h*scale;
  if (shadow) {
    ctx.save();ctx.globalAlpha=.13;ctx.fillStyle='#17201a';ctx.beginPath();ctx.ellipse(centerX+dw*.02,baseline-2,dw*.39,Math.max(2,dw*.10),0,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  ctx.drawImage(s.image,s.x,s.y,s.w,s.h,centerX-dw/2,baseline-dh,dw,dh);
}
function drawBoard() {
  const theme=themes[state.style];
  const reserved=width<520?200:176;
  const size=Math.min(width-76,height-reserved,650), tile=size/8, x=(width-size)/2, y=78+(height-reserved-size)/2;
  board={x,y,size,tile};
  ctx.save();ctx.shadowColor='#26301a30';ctx.shadowBlur=22;ctx.shadowOffsetY=13;
  roundRect(x-18,y-18,size+36,size+36,4,theme.frame);ctx.restore();
  if(textures[state.style]){
    ctx.save();ctx.beginPath();ctx.roundRect(x-18,y-18,size+36,size+36,4);ctx.clip();
    ctx.drawImage(textures[state.style],1026,2,508,508,x-18,y-18,size+36,size+36);ctx.restore();
  }
  roundRect(x-3,y-3,size+6,size+6,1,theme.inner);
  const chosen=pieces.find(p=>p.id===state.selected), destinations=game.destinations(chosen);
  for(let row=0;row<8;row++) for(let file=0;file<8;file++) {
    const tx=x+file*tile,ty=y+(7-row)*tile;
    ctx.fillStyle=theme.tiles[(row+file)%2===0?1:0];ctx.fillRect(tx,ty,tile+.3,tile+.3);
    if(textures[state.style]){
      const column=(row+file)%2===0?1:0,variant=(Math.floor(row/2)+Math.floor(file/2))%2;
      ctx.drawImage(textures[state.style],column*512+2,variant*512+2,508,508,tx,ty,tile+.3,tile+.3);
    }
    const sheen=ctx.createLinearGradient(tx,ty,tx+tile,ty+tile);
    sheen.addColorStop(0,'#ffffff08');sheen.addColorStop(1,'#00000009');ctx.fillStyle=sheen;ctx.fillRect(tx,ty,tile+.3,tile+.3);
    const square=squareName({file,row});
    if(state.showPieces&&game.enabled&&game.lastMove&&[game.lastMove.from,game.lastMove.to].includes(square)){
      ctx.save();ctx.fillStyle=theme.accent;ctx.globalAlpha=.25;ctx.fillRect(tx,ty,tile,tile);ctx.restore();
    }
    if(destinations.includes(square)){
      const occupied=pieces.some(p=>p.file===file&&p.row===row);
      ctx.save();ctx.strokeStyle='#ffffffdd';ctx.fillStyle='#fff';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(tx+tile/2,ty+tile/2,tile*(occupied?.40:.105),0,Math.PI*2);ctx.stroke();
      if(!occupied){ctx.globalAlpha=.75;ctx.fill();}ctx.restore();
    }
    if(chosen&&chosen.file===file&&chosen.row===row){ctx.strokeStyle=theme.accent;ctx.lineWidth=3;ctx.strokeRect(tx+2,ty+2,tile-4,tile-4);}
    if(state.keyboardActive&&state.keyboard.file===file&&state.keyboard.row===row){ctx.save();ctx.strokeStyle='#fff';ctx.lineWidth=1.4;ctx.setLineDash([3,3]);ctx.strokeRect(tx+5,ty+5,tile-10,tile-10);ctx.restore();}
  }
  ctx.fillStyle='#767e6d';ctx.font='9px ui-sans-serif, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  for(let i=0;i<8;i++){ctx.fillText(String.fromCharCode(97+i),x+(i+.5)*tile,y+size+26);ctx.fillText(String(i+1),x-27,y+(7.5-i)*tile);}
  // Draw rear ranks first, so photographic silhouettes overlap naturally.
  const heights={pawn:.62,rook:.76,knight:.81,bishop:.86,queen:.92,king:.96};
  for(const p of (state.showPieces?[...pieces]:[]).sort((a,b)=>b.row-a.row)) {
    const sprite=sprites[`${state.style}-${p.side}-${p.type}`];
    const targetHeight=state.style==='royal'&&p.type==='rook'?1.12:heights[p.type];
    const scale=Math.min(tile*targetHeight/sprite.h,tile*.67/sprite.w);
    // Center the visible figure with a small upward optical adjustment.
    const baseline=y+(7.5-p.row)*tile+sprite.h*scale/2-Math.min(4,tile*.06);
    drawPiece(p.type,p.side,x+(p.file+.5)*tile,baseline,scale);
  }
}
function drawCollection() {
  board=null;const single=state.view==='piece';
  const entries=single?[state.inspected]:types;
  const cols=single?1:(width<520?3:6), rows=Math.ceil(entries.length/cols);
  const availableW=width-40, availableH=height-190, cellW=availableW/cols, cellH=availableH/rows;
  const king=sprites[`${state.style}-${state.side}-king`];
  const scale=Math.min((cellH-34)*.88/king.h,cellW*(single?.52:.74)/king.w);
  entries.forEach((type,i)=>{
    const cx=20+(i%cols+.5)*cellW, baseline=82+(Math.floor(i/cols)+1)*cellH-33;
    drawPiece(type,state.side,cx,baseline,scale);
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#717969';ctx.font='10px ui-sans-serif, sans-serif';
    ctx.fillText(title(type),cx,baseline+24);
    hits.push({type,x:cx-cellW/2,y:82+Math.floor(i/cols)*cellH,w:cellW,h:cellH});
  });
}
function render() {
  const theme=themes[state.style];ctx.clearRect(0,0,width,height);ctx.fillStyle=theme.floor;ctx.fillRect(0,0,width,height);hits.length=0;
  if(!sprites[`${state.style}-white-king`])return;
  state.view==='board'?drawBoard():drawCollection();
}
function resize() {
  const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);width=rect.width;height=rect.height;
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);render();
}
function thumb(type,side,style) {
  const s=sprites[`${style}-${side}-${type}`], c=document.createElement('canvas');c.width=128;c.height=150;
  const g=c.getContext('2d'),scale=Math.min(108/s.w,132/s.h);
  g.drawImage(s.image,s.x,s.y,s.w,s.h,(128-s.w*scale)/2,140-s.h*scale,s.w*scale,s.h*scale);return c.toDataURL();
}
function update() {
  const theme=themes[state.style];
  $('#scene-number').textContent=`0${Object.keys(themes).indexOf(state.style)+1} / 0${Object.keys(themes).length}`;
  $('#scene-title').textContent=state.view==='piece'?`${theme.name} / ${title(state.inspected)}`:theme.name;
  $('#scene-subtitle').textContent=state.view==='board'?theme.subtitle:theme.sideLabels?`The ${theme.sideLabels[state.side==='white'?0:1].toLowerCase()} collection.`:state.side==='white'?'The light collection.':'The dark collection.';
  $('#material-note').textContent=theme.note;
  $('#side-toggle').hidden=state.view==='board';
  $('#toggle-pieces').hidden=state.view!=='board';
  $('#toggle-pieces').setAttribute('aria-pressed',String(!state.showPieces));
  $('#interaction-hint').textContent=state.view==='board'?(!state.showPieces?'A closer look at the matching board.':state.selected?`${title(pieces.find(p=>p.id===state.selected).type)} selected · choose an empty square.`:'Select a piece, then an empty square.'):state.view==='pieces'?'Select a figure to take a closer look.':'Choose another figure or view the full set.';
  $('.fixed-view').textContent=state.view==='board'?'TOP-DOWN VIEW':'THE COLLECTION';
  document.querySelectorAll('[data-style]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.style===state.style)));
  document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===(state.view==='board'?'board':'pieces'))));
  document.querySelectorAll('[data-side]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.side===state.side));const isLight=b.dataset.side==='white';b.innerHTML=`<i class="side-dot ${isLight?'light':'dark'}"${theme.sideColors?` style="background:${theme.sideColors[isLight?0:1]}"`:''}></i>${(theme.sideLabels||['Light','Dark'])[isLight?0:1]}`;});
  document.querySelectorAll('[data-piece]').forEach(b=>{b.setAttribute('aria-pressed',String(state.view==='piece'&&b.dataset.piece===state.inspected));b.querySelector('img').src=thumb(b.dataset.piece,state.side,state.style);});
  canvas.setAttribute('aria-label',state.view==='board'?`Top-down chessboard. You play ${(theme.sideLabels||['Light','Dark'])[0].toLowerCase()} against Silly AI. Select a piece and a marked square. Arrow keys choose squares; Enter selects or moves; Escape clears selection. Use Arrange freely to move either side.`:'Chess collection. Use the piece and color buttons to inspect each figure.');
  opponent.sync();
  render();
}
function setView(view,piece=null){state.view=view;state.inspected=piece;state.selected=null;state.keyboardActive=false;update();}
function chooseSquare(file,row){
  state.keyboard={file,row};
  const occupant=pieces.find(p=>p.file===file&&p.row===row);
  if(game.enabled){
    if(game.thinking||game.paused||game.result)return;
    const selected=pieces.find(p=>p.id===state.selected);
    if(selected&&game.move(squareName(selected),squareName({file,row}))){pieces=game.pieces;state.selected=null;}
    else if(occupant?.side==='white')state.selected=state.selected===occupant.id?null:occupant.id;
    update();return;
  }
  if(occupant)state.selected=state.selected===occupant.id?null:occupant.id;
  else if(state.selected){Object.assign(pieces.find(p=>p.id===state.selected),{file,row});state.selected=null;}
  update();
}
canvas.addEventListener('click',event=>{
  const rect=canvas.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;state.keyboardActive=false;
  if(state.view==='board'&&board&&state.showPieces){const file=Math.floor((x-board.x)/board.tile),row=7-Math.floor((y-board.y)/board.tile);if(file>=0&&file<8&&row>=0&&row<8)chooseSquare(file,row);}
  else if(state.view==='pieces'){const hit=hits.find(h=>x>=h.x&&x<=h.x+h.w&&y>=h.y&&y<=h.y+h.h);if(hit)setView('piece',hit.type);}
});
canvas.addEventListener('keydown',e=>{
  if(state.view!=='board'||!state.showPieces)return;
  const deltas={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,1],ArrowDown:[0,-1]};
  if(deltas[e.key]){e.preventDefault();const [dx,dy]=deltas[e.key];state.keyboard.file=Math.max(0,Math.min(7,state.keyboard.file+dx));state.keyboard.row=Math.max(0,Math.min(7,state.keyboard.row+dy));state.keyboardActive=true;render();}
  if(e.key==='Enter'||e.key===' '){e.preventDefault();state.keyboardActive=true;chooseSquare(state.keyboard.file,state.keyboard.row);}
  if(e.key==='Escape'){state.selected=null;state.keyboardActive=false;update();}
});
async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await $('.viewer').requestFullscreen();}catch{$('#interaction-hint').textContent='Fullscreen is unavailable in this browser.';}}
$('#fullscreen').addEventListener('click',fullscreen);
document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='f'&&!e.ctrlKey&&!e.metaKey&&!e.altKey)fullscreen();});
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
document.querySelectorAll('[data-style]').forEach(b=>b.addEventListener('click',()=>{if(!window.chessReady)return;state.style=b.dataset.style;update();}));
document.querySelectorAll('[data-side]').forEach(b=>b.addEventListener('click',()=>{state.side=b.dataset.side;update();}));
$('#all-pieces').addEventListener('click',()=>setView('pieces'));
$('#reset-board').addEventListener('click',()=>{initialPosition();state.showPieces=true;state.keyboard={file:4,row:1};setView('board');});
$('#toggle-pieces').addEventListener('click',()=>{state.showPieces=!state.showPieces;state.selected=null;state.keyboardActive=false;update();});
new ResizeObserver(resize).observe($('#stage'));
window.advanceTime=ms=>opponent.advance(ms);
window.render_game_to_text=()=>JSON.stringify({...state,game:game.snapshot(),legalMoves:game.destinations(pieces.find(p=>p.id===state.selected)),coordinates:'a1 is bottom-left. Files a-h run left to right, ranks 1-8 bottom to top.',renderer:'2d photographic sprites',camera:'fixed top-down',board,pieces:pieces.map(p=>({...p,square:squareName(p)}))});

async function loadAtlas(style){
  let image=new Image();image.src=`assets/${style}.png`;await image.decode();
  const scratch=document.createElement('canvas');scratch.width=image.width;scratch.height=image.height;
  const g=scratch.getContext('2d',{willReadFrequently:true});g.drawImage(image,0,0);
  const imageData=g.getImageData(0,0,image.width,image.height),pixels=imageData.data;
  if(themes[style].greenScreen){removeGreenScreen(pixels);g.putImageData(imageData,0,0);image=scratch;}
  const cw=image.width/6,ch=image.height/2;
  // Locate the clear gap between rows; atlas baselines may drift beyond halfway.
  let split=Math.floor(ch),least=Infinity;
  for(let y=Math.floor(ch*.94);y<Math.ceil(ch*1.07);y++){
    let count=0;for(let x=0;x<image.width;x++)if(pixels[(y*image.width+x)*4+3]>35)count++;
    if(count<least||(count===least&&Math.abs(y-ch)<Math.abs(split-ch))){least=count;split=y;}
  }
  for(const [row,side] of ['white','black'].entries())for(const [column,type] of types.entries()){
    // A generated atlas can spill a few pixels from the preceding row into a cell.
    // Frame the largest connected silhouette, excluding detached neighboring edges.
    const edges=themes[style].atlasColumns;
    const startX=edges?edges[column]:Math.floor(column*cw),startY=row===0?0:split,w=edges?edges[column+1]-startX:Math.floor(cw),h=row===0?split:image.height-split;
    const seen=new Uint8Array(w*h),queue=new Int32Array(w*h);
    let largest=null;
    const opaque=i=>pixels[((startY+Math.floor(i/w))*image.width+startX+i%w)*4+3]>35;
    for(let i=0;i<w*h;i++){
      if(seen[i]||!opaque(i))continue;
      let head=0,tail=1,count=0,left=w,right=0,top=h,bottom=0;queue[0]=i;seen[i]=1;
      while(head<tail){
        const current=queue[head++],px=current%w,py=Math.floor(current/w);count++;
        left=Math.min(left,px);right=Math.max(right,px);top=Math.min(top,py);bottom=Math.max(bottom,py);
        const neighbors=[px>0?current-1:-1,px<w-1?current+1:-1,py>0?current-w:-1,py<h-1?current+w:-1];
        for(const n of neighbors)if(n>=0&&!seen[n]&&opaque(n)){seen[n]=1;queue[tail++]=n;}
      }
      if(!largest||count>largest.count)largest={count,left,right,top,bottom};
    }
    if(!largest)throw Error(`Missing ${style} ${side} ${type}`);
    sprites[`${style}-${side}-${type}`]={image,x:startX+largest.left,y:startY+largest.top,w:largest.right-largest.left+1,h:largest.bottom-largest.top+1};
  }
}
async function init(){
  try{
    await Promise.all(Object.keys(themes).flatMap(style=>[loadAtlas(style),(async()=>{const image=new Image();image.src=`assets/${style}-board.png`;await image.decode();textures[style]=image;})()]));
    for(const style of Object.keys(themes))$(`#thumb-${style}`).src=thumb('king','white',style);
    $('#piece-options').innerHTML=types.map(type=>`<button class="piece-option" data-piece="${type}" aria-label="Inspect ${type}" aria-pressed="false"><img alt="${title(type)}"><span>${title(type)}</span></button>`).join('');
    document.querySelectorAll('[data-piece]').forEach(b=>b.addEventListener('click',()=>setView('piece',b.dataset.piece)));
    initialPosition();window.chessReady=true;$('#loading').hidden=true;resize();update();
  }catch(error){$('#loading').textContent='The collection could not load. Please refresh to try again.';console.error(error);}
}
init();
import { removeGreenScreen } from './chroma-key.js';
