// TAG: admin.js - portfolio project manager.
// Draft lives in localStorage; publishing commits data/projects.json (+ images)
// straight to GitHub via the Contents API using a fine-grained PAT that only
// ever lives in sessionStorage. No secrets are stored in this file.
(function(){
  'use strict';

  // TAG: Storage keys
  const LS_CFG   = 'dafara.admin.cfg.v1';    // {owner, repo, branch}
  const SS_TOKEN = 'dafara.admin.token';     // PAT, tab-scoped, never persisted
  const LS_DRAFT = 'dafara.admin.draft.v1';  // {version,_dirty,updatedAt,projects[]}

  const $ = (id)=> document.getElementById(id);
  const els = {
    chipPublish: $('chip-publish'), chipConn: $('chip-conn'),
    owner: $('cfg-owner'), repo: $('cfg-repo'), branch: $('cfg-branch'),
    token: $('cfg-token'), connect: $('btn-connect'), disconnect: $('btn-disconnect'),
    connMsg: $('conn-msg'),
    add: $('btn-add'), publish: $('btn-publish'),
    exportBtn: $('btn-export'), importBtn: $('btn-import'), importFile: $('import-file'),
    list: $('proj-list'), listEmpty: $('list-empty'),
    editor: $('editor'), form: $('editor-form'), edTitle: $('editor-title'),
    fTitle: $('f-title'), fDesc: $('f-desc'), fYear: $('f-year'), fRole: $('f-role'), fTech: $('f-tech'), fImage: $('f-image'), fPreview: $('f-preview'),
    fDemo: $('f-demo'), fRepo: $('f-repo'), formError: $('form-error'),
    close: $('editor-close'), cancel: $('editor-cancel'),
    // TAG: dashboard shell elements (Pamer.co-style layout)
    gate: $('gate'), app: $('app'),
    userLabel: $('user-label'), logoutBtn: $('btn-disconnect'),
    ovGrid: $('ov-grid'), ovSearch: $('ov-search'), ovEmpty: $('ov-empty'), ovCount: $('ov-count'),
    dirtyHint: $('chip-dirty-hint'),
    toasts: $('toasts')
  };
  const navItems = Array.from(document.querySelectorAll('.nav-item[data-view]'));
  const views = { overview: $('view-overview'), projects: $('view-projects') };

  let token = sessionStorage.getItem(SS_TOKEN) || '';
  let draft = null;          // working copy; null until first load/import
  let editingId = null;      // project id being edited, null = adding
  let pendingImage = null;   // {dataURL, ext} chosen in editor, not yet saved

  // TAG: Small helpers ------------------------------------------------------
  function toast(kind, msg){
    const t = document.createElement('div');
    t.className = 'toast ' + (kind || '');
    t.textContent = msg;
    els.toasts.appendChild(t);
    setTimeout(()=> t.remove(), 4200);
  }
  function getCfg(){
    return {
      owner: els.owner.value.trim(),
      repo: els.repo.value.trim(),
      branch: (els.branch.value.trim() || 'main')
    };
  }
  function b64(str){
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    for(const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin);
  }
  function b64FromBytes(bytes){
    let bin = '';
    for(let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  function dataURLBytes(dataURL){
    const head = dataURL.slice(0, dataURL.indexOf(','));
    const mime = (head.match(/data:([^;]+)/) || [,'application/octet-stream'])[1];
    const bin = atob(dataURL.slice(dataURL.indexOf(',') + 1));
    const bytes = new Uint8Array(bin.length);
    for(let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return { mime, bytes };
  }
  function isUrl(s){ return /^https:\/\/\S+$/.test(s); }

  // TAG: GitHub API ---------------------------------------------------------
  async function ghFetch(path, opts = {}){
    return fetch('https://api.github.com' + path, Object.assign({}, opts, {
      headers: Object.assign({
        'Accept': 'application/vnd.github+json',
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }, opts.headers || {})
    }));
  }

  async function ghPutContents(path, contentB64, message){
    const { owner, repo, branch } = getCfg();
    const enc = path.split('/').map(encodeURIComponent).join('/');
    let sha = null;
    const get = await ghFetch(`/repos/${owner}/${repo}/contents/${enc}?ref=${encodeURIComponent(branch)}`);
    if(get.status === 200) sha = (await get.json()).sha;
    else if(get.status !== 404) throw new Error(`Gagal membaca ${path} (HTTP ${get.status})`);
    const res = await ghFetch(`/repos/${owner}/${repo}/contents/${enc}`, {
      method: 'PUT',
      body: JSON.stringify({ message, content: contentB64, sha, branch })
    });
    if(!res.ok) throw new Error(`Gagal menulis ${path}: ${(await res.text()).slice(0, 180)}`);
  }

  // TAG: Connection state ---------------------------------------------------
  function setConnUI(state, msg, isErr){
    els.chipConn.textContent = state === 'on' ? 'terhubung: ' + getCfg().repo : 'belum terhubung';
    els.chipConn.classList.toggle('on', state === 'on');
    els.disconnect.hidden = state !== 'on';
    els.connect.textContent = state === 'on' ? 'Terhubung ✓' : 'Masuk sebagai Admin';
    els.connMsg.textContent = msg || '';
    els.connMsg.classList.toggle('err', !!isErr);
    // TAG: the login gate IS the logged-out state; shell appears only when connected
    const on = state === 'on';
    els.app.hidden = !on;
    els.gate.hidden = on;
    if(on) switchView(currentView);
    refreshToolbar();
  }

  // TAG: View switching (Overview / Projects) --------------------------------
  let currentView = 'overview';
  function switchView(name){
    currentView = name;
    Object.entries(views).forEach(([key, el])=>{ if(el) el.hidden = key !== name; });
    navItems.forEach(btn => btn.classList.toggle('active', btn.dataset.view === name));
  }

  function refreshToolbar(){
    const hasProjects = !!(draft && draft.projects.length);
    els.publish.disabled = !(token && hasProjects);
    els.publish.textContent = token ? 'Publish ke GitHub' : 'Publish (hubungkan dulu)';
    els.chipPublish.hidden = !(draft && draft._dirty);
    els.chipPublish.classList.toggle('warn', true);
    if(els.dirtyHint) els.dirtyHint.hidden = !(draft && draft._dirty);
  }

  async function connect(){
    const cfg = getCfg();
    if(!cfg.owner || !cfg.repo){ setConnUI('off', 'Owner dan repo wajib diisi.', true); return; }
    const tok = els.token.value.trim() || token;
    if(!tok){ setConnUI('off', 'Token wajib diisi.', true); return; }
    token = tok;
    els.connect.disabled = true;
    try{
      const res = await ghFetch(`/repos/${cfg.owner}/${cfg.repo}`);
      if(res.status === 401) throw new Error('Token tidak valid (401).');
      if(res.status === 404) throw new Error('Repo tidak ditemukan atau token tidak punya akses (404).');
      if(!res.ok) throw new Error('GitHub menjawab HTTP ' + res.status + '.');
      sessionStorage.setItem(SS_TOKEN, token);
      localStorage.setItem(LS_CFG, JSON.stringify(cfg));
      els.token.value = '';
      // First run with no local draft: pull remote data as the starting point.
      if(!draft){
        const f = await ghFetch(`/repos/${cfg.owner}/${cfg.repo}/contents/data/projects.json?ref=${encodeURIComponent(cfg.branch)}`);
        if(f.ok){
          draft = JSON.parse(b64ToStr((await f.json()).content));
          saveDraft(false);
          renderList();
        }
      }
      const me = await ghFetch('/user').then(r => r.ok ? r.json() : null);
      const who = me && me.login ? '@' + me.login : 'admin';
      els.userLabel.textContent = who;
      setConnUI('on', 'Selamat datang, ' + who + '.');
    }catch(err){
      sessionStorage.removeItem(SS_TOKEN);
      setConnUI('off', err.message, true);
    }finally{
      els.connect.disabled = false;
    }
  }

  function disconnect(){
    token = '';
    sessionStorage.removeItem(SS_TOKEN);
    setConnUI('off', 'Token dibuang dari sesi ini.');
  }

  function b64ToStr(b64str){
    const bin = atob(b64str.replace(/\s/g, ''));
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  // TAG: Draft persistence --------------------------------------------------
  function saveDraft(markDirty){
    if(!draft) return;
    if(markDirty) draft._dirty = true;
    draft.updatedAt = new Date().toISOString();
    localStorage.setItem(LS_DRAFT, JSON.stringify(draft));
    refreshToolbar();
  }
  function setClean(){
    draft._dirty = false;
    localStorage.setItem(LS_DRAFT, JSON.stringify(draft));
    refreshToolbar();
  }

  // TAG: List rendering -----------------------------------------------------
  function renderList(){
    els.list.innerHTML = '';
    const projects = draft ? draft.projects : [];
    els.listEmpty.hidden = projects.length > 0;
    projects.forEach((p, i)=>{
      const li = document.createElement('li');
      li.className = 'proj-row';

      const img = document.createElement('img');
      img.src = p.image || '';
      img.alt = '';

      const info = document.createElement('div');
      info.className = 'proj-info';
      const b = document.createElement('b'); b.textContent = p.title || '(tanpa judul)';
      const meta = document.createElement('span');
      const flags = [p.demoUrl ? 'demo' : null, p.repoUrl ? 'repo' : null].filter(Boolean).join(' · ');
      meta.textContent = p.id + (flags ? ' · ' + flags : '') + (String(p.image).startsWith('data:') ? ' · gambar belum diupload' : '');
      info.append(b, meta);

      const actions = document.createElement('div');
      actions.className = 'proj-actions';
      const mk = (label, title, cls, fn, disabled)=>{
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'icon-btn ' + (cls || '');
        btn.textContent = label;
        btn.title = title;
        btn.disabled = !!disabled;
        btn.addEventListener('click', fn);
        return btn;
      };
      actions.append(
        mk('↑', 'Naikkan', '', ()=> move(i, -1), i === 0),
        mk('↓', 'Turunkan', '', ()=> move(i, +1), i === projects.length - 1),
        mk('✎', 'Edit', '', ()=> openEditor(p.id)),
        mk('✕', 'Hapus', 'danger', ()=> removeProject(p.id))
      );

      li.append(img, info, actions);
      els.list.appendChild(li);
    });
    renderGrid();
    refreshToolbar();
  }

  // TAG: Overview grid - Pamer-style cards (image / desc / links / actions) ---
  function renderGrid(){
    if(!els.ovGrid) return;
    const projects = draft ? draft.projects : [];
    const q = (els.ovSearch.value || '').trim().toLowerCase();
    const filtered = !q ? projects : projects.filter(p =>
      String(p.title || '').toLowerCase().includes(q) ||
      String(p.description || '').toLowerCase().includes(q));

    els.ovGrid.innerHTML = '';
    filtered.forEach(p => {
      const card = document.createElement('article');
      card.className = 'pcard';

      const imgWrap = document.createElement('div');
      imgWrap.className = 'pcard-img';
      const img = document.createElement('img');
      img.src = p.image || '';
      img.alt = p.title || '';
      img.loading = 'lazy';
      imgWrap.appendChild(img);

      const body = document.createElement('div');
      body.className = 'pcard-body';
      const h = document.createElement('h3');
      h.className = 'pcard-title';
      h.textContent = p.title || '(tanpa judul)';
      const d = document.createElement('p');
      d.className = 'pcard-desc';
      d.textContent = p.description || '';
      body.append(h, d);

      if(p.repoUrl || p.demoUrl){
        const links = document.createElement('div');
        links.className = 'pcard-links';
        if(p.repoUrl){
          const a = document.createElement('a');
          a.className = 'ghost sm'; a.href = p.repoUrl;
          a.target = '_blank'; a.rel = 'noopener noreferrer';
          a.textContent = 'GitHub';
          links.appendChild(a);
        }
        if(p.demoUrl){
          const a = document.createElement('a');
          a.className = 'cta sm'; a.href = p.demoUrl;
          a.target = '_blank'; a.rel = 'noopener noreferrer';
          a.textContent = 'Live Demo';
          links.appendChild(a);
        }
        body.appendChild(links);
      }

      const actions = document.createElement('div');
      actions.className = 'pcard-actions';
      const edit = document.createElement('button');
      edit.type = 'button'; edit.className = 'ghost sm'; edit.textContent = '✎ Edit';
      edit.addEventListener('click', ()=> openEditor(p.id));
      const del = document.createElement('button');
      del.type = 'button'; del.className = 'ghost sm danger'; del.textContent = 'Hapus';
      del.addEventListener('click', ()=> removeProject(p.id));
      actions.append(edit, del);

      card.append(imgWrap, body, actions);
      els.ovGrid.appendChild(card);
    });

    els.ovEmpty.hidden = filtered.length > 0;
    els.ovEmpty.textContent = projects.length
      ? 'Tidak ada yang cocok dengan pencarian.'
      : 'Belum ada project. Klik “+ Tambah Project”.';
    els.ovCount.textContent = String(filtered.length);
  }

  function move(i, dir){
    const j = i + dir;
    const arr = draft.projects;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    saveDraft(true); renderList();
  }

  function removeProject(id){
    const p = draft.projects.find(x => x.id === id);
    if(!p || !confirm(`Hapus "${p.title}" dari draf? (Publish untuk menerapkan.)`)) return;
    draft.projects = draft.projects.filter(x => x.id !== id);
    // honey: file gambar lama dibiarkan di repo (orphan) — hapus manual via GitHub bila perlu
    saveDraft(true); renderList();
    toast('', 'Dihapus dari draf.');
  }

  // TAG: Image handling -----------------------------------------------------
  function compressImage(file){
    return new Promise((resolve, reject)=>{
      if(file.type === 'image/svg+xml' && file.size <= 300 * 1024){
        const fr = new FileReader();
        fr.onload = ()=> resolve({ dataURL: String(fr.result), ext: 'svg' });
        fr.onerror = ()=> reject(new Error('Gagal membaca file.'));
        fr.readAsDataURL(file);
        return;
      }
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = ()=>{
        try{
          const max = 1600;
          const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
          const w = Math.max(1, Math.round(img.naturalWidth * scale));
          const h = Math.max(1, Math.round(img.naturalHeight * scale));
          const c = document.createElement('canvas');
          c.width = w; c.height = h;
          c.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve({ dataURL: c.toDataURL('image/jpeg', 0.82), ext: 'jpg' });
        }catch(e){ reject(e); }
        finally{ URL.revokeObjectURL(url); }
      };
      img.onerror = ()=>{ URL.revokeObjectURL(url); reject(new Error('File bukan gambar yang valid.')); };
      img.src = url;
    });
  }

  // TAG: Editor dialog ------------------------------------------------------
  function openEditor(id){
    editingId = id || null;
    pendingImage = null;
    const p = id ? draft.projects.find(x => x.id === id) : null;
    els.edTitle.textContent = p ? 'Edit Project' : 'Tambah Project';
    els.fTitle.value = p ? p.title : '';
    els.fDesc.value = p ? p.description : '';
    els.fYear.value = p ? (p.year || '') : '';
    els.fRole.value = p ? (p.role || '') : '';
    els.fTech.value = p ? (Array.isArray(p.tech) ? p.tech.join(', ') : (p.tech || '')) : '';
    els.fDemo.value = p ? (p.demoUrl || '') : '';
    els.fRepo.value = p ? (p.repoUrl || '') : '';
    els.fImage.value = '';
    setPreview(p ? p.image : null);
    els.formError.hidden = true;
    els.editor.hidden = false;
    els.fTitle.focus();
  }
  function closeEditor(){ els.editor.hidden = true; }
  function setPreview(src){
    if(src){ els.fPreview.src = src; els.fPreview.hidden = false; }
    else{ els.fPreview.removeAttribute('src'); els.fPreview.hidden = true; }
  }

  els.fImage.addEventListener('change', async ()=>{
    const file = els.fImage.files[0];
    if(!file) return;
    try{
      pendingImage = await compressImage(file);
      setPreview(pendingImage.dataURL);
      els.formError.hidden = true;
    }catch(err){
      els.fImage.value = ''; pendingImage = null; setPreview(null);
      els.formError.textContent = 'Gambar: ' + err.message;
      els.formError.hidden = false;
    }
  });

  els.form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const title = els.fTitle.value.trim();
    const description = els.fDesc.value.trim();
    const year = els.fYear.value.trim();
    const role = els.fRole.value.trim();
    const tech = els.fTech.value.split(',').map(s => s.trim()).filter(Boolean);
    const demoUrl = els.fDemo.value.trim();
    const repoUrl = els.fRepo.value.trim();
    const problems = [];
    if(!title) problems.push('Judul wajib.');
    if(!description) problems.push('Deskripsi wajib.');
    if(demoUrl && !isUrl(demoUrl)) problems.push('Link demo harus URL https://.');
    if(repoUrl && !isUrl(repoUrl)) problems.push('Link repo harus URL https://.');

    const existing = editingId ? draft.projects.find(x => x.id === editingId) : null;
    const image = pendingImage ? pendingImage.dataURL : (existing ? existing.image : '');
    if(!image) problems.push('Gambar project wajib.');
    if(problems.length){
      els.formError.textContent = problems.join(' ');
      els.formError.hidden = false;
      return;
    }

    if(existing){
      Object.assign(existing, { title, description, year, role, tech, demoUrl, repoUrl });
      if(pendingImage) existing.image = pendingImage.dataURL;
      toast('', 'Perubahan disimpan ke draf.');
    }else{
      draft.projects.push({
        id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        title, description,
        year, role, tech,
        image: pendingImage.dataURL,
        demoUrl, repoUrl
      });
      toast('', 'Project ditambahkan ke draf.');
    }
    saveDraft(true); renderList(); closeEditor();
  });

  // TAG: Publish ------------------------------------------------------------
  async function publish(){
    if(!token || !draft) return;
    if(draft._dirty !== false && !confirm('Commit data + gambar ke repo sekarang?')) return;
    els.publish.disabled = true;
    els.publish.textContent = 'Mengunggah…';
    try{
      const projects = [];
      for(const p of draft.projects){
        const copy = Object.assign({}, p);
        if(String(copy.image).startsWith('data:')){
          const { mime, bytes } = dataURLBytes(copy.image);
          const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : mime === 'image/svg+xml' ? 'svg' : 'jpg';
          const path = `assets/projects/${copy.id}.${ext}`;
          await ghPutContents(path, b64FromBytes(bytes), 'chore(projects): upload ' + path);
          copy.image = path;
        }
        projects.push(copy);
      }
      const json = JSON.stringify({ version: 1, updatedAt: new Date().toISOString(), projects }, null, 2) + '\n';
      await ghPutContents('data/projects.json', b64(json), 'chore(projects): update portfolio data');
      draft.projects = projects;
      setClean(); renderList();
      toast('ok', 'Terpublish! Situs akan diperbarui setelah Pages redeploy (±1 menit).');
    }catch(err){
      toast('err', 'Publish gagal: ' + err.message);
      refreshToolbar();
    }
  }

  // TAG: Export / Import ----------------------------------------------------
  els.exportBtn.addEventListener('click', ()=>{
    if(!draft){ toast('err', 'Belum ada draf untuk diekspor.'); return; }
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'projects-draf.json';
    a.click();
    setTimeout(()=> URL.revokeObjectURL(a.href), 1000);
  });
  els.importBtn.addEventListener('click', ()=> els.importFile.click());
  els.importFile.addEventListener('change', ()=>{
    const file = els.importFile.files[0];
    els.importFile.value = '';
    if(!file) return;
    const fr = new FileReader();
    fr.onload = ()=>{
      try{
        const parsed = JSON.parse(String(fr.result));
        const projects = Array.isArray(parsed) ? parsed : parsed.projects;
        if(!Array.isArray(projects)) throw new Error('Format tidak dikenali.');
        draft = {
          version: 1, _dirty: true, updatedAt: new Date().toISOString(),
          projects: projects.map(p => ({
            id: String(p.id || ('p' + Date.now().toString(36))),
            title: String(p.title || ''),
            description: String(p.description || ''),
            year: String(p.year || ''),
            role: String(p.role || ''),
            tech: Array.isArray(p.tech) ? p.tech.map(String) : String(p.tech || '').split(',').map(s => s.trim()).filter(Boolean),
            image: String(p.image || ''),
            demoUrl: String(p.demoUrl || ''),
            repoUrl: String(p.repoUrl || '')
          }))
        };
        saveDraft(false); renderList();
        toast('ok', 'Impor berhasil — draf dimuat.');
      }catch(err){ toast('err', 'Impor gagal: ' + err.message); }
    };
    fr.readAsText(file);
  });

  // TAG: Wire static controls ----------------------------------------------
  // Login gate: the whole card is a form - submit = login (no separate click
  // handler on the button, that would fire twice).
  $('gate-form').addEventListener('submit', (e)=>{ e.preventDefault(); connect(); });
  els.disconnect.addEventListener('click', disconnect);
  els.publish.addEventListener('click', publish);
  els.add.addEventListener('click', ()=> openEditor(null));
  $('btn-add-side').addEventListener('click', ()=> openEditor(null));
  navItems.forEach(btn => btn.addEventListener('click', ()=> switchView(btn.dataset.view)));
  if(els.ovSearch) els.ovSearch.addEventListener('input', renderGrid);
  els.close.addEventListener('click', closeEditor);
  els.cancel.addEventListener('click', closeEditor);
  els.editor.addEventListener('click', (e)=>{ if(e.target === els.editor) closeEditor(); });
  window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && !els.editor.hidden) closeEditor(); });
  [els.owner, els.repo, els.branch].forEach(inp=>{
    inp.addEventListener('change', ()=>{
      localStorage.setItem(LS_CFG, JSON.stringify(getCfg()));
      if(token) setConnUI('off', 'Konfigurasi berubah — hubungkan ulang.');
    });
  });

  // TAG: Boot - restore config, draft, and an unexpired session token -------
  (function boot(){
    const cfg = JSON.parse(localStorage.getItem(LS_CFG) || '{}');
    els.owner.value = cfg.owner || '';
    els.repo.value = cfg.repo || '';
    els.branch.value = cfg.branch || 'main';
    try{
      const saved = JSON.parse(localStorage.getItem(LS_DRAFT) || 'null');
      if(saved && Array.isArray(saved.projects)){
        draft = Object.assign({ version: 1, _dirty: false }, saved);
      }
    }catch(e){}
    renderList();
    if(token){
      setConnUI('off', 'Memulihkan sesi…');
      connect();
    }else{
      setConnUI('off', 'Masuk untuk mengelola portfolio.');
    }
  })();
})();
