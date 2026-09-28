import * as THREE from 'three';

export const STYLES = {
  simple: { name: 'Modern Simple', number: '01', sub: 'Quiet forms. A softer touch.', note: 'Fine matte porcelain. Chalk and graphite. Softly rounded edges.', floor: '#e7e5dd', board: ['#d6d0c2', '#666c63'], frame: '#b8b5a9', accent: '#5a6652', white: '#eee9de', black: '#303730', sides: ['Chalk', 'Graphite'] },
  khokhloma: { name: 'Khokhloma', number: '02', sub: 'Golden foliage. Deep lacquer.', note: 'Golden leaves and red berries, painted over deep red and black lacquer.', floor: '#e5ded0', board: ['#c7a66e', '#24201d'], frame: '#211b17', accent: '#a78444', white: '#aa090d', black: '#10120f', sides: ['Red', 'Black'] },
  bone: { name: 'Bone & Gold', number: '03', sub: 'Satin ivory. A touch of gold.', note: 'Warm ivory and charcoal satin. Polished champagne-gold rings and crowns.', floor: '#e7e1d4', board: ['#e3d9c2', '#373c35'], frame: '#30362d', accent: '#ae8a48', white: '#e7dbc2', black: '#252c25', sides: ['Ivory', 'Charcoal'] },
};

let paint;
const cache = new Map();

export async function prepareMaterials(renderer) {
  paint = await new THREE.TextureLoader().loadAsync(new URL('./assets/khokhloma-paint.png', import.meta.url).href);
  paint.colorSpace = THREE.SRGBColorSpace;
  paint.wrapS = paint.wrapT = THREE.RepeatWrapping;
  paint.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  paint.userData.shared = true;
}

// Finish variation lives in object space, keeping it attached to rotating pieces.
// Generated artwork supplies only pigment; studio lighting supplies reflections.
function finish(material, kind, painted = false) {
  material.userData.shared = true;
  material.name = kind;
  if (painted) material.map = paint;
  material.onBeforeCompile = shader => {
    shader.vertexShader = shader.vertexShader.replace('#include <common>', `#include <common>\nvarying vec3 vFinishPosition;\nvarying vec3 vFinishNormal;`)
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvFinishPosition = position;\nvFinishNormal = normal;');
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vFinishPosition;
      varying vec3 vFinishNormal;
      float grain(vec3 p) {
        vec3 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
        vec3 k = vec3(127.1,311.7,74.7);
        float a = fract(sin(dot(i,k))*43758.5453);
        float b = fract(sin(dot(i+vec3(1,0,0),k))*43758.5453);
        float c = fract(sin(dot(i+vec3(0,1,0),k))*43758.5453);
        float d = fract(sin(dot(i+vec3(1,1,0),k))*43758.5453);
        float e = fract(sin(dot(i+vec3(0,0,1),k))*43758.5453);
        float g = fract(sin(dot(i+vec3(1,0,1),k))*43758.5453);
        float h = fract(sin(dot(i+vec3(0,1,1),k))*43758.5453);
        float j = fract(sin(dot(i+vec3(1,1,1),k))*43758.5453);
        return mix(mix(mix(a,b,f.x),mix(c,d,f.x),f.y),mix(mix(e,g,f.x),mix(h,j,f.x),f.y),f.z);
      }
    `);
    if (painted) {
      const sample = kind==='painted-head' ? `
        vec3 weights = pow(abs(normalize(vFinishNormal)),vec3(8.0));
        weights /= max(weights.x+weights.y+weights.z,0.0001);
        vec4 pigment = texture2D(map,vFinishPosition.zy*1.45+vec2(.5,.1))*weights.x
                     + texture2D(map,vFinishPosition.xz*1.45+vec2(.5,.5))*weights.y
                     + texture2D(map,vFinishPosition.xy*1.45+vec2(.5,.1))*weights.z;
      ` : 'vec4 pigment = texture2D(map, vMapUv);';
      shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
        ${sample}
        pigment.a = smoothstep(0.002,0.024,max(pigment.r,max(pigment.g,pigment.b)));
        float goldPaint = pigment.a * smoothstep(0.03,0.16,pigment.r-pigment.b) * smoothstep(0.12,0.35,pigment.g) * (1.0-smoothstep(2.5,4.0,pigment.r/max(pigment.g,0.01)));
        diffuseColor.rgb = mix(diffuseColor.rgb,pigment.rgb,pigment.a);
      `).replace('#include <metalnessmap_fragment>', 'float metalnessFactor = mix(metalness,0.76,goldPaint);')
        .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = mix(roughness,0.34,goldPaint);');
    } else if (kind.includes('ivory')) {
      shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
        float ivoryGrain = grain(vFinishPosition * vec3(18.0,2.3,18.0));
        diffuseColor.rgb *= 0.975 + 0.04 * ivoryGrain;
      `).replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor += (grain(vFinishPosition*85.0)-0.5)*0.035;');
    } else if (kind.includes('stone')) {
      shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
        float veins = grain(vFinishPosition*vec3(3.0,1.0,8.0));
        veins = smoothstep(0.56,0.66,veins+0.12*sin(vFinishPosition.x*10.0));
        diffuseColor.rgb *= 0.95 + 0.08*veins;
      `);
    } else if (kind.includes('matte')) {
      shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor += (grain(vFinishPosition*105.0)-0.5)*0.075;');
    }
  };
  material.customProgramCacheKey = () => `${kind}-${painted ? 'pigment-v1' : 'finish-v1'}`;
  return material;
}

function physical(properties, kind, painted = false) { return finish(new THREE.MeshPhysicalMaterial(properties), kind, painted); }

export function pieceMaterials(style, side) {
  const key = `${style}-${side}`;
  if (cache.has(key)) return cache.get(key);
  const s = STYLES[style];
  let main, decor, head, trim;
  if (style === 'khokhloma') {
    const lacquer = { color: s[side], metalness: 0, roughness: .27, clearcoat: 1, clearcoatRoughness: .18, ior: 1.48 };
    main = physical(lacquer, 'lacquer');
    decor = physical(lacquer, 'painted-lacquer', true);
    head = physical(lacquer, 'painted-head', true);
    trim = physical({color:'#ce9d38',metalness:1,roughness:.26,clearcoat:.3,clearcoatRoughness:.2},'gold');
  } else if (style === 'bone') {
    main = physical({color:s[side],metalness:0,roughness:.36,clearcoat:.24,clearcoatRoughness:.34,ior:1.46},'satin-ivory');
    decor = main;
    trim = physical({color:'#d6af62',metalness:1,roughness:.23,clearcoat:.15},'champagne-gold');
  } else {
    main = physical({color:s[side],metalness:0,roughness:.68,ior:1.44},'matte-porcelain');
    decor = trim = main;
  }
  const result = {main,decor,head:head||decor,trim}; cache.set(key,result); return result;
}

export function boardMaterials(style) {
  const key = `board-${style}`;
  if (cache.has(key)) return cache.get(key);
  const s = STYLES[style];
  const squares = s.board.map(color => physical({color,metalness:0,roughness:style==='simple'?.75:.48,clearcoat:style==='khokhloma'?.38:0,clearcoatRoughness:.3},style==='simple'?'matte-board':'honed-stone'));
  const frame = physical({color:s.frame,roughness:style==='simple'?.7:.32,clearcoat:style==='khokhloma'?.8:.1,clearcoatRoughness:.25},'frame');
  const trim = physical({color:s.accent,metalness:1,roughness:.3},'board-gold');
  const border = style==='khokhloma' ? physical({color:s.frame,roughness:.35,metalness:0,clearcoat:.7,clearcoatRoughness:.2},'painted-border',true) : frame;
  const result = {squares,frame,trim,border};cache.set(key,result);return result;
}

export function materialDiagnostics() {
  return {paintLoaded:!!paint?.image,paintSize:paint?.image ? [paint.image.width,paint.image.height] : null,materialSets:cache.size};
}
