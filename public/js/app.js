/* Undangan Agus & Sinta — logika halaman */
(function () {
  'use strict';
  const S = window.SITE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (a, b) => a + Math.random() * (b - a);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const text = (tag, cls, t) => { const e = el(tag, cls); e.textContent = t; return e; };

  /* ---------- Tanggal ---------- */
  const family = new URLSearchParams(location.search).get('v') === 'keluarga';
  const ev = S.event;
  const startAt = new Date(`${ev.date}T${ev.start}:00${ev.timezone}`);
  const endAt = new Date(`${ev.date}T${ev.end}:00${ev.timezone}`);
  const fmtDate = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });
  const dateLabel = fmtDate.format(startAt);
  const timeLabel = `Pukul ${ev.start.replace(':', '.')} - ${ev.end.replace(':', '.')} ${ev.timezoneLabel}`;
  /* evx: acara utama untuk hitung mundur, kalender, peta, footer. Versi keluarga = Pertemuan Keluarga (18 Nov, Parigi) */
  const evx = (family && S.eventFamily) ? Object.assign({}, S.event, S.eventFamily) : S.event;
  const startAtX = new Date(`${evx.date}T${evx.start}:00${evx.timezone}`);
  const endAtX = new Date(`${evx.date}T${evx.end}:00${evx.timezone}`);
  const dateLabelX = fmtDate.format(startAtX);
  const timeLabelX = `Pukul ${evx.start.replace(':', '.')} - ${evx.end.replace(':', '.')} ${evx.timezoneLabel}`;

  /* ---------- Isi konten dari konfigurasi ---------- */
  function fillSite() {
    $('#coverDate').textContent = fmtDate.format(new Date(`${S.event.date}T12:00:00${S.event.timezone}`));
    $('#pName1').textContent = S.groom.nickname;
    $('#pName2').textContent = S.bride.nickname;
    document.title = `The Wedding of ${S.groom.nickname} & ${S.bride.nickname}`;

    const grid = $('#coupleGrid');
    [[S.groom, 'left', 'Mempelai Pria'], [S.bride, 'right', 'Mempelai Wanita']].forEach(([p, dir, alt], i) => {
      const c = el('article', 'card couple-card');
      c.dataset.reveal = dir; c.dataset.delay = i * 150;
      const portrait = el('div', 'portrait');
      portrait.append(el('span', 'portrait-ring'));
      const img = document.createElement('img'); img.src = p.photo; img.alt = `${alt}: ${p.nickname}`; img.loading = 'lazy';
      portrait.append(img);
      c.append(portrait, text('h3', '', p.nickname));
      if (p.fullName && p.fullName !== p.nickname) c.append(text('p', 'full', p.fullName));
      if (p.parents) c.append(text('p', 'parents', p.parents));
      const soc = el('div', 'socials');
      if (p.instagram) soc.append(Object.assign(el('a', '', '<i class="fab fa-instagram"></i>'), { href: p.instagram, target: '_blank', rel: 'noopener', title: 'Instagram ' + p.nickname }));
      if (p.whatsapp) soc.append(Object.assign(el('a', '', '<i class="fab fa-whatsapp"></i>'), { href: 'https://wa.me/' + p.whatsapp.replace(/\D/g, ''), target: '_blank', rel: 'noopener', title: 'WhatsApp ' + p.nickname }));
      if (soc.children.length) c.append(soc);
      grid.append(c);
    });

    $('#evTitle').textContent = ev.title;
    $('#evDate').textContent = dateLabel;
    $('#evTime').textContent = timeLabel;
    $('#evPlace').innerHTML = '';
    if (ev.address.startsWith(ev.venue)) $('#evPlace').append(text('strong', '', ev.address)); else $('#evPlace').append(text('strong', '', ev.venue), document.createElement('br'), document.createTextNode(ev.address));
    const q = encodeURIComponent(ev.mapQuery);
    $('#evMap').href = `https://www.google.com/maps/search/?api=1&query=${q}`;
    $('#mapFrame').src = `https://www.google.com/maps?q=${encodeURIComponent(evx.mapQuery)}&hl=id&z=15&output=embed`;
    $('#footAddr').textContent = evx.address;

    if (S.gifts && S.gifts.length) {
      $('#giftSection').hidden = false; $('#navGift').hidden = false;
      const g = $('#giftGrid');
      S.gifts.forEach((x, i) => {
        const c = el('div', 'card gift-card'); c.dataset.reveal = 'up'; c.dataset.delay = i * 150;
        c.append(el('i', 'fas ' + (/dana|ovo|gopay|shopee/i.test(x.type) ? 'fa-mobile-screen-button' : 'fa-building-columns')),
          text('h3', '', x.type), text('p', 'acc', x.number), text('p', 'holder', 'a.n. ' + x.name));
        const b = el('button', 'btn btn-gold', '<i class="fas fa-copy"></i> <span>Salin Nomor</span>'); b.type = 'button';
        b.addEventListener('click', () => copy(x.number, b));
        c.append(b); g.append(c);
      });
      if (S.giftAddress) { const a = $('#giftAddress'); a.hidden = false; a.textContent = 'Kirim kado ke: ' + S.giftAddress; }
    }
  }

  async function copy(t, btn) {
    try { await navigator.clipboard.writeText(t); } catch {
      const i = document.createElement('input'); i.value = t; document.body.append(i); i.select(); document.execCommand('copy'); i.remove();
    }
    const s = $('span', btn), old = s.textContent; s.textContent = 'Tersalin!';
    setTimeout(() => (s.textContent = old), 1800);
  }

  /* ---------- Nama tamu & kode personal ---------- */
  const params = new URLSearchParams(location.search);
  const guestCode = (params.get('c') || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 32);
  const nameFromUrl = (params.get('to') || params.get('kpd') || '').trim().slice(0, 80);
  if (nameFromUrl) setGuestName(nameFromUrl);
  function setGuestName(n) { $('#guestName').textContent = n; const f = $('#fName'); if (f && !f.value) f.value = n; }

  async function loadGuest() {
    if (!guestCode) return;
    try {
      const g = await SB.rpc('get_guest', { p_code: guestCode });
      if (!g) return;
      setGuestName(g.name); $('#fName').value = g.name;
      if (g.rsvp) {
        const r = $(`input[name=attendance][value="${g.rsvp.attendance}"]`); if (r) r.checked = true;
        $('#fPax').value = String(g.rsvp.pax || 1); $('#fMsg').value = g.rsvp.message || '';
        $('#msgLen').textContent = $('#fMsg').value.length;
        syncPax();
        note('Anda sudah mengisi konfirmasi sebelumnya. Silakan ubah jika ada perubahan.', 'info');
      }
    } catch { /* abaikan; form tetap bisa dipakai */ }
  }

  /* ---------- Pemecah teks untuk animasi ---------- */
  function splitLetters(node) {
    const t = node.textContent; node.setAttribute('aria-label', t); node.textContent = '';
    let wd = null;
    [...t].forEach((c, i) => {
      if (c === ' ') { wd = null; const sp = document.createElement('span'); sp.className = 'sp'; sp.setAttribute('aria-hidden', 'true'); node.append(sp, document.createTextNode(' ')); return; }
      if (!wd) { wd = document.createElement('span'); wd.className = 'wd'; wd.setAttribute('aria-hidden', 'true'); node.append(wd); }
      const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; s.style.setProperty('--i', i); wd.append(s);
    });
  }
  function splitWords(node) {
    const t = node.textContent.trim().split(/\s+/); node.setAttribute('aria-label', t.join(' ')); node.textContent = '';
    const step = Math.min(34, 1500 / t.length);
    node.style.setProperty('--step', step + 'ms');
    t.forEach((w, i) => {
      const s = document.createElement('span'); s.className = 'w'; s.textContent = w; s.setAttribute('aria-hidden', 'true'); s.style.setProperty('--i', i);
      node.append(s, document.createTextNode(' '));
    });
  }

  /* ---------- Efek latar per-section ---------- */
  function buildFx() {
    if (reduce) return;
    $$('.fx').forEach((box) => {
      (box.dataset.fx || '').split(' ').forEach((type) => {
        const add = (cls, style) => { const i = document.createElement('i'); i.className = cls; Object.entries(style || {}).forEach(([k, v]) => i.style.setProperty(k, v)); box.append(i); return i; };
        if (type === 'orbs') for (let n = 0; n < 6; n++) { const s = rand(160, 340); add('orb' + (n % 3 === 0 ? ' rose' : ''), { left: rand(-5, 95) + '%', top: rand(-5, 90) + '%', width: s + 'px', height: s + 'px', '--dur': rand(12, 24) + 's', '--del': -rand(0, 20) + 's' }); }
        if (type === 'stars') for (let n = 0; n < 30; n++) add('star', { left: rand(0, 100) + '%', top: rand(0, 100) + '%', '--s': rand(2, 4.5) + 'px', '--dur': rand(2.5, 6) + 's', '--del': -rand(0, 6) + 's' });
        if (type === 'petals') for (let n = 0; n < 14; n++) add('petal', { left: rand(0, 100) + '%', '--s': rand(10, 20) + 'px', '--dur': rand(11, 20) + 's', '--del': -rand(0, 18) + 's' });
        if (type === 'rays') add('rays');
        if (type === 'rings') for (let n = 0; n < 3; n++) add('ring', { '--del': -n * 3 + 's' });
        if (type === 'sweep') add('sweep');
      });
    });
    // latar global
    const gl = $('#glitter'), fl = $('#floral');
    for (let i = 0; i < 28; i++) { const d = document.createElement('i'); d.style.cssText = `left:${rand(0, 100)}%;animation-duration:${rand(6, 12)}s;animation-delay:${-rand(0, 12)}s`; gl.append(d); }
    const sym = ['❀', '✿', '❁', '✦', '♥', '✧'];
    for (let i = 0; i < 10; i++) { const s = document.createElement('span'); s.textContent = sym[i % sym.length]; s.style.cssText = `left:${rand(2, 96)}%;font-size:${rand(1.1, 2.4)}rem;animation-duration:${rand(18, 34)}s;animation-delay:${-rand(0, 30)}s`; fl.append(s); }
  }

  /* ---------- Reveal saat scroll + status "on" ---------- */
  function setupObservers() {
    const rv = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('revealed'); rv.unobserve(e.target); }
    }), { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    $$('[data-reveal], .sec-title, [data-words]').forEach((n) => {
      if (n.dataset.delay) n.style.setProperty('--d', n.dataset.delay + 'ms');
      rv.observe(n);
    });

    const secs = $$('.sec');
    const on = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('on', e.isIntersecting)), { rootMargin: '10% 0px' });
    secs.forEach((s) => on.observe(s));

    // Nav aktif
    const navMap = { prologSection: 'prologSection', coupleSection: 'coupleSection', quranSection: 'coupleSection', storySection: 'coupleSection', countdownSection: 'eventSection', eventSection: 'eventSection', mapSection: 'eventSection', giftSection: 'giftSection', gallerySection: 'gallerySection', rsvpSection: 'rsvpSection', guestbookSection: 'rsvpSection', closingSection: 'rsvpSection' };
    const nv = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting || window.__navLock) return;
      const target = navMap[e.target.id];
      $$('#bottomNav button').forEach((b) => b.classList.toggle('active', b.dataset.go === target));
    }), { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach((s) => nv.observe(s));

    // Parallax ringan: --py (-1..1) per section yang terlihat
    if (!reduce) {
      let ticking = false;
      const upd = () => {
        ticking = false;
        const h = innerHeight;
        $$('.sec.on').forEach((s) => { const r = s.getBoundingClientRect(); s.style.setProperty('--py', Math.max(-1, Math.min(1, (r.top + r.height / 2 - h / 2) / h)).toFixed(3)); });
      };
      addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    }
  }

  /* ---------- Hitung mundur ---------- */
  function countdown() {
    const ids = ['cdD', 'cdH', 'cdM', 'cdS'].map((i) => $('#' + i));
    const prev = [];
    const set = (vals) => vals.forEach((v, i) => {
      const s = String(v).padStart(2, '0');
      if (prev[i] !== s) { ids[i].textContent = s; if (prev[i] !== undefined && !reduce) { ids[i].classList.remove('tick'); void ids[i].offsetWidth; ids[i].classList.add('tick'); } prev[i] = s; }
    });
    function tick() {
      const now = Date.now(), left = startAtX - now;
      if (left <= 0) {
        set([0, 0, 0, 0]);
        $('#countNote').textContent = now <= endAtX ? 'Alhamdulillah, acara sedang berlangsung 🤍' : 'Alhamdulillah, acara telah terlaksana. Terima kasih atas doa dan restunya 🤍';
        return;
      }
      const d = Math.floor(left / 864e5), h = Math.floor(left % 864e5 / 36e5), m = Math.floor(left % 36e5 / 6e4), s = Math.floor(left % 6e4 / 1e3);
      set([d, h, m, s]);
      $('#countNote').textContent = `${dateLabelX} • ${timeLabelX}`;
    }
    tick(); setInterval(tick, 1000);
  }

  /* ---------- Kalender (.ics) ---------- */
  function calendar() {
    $('#evCal').addEventListener('click', () => {
      const f = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      const esc = (t) => t.replace(/[\\;,]/g, '\\$&').replace(/\n/g, '\\n');
      const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Undangan Agus Sinta//ID', 'BEGIN:VEVENT',
        'UID:' + f(startAtX) + '@undangan-agus-sinta', 'DTSTAMP:' + f(new Date()), 'DTSTART:' + f(startAtX), 'DTEND:' + f(endAtX),
        'SUMMARY:' + esc(`${evx.title} ${S.groom.nickname} & ${S.bride.nickname}`), 'LOCATION:' + esc(evx.address),
        'DESCRIPTION:' + esc('Mohon doa restu dan kehadirannya.'), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })), download: 'pernikahan-agus-sinta.ics' });
      document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    });
  }

  /* ---------- Galeri ---------- */
  function gallery() {
    const photos = [
      ['img/couple-room.jpg', 'Agus dan Sinta'], ['img/couple-white.jpg', 'Agus dan Sinta berbusana batik'], ['img/couple-blue.jpg', 'Agus dan Sinta'],
      ['img/bride.jpg', 'Sinta'], ['img/groom.jpg', 'Agus'],
    ];
    const box = $('#slides'), dots = $('#dots'); let cur = 0, timer;
    const slides = photos.map(([src, alt], i) => {
      const s = el('div', 'slide' + (i === 0 ? ' active' : ''));
      const bg = el('div', 'bg'); bg.style.backgroundImage = `url(${src})`;
      const img = document.createElement('img'); img.src = src; img.alt = alt; img.loading = 'lazy'; img.draggable = false;
      s.append(bg, img); box.append(s);
      const d = el('button', 'dot' + (i === 0 ? ' active' : '')); d.type = 'button'; d.setAttribute('aria-label', 'Foto ' + (i + 1)); d.addEventListener('click', () => { show(i); reset(); }); dots.append(d);
      return s;
    });
    const ds = $$('.dot', dots);
    function show(n) {
      cur = (n + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('active', i === cur)); ds.forEach((d, i) => d.classList.toggle('active', i === cur));
      $('#sliderCount').textContent = `${cur + 1} / ${slides.length}`;
    }
    function reset() { clearInterval(timer); if (!reduce) timer = setInterval(() => show(cur + 1), 4800); }
    $('#prevBtn').addEventListener('click', () => { show(cur - 1); reset(); });
    $('#nextBtn').addEventListener('click', () => { show(cur + 1); reset(); });
    // geser jari / mouse
    const sl = $('#slider'); let x0 = null;
    sl.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    addEventListener('pointerup', (e) => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 45) { show(cur + (dx < 0 ? 1 : -1)); reset(); } });
    sl.addEventListener('pointercancel', () => { x0 = null; });
    reset(); show(0);
  }

  /* ---------- Musik & auto scroll ---------- */
  const bgm = $('#bgm'); let wantPlay = false;
  /* Versi keluarga: font simple + lagu mulai dari reff (1:50), termasuk saat diulang */
  const isFamily = new URLSearchParams(location.search).get('v') === 'keluarga';
  const MUSIC_START = isFamily ? 110 : 0;
  if (isFamily) document.documentElement.classList.add('v-keluarga');
  bgm.loop = !isFamily;
  const seekStart = () => { try { if (isFamily && bgm.currentTime < MUSIC_START - 1) bgm.currentTime = MUSIC_START; } catch (e) {} };
  bgm.addEventListener('loadedmetadata', seekStart);
  bgm.addEventListener('play', seekStart);
  bgm.addEventListener('ended', () => { if (!isFamily) return; try { bgm.currentTime = MUSIC_START; } catch (e) {} bgm.play().catch(() => {}); });
  function pickMusic() {
    const t = document.documentElement.dataset.tier;
    const src = S.music.src.replace(/\.mp3$/, t === 'low' ? '-low.mp3' : t === 'mid' ? '-mid.mp3' : '.mp3');
    if (bgm.paused && bgm.getAttribute('src') !== src) bgm.src = src;
  }
  function music() {
    pickMusic(); bgm.volume = 0.7;
    const btn = $('#musicBtn');
    const sync = () => btn.classList.toggle('on', !bgm.paused);
    bgm.addEventListener('play', sync); bgm.addEventListener('pause', sync);
    btn.addEventListener('click', () => { if (bgm.paused) { wantPlay = true; pickMusic(); bgm.play().catch(() => {}); } else { wantPlay = false; bgm.pause(); } });
    document.addEventListener('visibilitychange', () => { if (document.hidden) bgm.pause(); else if (wantPlay) bgm.play().catch(() => {}); });
  }

  let auto = false, raf = 0, pos = 0, last = 0;
  function autoScroll(on) {
    const btn = $('#scrollBtn');
    auto = on; btn.classList.toggle('on', on);
    btn.innerHTML = `<i class="fas ${on ? 'fa-pause' : 'fa-angles-down'}"></i>`;
    cancelAnimationFrame(raf);
    if (!on) return;
    pos = scrollY; last = performance.now();
    document.documentElement.style.scrollBehavior = 'auto';
    const step = (t) => {
      if (!auto) return;
      pos += (t - last) / 1000 * 55; last = t;
      scrollTo(0, pos);
      if (innerHeight + pos >= document.documentElement.scrollHeight - 4) return autoScroll(false);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }
  function stopAutoOnUser() {
    ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach((t) => addEventListener(t, (e) => {
      if (auto && !(e.target.closest && e.target.closest('#scrollBtn'))) { autoScroll(false); document.documentElement.style.scrollBehavior = ''; }
    }, { passive: true }));
    $('#scrollBtn').addEventListener('click', () => { if (auto) { autoScroll(false); document.documentElement.style.scrollBehavior = ''; } else autoScroll(true); });
  }

  /* ---------- Buka undangan ---------- */
  function openInvitation() {
    const cover = $('#cover');
    $('#main').hidden = false; $('#bottomNav').hidden = false; $('#musicBtn').hidden = false; $('#scrollBtn').hidden = false;
    document.body.classList.remove('locked');
    scrollTo(0, 0);
    cover.classList.add('open');
    setTimeout(() => { cover.hidden = true; }, 1200);
    wantPlay = true; pickMusic(); bgm.play().catch(() => { wantPlay = false; });
    setupObservers();
    if (!reduce) setTimeout(() => { if (scrollY < 80) autoScroll(true); }, 3500);
  }

  /* ---------- RSVP & buku tamu ---------- */
  const form = $('#rsvpForm');
  function note(msg, kind) { const n = $('#formNote'); n.textContent = msg; n.className = 'form-note' + (kind === 'err' ? ' err' : kind === 'info' ? ' info' : ''); n.hidden = !msg; }
  function syncPax() { $('#paxField').hidden = form.attendance.value === 'tidak'; }
  const LBL = { hadir: 'Hadir', ragu: 'Masih ragu', tidak: 'Tidak hadir' };
  const fmtTime = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' });

  function gbItem(m, i) {
    const d = el('article', 'gb-item'); d.style.setProperty('--i', i || 0);
    const head = el('div', 'gb-head');
    head.append(text('span', 'gb-name', m.name), text('span', 'badge ' + m.attendance, LBL[m.attendance] || ''));
    d.append(head, text('p', 'gb-msg', m.message), text('p', 'gb-time', fmtTime.format(new Date(m.created_at))));
    return d;
  }
  let gbOffset = 0, gbTotal = 0;
  async function loadMessages(reset) {
    const list = $('#gbList');
    try {
      if (reset) gbOffset = 0;
      const r = await SB.rpc('list_messages', { p_limit: 8, p_offset: gbOffset });
      gbTotal = r.total;
      if (reset) list.innerHTML = '';
      r.items.forEach((m, i) => list.append(gbItem(m, i)));
      gbOffset += r.items.length;
      if (!list.children.length) list.append(text('p', 'gb-empty', 'Belum ada ucapan. Jadilah yang pertama memberi doa 🤍'));
      $('#gbMore').hidden = gbOffset >= gbTotal;
    } catch (e) {
      if (!list.children.length || reset) { list.innerHTML = ''; list.append(text('p', 'gb-empty', 'Ucapan belum bisa dimuat. Coba muat ulang halaman.')); }
    }
  }

  function setupForm() {
    $('#fPax').innerHTML = Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}">${i + 1} orang</option>`).join('');
    $$('input[name=attendance]', form).forEach((r) => r.addEventListener('change', syncPax));
    $('#fMsg').addEventListener('input', (e) => { $('#msgLen').textContent = e.target.value.length; });
    $('#gbMore').addEventListener('click', () => loadMessages(false));
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); note('');
      const name = $('#fName').value.trim();
      if (!name) { note('Mohon isi nama Anda.', 'err'); $('#fName').focus(); return; }
      const btn = $('#submitBtn'), lbl = $('span', btn), old = lbl.textContent;
      btn.disabled = true; lbl.textContent = 'Mengirim…';
      try {
        await SB.rpc('submit_rsvp', { p_code: guestCode || null, p_name: name, p_attendance: form.attendance.value, p_pax: Number($('#fPax').value) || 1, p_message: $('#fMsg').value.trim() });
        note(guestCode ? 'Terima kasih! Konfirmasi Anda sudah tersimpan (bisa diubah kapan saja).' : 'Terima kasih! Konfirmasi dan ucapan Anda sudah terkirim 🤍');
        if (!guestCode) { $('#fMsg').value = ''; $('#msgLen').textContent = '0'; }
        loadMessages(true);
      } catch (err) {
        note(err.message || 'Gagal mengirim. Coba lagi.', 'err');
      } finally { btn.disabled = false; lbl.textContent = old; }
    });
    syncPax();
    loadMessages(true);
    setInterval(() => { if (!document.hidden && gbOffset <= 8) loadMessages(true); }, 45000);
  }

  /* ---------- Navigasi ---------- */
  function nav() {
    $$('#bottomNav button').forEach((b) => b.addEventListener('click', () => {
      const t = b.dataset.go === 'prologSection' ? null : document.getElementById(b.dataset.go);
      document.documentElement.style.scrollBehavior = '';
      $$('#bottomNav button').forEach((x) => x.classList.toggle('active', x === b));
      window.__navLock = true; clearTimeout(window.__navT);
      const unlock = () => { window.__navLock = false; clearTimeout(window.__navT); };
      if ('onscrollend' in window) addEventListener('scrollend', unlock, { once: true });
      window.__navT = setTimeout(unlock, 2000);
      if (t) t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); else scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    }));
  }

  /* ---------- Versi keluarga: tambah kartu Pertemuan Keluarga ---------- */
  function familyEvent() {
    if (!family || !S.eventFamily) return;
    const f = Object.assign({}, S.event, S.eventFamily);
    const when = fmtDate.format(new Date(`${f.date}T${f.start}:00${f.timezone}`));
    const time = `Pukul ${f.start.replace(':', '.')} - ${f.end.replace(':', '.')} ${f.timezoneLabel}`;
    const row = (icon, t) => { const li = el('li', '', `<i class="fas ${icon}"></i>`); li.append(text('span', '', t)); return li; };
    const list = el('ul', 'event-list');
    list.append(row('fa-calendar-days', when), row('fa-clock', time), row('fa-location-dot', f.address));
    const map = Object.assign(el('a', 'btn btn-gold', '<i class="fas fa-map-location-dot"></i> Buka Google Maps'), { href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(f.mapQuery)}`, target: '_blank', rel: 'noopener' });
    const btns = el('div', 'btn-row'); btns.append(map);
    const card = el('article', 'card event-card'); card.dataset.reveal = 'up';
    card.append(el('div', 'event-icon', '<i class="fas fa-users"></i>'), text('h3', '', f.title || 'Pertemuan Keluarga'), list, btns);
    $('#eventSection .event-card').before(card);
    $('#eventSection .sec-title').textContent = 'Rangkaian Acara';
    $('#coverDate').textContent = when;
  }

  /* ---------- Awal mula bertemu ---------- */
  function story() {
    const live = !/^(localhost|127\.)/.test(location.hostname);
    const items = (S.story || []).filter((it) => !(live && /^CONTOH/.test(it.date || '')));
    if (!items.length) return;
    $('#storySection').hidden = false;
    const list = $('#storyList');
    items.forEach((it, i) => {
      const n = el('article', 'story-item');
      n.dataset.reveal = 'up'; n.dataset.delay = i * 120;
      if (it.date) n.append(text('span', 'story-date', it.date));
      n.append(text('h3', '', it.title));
      if (it.text) n.append(text('p', '', it.text));
      list.append(n);
    });
  }

  /* ---------- Init ---------- */
  fillSite(); story(); familyEvent();
  $$('[data-letters]').forEach(splitLetters);
  $$('.sec-title').forEach(splitLetters);
  $$('[data-words]').forEach(splitWords);
  let i = 0; $$('[data-intro]').forEach((n) => { n.style.setProperty('--d', (0.25 + i++ * 0.16) + 's'); });
  buildFx(); music(); stopAutoOnUser(); calendar(); countdown(); gallery(); setupForm(); nav(); loadGuest();
  $('#openBtn').addEventListener('click', openInvitation);

  const t0 = performance.now();
  const hide = () => setTimeout(() => {
    $('#loader').classList.add('done'); document.body.classList.add('ready');
    document.documentElement.classList.add('ready'); $('#cover').classList.add('ready');
    setTimeout(() => $('#loader').remove(), 1000);
  }, Math.max(0, 1300 - (performance.now() - t0)));
  if (document.readyState === 'complete') hide(); else addEventListener('load', hide);
})();
