(function () {
  var dlg = document.getElementById('helpDialog');
  if (!dlg) return;
  var chk = document.getElementById('ackCheck');
  var btn = document.getElementById('ackBtn');
  var note = document.getElementById('ackNote');
  var close = document.getElementById('helpClose');
  var fab = document.querySelector('.help-fab');
  var login = document.getElementById('loginView');
  var shown = false;

  function atBottom() {
    return dlg.scrollTop + dlg.clientHeight >= dlg.scrollHeight - 8;
  }
  function unlock() {
    if (dlg.dataset.gate && atBottom()) {
      chk.disabled = false;
      note.hidden = true;
    }
  }
  function openGate() {
    dlg.dataset.gate = '1';
    chk.checked = false; chk.disabled = true;
    btn.disabled = true; note.hidden = false;
    if (!dlg.open) dlg.showModal();
    dlg.scrollTop = 0;
    setTimeout(unlock, 60);
  }
  function loggedIn() {
    return !login || login.hidden || getComputedStyle(login).display === 'none';
  }
  function check() {
    if (loggedIn()) {
      if (!shown) { shown = true; openGate(); }
    } else {
      shown = false;
    }
  }

  dlg.addEventListener('scroll', unlock);
  chk.addEventListener('change', function () { btn.disabled = !chk.checked; });
  btn.addEventListener('click', function () { if (chk.checked) dlg.close(); });
  close.addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('cancel', function (e) { if (dlg.dataset.gate) e.preventDefault(); });
  dlg.addEventListener('close', function () { delete dlg.dataset.gate; });
  if (fab) fab.addEventListener('click', function () { delete dlg.dataset.gate; });

  if (login) new MutationObserver(check).observe(login, { attributes: true, attributeFilter: ['hidden', 'style', 'class'] });
  window.addEventListener('load', function () { setTimeout(check, 400); });
})();
