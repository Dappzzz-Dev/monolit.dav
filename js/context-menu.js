/* TAG: context-menu.js - custom right-click "Inspect Element" hint menu.
   Externalized from an inline <script> so the CSP can drop 'unsafe-inline'.
   Context menu ditimpa: default menu hilang, diganti item `>_ Inspect Element`
   yang menampilkan toast petunjuk (browser tidak boleh membuka DevTools via JS). */
(function(){
  const CSS = `
@keyframes ctxFadeIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
@keyframes ctxToast{0%{opacity:0;transform:translateX(-50%) translateY(8px)}12%{opacity:1;transform:translateX(-50%) translateY(0)}88%{opacity:1}100%{opacity:0;transform:translateX(-50%) translateY(-4px)}}
#ctx-inspect{position:fixed;background:rgba(20,20,22,.94);border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:6px 0;z-index:99999;font-family:'Space Mono',ui-monospace,monospace;font-size:12px;color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.5);min-width:150px;cursor:default;animation:ctxFadeIn .12s ease}
#ctx-inspect .ctx-item{padding:7px 16px;cursor:pointer;border-radius:6px;margin:0 4px;display:flex;align-items:center;gap:8px}
#ctx-inspect .ctx-item:hover{background:rgba(255,255,255,.08)}
#ctx-inspect .ctx-icon{font-size:11px;opacity:.7;font-style:normal}
#ctx-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:rgba(20,20,22,.92);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:10px 18px;z-index:99999;font-family:'Space Mono',ui-monospace,monospace;font-size:12px;color:rgba(255,255,255,.85);box-shadow:0 6px 20px rgba(0,0,0,.45);animation:ctxToast 2.8s ease forwards;pointer-events:none;white-space:nowrap}`;

  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  document.addEventListener('contextmenu', e => {
    e.preventDefault();
    const old = document.getElementById('ctx-inspect');
    if (old) old.remove();
    const menu = document.createElement('div');
    menu.id = 'ctx-inspect';
    menu.style.left = e.clientX + 'px';
    menu.style.top = e.clientY + 'px';
    const items = [
      { icon: '>_', label: 'Inspect Element', action: () => {
        const t = document.getElementById('ctx-toast');
        if (t) t.remove();
        const toast = document.createElement('div');
        toast.id = 'ctx-toast';
        toast.textContent = 'Buka DevTools: F12 atau Ctrl+Shift+I';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
      }}
    ];
    items.forEach(it => {
      const row = document.createElement('div');
      row.className = 'ctx-item';
      const ico = document.createElement('span');
      ico.className = 'ctx-icon';
      ico.textContent = it.icon;
      const txt = document.createElement('span');
      txt.textContent = it.label;
      row.appendChild(ico);
      row.appendChild(txt);
      row.onclick = () => { menu.remove(); it.action(); };
      menu.appendChild(row);
    });
    document.body.appendChild(menu);
    const close = ev => { if (!menu.contains(ev.target)) menu.remove(); };
    setTimeout(() => document.addEventListener('click', close, {once:true}), 0);
    document.addEventListener('keydown', ev => { if (ev.key==='Escape') menu.remove(); }, {once:true});
  });
})();
