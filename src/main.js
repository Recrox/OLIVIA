// Olivia — progressive enhancement only. The site works without this file.

const toast = (text, action) => {
  const el = document.querySelector('.toast');
  if (!el) return;
  el.replaceChildren(text);
  if (action) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = action.label;
    b.onclick = action.run;
    el.append(b);
  }
  el.hidden = false;
};

// Service worker + "new version" notice. A waiting worker only takes over when the visitor agrees.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const reg = await navigator.serviceWorker.register('/sw.js').catch(e => console.warn('service worker', e));
    if (!reg) return;
    const offer = worker => toast('Une nouvelle version du site est disponible', {
      label: 'Actualiser',
      run: () => worker.postMessage('skip-waiting'),
    });
    if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w?.addEventListener('statechange', () => {
        if (w.state === 'installed' && navigator.serviceWorker.controller) offer(w);
      });
    });
    // First install also fires controllerchange (clients.claim): only reload when replacing a worker.
    let reload = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reload) { reload = false; location.reload(); }
    });
  });
}

// Install: Android/Chrome gives a prompt event; iOS needs a hint.
const install = document.querySelector('.install');
let deferred;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferred = e;
  if (install) install.hidden = false;
});
document.querySelector('[data-install]')?.addEventListener('click', async () => {
  if (!deferred) return;
  deferred.prompt();
  await deferred.userChoice;
  deferred = null;
  install.hidden = true;
});
const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
if (install && !standalone && /iphone|ipad|ipod/i.test(navigator.userAgent)) {
  install.hidden = false;
  install.querySelector('[data-install]').hidden = true;
  install.querySelector('.ios-hint').hidden = false;
}

// Offline: the menu may be a cached copy, so say so.
const note = document.querySelector('.offline-note');
const syncOnline = () => { if (note) note.hidden = navigator.onLine; };
addEventListener('online', syncOnline);
addEventListener('offline', syncOnline);
syncOnline();

// Menu: one category at a time. CSS shows the :target category; this marks its tab,
// opens a targeted group and lets a horizontal swipe move to the next or previous category.
const tabs = [...document.querySelectorAll('.cat-nav a')];
const cats = [...document.querySelectorAll('.cat')];
if (tabs.length) {
  const current = () => {
    const t = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
    if (t?.tagName === 'DETAILS') t.open = true;
    return t?.closest('.cat') || cats[0];
  };
  const sync = () => {
    const c = current();
    tabs.forEach(a => a.hash === '#' + c.id ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'));
  };
  addEventListener('hashchange', sync);
  sync();
  // Wide screens have room: unfold every group, except in very long categories (drinks).
  if (matchMedia('(min-width: 1100px)').matches) {
    for (const c of cats) if (c.querySelectorAll('.group').length <= 8) c.querySelectorAll('.group').forEach(g => { g.open = true; });
  }

  let x0, y0;
  const body = document.querySelector('.carte-body');
  body.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  body.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) < 70 || Math.abs(dx) < 2 * Math.abs(dy)) return; // a scroll, not a swipe
    const next = cats[cats.indexOf(current()) + (dx < 0 ? 1 : -1)];
    if (next) location.hash = next.id;
  }, { passive: true });
}
