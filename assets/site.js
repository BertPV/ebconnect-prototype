// Minimal replacement for the Bootstrap/Liferay behaviour removed from the snapshot:
// collapse toggles (mobile menu, accordions) with optional data-parent grouping.
document.addEventListener('click', (event) => {
  const toggle = event.target.closest('[data-toggle="collapse"], [data-bs-toggle="collapse"]');
  if (!toggle) return;
  event.preventDefault();
  const selector = toggle.dataset.target || toggle.dataset.bsTarget || toggle.getAttribute('href');
  const target = selector && document.querySelector(selector);
  if (!target) return;

  const open = !target.classList.contains('show');
  const parentSelector = target.dataset.parent || target.dataset.bsParent;
  if (open && parentSelector) {
    document.querySelectorAll(`${parentSelector} .collapse.show`).forEach((other) => setOpen(other, false));
  }
  setOpen(target, open);
});

function setOpen(target, open) {
  target.classList.toggle('show', open);
  const id = target.id && CSS.escape(target.id);
  if (!id) return;
  document
    .querySelectorAll(`[data-target="#${id}"], [data-bs-target="#${id}"], [href="#${id}"]`)
    .forEach((toggle) => {
      toggle.classList.toggle('collapsed', !open);
      toggle.setAttribute('aria-expanded', String(open));
    });
}

// "Back to top" button: only visible once the page has been scrolled.
const backTop = document.getElementById('back-top');
if (backTop) {
  backTop.style.transition = 'opacity .3s';
  const update = () => {
    const visible = window.scrollY > 100;
    backTop.style.opacity = visible ? '1' : '0';
    backTop.style.pointerEvents = visible ? '' : 'none';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

// Prototype-schakelaar (huidig ⇄ voorstel), gedeeld met het voorstel.
const prototypeSwitch = document.createElement('script');
prototypeSwitch.src = new URL('prototype-switch.js', document.currentScript.src).href;
document.body.appendChild(prototypeSwitch);
