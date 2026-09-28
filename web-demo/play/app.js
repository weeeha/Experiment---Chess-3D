import { LocalGame, PIECES } from './game.js';
import { themes, loadStyle } from './assets.js';

const $=s=>document.querySelector(s), game=new LocalGame(), art={};
const labels={bone:'IVORY & CHAMPAGNE GOLD',metal:'BRUSHED SILVER & GUNMETAL',simple:'CHALK & SOFT CHARCOAL',porcelain:'COBALT & GLAZED PORCELAIN',fashion:'OXBLOOD & SCULPTED FORMS',royal:'CARVED IVORY & CEREMONIAL GOLD',medieval:'AZURE, CRIMSON & HERALDIC GOLD',khokhloma:'RED LACQUER & GOLD FLORALS'};
const notes={bone:'Ivory, charcoal, and a touch of gold.',metal:'A little industrial. Perfectly precise.',simple:'Clean lines. Nothing more than you need.',porcelain:'A hand-painted world, in blue and white.',fashion:'A well-dressed game of chess.',royal:'An entire world, in miniature.',medieval:'Painted knights. Two colorful courts.',khokhloma:'Rich lacquer. Florals with a flourish.'};
const height={pawn:'65%',rook:'76%',knight:'83%',bishop:'87%',queen:'91%',king:'94%'};
const initialStyle=new URLSearchParams(location.search).get('style');
let style=Object.hasOwn(themes,initialStyle)?initialStyle:'bone', flipped=false, selected=null, pending=null, styleRequest=0, lastTick=performance.now(), ready=false;
const sideName=s=>s==='w'?'white':'black';
const pieceImage=(type,side,edition=style)=>art[edition]?.pieces[`${sideName(side)}-${PIECES[type]}`];
const squareName=(col,row)=>String.fromCharCode(97+(flipped?7-col:col))+(flipped?row+1:8-row);

function drawBoard(){
  const focused=document.activeElement?.dataset.square, legal=selected?game.legal(selected):[], assets=art[style];
  if(!assets)return;
  $('#board-frame').style.backgroundImage=`url("${assets.tiles[2]}")`;
  const board=$('#board');board.replaceChildren();
  for(let row=0;row<8;row++)for(let col=0;col<8;col++){
    const square=squareName(col,row),piece=game.chess.get(square),light=(row+col)%2===0;
    const button=document.createElement('button');button.type='button';button.className=`square ${light?'light':'dark'}${piece?' occupied':''}`;button.dataset.square=square;
    button.setAttribute('aria-label',`${square}${piece?`, ${sideName(piece.color)} ${PIECES[piece.type]}`:', empty'}`);
    button.setAttribute('aria-pressed',String(selected===square));button.tabIndex=square===(focused||selected||'e2')?0:-1;
    button.style.backgroundImage=`url("${assets.tiles[light?0:1]}")`;
    if(game.last.includes(square))button.classList.add('last');
    if(square===selected)button.classList.add('selected');
    if(legal.some(move=>move.to===square))button.classList.add('legal');
    if(piece?.type==='k'&&piece.color===game.turn&&game.chess.isCheck())button.classList.add('check');
    if(piece){const img=new Image();img.src=pieceImage(piece.type,piece.color);img.alt='';img.draggable=false;button.style.setProperty('--piece-height',style==='royal'&&piece.type==='r'?'93%':height[PIECES[piece.type]]);button.append(img);}
    if(col===0){const rank=document.createElement('span');rank.className='coordinate rank';rank.textContent=square[1];rank.setAttribute('aria-hidden','true');button.append(rank);}
    if(row===7){const file=document.createElement('span');file.className='coordinate file';file.textContent=square[0];file.setAttribute('aria-hidden','true');button.append(file);}
    button.addEventListener('click',()=>chooseSquare(square));board.append(button);
  }
  if(focused)board.querySelector(`[data-square="${focused}"]`)?.focus({preventScroll:true});
}
function capturedBy(color){
  const baseline=game.reference?(color==='w'?['p','p','p','p','n','n','b','b','r']:['p','p','p','n']):[];
  const captures=game.chess.history({verbose:true}).filter(move=>move.color===color&&move.captured).map(move=>move.captured);
  const order=['p','n','b','r','q'];return [...baseline,...captures].sort((a,b)=>order.indexOf(a)-order.indexOf(b));
}
function material(){const values={p:1,n:3,b:3,r:5,q:9,k:0};let total=0;for(const row of game.chess.board())for(const p of row)if(p)total+=values[p.type]*(p.color==='w'?1:-1);return total;}
function clockText(color){
  if(!game.timed&&!game.reference)return '—';
  const milliseconds=game.clocks[color],seconds=Math.ceil(milliseconds/1000);
  if(milliseconds<10000){const tenths=Math.ceil(milliseconds/100);return `0:${String(Math.floor(tenths/10)).padStart(2,'0')}<span class="fraction">.${tenths%10}</span>`;}
  return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
}
function drawClocks(){for(const color of ['w','b']){const clock=$(`#clock-${color}`);if(!clock)continue;clock.innerHTML=clockText(color);clock.className=`clock${game.turn===color?' current':''}${game.clocks[color]<10000&&game.turn===color?' low':''}${game.running&&game.turn===color?' running':''}`;clock.setAttribute('aria-label',`${sideName(color)} clock: ${clock.textContent}`);}}
function drawPlayer(target,color){
  const white=color==='w',name=game.reference?(white?'nykaza':'Mjain623'):(white?'White':'Black'),rating=game.reference?(white?'625':'715'):null;
  const captured=capturedBy(color),advantage=material()*(white?1:-1);
  $(target).innerHTML=`<div class="avatar ${white?'white':'black'}" aria-hidden="true">${game.reference?(white?'N':'A'):(white?'W':'B')}</div><div class="player-copy"><div class="player-line"><span class="player-name">${name}</span>${rating?`<span class="rating">(${rating})</span><span class="country" aria-label="${white?'United States':'India'}">${white?'US':'IN'}</span>`:''}</div><div class="captured" aria-label="${captured.length} captured pieces${advantage>0?`, ahead by ${advantage} points`:''}">${captured.length?captured.map(type=>`<img src="${pieceImage(type,white?'b':'w')}" alt="${PIECES[type]}">`).join(''):`<span class="side-name">${themes[style].sideLabels?.[white?0:1] || (white?'Light':'Dark')} pieces${themes[style].sideLabels ? ` · ${white?'White':'Black'}` : ''}</span>`}${advantage>0?`<span class="advantage">+${advantage}</span>`:''}</div></div><div class="clock" id="clock-${color}"></div>`;
}
function drawMoves(){
  const moves=game.chess.history(),list=$('#move-list');list.replaceChildren();$('#move-count').textContent=String(moves.length).padStart(2,'0');
  if(!moves.length){list.innerHTML='<p class="empty-moves">Every game starts with a move.<br>Yours will appear here.</p>';return;}
  for(let index=0;index<moves.length;index+=2){const row=document.createElement('div');row.className='move-row';row.innerHTML=`<span>${index/2+1}.</span><span>${moves[index]}</span><span>${moves[index+1]||''}</span>`;list.append(row);}
  list.scrollTop=list.scrollHeight;
}
function update(){
  if(!ready)return;drawBoard();drawPlayer('#player-top',flipped?'w':'b');drawPlayer('#player-bottom',flipped?'b':'w');drawClocks();drawMoves();
  $('#turn-label').textContent=game.status;$('#undo').disabled=!game.snapshots.length;
  $('#game-kind').textContent=game.reference?'POSITION STUDY':game.timed?'LOCAL CHESS':'LOCAL CHESS · UNTIMED';
  $('#mode-label').textContent=game.over?'Game over':!game.timed?'Untimed practice':game.running?'Clocks running':game.snapshots.length?'Clocks paused':'Ready when you are';
  $('#board-hint').textContent=game.over?'Start a new game, or take back a move.':selected?`${PIECES[game.chess.get(selected).type].replace(/^./,c=>c.toUpperCase())} on ${selected} · choose a highlighted square.`:game.reference?'Select a piece to see where it can go.':'Take turns on this screen. Select a piece, then its destination.';
  $('#pause').hidden=!game.timed||game.over||!game.snapshots.length;$('#pause').textContent=game.running?'Pause clocks':'Resume clocks';
}
function settleClock(){const now=performance.now();game.tick(now-lastTick);lastTick=now;}
function makeMove(from,to,promotion){settleClock();const move=game.move(from,to,promotion);if(move){selected=null;update();}else if(game.over)update();}
function chooseSquare(square){
  if(!ready||game.over)return;
  const piece=game.chess.get(square),moves=selected?game.legal(selected).filter(m=>m.to===square):[];
  if(moves.length){
    if(moves.some(move=>move.promotion)){
      pending={from:selected,to:square};$('#promotion-options').innerHTML=['q','r','b','n'].map(type=>`<button data-promotion="${type}" aria-label="Promote to ${PIECES[type]}"><img src="${pieceImage(type,game.turn)}" alt=""></button>`).join('');
      $('#promotion-dialog').showModal();return;
    }
    makeMove(selected,square);return;
  }
  selected=piece?.color===game.turn&&selected!==square?square:null;update();
}
async function changeStyle(next){
  const request=++styleRequest;
  try{
    $('#board-frame').setAttribute('aria-busy','true');
    art[next]=await loadStyle(next);if(request!==styleRequest)return;
    style=next;document.documentElement.style.setProperty('--accent',themes[style].accent);
    for(const button of document.querySelectorAll('[data-style]'))button.setAttribute('aria-pressed',String(button.dataset.style===style));
    $('#style-note').textContent=notes[style];
    const url=new URL(location.href);url.searchParams.set('style',style);history.replaceState(null,'',url);
    $('#loading').hidden=true;$('#board-frame').setAttribute('aria-busy','false');ready=true;update();
  }catch(error){if(request!==styleRequest)return;$('#board-frame').setAttribute('aria-busy','false');if(!ready)$('#loading').textContent='The board could not load. Refresh to try again.';else $('#style-note').textContent='That style could not load. Select it to try again.';console.error(error);}
}
function switchTab(tab){for(const name of ['styles','moves']){const chosen=tab===name;$(`#${name}-tab`).setAttribute('aria-selected',String(chosen));$(`#${name}-tab`).tabIndex=chosen?0:-1;$(`#${name}-panel`).hidden=!chosen;}}
function initControls(){
  $('#style-count').textContent=String(Object.keys(themes).length).padStart(2,'0');
  $('#style-options').innerHTML=Object.keys(themes).map(name=>`<button class="style-card" data-style="${name}" aria-label="${themes[name].name}" aria-pressed="${style===name}"><span class="style-thumbnail" style="background:${themes[name].floor}"><img id="thumb-${name}" alt=""></span><span class="style-copy"><strong>${themes[name].name}</strong><small>${labels[name]}</small></span><img class="selection-mark" src="assets/icons/check.svg" alt=""></button>`).join('');
  for(const button of document.querySelectorAll('[data-style]'))button.addEventListener('click',()=>changeStyle(button.dataset.style));
  for(const tab of ['styles','moves'])$(`#${tab}-tab`).addEventListener('click',()=>switchTab(tab));
  $('.tabs').addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const tab=event.key==='Home'?'styles':event.key==='End'?'moves':$('#styles-tab').getAttribute('aria-selected')==='true'?'moves':'styles';switchTab(tab);$(`#${tab}-tab`).focus();});
  $('#new-game').addEventListener('click',()=>{game.start(Number($('#time-control').value));lastTick=performance.now();selected=null;pending=null;$('#promotion-dialog').close();update();});
  $('#restore').addEventListener('click',()=>{game.restore();selected=null;pending=null;$('#promotion-dialog').close();lastTick=performance.now();update();});
  $('#flip').addEventListener('click',()=>{flipped=!flipped;update();});
  $('#undo').addEventListener('click',()=>{game.undo();selected=null;lastTick=performance.now();update();});
  $('#pause').addEventListener('click',()=>{settleClock();if(!game.over)game.running=!game.running;update();});
  $('#expand').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('.game').requestFullscreen();}catch{$('#board-hint').textContent='Fullscreen is unavailable in this browser.';}});
  $('#promotion-options').addEventListener('click',event=>{const choice=event.target.closest('[data-promotion]');if(!choice||!pending)return;makeMove(pending.from,pending.to,choice.dataset.promotion);pending=null;$('#promotion-dialog').close();});
  $('#cancel-promotion').addEventListener('click',()=>{pending=null;$('#promotion-dialog').close();});
  $('#promotion-dialog').addEventListener('cancel',()=>{pending=null;});
  $('#board').addEventListener('keydown',event=>{
    const keys={ArrowLeft:-1,ArrowRight:1,ArrowUp:-8,ArrowDown:8};
    if(event.key==='Escape'){selected=null;update();return;}
    if(!Object.hasOwn(keys,event.key))return;event.preventDefault();
    const squares=[...$('#board').children],current=squares.indexOf(event.target);if(current<0)return;
    const index=current+keys[event.key];if(index<0||index>63)return;
    if((event.key==='ArrowLeft'&&current%8===0)||(event.key==='ArrowRight'&&current%8===7))return;
    for(const square of squares)square.tabIndex=-1;squares[index].tabIndex=0;squares[index].focus();
  });
  document.addEventListener('visibilitychange',()=>{settleClock();if(document.hidden&&game.running){game.running=false;update();}lastTick=performance.now();});
  setInterval(()=>{if(!game.running){lastTick=performance.now();return;}settleClock();drawClocks();if(game.over)update();},100);
}
async function init(){
  initControls();await changeStyle(style);
  for(const name of Object.keys(themes)){
    try{art[name]=await loadStyle(name);$(`#thumb-${name}`).src=art[name].pieces['white-king'];}
    catch(error){$(`#thumb-${name}`).alt='Style preview unavailable';console.error(error);}
  }
}
init();
