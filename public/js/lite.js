(function () {
  var d = document.documentElement, n = navigator, c = n.connection || {};
  var low = (n.deviceMemory && n.deviceMemory <= 2) ||
            (n.hardwareConcurrency && n.hardwareConcurrency <= 4) ||
            c.saveData || /2g/.test(c.effectiveType || '') ||
            /[?&]lite=1/.test(location.search) ||
            (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (low) d.classList.add('lite');
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('img').forEach(function (im, i) {
      if (!im.hasAttribute('decoding')) im.decoding = 'async';
      if (i > 0 && !im.hasAttribute('loading')) im.loading = 'lazy';
    });
    document.querySelectorAll('audio,video').forEach(function (m) {
      if (!m.autoplay) m.preload = 'none';
    });
  });
})();
