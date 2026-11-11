// All game rules live here. Board = 16 cells, index = row*4+col, row 0 = top (highest altitude).
export const SPECIES = {
  Y: { key: 'Y', name: 'Arabica',  latin: 'Coffea arabica',   color: 'Yellow', rows: [0, 1],       where: 'Top two rows' },
  G: { key: 'G', name: 'Racemosa', latin: 'Coffea racemosa',  color: 'Green',  rows: [1, 2],       where: 'Middle two rows' },
  B: { key: 'B', name: 'Liberica', latin: 'Coffea liberica',  color: 'Blue',   rows: [1, 2, 3],    where: 'Bottom three rows' },
  R: { key: 'R', name: 'Robusta',  latin: 'Coffea canephora', color: 'Red',    rows: [0, 1, 2, 3], where: 'Anywhere' },
};
export const PLANTS = ['Y', 'G', 'B', 'R'];
export const MOVE = 'M';
export const PER_SPECIES = 6, MOVE_TOKENS = 4;

export const row = i => i >> 2, col = i => i & 3;
export const neighbors = i => {
  const r = row(i), c = col(i), n = [];
  if (r > 0) n.push(i - 4); if (r < 3) n.push(i + 4);
  if (c > 0) n.push(i - 1); if (c < 3) n.push(i + 1);
  return n;
};
export const canGrow = (sp, i) => SPECIES[sp].rows.includes(row(i));

// Every piece not on the board is in the bag (drawn pieces are always planted or returned).
export function bagCounts(board) {
  const c = { Y: PER_SPECIES, G: PER_SPECIES, B: PER_SPECIES, R: PER_SPECIES, M: MOVE_TOKENS };
  for (const p of board) if (p) c[p]--;
  return c;
}
export const bagTotal = c => c.Y + c.G + c.B + c.R + c.M;
export function drawFrom(counts, rand = Math.random) {
  let x = rand() * bagTotal(counts);
  for (const k of [...PLANTS, MOVE]) { if ((x -= counts[k]) < 0) return k; }
  return MOVE;
}

export const LINES = (() => {
  const L = [];
  for (let r = 0; r < 4; r++) L.push({ kind: 'row', cells: [0, 1, 2, 3].map(c => r * 4 + c) });
  for (let c = 0; c < 4; c++) L.push({ kind: 'column', cells: [0, 1, 2, 3].map(r => r * 4 + c) });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const i = r * 4 + c; L.push({ kind: 'square', cells: [i, i + 1, i + 4, i + 5] }); }
  return L;
})();
export function findWin(board) {
  for (const l of LINES) {
    const s = l.cells.map(i => board[i]);
    if (s.every(Boolean) && new Set(s).size === 4) return l;
  }
  return null;
}

// Plant sp at i. Same-species orthogonal neighbours: all of them and the new plant die.
export function plant(board, i, sp) {
  const b = board.slice(); b[i] = sp;
  const sick = neighbors(i).filter(n => b[n] === sp);
  const removed = sick.length ? [i, ...sick] : [];
  for (const r of removed) b[r] = null;
  return { board: b, removed, at: i };
}
export function transplant(board, from, to) {
  const sp = board[from], b = board.slice(); b[from] = null;
  return { ...plant(b, to, sp), from };
}

export const plantSpots = (board, sp) => board.map((p, i) => (!p && canGrow(sp, i) ? i : -1)).filter(i => i >= 0);
export const moveTargets = (board, from) => neighbors(from).filter(n => !board[n] && canGrow(board[from], n));
export function allMoves(board) {
  const m = [];
  board.forEach((p, i) => { if (p) for (const t of moveTargets(board, i)) m.push({ from: i, to: t }); });
  return m;
}
// Every legal action for a drawn piece, with its result.
export function actions(board, piece) {
  if (piece === MOVE) return allMoves(board).map(m => ({ ...m, ...transplant(board, m.from, m.to) }));
  return plantSpots(board, piece).map(i => ({ to: i, ...plant(board, i, piece) }));
}
export const emptyBoard = () => Array(16).fill(null);
