/* TAG: i18n.js - lightweight language system (no build step).
   - Detect: saved choice > navigator.language (mirrors user country) > 'en'
   - Manual picker: pill button in topbar -> dropdown, persisted in localStorage
   - Strings live in DICT below; HTML marks targets with data-i18n keys.
   Supported: id (Indonesia), en, ja, es */
(function(){
  const STORE_KEY = 'dafara.lang';
  const LANGS = { id:'Bahasa Indonesia', en:'English', ja:'日本語', es:'Español' };

  const DICT = {
    id: {
      'meta.title': 'Daffa Farash — Frontend Developer | monolit',
      'nav.home':'Beranda','nav.about':'Tentang','nav.projects':'Proyek','nav.contact':'Kontak',
      'about.title':'Tentang Saya',
      'about.body':"Hello world! Saya <strong>Daffa Farash</strong> dari Sukoharjo. Mulai ngoding tahun 2023 cuma buat iseng. Eh, ternyata nagih. Sekarang fokus ke front-end, memperdalam React & JavaScript, sambil ngulik AI biar webnya makin seru.",
      'about.github_title':'Kontribusi GitHub Saya',
      'gh.badge_title':'Kontribusi GitHub tahun ini (live)',
      'hero.role':'Frontend Developer · Sukoharjo, Indonesia',
      'hero.bio':'Bikin website & web app yang rapi, cepat, dan enak dipakai. Di sela waktunya biasanya lagi ngulik AI.',
      'hero.cta_projects':'Lihat Proyek','hero.cta_contact':'Kontak',
      'projects.title':'Riwayat Proyek',
      'projects.lead':'Geser untuk menjelajah, klik gambar untuk detail proyek.',
      'projects.empty':'Belum ada proyek. Tambahkan lewat halaman admin.',
      'modal.close':'Tutup',
      'contact.title':'Mari berkolaborasi',
      'contact.lead':'Punya ide proyek, butuh bantuan frontend, atau sekadar diskusi soal web & AI? Satu email cukup untuk mulai.',
      'contact.location_label':'Lokasi',
      'contact.focus_label':'Fokus saat ini',
      'contact.focus_value':'Frontend web apps & eksperimen AI',
      'cta.title':'Ceritakan proyekmu',
      'cta.body':'Kirim ringkasnya lewat email. Biasanya saya balas dalam 1–2 hari kerja.',
      'cta.button':'Kirim Email',
      'cta.subject':'Halo Daffa · Diskusi Proyek',
      'footer.rights':'Daffa. Semua hak dilindungi.',
      'footer.top':'Kembali ke atas',
      'ghost.speech':'stop!! sini deh liat dulu apa yang ada di sampingku'
    },
    en: {
      'meta.title': 'Daffa Farash — Frontend Developer | monolit',
      'nav.home':'Home','nav.about':'About','nav.projects':'Projects','nav.contact':'Contact',
      'about.title':'About Me',
      'about.body':"Hello world! I'm <strong>Daffa Farash</strong>, from Sukoharjo, Indonesia. Started coding in 2023 just for fun. Turns out it stuck. Now I'm deep into front-end work, leveling up my React & JavaScript, and seeing how AI can make the web more fun.",
      'about.github_title':'My GitHub Contributions',
      'gh.badge_title': 'GitHub contributions this year (live)',
      'hero.role':'Front-end Developer · Sukoharjo, Indonesia',
      'hero.bio':"I build websites & web apps that are tidy, fast, and pleasant to use. Between projects I'm usually poking at AI and seeing what sticks.",
      'hero.cta_projects':'View Projects','hero.cta_contact':'Get in Touch',
      'projects.title':'Projects',
      'projects.lead':'Drag to explore, then click an image for project details.',
      'projects.empty':'No projects yet. Add them via the admin page.',
      'modal.close':'Close',
      'contact.title':"Let's work together",
      'contact.lead':'Got a project idea, need front-end help, or just want to talk web & AI? One email is enough to start.',
      'contact.location_label':'Location',
      'contact.focus_label':'Currently focused on',
      'contact.focus_value':'Front-end web apps & AI experiments',
      'cta.title':'Tell me about your project',
      'cta.body':'Send a short brief by email. I usually reply within 1–2 business days.',
      'cta.button':'Send Email',
      'cta.subject':'Hi Daffa · Project Inquiry',
      'footer.rights':'Daffa. All rights reserved.',
      'footer.top':'Back to top',
      'ghost.speech':'stop!! look what\'s next to me first'
    },
    ja: {
      'meta.title': 'Daffa Farash — フロントエンド開発者 | monolit',
      'nav.home':'ホーム','nav.about':'自己紹介','nav.projects':'制作実績','nav.contact':'お問い合わせ',
      'about.title':'自己紹介',
      'about.body':'Hello world! スコハルジョ出身の <strong>Daffa Farash</strong> です。2023年、遊び半分で始めたコーディング…気づけばすっかりハマりました。今はフロントエンド中心に React と JavaScript を磨きながら、AI の活用法も模索中です。',
      'about.github_title':'私のGitHubコントリビューション',
      'gh.badge_title': '今年のGitHubコントリビューション（ライブ）',
      'hero.role':'フロントエンド開発者 · インドネシア・スコハルジョ',
      'hero.bio':'きれいで速いウェブサイト & Webアプリづくりがメイン。合間には AI でいろいろ実験してます。',
      'hero.cta_projects':'作品を見る','hero.cta_contact':'お問い合わせ',
      'projects.title':'制作実績',
      'projects.lead':'ドラッグで閲覧。画像をクリックすると詳細が表示されます。',
      'projects.empty':'プロジェクトはまだありません。管理ページから追加してください。',
      'modal.close':'閉じる',
      'contact.title':'一緒に作りましょう',
      'contact.lead':'プロジェクトのアイデア、フロントエンドのお手伝い、WebとAIの話題なら何でも気軽に。メール一本で始められます。',
      'contact.location_label':'所在地',
      'contact.focus_label':'今の取り組み',
      'contact.focus_value':'フロントエンド開発とAIの実験',
      'cta.title':'あなたのプロジェクトを教えてください',
      'cta.body':'概要をメールでお送りください。通常1〜2営業日で返信します。',
      'cta.button':'メールを送る',
      'cta.subject':'はじめまして Daffa · プロジェクトのご相談',
      'footer.rights':'Daffa. All Rights Reserved.',
      'footer.top':'トップへ戻る',
      'ghost.speech':'ちょっと！まずこっちを見て！'
    },
    es: {
      'meta.title': 'Daffa Farash — Desarrollador Frontend | monolit',
      'nav.home':'Inicio','nav.about':'Sobre mí','nav.projects':'Proyectos','nav.contact':'Contacto',
      'about.title':'Sobre mí',
      'about.body':"¡Hello world! Soy <strong>Daffa Farash</strong>, de Sukoharjo (Indonesia). Empecé a programar en 2023 solo por diversión, y al final me enganchó del todo. Ahora voy a tope con el front-end, mejorando mi React y JavaScript, mientras descubro cómo la IA puede hacer la web más divertida.",
      'about.github_title':'Mis contribuciones de GitHub',
      'gh.badge_title': 'Contribuciones de GitHub este año (live)',
      'hero.role':'Desarrollador Front-end · Sukoharjo, Indonesia',
      'hero.bio':'Hago sitios y apps web limpios y rápidos. En mi tiempo libre, casi siempre ando trasteando con IA.',
      'hero.cta_projects':'Ver proyectos','hero.cta_contact':'Contáctame',
      'projects.title':'Proyectos',
      'projects.lead':'Arrastra para explorar y haz clic en una imagen para ver los detalles.',
      'projects.empty':'Aún no hay proyectos. Añádelos desde la página de administración.',
      'modal.close':'Cerrar',
      'contact.title':'Trabajemos juntos',
      'contact.lead':'¿Tienes una idea de proyecto, necesitas ayuda front-end o quieres hablar de web e IA? Basta un email para empezar.',
      'contact.location_label':'Ubicación',
      'contact.focus_label':'Enfoque actual',
      'contact.focus_value':'Apps web front-end y experimentos con IA',
      'cta.title':'Cuéntame tu proyecto',
      'cta.body':'Envíame un resumen por email. Suelo responder en 1–2 días hábiles.',
      'cta.button':'Enviar email',
      'cta.subject':'Hola Daffa · Consulta de proyecto',
      'footer.rights':'Daffa. Todos los derechos reservados.',
      'footer.top':'Volver arriba',
      'ghost.speech':'para!! mira lo que tengo a mi lado'
    }
  };

  let current = detect();

  function detect(){
    try{
      const saved = localStorage.getItem(STORE_KEY);
      if(saved && DICT[saved]) return saved;
    }catch(e){}
    const n = (navigator.language || 'en').toLowerCase();
    if(n.startsWith('id')) return 'id';
    if(n.startsWith('ja')) return 'ja';
    if(n.startsWith('es')) return 'es';
    return 'en';   // every other country falls back to English
  }

  function t(key){
    const pack = DICT[current] || DICT.en;
    return pack[key] != null ? pack[key] : (DICT.en[key] || '');
  }

  function apply(lang){
    if(!DICT[lang]) lang = 'en';
    current = lang;
    try{ localStorage.setItem(STORE_KEY, lang); }catch(e){}
    document.documentElement.lang = lang;
    document.title = t('meta.title');

    document.querySelectorAll('[data-i18n]').forEach(el=>{ el.textContent = t(el.dataset.i18n); });
    // TAG: keys whose translations contain markup (<strong> etc.) - strings come from our own dict, never user input
    document.querySelectorAll('[data-i18n-html]').forEach(el=>{ el.innerHTML = t(el.dataset.i18nHtml); });
    document.querySelectorAll('[data-i18n-aria]').forEach(el=>{ el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    document.querySelectorAll('[data-i18n-title]').forEach(el=>{ el.title = t(el.dataset.i18nTitle); });
    document.querySelectorAll('[data-i18n-mailto]').forEach(a=>{
      const base = a.getAttribute('data-mailto') || 'mailto:daffafarash@gmail.com';
      a.href = base + '?subject=' + encodeURIComponent(t(a.dataset.i18nMailto));
    });

    // picker state
    const code = document.getElementById('lang-code');
    if(code) code.textContent = lang.toUpperCase();
    const menu = document.getElementById('lang-menu');
    if(menu) menu.querySelectorAll('[data-lang]').forEach(b=>{
      b.classList.toggle('active', b.dataset.lang === lang);
      b.setAttribute('aria-selected', String(b.dataset.lang === lang));
    });

    // let other modules react (e.g. nav pill width re-measure)
    window.dispatchEvent(new CustomEvent('langchange', { detail:{ lang } }));
  }

  // TAG: picker wiring - toggle, outside-click close, Escape close
  const btn = document.getElementById('lang-btn');
  const menu = document.getElementById('lang-menu');
  function setOpen(open){
    if(!btn || !menu) return;
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
  }
  if(btn && menu){
    btn.addEventListener('click', e=>{
      e.stopPropagation();
      setOpen(menu.hidden);
    });
    menu.addEventListener('click', e=>{
      const opt = e.target.closest('[data-lang]');
      if(!opt) return;
      apply(opt.dataset.lang);
      setOpen(false);
      btn.focus();
    });
    document.addEventListener('click', ()=> setOpen(false));
    document.addEventListener('keydown', e=>{ if(e.key === 'Escape') setOpen(false); });
    menu.querySelectorAll('[data-lang]').forEach(b=>{ b.setAttribute('role','option'); });
  }

  apply(current);   // run immediately so there is no wrong-language flash
})();
