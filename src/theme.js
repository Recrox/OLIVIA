// Runs before first paint (not deferred) so a remembered dark theme never flashes light. Light is the default.
try { if (localStorage.getItem('theme') === 'dark') document.documentElement.dataset.theme = 'dark'; } catch {}
