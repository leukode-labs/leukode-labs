// Builds the animated SVG panels for the Leukode Labs GitHub profile.  Run: node scripts/gen.js
// Everything is self-contained (no external fonts or images) because GitHub shows these as <img>.
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'assets');
fs.mkdirSync(OUT, { recursive: true });

const C = {
  bg: '#070B14', panel: '#0B1220', line: 'rgba(148,180,255,.10)', text: '#EAF2FF', muted: '#8E9BB3',
  blue: '#1AA7FF', blue2: '#4F7BFF', cyan: '#2FE0FF', deep: '#0B5ED7'
};
const SANS = "'Inter','Segoe UI',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',serif";
const MONO = "'JetBrains Mono','Cascadia Code',Consolas,'SFMono-Regular',Menlo,monospace";
const spin = (cx, cy, dur, rev) => `<animateTransform attributeName="transform" type="rotate" from="${rev ? 360 : 0} ${cx} ${cy}" to="${rev ? 0 : 360} ${cx} ${cy}" dur="${dur}s" repeatCount="indefinite"/>`;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// shared frame: rounded dark card with soft glows and a faint grid
const frame = (w, h, inner, { glows = true, extraCss = '' } = {}) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">
<defs>
  <linearGradient id="brand" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.cyan}"/><stop offset=".5" stop-color="${C.blue}"/><stop offset="1" stop-color="${C.blue2}"/></linearGradient>
  <linearGradient id="brandv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.cyan}"/><stop offset="1" stop-color="${C.blue2}"/></linearGradient>
  <radialGradient id="glowA"><stop offset="0" stop-color="${C.blue}" stop-opacity=".55"/><stop offset="1" stop-color="${C.blue}" stop-opacity="0"/></radialGradient>
  <radialGradient id="glowB"><stop offset="0" stop-color="${C.blue2}" stop-opacity=".45"/><stop offset="1" stop-color="${C.blue2}" stop-opacity="0"/></radialGradient>
  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" stroke="${C.line}" stroke-width="1"/></pattern>
  <linearGradient id="fadeY" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <mask id="gridMask"><rect width="${w}" height="${h}" fill="url(#fadeY)"/></mask>
  <clipPath id="card"><rect width="${w}" height="${h}" rx="28"/></clipPath>
</defs>
<style>
  text{font-family:${SANS}}
  .serif{font-family:${SERIF};font-style:italic}
  .mono{font-family:${MONO}}
  .t{fill:${C.text}} .m{fill:${C.muted}}
  @keyframes drift{0%,100%{transform:translate(0,0)}50%{transform:translate(40px,24px)}}
  @keyframes drift2{0%,100%{transform:translate(0,0)}50%{transform:translate(-36px,-20px)}}
  @keyframes rise{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:none}}
  @keyframes fade{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{opacity:.35}50%{opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .ga{animation:drift 14s ease-in-out infinite}
  .gb{animation:drift2 18s ease-in-out infinite}
  .r{animation:rise .9s cubic-bezier(.2,.8,.2,1) both}
  ${extraCss}
  @media (prefers-reduced-motion:reduce){*{animation:none!important;opacity:1!important;transform:none!important}}
</style>
<g clip-path="url(#card)">
  <rect width="${w}" height="${h}" fill="${C.bg}"/>
  ${glows ? `<circle class="ga" cx="${w * .18}" cy="${h * .1}" r="${Math.max(w, h) * .38}" fill="url(#glowA)" opacity=".55"/>
  <circle class="gb" cx="${w * .9}" cy="${h * .95}" r="${Math.max(w, h) * .34}" fill="url(#glowB)" opacity=".5"/>` : ''}
  <rect width="${w}" height="${h}" fill="url(#grid)" mask="url(#gridMask)"/>
  ${inner}
</g>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="27.5" stroke="rgba(148,180,255,.16)"/>
</svg>`;

// section label: "· 01 — WHAT WE DO"
const label = (x, y, n, txt, delay = 0) => `<g class="r" style="animation-delay:${delay}s">
  <circle cx="${x + 5}" cy="${y - 5}" r="4.5" fill="url(#brand)" style="animation:pulse 2.4s ease-in-out infinite"/>
  <text x="${x + 20}" y="${y}" font-size="14" font-weight="600" letter-spacing="3" fill="${C.blue}" class="mono">${n}  —  ${txt}</text></g>`;

// the Leukode mark, redrawn as vector: ring, filled disc with "L", three circuit traces with nodes
const logo = (cx, cy, s, animated) => {
  const k = s / 100; // design space ~ 200x160 centred on the disc
  const P = (x, y) => `${(cx + (x - 70) * k).toFixed(1)} ${(cy + (y - 80) * k).toFixed(1)}`;
  const traces = [
    `M${P(118, 56)} L${P(140, 56)} L${P(152, 44)} L${P(166, 44)}`,
    `M${P(124, 80)} L${P(176, 80)}`,
    `M${P(118, 104)} L${P(140, 104)} L${P(152, 116)} L${P(166, 116)}`
  ];
  const nodes = [[174, 44], [184, 80], [174, 116]];
  return `<g>
    <g><circle cx="${cx}" cy="${cy}" r="${66 * k}" stroke="url(#brandv)" stroke-width="${12 * k}" stroke-dasharray="${330 * k} ${85 * k}" stroke-linecap="round" transform="rotate(35 ${cx} ${cy})"/></g>
    <circle cx="${cx}" cy="${cy}" r="${46 * k}" fill="url(#discG)"/>
    <circle cx="${cx}" cy="${cy}" r="${46 * k}" fill="url(#discShine)"/>
    <path d="M${P(56, 54)} L${P(66, 54)} L${P(66, 98)} L${P(90, 98)} L${P(90, 108)} L${P(56, 108)} Z" fill="#EAF6FF"/>
    ${traces.map((d, i) => `<path d="${d}" stroke="url(#brand)" stroke-width="${9 * k}" stroke-linecap="round" stroke-linejoin="round" ${animated ? `stroke-dasharray="${120 * k}" stroke-dashoffset="${120 * k}" style="animation:draw 1.4s ${1 + i * .25}s cubic-bezier(.6,0,.2,1) forwards"` : ''}/>`).join('')}
    ${nodes.map(([x, y], i) => `<circle cx="${P(x, y).split(' ')[0]}" cy="${P(x, y).split(' ')[1]}" r="${8 * k}" stroke="url(#brand)" stroke-width="${6 * k}" fill="${C.bg}" ${animated ? `style="animation:fade .4s ${2.2 + i * .25}s both, pulse 2.6s ${3 + i * .4}s ease-in-out infinite"` : ''}/>`).join('')}
  </g>`;
};
const logoDefs = `<linearGradient id="discG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.blue}"/><stop offset="1" stop-color="${C.deep}"/></linearGradient>
<radialGradient id="discShine" cx=".3" cy=".25" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></radialGradient>`;
const withDefs = (svg, defs) => svg.replace('<defs>', '<defs>' + defs);

/* ---------------------------------------------------------------- HERO */
{
  const W = 1200, H = 640;
  const words = ['AI systems', 'web platforms', 'mobile apps', 'desktop software', 'automation'];
  const inner = `
  <!-- scanning light -->
  <rect x="0" y="-120" width="${W}" height="120" fill="url(#scan)" style="animation:scan 7s linear infinite"/>
  <!-- nav bar -->
  <g class="r" style="animation-delay:.1s">
    ${logo(70, 54, 20, false)}
    <text x="98" y="60" font-size="17" font-weight="700" letter-spacing="3" class="t">LEUKODE LABS</text>
    ${['Work', 'Services', 'Stack', 'Principles', 'Contact'].map((t, i) => `<text x="${640 + i * 92}" y="60" font-size="15" class="m">${t}</text>`).join('')}
  </g>
  <line x1="40" y1="96" x2="${W - 40}" y2="96" stroke="rgba(148,180,255,.12)"/>

  <!-- copy -->
  <g class="r" style="animation-delay:.35s">
    <rect x="64" y="146" width="360" height="36" rx="18" fill="rgba(26,167,255,.10)" stroke="rgba(26,167,255,.35)"/>
    <circle cx="86" cy="164" r="5" fill="${C.cyan}" style="animation:pulse 1.8s ease-in-out infinite"/>
    <text x="102" y="169" font-size="13" font-weight="600" letter-spacing="2.4" fill="${C.cyan}" class="mono">SOFTWARE STUDIO · KIGALI → GLOBAL</text>
  </g>
  <text x="60" y="282" font-size="84" font-weight="800" letter-spacing="-3" class="t r" style="animation-delay:.5s">Building</text>
  <text x="60" y="372" font-size="84" font-weight="800" letter-spacing="-3" fill="url(#shimmer)" class="r" style="animation-delay:.65s">intelligence</text>
  <text x="62" y="458" font-size="80" class="serif t r" style="animation-delay:.8s">beyond limits.</text>

  <!-- rotating line -->
  <g class="r" style="animation-delay:1.05s">
    <text x="64" y="530" font-size="22" class="m">We design, build and ship</text>
    <clipPath id="wordclip"><rect x="318" y="504" width="320" height="36"/></clipPath>
    <g clip-path="url(#wordclip)"><g style="animation:words 12.5s cubic-bezier(.7,0,.2,1) infinite">
      ${words.concat(words[0]).map((w, i) => `<text x="324" y="${530 + i * 36}" font-size="22" font-weight="700" fill="url(#brand)">${w}</text>`).join('')}
    </g></g>
  </g>

  <!-- mark -->
  <g style="animation:fade 1.2s .4s both">
    <circle cx="930" cy="356" r="190" stroke="rgba(148,180,255,.10)" stroke-dasharray="4 10">${spin(930, 356, 60)}</circle>
    <circle cx="930" cy="356" r="236" stroke="rgba(148,180,255,.07)"/>
    <g>${spin(930, 356, 16)}<circle cx="930" cy="120" r="5" fill="${C.cyan}"/></g>
    <g>${spin(930, 356, 26, true)}<circle cx="1120" cy="356" r="4" fill="${C.blue2}"/></g>
    <circle cx="930" cy="356" r="120" fill="url(#glowA)" opacity=".7"/>
    ${logo(905, 356, 150, true)}
  </g>

  <!-- footer strip -->
  <g class="r" style="animation-delay:1.3s">
    <line x1="40" y1="${H - 54}" x2="${W - 40}" y2="${H - 54}" stroke="rgba(148,180,255,.10)"/>
    ${['Production software', 'AI-native', 'Offline-first', 'Made in Rwanda'].map((t, i) => `<g transform="translate(${64 + i * 285} ${H - 24})"><rect x="0" y="-10" width="6" height="6" rx="1.5" fill="url(#brand)" transform="rotate(45 3 -7)"/><text x="18" y="0" font-size="14" letter-spacing="1" class="m">${t}</text></g>`).join('')}
  </g>`;
  let svg = frame(W, H, inner, {
    extraCss: `
    @keyframes draw{to{stroke-dashoffset:0}}
    @keyframes scan{from{transform:translateY(0)}to{transform:translateY(${H + 240}px)}}
    @keyframes words{0%,16%{transform:translateY(0)}20%,36%{transform:translateY(-36px)}40%,56%{transform:translateY(-72px)}60%,76%{transform:translateY(-108px)}80%,96%{transform:translateY(-144px)}100%{transform:translateY(-180px)}}
    @keyframes sheen{from{transform:translateX(-600px)}to{transform:translateX(900px)}}`
  });
  svg = withDefs(svg, logoDefs + `
  <linearGradient id="scan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.blue}" stop-opacity="0"/><stop offset=".5" stop-color="${C.blue}" stop-opacity=".07"/><stop offset="1" stop-color="${C.blue}" stop-opacity="0"/></linearGradient>
  <linearGradient id="shimmer" x1="0" y1="0" x2="600" y2="0" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="${C.cyan}"/><stop offset=".45" stop-color="${C.blue}"/><stop offset=".55" stop-color="#fff"/><stop offset=".65" stop-color="${C.blue}"/><stop offset="1" stop-color="${C.blue2}"/>
    <animateTransform attributeName="gradientTransform" type="translate" values="-500 0;600 0" dur="5s" repeatCount="indefinite"/>
  </linearGradient>`);
  fs.writeFileSync(path.join(OUT, 'hero.svg'), svg);
}

/* ---------------------------------------------------------------- ABOUT */
{
  const W = 1200, H = 400;
  const para = [
    'We design, build and ship production software — AI systems,',
    'web and mobile platforms, and automation tools for businesses',
    'that need them to actually work. No hype, no buzzwords: if it',
    'doesn’t create value, we don’t build it.'
  ];
  const facts = [['Entrepreneurs', 'who ship'], ['Builders', 'end to end'], ['Problem-solvers', 'first']];
  const inner = `
  ${label(64, 84, '01', 'WHAT WE DO', .1)}
  <text x="64" y="160" font-size="46" font-weight="800" letter-spacing="-1.5" class="t r" style="animation-delay:.25s">No fluff. <tspan class="serif" font-weight="400" fill="url(#brand)">Just execution.</tspan></text>
  <g class="r" style="animation-delay:.45s">${para.map((l, i) => `<text x="64" y="${222 + i * 32}" font-size="20" class="m">${esc(l)}</text>`).join('')}</g>
  ${facts.map(([a, b], i) => `<g class="r" style="animation-delay:${.6 + i * .15}s">
    <rect x="${790}" y="${92 + i * 92}" width="346" height="74" rx="18" fill="rgba(255,255,255,.025)" stroke="rgba(148,180,255,.14)"/>
    <rect x="${790}" y="${92 + i * 92}" width="4" height="74" rx="2" fill="url(#brandv)"/>
    <text x="${818}" y="${136 + i * 92}" font-size="22" font-weight="700" class="t">${a} <tspan class="serif" font-weight="400" fill="${C.muted}">${b}</tspan></text>
  </g>`).join('')}`;
  fs.writeFileSync(path.join(OUT, 'about.svg'), frame(W, H, inner));
}

/* ---------------------------------------------------------------- FLAGSHIP */
{
  const W = 1200, H = 600;
  const feats = ['Proforma invoices, invoices & receipts', 'Payment tracking and balance follow-up', 'Offline-first on Windows', 'Automatic cloud backup', 'Self-updating installers'];
  const rows = [['PF-0142', 'Proforma', '1 240 000', 'Envoyée'], ['FA-0381', 'Facture', '860 000', 'Payée'], ['RC-0207', 'Reçu', '860 000', 'Payée'], ['FA-0382', 'Facture', '2 150 000', 'En attente'], ['FA-0383', 'Facture', '475 000', 'Payée']];
  const wx = 640, wy = 96, ww = 500, wh = 420;
  const inner = `
  ${label(64, 84, '02', 'FLAGSHIP PRODUCT', .1)}
  <text x="64" y="160" font-size="50" font-weight="800" letter-spacing="-1.6" class="t r" style="animation-delay:.25s">Maison Stella</text>
  <text x="66" y="206" font-size="34" class="serif r" fill="url(#brand)" style="animation-delay:.35s">Gestion</text>
  <g class="r" style="animation-delay:.5s">
    <text x="64" y="262" font-size="18" class="m">Business management for a services company in Bukavu, DR Congo —</text>
    <text x="64" y="290" font-size="18" class="m">a paper workflow turned into professional, offline-first software.</text>
  </g>
  ${feats.map((f, i) => `<g class="r" style="animation-delay:${.65 + i * .12}s">
    <circle cx="76" cy="${340 + i * 40}" r="11" fill="rgba(26,167,255,.14)"/>
    <path d="M70 ${340 + i * 40} l4 4 l8 -8" stroke="${C.cyan}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="98" y="${346 + i * 40}" font-size="17" class="t">${esc(f)}</text></g>`).join('')}

  <!-- app window -->
  <g style="animation:fade 1s .5s both">
    <rect x="${wx + 18}" y="${wy + 26}" width="${ww}" height="${wh}" rx="18" fill="${C.blue}" opacity=".10"/>
    <rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="18" fill="#0E1626" stroke="rgba(148,180,255,.2)"/>
    <rect x="${wx}" y="${wy}" width="${ww}" height="44" rx="18" fill="#121C30"/><rect x="${wx}" y="${wy + 26}" width="${ww}" height="18" fill="#121C30"/>
    <circle cx="${wx + 24}" cy="${wy + 22}" r="6" fill="#FF5F57"/><circle cx="${wx + 44}" cy="${wy + 22}" r="6" fill="#FEBC2E"/><circle cx="${wx + 64}" cy="${wy + 22}" r="6" fill="#28C840"/>
    <text x="${wx + ww / 2}" y="${wy + 27}" font-size="13" text-anchor="middle" class="m">Maison Stella — Gestion</text>
    <!-- sidebar -->
    <rect x="${wx}" y="${wy + 44}" width="118" height="${wh - 44}" fill="#0C1322"/>
    ${['Tableau', 'Factures', 'Clients', 'Paiements', 'Rapports'].map((t, i) => `<rect x="${wx + 12}" y="${wy + 62 + i * 40}" width="94" height="30" rx="8" fill="${i === 1 ? 'rgba(26,167,255,.16)' : 'transparent'}"/><text x="${wx + 24}" y="${wy + 82 + i * 40}" font-size="13" fill="${i === 1 ? C.cyan : C.muted}">${t}</text>`).join('')}
    <!-- totals -->
    <text x="${wx + 140}" y="${wy + 82}" font-size="12" letter-spacing="1.5" class="m mono">ENCAISSÉ CE MOIS</text>
    <text x="${wx + 140}" y="${wy + 118}" font-size="30" font-weight="800" class="t">5 585 000 <tspan font-size="14" font-weight="600" fill="${C.muted}">FC</tspan></text>
    <rect x="${wx + 140}" y="${wy + 134}" width="330" height="6" rx="3" fill="rgba(148,180,255,.12)"/>
    <rect x="${wx + 140}" y="${wy + 134}" width="236" height="6" rx="3" fill="url(#brand)" style="transform-origin:${wx + 140}px 0;animation:bar 1.6s 1.2s cubic-bezier(.2,.8,.2,1) both"/>
    <!-- table -->
    ${rows.map((r, i) => {
      const y = wy + 172 + i * 40, st = r[3], col = st === 'Payée' ? '#28C840' : st === 'Envoyée' ? C.blue : '#FEBC2E';
      return `<g style="animation:row .6s ${1.4 + i * .28}s cubic-bezier(.2,.8,.2,1) both">
        <rect x="${wx + 132}" y="${y - 23}" width="352" height="32" rx="9" fill="rgba(255,255,255,.03)"/>
        <text x="${wx + 146}" y="${y}" font-size="12.5" class="mono t">${r[0]}</text>
        <text x="${wx + 226}" y="${y}" font-size="12.5" class="m">${r[1]}</text>
        <text x="${wx + 380}" y="${y}" font-size="12.5" text-anchor="end" class="t">${r[2]}</text>
        <rect x="${wx + 396}" y="${y - 15}" width="78" height="20" rx="10" fill="${col}" fill-opacity=".14"/>
        <text x="${wx + 435}" y="${y - 1}" font-size="11" text-anchor="middle" fill="${col}" font-weight="600">${st}</text></g>`;
    }).join('')}
    <!-- stamp -->
    <g style="transform-origin:${wx + 404}px ${wy + 384}px;animation:stamp .5s 3.2s cubic-bezier(.3,1.6,.5,1) both">
      <rect x="${wx + 346}" y="${wy + 366}" width="116" height="36" rx="8" stroke="#28C840" stroke-width="2.5" transform="rotate(-6 ${wx + 404} ${wy + 384})"/>
      <text x="${wx + 404}" y="${wy + 391}" font-size="17" font-weight="800" letter-spacing="3.5" text-anchor="middle" fill="#28C840" transform="rotate(-6 ${wx + 404} ${wy + 384})">PAYÉE</text>
    </g>
  </g>`;
  fs.writeFileSync(path.join(OUT, 'flagship.svg'), frame(W, H, inner, {
    extraCss: `@keyframes bar{from{transform:scaleX(0)}to{transform:scaleX(1)}}
    @keyframes row{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}
    @keyframes stamp{from{opacity:0;transform:scale(1.8)}to{opacity:1;transform:scale(1)}}`
  }));
}

/* ---------------------------------------------------------------- SERVICES */
{
  const W = 1200, H = 560;
  const cards = [
    ['Enterprise digital products', ['AI-powered web applications,', 'admin systems and business', 'platforms.'], 'M14 30h44M14 20h44v32H14zM26 52v8M46 52v8M20 60h32'],
    ['Intelligence systems', ['Smart dashboards, real-time', 'data processing, embedded', 'decision support.'], 'M16 54V38M30 54V26M44 54V32M58 54V18M12 58h50'],
    ['Mobile & desktop apps', ['Cross-platform apps and', 'offline-first desktop software', 'with automatic updates.'], 'M24 14h24v46H24zM33 54h6M12 26v26M60 26v26'],
    ['Automation & APIs', ['Workflow automation,', 'integrations and scalable,', 'production-ready APIs.'], 'M18 24h14l8 12-8 12H18l8-12zM40 24h14l8 12-8 12H40l8-12z']
  ];
  const cw = 254, gap = 20, x0 = 64, y0 = 190;
  const inner = `
  ${label(64, 84, '03', 'WHAT WE BUILD', .1)}
  <text x="64" y="150" font-size="46" font-weight="800" letter-spacing="-1.5" class="t r" style="animation-delay:.25s">If it needs brains, speed and precision — <tspan class="serif" font-weight="400" fill="url(#brand)">we build it.</tspan></text>
  ${cards.map(([t, d, icon], i) => {
    const x = x0 + i * (cw + gap);
    return `<g class="r" style="animation-delay:${.45 + i * .15}s">
      <rect x="${x}" y="${y0}" width="${cw}" height="300" rx="22" fill="rgba(255,255,255,.025)" stroke="rgba(148,180,255,.14)"/>
      <rect x="${x}" y="${y0}" width="${cw}" height="300" rx="22" stroke="url(#brandv)" stroke-width="1.5" style="opacity:0;animation:glow 6s ${i * 1.5}s ease-in-out infinite"/>
      <rect x="${x + 28}" y="${y0 + 30}" width="72" height="72" rx="18" fill="rgba(26,167,255,.10)"/>
      <path d="${icon}" transform="translate(${x + 28} ${y0 + 30})" stroke="url(#brand)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="${x + 28}" y="${y0 + 150}" font-size="21" font-weight="700" class="t">${esc(t.length > 20 ? t.split(' ').slice(0, 2).join(' ') : t)}</text>
      ${t.length > 20 ? `<text x="${x + 28}" y="${y0 + 178}" font-size="21" font-weight="700" class="t">${esc(t.split(' ').slice(2).join(' '))}</text>` : ''}
      ${d.map((l, j) => `<text x="${x + 28}" y="${y0 + (t.length > 20 ? 216 : 190) + j * 25}" font-size="15.5" class="m">${esc(l)}</text>`).join('')}
      <text x="${x + cw - 28}" y="${y0 + 56}" font-size="13" letter-spacing="2" text-anchor="end" class="mono" fill="${C.blue}">0${i + 1}</text>
    </g>`;
  }).join('')}`;
  fs.writeFileSync(path.join(OUT, 'services.svg'), frame(W, H, inner, {
    extraCss: `@keyframes glow{0%,100%{opacity:0}12%,30%{opacity:1}45%{opacity:0}}`
  }));
}

/* ---------------------------------------------------------------- STACK */
{
  const W = 1200, H = 330;
  const rowA = ['React', 'React Native', 'Next.js', 'TypeScript', 'Expo', 'Electron', 'Tauri', 'Tailwind'];
  const rowB = ['Node.js', 'PostgreSQL', 'Supabase', 'Firebase', 'Convex', 'Clerk', 'Azure', 'REST APIs', 'Offline-first'];
  const pills = (items, y) => {
    let x = 0; const out = [];
    for (let rep = 0; rep < 2; rep++) items.forEach(t => {
      const w = 34 + t.length * 10.5;
      out.push(`<g transform="translate(${x} ${y})"><rect width="${w}" height="46" rx="23" fill="rgba(255,255,255,.03)" stroke="rgba(148,180,255,.16)"/><circle cx="20" cy="23" r="4" fill="url(#brand)"/><text x="32" y="29" font-size="16" font-weight="600" class="t">${t}</text></g>`);
      x += w + 14;
    });
    return { svg: out.join(''), half: x / 2 };
  };
  const a = pills(rowA, 0), b = pills(rowB, 0);
  const inner = `
  ${label(64, 84, '04', 'TECHNOLOGY', .1)}
  <text x="64" y="140" font-size="40" font-weight="800" letter-spacing="-1.2" class="t r" style="animation-delay:.2s">The stack evolves. <tspan class="serif" font-weight="400" fill="url(#brand)">The standards stay high.</tspan></text>
  <g mask="url(#edges)">
    <g transform="translate(0 176)"><g style="animation:mq ${a.half / 40}s linear infinite">${a.svg}</g></g>
    <g transform="translate(0 238)"><g style="animation:mqr ${b.half / 40}s linear infinite">${b.svg}</g></g>
  </g>`;
  let svg = frame(W, H, inner, {
    extraCss: `@keyframes mq{from{transform:translateX(0)}to{transform:translateX(-${a.half}px)}}
    @keyframes mqr{from{transform:translateX(-${b.half}px)}to{transform:translateX(0)}}`
  });
  svg = withDefs(svg, `<linearGradient id="edgeG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000"/><stop offset=".08" stop-color="#fff"/><stop offset=".92" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient><mask id="edges"><rect width="${W}" height="${H}" fill="url(#edgeG)"/></mask>`);
  fs.writeFileSync(path.join(OUT, 'stack.svg'), svg);
}

/* ---------------------------------------------------------------- PROJECT CARDS */
const work = [
  ['system-commander', 'System Commander', 'AI control for your computer.', 'Files · terminal · processes · code · remote MCP', 'TypeScript', '#3178C6'],
  ['codination', 'CodiNation', 'A home for builders.', 'A community for people who build with code, design and AI', 'TypeScript', '#3178C6'],
  ['fluxcast', 'fluxcast domains', 'Free subdomains for developers.', 'Grab your own yourname.fluxcast.dev for your project', 'Python', '#3572A5'],
  ['spill', 'spill.', 'Anonymous messages, with a twist.', 'NGL-style page that roasts whoever sends one, in 4 languages', 'HTML', '#E34C26']
];
work.forEach(([file, name, tag, desc, lang, langCol], i) => {
  const W = 580, H = 290;
  const inner = `
  <rect x="0" y="0" width="${W}" height="4" fill="url(#brand)"/>
  <rect x="-200" y="0" width="160" height="${H}" fill="url(#sheenG)" transform="skewX(-18)" style="animation:sheen 7s ${i * 1.3}s ease-in-out infinite"/>
  <g class="r" style="animation-delay:${.1 + i * .1}s">
    <text x="36" y="60" font-size="13" letter-spacing="2.5" class="mono" fill="${C.blue}">PROJECT · 0${i + 1}</text>
    <text x="36" y="112" font-size="38" font-weight="800" letter-spacing="-1.2" class="t">${name}</text>
    <text x="38" y="150" font-size="22" class="serif" fill="url(#brand)">${tag}</text>
    <text x="36" y="196" font-size="15.5" class="m">${esc(desc)}</text>
    <circle cx="44" cy="246" r="6" fill="${langCol}"/>
    <text x="58" y="251" font-size="14" class="m">${lang}</text>
    <text x="${W - 36}" y="251" font-size="15" font-weight="600" text-anchor="end" fill="${C.cyan}">View repository →</text>
  </g>`;
  let svg = frame(W, H, inner, { extraCss: `@keyframes sheen{0%,60%{transform:translateX(0) skewX(-18deg)}100%{transform:translateX(${W + 400}px) skewX(-18deg)}}` });
  svg = withDefs(svg, `<linearGradient id="sheenG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`);
  fs.writeFileSync(path.join(OUT, `work-${file}.svg`), svg);
});

/* ---------------------------------------------------------------- PRINCIPLES */
{
  const W = 1200, H = 400;
  const ps = [['Precision', 'over perfection', 'Ship functional, iterative solutions.'], ['Execution', 'over ideas', 'Value is in what you build.'], ['Impact', 'over noise', 'Results speak louder than marketing.'], ['Users first,', 'always', 'Build for real problems, real people.']];
  const cw = 254, gap = 20;
  const inner = `
  ${label(64, 84, '06', 'PRINCIPLES', .1)}
  <text x="64" y="146" font-size="40" font-weight="800" letter-spacing="-1.2" class="t r" style="animation-delay:.2s">How we work.</text>
  ${ps.map(([a, b, d], i) => {
    const x = 64 + i * (cw + gap);
    return `<g class="r" style="animation-delay:${.35 + i * .15}s">
      <text x="${x}" y="260" font-size="120" font-weight="800" letter-spacing="-6" fill="none" stroke="rgba(148,180,255,.16)" stroke-width="1.5">0${i + 1}</text>
      <text x="${x}" y="260" font-size="120" font-weight="800" letter-spacing="-6" fill="url(#brandv)" style="opacity:0;animation:lit 8s ${i * 2}s ease-in-out infinite">0${i + 1}</text>
      <text x="${x}" y="306" font-size="21" font-weight="700" class="t">${a} <tspan class="serif" font-weight="400" fill="${C.muted}">${b}</tspan></text>
      <text x="${x}" y="336" font-size="15" class="m">${d}</text>
    </g>`;
  }).join('')}`;
  fs.writeFileSync(path.join(OUT, 'principles.svg'), frame(W, H, inner, { extraCss: `@keyframes lit{0%,100%{opacity:0}10%,22%{opacity:1}32%{opacity:0}}` }));
}

/* ---------------------------------------------------------------- CONTACT */
{
  const W = 1200, H = 420;
  const inner = `
  <circle cx="${W / 2}" cy="${H / 2}" r="170" stroke="rgba(148,180,255,.10)" stroke-dasharray="3 9">${spin(W / 2, H / 2, 50)}</circle>
  <circle cx="${W / 2}" cy="${H / 2}" r="250" stroke="rgba(148,180,255,.06)"/>
  <g>${spin(W / 2, H / 2, 14)}<circle cx="${W / 2}" cy="${H / 2 - 170}" r="5" fill="${C.cyan}"/></g>
  ${label(W / 2 - 100, 84, '07', 'CONTACT', .1)}
  <text x="${W / 2}" y="170" font-size="54" font-weight="800" letter-spacing="-1.8" text-anchor="middle" class="t r" style="animation-delay:.25s">Got something that needs brains?</text>
  <text x="${W / 2}" y="236" font-size="54" text-anchor="middle" class="serif r" fill="url(#brand)" style="animation-delay:.4s">Let’s build it.</text>
  <text x="${W / 2}" y="286" font-size="18" text-anchor="middle" class="m r" style="animation-delay:.55s">Open for collaborations, partnerships and custom builds — projects, proposals and enterprise work welcome.</text>
  <g class="r" style="animation-delay:.7s">
    <rect x="${W / 2 - 150}" y="318" width="300" height="56" rx="28" fill="url(#brand)"/>
    <rect x="${W / 2 - 150}" y="318" width="300" height="56" rx="28" fill="url(#btnShine)"/>
    <text x="${W / 2}" y="352" font-size="17" font-weight="700" text-anchor="middle" fill="#04111F">Start a project  →</text>
  </g>`;
  let svg = frame(W, H, inner);
  svg = withDefs(svg, `<linearGradient id="btnShine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/><animateTransform attributeName="gradientTransform" type="translate" values="-1 0;1 0" dur="3.2s" repeatCount="indefinite"/></linearGradient>`);
  fs.writeFileSync(path.join(OUT, 'contact.svg'), svg);
}

/* ---------------------------------------------------------------- SECTION TITLE (work) + FOOTER */
{
  const W = 1200, H = 150;
  const inner = `${label(64, 70, '05', 'SELECTED WORK', .1)}
  <text x="64" y="122" font-size="40" font-weight="800" letter-spacing="-1.2" class="t r" style="animation-delay:.2s">Open source &amp; experiments.</text>`;
  fs.writeFileSync(path.join(OUT, 'work-title.svg'), frame(W, H, inner, { glows: false }));

  const F = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="80" viewBox="0 0 1200 80" fill="none">
<defs><linearGradient id="brand" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/><stop offset=".5" stop-color="${C.blue}"/><stop offset="1" stop-color="${C.blue2}" stop-opacity="0"/></linearGradient></defs>
<style>text{font-family:${SANS}} .serif{font-family:${SERIF};font-style:italic} @keyframes run{from{transform:translateX(-1200px)}to{transform:translateX(1200px)}} @media (prefers-reduced-motion:reduce){*{animation:none!important}}</style>
<rect x="0" y="20" width="1200" height="2" fill="url(#brand)" style="animation:run 6s linear infinite"/>
<text x="600" y="62" font-size="15" text-anchor="middle" fill="${C.muted}" letter-spacing="1">LEUKODE LABS  ·  <tspan class="serif" fill="${C.blue}">Building intelligence beyond limits</tspan>  ·  Made in Rwanda</text>
</svg>`;
  fs.writeFileSync(path.join(OUT, 'footer.svg'), F);
}

console.log(fs.readdirSync(OUT).map(f => f + ' ' + fs.statSync(path.join(OUT, f)).size).join('\n'));
