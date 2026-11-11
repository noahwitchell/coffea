// SVG art: bush pieces (six-lobed shrubs with cherries, after Noah's 3D board) and the hillside board.
export const PAL = {
  Y: { hi: '#f7e27a', mid: '#e2bf2f', lo: '#9c7d12', berry: '#c8261d' },
  G: { hi: '#8fd16c', mid: '#4f9e38', lo: '#2b6420', berry: '#c8261d' },
  B: { hi: '#5f7fbf', mid: '#2c4a86', lo: '#16274d', berry: '#e0412f' },
  R: { hi: '#f08a74', mid: '#c9402f', lo: '#7e1d14', berry: '#fbe9c6' },
  M: { hi: '#ffffff', mid: '#ece6d6', lo: '#b3a98f', berry: '#6b4a2b' },
};
const lobes = (r, d) => [0, 1, 2, 3, 4, 5].map(k => {
  const a = (k * 60 - 90) * Math.PI / 180;
  return `<circle cx="${(Math.cos(a) * d).toFixed(2)}" cy="${(Math.sin(a) * d).toFixed(2)}" r="${r}"/>`;
}).join('');
const BERRIES = [[0, -22], [-20, -2], [20, -2], [0, 16]];

export function defs() {
  let s = '';
  for (const [k, p] of Object.entries(PAL)) {
    s += `<radialGradient id="g${k}" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="${p.hi}"/><stop offset=".55" stop-color="${p.mid}"/><stop offset="1" stop-color="${p.lo}"/></radialGradient>`;
    const berries = k === 'M'
      ? `<path d="M-17 10 A20 20 0 1 1 15 12" fill="none" stroke="${p.berry}" stroke-width="6" stroke-linecap="round"/><path d="M8 3 L18 16 L23 0 Z" fill="${p.berry}"/>`
      : BERRIES.map(([x, y]) => `<circle cx="${x}" cy="${y + 2}" r="5.6" fill="rgba(0,0,0,.35)"/><circle cx="${x}" cy="${y}" r="5.4" fill="${p.berry}"/><circle cx="${x - 1.8}" cy="${y - 1.8}" r="1.6" fill="rgba(255,255,255,.75)"/>`).join('');
    s += `<symbol id="bush${k}" viewBox="-50 -50 100 100" overflow="visible">
      <g fill="rgba(0,0,0,.38)" transform="translate(3 6)">${lobes(17, 25)}<circle r="26"/></g>
      <g fill="url(#g${k})">${lobes(17, 25)}<circle r="26"/></g>
      ${berries}</symbol>`;
  }
  s += `<radialGradient id="hole" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="#2d4a22"/><stop offset=".8" stop-color="#20361a"/><stop offset="1" stop-color="#3b6430"/></radialGradient>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5cb8e6"/><stop offset="1" stop-color="#8fd0ef"/></linearGradient>
  <linearGradient id="hillA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fc472"/><stop offset="1" stop-color="#6aa855"/></linearGradient>
  <linearGradient id="hillB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f9c4c"/><stop offset="1" stop-color="#3f7838"/></linearGradient>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>`;
  return s;
}

// Board geometry (viewBox units). Row 0 = top of the mountain.
export const CELL = 100, OX = 36, OY = 46, W = OX + 4 * CELL + 14, H = OY + 4 * CELL + 14;
export const cx = i => OX + (i & 3) * CELL + CELL / 2;
export const cy = i => OY + (i >> 2) * CELL + CELL / 2;

export function hillside() {
  // Scalloped hilltops along the top, one bump per column; a second ridge behind row 3.
  let top = `M0 ${OY + 10}`;
  for (let c = 0; c < 4; c++) top += ` Q${OX + c * CELL + CELL / 2} ${OY - 34} ${OX + (c + 1) * CELL} ${OY + 4}`;
  top += ` L${W} ${OY + 4} L${W} ${H} L0 ${H} Z`;
  const ridge = `M0 ${OY + CELL + 20} C${W * .3} ${OY + CELL - 28} ${W * .7} ${OY + CELL - 6} ${W} ${OY + CELL + 4} L${W} ${H} L0 ${H} Z`;
  const ridge2 = `M0 ${OY + 3 * CELL - 4} C${W * .35} ${OY + 3 * CELL - 30} ${W * .65} ${OY + 3 * CELL + 6} ${W} ${OY + 3 * CELL - 20} L${W} ${H} L0 ${H} Z`;
  let s = `<rect width="${W}" height="${H}" fill="url(#sky)"/>
    <path d="${top}" fill="url(#hillA)"/>
    <path d="${ridge}" fill="rgba(0,0,0,.28)" filter="url(#soft)" transform="translate(0 -8)"/>
    <path d="${ridge}" fill="url(#hillB)"/>
    <path d="${ridge2}" fill="rgba(0,30,0,.18)"/>`;
  for (let r = 0; r < 4; r++)
    s += `<text class="rownum" x="${OX / 2 + 2}" y="${OY + r * CELL + CELL / 2 + 10}" text-anchor="middle">${4 - r}</text>`;
  return s;
}
// Empty plot: a soft six-lobed hollow where a bush sits.
export const hole = () => `<g fill="url(#hole)" opacity=".85">${lobes(15, 23)}<circle r="24"/></g>`;
