import * as M from './model.js';
import { choose } from './ai.js';
import { defs, hillside, hole, cx, cy, W, H, PAL } from './art.js';

const KEY = 'coffea.v1';
const $ = s => document.querySelector(s);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ROWS_TXT = { Y: 'rows 3–4', G: 'rows 2–3', B: 'rows 1–3', R: 'any row' };
const pieceName = p => (p === M.MOVE ? 'Transplant' : M.SPECIES[p].name);
const svgPiece = (p, cls = '') => `<svg class="pc ${cls}" viewBox="-50 -50 100 100"><use href="#bush${p}" x="-50" y="-50" width="100" height="100"/></svg>`;

let S = load() || null;
let busy = false;

function fresh(setup) {
  const first = setup.first === 'random' ? (Math.random() < .5 ? 0 : 1) : +setup.first;
  return { board: M.emptyBoard(), turn: first, phase: 'draw', drawn: null, pick: null, winner: null, winLine: null,
    passes: 0, setup, names: setup.mode === 'cpu' ? ['You', 'Computer'] : ['Player 1', 'Player 2'],
    score: S && S.setup.mode === setup.mode && S.setup.level === setup.level ? S.score : [0, 0] };
}
function load() { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } }
function save() { if (S.phase === 'resolving' || S.phase === 'stuck') return; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} }
const isCpu = () => S.setup.mode === 'cpu' && S.turn === 1;

// ---------- layout ----------
document.querySelector('#app').innerHTML = `
  <header class="sky">
    <button class="icon" id="btnRules" aria-label="Rules">?</button>
    <h1>Coffea Arabica</h1>
    <button class="icon" id="btnNew" aria-label="New game">↻</button>
  </header>
  <div class="players">
    <div class="pl" data-p="0"><span class="nm"></span><span class="sc"></span></div>
    <div class="vs">vs</div>
    <div class="pl" data-p="1"><span class="nm"></span><span class="sc"></span></div>
  </div>
  <div class="boardwrap">
    <svg id="board" viewBox="0 0 ${W} ${H}">
      <defs>${defs()}</defs>
      ${hillside()}
      <g id="wincage"></g>
      ${Array.from({ length: 16 }, (_, i) => `<g class="cell" data-i="${i}" transform="translate(${cx(i)} ${cy(i)})">
        ${hole()}<circle class="ring" r="38" cy="2"/><g class="slot"></g><rect class="hit" x="-50" y="-50" width="100" height="100"/></g>`).join('')}
    </svg>
  </div>
  <div class="tray">
    <button id="bag" class="bag" aria-label="Draw from the bag">
      <svg viewBox="0 0 100 100"><path d="M24 36 L30 22 L70 22 L76 36 L84 86 L16 86 Z" fill="#c99a62"/><path d="M24 36 L76 36 L84 86 L50 86 Z" fill="#b8874f"/>
      <rect x="30" y="16" width="40" height="8" rx="2" fill="#8a6237"/>
      <text x="50" y="70" text-anchor="middle" class="bagn"></text></svg>
      <span class="baglbl">Draw</span>
    </button>
    <div class="drawn"><div class="dpiece"></div></div>
    <div class="msg"><div class="m1"></div><div class="m2"></div></div>
  </div>
  <div class="tally"></div>
  <div id="toast" class="toast"></div>`;

const cells = [...document.querySelectorAll('.cell')];
cells.forEach(c => c.addEventListener('click', () => tapCell(+c.dataset.i)));
$('#bag').addEventListener('click', () => { if (!busy && !isCpu() && S.phase === 'draw') draw(); });
$('#btnNew').addEventListener('click', () => openSetup());
$('#btnRules').addEventListener('click', () => openRules());

// ---------- render ----------
function render() {
  const b = S.board;
  cells.forEach((c, i) => {
    const slot = c.querySelector('.slot'), want = b[i] || '';
    if (slot.dataset.p !== want) { slot.dataset.p = want; slot.innerHTML = want ? `<use href="#bush${want}" x="-50" y="-50" width="100" height="100"/>` : ''; }
  });
  const targets = new Set(), sources = new Set();
  if (!isCpu() && !busy) {
    if (S.phase === 'place') M.plantSpots(b, S.drawn).forEach(i => targets.add(i));
    if (S.phase === 'move-pick' || S.phase === 'move-drop') M.allMoves(b).forEach(m => sources.add(m.from));
    if (S.phase === 'move-drop') M.moveTargets(b, S.pick).forEach(i => targets.add(i));
  }
  cells.forEach((c, i) => {
    c.classList.toggle('target', targets.has(i));
    c.classList.toggle('source', sources.has(i));
    c.classList.toggle('picked', S.phase === 'move-drop' && S.pick === i);
    c.classList.toggle('win', !!S.winLine && S.winLine.cells.includes(i));
    c.classList.toggle('dim', !!S.winLine && !S.winLine.cells.includes(i));
  });
  document.querySelectorAll('.pl').forEach(p => {
    const k = +p.dataset.p;
    p.querySelector('.nm').textContent = S.names[k];
    p.querySelector('.sc').textContent = S.score[k];
    p.classList.toggle('on', S.phase !== 'over' ? S.turn === k : S.winner === k);
  });
  const counts = M.bagCounts(b);
  $('.bagn').textContent = M.bagTotal(counts) - (S.drawn ? 1 : 0);
  $('#bag').disabled = !(S.phase === 'draw' && !isCpu() && !busy);
  $('#bag').classList.toggle('ready', S.phase === 'draw' && !isCpu() && !busy);
  $('.dpiece').innerHTML = S.drawn ? svgPiece(S.drawn, 'pop') : '';
  const who = S.names[S.turn];
  let m1 = '', m2 = '';
  if (S.phase === 'over') { m1 = S.winner == null ? 'The mountain is stuck — a draw.' : `${S.names[S.winner]} ${S.winner === 0 && S.setup.mode === 'cpu' ? 'win' : 'wins'}!`; m2 = S.winner == null ? '' : `The ultimate hybrid — a full ${S.winLine.kind} of all four.`; }
  else if (S.phase === 'draw') { m1 = isCpu() ? 'Computer is drawing…' : `${who}: draw a piece`; m2 = isCpu() ? '' : 'Tap the bag.'; }
  else if (S.phase === 'resolving' || S.phase === 'stuck') { m1 = S.phase === 'stuck' ? 'Back in the bag' : 'Planting…'; m2 = ''; }
  else if (S.drawn === M.MOVE) { m1 = isCpu() ? 'Computer transplants…' : 'Transplant!'; m2 = S.phase === 'move-drop' ? 'Tap a glowing plot next to it.' : 'Pick a plant to move one step.'; }
  else { const sp = M.SPECIES[S.drawn]; m1 = isCpu() ? `Computer drew ${sp.name}` : `${sp.name}`; m2 = isCpu() ? '' : `${sp.latin} · ${ROWS_TXT[S.drawn]}`; }
  $('.m1').textContent = m1; $('.m2').textContent = m2;
  $('.tally').innerHTML = [...M.PLANTS, M.MOVE].map(k => `<span class="t">${svgPiece(k)}<b>${counts[k] - (S.drawn === k ? 1 : 0)}</b></span>`).join('') + '<span class="tlbl">in the bag</span>';
  $('.tray').classList.toggle('over', S.phase === 'over');
  save();
}

function toast(t, ms = 1800) {
  const el = $('#toast'); el.textContent = t; el.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), ms);
}

// ---------- flow ----------
async function draw() {
  busy = true;
  $('#bag').classList.add('shake'); await sleep(320); $('#bag').classList.remove('shake');
  S.drawn = M.drawFrom(M.bagCounts(S.board));
  const acts = M.actions(S.board, S.drawn);
  busy = false;
  if (!acts.length) {
    S.phase = 'stuck'; render();
    toast(S.drawn === M.MOVE ? 'Nothing can be transplanted — back in the bag.' : `No room for ${pieceName(S.drawn)} — back in the bag.`, 2200);
    await sleep(1500);
    S.drawn = null; S.passes++;
    if (S.passes >= 8) { S.phase = 'over'; S.winner = null; render(); return; }
    return endTurn();
  }
  S.phase = S.drawn === M.MOVE ? 'move-pick' : 'place';
  render();
  if (isCpu()) cpuAct();
}

function tapCell(i) {
  if (busy || isCpu()) return;
  if (S.phase === 'place') { if (M.plantSpots(S.board, S.drawn).includes(i)) resolve(M.plant(S.board, i, S.drawn)); else if (!S.board[i]) toast(`${M.SPECIES[S.drawn].name} only grows in ${ROWS_TXT[S.drawn]}.`); else toast('That plot is taken.'); return; }
  if (S.phase === 'move-pick' || S.phase === 'move-drop') {
    if (S.phase === 'move-drop' && M.moveTargets(S.board, S.pick).includes(i)) return resolve(M.transplant(S.board, S.pick, i));
    if (S.board[i] && M.moveTargets(S.board, i).length) { S.pick = i; S.phase = 'move-drop'; render(); }
    else if (S.board[i]) toast('That plant has nowhere to go.');
  }
}

async function cpuAct() {
  await sleep(700);
  const a = choose(S.board, S.drawn, S.setup.level);
  if (a.from != null) { S.pick = a.from; S.phase = 'move-drop'; render(); cells[a.from].classList.add('picked'); await sleep(500); }
  resolve(a);
}

async function resolve(res) {
  busy = true;
  const prev = S.board, piece = res.from != null ? prev[res.from] : S.drawn;
  // Show the new plant landing first, even if disease is about to take it.
  const shown = prev.slice(); if (res.from != null) shown[res.from] = null; shown[res.at] = piece;
  S.board = shown; S.drawn = null; S.phase = 'resolving'; render();
  const slot = cells[res.at].querySelector('.slot');
  if (res.from != null) {
    const dx = cx(res.from) - cx(res.at), dy = cy(res.from) - cy(res.at);
    slot.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.3,1.3,.5,1)' });
  } else slot.animate([{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.12)', opacity: 1, offset: .7 }, { transform: 'none' }], { duration: 360, easing: 'ease-out' });
  await sleep(420);
  if (res.removed.length) {
    const sp = piece;
    res.removed.forEach(r => cells[r].classList.add('wilt'));
    toast(`Monoculture! ${res.removed.length} ${M.SPECIES[sp].name} plants lost to disease.`, 2400);
    await sleep(900);
    res.removed.forEach(r => cells[r].classList.remove('wilt'));
  }
  S.board = res.board; S.pick = null; S.passes = 0;
  const win = M.findWin(S.board);
  busy = false;
  if (win) { S.phase = 'over'; S.winner = S.turn; S.winLine = win; S.score[S.turn]++; render(); celebrate(); return; }
  endTurn();
}

function endTurn() {
  S.turn = 1 - S.turn; S.phase = 'draw'; S.drawn = null; render();
  if (isCpu()) setTimeout(() => draw(), 600);
}

function celebrate() {
  S.winLine.cells.forEach((i, k) => cells[i].querySelector('.slot').animate(
    [{ transform: 'none' }, { transform: 'translateY(-14px) scale(1.1)' }, { transform: 'none' }],
    { duration: 520, delay: k * 110, easing: 'ease-in-out' }));
  setTimeout(() => toast('Tap ↻ to play again', 2600), 1400);
}

// ---------- sheets ----------
function sheet(html) {
  const sh = $('#sheet'); sh.querySelector('.sheet-body').innerHTML = html; sh.classList.remove('hidden');
  return sh;
}
function closeSheet() { $('#sheet').classList.add('hidden'); }
$('#sheet').addEventListener('click', e => { if (e.target.id === 'sheet' && S) closeSheet(); });

function openSetup() {
  const st = (S && S.setup) || { mode: 'cpu', level: 'normal', first: 'random' };
  const seg = (name, opts, cur) => `<div class="seg" data-name="${name}">${opts.map(([v, l]) => `<button data-v="${v}" class="${v === cur ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  const sh = sheet(`<h2>New game</h2>
    <label>Opponent</label>${seg('mode', [['cpu', 'Computer'], ['pvp', 'Pass &amp; play']], st.mode)}
    <label class="lv">Computer skill</label>${seg('level', [['easy', 'Easy'], ['normal', 'Normal'], ['hard', 'Hard']], st.level)}
    <label>Who goes first</label>${seg('first', [['0', 'Player 1'], ['1', 'Player 2'], ['random', 'Random']], String(st.first))}
    <div class="row2">${S ? '<button class="btn ghost" id="cancel">Cancel</button>' : ''}<button class="btn" id="go">Start</button></div>`);
  const pick = {}; sh.querySelectorAll('.seg').forEach(g => { pick[g.dataset.name] = g.querySelector('.on').dataset.v; });
  const sync = () => {
    const cpu = pick.mode === 'cpu';
    sh.querySelector('[data-name=level]').classList.toggle('off', !cpu); sh.querySelector('.lv').classList.toggle('off', !cpu);
    const f = sh.querySelectorAll('[data-name=first] button'); f[0].textContent = cpu ? 'You' : 'Player 1'; f[1].textContent = cpu ? 'Computer' : 'Player 2';
  };
  sh.querySelectorAll('.seg button').forEach(b => b.onclick = () => {
    const g = b.parentElement; g.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); pick[g.dataset.name] = b.dataset.v; sync();
  });
  sync();
  sh.querySelector('#go').onclick = () => { closeSheet(); S = fresh(pick); busy = false; render(); if (isCpu()) setTimeout(draw, 700); };
  const c = sh.querySelector('#cancel'); if (c) c.onclick = closeSheet;
}

function openRules() {
  const sp = M.PLANTS.map(k => `<li>${svgPiece(k)}<div><b>${M.SPECIES[k].name}</b> <i>${M.SPECIES[k].latin}</i><br>${k === 'R' ? 'Hardy — grows in any row.' : `Grows only in ${ROWS_TXT[k]}.`}</div></li>`).join('');
  sheet(`<h2>How to play</h2>
    <p>Two farmers share one mountainside. Be the first to grow the ultimate hybrid: <b>all four species</b> in one <b>row</b>, one <b>column</b>, or one <b>2×2 square</b>.</p>
    <p>On your turn, draw a random piece from the bag and plant it. Whoever completes a set wins — even with pieces the other farmer planted. Careful what you set up.</p>
    <h3>Altitude</h3><ul class="sp">${sp}</ul>
    <p class="small">The bag holds 6 of each species and 4 transplant tokens.</p>
    <h3>Monoculture disease</h3><p>Plant next to the same species (up, down, left or right) and <b>both die</b> and go back in the bag. Sometimes that's the move — it can break up a rival's almost-set.</p>
    <h3>Transplant ${svgPiece('M', 'inline')}</h3><p>Draw a transplant token and you must move one plant, any plant, one step to an empty neighbouring plot it can grow in. Disease applies where it lands.</p>
    <h3>Table rulings</h3><ul class="small"><li>Disease is checked before the win.</li><li>If a piece has nowhere legal to go, it goes back in the bag and your turn ends.</li><li>Every piece not on the board is in the bag, so you can always see what's left.</li></ul>
    <div class="row2"><button class="btn" id="ok">Got it</button></div>`);
  $('#ok').onclick = closeSheet;
}

if ('serviceWorker' in navigator && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') navigator.serviceWorker.register('sw.js');

if (S && S.board) {
  if (S.phase === 'stuck' || S.phase === 'resolving') { S.phase = 'draw'; S.drawn = null; }
  if (S.phase === 'over' && !S.winLine && S.winner != null) S.phase = 'draw';
  if (isCpu() && S.phase !== 'over') { S.phase = 'draw'; S.drawn = null; render(); setTimeout(draw, 700); }
  else render();
} else { S = fresh({ mode: 'cpu', level: 'normal', first: '0' }); render(); openRules(); $('#ok').onclick = () => { closeSheet(); openSetup(); }; }
