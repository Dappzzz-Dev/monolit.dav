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

  // TAG: GitHub contribution year navigator + heatmap
  // Data from jogruber v4 (per-day {date, count, level}). We cache the raw
  // array once and render BOTH the accurate per-year total AND a real
  // GitHub-style heatmap (7 rows = days, columns = weeks) so each year shows
  // its own distinct green cells. Total = sum of counts for the year.
  (function(){
    const USER = 'Dappzzz-Dev';
    const CURRENT_YEAR = new Date().getFullYear();
    const MIN_YEAR = 2023;
    const API = 'https://github-contributions-api.jogruber.de/v4/' + USER;
    let selectedYear = CURRENT_YEAR;

    const badge = document.querySelector('[data-gh-total]');
    const heatmap = document.getElementById('gh-heatmap');
    const prevBtn = document.getElementById('gh-prev');
    const nextBtn = document.getElementById('gh-next');

    if(!badge || !heatmap || !prevBtn || !nextBtn) return;

    const STATIC = 1787;
    let mapped = {};    // { 'YYYY-MM-DD': level }
    let counts = {};    // { 'YYYY-MM-DD': count }
    let loaded = false;

    function applyTotal(n){
      badge.textContent = `Total: ${n.toLocaleString('en-US')}`;
    }

    function updateButtons(){
      prevBtn.disabled = selectedYear <= MIN_YEAR;
      nextBtn.disabled = selectedYear >= CURRENT_YEAR;
    }

    async function loadData(){
      const CACHE_KEY = 'dafara.gh.raw.v3';
      const TTL = 30 * 60 * 1000;
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if(cached && Date.now() - cached.t < TTL && cached.user === USER){
        mapped = cached.mapped;
        return;
      }
      const res = await fetch(API);
      if(!res.ok) throw new Error(res.status);
      const data = await res.json();
      const contrib = data.contributions || [];
      mapped = {};
      for(const c of contrib){
        if(c.date) mapped[c.date] = (c.level !== undefined ? c.level : (c.count > 0 ? 1 : 0));
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify({ user: USER, mapped, t: Date.now() }));
      counts = {};
      for(const c of contrib){
        if(c.date) counts[c.date] = c.count || 0;
      }
      localStorage.setItem('dafara.gh.counts.v3', JSON.stringify({ user: USER, counts, t: Date.now() }));
    }

    // Render GitHub-style grid: 7 rows (days Mon..Sun), columns = weeks.
    // Each cell colored by level of its date.
    function renderHeatmap(year){
      const start = new Date(`${year}-01-01`);
      const end = new Date(`${year}-12-31`);
      // Monday-based columns: Monday on/before Jan 1
      const firstMonday = new Date(start);
      while(firstMonday.getDay() !== 1){ firstMonday.setDate(firstMonday.getDate() - 1); }
      const cursor = new Date(firstMonday);
      heatmap.textContent = '';
      const frag = document.createDocumentFragment();
      while(cursor <= end){
        for(let d=0; d<7; d++){
          const cell = document.createElement('span');
          cell.className = 'gh-cell';
          const iso = `${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,'0')}-${String(cursor.getDate()).padStart(2,'0')}`;
          if(cursor >= start && cursor <= end && mapped[iso] > 0){
            cell.classList.add('l' + Math.min(4, mapped[iso]));
          }
          frag.appendChild(cell);
          cursor.setDate(cursor.getDate() + 1);
        }
        while(cursor.getDay() !== 1){ cursor.setDate(cursor.getDate() + 1); }
      }
      heatmap.appendChild(frag);
    }

    async function showYear(year){
      if(!loaded){
        try{ await loadData(); loaded = true; }catch(e){ /* keep heatmap empty on failure */ }
      }
      renderHeatmap(year);
      const first = `${year}-01-01`, last = `${year}-12-31`;
      let total = 0;
      for(const [date, count] of Object.entries(counts)){
        if(date >= first && date <= last) total += count;
      }
      applyTotal(total > 0 ? total : (year === CURRENT_YEAR ? STATIC : 0));
    }

    prevBtn.addEventListener('click', ()=>{ if(selectedYear > MIN_YEAR){ selectedYear--; updateButtons(); showYear(selectedYear); } });
    nextBtn.addEventListener('click', ()=>{ if(selectedYear < CURRENT_YEAR){ selectedYear++; updateButtons(); showYear(selectedYear); } });

    updateButtons();
    showYear(CURRENT_YEAR);
  })();
})();
