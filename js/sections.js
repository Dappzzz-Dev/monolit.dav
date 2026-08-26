/* TAG: sections.js - controls header radio menu and shows/hides main sections
   v3 — reveal decoupled from navigation.
   - Sections are revealed by an IntersectionObserver the moment they enter
     the viewport, permanently. Fixes "contact disappears while scrolling"
     (v2 revealed only the single ACTIVE section, so a section partially in
     view below the anchor line sat at opacity:0).
   - Nav click no longer strips .is-visible from other sections.
   v2 — settle-based navigation. Fixes intermittent wrong-section navigation.
   Root causes fixed vs v1:
   - Arrival no longer depends on a ±4px poll (failed at page-bottom clamp,
     long smooth scrolls, and user-interrupted scrolls).
   - Uses `scrollend` where available + safety timeout, then verifies the
     landing spot and snap-corrects if layout drifted mid-flight.
   - User wheel/touch during programmatic scroll cancels nav state instantly
     instead of leaving a 1600ms "zombie" window that synced to the wrong spot.
   - Destination is clamped to max scroll, so bottom sections count as arrived. */
(function(){
  const HEADER_OFFSET = 112;
  const CORRECTION_TOLERANCE = 48;

  const nav = document.querySelector('.radio-input[data-role="section-nav"]');
  if(!nav) return;
  const labels = Array.from(nav.querySelectorAll('label'));
  const inputs = Array.from(nav.querySelectorAll('input'));
  const selection = nav.querySelector('.selection');
  const sections = ['home','about','projects','contact'];

  let navigating = null;    // section name while a programmatic scroll is in flight
  let settleTimer = null;   // fallback for browsers without `scrollend`
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // TAG: document-space Y of an element (robust against offsetParent quirks)
  function docTop(el){ return el.getBoundingClientRect().top + window.scrollY; }
  function maxScroll(){ return document.documentElement.scrollHeight - window.innerHeight; }

  function updateSelectionVisual(){
    const idx = inputs.findIndex(i=>i.checked);
    if(idx < 0) return;
    // compute offset from labels widths
    const offsets = labels.map(l=>l.getBoundingClientRect().width);
    const x = offsets.slice(0, idx).reduce((s,n)=>s+n, 0);
    const w = offsets[idx] || 0;
    selection.style.display = 'inline-block';
    selection.style.width = w + 'px';
    selection.style.transform = `translateX(${x}px)`;
    // active label color
    labels.forEach((l,i)=> l.style.color = i===idx ? getComputedStyle(document.documentElement).getPropertyValue('--panel') || '' : '');
  }

  // TAG: cancel any in-flight navigation bookkeeping
  function clearNavState(){
    navigating = null;
    window.clearTimeout(settleTimer);
    window.removeEventListener('scrollend', onSettled);
  }

  // TAG: runs once the programmatic scroll has finished (or timed out)
  function onSettled(){
    if(!navigating) return;   // user took over earlier — nothing to verify
    const name = navigating;
    clearNavState();
    const el = document.getElementById(name);
    // Correction pass: layout may have shifted mid-flight (fonts, globe init),
    // leaving us near-but-not-at the target. Snap the last small gap instantly.
    if(el){
      const desired = Math.min(docTop(el) - HEADER_OFFSET, maxScroll());
      if(Math.abs(window.scrollY - desired) > CORRECTION_TOLERANCE){
        window.scrollTo({ top: desired, behavior: 'auto' });
      }
    }
    updateSelectionVisual();
  }

  function scrollToSection(name){
    const el = document.getElementById(name);
    if(!el) return;
    clearNavState();                 // a new click supersedes any in-flight scroll
    navigating = name;
    // TAG: clamp destination — bottom sections (contact) can never put their
    // top 112px below the viewport; treat max-scroll as a valid landing.
    const top = Math.min(docTop(el) - HEADER_OFFSET, maxScroll());
    window.scrollTo({ top, behavior: reducedMotion.matches ? 'auto' : 'smooth' });

    // Reveal handled by the IntersectionObserver below — never hide other
    // sections here (that was the cause of "section hilang saat scroll").
    el.classList.add('is-visible');

    if('onscrollend' in window){
      window.addEventListener('scrollend', onSettled, { once:true });
      settleTimer = window.setTimeout(onSettled, 2500);   // safety net
    }else{
      settleTimer = window.setTimeout(onSettled, 1200);   // legacy fallback
    }
  }

  nav.addEventListener('change', ()=>{
    const checked = nav.querySelector('input:checked');
    const val = checked ? checked.value : 'home';
    updateSelectionVisual();
    scrollToSection(val);
  });

  // TAG: user grabs the page mid-animation -> hand back control immediately
  ['wheel','touchstart'].forEach(ev=>{
    window.addEventListener(ev, ()=>{
      if(!navigating) return;
      window.clearTimeout(settleTimer);
      window.removeEventListener('scrollend', onSettled);
      navigating = null;
    }, { passive:true });
  });

  function syncSelectionToPosition(){
    const anchor = window.scrollY + 140;
    let active = sections[0];
    sections.forEach(id=>{
      const el = document.getElementById(id);
      if(el && docTop(el) <= anchor) active = id;
    });
    // TAG: bottom clamp — a short last section (contact) may never push its
    // top across the anchor line before the page hits max scroll; at the
    // bottom edge the LAST section always counts as active.
    if(window.scrollY >= maxScroll() - 2) active = sections[sections.length - 1];
    const input = nav.querySelector(`input[value="${active}"]`);
    if(input && !input.checked){
      input.checked = true;
      updateSelectionVisual();
    }
    // NOTE: no is-visible here — revealing sections is the observer's job,
    // independent of which nav item is active.
  }

  window.addEventListener('scroll', ()=>{
    if(navigating) return;   // in flight: position must not override the clicked intent
    syncSelectionToPosition();
  }, { passive:true });

  // handle layout changes (recompute widths)
  window.addEventListener('resize', ()=> setTimeout(updateSelectionVisual,60));

  // TAG: language switch changes label widths -> re-measure the selection pill
  window.addEventListener('langchange', ()=> setTimeout(updateSelectionVisual,60));

  // initialize after layout
  setTimeout(()=>{
    updateSelectionVisual();
  }, 120);

  // TAG: v3 reveal - any .section entering the viewport becomes visible
  // PERMANENTLY (unobserved after first hit). Decoupled from nav tracking so
  // content can never sit invisible while partially on screen.
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(en.isIntersecting){
        en.target.classList.add('is-visible');
        io.unobserve(en.target);
      }
    });
  }, { rootMargin:'0px 0px -8% 0px' });
  document.querySelectorAll('.section').forEach(s=> io.observe(s));
})();
