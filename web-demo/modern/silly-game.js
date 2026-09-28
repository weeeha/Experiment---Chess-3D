import { Chess } from './vendor/chess.js';

const names = { p: 'pawn', r: 'rook', n: 'knight', b: 'bishop', q: 'queen', k: 'king' };
export const squareName = p => 'abcdefgh'[p.file] + (p.row + 1);
export const squarePosition = square => ({ file: 'abcdefgh'.indexOf(square[0]), row: Number(square[1]) - 1 });
const remarks = [
  'That square really brings out my eyes.',
  'A bold move. According to absolutely nobody.',
  'I have a plan. It is mostly decorative.',
  'The horse wanted a little walk.',
  'Positioning? I thought we were posing.',
  'Excellent. No idea what happens next.',
  'I call this opening “a nice little arrangement”.',
];

export class SillyGame {
  constructor({ random = Math.random, fen } = {}) {
    this.random = random;
    this.enabled = true;
    this.paused = false;
    this.reset(fen);
  }

  reset(fen) {
    this.chess = new Chess(fen);
    this.pieces = [];
    this.remaining = 0;
    this.moveCount = 0;
    this.lastMove = null;
    this.quip = 'Lovely set. Terrible strategist.';
    this.syncPieces();
    this.finishTurn();
  }

  get turn() { return this.chess.turn() === 'w' ? 'white' : 'black'; }
  get thinking() { return this.enabled && this.remaining > 0; }
  get inCheck() { return this.enabled && this.chess.isCheck(); }

  setEnabled(enabled) {
    if (this.enabled === enabled) return;
    this.enabled = enabled;
    // A free composition can be an invalid chess position. Start a fresh game.
    if (enabled) this.reset();
    else this.remaining = 0;
  }

  setPaused(paused) { this.paused = paused; }

  destinations(piece) {
    if (!piece || !this.enabled || this.thinking || this.paused || this.result || piece.side !== 'white') return [];
    return [...new Set(this.chess.moves({ square: squareName(piece), verbose: true }).map(m => m.to))];
  }

  move(from, to) {
    if (!this.enabled || this.paused || this.thinking || this.result || this.turn !== 'white') return false;
    const candidate = this.chess.moves({ square: from, verbose: true }).find(m => m.to === to && (!m.promotion || m.promotion === 'q'));
    if (!candidate) return false;
    this.apply(candidate);
    return true;
  }

  advance(ms) {
    if (!this.thinking || this.paused || !Number.isFinite(ms) || ms <= 0) return;
    this.remaining = Math.max(0, this.remaining - ms);
    if (this.remaining > 0) return;
    const moves = this.chess.moves({ verbose: true }).filter(m => !m.promotion || m.promotion === 'q');
    if (!moves.length) return;
    // No search or tactical evaluation: usually wander, occasionally take a gift.
    const captures = moves.filter(m => m.captured);
    const choices = captures.length && this.random() < .28 ? captures : moves;
    const move = choices[Math.floor(this.random() * choices.length)];
    this.quip = move.captured ? 'Was that yours? It looked lovely over here.' : remarks[Math.floor(this.random() * remarks.length)];
    this.apply(move);
  }

  apply(candidate) {
    const moved = this.chess.move({ from: candidate.from, to: candidate.to, promotion: candidate.promotion });
    this.syncPieces(moved);
    this.lastMove = { from: moved.from, to: moved.to, side: moved.color === 'w' ? 'white' : 'black', type: names[moved.piece], capture: Boolean(moved.captured), promotion: Boolean(moved.promotion) };
    this.moveCount++;
    this.finishTurn();
  }

  syncPieces(move) {
    const identities = new Map(this.pieces.map(p => [squareName(p), p.id]));
    if (move) {
      identities.set(move.to, identities.get(move.from));
      identities.delete(move.from);
      if (move.isKingsideCastle() || move.isQueensideCastle()) {
        const rank = move.from[1], from = (move.isKingsideCastle() ? 'h' : 'a') + rank;
        identities.set((move.isKingsideCastle() ? 'f' : 'd') + rank, identities.get(from));
        identities.delete(from);
      }
    }
    this.pieces = this.chess.board().flat().filter(Boolean).map(p => {
      const position = squarePosition(p.square), side = p.color === 'w' ? 'white' : 'black', type = names[p.type];
      return { id: identities.get(p.square) || `${side}-${type}-${position.file}`, side, type, ...position };
    });
  }

  finishTurn() {
    this.result = this.chess.isCheckmate() ? (this.turn === 'black' ? 'You win' : 'Silly AI wins') : this.chess.isDraw() ? 'A draw' : null;
    if (this.result) this.quip = this.result === 'You win' ? 'Outplayed. But beautifully dressed.' : this.result === 'A draw' ? 'Shall we call it a very stylish tie?' : 'Wait. Did I do that?';
    this.remaining = this.enabled && !this.result && this.turn === 'black' ? 1100 : 0;
  }

  snapshot() {
    return { mode: this.enabled ? 'silly-ai' : 'arrange', turn: this.turn, thinking: this.thinking, paused: this.paused, moveCount: this.moveCount, lastMove: this.lastMove, result: this.result, inCheck: this.inCheck, quip: this.quip };
  }
}
