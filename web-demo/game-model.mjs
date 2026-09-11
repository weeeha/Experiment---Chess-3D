export const SPECS = {
  rook: { idle: [8, 180], move: [8, 100], strike: [8, 100], death: [8, 140] },
  tower: { idle: [8, 160], move: [8, 110], strike: [8, 95], death: [8, 150] },
  'tower-black': { idle: [8, 160], move: [8, 110], strike: [8, 95], death: [8, 150] },
  knight: { idle: [8, 160], move: [8, 105], strike: [8, 100], death: [8, 140] },
};

function piece(id, x, y, facing) {
  return { id, x, y, position: { x, y }, facing, mode: 'idle', elapsed: 0, frame: 0, target: null, strikeDirection: null };
}
export function createState() {
  return { pieces: [piece('rook', 3, 4, 1), piece('knight', 5, 2, -1), piece('tower', 1, 6, 1), piece('tower-black', 6, 1, -1)], selected: 'knight', demo: null, combat: null, message: 'Choose a glowing square to move, or click an enemy to attack.' };
}
export const selectedPiece = s => s.pieces.find(p => p.id === s.selected);
export const busy = s => !!s.demo || !!s.combat || s.pieces.some(p => ['move', 'strike', 'death'].includes(p.mode));
const faction = p => ['knight', 'tower-black'].includes(p.id) ? 'crimson' : 'blue';
export const isEnemy = (a, b) => !!a && !!b && a !== b && faction(a) !== faction(b);
export function legalMove(s, p, x, y) {
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || x > 7 || y < 0 || y > 7 || p.mode === 'dead') return false;
  if (s.pieces.some(q => q.x === x && q.y === y)) return false;
  const dx = Math.abs(x - p.x), dy = Math.abs(y - p.y);
  if (p.id === 'knight') return dx * dy === 2;
  if ((dx === 0) === (dy === 0)) return false;
  return !s.pieces.some(q => q !== p && (dx === 0
    ? q.x === x && q.y > Math.min(p.y, y) && q.y < Math.max(p.y, y)
    : q.y === y && q.x > Math.min(p.x, x) && q.x < Math.max(p.x, x)));
}
export function setMode(p, mode) {
  p.mode = mode; p.elapsed = 0; p.frame = 0; p.strikeDirection = null;
  p.position = { x: p.x, y: p.y };
}
export function movePiece(s, p, x, y, internal = false) {
  if ((!internal && busy(s)) || !legalMove(s, p, x, y)) return false;
  p.source = { x: p.x, y: p.y }; p.target = { x, y };
  p.duration = 850 + Math.hypot(x - p.x, y - p.y) * 80;
  if (x !== p.x) p.facing = x > p.x ? 1 : -1;
  setMode(p, 'move');
  return true;
}
export function selectPiece(s, id) {
  if (busy(s) || !s.pieces.some(p => p.id === id)) return false;
  s.selected = id;
  s.message = 'Choose a glowing square to move, or click an enemy to approach and attack.';
  return true;
}

// Search the existing chess-move graph for the shortest route to a free square
// beside the target. Occupied squares remain blockers throughout the approach.
function approachPath(s, attacker, defender) {
  const obstacles = { pieces: s.pieces.filter(p => p !== attacker) };
  const start = { x: attacker.x, y: attacker.y, path: [] }, queue = [start];
  const visited = new Map([[`${start.x},${start.y}`, start.path]]);
  for (let i = 0; i < queue.length; i++) {
    const current = queue[i], probe = { ...attacker, x: current.x, y: current.y };
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      const key = `${x},${y}`;
      if (visited.has(key) || !legalMove(obstacles, probe, x, y)) continue;
      const path = [...current.path, { x, y }];
      visited.set(key, path); queue.push({ x, y, path });
    }
  }
  return [[1, 0], [-1, 0], [0, -1], [0, 1]]
    .map(([dx, dy]) => visited.get(`${defender.x + dx},${defender.y + dy}`))
    .filter(path => path !== undefined)
    .sort((a, b) => a.length - b.length)[0];
}

function beginStrike(attacker, defender) {
  setMode(attacker, 'strike');
  attacker.strikeDirection = { x: defender.x - attacker.x, y: defender.y - attacker.y };
  if (attacker.strikeDirection.x) attacker.facing = Math.sign(attacker.strikeDirection.x);
}

function nextAttackStep(s) {
  const combat = s.combat, attacker = s.pieces.find(p => p.id === combat.attackerId);
  const defender = s.pieces.find(p => p.id === combat.defenderId);
  const next = combat.path.shift();
  if (next) {
    movePiece(s, attacker, next.x, next.y, true);
    s.message = 'Closing in…';
  } else {
    combat.phase = 'strike'; beginStrike(attacker, defender);
    s.message = 'In range. Attacking!';
  }
}

export function attackTarget(s, targetId, internal = false) {
  const attacker = selectedPiece(s), defender = s.pieces.find(p => p.id === targetId);
  if ((!internal && busy(s)) || !isEnemy(attacker, defender) || attacker.mode !== 'idle' || defender.mode !== 'idle') return false;
  const path = approachPath(s, attacker, defender);
  if (!path) { s.message = 'The approach is blocked. Move another piece to make room.'; return false; }
  s.combat = { attackerId: attacker.id, defenderId: defender.id, path, phase: 'approach', hit: false };
  nextAttackStep(s);
  return true;
}
export function action(s, mode) {
  if (busy(s)) return false;
  const p = selectedPiece(s);
  if (p.mode === 'dead') return false;
  setMode(p, mode);
  s.message = mode === 'death' ? 'A dramatic exit. Reset to bring all four pieces back.' : mode === 'strike' ? 'A little show of force.' : 'Ready when you are.';
  return true;
}
export function startDemo(s) {
  Object.assign(s, createState());
  s.demo = { elapsed: 0, stage: 0 };
  s.message = 'The crimson knight approaches…';
}
export function advance(s, ms) {
  if (!Number.isFinite(ms) || ms < 0) return;
  let remaining = ms;
  while (remaining > 0) {
    const dt = Math.min(remaining, 16);
    remaining -= dt;
    for (const p of s.pieces) {
      if (p.mode === 'dead') continue;
      p.elapsed += dt;
      const [count, duration] = SPECS[p.id][p.mode];
      p.frame = Math.floor(p.elapsed / duration) % count;
      if (p.mode === 'move') {
        const t = Math.min(1, p.elapsed / p.duration), u = t * t * (3 - 2 * t);
        p.position = { x: p.source.x + (p.target.x - p.source.x) * u, y: p.source.y + (p.target.y - p.source.y) * u };
        if (t === 1) { p.x = p.target.x; p.y = p.target.y; p.target = null; setMode(p, 'idle'); }
      } else if (['strike', 'death'].includes(p.mode)) {
        if (p.mode === 'strike' && p.strikeDirection) {
          const t = Math.min(1, p.elapsed / (count * duration));
          const phase = t < .5 ? t / .5 : (1 - t) / .5;
          const lunge = .55 * phase * phase * (3 - 2 * phase);
          p.position = { x: p.x + p.strikeDirection.x * lunge, y: p.y + p.strikeDirection.y * lunge };
        }
        if (p.elapsed >= count * duration) {
          if (p.mode === 'death') { p.mode = 'dead'; p.frame = count - 1; }
          else setMode(p, 'idle');
        }
      }
    }
    if (s.combat) {
      const combat = s.combat, attacker = s.pieces.find(p => p.id === combat.attackerId);
      const defender = s.pieces.find(p => p.id === combat.defenderId);
      if (combat.phase === 'approach' && attacker.mode === 'idle') nextAttackStep(s);
      if (combat.phase === 'strike') {
        const [count, duration] = SPECS[attacker.id].strike;
        if (!combat.hit && attacker.elapsed >= count * duration * .5) {
          combat.hit = true; setMode(defender, 'death'); s.message = 'A direct hit.';
        }
        if (combat.hit && attacker.mode === 'idle' && defender.mode === 'dead') {
          s.combat = null; s.message = 'Enemy defeated. Choose another target, or reset the board.';
        }
      }
    }
    if (s.demo) {
      const d = s.demo, knight = s.pieces[1], rook = s.pieces[0];
      d.elapsed += dt;
      if (d.stage === 0 && d.elapsed >= 500) { attackTarget(s, rook.id, true); d.stage = 1; }
      if (d.stage === 1 && !s.combat && rook.mode === 'dead' && knight.mode === 'idle') { s.demo = null; s.message = 'The knight wins this round. Replay the duel or reset the board.'; }
    }
  }
}
