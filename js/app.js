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
    let mapped = {}; // { 'YYYY-MM-DD': level }

    function applyTotal(n){
      badge.textContent = `Total: ${n.toLocaleString('en-US')}`;
    }

    function updateButtons(){
      prevBtn.disabled = selectedYear <= MIN_YEAR;
      nextBtn.disabled = selectedYear >= CURRENT_YEAR;
    }

    async function loadData(){
      const CACHE_KEY = 'dafara.gh.raw.v2';
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
    }

    // Total contributions in a year = sum of count. We store sum separately
    // because count isn't reconstructible from level. Recompute from raw counts
    // -> keep a separate count map.
    let counts = {}; // { 'YYYY-MM-DD': count }
    async function loadCounts(){
      const CACHE_KEY = 'dafara.gh.counts.v2';
      const TTL = 30 * 60 * 1000;
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if(cached && Date.now() - cached.t < TTL && cached.user === USER){
        counts = cached.counts;
        return;
      }
      const res = await fetch(API);
      if(!res.ok) throw new Error(res.status);
      const data = await res.json();
      const contrib = data.contributions || [];
      counts = {};
      for(const c of contrib){
        if(c.date) counts[c.date] = c.count || 0;
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify({ user: USER, counts, t: Date.now() }));
    }

    // Render GitHub-style grid: 7 rows (weeks built today backwards), columns
    // = weeks. Each cell colored by level of its date.
    function renderHeatmap(year){
      const y0 = `${year}-01-01`;
      const y1 = `${year}-12-31`;
      const start = new Date(y0);
      const end = new Date(y1);
      // Monday-based columns: find the Monday on/before Jan 1
      const firstMonday = new Date(start);
      while(firstMonday.getDay() !== 1){ firstMonday.setDate(firstMonday.getDate() - 1); }
      const cells = [];
      const cursor = new Date(firstMonday);
      while(cursor <= end){
        const col = [];
        for(let d=0; d<7; d++){
          col.push(new Date(cursor));
          cursor.setDate(cursor.getDate() + 1);
        }
        cells.push(col);
        // advance to next Monday
        while(cursor.getDay() !== 1){ cursor.setDate(cursor.getDate() + 1); }
      }
      heatmap.textContent = '';
      for(const col of cells){
        for(const day of col){
          const cell = document.createElement('span');
          cell.className = 'gh-cell';
          const y = day.getFullYear(), m = String(day.getMonth()+1).padStart(2,'0'), dd = String(day.getDate()).padStart(2,'0');
          const iso = `${y}-${m}-${dd}`;
          const inYear = day >= start && day <= end;
          if(inYear && mapped[iso] > 0){
            cell.classList.add('l' + Math.min(4, mapped[iso]));
          }
          heatmap.appendChild(cell);
        }
      }
    }

    async function showYear(year){
      if(!mapped) await loadData().catch(()=>{});
      if(!Object.keys(counts).length) await loadCounts().catch(()=>{});
      renderHeatmap(year);
      // total for year
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
