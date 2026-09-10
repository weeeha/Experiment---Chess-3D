import assert from 'node:assert/strict';
import test from 'node:test';
import { createState, legalMove, movePiece, advance, action, startDemo, busy, attackTarget, selectPiece } from '../game-model.mjs';

test('rook moves straight, cannot cross occupied squares, and knight moves in L shapes',()=>{
 const s=createState(),[r,k]=s.pieces;
 assert(legalMove(s,r,0,4));assert(!legalMove(s,r,0,5));assert(legalMove(s,k,4,4));assert(!legalMove(s,k,5,4));
 k.x=5;k.y=4;assert(!legalMove(s,r,7,4));assert(!legalMove(s,r,5,4));assert(!legalMove(s,r,-1,4));
});
test('an enemy command approaches, lunges, defeats only its target, and releases input',()=>{
 const s=createState(),[rook,knight]=s.pieces;
 assert(attackTarget(s,rook.id));assert.equal(s.selected,'knight');assert.equal(knight.mode,'move');
 assert(busy(s));assert(!selectPiece(s,'tower'));assert(!attackTarget(s,'tower'));
 advance(s,1250);assert.equal(knight.mode,'strike');assert.equal(rook.mode,'idle');
 advance(s,250);assert.equal(rook.mode,'death');
 advance(s,2500);assert.equal(rook.mode,'dead');assert.equal(knight.mode,'idle');
 assert.equal(s.combat,null);assert(!busy(s));assert.deepEqual(knight.position,{x:knight.x,y:knight.y});
 assert(s.pieces.slice(2).every(p=>p.mode==='idle'));assert(!attackTarget(s,rook.id));
});
test('attacks cannot target allies or start from a fallen unit',()=>{
 const s=createState();assert(!attackTarget(s,'tower-black'));assert(!attackTarget(s,'knight'));assert(!attackTarget(s,'unknown'));
 s.pieces[1].mode='dead';assert(!attackTarget(s,'rook'));assert.equal(s.combat,null);
});
test('attacks lunge into the enemy square in all four cardinal directions, then return',()=>{
 for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
  const s=createState(),[p,target]=s.pieces;s.selected='rook';
  p.x=3;p.y=3;p.position={x:3,y:3};target.x=3+dx;target.y=3+dy;target.position={x:target.x,y:target.y};
  assert(attackTarget(s,target.id));assert.equal(p.mode,'strike');
  advance(s,400);
  assert(Math.abs(p.position.x-(3+dx*.55))<.01);assert(Math.abs(p.position.y-(3+dy*.55))<.01);
  assert.equal(target.mode,'death');if(dx)assert.equal(p.facing,dx);
  advance(s,2000);assert.deepEqual(p.position,{x:3,y:3});assert.equal(s.combat,null);
 }
});
test('distant tower attacks chain legal moves and never cross a standing blocker',()=>{
 const s=createState();s.selected='tower';const p=s.pieces[2],target=s.pieces[3];
 assert(attackTarget(s,target.id));
 let previous={x:p.x,y:p.y},moves=0;
 for(let i=0;i<1600&&s.combat;i++) {
  advance(s,16);
  if(previous.x!==p.x||previous.y!==p.y) {assert(previous.x===p.x||previous.y===p.y);previous={x:p.x,y:p.y};moves++;}
 }
 assert(moves>=2);assert.equal(target.mode,'dead');assert.equal(s.combat,null);
 assert.equal(Math.abs(p.x-target.x)+Math.abs(p.y-target.y),1);
 const blocked=createState();blocked.selected='rook';const r=blocked.pieces[0];
 blocked.pieces.push(...[[r.x+1,r.y],[r.x-1,r.y],[r.x,r.y+1],[r.x,r.y-1]].map(([x,y],i)=>({id:`blocker-${i}`,x,y,mode:'idle'})));
 assert(!attackTarget(blocked,'knight'));assert.equal(blocked.combat,null);assert.equal(r.mode,'idle');
});
test('movement locks input, animates, commits position and returns idle',()=>{
 const s=createState(),p=s.pieces[1];assert(movePiece(s,p,4,4));advance(s,300);assert(busy(s));assert(p.position.y>2&&p.position.y<4);assert(!action(s,'death'));advance(s,2000);assert.equal(p.mode,'idle');assert.equal(p.x,4);assert.equal(p.y,4);assert.equal(p.target,null);
});
test('attack completes; death holds final frame and cannot move until reset',()=>{
 const s=createState(),p=s.pieces[1];action(s,'strike');advance(s,1000);assert.equal(p.mode,'idle');action(s,'death');advance(s,2000);assert.equal(p.mode,'dead');assert.equal(p.frame,7);assert(!movePiece(s,p,4,4));assert(!action(s,'idle'));
});
test('scripted encounter completes with a living knight and fallen rook',()=>{
 const s=createState();startDemo(s);advance(s,5000);assert.equal(s.demo,null);assert.equal(s.pieces[0].mode,'dead');assert.equal(s.pieces[1].mode,'idle');assert.equal(s.pieces[1].x,4);assert.equal(s.pieces[1].y,4);
});
test('both towers move as rooks and complete their attack and collapse animations',()=>{
 for(const id of ['tower','tower-black']) {
  const s=createState(),p=s.pieces.find(p=>p.id===id);
  assert(p,`${id} starts on the board`);s.selected=id;
  assert(!legalMove(s,p,p.x+1,p.y+1));
  assert(movePiece(s,p,p.x+1,p.y));advance(s,2000);assert.equal(p.mode,'idle');
  action(s,'strike');advance(s,759);assert.equal(p.mode,'strike');advance(s,1);assert.equal(p.mode,'idle');
  action(s,'death');advance(s,1200);assert.equal(p.mode,'dead');assert.equal(p.frame,7);
  assert(!movePiece(s,p,p.x+1,p.y));
 }
});
