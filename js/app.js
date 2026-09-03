/* TAG: app.js - small UI helpers */
(function(){
  // TAG: Universal error surface - centralizes recoverable browser and
  // network states so every failure keeps the portfolio shell consistent.
  const errorView = document.getElementById('site-error');
  const errorScreen = document.getElementById('site-error-screen');
  const errorTitle = document.getElementById('site-error-title');
  const errorMessage = document.getElementById('site-error-message');
  const errorDetail = document.getElementById('site-error-detail');
  const errorRetry = document.getElementById('site-error-retry');
  const errorHome = document.getElementById('site-error-home');
  const errorStates = {
    offline: { code: 'OFFLINE', title: 'No internet connection', message: 'The portfolio is still here, but the network is unavailable. Reconnect and try again.' },
    'not-found': { code: '404', title: 'Page not found', message: 'This address does not point to a page in the portfolio.' },
    unreachable: { code: 'UNREACHABLE', title: 'Site could not be reached', message: 'The server or network did not respond. Check your connection and try again.' },
    error: { code: 'ERROR', title: 'Something went wrong', message: 'The page hit an unexpected error. The technical detail is shown below to help fix it.' }
  };
  let activeError = '';
  function showSiteError(type, detail){
    if(!errorView) return;
    const state = errorStates[type] || errorStates.error;
    activeError = type;
    errorTitle.textContent = state.title;
    errorMessage.textContent = state.message;
    const safeDetail = detail ? String(detail).slice(0, 220) : '';
    errorScreen.textContent = safeDetail ? `${state.code}: ${safeDetail.slice(0, 52)}` : state.code;
    errorDetail.textContent = safeDetail ? `Detail: ${safeDetail}` : '';
    errorDetail.hidden = !safeDetail;
    errorView.hidden = false;
    document.body.classList.add('has-site-error');
    if(errorRetry) errorRetry.focus({ preventScroll: true });
  }
  function hideSiteError(){
    if(!errorView) return;
    errorView.hidden = true;
    document.body.classList.remove('has-site-error');
    activeError = '';
  }
  window.showSiteError = showSiteError;
  window.hideSiteError = hideSiteError;
  if(errorRetry) errorRetry.addEventListener('click', ()=> window.location.reload());
  if(errorHome) errorHome.addEventListener('click', ()=>{
    hideSiteError();
    const home = document.getElementById('home');
    if(home) home.scrollIntoView({ behavior:'smooth', block:'start' });
  });
  window.addEventListener('offline', ()=> showSiteError('offline'));
  window.addEventListener('online', ()=> { if(activeError === 'offline') hideSiteError(); });
  window.addEventListener('error', (event)=>{
    const detail = event.error && event.error.message ? event.error.message : event.message;
    showSiteError('error', detail);
  });
  window.addEventListener('unhandledrejection', (event)=>{
    const reason = event.reason && event.reason.message ? event.reason.message : event.reason;
    showSiteError('error', reason);
  });
  // TAG: Optional route hint for hosts that rewrite unknown paths to index.html.
  const path = location.pathname;
  const routeIsHome = path === '/' || path.endsWith('/index.html') || path.endsWith('/monolit.dav') || path.endsWith('/monolit.dav/');
  const requestedError = new URLSearchParams(location.search).get('error');
  if(requestedError && errorStates[requestedError]){
    showSiteError(requestedError);
  } else if(!routeIsHome){
    showSiteError('not-found');
  } else if(!navigator.onLine){
    showSiteError('offline');
  }

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
    const CURRENT_YEAR = new Date().getFullYear();    const MIN_YEAR = 2023;
    const API = 'https://github-contributions-api.jogruber.de/v4/' + USER;
    let selectedYear = CURRENT_YEAR;

    const badge = document.querySelector('[data-gh-total]');
    const heatmap = document.getElementById('gh-heatmap');
    const prevBtn = document.getElementById('gh-prev');
    const nextBtn = document.getElementById('gh-next');

    if(!badge || !heatmap || !prevBtn || !nextBtn) return;

    let mapped = {};    // { 'YYYY-MM-DD': level }
    let counts = {};    // { 'YYYY-MM-DD': count }
    let loaded = false;

    const statusEl = document.getElementById('gh-status');

    // TAG: GitHub online status (green live / gray offline). Live = the API we
    // already fetch (jogruber v4, proxied from GitHub) responds; if it fails we
    // show offline but keep the page usable. Dot is language-neutral.
    function setStatus(live){
      if(!statusEl) return;
      statusEl.classList.toggle('is-live', !!live);
      statusEl.setAttribute('title', live ? 'GitHub: online' : 'GitHub: offline');
    }

    function applyTotal(n){
      badge.textContent = `Total: ${n.toLocaleString('en-US')}`;
    }

    function updateButtons(){
      prevBtn.disabled = selectedYear <= MIN_YEAR;
      nextBtn.disabled = selectedYear >= CURRENT_YEAR;
    }

    async function loadData(){
      const CACHE_KEY = 'dafara.gh.raw.v4';
      const TTL = 30 * 60 * 1000;
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if(cached && Date.now() - cached.t < TTL && cached.user === USER){
        mapped = cached.mapped;
        counts = cached.counts || {};
        return;
      }
      const res = await fetch(API);
      if(!res.ok) throw new Error(res.status);
      const data = await res.json();
      const contrib = data.contributions || [];
      mapped = {};
      counts = {};
      for(const c of contrib){
        if(c.date){
          mapped[c.date] = (c.level !== undefined ? c.level : (c.count > 0 ? 1 : 0));
          counts[c.date] = c.count || 0;
        }
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify({ user: USER, mapped, counts, t: Date.now() }));
    }

    // Build week columns (Mon..Sun) covering the whole calendar year, Monday on/before Jan 1.
    function buildWeeks(year){
      const start = new Date(`${year}-01-01`);
      const end = new Date(`${year}-12-31`);
      const firstMonday = new Date(start);
      while(firstMonday.getDay() !== 1){ firstMonday.setDate(firstMonday.getDate() - 1); }
      const weeks = [];
      const cursor = new Date(firstMonday);
      while(cursor <= end){
        const col = [];
        for(let d=0; d<7; d++){
          col.push([cursor.getFullYear(), cursor.getMonth()+1, cursor.getDate()]);
          cursor.setDate(cursor.getDate() + 1);
        }
        weeks.push(col);
        while(cursor.getDay() !== 1){ cursor.setDate(cursor.getDate() + 1); }
      }
      return { weeks, start, end };
    }

    // Render month labels (JAN..DEC) above the week columns they start in.
    // Positioned absolutely so labels can overflow their column without clipping.
    function renderMonths(year, weeks){
      const monthsEl = document.getElementById('gh-months');
      if(!monthsEl) return;
      const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
      const step = 15; // cell width 12 + gap 3
      monthsEl.textContent = '';
      monthsEl.style.width = (weeks.length * step) + 'px';
      weeks.forEach((col, wi) => {
        const f = col.find(([y,m,d]) => {
          const dt = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          return dt >= `${year}-01-01` && dt <= `${year}-12-31` && d === 1;
        });
        if(!f) return;
        const s = document.createElement('span');
        s.textContent = MONTHS[f[1]-1];
        s.style.left = (wi * step) + 'px';
        monthsEl.appendChild(s);
      });
    }

    // Render GitHub-style grid: 7 rows (days Mon..Sun), columns = weeks.
    // Each cell colored by level of its date.
    function renderHeatmap(year){
      const { weeks, start, end } = buildWeeks(year);
      renderMonths(year, weeks);
      heatmap.textContent = '';
      const frag = document.createDocumentFragment();
      weeks.forEach(col => {
        for(const [y,m,d] of col){
          const cell = document.createElement('span');
          cell.className = 'gh-cell';
          const iso = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          if(iso >= `${year}-01-01` && iso <= `${year}-12-31` && mapped[iso] > 0){
            cell.classList.add('l' + Math.min(4, mapped[iso]));
          }
          frag.appendChild(cell);
        }
      });
      heatmap.appendChild(frag);
      const chip = document.getElementById('gh-year');
      if(chip) chip.textContent = year;
    }

    async function showYear(year){
      if(!loaded){
        try{ await loadData(); loaded = true; setStatus(true); }
        catch(e){ /* keep heatmap empty on failure */ setStatus(false); }
      }
      renderHeatmap(year);
      const first = `${year}-01-01`, last = `${year}-12-31`;
      let total = 0;
      for(const [date, count] of Object.entries(counts)){
        if(date >= first && date <= last) total += count;
      }
      applyTotal(total);
    }

    prevBtn.addEventListener('click', ()=>{ if(selectedYear > MIN_YEAR){ selectedYear--; updateButtons(); showYear(selectedYear); } });
    nextBtn.addEventListener('click', ()=>{ if(selectedYear < CURRENT_YEAR){ selectedYear++; updateButtons(); showYear(selectedYear); } });

    updateButtons();
    showYear(CURRENT_YEAR);
  })();

  // TAG: WIB clock (Asia/Jakarta). Renders HH:MM (large) + SS (small) + date.
  // The ":" separator blinks via CSS (.is-odd) - only re-render when a value changes
  // so we don't write to the DOM every second for nothing.
  (function(){
    const hh=document.getElementById('wib-hh');
    const mm=document.getElementById('wib-mm');
    const ss=document.getElementById('wib-ss');
    const sep=document.getElementById('wib-sep');
    const date=document.getElementById('wib-date');
    if(!hh||!mm||!ss||!sep) return;
    let last='';
    function pad(n){ return String(n).padStart(2,'0'); }
    function tick(){
      const p=new Intl.DateTimeFormat('en-US',{ timeZone:'Asia/Jakarta', hour12:false,
        hour:'2-digit',minute:'2-digit',second:'2-digit' }).formatToParts(new Date());
      const o={}; p.forEach(x=>o[x.type]=x.value);
      const sec = parseInt(o.second,10);
      sep.classList.toggle('is-odd', sec%2===1);
      const key = o.hour+':'+o.minute+':'+sec;
      if(key===last) return;
      last=key;
      hh.textContent=o.hour; mm.textContent=o.minute; ss.textContent=pad(sec);
      if(date){
        const d=new Intl.DateTimeFormat('id-ID',{ timeZone:'Asia/Jakarta',
          weekday:'short', day:'2-digit', month:'short' }).format(new Date());
        date.textContent=d;
      }
    }
    tick(); setInterval(tick,1000);
  })();
})();
