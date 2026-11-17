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

// Menu: highlight the category being read and keep its tab in view.
const tabs = [...document.querySelectorAll('.cat-nav a')];
const cats = [...document.querySelectorAll('.cat')];
if (tabs.length) {
  let current, queued;
  const update = () => {
    queued = false;
    // active = last category whose top has passed under the sticky bar
    const i = Math.max(0, cats.findLastIndex(c => c.getBoundingClientRect().top <= 120));
    if (i === current) return;
    current = i;
    tabs.forEach((a, j) => j === i ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'));
    tabs[i].parentElement.scrollTo({ left: tabs[i].offsetLeft - 16, behavior: 'smooth' });
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', queue, { passive: true });
  queue();
}
