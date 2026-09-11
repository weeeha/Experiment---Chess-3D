// Prepared sprite poses, never texture displacement or per-frame scaling.
export function createCourtyardMotion(flames, flags, cleanPlate, original) {
  function extract(sheet, columns, rows, type) {
    return Array.from({length:columns*rows},(_,index)=>{
      const col=index%columns,row=Math.floor(index/columns);
      const x=Math.round(col*sheet.width/columns),y=Math.round(row*sheet.height/rows);
      const width=Math.round((col+1)*sheet.width/columns)-x;
      const height=Math.round((row+1)*sheet.height/rows)-y;
      const image=document.createElement('canvas');image.width=width;image.height=height;
      const c=image.getContext('2d',{willReadFrequently:true});c.drawImage(sheet,x,y,width,height,0,0,width,height);
      const pixels=c.getImageData(0,0,width,height),data=pixels.data;
      let top=height,bottom=0;
      for(let i=0;i<data.length;i+=4){
        const r=data[i],g=data[i+1],b=data[i+2];
        // Chroma matte from generated atlas. Blue cloth and ivory flame cores survive.
        if(r>130&&b>110&&r>g*1.5&&b>g*1.5){data[i+3]=0;continue;}
        if(data[i+3]){const py=Math.floor(i/4/width);top=Math.min(top,py);bottom=Math.max(bottom,py);}
      }
      c.putImageData(pixels,0,0);
      let sum=0,count=0;
      const anchorY=type==='fire'?bottom:top;
      for(let py=Math.max(0,anchorY-(type==='fire'?8:0));py<=Math.min(height-1,anchorY+(type==='fire'?0:8));py++)
        for(let px=0;px<width;px++)if(data[(py*width+px)*4+3]){sum+=px;count++;}
      return {image,anchorX:count?sum/count:width/2,anchorY};
    });
  }
  const fireFrames=extract(flames,4,2,'fire');
  const flagFrames=extract(flags,8,2,'flag');
  const fires=[{x:130,y:261,offset:0},{x:1127,y:261,offset:3},{x:105,y:678,offset:5},{x:1146,y:684,offset:1}];
  function sprite(ctx,frame,x,y,sx,sy,scale){
    // Fixed integer placement and size eliminate subpixel shimmer.
    ctx.drawImage(frame.image,Math.round((x-frame.anchorX*sx)*scale),Math.round((y-frame.anchorY*sy)*scale),
      Math.round(frame.image.width*sx*scale),Math.round(frame.image.height*sy*scale));
  }
  return {
    frameCount:24,
    render(ctx,time,scale){
      ctx.imageSmoothingEnabled=false;
      const flagIndex=Math.floor(time/190)%8;
      sprite(ctx,flagFrames[flagIndex],55,231,.79,1.10,scale);
      sprite(ctx,flagFrames[8+(flagIndex+3)%8],1198,226,.79,1.02,scale);
      // Original hanging bars sit in front of the fixed cloth tops.
      for(const [x,y,w,h] of [[0,207,119,43],[1137,204,117,40]])
        ctx.drawImage(original,x,y,w,h,Math.round(x*scale),Math.round(y*scale),Math.round(w*scale),Math.round(h*scale));
      for(const f of fires){
        sprite(ctx,fireFrames[(Math.floor(time/105)+f.offset)%8],f.x,f.y,.205,.205,scale);
        // The front lip of each bowl occludes the flame's root.
        const x=f.x-32,y=f.y+1;
        ctx.drawImage(cleanPlate,x,y,64,18,Math.round(x*scale),Math.round(y*scale),Math.round(64*scale),Math.round(18*scale));
      }
    }
  };
}
