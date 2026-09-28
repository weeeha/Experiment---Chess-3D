import test from 'node:test';
import assert from 'node:assert/strict';
import { LocalGame,REFERENCE_FEN } from '../game.js';

test('the reference position has the correct pieces, material and frozen clocks',()=>{
  const game=new LocalGame();assert.equal(game.chess.fen(),REFERENCE_FEN);
  assert.equal(game.chess.board().flat().filter(Boolean).length,19);
  assert.deepEqual(game.chess.get('b8'),{type:'b',color:'w'});
  assert.deepEqual(game.chess.get('f4'),{type:'p',color:'b'});
  game.tick(5000);assert.deepEqual(game.clocks,{w:900,b:39000});assert.equal(game.status,'White to move');
});
test('turns, illegal moves, capture, undo and restoring the screenshot',()=>{
  const game=new LocalGame();assert.equal(game.move('a7','a6'),null);assert.equal(game.move('d2','d5'),null);
  const move=game.move('b7','d5');assert.equal(move.san,'Qd5+');assert.equal(game.turn,'b');
  assert.equal(game.undo(),true);assert.equal(game.chess.fen(),REFERENCE_FEN);
  game.move('b7','d5');game.restore();assert.equal(game.chess.fen(),REFERENCE_FEN);assert.equal(game.snapshots.length,0);
});
test('fresh timed games start on the first move, pause, expire and undo with clocks',()=>{
  const game=new LocalGame();game.start(180);assert.equal(game.chess.board().flat().filter(Boolean).length,32);
  game.tick(1000);assert.equal(game.clocks.w,180000);
  game.move('e2','e4');game.tick(1250);assert.equal(game.clocks.b,178750);
  game.running=false;game.tick(99999);assert.equal(game.clocks.b,178750);
  game.running=true;game.tick(180000);assert.equal(game.status,'Black ran out of time');assert.equal(game.move('e7','e5'),null);
  game.undo();assert.equal(game.expired,null);assert.equal(game.running,false);assert.deepEqual(game.clocks,{w:180000,b:180000});
});
test('castling, en passant, capture, underpromotion and checkmate',()=>{
  const castle=new LocalGame('4k3/8/8/8/8/8/8/4K2R w K - 0 1');castle.move('e1','g1');assert.equal(castle.chess.get('f1').type,'r');
  const ep=new LocalGame('4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1');ep.move('e5','d6');assert.equal(ep.chess.get('d5'),undefined);assert.equal(ep.chess.get('d6').color,'w');
  const promotion=new LocalGame('7k/P7/8/8/8/8/8/4K3 w - - 0 1');promotion.move('a7','a8','n');assert.equal(promotion.chess.get('a8').type,'n');
  const mate=new LocalGame('7k/5Q2/6K1/8/8/8/8/8 w - - 0 1');mate.move('f7','g7');assert.equal(mate.status,'White wins by checkmate');assert.equal(mate.over,true);
});
