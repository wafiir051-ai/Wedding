/* Klien Supabase mini (tanpa SDK): RPC publik + login admin + REST. */
(function () {
  const { url, anonKey } = window.SITE.supabase;
  const KEY = 'sb-admin-session';
  let session = null;
  try { session = JSON.parse(localStorage.getItem(KEY)); } catch {}

  function store(s) {
    session = s;
    try { s ? localStorage.setItem(KEY, JSON.stringify(s)) : localStorage.removeItem(KEY); } catch {}
  }

  async function request(path, { method = 'GET', body, token, headers = {} } = {}) {
    let res;
    try {
      res = await fetch(url + path, {
        method,
        headers: { apikey: anonKey, Authorization: 'Bearer ' + (token || anonKey), 'Content-Type': 'application/json', ...headers },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      const e = new Error('Tidak bisa terhubung ke server. Periksa koneksi internet.'); e.network = true; throw e;
    }
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!res.ok) {
      const msg = (data && (data.message || data.msg || data.error_description || data.error)) || 'Terjadi kesalahan';
      const e = new Error(msg); e.status = res.status; throw e;
    }
    return data;
  }

  async function refresh() {
    if (!session || !session.refresh_token) throw new Error('Sesi berakhir');
    const d = await request('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: session.refresh_token } });
    store({ access_token: d.access_token, refresh_token: d.refresh_token, expires_at: Math.floor(Date.now() / 1000) + d.expires_in, email: (d.user && d.user.email) || session.email });
  }

  async function authed(path, opts = {}) {
    if (!session) { const e = new Error('Belum login'); e.status = 401; throw e; }
    if (session.expires_at - 60 < Date.now() / 1000) { try { await refresh(); } catch { store(null); const e = new Error('Sesi berakhir, login lagi'); e.status = 401; throw e; } }
    try { return await request(path, { ...opts, token: session.access_token }); }
    catch (e) {
      if (e.status === 401) { try { await refresh(); return await request(path, { ...opts, token: session.access_token }); } catch { store(null); } }
      throw e;
    }
  }

  window.SB = {
    // ----- publik -----
    rpc: (fn, args) => request('/rest/v1/rpc/' + fn, { method: 'POST', body: args || {} }),
    // ----- admin -----
    get session() { return session; },
    async signIn(email, password) {
      const d = await request('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } });
      store({ access_token: d.access_token, refresh_token: d.refresh_token, expires_at: Math.floor(Date.now() / 1000) + d.expires_in, email: d.user.email });
      // pastikan akun ini terdaftar sebagai admin
      const rows = await authed('/rest/v1/admins?select=user_id');
      if (!rows || !rows.length) { store(null); throw new Error('Akun ini bukan admin. Daftarkan di tabel admins (lihat schema.sql).'); }
    },
    signOut() {
      const t = session && session.access_token;
      store(null);
      if (t) request('/auth/v1/logout', { method: 'POST', token: t }).catch(() => {});
    },
    select: (path) => authed('/rest/v1/' + path),
    insert: (table, rows) => authed('/rest/v1/' + table, { method: 'POST', body: rows, headers: { Prefer: 'return=representation' } }),
    patch: (path, body) => authed('/rest/v1/' + path, { method: 'PATCH', body, headers: { Prefer: 'return=minimal' } }),
    remove: (path) => authed('/rest/v1/' + path, { method: 'DELETE', headers: { Prefer: 'return=minimal' } }),
    changePassword: (password) => authed('/auth/v1/user', { method: 'PUT', body: { password } }),
  };
})();
