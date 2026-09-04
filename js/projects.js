// TAG: projects.js - loads data/projects.json, feeds the GrainyCarousel,
// and wires the project detail modal. Data is managed via admin.html.
(function(){
  'use strict';

  const host = document.getElementById('projects-carousel');
  const emptyNote = document.getElementById('projects-empty');
  if(!host) return;

  const modal = document.getElementById('project-modal');
  const el = {
    img: document.getElementById('pm-img'),
    title: document.getElementById('pm-title'),
    desc: document.getElementById('pm-desc'),
    year: document.getElementById('pm-year'),
    role: document.getElementById('pm-role'),
    tech: document.getElementById('pm-tech'),
    demo: document.getElementById('pm-demo'),
    repo: document.getElementById('pm-repo'),
    close: document.getElementById('pm-close')
  };
  let carousel = null;
  let lastFocus = null;

function openModal(project){
    if(!project) return;
    el.img.src = project.image || '';
    el.img.alt = project.title || 'Project image';
    el.img.loading = 'lazy';
    el.img.fetchpriority = 'low';
    el.title.textContent = project.title || '';
    el.desc.textContent = project.description || '';
    el.year.textContent = project.year || '';
    el.role.textContent = project.role || '';
    el.tech.textContent = Array.isArray(project.tech) ? project.tech.join(' · ') : (project.tech || '');
    // Buttons only render when the admin filled the link in.
    if(project.demoUrl){ el.demo.href = project.demoUrl; el.demo.hidden = false; }
    else { el.demo.removeAttribute('href'); el.demo.hidden = true; }
    if(project.repoUrl){ el.repo.href = project.repoUrl; el.repo.hidden = false; }
    else { el.repo.removeAttribute('href'); el.repo.hidden = true; }

    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    if(carousel) carousel.setPaused(true);
    el.close.focus();
}

  function closeModal(){
    modal.hidden = true;
    document.body.style.overflow = '';
    if(carousel) carousel.setPaused(false);
    if(lastFocus && lastFocus.focus) lastFocus.focus();
  }

  el.close.addEventListener('click', closeModal);
  modal.addEventListener('click', (e)=>{ if(e.target === modal) closeModal(); });
  window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && !modal.hidden) closeModal(); });

  async function init(){
    let projects = [];
    try{
      const res = await fetch('data/projects.json?v=' + Date.now(), { cache:'no-store' });
      if(!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      projects = Array.isArray(data.projects) ? data.projects : [];
    }catch(err){
      console.warn('projects.json unavailable:', err);
    }

    if(!projects.length){
      emptyNote.hidden = false;
      return;
    }

    carousel = new GrainyCarousel(host, {
      onOpen: (i)=> openModal(projects[i])
    });
    carousel.setImages(projects.map(p=> p.image));

    // TAG: Pause the canvas loop while the carousel is off-screen to keep
    // mobile scrolling responsive without changing the desktop interaction.
    if('IntersectionObserver' in window){
      const observer = new IntersectionObserver((entries)=>{
        const entry = entries[0];
        carousel.setPaused(!entry.isIntersecting);
      }, { threshold: 0.05 });
      observer.observe(host);
    }
  }

  init();
})();
