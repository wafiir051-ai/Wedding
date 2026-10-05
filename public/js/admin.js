/* Panel admin — memakai Supabase Auth + RLS */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const el = (t, c, txt) => { const e = document.createElement(t); if (c) e.className = c; if (txt != null) e.textContent = txt; return e; };
  const LBL = { hadir: 'Hadir', ragu: 'Ragu', tidak: 'Tidak hadir' };
  const fmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' });
  const base = location.origin + location.pathname.replace(/admin(\.html)?\/?$/, '');
  let all = [];

  function toast(m) { const t = $('#toast'); t.textContent = m; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), 2200); }
  function guard(e) { if (e.status === 401) { showLogin(); } else toast(e.message || 'Terjadi kesalahan'); }
  const link = (g) => `${base}?to=${encodeURIComponent(g.name)}&c=${g.code}`;

  function showLogin() { $('#appView').hidden = true; $('#loginView').hidden = false; }
  async function showApp() {
    $('#loginView').hidden = true; $('#appView').hidden = false;
    $('#who').textContent = SB.session.email || '';
    await Promise.all([loadRsvps(), loadGuests()]);
  }

  /* ----- Login ----- */
  $('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const m = $('#lMsg'), b = $('button', e.target); m.hidden = true; b.disabled = true;
    try { await SB.signIn($('#lEmail').value.trim(), $('#lPass').value); $('#lPass').value = ''; await showApp(); }
    catch (err) { m.textContent = /invalid login/i.test(err.message) ? 'Email atau password salah' : err.message; m.hidden = false; }
    finally { b.disabled = false; }
  });
  $('#logoutBtn').addEventListener('click', () => { SB.signOut(); showLogin(); });

  $('#pwBtn').addEventListener('click', () => { $('#pwNew').value = ''; $('#pwMsg').hidden = true; $('#pwDialog').showModal(); });
  $('#pwForm').addEventListener('submit', async (e) => {
    if (e.submitter && e.submitter.value === 'cancel') return;
    e.preventDefault();
    const m = $('#pwMsg');
    try { await SB.changePassword($('#pwNew').value); $('#pwDialog').close(); toast('Password diganti'); }
    catch (err) { m.textContent = err.message; m.className = 'msg err'; m.hidden = false; }
  });

  /* ----- Tab ----- */
  $$('.tab').forEach((t) => t.addEventListener('click', () => {
    $$('.tab').forEach((x) => x.classList.toggle('active', x === t));
    ['rsvp', 'guests'].forEach((n) => ($('#tab-' + n).hidden = n !== t.dataset.tab));
  }));

  /* ----- RSVP ----- */
  async function loadRsvps() {
    try { all = await SB.select('rsvps?select=*&order=updated_at.desc&limit=2000'); renderStats(); renderRsvps(); }
    catch (e) { guard(e); }
  }
  function renderStats() {
    const hadir = all.filter((r) => r.attendance === 'hadir');
    const items = [
      ['Total respon', all.length], ['Hadir', hadir.length], ['Total tamu hadir', hadir.reduce((a, r) => a + r.pax, 0)],
      ['Masih ragu', all.filter((r) => r.attendance === 'ragu').length], ['Tidak hadir', all.filter((r) => r.attendance === 'tidak').length],
      ['Ucapan', all.filter((r) => r.message).length],
    ];
    const box = $('#stats'); box.innerHTML = '';
    items.forEach(([l, v]) => { const d = el('div', 'stat'); d.append(el('b', '', v), el('span', '', l)); box.append(d); });
  }
  function renderRsvps() {
    const q = $('#q').value.trim().toLowerCase(), st = $('#statusFilter').value;
    const rows = all.filter((r) => (!st || r.attendance === st) && (!q || (r.name + ' ' + r.message).toLowerCase().includes(q)));
    const body = $('#rsvpBody'); body.innerHTML = '';
    rows.forEach((r) => {
      const tr = el('tr', r.visible ? '' : 'hidden-row');
      const b = el('span', 'badge ' + r.attendance, LBL[r.attendance]);
      const s = el('td'); s.append(b);
      const act = el('td'); const a = el('div', 'actions');
      const eye = el('button', 'btn sm', r.visible ? 'Sembunyikan' : 'Tampilkan');
      eye.onclick = async () => { try { await SB.patch('rsvps?id=eq.' + r.id, { visible: !r.visible }); r.visible = !r.visible; renderRsvps(); } catch (e) { guard(e); } };
      const del = el('button', 'btn sm danger', 'Hapus');
      del.onclick = async () => { if (!confirm(`Hapus data ${r.name}?`)) return; try { await SB.remove('rsvps?id=eq.' + r.id); all = all.filter((x) => x.id !== r.id); renderStats(); renderRsvps(); } catch (e) { guard(e); } };
      a.append(eye, del); act.append(a);
      const msg = el('td', 'msgcell', r.message || '—');
      tr.append(el('td', '', r.name), s, el('td', '', r.attendance === 'tidak' ? '—' : r.pax), msg, el('td', '', fmt.format(new Date(r.updated_at))), act);
      body.append(tr);
    });
    $('#rsvpEmpty').hidden = rows.length > 0;
  }
  $('#q').addEventListener('input', renderRsvps);
  $('#statusFilter').addEventListener('change', renderRsvps);
  $('#reload').addEventListener('click', () => { loadRsvps(); loadGuests(); });
  $('#csv').addEventListener('click', () => {
    const c = (v) => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
    const lines = [['No', 'Nama', 'Kehadiran', 'Jumlah Tamu', 'Ucapan', 'Ditampilkan', 'Waktu'].map(c).join(',')];
    [...all].reverse().forEach((r, i) => lines.push([i + 1, r.name, LBL[r.attendance], r.pax, r.message, r.visible ? 'ya' : 'tidak', r.updated_at].map(c).join(',')));
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })), download: 'rsvp-agus-sinta.csv' });
    document.body.append(a); a.click(); a.remove();
  });

  /* ----- Tamu ----- */
  async function loadGuests() {
    try {
      const rows = await SB.select('guests?select=id,code,name,label,created_at,rsvps(attendance,pax)&order=created_at.desc&limit=2000');
      const body = $('#guestBody'); body.innerHTML = '';
      rows.forEach((g) => {
        const r = Array.isArray(g.rsvps) ? g.rsvps[0] : g.rsvps;
        const tr = el('tr'); const st = el('td');
        st.append(r ? el('span', 'badge ' + r.attendance, LBL[r.attendance] + (r.attendance !== 'tidak' ? ` · ${r.pax}` : '')) : el('span', 'badge none', 'Belum'));
        const act = el('td'); const a = el('div', 'actions');
        const mk = (label, fn) => { const b = el('button', 'btn sm', label); b.onclick = fn; return b; };
        const msg = () => (window.SITE.shareMessage || '{link}').replace(/\{nama\}/g, g.name).replace(/\{link\}/g, link(g));
        const clip = async (t, ok) => { try { await navigator.clipboard.writeText(t); toast(ok); } catch { prompt('Salin manual:', t); } };
        a.append(mk('Salin link', () => clip(link(g), 'Link disalin')), mk('Salin pesan', () => clip(msg(), 'Pesan WhatsApp disalin')),
          mk('WhatsApp', () => window.open('https://wa.me/?text=' + encodeURIComponent(msg()), '_blank', 'noopener')));
        const l = el('td'); l.append(a);
        const d = el('button', 'btn sm danger', 'Hapus');
        d.onclick = async () => { if (!confirm(`Hapus tamu ${g.name}? (data RSVP-nya tetap tersimpan)`)) return; try { await SB.remove('guests?id=eq.' + g.id); loadGuests(); } catch (e) { guard(e); } };
        const dc = el('td'); dc.append(d);
        tr.append(el('td', '', g.name), el('td', '', g.label || '—'), st, l, dc); body.append(tr);
      });
      $('#guestEmpty').hidden = rows.length > 0;
    } catch (e) { guard(e); }
  }
  $('#gAdd').addEventListener('click', async () => {
    const names = $('#gNames').value.split('\n').map((s) => s.trim()).filter(Boolean);
    if (!names.length) return toast('Isi minimal satu nama');
    const label = $('#gLabel').value.trim();
    try { await SB.insert('guests', names.map((name) => ({ name: name.slice(0, 80), label }))); $('#gNames').value = ''; toast(`${names.length} tamu ditambahkan`); loadGuests(); }
    catch (e) { guard(e); }
  });

  /* ----- Mulai ----- */
  if (SB.session) showApp().catch(showLogin); else showLogin();
})();
