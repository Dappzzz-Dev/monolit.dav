// TAG: Project modal module - owns the modal markup and exposes one mount seam.
(function(){
  'use strict';

  const root = document.getElementById('project-modal-root');
  if(!root) return;

  root.innerHTML = `
    <div class="modal-backdrop" id="project-modal" hidden>
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="pm-title">
        <button class="modal-close" id="pm-close" data-i18n-aria="modal.close" aria-label="Tutup">&times;</button>
        <img class="modal-img" id="pm-img" alt="" loading="lazy" decoding="async" fetchpriority="low">
        <div class="modal-body">
          <h3 id="pm-title"></h3>
          <p class="modal-desc" id="pm-desc"></p>
          <div class="project-meta" id="pm-meta" aria-label="Project metadata">
            <div><span data-i18n="projects.year">Year</span><strong id="pm-year"></strong></div>
            <div><span data-i18n="projects.role">Role</span><strong id="pm-role"></strong></div>
            <div><span data-i18n="projects.stack">Stack</span><strong id="pm-tech"></strong></div>
          </div>
          <div class="modal-actions">
            <a class="cta" id="pm-demo" target="_blank" rel="noopener" hidden>Live Demo</a>
            <a class="ghost" id="pm-repo" target="_blank" rel="noopener" hidden>GitHub</a>
          </div>
        </div>
      </div>
    </div>`;

  const modal = document.getElementById('project-modal');
  window.MonolitComponents = window.MonolitComponents || {};
  window.MonolitComponents.projectModal = {
    modal,
    elements: {
      img: document.getElementById('pm-img'),
      title: document.getElementById('pm-title'),
      desc: document.getElementById('pm-desc'),
      year: document.getElementById('pm-year'),
      role: document.getElementById('pm-role'),
      tech: document.getElementById('pm-tech'),
      demo: document.getElementById('pm-demo'),
      repo: document.getElementById('pm-repo'),
      close: document.getElementById('pm-close')
    }
  };
})();
