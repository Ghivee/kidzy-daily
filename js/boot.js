// Runs synchronously in <head> (not a module) so theme and language are set before first paint.
(function () {
  var d = document.documentElement;
  d.classList.remove('no-js');
  d.classList.add('js');
  try {
    var p = JSON.parse(localStorage.getItem('kidzy:prefs') || '{}') || {};
    var q = new URLSearchParams(location.search).get('lang');
    var lang = q === 'id' || q === 'en' ? q : p.lang === 'id' ? 'id' : 'en';
    d.lang = lang;
    if (p.theme === 'light' || p.theme === 'dark') d.setAttribute('data-theme', p.theme);
  } catch (e) { /* storage blocked: defaults */ }
})();
