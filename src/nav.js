// Shared chrome for the guide pages: theme choice and the mobile drawer.
(function () {
  var root = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  var media = matchMedia('(prefers-color-scheme: dark)');
  var buttons = document.querySelectorAll('[data-theme-choice]');
  var choice = 'system';
  try { choice = localStorage.getItem('fa-theme') || 'system'; } catch (e) {}
  if (choice !== 'light' && choice !== 'dark' && choice !== 'system') choice = 'system';

  function applyTheme(next, persist) {
    choice = next;
    if (choice === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', choice);
    for (var i = 0; i < buttons.length; i += 1) {
      buttons[i].setAttribute('aria-pressed', String(buttons[i].getAttribute('data-theme-choice') === choice));
    }
    var dark = choice === 'dark' || (choice === 'system' && media.matches);
    if (meta) meta.content = dark ? '#0f1320' : '#f6f8fb';
    if (persist) try { localStorage.setItem('fa-theme', choice); } catch (e) {}
  }

  for (var i = 0; i < buttons.length; i += 1) {
    buttons[i].addEventListener('click', function () { applyTheme(this.getAttribute('data-theme-choice'), true); });
  }
  function systemChanged() { if (choice === 'system') applyTheme('system', false); }
  if (media.addEventListener) media.addEventListener('change', systemChanged);
  else if (media.addListener) media.addListener(systemChanged);
  applyTheme(choice, false);

  var menu = document.getElementById('menu'), scrim = document.getElementById('scrim');
  function setOpen(o) { document.body.classList.toggle('nav-open', o); menu.setAttribute('aria-expanded', String(o)); }
  if (menu) menu.addEventListener('click', function () { setOpen(!document.body.classList.contains('nav-open')); });
  if (scrim) scrim.addEventListener('click', function () { setOpen(false); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
})();
