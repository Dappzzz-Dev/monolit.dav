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

  // TAG: GitHub contribution year navigator
  // Browse contributions by year. Total per year is computed by summing the
  // `count` of each contribution entry in that year (accurate, matches the
  // green cells), fetched once from jogruber v4 and cached 30 min per year.
  // ghchart.rshah.org can't render a specific year, so the visual chart stays
  // the current-year tile while the year chip + total follow the selection.
  (function(){
    const USER = 'Dappzzz-Dev';
    const CURRENT_YEAR = new Date().getFullYear();
    const MIN_YEAR = 2023;
    const API = 'https://github-contributions-api.jogruber.de/v4/' + USER;
    let selectedYear = CURRENT_YEAR;

    const badge = document.querySelector('[data-gh-total]');
    const yearChip = document.getElementById('gh-year');
    const prevBtn = document.getElementById('gh-prev');
    const nextBtn = document.getElementById('gh-next');

    if(!badge || !prevBtn || !nextBtn) return;

    // Fallback static total (only visible before first successful fetch)
    const STATIC = 1787;

    function applyTotal(n){
      badge.textContent = `Total: ${n.toLocaleString('en-US')}`;
    }

    function updateButtons(){
      prevBtn.disabled = selectedYear <= MIN_YEAR;
      nextBtn.disabled = selectedYear >= CURRENT_YEAR;
    }

    // Fetch full contributions once, cache, then aggregate per year on demand.
    let fullTotal = null; // { year: sum }
    async function loadAll(){
      const CACHE_KEY = 'dafara.gh.allyears.v2';
      const TTL = 30 * 60 * 1000;
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if(cached && Date.now() - cached.t < TTL && cached.user === USER){
        fullTotal = cached.total;
        return;
      }
      const res = await fetch(API);
      if(!res.ok) throw new Error(res.status);
      const data = await res.json();
      const contrib = data.contributions || [];
      const sum = {};
      for(const c of contrib){
        const y = String((c.date || '').slice(0,4));
        const n = c.count || 0;
        if(n > 0) sum[y] = (sum[y] || 0) + n;
      }
      fullTotal = sum;
      localStorage.setItem(CACHE_KEY, JSON.stringify({ user: USER, total: sum, t: Date.now() }));
    }

    async function showYear(year){
      if(yearChip) yearChip.textContent = year;
      if(!fullTotal){
        try{ await loadAll(); }catch(e){ /* keep badge as-is */ }
      }
      const n = fullTotal && fullTotal[String(year)];
      applyTotal(typeof n === 'number' ? n : (year === CURRENT_YEAR ? STATIC : 0));
    }

    prevBtn.addEventListener('click', ()=>{ if(selectedYear > MIN_YEAR){ selectedYear--; updateButtons(); showYear(selectedYear); } });
    nextBtn.addEventListener('click', ()=>{ if(selectedYear < CURRENT_YEAR){ selectedYear++; updateButtons(); showYear(selectedYear); } });

    updateButtons();
    showYear(CURRENT_YEAR);
  })();
})();
