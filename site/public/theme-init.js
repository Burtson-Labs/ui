// Applies ?theme= or the saved theme before first paint so the page never
// flashes. A file rather than an inline script, so the CSP can stay 'self'.
(function () {
  var theme = new URLSearchParams(location.search).get('theme');
  try {
    theme = theme || localStorage.getItem('bl-ui-theme');
  } catch (err) {
    // Storage can be blocked (private windows, strict cookie settings); the
    // default dark theme is the right answer then, so this is not an error.
    void err;
  }
  if (theme === 'light') document.documentElement.classList.remove('dark');
})();
