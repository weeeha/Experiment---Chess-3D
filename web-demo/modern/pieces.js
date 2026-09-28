import * as THREE from 'three';

export const TYPES = ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king'];
export const STYLES = {
  bone: { name: 'Bone & Gold', number: '01', sub: 'Warmth, with an edge.', note: 'Satin ivory. Champagne gold. A little everyday grandeur.', floor: '#e8e4da', board: ['#e7dcc5', '#343630'], frame: '#282a26', accent: '#b99452', white: '#e6d7b9', black: '#222420' },
  metal: { name: 'Metal', number: '02', sub: 'Precision in every piece.', note: 'Brushed steel. Dark titanium. Sculpted with precision.', floor: '#e1e4e4', board: ['#adb8bd', '#4e5c65'], frame: '#303b43', accent: '#acbdc8', white: '#c0cbd3', black: '#3c4851' },
  simple: { name: 'Modern Simple', number: '03', sub: 'Less detail. More presence.', note: 'Chalk porcelain. Soft graphite. Nothing more than necessary.', floor: '#e9e7df', board: ['#c7c3b7', '#70766b'], frame: '#c4c1b5', accent: '#737f65', white: '#ded8cd', black: '#303330' },
};

export function materials(style, side) {
  const s = STYLES[style];
  const main = new THREE.MeshStandardMaterial({ color: s[side], roughness: style === 'metal' ? .28 : style === 'bone' ? .32 : .65, metalness: style === 'metal' ? 1 : .035 });
  const trim = style === 'bone' ? new THREE.MeshStandardMaterial({ color: '#d8b565', metalness: 1, roughness: .22 }) : main;
  return { main, trim };
}

function add(group, geometry, material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true;
  group.add(mesh); return mesh;
}
function cyl(g, m, top, bottom, h, y, segments = 64) { return add(g, new THREE.CylinderGeometry(top, bottom, h, segments), m, 0, y); }
function box(g, m, w, h, d, y, x = 0, z = 0) {
  // A small bevel gives light a physical edge to catch.
  const s = new THREE.Shape();
  s.moveTo(-w / 2, -h / 2); s.lineTo(w / 2, -h / 2); s.lineTo(w / 2, h / 2); s.lineTo(-w / 2, h / 2); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: d - .018, bevelEnabled: true, bevelThickness: .009, bevelSize: .009, bevelSegments: 2, steps: 1 });
  geo.translate(0, 0, -(d - .018) / 2);
  return add(g, geo, m, x, y, z);
}
function lathe(g, m, profile, segments = 64) { return add(g, new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segments), m); }
function sphere(g, m, r, y) { return add(g, new THREE.SphereGeometry(r, 32, 24), m, 0, y); }
function torus(g, m, r, tube, y) { const o = add(g, new THREE.TorusGeometry(r, tube, 10, 64), m, 0, y); o.rotation.x = Math.PI / 2; return o; }

function horse(g, main, trim, base, style) {
  const shape = new THREE.Shape();
  const points = style === 'metal'
    ? [[-.27,0],[.25,0],[.13,.32],[.12,.68],[-.05,.84],[-.13,.68],[-.34,.52],[-.36,.31],[-.20,.26],[-.06,.37],[-.10,.17]]
    : [[-.29,0],[.25,0],[.20,.15],[.13,.4],[.13,.65],[.06,.79],[-.04,.84],[-.08,.67],[-.21,.60],[-.37,.42],[-.34,.29],[-.24,.30],[-.07,.42],[-.09,.23]];
  points.forEach(([x,y],i) => i ? shape.lineTo(x,y) : shape.moveTo(x,y)); shape.closePath();
  const depth = style === 'simple' ? .24 : .26;
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: style === 'simple' ? .055 : .018, bevelSize: style === 'simple' ? .035 : .014, bevelSegments: 3, steps: 1 });
  geo.translate(0,0,-depth/2); const h = add(g,geo,main,0,base);
  if(style === 'bone') {
    const mane = new THREE.Shape(); mane.moveTo(.14,.08); mane.lineTo(.24,.05); mane.lineTo(.22,.61); mane.lineTo(.10,.81); mane.lineTo(.04,.83); mane.lineTo(.12,.59); mane.closePath();
    const gm = new THREE.ExtrudeGeometry(mane,{depth:.28,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:2}); gm.translate(0,0,-.14); add(g,gm,trim,0,base);
  }
  if(style !== 'simple') {
    for(const z of [-.153,.153]) add(g,new THREE.SphereGeometry(.018,12,8),trim,-.105,base+.56,z);
  }
  return h;
}

export function createPiece(type, style, side = 'white') {
  const g = new THREE.Group(); const {main,trim} = materials(style,side);
  const royal = type === 'king' || type === 'queen';
  const height = {pawn:.68,rook:.78,knight:.76,bishop:1.01,queen:1.16,king:1.27}[type];
  if(style === 'bone') {
    // Octagonal jewelry-like foundations and a fluted tapered column.
    cyl(g,trim,.315,.345,.065,.032,8);
    cyl(g,main,.315,.335,.105,.117,8);
    cyl(g,trim,.29,.315,.036,.19,8);
    const top = type === 'pawn' ? .11 : .135;
    lathe(g,main,[[.286,.208],[.282,.25],[.245,.29],[top+.025,height-.20],[top,height-.11],[top+.04,height-.06],[top+.06,height-.035]],8);
    cyl(g,trim,top+.055,top+.065,.038,height-.032,8);
  } else if(style === 'metal') {
    cyl(g,main,.32,.34,.09,.045);
    cyl(g,main,.285,.32,.065,.12);
    // Geometric, blunt, functional masses; each head introduces a distinct shape.
    if(type === 'rook') box(g,main,.40,height-.15,.40,(height+.15)/2);
    else cyl(g,main,type === 'pawn' ? .135 : .16,.235,height-.18,(height+.18)/2, type === 'bishop' ? 4 : 64);
    cyl(g,main,.245,.21,.035,height+.005);
  } else {
    const r = type === 'pawn' ? .265 : .315;
    lathe(g,main,[[0,0],[r-.025,0],[r,.022],[r,.075],[r-.02,.14],[.13,height-.14],[.12,height-.08],[.155,height-.045],[.17,height-.018]],64);
  }
  const top = height;
  if(type === 'pawn') sphere(g,main,style==='metal' ? .18 : .175,top+.14);
  if(type === 'knight') { horse(g,main,trim,style==='bone' ? .52 : style==='metal' ? .40 : .45,style); }
  if(type === 'rook') {
    if(style==='metal') {
      box(g,main,.52,.10,.52,top+.02);
      for(const x of [-.175,.175]) for(const z of [-.175,.175]) box(g,main,.16,.18,.16,top+.13,x,z);
    } else {
      cyl(g,main,.24,.19,.12,top+.01,style==='bone'?8:64);
      torus(g,style==='bone'?trim:main,.215,.035,top+.08);
      for(let i=0;i<6;i++) { const a=i*Math.PI/3; const o=box(g,style==='bone'?trim:main,.115,.135,.09,top+.14,Math.sin(a)*.22,Math.cos(a)*.22);o.rotation.y=a; }
    }
  }
  if(type==='bishop') {
    // Two beveled profiles leave a real diagonal open slit through the mitre.
    const outline = [[-.18,0],[-.205,.11],[-.18,.25],[0,.49],[.18,.25],[.205,.11],[.18,0]];
    const clip = (sign) => {
      const evalP = p => sign * (p[1] - .72*p[0] - .23) - .022;
      let out=[];
      for(let i=0;i<outline.length;i++) {
        const a=outline[i],b=outline[(i+1)%outline.length],fa=evalP(a),fb=evalP(b);
        if(fa>=0) out.push(a);
        if((fa>=0)!==(fb>=0)){const t=fa/(fa-fb);out.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}
      }
      const s=new THREE.Shape();out.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();
      const geo=new THREE.ExtrudeGeometry(s,{depth:.17,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:3});geo.translate(0,0,-.085);return geo;
    };
    add(g,clip(1),main,0,top);add(g,clip(-1),main,0,top);
    if(style==='bone')sphere(g,trim,.045,top+.51);
  }
  if(type==='queen') {
    cyl(g,main,.245,.155,.19,top+.075,style==='bone'?8:64);
    torus(g,style==='bone'?trim:main,.235,.025,top+.18);
    for(let i=0;i<(style==='metal'?4:8);i++) {
      const a=i*Math.PI*2/(style==='metal'?4:8);
      if(style==='metal')box(g,main,.085,.16,.085,top+.23,Math.sin(a)*.20,Math.cos(a)*.20);
      else {const o=add(g,new THREE.ConeGeometry(.055,.16,4),style==='bone'?trim:main,Math.sin(a)*.223,top+.23,Math.cos(a)*.223);o.rotation.y=a;}
    }
    sphere(g,style==='bone'?trim:main,.057,top+.19);
  }
  if(type==='king') {
    cyl(g,main,.22,.15,.14,top+.05,style==='bone'?8:64);
    if(style==='bone')cyl(g,trim,.215,.22,.025,top+.13,8);
    box(g,trim,.075,.30,.075,top+.28);
    box(g,trim,.235,.075,.075,top+.32);
  }
  if(royal && style==='bone') {
    for(let i=0;i<8;i++) {const a=i*Math.PI/4+Math.PI/8;box(g,trim,.012,.30,.015,.48,Math.sin(a)*.205,Math.cos(a)*.205);}
  }
  g.userData = { type, side, style };
  return g;
}

export function release(object) {
  const geometries=new Set(), materials=new Set(), textures=new Set();
  object.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material){for(const m of [].concat(o.material)){materials.add(m);if(m.map)textures.add(m.map);}}});
  geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());
}
