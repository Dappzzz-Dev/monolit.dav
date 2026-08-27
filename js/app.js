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
  // Browse contributions by year: chart image + total badge update.
  // ghchart.rshah.org doesn't support year param, so we show current year chart
  // always and display the total count for the selected year from jogruber API.
  (function(){
    const USER = 'Dappzzz-Dev';
    const CURRENT_YEAR = new Date().getFullYear();
    const MIN_YEAR = 2023;
    let selectedYear = CURRENT_YEAR;
    let cache = {};

    const badge = document.querySelector('[data-gh-total]');
    const yearChip = document.getElementById('gh-year');
    const chartImg = document.getElementById('gh-chart');
    const prevBtn = document.getElementById('gh-prev');
    const nextBtn = document.getElementById('gh-next');

    if(!badge || !prevBtn || !nextBtn) return;

    function applyTotal(n){
      badge.textContent = `Total: ${n.toLocaleString('en-US')}`;
    }

    function updateButtons(){
      prevBtn.disabled = selectedYear <= MIN_YEAR;
      nextBtn.disabled = selectedYear >= CURRENT_YEAR;
    }

    async function loadYear(year){
      // Update year chip immediately
      if(yearChip) yearChip.textContent = year;

      // Update badge - check cache first
      const cacheKey = `dafara.gh.total.v${year}`;
      const TTL = 30 * 60 * 1000;

      if(cache[year]){
        applyTotal(cache[year]);
        return;
      }

      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      if(cached && Date.now() - cached.t < TTL){
        cache[year] = cached.total;
        applyTotal(cached.total);
        return;
      }

      try{
        const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${USER}?y=${year}`);
        if(!res.ok) throw new Error(res.status);
        const data = await res.json();
        const total = data.total && data.total[year];
        if(typeof total !== 'number') throw new Error('bad payload');
        cache[year] = total;
        localStorage.setItem(cacheKey, JSON.stringify({ total, t: Date.now() }));
        applyTotal(total);
      }catch(err){
        // If API fails, show 0 for past years
        applyTotal(year === CURRENT_YEAR ? 1787 : 0);
      }
    }

    prevBtn.addEventListener('click', ()=>{
      if(selectedYear <= MIN_YEAR) return;
      selectedYear--;
      updateButtons();
      loadYear(selectedYear);
    });

    nextBtn.addEventListener('click', ()=>{
      if(selectedYear >= CURRENT_YEAR) return;
      selectedYear++;
      updateButtons();
      loadYear(selectedYear);
    });

    // Initial load - try to get cached total for current year
    updateButtons();
    loadYear(CURRENT_YEAR);
  })();
})();
