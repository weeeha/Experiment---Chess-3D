import { Chess } from './vendor/chess.js';

// Only the visible position is known; earlier move history is deliberately omitted.
export const REFERENCE_FEN = '1B1q2k1/pQ4pp/7r/8/1NP2p2/P5P1/3P1PB1/3R1RK1 w - - 0 1';
export const PIECES = { p:'pawn', n:'knight', b:'bishop', r:'rook', q:'queen', k:'king' };
export class LocalGame {
  constructor(fen=REFERENCE_FEN) { this.restore(fen); }
  restore(fen=REFERENCE_FEN) { this.chess=new Chess(fen);this.reference=true;this.timed=false;this.running=false;this.expired=null;this.clocks={w:900,b:39000};this.snapshots=[];this.last=['f5','f4']; }
  start(seconds=180) { this.chess=new Chess();this.reference=false;this.timed=seconds>0;this.running=false;this.expired=null;this.clocks={w:seconds*1000,b:seconds*1000};this.snapshots=[];this.last=[]; }
  get turn() { return this.chess.turn(); }
  get over() { return Boolean(this.expired)||this.chess.isGameOver(); }
  legal(square) { return this.over?[]:this.chess.moves({square,verbose:true}); }
  move(from,to,promotion='q') {
    if(this.over)return null;
    const prior={clocks:{...this.clocks},last:[...this.last],running:this.running};
    let move;try{move=this.chess.move({from,to,promotion});}catch{return null;}
    if(!move)return null;
    this.snapshots.push(prior);this.last=[from,to];this.running=this.timed&&!this.over;return move;
  }
  tick(ms) {
    if(!this.running||this.over||!Number.isFinite(ms)||ms<=0)return;
    this.clocks[this.turn]=Math.max(0,this.clocks[this.turn]-ms);
    if(this.clocks[this.turn]===0){this.expired=this.turn;this.running=false;}
  }
  undo() {
    if(!this.snapshots.length)return false;
    this.chess.undo();const prior=this.snapshots.pop();this.clocks=prior.clocks;this.last=prior.last;this.running=false;this.expired=null;return true;
  }
  get status() {
    if(this.expired)return `${this.expired==='w'?'White':'Black'} ran out of time`;
    if(this.chess.isCheckmate())return `${this.turn==='w'?'Black':'White'} wins by checkmate`;
    if(this.chess.isStalemate())return 'Draw by stalemate';
    if(this.chess.isDraw())return 'Game drawn';
    return `${this.turn==='w'?'White':'Black'} to move${this.chess.isCheck()?' · Check':''}`;
  }
}
