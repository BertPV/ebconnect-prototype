// Prototype-schakelaar: wisselt tussen de huidige site (clone) en het voorstel (site/voorstel/),
// telkens naar de pagina die inhoudelijk het best overeenkomt. Wordt op beide versies geladen.
(() => {
  const script = document.currentScript;
  const BASE = new URL('..', script.src); // site-root (deze file staat in site/assets/)

  // Huidig → voorstel
  const OLD_TO_NEW = {
    'werkgever/home': 'voorstel/werkgever/home',
    'werkgever/onze-oplossingen': 'voorstel/werkgever/opstarten#formules',
    'werkgever/groepsverzekering': 'voorstel/werkgever/opstarten#stappenplan',
    'werkgever/beheer-groepsverzekering': 'voorstel/werkgever/beheren',
    'werkgever/premie-groepsverzekering': 'voorstel/werkgever/beheren/premie-betalen',
    'werkgever/rsz': 'voorstel/werkgever/beheren/rsz-aangifte',
    'werknemer/home': 'voorstel/werknemer/home',
    'werknemer/groepsverzekering': 'voorstel/werknemer/veelgestelde-vragen#groepsverzekering',
    'werknemer/pensioen': 'voorstel/werknemer/veelgestelde-vragen#pensioen',
    'werknemer/mijn-pensioenuitkering': 'voorstel/werknemer/veelgestelde-vragen#uitbetaling',
    'werknemer/overlijden': 'voorstel/werknemer/veelgestelde-vragen#overlijden',
    'werknemer/arbeidsongeschiktheid': 'voorstel/werknemer/veelgestelde-vragen#arbeidsongeschiktheid',
    'werknemer/ongevallen': 'voorstel/werknemer/veelgestelde-vragen#ongevallen',
    'werknemer/andere-gebeurtenissen': 'voorstel/werknemer/veelgestelde-vragen#andere-gebeurtenissen',
  };

  // Voorstel → huidig. Een functie waar de sectie (#hash) bepaalt welke oude pagina past.
  const FAQ_TO_OLD = {
    groepsverzekering: 'werknemer/groepsverzekering', 'benefit-statement': 'werknemer/groepsverzekering',
    pensioen: 'werknemer/pensioen', uitbetaling: 'werknemer/mijn-pensioenuitkering', belasting: 'werknemer/mijn-pensioenuitkering',
    overlijden: 'werknemer/overlijden', arbeidsongeschiktheid: 'werknemer/arbeidsongeschiktheid', ongevallen: 'werknemer/ongevallen',
    'andere-gebeurtenissen': 'werknemer/andere-gebeurtenissen', voorschot: 'werknemer/andere-gebeurtenissen', 'uit-dienst': 'werknemer/andere-gebeurtenissen',
  };
  const NEW_TO_OLD = {
    'voorstel/werkgever/home': () => 'werkgever/home',
    'voorstel/werkgever/beheren': () => 'werkgever/beheer-groepsverzekering',
    'voorstel/werkgever/beheren/premie-betalen': () => 'werkgever/premie-groepsverzekering',
    'voorstel/werkgever/beheren/rsz-aangifte': () => 'werkgever/rsz',
    'voorstel/werkgever/opstarten': (h) => (['waarom', 'formules', 'vergelijking'].includes(h) ? 'werkgever/onze-oplossingen' : 'werkgever/groepsverzekering'),
    'voorstel/werkgever/nieuws': () => 'werkgever/home',
    'voorstel/werkgever/contact': () => 'werkgever/home',
    'voorstel/werknemer/home': () => 'werknemer/home',
    'voorstel/werknemer/veelgestelde-vragen': (h) => FAQ_TO_OLD[h] || 'werknemer/groepsverzekering',
    'voorstel/werknemer/nieuws': () => 'werknemer/home',
    'voorstel/werknemer/contact': () => 'werknemer/home',
  };
  const lookupOld = (path) =>
    NEW_TO_OLD[path] || (path.startsWith('voorstel/werkgever/beheren/') ? () => 'werkgever/beheer-groepsverzekering' : null);
  // Pagina's in het voorstel zonder echte tegenhanger in de huidige site.
  const NO_EQUIVALENT = ['voorstel/werkgever/nieuws', 'voorstel/werkgever/contact', 'voorstel/werknemer/nieuws', 'voorstel/werknemer/contact'];

  // Pad relatief t.o.v. de site-root, zonder .html (de dev-server gebruikt clean URLs).
  const current = decodeURIComponent(location.pathname)
    .slice(decodeURIComponent(BASE.pathname).length)
    .replace(/\.html$/, '')
    .replace(/\/$/, '/index')
    .replace(/^$/, 'index');
  const isNew = current.startsWith('voorstel/');
  const hash = location.hash.slice(1);

  const target = (side) => {
    let path;
    if (side === 'new') path = isNew ? null : OLD_TO_NEW[current] || 'voorstel/werkgever/home';
    else path = isNew ? (lookupOld(current) || (() => 'werkgever/home'))(hash) : null;
    if (!path) return null;
    const [p, h] = path.split('#');
    return new URL(`${p}.html${h ? `#${h}` : ''}`, BASE).href;
  };
  const exact = isNew ? !!NEW_TO_OLD[current] && !NO_EQUIVALENT.includes(current) : !!OLD_TO_NEW[current];

  const host = document.createElement('div');
  host.id = 'prototype-switch';
  const root = host.attachShadow({ mode: 'open' });

  root.innerHTML = `
<style>
  :host { all: initial; }
  .bar {
    position: fixed; left: 16px; bottom: 16px; z-index: 2147483000;
    display: flex; align-items: center; gap: 6px; padding: 6px;
    background: #1b1f3b; color: #fff; border-radius: 999px;
    font: 600 13px/1 Lato, system-ui, sans-serif; box-shadow: 0 6px 24px rgba(0,0,0,.28);
  }
  .label { padding: 0 8px 0 10px; letter-spacing: .06em; text-transform: uppercase; font-size: 11px; color: #ff934c; }
  .seg { display: flex; background: rgba(255,255,255,.1); border-radius: 999px; padding: 3px; }
  .seg a, .seg span { padding: 8px 14px; border-radius: 999px; color: #fff; text-decoration: none; white-space: nowrap; }
  .seg a:hover { background: rgba(255,255,255,.15); }
  .seg .on { background: #fff; color: #0d1473; }
  a:focus-visible { outline: 2px solid #ff934c; outline-offset: 2px; }
  .hint { font-weight: 400; font-size: 12px; color: rgba(255,255,255,.65); padding: 0 6px; }
  @media (max-width: 600px) { .hint, .label { display: none; } .bar { left: 8px; bottom: 8px; } }
</style>
<div class="bar" role="region" aria-label="Prototype-schakelaar">
  <span class="label">Prototype</span>
  <div class="seg">
    ${isNew ? `<a href="${target('old')}">Huidig</a><span class="on" aria-current="true">Voorstel</span>`
            : `<span class="on" aria-current="true">Huidig</span><a href="${target('new')}">Voorstel</a>`}
  </div>
  ${exact ? '' : '<span class="hint">geen 1-op-1 tegenhanger</span>'}
</div>`;

  // Hash kan wijzigen (ankernavigatie in het voorstel): link naar huidig mee aanpassen.
  window.addEventListener('hashchange', () => {
    const link = isNew && root.querySelector('.seg a');
    if (!link) return;
    const path = (lookupOld(current) || (() => 'werkgever/home'))(location.hash.slice(1));
    link.href = new URL(`${path}.html`, BASE).href;
  });

  // Sneltoets: Alt+Shift+P wisselt van versie.
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.shiftKey && e.code === 'KeyP') {
      const href = target(isNew ? 'old' : 'new');
      if (href) location.href = href;
    }
  });

  document.body.appendChild(host);
})();
