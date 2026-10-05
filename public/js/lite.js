(function () {
  var d = document.documentElement, n = navigator, c = n.connection || {};
  var ORDER = ['high', 'mid', 'low'];
  var KEY = 'wq', TTL = 7 * 864e5;

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  function apply(t) {
    ORDER.forEach(function (x) { d.classList.remove('tier-' + x); });
    d.classList.add('tier-' + t);
    d.classList.toggle('lite', t === 'low');
    d.setAttribute('data-tier', t);
  }

  function guess() {
    var mem = n.deviceMemory, cores = n.hardwareConcurrency;
    if (c.saveData || /2g/.test(c.effectiveType || '')) return 'low';
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return 'low';
    if (mem && mem <= 2) return 'low';
    if ((mem && mem <= 4) || (cores && cores <= 4) || /3g/.test(c.effectiveType || '')) return 'mid';
    return 'high';
  }

  var m = location.search.match(/[?&]q=(high|mid|low|auto)/);
  var forced = m && m[1] !== 'auto' ? m[1] : null;
  if (m && m[1] === 'auto') { try { localStorage.removeItem(KEY); } catch (e) {} }

  var tier = forced, saved = null;
  if (!tier) {
    try { saved = JSON.parse(load(KEY) || 'null'); } catch (e) {}
    if (saved && Date.now() - saved.t < TTL && ORDER.indexOf(saved.v) > -1) tier = saved.v;
  }
  var g = guess();
  if (!tier) tier = g;
  else if (!forced && ORDER.indexOf(g) > ORDER.indexOf(tier)) tier = g;
  apply(tier);

  function down(to) {
    if (forced) return;
    if (ORDER.indexOf(to) > ORDER.indexOf(tier)) {
      tier = to; apply(tier);
      store(KEY, JSON.stringify({ v: tier, t: Date.now() }));
    }
  }

  function probe(ms, done) {
    var times = [], last = 0, start = 0;
    function step(t) {
      if (document.hidden) return done(null);
      if (!start) start = t;
      if (last) times.push(t - last);
      last = t;
      if (t - start < ms) requestAnimationFrame(step);
      else {
        times.sort(function (a, b) { return a - b; });
        var med = times[Math.floor(times.length / 2)] || 16;
        done(1000 / med);
      }
    }
    requestAnimationFrame(step);
  }

  function judge(fps) {
    if (fps === null || forced) return;
    if (fps < 28) down('low');
    else if (fps < 45) down('mid');
  }

  window.addEventListener('load', function () {
    if (forced || tier === 'low') return;
    setTimeout(function () { probe(1500, judge); }, 900);
    setTimeout(function () { probe(1500, judge); }, 7000);
  });

  document.addEventListener('visibilitychange', function () {
    d.classList.toggle('paused', document.hidden);
  });

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('img').forEach(function (im, i) {
      if (!im.hasAttribute('decoding')) im.decoding = 'async';
      if (i > 0 && !im.hasAttribute('loading')) im.loading = 'lazy';
    });
    document.querySelectorAll('audio,video').forEach(function (a) {
      if (!a.autoplay) a.preload = 'none';
    });
  });
})();
