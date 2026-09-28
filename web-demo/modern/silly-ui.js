import { squareName } from './silly-game.js';

// Both renderers share the same small opponent strip and turn lifecycle.
export function mountSillyUI({ game, state, onChange, sideLabels = () => ['Light', 'Dark'] }) {
  const strip = document.createElement('div');
  strip.className = 'opponent-strip';
  strip.innerHTML = '<span class="opponent-avatar" aria-hidden="true">♞</span><div class="opponent-copy"><strong>Silly AI <span>GOOD TASTE. BAD CHESS.</span></strong><p id="ai-comment" role="status" aria-live="polite"></p></div><button id="game-mode" title="Pause the opponent and arrange either side freely">Arrange freely</button>';
  document.querySelector('.viewer-footer').before(strip);
  const mode = strip.querySelector('#game-mode');
  let timer = null;

  function cancelTimer() { clearTimeout(timer); timer = null; }
  function advance(ms) {
    cancelTimer();
    game.advance(ms);
    onChange();
  }
  function sync() {
    game.setPaused(state.view !== 'board' || state.showPieces === false || document.hidden);
    strip.hidden = state.view !== 'board';
    strip.classList.toggle('is-thinking', game.thinking && !game.paused);
    mode.textContent = game.enabled ? 'Arrange freely' : 'Play a fresh game';
    mode.title = game.enabled ? 'Pause the opponent and arrange either side freely' : 'Restore the starting position and play against Silly AI';
    strip.querySelector('#ai-comment').textContent = !game.enabled ? 'Off duty. Make yourself a masterpiece.' : game.paused ? 'Take your time. I’m admiring the craftsmanship.' : game.thinking ? 'Thinking… mostly about the finish.' : game.quip;
    const last = game.lastMove;
    const detail = !game.enabled ? 'Free arrangement · move either side to any empty square.' : 'You play ' + sideLabels()[0].toLowerCase() + '. Legal moves · pawns become queens.';
    document.querySelector('.sidebar-foot p').textContent = detail;
    if (!game.thinking || game.paused) cancelTimer();
    else if (timer === null) {
      const delay = game.remaining;
      timer = setTimeout(() => advance(delay), delay);
    }
    const selected = game.pieces.find(p => p.id === state.selected);
    let hint;
    if (state.view !== 'board' || state.showPieces === false) return;
    if (!game.enabled) hint = selected ? `${selected.type[0].toUpperCase() + selected.type.slice(1)} selected · choose an empty square.` : 'Select a piece, then an empty square.';
    else if (game.result) hint = `${game.result} · Reset the board to play again.`;
    else if (game.thinking) hint = 'Silly AI’s turn · a little moment of inspiration.';
    else if (selected) hint = game.destinations(selected).length ? `${selected.type[0].toUpperCase() + selected.type.slice(1)} on ${squareName(selected)} · choose a marked square.` : 'No moves for this piece · try another.';
    else if (game.inCheck) hint = 'Your king is in check · choose a move to protect it.';
    else hint = `Your move · ${sideLabels()[0]}${last ? ` · AI ${last.from} → ${last.to}` : ' · select a piece'}`;
    document.querySelector('#interaction-hint').textContent = hint;
  }
  mode.addEventListener('click', () => {
    if (!window.chessReady) return;
    cancelTimer(); game.setEnabled(!game.enabled); state.selected = null; state.keyboardActive = false;
    state.showPieces = true;
    onChange();
  });
  document.addEventListener('visibilitychange', () => { sync(); });
  return { sync, advance, reset() { cancelTimer(); game.reset(); } };
}
