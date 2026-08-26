/* TAG: app.js - small UI helpers */
(function(){
  // Set year in footer
  const YEAR = document.getElementById('year');
  if(YEAR) YEAR.textContent = new Date().getFullYear();

  // TAG: footer quick-links (data-goto) reuse the header radio nav so they get
  // the same smooth scroll / settle / indicator behavior as menu clicks.
  document.querySelectorAll('a[data-goto]').forEach(a=>{
    a.addEventListener('click', e=>{
      const input = document.querySelector(`.radio-input input[value="${a.dataset.goto}"]`);
      if(!input) return;
      e.preventDefault();
      input.checked = true;
      input.dispatchEvent(new Event('change', { bubbles:true }));
    });
  });

  // TAG: live GitHub contribution total. ghchart's squares are already live;
  // the badge number needs a data source: jogruber's public contributions
  // mirror (no token, CORS enabled). Cache 30 min in localStorage; on any
  // failure the static fallback text stays visible.
  (async function(){
    const badge = document.querySelector('[data-gh-total]');
    if(!badge) return;
    const USER = 'Dappzzz-Dev';
    const YEAR = String(new Date().getFullYear());
    const CACHE_KEY = 'dafara.gh.total.v1';
    const TTL = 30 * 60 * 1000;

    function apply(n){ badge.textContent = `Total: ${n.toLocaleString('en-US')}`; }

    try{
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if(cached && cached.user === USER && Date.now() - cached.t < TTL){
        apply(cached.total);
        return;
      }
      const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${USER}`);
      if(!res.ok) throw new Error(res.status);
      const data = await res.json();
      const total = data.total && data.total[YEAR];
      if(typeof total !== 'number') throw new Error('bad payload');
      localStorage.setItem(CACHE_KEY, JSON.stringify({ user: USER, total, t: Date.now() }));
      apply(total);
    }catch(err){
      // offline / API down -> keep whatever the badge already says
    }
  })();

  // TAG: realtime year chip on the contribution chart - checked every second
  // so it flips by itself the moment the new year starts (no reload needed).
  (function(){
    const el = document.getElementById('gh-year');
    if(!el) return;
    const tick = () => {
      const y = String(new Date().getFullYear());
      if(el.textContent !== y) el.textContent = y;
    };
    tick();
    setInterval(tick, 1000);
  })();
})();
