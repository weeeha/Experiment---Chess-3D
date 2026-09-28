import test from 'node:test';
import assert from 'node:assert/strict';

const { SillyGame } = await import('../modern/silly-game.js').catch(() => ({}));

test('player moves legally, gets one delayed reply, and cannot move the opponent', () => {
  assert.equal(typeof SillyGame, 'function', 'The style board needs its playable opponent');
  const game = new SillyGame({ random: () => 0 });
  assert.equal(game.move('e7', 'e5'), false);
  assert.equal(game.move('e2', 'e5'), false);
  assert.equal(game.move('e2', 'e4'), true);
  assert.equal(game.move('d2', 'd4'), false);
  assert.equal(game.thinking, true);
  game.advance(100);
  assert.equal(game.moveCount, 1);
  game.advance(2000);
  assert.equal(game.moveCount, 2);
  assert.equal(game.turn, 'white');
  assert.equal(game.pieces.find(p => p.id === 'white-pawn-4').row, 3);
  game.advance(5000);
  assert.equal(game.moveCount, 2);
});

test('inspection pauses replies; reset and free arrangement cancel them', () => {
  const game = new SillyGame({ random: () => .5 });
  game.move('e2', 'e4');
  game.setPaused(true); game.advance(5000);
  assert.equal(game.moveCount, 1);
  game.setPaused(false); game.advance(2000);
  assert.equal(game.moveCount, 2);
  game.reset(); game.move('e2', 'e4'); game.reset(); game.advance(5000);
  assert.equal(game.moveCount, 0);
  assert.equal(game.pieces.length, 32);
  game.move('e2', 'e4'); game.setEnabled(false); game.advance(5000);
  assert.equal(game.moveCount, 1);
  assert.equal(game.pieces.find(p => p.id === 'white-pawn-4').row, 3);
  game.pieces.find(p => p.id === 'white-pawn-4').row = 5;
  game.setEnabled(true);
  assert.equal(game.pieces.find(p => p.id === 'white-pawn-4').row, 1);
  assert.equal(game.moveCount, 0);
});

test('captures and automatic promotion update the visible figures', () => {
  const capture = new SillyGame({ fen: '4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1' });
  assert.equal(capture.move('e4', 'd5'), true);
  assert.equal(capture.pieces.length, 3);
  assert.equal(capture.pieces.some(p => p.side === 'black' && p.type === 'pawn'), false);
  const promotion = new SillyGame({ fen: '7k/P7/8/8/8/8/8/4K3 w - - 0 1' });
  assert.equal(promotion.move('a7', 'a8'), true);
  assert.equal(promotion.pieces.find(p => p.file === 0 && p.row === 7).type, 'queen');
});

test('castling and en passant keep the renderer in sync with the rules', () => {
  const castle = new SillyGame({ fen: '4k3/8/8/8/8/8/8/4K2R w K - 0 1' });
  assert.equal(castle.move('e1', 'g1'), true);
  assert.equal(castle.pieces.find(p => p.type === 'rook').file, 5);
  const passant = new SillyGame({ fen: '4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1' });
  assert.equal(passant.move('e5', 'd6'), true);
  assert.equal(passant.pieces.length, 3);
  assert.equal(passant.pieces.some(p => p.file === 3 && p.row === 4), false);
});

test('checkmate and draw finish cleanly without scheduling another move', () => {
  const mate = new SillyGame({ fen: '7k/5Q2/6K1/8/8/8/8/8 w - - 0 1' });
  assert.equal(mate.move('f7', 'g7'), true);
  assert.equal(mate.result, 'You win');
  assert.equal(mate.thinking, false);
  mate.advance(5000); assert.equal(mate.moveCount, 1);
  const draw = new SillyGame({ fen: '7k/5Q2/6K1/8/8/8/8/8 b - - 0 1' });
  assert.equal(draw.result, 'A draw');
  draw.advance(5000); assert.equal(draw.moveCount, 0);
});
