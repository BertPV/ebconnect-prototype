// Interactie voor het voorstel: openklapmenu, mobiel menu, accordeon en ankernavigatie.
const desktop = window.matchMedia('(min-width: 992px)');

// ---------- Openklapmenu ----------
const dropdownItems = [...document.querySelectorAll('.navbar__item.has-dropdown')];

function setOpen(item, open) {
  item.classList.toggle('is-open', open);
  item.querySelector('.navbar__link').setAttribute('aria-expanded', String(open));
}
const closeAll = (except) => dropdownItems.forEach((i) => i !== except && setOpen(i, false));

dropdownItems.forEach((item) => {
  const toggle = item.querySelector('.navbar__link');
  toggle.addEventListener('click', () => {
    const open = !item.classList.contains('is-open');
    closeAll(item);
    setOpen(item, open);
  });
  let leaveTimer;
  item.addEventListener('mouseenter', () => {
    if (!desktop.matches) return;
    clearTimeout(leaveTimer);
    closeAll(item);
    setOpen(item, true);
  });
  item.addEventListener('mouseleave', () => {
    if (!desktop.matches) return;
    leaveTimer = setTimeout(() => setOpen(item, false), 150);
  });
});

document.addEventListener('click', (e) => {
  if (desktop.matches && !e.target.closest('.navbar__item.has-dropdown')) closeAll();
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const open = dropdownItems.find((i) => i.classList.contains('is-open'));
  if (open) { setOpen(open, false); open.querySelector('.navbar__link').focus(); }
});

// ---------- Mobiel menu ----------
const navToggle = document.querySelector('.nav-toggle');
const navbar = document.getElementById('primary-nav');
navToggle?.addEventListener('click', () => {
  const open = !navbar.classList.contains('is-open');
  navbar.classList.toggle('is-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.querySelector('i').className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
});
// Na een klik op een anker in het menu het mobiele menu sluiten.
navbar?.addEventListener('click', (e) => {
  if (!e.target.closest('a')) return;
  closeAll();
  if (!desktop.matches && navbar.classList.contains('is-open')) navToggle.click();
});

// ---------- Accordeon ----------
function setPanel(toggle, open) {
  toggle.setAttribute('aria-expanded', String(open));
  document.getElementById(toggle.getAttribute('aria-controls')).hidden = !open;
}
document.querySelectorAll('.accordion__toggle').forEach((toggle) => {
  toggle.addEventListener('click', () => setPanel(toggle, toggle.getAttribute('aria-expanded') !== 'true'));
});

// Een anker naar een accordeonitem (bv. vanuit het menu) klapt dat item open.
function openFromHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  const target = id && document.getElementById(id);
  if (!target) return;
  const item = target.closest('.accordion__item') || target.querySelector?.('.accordion__item');
  const toggle = target.classList.contains('accordion__item') ? target.querySelector('.accordion__toggle') : null;
  if (toggle) {
    setPanel(toggle, true);
    item.classList.add('is-highlight');
    setTimeout(() => item.classList.remove('is-highlight'), 2000);
  }
}
window.addEventListener('hashchange', openFromHash);
openFromHash();

// ---------- Ankernavigatie: huidige sectie markeren ----------
const localLinks = [...document.querySelectorAll('.local-nav a')];
if (localLinks.length && 'IntersectionObserver' in window) {
  const byId = new Map(localLinks.map((a) => [a.getAttribute('href').slice(1), a]));
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        localLinks.forEach((a) => a.classList.remove('is-current'));
        const link = byId.get(entry.target.id);
        link?.classList.add('is-current');
        if (link) link.closest('ul').scrollTo({ left: link.parentElement.offsetLeft - 16, behavior: 'smooth' });
      });
    },
    { rootMargin: '-30% 0px -60% 0px' }
  );
  byId.forEach((_, id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
}

// ---------- Keuze beheerapplicatie (tekstscherm = Vibe, webapplicatie = Vicolin) ----------
const SYSTEM_LABELS = { vibe: 'het tekstscherm', vicolin: 'de webapplicatie' };
function setSystem(root, system) {
  root.querySelector('.backoffice__choice').hidden = !!system;
  root.querySelector('.backoffice__result').hidden = !system;
  root.querySelectorAll('[data-panel]').forEach((p) => { p.hidden = p.dataset.panel !== system; });
  if (system) root.querySelector('[data-chosen-label]').textContent = SYSTEM_LABELS[system];
  root.dataset.system = system || '';
}
document.querySelectorAll('[data-backoffice]').forEach((root) => {
  root.querySelectorAll('[data-system]').forEach((b) => b.addEventListener('click', () => {
    setSystem(root, b.dataset.system);
    try { localStorage.setItem('backoffice-system', b.dataset.system); } catch {}
  }));
  root.querySelector('[data-backoffice-reset]').addEventListener('click', () => {
    setSystem(root, null);
    try { localStorage.removeItem('backoffice-system'); } catch {}
    root.querySelector('[data-system]').focus();
  });
  let saved = null;
  try { saved = localStorage.getItem('backoffice-system'); } catch {}
  if (saved in SYSTEM_LABELS) setSystem(root, saved);
});
