// Applies ?theme= or the saved theme before first paint so the page never
// flashes. A file rather than an inline script, so the CSP can stay 'self'.
(function () {
  var theme = new URLSearchParams(location.search).get('theme');
  try {
    theme = theme || localStorage.getItem('bl-ui-theme');
  } catch (err) {
    // Storage can be blocked (private windows, strict cookie settings); the
    // system preference still applies for this visit.
    void err;
  }
  document.documentElement.classList.toggle(
    'dark',
    theme === 'dark' || (theme !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches),
  );
  var accent = new URLSearchParams(location.search).get('accent');
  try {
    accent = accent || localStorage.getItem('bl-ui-accent');
  } catch (err) {
    void err;
  }
  if (['ink', 'violet', 'blue', 'teal', 'orange'].includes(accent))
    document.documentElement.dataset.accent = accent;
})();
