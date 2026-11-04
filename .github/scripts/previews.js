// Writes the README pictures from the theme files:
//   .github/banner.svg   the logo and name, the desktop cut into its two styles
//   .github/styles.svg   `facet style`: the same desktop in tui, then in bloom
//   .github/themes.svg   `facet theme set` in a terminal, a small desktop recoloring beside it
//   .github/install.svg  a `facet install` run, line by line
// Run from the repo root: node .github/scripts/previews.js
// Plain SVG with CSS animations, so GitHub plays them inside <img> without any script.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const order = ['periwinkle', 'sakura', 'matcha', 'ember', 'lagoon', 'mono'];
// The themes live in facet-shell/cli; an installed facet command has them, FACET_THEMES points elsewhere
const themeDir = process.env.FACET_THEMES || process.env.FRAME_THEMES || path.join(require('os').homedir(), '.local/share/frameshell/cli/themes');
const themes = order.map(id => Object.assign({ id }, JSON.parse(fs.readFileSync(path.join(themeDir, id + '.json'), 'utf8'))));
const font = "ui-monospace, 'JetBrains Mono', SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";
const sans = "Rubik, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const roles = Object.keys(themes[0].colors);
// bloom's Material You tones for periwinkle, as the bloom style builds them from the theme
const bloom = {
  surface: '#12131c', container: '#1a1c27', high: '#262836', primary: '#b9c3ff', onPrimary: '#1f2b78',
  pc: '#38449a', sc: '#434659', tertiary: '#e4bad9', text: '#e3e1ec', dim: '#c6c5d0', ok: '#7dd99a'
};

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
const pct = x => x.toFixed(2) + '%';

// ── Brand ────────────────────────────────────────────────────
// The same shapes as brand/logo.svg in facet-shell/.github: an Asscher-cut gem from above,
// eight faces around the table, and the wordmark from chamfered strokes.

const MARK = {
  sil: 'M138 76L374 76L436 138L436 374L374 436L138 436L76 374L76 138Z',
  cuts: 'M188 158L324 158L354 188L354 324L324 354L188 354L158 324L158 188ZM138 76L188 158M374 76L324 158M436 138L354 188M436 374L354 324M374 436L324 354M138 436L188 354M76 374L158 324M76 138L158 188',
  faces: ['M138 76L374 76L324 158L188 158Z', 'M374 76L436 138L354 188L324 158Z', 'M436 138L436 374L354 324L354 188Z', 'M436 374L374 436L324 354L354 324Z',
    'M374 436L138 436L188 354L324 354Z', 'M138 436L76 374L158 324L188 354Z', 'M76 374L76 138L158 188L158 324Z', 'M76 138L138 76L188 158L158 188Z'],
  table: 'M188 158L324 158L354 188L354 324L324 354L188 354L158 324L158 188Z'
};
// Which theme role lights each face (top, top right, … top left, then the table)
const faceRoles = ['secondary', 'secondary', 'primary', 'shadow', 'shadow', 'primary', 'accent', 'text', 'primary'];
const WORD = 'M2.4 14L2.4 4.2L5.4 1.2L8 1.2M0 5.2L6.5 5.2M18.8 4L18.8 14M18.8 5.2L14.2 5.2L11.2 8.2L11.2 9.8L14.2 12.8L18.8 12.8M31 5.2L26.2 5.2L23.2 8.2L23.2 9.8L26.2 12.8L31 12.8M34.2 9.2L41.8 9.2L41.8 8.2L38.8 5.2L37.2 5.2L34.2 8.2L34.2 9.8L37.2 12.8L42.6 12.8M47.4 0.6L47.4 9.8L50.4 12.8L53 12.8M45 5.2L52 5.2';

// The mask goes in <defs>; fills are attributes or classes, one per face
function markDefs(id, gap = 14) {
  return `<mask id="${id}" maskUnits="userSpaceOnUse" x="76" y="76" width="360" height="360"><path d="${MARK.sil}" fill="#fff"/><path d="${MARK.cuts}" fill="none" stroke="#000" stroke-width="${gap}"/></mask>`;
}
function mark(id, x, y, size, paint) {
  const s = size / 360;
  const all = [...MARK.faces, MARK.table];
  return `<g transform="translate(${x} ${y}) scale(${+s.toFixed(4)}) translate(-76 -76)"><g mask="url(#${id})">` +
    all.map((d, i) => `<path d="${d}" ${paint(i)}/>`).join('') + `</g></g>`;
}
function word(x, y, h, color) {
  const s = h / 14.4;
  return `<path d="${WORD}" transform="translate(${x} ${y}) scale(${+s.toFixed(4)}) translate(0.2 0.2)" fill="none" stroke="${color}" stroke-width="2.4"/>`;
}

// Per-role animations that step through the six themes, for fill, stroke and stop-color
function themeSteps(prop, role) {
  const seg = 100 / themes.length;
  let out = '';
  themes.forEach((t, i) => {
    const c = t.colors[role];
    out += `${pct(i * seg)}{${prop}:${c}}${pct((i + 1) * seg - 2.5)}{${prop}:${c}}`;
  });
  return out + `100%{${prop}:${themes[0].colors[role]}}`;
}

// ── Banner ───────────────────────────────────────────────────

function bannerSvg() {
  const c = themes[0].colors, b = bloom, W = 1280, H = 320, loop = themes.length * 3;
  let css = `text{font-family:${font}}.sans{font-family:${sans}}`;
  // Only the mark changes color: it walks through the six themes
  for (const r of new Set(faceRoles)) css += `@keyframes m-${r}{${themeSteps('fill', r)}}.m-${r}{animation:m-${r} ${loop}s infinite}`;
  const o = [];
  o.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t">`);
  o.push(`<title id="t">facet</title><style>${css}</style>`);
  o.push(`<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.bg}"/><stop offset="1" stop-color="${c.surface}"/></linearGradient>`);
  o.push(`<radialGradient id="gl" cx="960" cy="160" r="440" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c.primary}" stop-opacity="0.28"/><stop offset="1" stop-color="${c.primary}" stop-opacity="0"/></radialGradient>`);
  o.push(`<radialGradient id="wall" cx="0.3" cy="0.3" r="0.9"><stop offset="0" stop-color="${b.primary}" stop-opacity="0.55"/><stop offset="0.55" stop-color="${b.pc}" stop-opacity="0.5"/><stop offset="1" stop-color="${b.surface}"/></radialGradient>`);
  o.push(`<clipPath id="cl"><rect width="${W}" height="${H}" rx="24"/></clipPath>`);
  // The mini desktop is cut in two along a slant, like a face of the gem
  o.push(`<clipPath id="half-t"><path d="M680 40H980L920 280H680Z"/></clipPath><clipPath id="half-b"><path d="M980 40H1216V280H920Z"/></clipPath>`);
  o.push(markDefs('mk', 14) + `</defs>`);
  o.push(`<g clip-path="url(#cl)"><rect width="${W}" height="${H}" fill="url(#bg)"/><rect width="${W}" height="${H}" fill="url(#gl)"/>`);

  o.push(mark('mk', 96, 72, 132, i => `class="m-${faceRoles[i]}"`));
  o.push(word(264, 94, 88, c.text));
  o.push(`<text x="98" y="256" font-size="19" fill="${c.textDim}">a desktop for CachyOS and Hyprland</text>`);
  o.push(`<text x="98" y="286" font-size="16" fill="${c.frame}">[<tspan fill="${c.primary}">tui</tspan>]─[<tspan fill="${c.secondary}">bloom</tspan>]─[<tspan fill="${c.muted}">six themes</tspan>]─[<tspan fill="${c.muted}">quickshell</tspan>]</text>`);

  // tui half: square frames, labels in the border
  const t = [];
  t.push(`<rect x="680" y="40" width="300" height="240" fill="${c.bg}"/>`);
  t.push(`<rect x="690" y="50" width="520" height="20" fill="none" stroke="${c.surface2}" stroke-width="1.5"/>`);
  for (let k = 0; k < 4; k++) t.push(`<rect x="${697 + k * 14}" y="55" width="10" height="10" fill="${k ? c.surface2 : c.primary}"/>`);
  t.push(`<text x="800" y="64" font-size="10" fill="${c.text}">10:30 <tspan fill="${c.muted}">wed</tspan></text>`);
  function tframe(x, y, w, h, label, lit) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c.bg}" stroke="${lit ? c.primary : c.surface2}" stroke-width="1.5"/>` +
      `<rect x="${x + 8}" y="${y - 6}" width="${label.length * 6.2 + 8}" height="12" fill="${c.bg}"/><text x="${x + 12}" y="${y + 3.5}" font-size="10" fill="${lit ? c.primary : c.muted}">${label}</text>`;
  }
  t.push(tframe(690, 84, 160, 186, 'ghostty', true));
  [[c.frame, 40], [c.text, 96], [c.ok, 70], [c.ok, 84], [c.ok, 62], [c.frame, 40], [c.text, 80], [c.textDim, 110], [c.textDim, 92], [c.secondary, 10]].forEach(([col, w], j) =>
    t.push(`<rect x="702" y="${98 + j * 16}" width="${w}" height="5" fill="${col}"${j > 6 ? ' fill-opacity="0.8"' : ''}/>`));
  t.push(tframe(862, 84, 170, 110, 'control', false));
  [0.7, 0.5, 0.85].forEach((v, j) => t.push(`<rect x="874" y="${104 + j * 26}" width="110" height="4" fill="${c.surface2}"/><rect x="874" y="${104 + j * 26}" width="${110 * v}" height="4" fill="${c.secondary}"/>`));
  t.push(tframe(862, 206, 170, 64, 'discord', false));
  t.push(`<rect x="874" y="222" width="60" height="5" fill="${c.text}"/><rect x="874" y="236" width="100" height="5" fill="${c.textDim}"/>`);
  o.push(`<g clip-path="url(#half-t)">${t.join('')}</g>`);

  // bloom half: a rounded hole in the frame, pills on the bar, a panel out of the right edge
  const bl = [];
  bl.push(`<rect x="680" y="40" width="536" height="240" rx="16" fill="${b.surface}"/>`);
  bl.push(`<rect x="688" y="72" width="520" height="200" rx="14" fill="url(#wall)"/>`);
  bl.push(`<rect x="1020" y="50" width="70" height="16" rx="8" fill="${b.container}"/><text x="1055" y="62" font-size="10" text-anchor="middle" class="sans" fill="${b.text}">10:30</text>`);
  bl.push(`<rect x="1140" y="50" width="48" height="16" rx="8" fill="${b.container}"/><circle cx="1200" cy="58" r="5" fill="none" stroke="#ffb4ab" stroke-width="1.6"/>`);
  bl.push(`<rect x="930" y="94" width="150" height="150" rx="12" fill="${b.surface}" fill-opacity="0.9" stroke="${b.primary}" stroke-width="1.5"/>`);
  [[b.primary, 50], [b.dim, 90], [b.dim, 70], [b.ok, 80], [b.dim, 60]].forEach(([col, w], j) => bl.push(`<rect x="944" y="${110 + j * 16}" width="${w}" height="5" rx="2.5" fill="${col}" fill-opacity="0.85"/>`));
  // now playing: the disc under the clock, opened into a pill
  bl.push(`<rect x="990" y="78" width="130" height="28" rx="14" fill="${b.container}"/><circle cx="1004" cy="92" r="10" fill="${b.tertiary}"/><circle cx="1004" cy="92" r="3" fill="${b.container}"/>`);
  bl.push(`<rect x="1020" y="86" width="56" height="5" rx="2.5" fill="${b.text}"/><rect x="1020" y="95" width="34" height="4" rx="2" fill="${b.dim}"/>`);
  bl.push(`<path d="M1208 96A14 14 0 0 1 1194 110L1124 110A14 14 0 0 0 1110 124L1110 226A14 14 0 0 0 1124 240L1194 240A14 14 0 0 1 1208 254Z" fill="${b.surface}"/>`);
  bl.push(`<rect x="1122" y="122" width="38" height="18" rx="9" fill="${b.primary}"/><rect x="1164" y="122" width="38" height="18" rx="9" fill="${b.high}"/>`);
  [0.7, 0.5, 0.85].forEach((v, j) => bl.push(`<rect x="1122" y="${154 + j * 22}" width="80" height="12" rx="6" fill="${b.high}"/><rect x="1122" y="${154 + j * 22}" width="${80 * v}" height="12" rx="6" fill="${b.primary}"/>`));
  o.push(`<g clip-path="url(#half-b)">${bl.join('')}</g>`);
  o.push(`<path d="M980 36L920 284" stroke="${c.bg}" stroke-width="6"/>`);
  o.push(`</g></svg>`);
  return o.join('\n') + '\n';
}

// ── Style switch ─────────────────────────────────────────────
// The same desktop and theme: first tui, then bloom, each with its panels coming in

function stylesSvg() {
  const c = themes[0].colors, b = bloom, W = 1280, H = 640, loop = 16;
  const o = [];
  // [percent, css, easing for the stretch after it]
  function kf(name, frames) {
    return `@keyframes ${name}{` + frames.map(([p, s, e]) => `${pct(p)}{${s}${e ? `;animation-timing-function:${e}` : ''}}`).join('') + `}`;
  }
  const emph = 'cubic-bezier(.05,.7,.1,1)', spring = 'cubic-bezier(.34,1.5,.64,1)';
  let css = `text{font-family:${font};font-size:14px;white-space:pre}.sans{font-family:${sans}}.b{font-weight:700}`;
  // Which style is on: tui for the first half, bloom for the second, a short crossfade between
  css += kf('A', [[0, 'opacity:1'], [47, 'opacity:1'], [50, 'opacity:0'], [97, 'opacity:0'], [100, 'opacity:1']]) + `.A{animation:A ${loop}s infinite}`;
  css += kf('B', [[0, 'opacity:0'], [47, 'opacity:0'], [50, 'opacity:1'], [97, 'opacity:1'], [100, 'opacity:0']]) + `.B{opacity:0;animation:B ${loop}s infinite}`;
  // tui panels just appear, drawn in one go like a terminal redraw
  const pop = (n, at) => kf(n, [[0, 'opacity:0'], [at - 0.01, 'opacity:0'], [at, 'opacity:1'], [47, 'opacity:1'], [47.01, 'opacity:0'], [100, 'opacity:0']]) + `.${n}{opacity:0;animation:${n} ${loop}s infinite steps(1)}`;
  css += pop('t1', 12) + pop('t2', 22) + pop('t3', 32);
  // bloom: the cover drops out of the clock as a disc and opens into a pill
  css += kf('drop', [[0, 'opacity:0;transform:translateY(-60px) scale(.3)'], [54, 'opacity:0;transform:translateY(-60px) scale(.3)', spring], [58, 'opacity:1;transform:none'], [96, 'opacity:1;transform:none'], [97, 'opacity:0'], [100, 'opacity:0;transform:translateY(-60px) scale(.3)']]);
  css += `.drop{opacity:0;transform-origin:640px 176px;animation:drop ${loop}s infinite}`;
  const open = (n, from, to) => kf(n, [[0, from], [58, from, emph], [62, to], [96, to], [100, from]]) + `.${n}{animation:${n} ${loop}s infinite}`;
  css += open('capL', 'transform:none', 'transform:translateX(-172px)') + open('capR', 'transform:none', 'transform:translateX(172px)');
  css += open('mid', 'transform:scaleX(0)', 'transform:scaleX(1)') + `.mid{transform-origin:640px 176px}`;
  css += kf('inf', [[0, 'opacity:0'], [62, 'opacity:0', emph], [64, 'opacity:1'], [96, 'opacity:1'], [97, 'opacity:0'], [100, 'opacity:0']]) + `.inf{opacity:0;animation:inf ${loop}s infinite}`;
  css += `@keyframes spin{to{transform:rotate(360deg)}}.spin{transform-origin:640px 176px;animation:spin 6s linear infinite}`;
  // panels slide out of the right edge and the notification springs in
  css += kf('dr', [[0, 'transform:translateX(440px)'], [68, 'transform:translateX(440px)', emph], [72, 'transform:none'], [94, 'transform:none', 'cubic-bezier(.3,0,.8,.15)'], [96, 'transform:translateX(440px)'], [100, 'transform:translateX(440px)']]) + `.dr{animation:dr ${loop}s infinite}`;
  css += kf('nt', [[0, 'opacity:0;transform:translateX(40px)'], [78, 'opacity:0;transform:translateX(40px)', spring], [81, 'opacity:1;transform:none'], [95, 'opacity:1;transform:none'], [96, 'opacity:0'], [100, 'opacity:0']]) + `.nt{opacity:0;animation:nt ${loop}s infinite}`;

  o.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t">`);
  o.push(`<title id="t">facet style: the same desktop in tui and in bloom</title><style>${css}</style>`);
  o.push(`<defs><clipPath id="card"><rect width="${W}" height="${H}" rx="22"/></clipPath>`);
  o.push(`<radialGradient id="wall" cx="0.28" cy="0.3" r="0.95"><stop offset="0" stop-color="${b.primary}" stop-opacity="0.5"/><stop offset="0.5" stop-color="${b.pc}" stop-opacity="0.55"/><stop offset="1" stop-color="#0c0d14"/></radialGradient>`);
  o.push(`<radialGradient id="wall2" cx="0.8" cy="0.25" r="0.5"><stop offset="0" stop-color="${b.tertiary}" stop-opacity="0.4"/><stop offset="1" stop-color="${b.tertiary}" stop-opacity="0"/></radialGradient>`);
  o.push(`<clipPath id="hole"><rect x="50" y="118" width="1180" height="472" rx="22"/></clipPath>`);
  o.push(`<linearGradient id="cover" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b7cff"/><stop offset="1" stop-color="#ff8fb1"/></linearGradient>`);
  o.push(markDefs('mk', 18) + `</defs>`);
  o.push(`<g clip-path="url(#card)"><rect width="${W}" height="${H}" fill="${c.bg}"/>`);

  // Spans: [[color, text], …]
  const line = (x, y, parts, cls) => `<text x="${x}" y="${y}"${cls ? ` class="${cls}"` : ''}>` + parts.map(([col, s]) => `<tspan fill="${col}">${esc(s)}</tspan>`).join('') + `</text>`;
  o.push(line(44, 50, [[c.primary, '❯ '], [c.text, 'facet style '], [c.secondary, 'tui']], 'A'));
  o.push(line(44, 50, [[c.primary, '❯ '], [c.text, 'facet style '], [c.secondary, 'bloom']], 'B'));
  o.push(`<text x="1236" y="50" text-anchor="end" fill="${c.muted}">same theme, same features</text>`);

  // tui
  const A = [];
  A.push(`<rect x="40" y="80" width="1200" height="520" fill="${c.bg}" stroke="${c.surface2}" stroke-width="1"/>`);
  function frame(x, y, w, h, label, lit) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c.bg}" stroke="${lit ? c.primary : c.surface2}" stroke-width="1.5"/>` +
      `<rect x="${x + 14}" y="${y - 9}" width="${label.length * 8.6 + 14}" height="18" fill="${c.bg}"/><text x="${x + 21}" y="${y + 5}" fill="${lit ? c.primary : c.muted}">${esc(label)}</text>`;
  }
  A.push(`<rect x="52" y="92" width="1176" height="30" fill="none" stroke="${c.surface2}" stroke-width="1.5"/>`);
  for (let k = 0; k < 5; k++) A.push(`<rect x="${62 + k * 22}" y="99" width="16" height="16" fill="${k ? c.surface2 : c.primary}"/>`);
  A.push(`<text x="640" y="112" text-anchor="middle" fill="${c.text}">10:30 <tspan fill="${c.muted}">wed 4 nov</tspan></text>`);
  A.push(line(1216, 112, [[c.frame, '['], [c.muted, 'cpu '], [c.textDim, '12%'], [c.frame, ']─['], [c.muted, 'vol '], [c.textDim, '62%'], [c.frame, ']']]).replace('<text ', '<text text-anchor="end" '));
  A.push(frame(52, 146, 560, 442, 'ghostty', true));
  const term = [
    [[c.frame, '┌['], [c.secondary, '~'], [c.frame, ']']],
    [[c.frame, '└─'], [c.primary, '❯ '], [c.text, 'facet style tui']],
    [[c.primary, '● '], [c.text, 'Style tui']],
    [[c.ok, '  ✓ '], [c.textDim, 'bar, panels and popups linked']],
    [[c.ok, '  ✓ '], [c.textDim, 'theme periwinkle written for it']],
    [[c.ok, '  ✓ '], [c.textDim, 'shell restarted']],
    [],
    [[c.frame, '┌['], [c.secondary, '~'], [c.frame, ']']],
    [[c.frame, '└─'], [c.primary, '❯ ']]
  ];
  term.forEach((l, j) => l.length && A.push(line(76, 180 + j * 24, l)));
  A.push(`<rect x="116" y="361" width="9" height="17" fill="${c.secondary}"/>`);
  A.push(frame(632, 146, 596, 442, 'zed · shell.qml', false));
  ['import Quickshell', 'import QtQuick', '', 'Bar {', '  frame: true', '  label: "control"', '  radius: 0', '}'].forEach((s, j) =>
    A.push(line(656, 180 + j * 24, [[c.muted, String(j + 1).padStart(2) + '  '], [/^import|^Bar/.test(s) ? c.accent : c.text, s]])));
  // control, then a notification, then what is playing
  const cc = [frame(808, 146, 420, 250, 'control', true)];
  [['wi-fi', 1], ['silent', 0], ['game', 1]].forEach(([l, on], j) => {
    const x = 828 + j * 130;
    cc.push(`<rect x="${x}" y="168" width="118" height="32" fill="${on ? c.primary : 'none'}" fill-opacity="${on ? 0.16 : 1}" stroke="${on ? c.primary : c.surface2}" stroke-width="1.2"/><text x="${x + 12}" y="189" fill="${on ? c.text : c.muted}">${l}</text>`);
  });
  [['mic', 74], ['chat', 60], ['music', 48], ['game', 88]].forEach(([l, v], j) => {
    const y = 236 + j * 36;
    cc.push(`<text x="828" y="${y}" fill="${c.muted}">${l}</text><rect x="900" y="${y - 7}" width="240" height="5" fill="${c.surface2}"/><rect x="900" y="${y - 7}" width="${2.4 * v}" height="5" fill="${c.secondary}"/><text x="1208" y="${y}" text-anchor="end" fill="${c.textDim}">${v}%</text>`);
  });
  A.push(`<g class="t1">${cc.join('')}</g>`);
  A.push(`<g class="t2">${frame(808, 420, 420, 100, 'discord · lena', true)}` + line(830, 456, [[c.text, 'lena '], [c.muted, 'in #general · now']]) + line(830, 480, [[c.textDim, 'are you coming online tonight?']]) +
    line(830, 504, [[c.frame, '['], [c.primary, 'reply'], [c.frame, '] ['], [c.muted, 'open'], [c.frame, ']']]) + `</g>`);
  A.push(`<g class="t3">${frame(420, 146, 368, 84, 'spotify', true)}` + line(442, 182, [[c.text, 'Midnight City'], [c.muted, ' · M83']]) +
    `<rect x="442" y="202" width="240" height="5" fill="${c.surface2}"/><rect x="442" y="202" width="90" height="5" fill="${c.primary}"/><text x="770" y="208" text-anchor="end" fill="${c.muted}">1:32</text></g>`);
  o.push(`<g class="A">${A.join('')}</g>`);

  // bloom
  const B = [];
  B.push(`<rect x="40" y="80" width="1200" height="520" fill="${b.surface}"/>`);
  B.push(`<g clip-path="url(#hole)"><rect x="50" y="118" width="1180" height="472" fill="url(#wall)"/><rect x="50" y="118" width="1180" height="472" fill="url(#wall2)"/>`);
  const bline = (x, y, parts) => `<text x="${x}" y="${y}">` + parts.map(([col, s]) => `<tspan fill="${col}">${esc(s)}</tspan>`).join('') + `</text>`;
  B.push(`<rect x="80" y="226" width="520" height="336" rx="18" fill="${b.surface}" fill-opacity="0.92" stroke="${b.primary}" stroke-width="2"/>`);
  [[[b.primary, '❯ '], [b.text, 'facet style bloom']], [[b.primary, '● '], [b.text, 'Style bloom']], [[b.ok, '  ✓ '], [b.dim, 'bar, panels and popups linked']],
    [[b.ok, '  ✓ '], [b.dim, 'theme periwinkle written for it']], [[b.ok, '  ✓ '], [b.dim, 'shell restarted']], [], [[b.primary, '❯ ']]].forEach((l, j) => l.length && B.push(bline(104, 262 + j * 24, l)));
  B.push(`<rect x="640" y="236" width="500" height="300" rx="18" fill="${b.surface}" fill-opacity="0.92"/>`);
  ['import Quickshell', 'import QtQuick', '', 'Bar {', '  frame: true', '  edge: "top"', '  radius: 24', '}'].forEach((s, j) =>
    B.push(bline(664, 272 + j * 24, [[b.dim, String(j + 1).padStart(2) + '  '], [/^import|^Bar/.test(s) ? b.tertiary : b.text, s]])));
  // control center out of the right edge, joined to the frame by curves
  const dr = [`<path d="M1230 140A22 22 0 0 1 1208 162L862 162A22 22 0 0 0 840 184L840 464A22 22 0 0 0 862 486L1208 486A22 22 0 0 1 1230 508Z" fill="${b.surface}"/>`];
  [['Wi-Fi', 1], ['Bluetooth', 0], ['Silent', 0], ['Game mode', 1]].forEach(([l, on], j) => {
    const x = 860 + (j % 2) * 182, y = 180 + Math.floor(j / 2) * 58;
    dr.push(`<rect x="${x}" y="${y}" width="172" height="48" rx="${on ? 18 : 24}" fill="${on ? b.primary : b.high}"/><text x="${x + 20}" y="${y + 29}" class="sans" font-weight="500" fill="${on ? b.onPrimary : b.text}">${l}</text>`);
  });
  [74, 60, 48, 88].forEach((v, j) => {
    const y = 312 + j * 40;
    dr.push(`<rect x="860" y="${y}" width="300" height="26" rx="13" fill="${b.high}"/><rect x="860" y="${y}" width="${3 * v}" height="26" rx="13" fill="${j === 2 ? b.sc : b.primary}"/><text x="1208" y="${y + 18}" text-anchor="end" class="sans" fill="${b.dim}">${j === 2 ? 'off' : v + '%'}</text>`);
  });
  B.push(`<g class="dr">${dr.join('')}</g>`);
  B.push(`<g class="nt"><rect x="440" y="440" width="380" height="104" rx="24" fill="${b.container}"/><rect x="456" y="456" width="42" height="42" rx="14" fill="#5865f2"/><text x="477" y="483" text-anchor="middle" class="sans b" fill="#fff">D</text>` +
    `<text x="512" y="468" class="sans" font-size="12" fill="${b.dim}">Discord · now</text><text x="512" y="488" class="sans" font-weight="500" fill="${b.text}">lena</text><text x="512" y="507" class="sans" fill="${b.text}">are you coming online tonight?</text>` +
    `<rect x="512" y="516" width="70" height="22" rx="11" fill="${b.primary}"/><text x="547" y="531" text-anchor="middle" class="sans" font-size="12" fill="${b.onPrimary}">reply</text></g>`);
  B.push(`</g>`);
  // the frame's bar: pills along the top edge
  B.push(`<rect x="54" y="84" width="34" height="30" rx="15" fill="${b.container}"/>` + mark('mk', 61, 89, 20, i => `fill="${[b.tertiary, b.tertiary, b.primary, b.pc, b.pc, b.primary, b.tertiary, b.text, b.primary][i]}"`));
  B.push(`<rect x="94" y="84" width="170" height="30" rx="15" fill="${b.container}"/><rect x="98" y="88" width="94" height="22" rx="11" fill="${b.sc}"/><circle cx="109" cy="99" r="9" fill="#3b3f4a"/><text x="124" y="104" class="sans" font-size="13" font-weight="500" fill="${b.text}">Ghostty</text>`);
  [['#e66b3a', 210], ['#5865f2', 232], ['#1db954', 254]].forEach(([col, x]) => B.push(`<rect x="${x - 9}" y="90" width="18" height="18" rx="6" fill="${col}"/>`));
  B.push(`<rect x="584" y="84" width="112" height="30" rx="15" fill="${b.container}"/><text x="640" y="104" text-anchor="middle" class="sans" font-weight="600" fill="${b.text}">10:30 <tspan font-weight="400" font-size="12" fill="${b.dim}">Wed 4 Nov</tspan></text>`);
  B.push(`<rect x="1110" y="84" width="84" height="30" rx="15" fill="${b.container}"/>`);
  [1126, 1146, 1166].forEach(x => B.push(`<circle cx="${x + 4}" cy="99" r="5" fill="${b.dim}"/>`));
  B.push(`<circle cx="1214" cy="99" r="8" fill="none" stroke="#ffb4ab" stroke-width="2"/>`);
  // now playing, under the clock
  B.push(`<g class="drop"><g class="mid"><rect x="468" y="148" width="344" height="56" fill="${b.container}"/></g>` +
    `<g class="capL"><circle cx="640" cy="176" r="28" fill="${b.container}"/><g class="spin"><circle cx="640" cy="176" r="23" fill="url(#cover)"/><circle cx="632" cy="168" r="8" fill="#fff" fill-opacity="0.3"/><circle cx="640" cy="176" r="5" fill="${b.container}"/></g></g>` +
    `<g class="capR"><circle cx="640" cy="176" r="28" fill="${b.container}"/></g>` +
    `<g class="inf"><text x="508" y="172" class="sans" font-weight="600" fill="${b.text}">Midnight City</text><text x="508" y="191" class="sans" font-size="12.5" fill="${b.dim}">M83</text>` +
    `<rect x="740" y="160" width="32" height="32" rx="11" fill="${b.primary}"/><rect x="751" y="168" width="4" height="16" rx="1" fill="${b.onPrimary}"/><rect x="759" y="168" width="4" height="16" rx="1" fill="${b.onPrimary}"/></g></g>`);
  o.push(`<g class="B">${B.join('')}</g>`);
  o.push(`</g></svg>`);
  return o.join('\n') + '\n';
}

// ── Theme switch ─────────────────────────────────────────────

function themesSvg() {
  const W = 1280, H = 580, n = themes.length, loop = n * 2.6, seg = 100 / n;

  // A slot is visible while its theme is on; "late" parts appear a moment after the command
  function slot(i, delay) {
    const a = i * seg + delay, b = (i + 1) * seg - 0.4, first = a === 0 ? 1 : 0;
    let k = `0%{opacity:${first}}`;
    if (a > 0) k += `${pct(a - 0.01)}{opacity:0}${pct(a)}{opacity:1}`;
    k += `${pct(b)}{opacity:1}${pct(b + 0.01)}{opacity:0}`;
    if (b + 0.01 < 99.98) k += `99.98%{opacity:0}`;
    return k + `100%{opacity:${first}}`;
  }

  let css = `text{font-family:${font};font-size:15px}.b{font-weight:700}`;
  for (const r of roles) {
    css += `@keyframes f-${r}{${themeSteps('fill', r)}}@keyframes s-${r}{${themeSteps('stroke', r)}}@keyframes c-${r}{${themeSteps('stop-color', r)}}`;
    css += `.f-${r}{animation:f-${r} ${loop}s infinite}.s-${r}{fill:none;animation:s-${r} ${loop}s infinite}.c-${r}{animation:c-${r} ${loop}s infinite}`;
  }
  themes.forEach((t, i) => {
    css += `@keyframes cmd${i}{${slot(i, 0)}}@keyframes out${i}{${slot(i, 4)}}`;
    css += `.cmd${i}{opacity:0;animation:cmd${i} ${loop}s infinite}.out${i}{opacity:0;animation:out${i} ${loop}s infinite}`;
  });
  // The marker under the theme squares hops from one to the next
  let hop = '';
  themes.forEach((t, i) => { hop += `${pct(i * seg)}{transform:translateX(${i * 30}px)}${pct((i + 1) * seg - 2.5)}{transform:translateX(${i * 30}px)}`; });
  css += `@keyframes hop{${hop}100%{transform:translateX(0)}}.hop{animation:hop ${loop}s infinite}`;

  const o = [];
  o.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t">`);
  o.push(`<title id="t">facet theme set: the desktop in all six themes</title>`);
  o.push(`<style>${css}</style>`);
  o.push(`<defs><radialGradient id="glow" cx="0.7" cy="0.65" r="0.75"><stop offset="0" class="c-primary" stop-opacity="0.35"/><stop offset="1" class="c-primary" stop-opacity="0"/></radialGradient>`);
  o.push(`<clipPath id="card"><rect width="${W}" height="${H}" rx="22"/></clipPath></defs>`);
  o.push(`<g clip-path="url(#card)"><rect width="${W}" height="${H}" class="f-bg"/>`);

  // Labeled frame: the label sits on a background patch that cuts the top line
  function frame(x, y, w, h, label, stroke, labelRole) {
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="s-${stroke}" stroke-width="1.5"/>`;
    if (label) {
      s += `<rect x="${x + 14}" y="${y - 9}" width="${label.length * 9.2 + 14}" height="18" class="f-bg"/>`;
      s += `<text x="${x + 21}" y="${y + 5}" class="f-${labelRole || stroke}">${esc(label)}</text>`;
    }
    return s;
  }
  // A line of colored spans: [[role, text], …]
  function line(x, y, parts, cls) {
    return `<text x="${x}" y="${y}"${cls ? ` class="${cls}"` : ''}>` + parts.map(([r, t]) => `<tspan class="f-${r}">${esc(t)}</tspan>`).join('') + `</text>`;
  }

  // Terminal on the left
  o.push(frame(40, 52, 450, 456, 'ghostty', 'surface2', 'primary'));
  const tx = 64;
  themes.forEach((t, i) => {
    const name = t.name;
    o.push(`<g class="cmd${i}">`);
    o.push(line(tx, 96, [['frame', '┌['], ['secondary', '~'], ['frame', ']']]));
    o.push(line(tx, 120, [['frame', '└─'], ['primary', '❯ '], ['text', `facet theme set ${t.id}`]]));
    o.push(`</g><g class="out${i}">`);
    o.push(line(tx, 162, [['primary', '● '], ['text', `Theme ${name}`]], 'b'));
    o.push(line(tx, 188, [['warn', '  ↻ '], ['textDim', '13 color files written']]));
    o.push(line(tx, 214, [['ok', '  ✓ '], ['textDim', 'Quickshell reloads on its own']]));
    o.push(line(tx, 240, [['ok', '  ✓ '], ['textDim', 'Hyprland window colors reloaded']]));
    o.push(line(tx, 266, [['ok', '  ✓ '], ['textDim', 'Spotify theme applied']]));
    o.push(line(tx, 292, [['muted', '    new shells and Ghostty windows follow']]));
    o.push(line(tx, 330, [['ok', 'Done. '], ['textDim', `facet now uses ${name}.`]]));
    o.push(line(tx, 372, [['frame', '┌['], ['secondary', '~'], ['frame', ']']]));
    o.push(line(tx, 396, [['frame', '└─'], ['primary', '❯ ']]));
    o.push(`<rect x="${tx + 40}" y="383" width="9" height="17" class="f-secondary"/>`);
    o.push(`</g>`);
  });
  // One square per theme, the marker on the current one
  themes.forEach((t, i) => o.push(`<rect x="${tx + i * 30}" y="452" width="18" height="18" fill="${t.colors.primary}"/>`));
  // Own group: one element can only run one animation, and the marker needs two
  o.push(`<g class="hop"><rect x="${tx - 4}" y="448" width="26" height="26" class="s-text" stroke-width="1.5"/></g>`);
  themes.forEach((t, i) => o.push(`<text x="${tx + n * 30 + 10}" y="466" class="cmd${i} f-muted">${esc(t.id)} · ${esc(t.description)}</text>`));

  // Small desktop on the right
  const dx = 520, dy = 52, dw = 720, dh = 456;
  o.push(`<rect x="${dx}" y="${dy}" width="${dw}" height="${dh}" fill="url(#glow)"/>`);
  o.push(`<rect x="${dx}" y="${dy}" width="${dw}" height="${dh}" class="s-surface2" stroke-width="1"/>`);
  // Bar
  o.push(`<rect x="${dx + 10}" y="${dy + 10}" width="${dw - 20}" height="30" class="f-bg"/><rect x="${dx + 10}" y="${dy + 10}" width="${dw - 20}" height="30" class="s-surface2" stroke-width="1.2"/>`);
  for (let k = 0; k < 5; k++) o.push(`<rect x="${dx + 22 + k * 22}" y="${dy + 17}" width="16" height="16" class="${k === 0 ? 'f-primary' : 'f-surface2'}"/>`);
  o.push(`<text x="${dx + dw / 2}" y="${dy + 30}" text-anchor="middle" class="f-text">09:41 <tspan class="f-muted">mon 19 oct</tspan></text>`);
  o.push(line(dx + dw - 130, dy + 30, [['frame', '['], ['muted', 'cpu '], ['textDim', '12%'], ['frame', ']─['], ['muted', 'de'], ['frame', ']']]));
  // Terminal window with a fastfetch-like block
  const wx = dx + 10, wy = dy + 58;
  o.push(`<rect x="${wx}" y="${wy}" width="330" height="378" class="f-bg" fill-opacity="0.85"/>` + frame(wx, wy, 330, 378, 'ghostty', 'primary'));
  o.push(`<rect x="${wx + 16}" y="${wy + 26}" width="92" height="92" class="s-frame" stroke-dasharray="4 3"/>`);
  o.push(`<text x="${wx + 62}" y="${wy + 76}" text-anchor="middle" class="f-muted" style="font-size:11px">logo.png</text>`);
  const kv = [['os', 'CachyOS'], ['wm', 'Hyprland'], ['shell', 'fish'], ['term', 'ghostty']];
  o.push(line(wx + 124, wy + 40, [['secondary', 'vxnsin'], ['muted', '@'], ['primary', 'facet']]));
  kv.forEach(([k, v], j) => o.push(line(wx + 124, wy + 64 + j * 20, [['primary', k.padEnd(7)], ['textDim', v]])));
  themes.forEach((t, i) => o.push(line(wx + 124, wy + 144, [['primary', 'theme  '], ['textDim', t.id]], `cmd${i}`)));
  ['danger', 'ok', 'warn', 'primary', 'accent', 'secondary'].forEach((r, j) => o.push(`<rect x="${wx + 16 + j * 22}" y="${wy + 170}" width="16" height="16" class="f-${r}"/>`));
  o.push(line(wx + 16, wy + 228, [['frame', '┌['], ['secondary', '~'], ['frame', ']']]));
  o.push(line(wx + 16, wy + 250, [['frame', '└─'], ['primary', '❯ '], ['text', 'nvim notes.md']]));
  // Control center
  const cx = dx + 356, cy = dy + 58;
  o.push(`<rect x="${cx}" y="${cy}" width="354" height="206" class="f-bg" fill-opacity="0.92"/>` + frame(cx, cy, 354, 206, 'control', 'primary'));
  [['wi-fi', 1], ['silent', 0], ['game', 1]].forEach(([label, on], j) => {
    const x = cx + 16 + j * 110;
    if (on) o.push(`<rect x="${x}" y="${cy + 24}" width="100" height="34" class="f-primary" fill-opacity="0.16"/>`);
    o.push(`<rect x="${x}" y="${cy + 24}" width="100" height="34" class="s-${on ? 'primary' : 'surface2'}" stroke-width="1.2"/>`);
    o.push(`<text x="${x + 12}" y="${cy + 46}" class="f-${on ? 'text' : 'muted'}">${label}</text>`);
  });
  [['music', 48, false], ['chat', 70, true], ['game', 62, false]].forEach(([label, v, muted], j) => {
    const y = cy + 92 + j * 34;
    o.push(`<text x="${cx + 16}" y="${y}" class="f-muted">${label}</text>`);
    o.push(`<rect x="${cx + 92}" y="${y - 7}" width="190" height="5" class="f-surface2"/>`);
    o.push(`<rect x="${cx + 92}" y="${y - 7}" width="${190 * v / 100}" height="5" class="f-${muted ? 'frame' : 'secondary'}"/>`);
    o.push(`<text x="${cx + 338}" y="${y}" text-anchor="end" class="f-${muted ? 'danger' : 'textDim'}">${muted ? 'muted' : v + '%'}</text>`);
  });
  // Incoming call
  const nx = cx, ny = cy + 226;
  o.push(`<rect x="${nx}" y="${ny}" width="354" height="92" class="f-bg"/>` + frame(nx, ny, 354, 92, 'discord · call', 'accent'));
  o.push(`<rect x="${nx + 16}" y="${ny + 22}" width="38" height="38" class="f-accent"/><text x="${nx + 35}" y="${ny + 47}" text-anchor="middle" class="f-bg b">M</text>`);
  o.push(`<text x="${nx + 68}" y="${ny + 36}" class="f-text b">mira is calling</text><text x="${nx + 68}" y="${ny + 56}" class="f-textDim">direct call · ringing</text>`);
  o.push(`<rect x="${nx + 68}" y="${ny + 66}" width="66" height="20" class="s-ok"/><text x="${nx + 101}" y="${ny + 81}" text-anchor="middle" class="f-ok" style="font-size:13px">accept</text>`);
  o.push(`<rect x="${nx + 142}" y="${ny + 66}" width="70" height="20" class="s-danger"/><text x="${nx + 177}" y="${ny + 81}" text-anchor="middle" class="f-danger" style="font-size:13px">decline</text>`);
  // OSD
  const ox = cx + 52, oy = dy + dh - 64;
  o.push(`<rect x="${ox}" y="${oy}" width="250" height="40" class="f-bg"/>` + frame(ox, oy, 250, 40, 'goxlr · music', 'primary'));
  o.push(`<rect x="${ox + 16}" y="${oy + 21}" width="170" height="5" class="f-surface2"/><rect x="${ox + 16}" y="${oy + 21}" width="105" height="5" class="f-secondary"/>`);
  o.push(`<text x="${ox + 234}" y="${oy + 28}" text-anchor="end" class="f-text">62%</text>`);

  o.push(`</g></svg>`);
  return o.join('\n') + '\n';
}

// ── Install run ──────────────────────────────────────────────
// Output of a simulated `facet install` on a fresh CachyOS home, shortened

function installSvg() {
  const c = themes[0].colors;
  const lines = [
    [['frame', '┌['], ['secondary', '~'], ['frame', ']']],
    [['frame', '└─'], ['primary', '❯ '], ['text', 'curl -fsSL https://facet-shell.github.io/install.sh | bash']],
    [],
    [['primary', '  facet  '], ['muted', 'CachyOS · Hyprland']],
    [['muted', '  Packages: ghostty fish starship fastfetch spicetify vencord quickshell hypr wallpaper tui gtk zed dolphin zen']],
    [['text', '  Install and link these? [Y/n] y']],
    [['primary', '● '], ['text', 'Dependencies']],
    [['muted', '  Missing: stow ghostty starship chafa spicetify-cli vesktop quickshell zed dolphin zen-browser-bin …']],
    [['primary', '● '], ['text', 'Theme']],
    [['text', '  Which theme? (switch any time: facet theme set <name>)']],
    [['primary', '    1 '], ['text', 'periwinkle  '], ['muted', 'blue-violet   '], ['primary', '2 '], ['text', 'ember  '], ['muted', 'orange   '], ['primary', '3 '], ['text', 'lagoon  '], ['muted', 'teal   …']],
    [['text', '  Pick 1-6 [1] 1']],
    [['ok', '  ✓ '], ['text', 'Theme Periwinkle: 13 color files, 13 rewritten']],
    [['primary', '● '], ['text', 'quickshell']],
    [['ok', '  ✓ '], ['text', 'Config linked']],
    [['warn', '  ! '], ['text', 'Other notification daemons found: mako']],
    [['text', '  Turn them off? [Y/n] y']],
    [['ok', '  ✓ '], ['text', 'Turned off: mako (facet restore brings them back)']],
    [['primary', '● '], ['text', 'hypr']],
    [['ok', '  ✓ '], ['text', 'Added to hyprland.lua: require("frame/shell")']],
    [['primary', '● '], ['text', 'facet command']],
    [['ok', '  ✓ '], ['text', 'facet is now available as a command (~/.local/bin/facet)']],
    [],
    [['ok', 'Done. '], ['text', 'Open a new terminal to see the changes.']]
  ];
  const W = 1280, lh = 21, top = 70, H = top + lines.length * lh + 44, loop = 14, end = 92;
  // Section headings take a little longer, like the real run
  const shown = [];
  let t = 0.6;
  for (const l of lines) {
    shown.push(t);
    t += l.length === 0 ? 0.1 : l[0][1].startsWith('●') ? 0.55 : 0.32;
  }
  let css = `text{font-family:${font};font-size:14px;white-space:pre}`;
  shown.forEach((s, i) => {
    const p = s / loop * 100;
    css += `@keyframes l${i}{0%,${(p - 0.01).toFixed(2)}%{opacity:0}${p.toFixed(2)}%,${end}%{opacity:1}${end + 1}%,100%{opacity:0}}.l${i}{opacity:0;animation:l${i} ${loop}s infinite}`;
  });
  const o = [];
  o.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t">`);
  o.push(`<title id="t">facet install on a fresh CachyOS</title><style>${css}</style>`);
  o.push(`<clipPath id="card"><rect width="${W}" height="${H}" rx="22"/></clipPath><g clip-path="url(#card)">`);
  o.push(`<rect width="${W}" height="${H}" fill="${c.bg}"/>`);
  o.push(`<rect x="28" y="28" width="${W - 56}" height="${H - 56}" fill="none" stroke="${c.surface2}" stroke-width="1.5"/>`);
  o.push(`<rect x="44" y="20" width="96" height="16" fill="${c.bg}"/><text x="52" y="33" fill="${c.primary}">ghostty</text>`);
  lines.forEach((l, i) => {
    if (!l.length) return;
    o.push(`<text x="48" y="${top + i * lh}" class="l${i}">` + l.map(([r, s]) => `<tspan fill="${c[r]}">${esc(s)}</tspan>`).join('') + `</text>`);
  });
  o.push(`</g></svg>`);
  return o.join('\n') + '\n';
}

const out = { 'banner.svg': bannerSvg(), 'styles.svg': stylesSvg(), 'themes.svg': themesSvg(), 'install.svg': installSvg() };
for (const [name, svg] of Object.entries(out)) fs.writeFileSync(path.join(root, '.github', name), svg);
console.log('wrote .github/' + Object.keys(out).join(', .github/'));
