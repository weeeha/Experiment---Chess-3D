import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { createPiece, release, TYPES, STYLES } from './pieces.js';
import { SillyGame, squarePosition } from './silly-game.js';
import { mountSillyUI } from './silly-ui.js';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const canvas=$('#chess-canvas'), stage=$('#stage');
const state={style:'bone',view:'board',side:'white',inspected:null,selected:null,camera:'perspective',keyboard:{file:4,row:1},keyboardActive:false,pieces:[]};
const game=new SillyGame();
state.pieces=game.pieces;
const opponent=mountSillyUI({game,state,onChange:()=>{state.pieces=game.pieces;rebuild();}});
const square=p=>'abcdefgh'[p.file]+(p.row+1);
const label=s=>s[0].toUpperCase()+s.slice(1);
let renderer,scene,camera,controls,content,ground,outline,environment,pmrem;
let squareTargets=[],pieceTargets=[],moveMarkers=null;
const thumbs=new Map();

function mesh(geometry,material,x,y,z,parent=content){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function surface(color,metalness=0,roughness=.6){return new THREE.MeshStandardMaterial({color,metalness,roughness});}
function textPlane(text,x,y,z,width=.20,color='#858779',rotation=-Math.PI/2,parent=content){
  const c=document.createElement('canvas');c.width=256;c.height=128;const ctx=c.getContext('2d');
  ctx.fillStyle=color;ctx.font='500 66px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,128,64);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  const m=mesh(new THREE.PlaneGeometry(width,width/2),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}),x,y,z,parent);m.rotation.x=rotation;m.castShadow=false;return m;
}
function buildBoard(){
  const s=STYLES[state.style],metal=state.style==='metal';
  mesh(new THREE.BoxGeometry(8.68,.20,8.68),surface(s.frame,metal?.85:.13,.4),0,-.10,0);
  if(state.style==='bone')mesh(new THREE.BoxGeometry(8.52,.025,8.52),surface(s.accent,1,.27),0,.011,0);
  mesh(new THREE.BoxGeometry(8.42,.035,8.42),surface(s.frame,metal?.8:.05),0,.03,0);
  const mats=s.board.map(c=>surface(c,metal?.75:.025,metal?.36:.63));
  for(let file=0;file<8;file++)for(let row=0;row<8;row++){
    const t=mesh(new THREE.BoxGeometry(.997,.055,.997),mats[(file+row)%2===0?1:0],file-3.5,.051,3.5-row);
    t.userData.square={file,row};squareTargets.push(t);
  }
  for(let i=0;i<8;i++){textPlane('abcdefgh'[i],i-3.5,.055,4.16,.18,s.accent);textPlane(String(i+1),-4.15,.055,3.5-i,.18,s.accent);}
  state.pieces.forEach(p=>{
    const g=createPiece(p.type,state.style,p.side);g.position.set(p.file-3.5,.08,3.5-p.row);if(p.side==='black')g.rotation.y=Math.PI;
    g.userData.pieceId=p.id;g.traverse(o=>{if(o.isMesh)o.userData.pieceId=p.id;});content.add(g);pieceTargets.push(g);
  });
  outline=mesh(new THREE.RingGeometry(.38,.415,64),new THREE.MeshBasicMaterial({color:state.style==='bone'?'#ecc671':'#71835c',side:THREE.DoubleSide,transparent:true,opacity:.95}),0,.087,0);outline.rotation.x=-Math.PI/2;outline.visible=false;
  updateOutline();
}
function buildPieces(){
  const types=state.view==='piece'?[state.inspected]:TYPES;
  types.forEach((type,index)=>{
    const x=state.view==='piece'?0:(index%3-1)*2.4;
    const z=state.view==='piece'?0:(Math.floor(index/3)-.5)*2.3;
    const g=createPiece(type,state.style,state.side);const scale=state.view==='piece'?2.0:1.20;
    g.scale.setScalar(scale);g.position.set(x,.10,z);g.rotation.y=-.22;
    g.traverse(o=>{if(o.isMesh)o.userData.type=type;});content.add(g);pieceTargets.push(g);
    mesh(new THREE.CylinderGeometry(state.view==='piece'?1.35:.84,state.view==='piece'?1.38:.86,.13,96),surface(STYLES[state.style].floor,0,.8),x,.015,z);
    if(state.view==='pieces')textPlane(label(type),x,.105,z+.73,.64,'#747b6d');
  });
}
function rebuild(){
  if(content){scene.remove(content);release(content);}
  content=new THREE.Group();scene.add(content);squareTargets=[];pieceTargets=[];outline=null;moveMarkers=null;
  scene.background.set(STYLES[state.style].floor);ground.material.color.set(STYLES[state.style].floor).multiplyScalar(.68);
  if(state.view==='board')buildBoard();else buildPieces();
  syncUI();render();
}
function updateOutline(){
  if(!outline)return;
  if(moveMarkers){content.remove(moveMarkers);release(moveMarkers);}
  moveMarkers=new THREE.Group();content.add(moveMarkers);
  if(game.enabled&&game.lastMove)for(const destination of [game.lastMove.from,game.lastMove.to]){
    const p=squarePosition(destination);
    const marker=mesh(new THREE.PlaneGeometry(.95,.95),new THREE.MeshBasicMaterial({color:'#c6a668',transparent:true,opacity:.24,depthWrite:false}),p.file-3.5,.083,3.5-p.row,moveMarkers);marker.rotation.x=-Math.PI/2;marker.castShadow=false;
  }
  for(const destination of game.destinations(state.pieces.find(p=>p.id===state.selected))){
    const p=squarePosition(destination),occupied=state.pieces.some(piece=>square(piece)===destination);
    const marker=mesh(occupied?new THREE.RingGeometry(.39,.43,40):new THREE.CircleGeometry(.115,32),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.88,depthWrite:false}),p.file-3.5,.087,3.5-p.row,moveMarkers);marker.rotation.x=-Math.PI/2;marker.castShadow=false;
  }
  const p=state.keyboardActive?state.keyboard:state.pieces.find(p=>p.id===state.selected);
  outline.visible=!!p;if(p)outline.position.set(p.file-3.5,.085,3.5-p.row);
}
function setCamera(top=false){
  state.camera=top?'top':'perspective';
  controls.target.set(0,state.view==='piece'?1.68:.10,0);
  if(top)camera.position.set(0,18,.001);
  else if(state.view==='piece')camera.position.set(4.5,3.0,8);
  else if(state.view==='pieces')camera.position.set(4.5,7.5,12);
  else camera.position.set(7.8,11.8,15.8);
  camera.zoom=1;controls.update();resize();
}
function resize(){
  const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;
  renderer.setSize(w,h,false);
  const aspect=w/h;
  const extent=state.view==='board'?(state.camera==='top'?14.5:12.5):state.view==='pieces'?9.1:6.5;
  const visibleHeight=Math.max(extent*.74,extent/aspect);
  camera.left=-visibleHeight*aspect/2;camera.right=visibleHeight*aspect/2;camera.top=visibleHeight/2;camera.bottom=-visibleHeight/2;
  camera.updateProjectionMatrix();render();
}
function render(){if(renderer&&scene&&camera)renderer.render(scene,camera);}
function showView(view,type=null){state.view=view;state.inspected=type;state.selected=null;state.keyboardActive=false;rebuild();setCamera();}
function syncUI(){
  const s=STYLES[state.style];
  $$('[data-style]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.style===state.style));
  $$('[data-view]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===(state.view==='board'?'board':'pieces')));
  $$('[data-piece]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.piece===state.inspected));
  $$('[data-side]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.side===state.side));
  $('#scene-number').textContent=state.view==='piece'?`${String(TYPES.indexOf(state.inspected)+1).padStart(2,'0')} / 06`:s.number+' / 03';
  $('#scene-title').textContent=state.view==='piece'?`The ${label(state.inspected)}`:state.view==='pieces'?'The full collection':s.name;
  $('#scene-subtitle').textContent=state.view==='board'?s.sub:state.view==='pieces'?`${s.name} · Six distinct silhouettes`:`${s.name} · ${state.side==='white'?'Light':'Dark'} edition`;
  $('#material-note').textContent=s.note;
  $('#side-toggle').hidden=state.view==='board';
  $('#top-view').disabled=state.view!=='board';
  $('#reset-board').disabled=state.view!=='board';
  canvas.setAttribute('aria-label',state.view==='board'?'3D chessboard. You play light against Silly AI. Drag to rotate. Scroll to zoom. Arrow keys choose a square; Enter selects a piece or moves to a marked square. Escape clears selection. Use Arrange freely to move either side.':'3D chess pieces. Drag to rotate. Scroll to zoom. Use the six piece buttons to inspect any figure.');
  const selected=state.pieces.find(p=>p.id===state.selected);
  $('#interaction-hint').textContent=selected?`${label(selected.side)} ${selected.type} · Choose an empty square`:'Drag to rotate · Scroll to zoom';
  TYPES.forEach(type=>{const image=thumbs.get(`${state.style}-${type}-${state.side}`);if(image)$(`[data-piece="${type}"] img`).src=image;});
  opponent.sync();
}
function chooseSquare(file,row){
  state.keyboard={file,row};
  const existing=state.pieces.find(p=>p.file===file&&p.row===row);
  if(game.enabled){
    if(game.thinking||game.paused||game.result)return;
    const selected=state.pieces.find(p=>p.id===state.selected);
    if(selected&&game.move(square(selected),square({file,row}))){state.pieces=game.pieces;state.selected=null;}
    else if(existing?.side==='white')state.selected=state.selected===existing.id?null:existing.id;
    rebuild();return;
  }
  if(existing){state.selected=state.selected===existing.id?null:existing.id;state.keyboard={file,row};updateOutline();syncUI();render();}
  else if(state.selected){const p=state.pieces.find(p=>p.id===state.selected);p.file=file;p.row=row;state.selected=null;state.keyboard={file,row};rebuild();$('#interaction-hint').textContent=`${label(p.type)} moved to ${square(p)} · Free arrangement`;}
}
function initThumbnails(){
  // Render the same actual meshes as the viewer, rather than unrelated artwork.
  const preview=new THREE.Scene();preview.environment=environment;preview.background=new THREE.Color('#e8e5dd');
  preview.add(new THREE.HemisphereLight('#ffffff','#8a816e',.8));
  const light=new THREE.DirectionalLight('#fff7e8',2);light.position.set(3,6,5);preview.add(light);
  const cam=new THREE.OrthographicCamera(-.69,.69,.95,-.95,.1,30);cam.position.set(2.8,2.5,5);cam.lookAt(0,.84,0);
  renderer.setSize(100,138,false);
  for(const style of Object.keys(STYLES))for(const side of ['white','black'])for(const type of TYPES){
    preview.background.set(STYLES[style].floor);const g=createPiece(type,style,side);g.rotation.y=-.2;preview.add(g);
    renderer.render(preview,cam);thumbs.set(`${style}-${type}-${side}`,canvas.toDataURL('image/png'));preview.remove(g);release(g);
  }
  for(const style of Object.keys(STYLES))$(`#thumb-${style}`).src=thumbs.get(`${style}-king-white`);
}
function init(){
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.93;
  scene=new THREE.Scene();scene.background=new THREE.Color(STYLES.bone.floor);
  pmrem=new THREE.PMREMGenerator(renderer);const room=new RoomEnvironment();environment=pmrem.fromScene(room,.03).texture;room.dispose();scene.environment=environment;scene.environmentIntensity=.8;
  scene.add(new THREE.HemisphereLight('#fffdf5','#8d9380',.8));
  const light=new THREE.DirectionalLight('#ffefd3',2.2);light.position.set(-4,10,5);light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:.5,far:35});light.shadow.bias=-.0005;light.shadow.normalBias=.025;light.shadow.radius=3;scene.add(light);
  const fill=new THREE.DirectionalLight('#e3edf8',.8);fill.position.set(5,5,-5);scene.add(fill);
  ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),surface(STYLES.bone.floor));ground.rotation.x=-Math.PI/2;ground.position.y=-.22;ground.receiveShadow=true;scene.add(ground);
  camera=new THREE.OrthographicCamera(-6,6,5,-5,.1,100);
  controls=new OrbitControls(camera,canvas);controls.enableDamping=false;controls.enablePan=false;controls.minPolarAngle=.001;controls.maxPolarAngle=Math.PI*.465;controls.minZoom=.68;controls.maxZoom=2.2;controls.rotateSpeed=.7;
  controls.addEventListener('change',render);
  for(const type of TYPES){const b=document.createElement('button');b.className='piece-option';b.dataset.piece=type;b.setAttribute('aria-label',`Inspect ${type}`);b.setAttribute('aria-pressed','false');b.innerHTML=`<img alt=""><span>${label(type)}</span>`;$('#piece-options').append(b);b.addEventListener('click',()=>{showView('piece',type);if(innerWidth<=800)$('.viewer').scrollIntoView({behavior:'instant',block:'start'});});}
  initThumbnails();rebuild();setCamera();
  new ResizeObserver(resize).observe(stage);
  $$('[data-style]').forEach(b=>b.addEventListener('click',()=>{state.style=b.dataset.style;rebuild();}));
  $$('[data-view]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
  $$('[data-side]').forEach(b=>b.addEventListener('click',()=>{state.side=b.dataset.side;rebuild();}));
  $('#all-pieces').addEventListener('click',()=>{showView('pieces');if(innerWidth<=800)$('.viewer').scrollIntoView({behavior:'instant',block:'start'});});
  $('#top-view').addEventListener('click',()=>setCamera(true));$('#reset-view').addEventListener('click',()=>setCamera());
  $('#reset-board').addEventListener('click',()=>{opponent.reset();state.pieces=game.pieces;state.selected=null;state.keyboard={file:4,row:1};state.keyboardActive=false;rebuild();});
  const fullscreen=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('.viewer').requestFullscreen();}catch{$('#interaction-hint').textContent='Fullscreen is unavailable in this browser.';}};
  $('#fullscreen').addEventListener('click',fullscreen);
  document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='f'&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();fullscreen();}});
  document.addEventListener('fullscreenchange',()=>{resize();$('#fullscreen').setAttribute('aria-label',document.fullscreenElement?'Exit fullscreen':'Expand view');});
  let down=null;
  canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});
  canvas.addEventListener('pointercancel',()=>{down=null;});
  canvas.addEventListener('pointerup',e=>{
    if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>6){down=null;return;}down=null;state.keyboardActive=false;
    const rect=canvas.getBoundingClientRect();const mouse=new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);const ray=new THREE.Raycaster();ray.setFromCamera(mouse,camera);
    const hit=ray.intersectObjects(pieceTargets,true)[0];
    if(state.view!=='board'){if(hit&&state.view==='pieces')showView('piece',hit.object.userData.type);return;}
    if(hit){const p=state.pieces.find(p=>p.id===hit.object.userData.pieceId);chooseSquare(p.file,p.row);return;}
    const tile=ray.intersectObjects(squareTargets)[0];if(tile)chooseSquare(tile.object.userData.square.file,tile.object.userData.square.row);
  });
  canvas.addEventListener('keydown',e=>{
    if(state.view!=='board')return;
    const deltas={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,1],ArrowDown:[0,-1]};
    if(deltas[e.key]){e.preventDefault();const [f,r]=deltas[e.key];state.keyboardActive=true;state.keyboard.file=Math.max(0,Math.min(7,state.keyboard.file+f));state.keyboard.row=Math.max(0,Math.min(7,state.keyboard.row+r));updateOutline();$('#interaction-hint').textContent=`Square ${square(state.keyboard)} · Enter to select or place`;render();}
    else if(e.key==='Enter'||e.key===' '){e.preventDefault();state.keyboardActive=true;chooseSquare(state.keyboard.file,state.keyboard.row);}
    else if(e.key==='Escape'){state.selected=null;state.keyboardActive=false;updateOutline();syncUI();render();}
  });
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();$('#loading').hidden=false;$('#loading').textContent='The 3D view paused. Reload this page to restore it.';window.chessReady=false;});
  $('#loading').hidden=true;window.chessReady=true;
  window.render_game_to_text=()=>JSON.stringify({...state,game:game.snapshot(),legalMoves:game.destinations(state.pieces.find(p=>p.id===state.selected)),coordinates:'a1 is near-left at initial camera; files a-h left to right, rows 1-8 near to far.',pieces:state.pieces.map(p=>({...p,square:square(p)}))});
  window.advanceTime=ms=>opponent.advance(ms);
}
try{init();}catch(error){console.error(error);$('#loading').innerHTML='The 3D view could not open.<span>Please try a browser with WebGL enabled.</span>';}
