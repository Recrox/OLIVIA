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
  clearTimeout(toast.timer);
  if (!action) toast.timer = setTimeout(() => { el.hidden = true; }, 8000);
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

// Install button (header): Android and desktop Chrome/Edge give a prompt event; iOS only allows a manual add.
const installBtn = document.querySelector('[data-install]');
const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let deferred;
addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferred = e;
  installBtn.hidden = false;
});
addEventListener('appinstalled', () => { installBtn.hidden = true; });
if (ios && !standalone) installBtn.hidden = false;
installBtn?.addEventListener('click', async () => {
  if (!deferred) return toast("Pour installer Olivia : touchez Partager, puis « Sur l'écran d'accueil »");
  deferred.prompt();
  const { outcome } = await deferred.userChoice;
  deferred = null;
  if (outcome === 'accepted') installBtn.hidden = true;
});

// Map: swap the placeholder for the Google Maps embed on tap.
document.querySelector('[data-map]')?.addEventListener('click', e => {
  e.preventDefault();
  const frame = document.createElement('iframe');
  frame.className = 'map map-frame';
  frame.src = e.currentTarget.dataset.map;
  frame.title = 'Plan : Olivia sur la Grand-Place de Tournai';
  frame.allowFullscreen = true;
  frame.referrerPolicy = 'no-referrer-when-downgrade';
  e.currentTarget.replaceWith(frame);
});

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
