export const themes = {
  bone: { name: 'Bone & Gold', subtitle: 'Warmth, with an edge.', note: 'Satin ivory. Champagne gold. A little everyday grandeur.', floor: '#e8e4da', tiles: ['#ebe1cc', '#41463d'], frame: '#a68a57', inner: '#272d26', accent: '#bb9653' },
  metal: { name: 'Metal', subtitle: 'Precision, in every detail.', note: 'Brushed silver. Dark gunmetal. Quietly industrial.', floor: '#e1e4e4', tiles: ['#b9c2c5', '#515e67'], frame: '#727f86', inner: '#303b43', accent: '#bed1dc' },
  simple: { name: 'Modern Simple', subtitle: 'Only the essentials.', note: 'Chalk porcelain. Soft charcoal. Form without the fuss.', floor: '#e9e7df', tiles: ['#d9d5c9', '#7b8472'], frame: '#b4b7a8', inner: '#b4b7a8', accent: '#e9e4ce' },
  porcelain: { name: 'Blue Porcelain', subtitle: 'A tradition, freshly painted.', note: 'Cobalt florals. Glazed porcelain. A hand-painted world.', floor: '#e6e8e4', tiles: ['#f2f1e6','#a6bdd1'], frame: '#eeede4', inner: '#536d89', accent: '#4474a4' },
  fashion: { name: 'Fashion House', subtitle: 'Tailored for the table.', note: 'Sculpted lapels. Oxblood leather. Every detail tailored.', floor: '#e4dfda', tiles: ['#c9c1b6','#723b43'], frame: '#302b2c', inner: '#9a725b', accent: '#d7ac77' },
  royal: { name: 'Royal Court', subtitle: 'An entire world, in miniature.', note: 'Intricate carving. Ceremonial figures. An engraved board.', floor: '#e8e2d6', tiles: ['#e4d6b8','#3a3029'], frame: '#d5c29e', inner: '#6e5c3f', accent: '#c1a16b' },
  medieval: { name: 'Heraldic Europe', subtitle: 'Two courts. A colorful rivalry.', note: 'Painted knights. Heraldic robes. Limestone, slate, and walnut.', floor: '#e8e2d6', tiles: ['#e1ceb0','#646566'], frame: '#654024', inner: '#b28b48', accent: '#b69352', sideLabels: ['Azure','Crimson'], sideColors: ['#1856ad','#b42535'], greenScreen: true, atlasColumns: [0,240,488,778,1018,1274,1536] },
  khokhloma: { name: 'Khokhloma', subtitle: 'A flourish, on every square.', note: 'Red lacquer. Black lacquer. Hand-painted gold florals.', floor: '#e7e0d6', tiles: ['#c43724','#22221e'], frame: '#a72218', inner: '#bd9048', accent: '#f0c96c', sideLabels: ['Red','Black'], sideColors: ['#cc3826','#24221f'] }
};

const types=["pawn","rook","knight","bishop","queen","king"],sprites={};
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

const cache = {};
export async function loadStyle(style) {
  if(cache[style])return cache[style];
  cache[style]=(async()=>{
    await loadAtlas(style);
    const pieces={};
    for(const side of ['white','black'])for(const type of types){
      const s=sprites[`${style}-${side}-${type}`],c=document.createElement('canvas');
      c.height=300;c.width=Math.ceil(s.w/s.h*300);
      c.getContext('2d').drawImage(s.image,s.x,s.y,s.w,s.h,0,0,c.width,300);
      pieces[`${side}-${type}`]=c.toDataURL('image/png');
    }
    const image=new Image();image.src=`assets/${style}-board.png`;await image.decode();
    const tiles=[];
    for(let col=0;col<3;col++){
      const c=document.createElement('canvas');c.width=256;c.height=256;
      c.getContext('2d').drawImage(image,col*512+2,2,508,508,0,0,256,256);
      tiles.push(c.toDataURL('image/png'));
    }
    return {pieces,tiles};
  })().catch(error=>{delete cache[style];throw error;});
  return cache[style];
}
import { removeGreenScreen } from './chroma-key.js';
