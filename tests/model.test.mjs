import test from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../js/model.js';
import { choose } from '../js/ai.js';
const B = s => s.replace(/\s/g, '').split('').map(ch => (ch === '.' ? null : ch));

test('altitude rules', () => {
  assert.deepEqual(M.plantSpots(M.emptyBoard(), 'Y'), [0,1,2,3,4,5,6,7]);
  assert.deepEqual(M.plantSpots(M.emptyBoard(), 'G'), [4,5,6,7,8,9,10,11]);
  assert.equal(M.plantSpots(M.emptyBoard(), 'B').length, 12);
  assert.equal(M.plantSpots(M.emptyBoard(), 'R').length, 16);
});
test('monoculture kills both (and every same neighbour)', () => {
  const r = M.plant(B('.R.. R... .... ....'), 0, 'R');
  assert.deepEqual(r.removed.sort(), [0,1,4]);
  assert.ok(r.board.every(p => p === null));
  assert.deepEqual(M.plant(B('.... .... .... ....'), 0, 'R').removed, []);
});
test('diagonal neighbours are fine', () => {
  assert.deepEqual(M.plant(B('.... .R.. .... ....'), 0, 'R').removed, []);
});
test('wins: row, column, square; not with repeats', () => {
  assert.equal(M.findWin(B('.... YGBR .... ....')).kind, 'row');
  assert.equal(M.findWin(B('Y... G... B... R...')).kind, 'column');
  assert.equal(M.findWin(B('.... .YG. .BR. ....')).kind, 'square');
  assert.equal(M.findWin(B('.... YGBY .... ....')), null);
});
test('bag is everything off the board', () => {
  const c = M.bagCounts(B('YG.. .... .... ...R'));
  assert.deepEqual(c, { Y: 5, G: 5, B: 6, R: 5, M: 4 });
});
test('transplant respects altitude and neighbours', () => {
  const b = B('.... .... .... G...');
  assert.deepEqual(M.moveTargets(B('.... .... G... ....'), 8), [4, 9]);
  assert.deepEqual(M.moveTargets(B('.... G... .... ....'), 4), [8, 5]);
  const r = M.transplant(B('.... .Y.. .... ....'), 5, 4);
  assert.equal(r.board[4], 'Y'); assert.equal(r.board[5], null);
});
test('ai takes the win and avoids handing one over', () => {
  const b = B('.... YGB. .... ....');
  assert.equal(choose(b, 'R', 'normal').to, 7);
  // Placing R at 7 gives a row? no: with B at 6 missing; test avoiding: row Y G . . — any 3rd distinct piece hands a win.
  const b2 = B('.... YG.. .... ....');
  const a = choose(b2, 'B', 'hard');
  assert.notEqual(a.to, 6); assert.notEqual(a.to, 7);
});
