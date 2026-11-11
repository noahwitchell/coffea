import { actions, bagCounts, bagTotal, findWin, PLANTS, MOVE } from './model.js';
const KINDS = [...PLANTS, MOVE];

const winsWith = (board, t) => actions(board, t).some(a => findWin(a.board));
// Chance that whoever draws next from this board can finish a set right away.
function threat(board) {
  const c = bagCounts(board), n = bagTotal(c);
  let p = 0;
  for (const t of KINDS) if (c[t] && winsWith(board, t)) p += c[t] / n;
  return p;
}
// Expected outcome for me after my action leaves `board` (1 = I win, -1 = they win), looking one full turn ahead.
function deep(board) {
  const c = bagCounts(board), n = bagTotal(c);
  let v = 0;
  for (const t of KINDS) {
    if (!c[t]) continue;
    const acts = actions(board, t);
    if (acts.some(a => findWin(a.board))) { v -= c[t] / n; continue; }
    // Opponent picks the reply that leaves me the smallest chance to win.
    let best = acts.length ? Infinity : threat(board);
    for (const a of acts) { const th = threat(a.board); if (th < best) best = th; if (!best) break; }
    v += (c[t] / n) * best;
  }
  return v;
}

export function choose(board, piece, level, rand = Math.random) {
  const acts = actions(board, piece);
  if (!acts.length) return null;
  const win = acts.filter(a => findWin(a.board));
  if (win.length && (level !== 'easy' || rand() < 0.6)) return win[0];
  let scored;
  if (level === 'easy') scored = acts.map(a => ({ a, s: rand() }));
  else if (level === 'normal') scored = acts.map(a => ({ a, s: -threat(a.board) + rand() * 0.01 }));
  else scored = acts.map(a => ({ a, s: (findWin(a.board) ? 2 : deep(a.board)) + rand() * 0.001 }));
  scored.sort((x, y) => y.s - x.s);
  return scored[0].a;
}
