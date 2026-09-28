import * as THREE from 'three';
import { pieceMaterials } from './materials.js';
export { STYLES } from './materials.js';
export const TYPES = ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king'];

function add(group,geometry,material,x=0,y=0,z=0) {
  const mesh=new THREE.Mesh(geometry,material);
  mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;
  group.add(mesh);return mesh;
}
function cylinder(g,m,top,bottom,height,y) {return add(g,new THREE.CylinderGeometry(top,bottom,height,64),m,0,y);}
function ring(g,m,radius,thickness,y) {const mesh=add(g,new THREE.TorusGeometry(radius,thickness,12,96),m,0,y);mesh.rotation.x=Math.PI/2;return mesh;}
function sphere(g,m,r,y,x=0,z=0) {return add(g,new THREE.SphereGeometry(r,48,32),m,x,y,z);}
function lathe(g,m,profile,repeat=1) {
  const geo=new THREE.LatheGeometry(profile.map(([r,y])=>new THREE.Vector2(r,y)),96);
  const uv=geo.attributes.uv,pos=geo.attributes.position;
  const low=Math.min(...profile.map(p=>p[1])),high=Math.max(...profile.map(p=>p[1]));
  // Height-based UVs preserve painted motifs across the long stems and narrow collars.
  for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*repeat,(pos.getY(i)-low)/(high-low));
  return add(g,geo,m);
}
function extrude(g,m,shape,depth,y,bevel=.015) {
  const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:4,curveSegments:28,steps:1});
  geo.translate(0,0,-depth/2);
  // Project the flat paint layer onto both faces of the horse or bishop.
  // End-to-end lateral extent, not the default metre-sized extrusion UVs.
  geo.computeBoundingBox();const b=geo.boundingBox,uv=geo.attributes.uv,p=geo.attributes.position;
  for(let i=0;i<uv.count;i++)uv.setXY(i,(p.getX(i)-b.min.x)/(b.max.x-b.min.x),(p.getY(i)-b.min.y)/(b.max.y-b.min.y));
  return add(g,geo,m,0,y);
}
function box(g,m,w,h,d,y,x=0,z=0) {
  const s=new THREE.Shape();s.moveTo(-w/2,-h/2);s.lineTo(w/2,-h/2);s.lineTo(w/2,h/2);s.lineTo(-w/2,h/2);s.closePath();
  const mesh=extrude(g,m,s,d-.015,y,.0075);mesh.position.x=x;mesh.position.z=z;return mesh;
}

function horse(g,{head,trim},base,style) {
  const s=new THREE.Shape();
  s.moveTo(-.255,0);s.bezierCurveTo(-.24,.15,-.19,.27,-.115,.39);
  s.lineTo(-.245,.29);s.bezierCurveTo(-.31,.265,-.365,.28,-.375,.34);
  s.lineTo(-.395,.435);s.bezierCurveTo(-.33,.48,-.27,.565,-.13,.655);
  s.lineTo(-.08,.83);s.lineTo(-.015,.72);s.lineTo(.055,.86);s.lineTo(.115,.745);
  s.bezierCurveTo(.245,.66,.225,.47,.21,.33);s.bezierCurveTo(.21,.16,.26,.105,.28,0);s.closePath();
  extrude(g,head,s,.18,base,.035);
  if(style!=='simple') {
    const mane=new THREE.Shape();mane.moveTo(.21,.015);mane.lineTo(.29,.025);
    mane.bezierCurveTo(.23,.21,.27,.54,.18,.69);mane.lineTo(.065,.835);mane.lineTo(.08,.69);
    mane.bezierCurveTo(.20,.50,.16,.23,.21,.015);mane.closePath();
    // A narrow crest stays inside the head thickness and avoids overlapping faces.
    extrude(g,trim,mane,.10,base,.006);
    for(const z of [-.13,.13])sphere(g,trim,.015,base+.582,-.135,z);
  }
}

function bishop(g,decor,trim,top,style) {
  // A real gap splits the rounded mitre; it remains open when the camera rotates.
  const outline=[];
  const shape=new THREE.Shape();shape.moveTo(-.155,0);
  shape.bezierCurveTo(-.24,.14,-.175,.28,0,.455);
  shape.bezierCurveTo(.175,.28,.24,.14,.155,0);shape.closePath();
  for(const point of shape.getPoints(24))outline.push([point.x,point.y]);
  for(const sign of [1,-1]) {
    const evalP=p=>sign*(p[1]-.72*p[0]-.24)-.025,out=[];
    for(let i=0;i<outline.length;i++) {
      const a=outline[i],b=outline[(i+1)%outline.length],fa=evalP(a),fb=evalP(b);
      if(fa>=0)out.push(a);
      if((fa>=0)!==(fb>=0)){const t=fa/(fa-fb);out.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}
    }
    const half=new THREE.Shape();out.forEach(([x,y],i)=>i?half.lineTo(x,y):half.moveTo(x,y));half.closePath();
    extrude(g,decor,half,.18,top,.016);
  }
  if(style!=='simple')sphere(g,trim,.035,top+.485);
}

export function createPiece(type,style,side='white') {
  const g=new THREE.Group(),m=pieceMaterials(style,side),{main,decor,trim}=m;
  const height={pawn:.61,rook:.77,knight:.49,bishop:.94,queen:1.08,king:1.19}[type];
  const r=type==='pawn'?.278:.33,neck=type==='pawn'?.10:.125;
  if(style==='simple') {
    lathe(g,main,[[0,0],[r-.035,0],[r-.006,.016],[r,.045],[r-.008,.09],[r-.036,.14],[r-.095,.22],[neck+.015,height-.17],[neck,height-.09],[neck+.012,height-.035],[neck+.04,height],[0,height]]);
  } else {
    // Rounded turned silhouettes provide continuous space for paint and satin finishes.
    lathe(g,decor,[[0,0],[r-.025,0],[r,.027],[r,.075],[r-.018,.115],[r-.026,.145],[r-.03,.17],[r-.055,.20],[r-.085,.225],[r-.11,.265],[neck+.035,height-.18],[neck,height-.105],[neck+.01,height-.07],[neck+.055,height-.035],[neck+.055,height],[0,height]],style==='khokhloma'?2:1);
    ring(g,trim,r-.004,.012,.036);
    ring(g,trim,r-.032,.01,.165);
    ring(g,trim,neck+.055,.012,height-.014);
    if(style==='bone')cylinder(g,main,r-.016,r-.014,.042,.094);
    if(style==='khokhloma')cylinder(g,main,r-.006,r+.001,.056,.076);
  }
  if(type==='pawn')sphere(g,decor,.17,height+.137);
  if(type==='knight')horse(g,m,height-.018,style);
  if(type==='bishop')bishop(g,m.head,trim,height,style);
  if(type==='rook') {
    lathe(g,main,[[.145,height-.01],[.19,height+.01],[.23,height+.045],[.237,height+.095],[.19,height+.095],[.19,height+.04]]);
    if(style!=='simple')ring(g,trim,.222,.012,height+.045);
    for(let i=0;i<6;i++) {
      const a=i*Math.PI/3;
      const tooth=box(g,main,.12,.13,.09,height+.147,Math.sin(a)*.211,Math.cos(a)*.211);tooth.rotation.y=a;
    }
  }
  if(type==='queen') {
    lathe(g,decor,[[0,height],[.145,height],[.155,height+.045],[.23,height+.16],[.241,height+.185],[.22,height+.19],[.16,height+.10],[0,height+.10]]);
    ring(g,trim,.233,.018,height+.18);
    for(let i=0;i<8;i++) {
      const a=i*Math.PI/4;
      const tooth=add(g,new THREE.ConeGeometry(.038,.105,32),trim,Math.sin(a)*.228,height+.224,Math.cos(a)*.228);
      tooth.rotation.z=-Math.sin(a)*.28;tooth.rotation.x=Math.cos(a)*.28;
      if(style!=='simple')sphere(g,trim,.036,height+.281,Math.sin(a)*.244,Math.cos(a)*.244);
    }
    sphere(g,trim,.051,height+.135);
  }
  if(type==='king') {
    lathe(g,decor,[[0,height],[.15,height],[.175,height+.025],[.198,height+.09],[.198,height+.12],[0,height+.12]]);
    if(style!=='simple')ring(g,trim,.194,.011,height+.113);
    box(g,trim,.073,.28,.073,height+.273);box(g,trim,.22,.073,.073,height+.312);
  }
  g.userData={type,side,style};return g;
}

export function release(object) {
  const geometries=new Set(),materials=new Set(),textures=new Set();
  object.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of o.material?[].concat(o.material):[]){if(!m.userData.shared){materials.add(m);if(m.map&&!m.map.userData.shared)textures.add(m.map);}}});
  geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());
}
