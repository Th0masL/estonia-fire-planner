// Shared chrome for the guide pages: theme toggle and the mobile drawer.
(function () {
  var root = document.documentElement;
  try { var stored = localStorage.getItem('fa-theme'); if (stored) root.setAttribute('data-theme', stored); } catch (e) {}

  var btn = document.getElementById('theme');
  if (btn) btn.addEventListener('click', function () {
    var dark = root.getAttribute('data-theme') === 'dark'
      || (!root.hasAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
    var next = dark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('fa-theme', next); } catch (e) {}
  });

  var menu = document.getElementById('menu'), scrim = document.getElementById('scrim');
  function setOpen(o) { document.body.classList.toggle('nav-open', o); menu.setAttribute('aria-expanded', String(o)); }
  if (menu) menu.addEventListener('click', function () { setOpen(!document.body.classList.contains('nav-open')); });
  if (scrim) scrim.addEventListener('click', function () { setOpen(false); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
})();
