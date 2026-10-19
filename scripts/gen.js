// Builds the animated SVG panels for the Leukode Labs GitHub profile, in the style of leukodelabs.vercel.app.
// Run: node scripts/gen.js   (self-contained SVGs: GitHub shows them as <img>, so no external fonts or images)
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'assets');
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) if (f.endsWith('.svg')) fs.unlinkSync(path.join(OUT, f));

// the website's palette
const C = {
  bg: '#050B14', card: '#0A1628', card2: '#0D1B30', line: 'rgba(255,255,255,.10)', line2: 'rgba(255,255,255,.16)',
  blue: '#00A8FF', sky: '#38BDF8', white: '#FFFFFF', gray: '#D1D5DB', muted: '#9CA3AF', dim: '#6B7280',
  light: '#F9FAFB', navy: '#050B14', slate: '#243B53'
};
const SANS = "Inter,'Segoe UI',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif";
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const spin = (cx, cy, dur, rev) => `<animateTransform attributeName="transform" type="rotate" from="${rev ? 360 : 0} ${cx} ${cy}" to="${rev ? 0 : 360} ${cx} ${cy}" dur="${dur}s" repeatCount="indefinite"/>`;

const svg = (w, h, body, { bg = C.bg, css = '', defs = '' } = {}) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">
<defs>
  <linearGradient id="brand" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.blue}"/><stop offset="1" stop-color="${C.sky}"/></linearGradient>
  <linearGradient id="brandd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.blue}"/><stop offset="1" stop-color="${C.sky}"/></linearGradient>
  <linearGradient id="cardG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#243B53"/><stop offset="1" stop-color="${C.card}"/></linearGradient>
  <radialGradient id="glow"><stop offset="0" stop-color="${C.blue}" stop-opacity=".35"/><stop offset="1" stop-color="${C.blue}" stop-opacity="0"/></radialGradient>
  <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" stroke="rgba(0,168,255,.07)"/></pattern>
  <clipPath id="frame"><rect width="${w}" height="${h}" rx="8"/></clipPath>
  ${defs}
</defs>
<style>
  text{font-family:${SANS}}
  .w{fill:${C.white}} .g{fill:${C.gray}} .m{fill:${C.muted}} .b{fill:${C.blue}} .n{fill:${C.navy}} .s{fill:${C.slate}}
  .cap{font-size:13px;font-weight:600;letter-spacing:.6px;text-transform:uppercase}
  @keyframes rise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
  @keyframes fade{from{opacity:0}to{opacity:1}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
  @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
  .r{animation:rise .8s cubic-bezier(.2,.8,.2,1) both}
  .f{animation:fade 1s ease both}
  ${css}
  @media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<g clip-path="url(#frame)">
<rect width="${w}" height="${h}" fill="${bg}"/>
${body}
</g>
</svg>`;

// boxed section tag, like "What We Deliver" on the site
const tag = (x, y, txt, { center = false, light = false, delay = 0 } = {}) => {
  const w = 26 + txt.length * 7.2, x0 = center ? x - w / 2 : x;
  return `<g class="r" style="animation-delay:${delay}s"><rect x="${x0}" y="${y}" width="${w}" height="28" rx="3" fill="${light ? 'rgba(0,168,255,.08)' : 'rgba(0,168,255,.10)'}" stroke="rgba(0,168,255,.35)"/>
  <text x="${x0 + w / 2}" y="${y + 18.5}" font-size="12.5" font-weight="500" text-anchor="middle" class="b">${esc(txt)}</text></g>`;
};
// chip with a blue dot, like the service bullets
const chip = (x, y, txt, light) => {
  const w = 30 + txt.length * 6.7;
  return { w, svg: `<g transform="translate(${x} ${y})"><rect width="${w}" height="28" rx="2" fill="${light ? '#fff' : 'rgba(255,255,255,.02)'}" stroke="${light ? '#D9E2EC' : C.line2}"/><circle cx="13" cy="14" r="2.5" fill="${C.blue}"/><text x="22" y="18.5" font-size="12" class="${light ? 's' : 'g'}">${esc(txt)}</text></g>` };
};
const chips = (x, y, list, light) => { let cx = x; return list.map(t => { const c = chip(cx, y, t, light); cx += c.w + 8; return c.svg; }).join(''); };
const btn = (x, y, txt, solid, w = 0) => {
  w = w || 40 + txt.length * 8.4;
  return `<g transform="translate(${x} ${y})">${solid
    ? `<rect width="${w}" height="44" rx="2" fill="${C.blue}"/><rect width="${w}" height="44" rx="2" fill="url(#shine)"/>`
    : `<rect width="${w}" height="44" rx="2" fill="rgba(255,255,255,.02)" stroke="rgba(255,255,255,.35)"/>`}
    <text x="${w / 2}" y="27.5" font-size="14.5" font-weight="600" text-anchor="middle" class="${solid ? 'n' : 'w'}">${esc(txt)}</text></g>`;
};
const shineDef = `<linearGradient id="shine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/><animateTransform attributeName="gradientTransform" type="translate" values="-1.2 0;1.2 0" dur="3.4s" repeatCount="indefinite"/></linearGradient>`;

// the Leukode mark: ring open on the right, disc with "L", three circuit traces with nodes
const logo = (cx, cy, s, live) => {
  const k = s / 100, P = (x, y) => `${(cx + (x - 70) * k).toFixed(1)} ${(cy + (y - 80) * k).toFixed(1)}`;
  const traces = [`M${P(118, 56)} L${P(140, 56)} L${P(152, 44)} L${P(166, 44)}`, `M${P(124, 80)} L${P(176, 80)}`, `M${P(118, 104)} L${P(140, 104)} L${P(152, 116)} L${P(166, 116)}`];
  return `<circle cx="${cx}" cy="${cy}" r="${66 * k}" stroke="#1E63B8" stroke-width="${12 * k}" stroke-dasharray="${330 * k} ${85 * k}" stroke-linecap="round" transform="rotate(35 ${cx} ${cy})"/>
  <circle cx="${cx}" cy="${cy}" r="${46 * k}" fill="url(#disc)"/>
  <path d="M${P(56, 54)} L${P(66, 54)} L${P(66, 98)} L${P(90, 98)} L${P(90, 108)} L${P(56, 108)} Z" fill="#DCEBFA"/>
  ${traces.map((d, i) => `<path d="${d}" stroke="#1E63B8" stroke-width="${9 * k}" stroke-linecap="round" stroke-linejoin="round"${live ? ` stroke-dasharray="${120 * k}" style="animation:draw 1.2s ${.6 + i * .2}s cubic-bezier(.6,0,.2,1) both"` : ''}/>`).join('')}
  ${[[174, 44], [184, 80], [174, 116]].map(([x, y]) => { const [a, b] = P(x, y).split(' '); return `<circle cx="${a}" cy="${b}" r="${8 * k}" stroke="#1E63B8" stroke-width="${6 * k}" fill="${C.bg}"/>`; }).join('')}`;
};
const discDef = `<linearGradient id="disc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2B83E0"/><stop offset="1" stop-color="#0D3F8F"/></linearGradient>`;

const navBar = (w) => `
  <g class="f">
    ${logo(44, 42, 15, true)}
    <text x="74" y="49" font-size="18" font-weight="700" class="w">Leukode Labs</text>
    ${[['About', 596], ['Services', 678], ['Site Check', 786], ['Pages', 908]].map(([t, x]) => `<text x="${x - 1200 + w}" y="47" class="cap g">${t}</text>`).join('')}
    <path d="M${w - 236} 41 l4 4 l4 -4" stroke="${C.gray}" stroke-width="1.6" fill="none"/>
    <line x1="${w - 190}" y1="28" x2="${w - 190}" y2="56" stroke="${C.line}"/>
    <g transform="translate(${w - 160} 22)"><rect width="128" height="40" rx="2" fill="${C.blue}"/><rect width="128" height="40" rx="2" fill="url(#shine)"/><text x="64" y="25" text-anchor="middle" class="cap n" font-size="12.5">Book a call</text></g>
  </g>`;

/* ===================================================================== HERO */
{
  const W = 1200, H = 640, vx = 600, vy = 300;
  // warp streaks radiating from a vanishing point, like the site's hero backdrop
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const streaks = Array.from({ length: 90 }, (_, i) => {
    const a = rnd() * Math.PI * 2, r0 = 40 + rnd() * 120, r1 = r0 + 160 + rnd() * 520;
    const x0 = vx + Math.cos(a) * r0, y0 = vy + Math.sin(a) * r0 * .62, x1 = vx + Math.cos(a) * r1, y1 = vy + Math.sin(a) * r1 * .62;
    const len = Math.hypot(x1 - x0, y1 - y0), dash = 30 + rnd() * 90, dur = (1.6 + rnd() * 2.6).toFixed(2), op = (.14 + rnd() * .34).toFixed(2);
    return `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="${i % 7 === 0 ? C.blue : '#8FA8C8'}" stroke-opacity="${op}" stroke-width="${(.8 + rnd() * 1.4).toFixed(1)}" stroke-dasharray="${dash.toFixed(0)} ${len.toFixed(0)}" stroke-linecap="round">
      <animate attributeName="stroke-dashoffset" from="${dash.toFixed(0)}" to="${(-len).toFixed(0)}" dur="${dur}s" begin="-${(rnd() * 3).toFixed(2)}s" repeatCount="indefinite"/></line>`;
  }).join('');
  const lines = [['Engineering', 'w'], ['comfort', 'w'], ['through ', 'w', 'intelligent'], ['digital systems', 'blue']];
  const body = `
  ${streaks}
  <rect width="${W}" height="${H}" fill="url(#vig)"/>
  <rect width="${W}" height="${H}" fill="url(#shade)"/>
  ${navBar(W)}
  <line x1="0" y1="84" x2="${W}" y2="84" stroke="${C.line}"/>
  ${lines.map(([a, cls, b], i) => `<text x="240" y="${196 + i * 82}" font-size="76" font-weight="700" letter-spacing="-1.6" class="r" style="animation-delay:${.25 + i * .14}s">${cls === 'blue' ? `<tspan fill="url(#brand)">${a}</tspan>` : `<tspan class="w">${a}</tspan>`}${b ? `<tspan fill="url(#brand)">${b}</tspan>` : ''}</text>`).join('')}
  <g class="r" style="animation-delay:.9s">${btn(452, 540, 'Book a Call', true, 136)}${btn(604, 540, 'View Our Work', false, 152)}</g>`;
  fs.writeFileSync(path.join(OUT, 'hero.svg'), svg(W, H, body, {
    css: '@keyframes draw{from{stroke-dashoffset:' + (120 * .15).toFixed(1) + '}to{stroke-dashoffset:0}}',
    defs: shineDef + discDef + `<radialGradient id="vig" cx=".5" cy=".47" r=".7"><stop offset="0" stop-color="${C.bg}" stop-opacity=".2"/><stop offset=".55" stop-color="${C.bg}" stop-opacity=".55"/><stop offset="1" stop-color="${C.bg}" stop-opacity=".95"/></radialGradient>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.bg}" stop-opacity=".85"/><stop offset=".25" stop-color="${C.bg}" stop-opacity=".2"/><stop offset=".8" stop-color="${C.bg}" stop-opacity=".2"/><stop offset="1" stop-color="${C.bg}"/></linearGradient>`
  }));
}

/* ===================================================================== INTRO (light section) */
{
  const W = 1200, H = 520;
  // abstract product mosaic on the right: dashboards and phones, gently floating
  const tile = (x, y, w, h, dark, inner, d) => `<g style="animation:float 7s ${d}s ease-in-out infinite"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${dark ? '#2B2F36' : '#FFFFFF'}" stroke="${dark ? '#3A3F47' : '#E5E9F0'}"/>${inner}</g>`;
  const dash = (x, y, w) => `<rect x="${x + 14}" y="${y + 14}" width="${w * .3}" height="7" rx="2" fill="#C9D3E0"/><rect x="${x + 14}" y="${y + 30}" width="${w * .18}" height="20" rx="3" fill="#E8EEF6"/><rect x="${x + 14 + w * .22}" y="${y + 30}" width="${w * .18}" height="20" rx="3" fill="#E8EEF6"/><rect x="${x + 14 + w * .44}" y="${y + 30}" width="${w * .18}" height="20" rx="3" fill="#E8EEF6"/><circle cx="${x + w * .28}" cy="${y + 92}" r="22" stroke="#C3B5FF" stroke-width="7"/><path d="M${x + w * .5} ${y + 112} q20 -30 40 -12 t40 -18" stroke="#8FB8FF" stroke-width="3"/>`;
  const card = (x, y, w, h) => `<text x="${x + 18}" y="${y + 34}" font-size="13" font-weight="700" fill="#F2F2F2">Weekly</text><text x="${x + 18}" y="${y + 50}" font-size="13" font-weight="700" fill="#F2F2F2">Revenue</text><rect x="${x + w * .42}" y="${y + h * .25}" width="${w * .16}" height="${h * .5}" rx="4" fill="#111"/><circle cx="${x + w * .78}" cy="${y + h * .45}" r="${h * .14}" stroke="#FF7A2F" stroke-width="5"/><rect x="${x + 18}" y="${y + h - 26}" width="40" height="5" rx="2" fill="#FF7A2F"/>`;
  const phone = (x, y) => `<rect x="${x}" y="${y}" width="66" height="134" rx="12" fill="#1B1E23" stroke="#4A4F57" stroke-width="2"/><rect x="${x + 7}" y="${y + 16}" width="52" height="30" rx="5" fill="#8BE3CF"/><rect x="${x + 7}" y="${y + 52}" width="24" height="20" rx="4" fill="#3A3F47"/><rect x="${x + 35}" y="${y + 52}" width="24" height="20" rx="4" fill="#3A3F47"/><rect x="${x + 7}" y="${y + 78}" width="52" height="16" rx="4" fill="#2E333B"/><rect x="${x + 7}" y="${y + 100}" width="52" height="16" rx="4" fill="#2E333B"/>`;
  const mx = 640, my = 0;
  const body = `
  <g class="r" style="animation-delay:.1s">
    <text x="64" y="166" font-size="44" font-weight="700" letter-spacing="-1" class="n">Build a powerful,</text>
    <text x="64" y="218" font-size="44" font-weight="700" letter-spacing="-1" fill="url(#brand)">performance-driven</text>
    <text x="64" y="270" font-size="44" font-weight="700" letter-spacing="-1" class="n">digital presence</text>
  </g>
  <g class="r" style="animation-delay:.3s">
    ${['Get intelligent systems that don’t just look good — they’re', 'engineered to deliver measurable results for your business.', 'Automation that works 24/7, analytics that matter, and', 'control that keeps you ahead.'].map((l, i) => `<text x="64" y="${318 + i * 28}" font-size="17.5" class="s">${esc(l)}</text>`).join('')}
  </g>
  <rect x="${mx}" y="${my}" width="${W - mx}" height="${H}" fill="#3A3F47"/>
  ${tile(mx + 10, my + 10, 180, 130, false, dash(mx + 10, my + 10, 180), 0)}
  ${tile(mx + 200, my + 10, 170, 150, true, card(mx + 200, my + 10, 170, 150), 1.2)}
  ${tile(mx + 380, my + 10, 180, 130, false, dash(mx + 380, my + 10, 180), .6)}
  ${tile(mx + 10, my + 150, 180, 160, true, card(mx + 10, my + 150, 180, 160), 2)}
  ${tile(mx + 200, my + 170, 170, 340, true, phone(mx + 252, my + 260), .9)}
  ${tile(mx + 380, my + 150, 180, 160, true, card(mx + 380, my + 150, 180, 160), 1.6)}
  ${tile(mx + 10, my + 320, 180, 190, true, phone(mx + 67, my + 348), 2.4)}
  ${tile(mx + 380, my + 320, 180, 190, true, phone(mx + 437, my + 348), .3)}`;
  fs.writeFileSync(path.join(OUT, 'intro.svg'), svg(W, H, body, { bg: C.light }));
}

/* ===================================================================== WHAT WE DELIVER */
{
  const W = 1200, H = 960;
  const rows = [
    ['Lead Generation Systems', 'Digital presence that converts visitors into qualified leads automatically.', ['High-converting websites', 'Lead capture automation', 'Analytics dashboards'], 'M8 22 L22 8 M12 8h10v10'],
    ['Operational Automation', 'Remove repetitive tasks and streamline workflows with intelligent automation.', ['Social media automation', 'Email workflows', 'Process integration'], 'M9 9a4 4 0 1 1 0 .1M21 21a4 4 0 1 1 0 .1M12 12l6 6'],
    ['Centralized Business Control', 'See and manage everything from one intelligent dashboard.', ['Custom CRM systems', 'Real-time dashboards', 'Data centralization'], 'M6 6h8v8H6zM16 6h8v8h-8zM6 16h8v8H6zM16 16h8v8h-8z'],
    ['Digital Presence That Converts', 'Premium web and mobile experiences that establish authority and drive action.', ['Web applications', 'Mobile apps', 'Brand experiences'], 'M15 5a10 10 0 1 0 .1 0M5 15h20M15 5c4 4 4 16 0 20M15 5c-4 4-4 16 0 20']
  ];
  // isometric block clusters, like the site's illustrations
  const iso = (cx, cy, s, d) => {
    const cube = (x, y, h, top) => `<path d="M${x} ${y} l${s} ${s * .5} l${s} ${-s * .5} l${-s} ${-s * .5}z" fill="${top}"/><path d="M${x} ${y} v${h} l${s} ${s * .5} v${-h}z" fill="#3B4250"/><path d="M${x + s} ${y + s * .5} v${h} l${s} ${-s * .5} v${-h}z" fill="#262C36"/>`;
    return `<g style="animation:float 6s ${d}s ease-in-out infinite">${cube(cx - s, cy, s * .5, '#C9CFD8')}${cube(cx - s * 2.4, cy + s * .7, s * .35, '#AEB6C2')}${cube(cx + s * .4, cy + s * .7, s * .35, '#AEB6C2')}${cube(cx - s, cy + s * 1.4, s * .25, '#9AA3B0')}
      <rect x="${cx - 4}" y="${cy - s * 1.1}" width="8" height="${s * .6}" fill="${C.blue}" opacity=".85"><animate attributeName="opacity" values=".3;1;.3" dur="2.4s" repeatCount="indefinite" begin="${d}s"/></rect></g>`;
  };
  const top = 250, gap = 160;
  const body = `
  <rect width="${W}" height="${H}" fill="url(#grid)" opacity=".6"/>
  <circle cx="${W - 120}" cy="${H - 120}" r="380" fill="url(#glow)" opacity=".5"/>
  ${tag(W / 2, 52, 'What We Deliver', { center: true })}
  <text x="${W / 2}" y="132" font-size="44" font-weight="700" letter-spacing="-1" text-anchor="middle" class="w r" style="animation-delay:.15s">Not what we build,</text>
  <text x="${W / 2}" y="184" font-size="44" font-weight="700" letter-spacing="-1" text-anchor="middle" fill="url(#brand)" class="r" style="animation-delay:.25s">but what you gain</text>
  <text x="${W / 2}" y="222" font-size="17" text-anchor="middle" class="m r" style="animation-delay:.35s">We deliver measurable outcomes that transform how your business operates.</text>
  <line x1="231" y1="${top + 44}" x2="231" y2="${top + gap * 3}" stroke="rgba(0,168,255,.25)" stroke-dasharray="3 5"/>
  <circle cx="231" cy="${top + 44}" r="3" fill="${C.blue}"><animate attributeName="cy" values="${top + 44};${top + gap * 3}" dur="4s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;0" dur="4s" repeatCount="indefinite"/></circle>
  ${rows.map(([t, d, cs, icon], i) => {
    const y = top + i * gap;
    return `<g class="r" style="animation-delay:${.45 + i * .15}s">
      <rect x="212" y="${y}" width="38" height="38" rx="2" fill="rgba(0,168,255,.10)" stroke="rgba(0,168,255,.35)"/>
      <path d="${icon}" transform="translate(216 ${y + 4}) scale(1)" stroke="${C.blue}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="284" y="${y + 28}" font-size="27" font-weight="700" class="w">${esc(t)}</text>
      <text x="284" y="${y + 60}" font-size="16.5" class="m">${esc(d)}</text>
      ${chips(284, y + 80, cs)}
      ${iso(980, y + 44, 34, i * .7)}
    </g>`;
  }).join('')}
  <g class="r" style="animation-delay:1.1s"><rect x="${W / 2 - 92}" y="${H - 72}" width="184" height="40" rx="2" stroke="${C.blue}" stroke-width="1.5"/><text x="${W / 2}" y="${H - 46}" font-size="14.5" font-weight="600" text-anchor="middle" class="b">Explore Our Services  →</text></g>`;
  fs.writeFileSync(path.join(OUT, 'deliver.svg'), svg(W, H, body));
}

/* ===================================================================== PROCESS */
{
  const W = 1200, H = 600;
  const steps = [['01', 'Discovery & Strategy', 'We understand your goals and map the solution'], ['02', 'Design & Build', 'Rapid development with continuous feedback'], ['03', 'Launch & Optimize', 'Go live and refine based on real data']];
  const feats = ['Weekly Updates', 'Direct Access', 'Flexible Scope', 'Post-Launch Support'];
  const cx = 660, cy = 70, cw = 476;
  const body = `
  <rect width="${W}" height="${H}" fill="url(#grid)" opacity=".5"/>
  <g class="r" style="animation-delay:.1s">
    <text x="64" y="140" font-size="42" font-weight="700" letter-spacing="-1" class="w">A process built for</text>
    <text x="64" y="192" font-size="42" font-weight="700" letter-spacing="-1" fill="url(#brand)">rapid execution</text>
  </g>
  <g class="r" style="animation-delay:.25s">
    <text x="64" y="240" font-size="17" class="m">From concept to launch, we move fast without compromising</text>
    <text x="64" y="266" font-size="17" class="m">quality. Your digital systems operational in weeks, not months.</text>
  </g>
  ${steps.map(([n, t, d], i) => `<g class="r" style="animation-delay:${.4 + i * .15}s">
    <rect x="64" y="${312 + i * 88}" width="44" height="44" rx="2" fill="${C.blue}"/>
    <text x="86" y="${340 + i * 88}" font-size="15" font-weight="700" text-anchor="middle" class="n">${n}</text>
    <text x="128" y="${330 + i * 88}" font-size="19" font-weight="700" class="w">${esc(t)}</text>
    <text x="128" y="${354 + i * 88}" font-size="15" class="m">${esc(d)}</text></g>`).join('')}
  <g class="r" style="animation-delay:.3s">
    <rect x="${cx}" y="${cy}" width="${cw}" height="460" rx="4" fill="${C.light}"/>
    <rect x="${cx + 24}" y="${cy + 24}" width="${cw - 48}" height="150" rx="2" fill="${C.card}"/>
    <rect x="${cx + 24}" y="${cy + 24}" width="${cw - 48}" height="150" rx="2" fill="url(#cardSheen)"/>
    <text x="${cx + 52}" y="${cy + 108}" font-size="62" font-weight="800" letter-spacing="-2" fill="url(#brand)">2-4</text>
    <text x="${cx + 168}" y="${cy + 106}" font-size="26" font-weight="600" class="w">weeks</text>
    <text x="${cx + 52}" y="${cy + 144}" font-size="15" class="m">From kickoff to launch</text>
    ${feats.map((f, i) => {
      const x = cx + 24 + (i % 2) * ((cw - 60) / 2 + 12), y = cy + 196 + Math.floor(i / 2) * 92, w = (cw - 60) / 2;
      return `<g style="animation:fade .6s ${.9 + i * .15}s both"><rect x="${x}" y="${y}" width="${w}" height="78" rx="2" fill="#fff" stroke="#E2E8F0"/>
        <rect x="${x + 18}" y="${y + 16}" width="22" height="22" rx="3" stroke="${C.blue}" stroke-width="1.8"/><path d="M${x + 24} ${y + 27} l4 4 l7 -8" stroke="${C.blue}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="${x + 18}" y="${y + 62}" font-size="15" font-weight="600" class="s">${f}</text></g>`;
    }).join('')}
    <rect x="${cx + 24}" y="${cy + 392}" width="${cw - 48}" height="46" rx="2" fill="${C.blue}"/><rect x="${cx + 24}" y="${cy + 392}" width="${cw - 48}" height="46" rx="2" fill="url(#shine)"/>
    <text x="${cx + cw / 2}" y="${cy + 421}" font-size="15" font-weight="600" text-anchor="middle" class="n">Start Your Project  →</text>
  </g>`;
  fs.writeFileSync(path.join(OUT, 'process.svg'), svg(W, H, body, {
    defs: shineDef + `<linearGradient id="cardSheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.blue}" stop-opacity=".18"/><stop offset=".6" stop-color="${C.blue}" stop-opacity="0"/></linearGradient>`
  }));
}

/* ===================================================================== SELECTED WORK: header + flagship */
{
  const W = 1200, H = 640;
  const rows = [['PF-0142', 'Proforma', '1 240 000', 'Envoyée'], ['FA-0381', 'Facture', '860 000', 'Payée'], ['RC-0207', 'Reçu', '860 000', 'Payée'], ['FA-0382', 'Facture', '2 150 000', 'En attente'], ['FA-0383', 'Facture', '475 000', 'Payée']];
  const wx = 600, wy = 226, ww = 536, wh = 360;
  const body = `
  <rect width="${W}" height="${H}" fill="url(#grid)" opacity=".5"/>
  ${tag(W / 2, 46, 'Selected Work', { center: true })}
  <text x="${W / 2}" y="122" font-size="42" font-weight="700" letter-spacing="-1" text-anchor="middle" class="w r" style="animation-delay:.15s">Execution quality</text>
  <text x="${W / 2}" y="170" font-size="42" font-weight="700" letter-spacing="-1" text-anchor="middle" fill="url(#brand)" class="r" style="animation-delay:.25s">speaks for itself</text>
  <g class="r" style="animation-delay:.4s">
    <rect x="64" y="${wy - 16}" width="${W - 128}" height="${wh + 40}" rx="4" fill="${C.card}" stroke="${C.line}"/>
    <rect x="88" y="${wy + 8}" width="104" height="24" rx="2" fill="rgba(0,168,255,.12)" stroke="rgba(0,168,255,.35)"/>
    <text x="140" y="${wy + 24.5}" font-size="11.5" font-weight="600" text-anchor="middle" class="b">Flagship product</text>
    <text x="88" y="${wy + 84}" font-size="36" font-weight="700" letter-spacing="-.8" class="w">Maison Stella — Gestion</text>
    ${['Business management for a services company in Bukavu, DR Congo.', 'Proforma invoices, invoices and receipts, payment tracking and', 'follow-up on balances — offline-first on Windows, with automatic', 'cloud backup and self-updating installers.'].map((l, i) => `<text x="88" y="${wy + 124 + i * 26}" font-size="16" class="m">${esc(l)}</text>`).join('')}
    ${chips(88, wy + 244, ['Desktop', 'Offline-first', 'Invoicing'])}
    ${btn(88, wy + 296, 'Download the installer  →', true, 236)}
  </g>
  <g style="animation:fade 1s .6s both">
    <rect x="${wx}" y="${wy}" width="${ww}" height="${wh - 24}" rx="4" fill="#0E1A2E" stroke="${C.line2}"/>
    <rect x="${wx}" y="${wy}" width="${ww}" height="36" rx="4" fill="#12223A"/>
    <circle cx="${wx + 20}" cy="${wy + 18}" r="5" fill="#FF5F57"/><circle cx="${wx + 37}" cy="${wy + 18}" r="5" fill="#FEBC2E"/><circle cx="${wx + 54}" cy="${wy + 18}" r="5" fill="#28C840"/>
    <text x="${wx + ww / 2}" y="${wy + 23}" font-size="12" text-anchor="middle" class="m">Maison Stella — Gestion</text>
    <rect x="${wx}" y="${wy + 36}" width="104" height="${wh - 60}" fill="#0B1526"/>
    ${['Tableau', 'Factures', 'Clients', 'Paiements', 'Rapports'].map((t, i) => `<rect x="${wx + 10}" y="${wy + 50 + i * 36}" width="84" height="26" rx="2" fill="${i === 1 ? 'rgba(0,168,255,.16)' : 'transparent'}"/><text x="${wx + 20}" y="${wy + 67 + i * 36}" font-size="12" fill="${i === 1 ? C.blue : C.muted}">${t}</text>`).join('')}
    <text x="${wx + 124}" y="${wy + 66}" font-size="11" letter-spacing="1.2" class="m">ENCAISSÉ CE MOIS</text>
    <text x="${wx + 124}" y="${wy + 96}" font-size="26" font-weight="800" class="w">5 585 000 <tspan font-size="13" fill="${C.muted}">FC</tspan></text>
    <rect x="${wx + 124}" y="${wy + 108}" width="388" height="4" rx="2" fill="rgba(255,255,255,.08)"/>
    <rect x="${wx + 124}" y="${wy + 108}" width="280" height="4" rx="2" fill="url(#brand)" style="transform-origin:${wx + 124}px 0;animation:bar 1.6s 1s cubic-bezier(.2,.8,.2,1) both"/>
    ${rows.map((r, i) => {
      const y = wy + 146 + i * 34, col = r[3] === 'Payée' ? '#28C840' : r[3] === 'Envoyée' ? C.blue : '#FEBC2E';
      return `<g style="animation:row .5s ${1.2 + i * .22}s cubic-bezier(.2,.8,.2,1) both"><rect x="${wx + 116}" y="${y - 19}" width="404" height="28" rx="2" fill="rgba(255,255,255,.03)"/>
      <text x="${wx + 128}" y="${y}" font-size="12" class="w">${r[0]}</text><text x="${wx + 210}" y="${y}" font-size="12" class="m">${r[1]}</text>
      <text x="${wx + 400}" y="${y}" font-size="12" text-anchor="end" class="w">${r[2]}</text>
      <rect x="${wx + 418}" y="${y - 14}" width="90" height="19" rx="2" fill="${col}" fill-opacity=".14"/><text x="${wx + 463}" y="${y - .5}" font-size="10.5" font-weight="600" text-anchor="middle" fill="${col}">${r[3]}</text></g>`;
    }).join('')}
  </g>`;
  fs.writeFileSync(path.join(OUT, 'work.svg'), svg(W, H, body, {
    css: '@keyframes bar{from{transform:scaleX(0)}to{transform:scaleX(1)}} @keyframes row{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:none}}',
    defs: shineDef
  }));
}

/* ===================================================================== PROJECT CARDS (site card style) */
const projects = [
  ['system-commander', 'AI Tool', 'System Commander', 'AI control for your computer: files, terminal, processes and code.', ['TypeScript', 'MCP', 'AI'], 'term'],
  ['codination', 'Community Platform', 'CodiNation', 'A home for builders working with code, design and AI.', ['TypeScript', 'Community', 'Web'], 'feed'],
  ['fluxcast', 'Developer Service', 'fluxcast domains', 'Free yourname.fluxcast.dev subdomains for developers.', ['Python', 'DNS', 'Open source'], 'dns'],
  ['spill', 'Web App', 'spill.', 'NGL-style anonymous messages that roast the sender, in 4 languages.', ['HTML', 'i18n', 'Social'], 'chat']
];
const thumb = (kind, w, h) => {
  const box = (x, y, ww, hh, f = '#16263F') => `<rect x="${x}" y="${y}" width="${ww}" height="${hh}" rx="3" fill="${f}"/>`;
  if (kind === 'term') return `${box(24, 22, w - 48, h - 44, '#0B1220')}<circle cx="40" cy="38" r="4" fill="#FF5F57"/><circle cx="54" cy="38" r="4" fill="#FEBC2E"/><circle cx="68" cy="38" r="4" fill="#28C840"/>
    ${['$ commander list --processes', '✓ 142 processes', '$ commander open ./src', '✓ workspace ready'].map((t, i) => `<text x="40" y="${66 + i * 21}" font-size="12.5" font-family="Consolas,monospace" fill="${i % 2 ? C.blue : C.gray}" style="animation:fade .3s ${.4 + i * .5}s both">${esc(t)}</text>`).join('')}<rect x="40" y="154" width="8" height="14" fill="${C.blue}" style="animation:pulse 1s steps(1) infinite"/>`;
  if (kind === 'feed') return [0, 1, 2].map(i => `<g style="animation:float 6s ${i}s ease-in-out infinite">${box(24 + i * ((w - 48) / 3 + 0), 26, (w - 48) / 3 - 10, h - 52)}<circle cx="${44 + i * (w - 48) / 3}" cy="48" r="9" fill="${C.blue}" opacity=".7"/><rect x="${60 + i * (w - 48) / 3}" y="43" width="60" height="7" rx="2" fill="#2A3D5A"/><rect x="${34 + i * (w - 48) / 3}" y="70" width="${(w - 48) / 3 - 30}" height="56" rx="3" fill="#1D3150"/><rect x="${34 + i * (w - 48) / 3}" y="136" width="70" height="7" rx="2" fill="#2A3D5A"/></g>`).join('');
  if (kind === 'dns') return `${box(24, 30, w - 48, 40)}<text x="40" y="56" font-size="14" font-family="Consolas,monospace" fill="${C.gray}">https://<tspan fill="${C.blue}">yourname</tspan>.fluxcast.dev</text>
    ${[0, 1, 2].map(i => `<g style="animation:fade .4s ${.6 + i * .4}s both">${box(24 + i * 176, 90, 164, 74)}<circle cx="${44 + i * 176}" cy="112" r="5" fill="#28C840"/><rect x="${56 + i * 176}" y="108" width="80" height="7" rx="2" fill="#2A3D5A"/><rect x="${40 + i * 176}" y="130" width="120" height="6" rx="2" fill="#1D3150"/><rect x="${40 + i * 176}" y="144" width="90" height="6" rx="2" fill="#1D3150"/></g>`).join('')}`;
  return `${['Who sent this?', 'lol, nobody', 'nice try, bestie'].map((t, i) => `<g style="animation:rise .5s ${.4 + i * .5}s both"><rect x="${i % 2 ? w - 240 : 36}" y="${30 + i * 46}" width="204" height="36" rx="18" fill="${i % 2 ? C.blue : '#16263F'}"/><text x="${(i % 2 ? w - 240 : 36) + 18}" y="${53 + i * 46}" font-size="13.5" fill="${i % 2 ? C.navy : C.gray}">${esc(t)}</text></g>`).join('')}`;
};
projects.forEach(([file, type, name, desc, cs, kind], i) => {
  const W = 580, H = 372, TH = 190;
  const body = `
  <rect width="${W}" height="${H}" fill="${C.card}"/>
  <rect width="${W}" height="${TH}" fill="url(#cardG)"/>
  <g>${thumb(kind, W, TH)}</g>
  <rect x="28" y="${TH + 22}" width="${18 + type.length * 7}" height="24" rx="2" fill="rgba(0,168,255,.10)" stroke="rgba(0,168,255,.35)"/>
  <text x="37" y="${TH + 38.5}" font-size="11.5" font-weight="600" class="b">${esc(type)}</text>
  <text x="28" y="${TH + 84}" font-size="25" font-weight="700" class="w">${esc(name)}</text>
  <text x="28" y="${TH + 114}" font-size="15" class="m">${esc(desc)}</text>
  ${(() => { let x = 28; return cs.map(c => { const g = `<g transform="translate(${x} ${TH + 136})">`; x += 24 + c.length * 7.4; return g; }); })().map((g, j) => { const c = cs[j]; return `${g}<rect width="${16 + c.length * 7.4}" height="24" rx="2" fill="#16263F"/><text x="8" y="16.5" font-size="12" class="g">${esc(c)}</text></g>`; }).join('')}
  <text x="${W - 28}" y="${TH + 153}" font-size="14" font-weight="600" text-anchor="end" class="b">View repository ↗</text>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="7.5" stroke="${C.line}"/>`;
  fs.writeFileSync(path.join(OUT, `project-${file}.svg`), svg(W, H, body));
});

/* ===================================================================== BUILD ONCE / STATS */
{
  const W = 1200, H = 470;
  const stats = [['2+', 'Years'], ['10+', 'Projects'], ['100%', 'Satisfied']];
  const icons = ['M10 22 L22 10 M14 10h8v8', 'M17 6 L10 18h7l-2 8 9 -13h-7z', 'M8 22l6-6 4 4 8-8M20 12h6v6'];
  const body = `
  <rect width="${W}" height="${H}" fill="url(#bandG)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)" opacity=".5"/>
  <text x="${W / 2}" y="140" font-size="74" font-weight="700" letter-spacing="-2" text-anchor="middle" class="w r" style="animation-delay:.1s">Build Once.</text>
  <text x="${W / 2}" y="222" font-size="74" font-weight="700" letter-spacing="-2" text-anchor="middle" fill="url(#brand)" class="r" style="animation-delay:.25s">Scale Forever.</text>
  <text x="${W / 2}" y="272" font-size="22" text-anchor="middle" class="m r" style="animation-delay:.4s">Automation that grows with you.</text>
  ${stats.map(([n, l], i) => {
    const x = 300 + i * 300;
    return `<g class="r" style="animation-delay:${.55 + i * .15}s">
      <rect x="${x - 19}" y="314" width="38" height="38" rx="3" fill="rgba(0,168,255,.10)" stroke="rgba(0,168,255,.35)"/>
      <path d="${icons[i]}" transform="translate(${x - 16} 317)" stroke="${C.blue}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="${x}" y="408" font-size="44" font-weight="800" text-anchor="middle" fill="url(#brand)">${n}</text>
      <text x="${x}" y="436" font-size="13" class="cap m" text-anchor="middle">${l}</text></g>`;
  }).join('')}`;
  fs.writeFileSync(path.join(OUT, 'scale.svg'), svg(W, H, body, { defs: `<linearGradient id="bandG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0A1628"/><stop offset="1" stop-color="${C.bg}"/></linearGradient>` }));
}

/* ===================================================================== CTA */
{
  const W = 1200, H = 560;
  const checks = ['Free technical audit of your current systems', 'Custom automation strategy worth $2,500', 'Zero-obligation · Cancel anytime'];
  const cx = 720, cy = 120, cw = 416;
  const body = `
  <circle cx="300" cy="${H / 2}" r="460" fill="url(#glow)" opacity=".55"/>
  <rect width="${W}" height="${H}" fill="url(#grid)" opacity=".45"/>
  ${tag(64, 78, '◷  Free 30-Minute Strategy Call')}
  <g class="r" style="animation-delay:.15s">
    <text x="64" y="176" font-size="54" font-weight="700" letter-spacing="-1.4" class="w">Stop Losing</text>
    <text x="64" y="236" font-size="54" font-weight="700" letter-spacing="-1.4" class="w">Money.</text>
    <text x="64" y="296" font-size="54" font-weight="700" letter-spacing="-1.4" fill="url(#brand)">Start Scaling.</text>
  </g>
  <g class="r" style="animation-delay:.3s">
    <text x="64" y="346" font-size="17" class="m">Get a custom roadmap to automate your operations and 10x your</text>
    <text x="64" y="372" font-size="17" class="m">growth. No fluff, no sales pitch — just actionable strategies.</text>
  </g>
  ${checks.map((c, i) => `<g class="r" style="animation-delay:${.45 + i * .12}s"><circle cx="74" cy="${414 + i * 34}" r="9" stroke="${C.blue}" stroke-width="1.6"/><path d="M70 ${414 + i * 34} l3 3 l5 -6" stroke="${C.blue}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><text x="94" y="${419 + i * 34}" font-size="15" class="g">${esc(c)}</text></g>`).join('')}
  <g class="r" style="animation-delay:.4s">
    <rect x="${cx}" y="${cy}" width="${cw}" height="330" rx="4" fill="rgba(10,22,40,.9)" stroke="${C.line2}"/>
    <text x="${cx + 32}" y="${cy + 56}" font-size="25" font-weight="700" class="w">Book Your Free Call</text>
    <text x="${cx + 32}" y="${cy + 90}" font-size="15" class="m">Meet with our technical team to discuss your</text>
    <text x="${cx + 32}" y="${cy + 112}" font-size="15" class="m">specific challenges and opportunities.</text>
    <rect x="${cx + 32}" y="${cy + 140}" width="${cw - 64}" height="50" rx="2" fill="${C.blue}"/><rect x="${cx + 32}" y="${cy + 140}" width="${cw - 64}" height="50" rx="2" fill="url(#shine)"/>
    <text x="${cx + cw / 2}" y="${cy + 171}" font-size="16" font-weight="600" text-anchor="middle" class="n">Schedule Now  →</text>
    <line x1="${cx + 32}" y1="${cy + 222}" x2="${cx + cw - 32}" y2="${cy + 222}" stroke="${C.line}"/>
    ${[['2+', 'Years'], ['10+', 'Projects'], ['100%', 'Satisfied']].map(([n, l], i) => `<text x="${cx + 80 + i * 128}" y="${cy + 270}" font-size="26" font-weight="800" text-anchor="middle" fill="url(#brand)">${n}</text><text x="${cx + 80 + i * 128}" y="${cy + 294}" font-size="12" text-anchor="middle" class="m">${l}</text>`).join('')}
  </g>`;
  fs.writeFileSync(path.join(OUT, 'cta.svg'), svg(W, H, body, { defs: shineDef }));
}

/* ===================================================================== FOOTER */
{
  const W = 1200, H = 460;
  const cols = [['Company', ['About', 'Services', 'Case Studies']], ['Resources', ['Site Check', 'Blog', 'Careers', 'Contact']], ['Legal', ['Privacy Policy', 'Terms of Service']]];
  const body = `
  <rect width="${W}" height="${H}" fill="url(#footG)"/>
  <line x1="0" y1="0" x2="${W}" y2="0" stroke="url(#brand)" stroke-opacity=".5"/>
  <g class="r" style="animation-delay:.1s">
    ${logo(82, 86, 20, false)}
    <text x="118" y="93" font-size="19" font-weight="700" class="w">Leukode Labs</text>
    <text x="64" y="138" font-size="15" class="m">Engineering comfort through intelligent digital</text>
    <text x="64" y="160" font-size="15" class="m">systems that remove operational friction.</text>
    ${[0, 1, 2, 3, 4].map(i => `<rect x="${64 + i * 40}" y="186" width="30" height="30" rx="2" fill="rgba(255,255,255,.04)" stroke="${C.line2}"/>`).join('')}
    <path d="M75 197 l8 8 M83 197 l-8 8" stroke="${C.gray}" stroke-width="1.4"/>
    <rect x="113" y="195" width="13" height="13" rx="4" stroke="${C.gray}" stroke-width="1.4"/><circle cx="119.5" cy="201.5" r="3" stroke="${C.gray}" stroke-width="1.4"/>
    <text x="153" y="207" font-size="12" font-weight="700" class="g">in</text>
    <path d="M195 196 l10 5.5 l-10 5.5z" fill="${C.gray}"/>
    <path d="M233 197h12v10h-12z M233 197 l6 5 l6 -5" stroke="${C.gray}" stroke-width="1.3" fill="none"/>
  </g>
  ${cols.map(([h, ls], i) => `<g class="r" style="animation-delay:${.2 + i * .1}s"><text x="${560 + i * 200}" y="${90}" class="cap w" font-size="12.5">${h}</text>${ls.map((l, j) => `<text x="${560 + i * 200}" y="${124 + j * 28}" font-size="14.5" class="m">${l}</text>`).join('')}</g>`).join('')}
  <text x="40" y="${H - 66}" font-size="210" font-weight="800" letter-spacing="-8" fill="url(#wm)">Leukode</text>
  <text x="868" y="${H - 72}" font-size="15" font-weight="700" letter-spacing="4" fill="${C.blue}" opacity=".7">LABS</text>
  <line x1="0" y1="${H - 48}" x2="${W}" y2="${H - 48}" stroke="${C.line}"/>
  <text x="64" y="${H - 20}" font-size="13" class="m">© ${new Date().getFullYear()} Leukode Labs. All rights reserved.</text>
  <text x="${W - 64}" y="${H - 20}" font-size="13" text-anchor="end" class="m">Engineered for Comfort. Built for Scale.</text>`;
  fs.writeFileSync(path.join(OUT, 'footer.svg'), svg(W, H, body, {
    defs: discDef + `<linearGradient id="footG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0A1628"/><stop offset="1" stop-color="${C.bg}"/></linearGradient>
    <linearGradient id="wm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E3A5F" stop-opacity=".7"/><stop offset="1" stop-color="#1E3A5F" stop-opacity=".05"/></linearGradient>`
  }));
}

console.log(fs.readdirSync(OUT).map(f => f + ' ' + fs.statSync(path.join(OUT, f)).size).join('\n'));
