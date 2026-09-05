// TAG: GrainyCarousel — vanilla port of Originkit's "Grainy Carousel".
// Endless strip of pictures on a 2D canvas pushed through one WebGL pass that
// warps/darkens the two edge bands with animated fbm noise. Drag, flick,
// click either side to step, or let it auto-advance in snap mode.
// 2D fallback when WebGL is unavailable. DPR-scaled backing store (cap 2).
//
// React/motion deps from the source are replaced with a plain rAF tween
// (easeOut cubic ≈ the 0.5s easeOut transition of the reference).
(function(){
  'use strict';

  // TAG: Frozen constants carried over from the reference implementation.
  const CLICK_SLOP = 5;          // px of pointer travel separating click vs drag
  const DRAG_GAIN_MIN = 0.5;     // strip px per pointer px at Drag dial 0
  const DRAG_GAIN_MAX = 2.5;     // …and at dial 100 (25 = 1:1)
  const SMOOTH_AT_50 = 90;       // px/s travel at Speed dial 50
  const SNAP_INTERVAL_AT_50 = 5; // seconds between steps at dial 50
  const DAMP_AT_100 = 0.5;       // per-frame lerp at Damping 100

  const VERT = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

  // TAG: Fragment shader - fbm/simplex warp + darken, identical to reference.
  const FRAG = `
precision highp float;

uniform sampler2D tDiffuse;
uniform float uTime;
uniform vec2 uResolution;
uniform float uEdgeWidth;
uniform float uNoiseSpeed;
uniform float uGrainScale;
uniform float uGrainAmount;

varying vec2 vUv;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m * m * m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * snoise(p);
    p = p * 2.1 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  float leftBand = 1.0 - smoothstep(0.0, uEdgeWidth, vUv.x);
  float rightBand = smoothstep(1.0 - uEdgeWidth, 1.0, vUv.x);
  float xMask = max(leftBand, rightBand);

  if (xMask <= 0.001) {
    gl_FragColor = texture2D(tDiffuse, vUv);
    return;
  }

  float mask = pow(xMask, 3.0) * 3.0;
  float ar = uResolution.x / max(uResolution.y, 1.0);

  float t = uTime * uNoiseSpeed * (uGrainScale * 0.015);

  vec2 noiseUV = vec2(vUv.x * ar, vUv.y) * uGrainScale;

  float dx = fbm(noiseUV + vec2(t, t * 0.5)) * uGrainAmount;
  float dy = fbm(noiseUV + vec2(-t * 0.3, t * 0.8)) * uGrainAmount;

  vec2 warpedUV = vUv + vec2(dx, dy) * mask;

  vec4 col = vec4(0.0);
  if (warpedUV.x >= 0.0 && warpedUV.x <= 1.0 && warpedUV.y >= 0.0 && warpedUV.y <= 1.0) {
    col = texture2D(tDiffuse, warpedUV);
  }

  float colorDecay = max(smoothstep(1.0, 0.1, mask / 6.0), 0.1);

  gl_FragColor = vec4(col.rgb * colorDecay, col.a);
}`;

  function compile(gl, type, src){
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if(!gl.getShaderParameter(s, gl.COMPILE_STATUS))
      console.warn('GrainyCarousel shader:', gl.getShaderInfoLog(s));
    return s;
  }

  // TAG: Cover-crop img into a rounded box; pct is % of the max radius so
  // 100 lands on a true circle regardless of aspect.
  function drawCover(ctx, img, boxX, boxY, boxW, boxH, pct){
    if(!img.complete || !img.naturalWidth) return;
    const t = Math.max(0, Math.min(100, pct)) / 100;
    const short = Math.min(boxW, boxH);
    const x = boxX + (t * (boxW - short)) / 2;
    const y = boxY + (t * (boxH - short)) / 2;
    const w = boxW - t * (boxW - short);
    const h = boxH - t * (boxH - short);
    const r = Math.min((t * short) / 2, w / 2, h / 2);
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const boxRatio = w / h;
    let sx, sy, sw, sh;
    if(imgRatio > boxRatio){
      sh = img.naturalHeight; sw = sh * boxRatio;
      sx = (img.naturalWidth - sw) / 2; sy = 0;
    }else{
      sw = img.naturalWidth; sh = sw / boxRatio;
      sx = 0; sy = (img.naturalHeight - sh) / 2;
    }
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    ctx.restore();
  }

  const DEFAULTS = {
    gap: 20,
    rounded: 8,                 // percent of max radius
    speed: 155,                 // snap/auto dial: 50 -> one step / 5s
    mode: 'snap',               // 'snap' | 'smooth'
    drag: 25,                   // 0-100 dial over DRAG_GAIN_MIN..MAX
    damping: 60,                // percent; higher settles faster
    zoom: 5,                    // percent shrink between cards; 0 off
    grain: { speed: 50, amount: 10, scale: 250 },
    grainWidth: 0,              // edge grain band, share of one picture. 0 = OFF (pure carousel)
    maxWidth: 560,              // responsive card box ceiling
    ratio: 400 / 711,           // card height/width
    background: 'rgba(0, 0, 0, 0)',
    reducedMotion: false,
    onOpen: null                // fn(projectIndex) on clean click of centered card
  };

  class GrainyCarousel{
    constructor(host, opts){
      this.host = host;
      this.o = Object.assign({}, DEFAULTS, opts || {});
      this.images = [];         // HTMLImageElement[]
      this.mediaKey = '';

      // TAG: DOM - GL canvas on top, plain 2D canvas underneath as fallback.
      host.classList.add('grainy-host');
      this.glCanvas = document.createElement('canvas');
      this.fbCanvas = document.createElement('canvas');
      this.glCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;opacity:0';
      this.fbCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;opacity:0;pointer-events:none';
      host.appendChild(this.glCanvas);
      host.appendChild(this.fbCanvas);

      // Offscreen compose target uploaded as one texture.
      this.strip = document.createElement('canvas');
      this.stripCtx = this.strip.getContext('2d');

      const gl = this.glCanvas.getContext('webgl', { alpha:true, premultipliedAlpha:false });
      this.hasGL = false;
      if(gl){
        this.gl = gl;
        const prog = gl.createProgram();
        gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
        gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
        gl.linkProgram(prog);
        if(gl.getProgramParameter(prog, gl.LINK_STATUS)){
          this.hasGL = true;
          gl.useProgram(prog);
          const verts = new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]);
          const uvs   = new Float32Array([ 0,0,  1,0,   0,1,  0,1,  1,0,  1,1]);
          this.posBuf = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuf);
          gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
          const aPos = gl.getAttribLocation(prog, 'position');
          gl.enableVertexAttribArray(aPos);
          gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
          this.uvBuf = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuf);
          gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
          const aUv = gl.getAttribLocation(prog, 'uv');
          gl.enableVertexAttribArray(aUv);
          gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);
          this.u = {};
          for(const n of ['uTime','uResolution','uEdgeWidth','uNoiseSpeed','uGrainScale','uGrainAmount'])
            this.u[n] = gl.getUniformLocation(prog, n);
          this.tex = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, this.tex);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
          this.prog = prog;
        }
      }
      // TAG: grainWidth 0 = pure mode - skip the WebGL pass entirely,
      // present the composed strip through the plain 2D canvas instead.
      const useGL = this.hasGL && this.o.grainWidth > 0;
      if(this.hasGL && !useGL){
        // Detach the unused GL surface; keep context objects for destroy().
        this.glCanvas.style.display = 'none';
      }
      this.hasGL = useGL;
      this.glCanvas.style.opacity = this.hasGL ? '1' : '0';
      this.fbCanvas.style.opacity = this.hasGL ? '0' : '1';

      // TAG: Motion state.
      this.scrollX = 0;
      this.targetX = 0;
      this.snapTimer = 0;
      this.itemWidth = 1;
      this.centerOffset = 0;
      this.vw = 1; this.vh = 1; this.dpr = 1;
      this.cw = 0; this.ch = 0;   // effective card box
      this.paused = false;
      this.snapAnim = null;       // {t0, from, delta}
      this.drag = { active:false, id:-1, last:0, x0:0, y0:0, click:true };

      this._bind();
      this._resize();
      this.ro = new ResizeObserver(()=> this._resize());
      this.ro.observe(host);

      let last = performance.now();
      this._frame = (now)=>{
        this._raf = requestAnimationFrame(this._frame);
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        this._tick(now, dt);
      };
      this._raf = requestAnimationFrame(this._frame);
    }

    // TAG: Replace the picture list (URLs or data URIs).
    setImages(srcs){
      this.mediaKey = (srcs || []).join('|');
      this.images = (srcs || []).map(src=>{
        const img = new Image();
        img.crossOrigin = 'anonymous';
        // TAG: Canvas sources are detached from the document, so native lazy
        // loading can wait forever because the browser cannot assess viewport
        // distance. Preload them explicitly; the carousel must paint its first
        // frame even when WebGL is unavailable.
        img.loading = 'eager';
        img.decoding = 'async';
        img.src = src;
        return img;
      });
    }

    setPaused(v){ this.paused = !!v; }

    destroy(){
      cancelAnimationFrame(this._raf);
      this.ro.disconnect();
      const host = this.host;
      host.removeEventListener('pointerdown', this._onDown);
      window.removeEventListener('pointermove', this._onMove);
      window.removeEventListener('pointerup', this._onUp);
      window.removeEventListener('pointercancel', this._onUp);
      host.removeEventListener('wheel', this._onWheel);
      host.removeChild(this.glCanvas);
      host.removeChild(this.fbCanvas);
      if(this.hasGL){
        const gl = this.gl;
        gl.deleteTexture(this.tex);
        gl.deleteBuffer(this.posBuf);
        gl.deleteBuffer(this.uvBuf);
        gl.deleteProgram(this.prog);
      }
    }

    _bind(){
      const drag = this.drag;
      this._onDown = (e)=>{
        drag.active = true;
        this.snapAnim = null;
        drag.id = e.pointerId;
        drag.last = e.clientX;
        drag.x0 = e.clientX;
        drag.y0 = e.clientY;
        drag.click = true;
      };
      this._onMove = (e)=>{
        if(!drag.active || e.pointerId !== drag.id) return;
        this.targetX -= (e.clientX - drag.last) * this._dragGain();
        drag.last = e.clientX;
        this.snapTimer = 0;
        if(Math.abs(e.clientX - drag.x0) > CLICK_SLOP || Math.abs(e.clientY - drag.y0) > CLICK_SLOP)
          drag.click = false;
      };
      this._onUp = (e)=>{
        if(!drag.active || e.pointerId !== drag.id) return;
        drag.active = false;
        if(!this.images.length || this.itemWidth <= 0) return;
        const current = Math.round((this.targetX + this.centerOffset) / this.itemWidth);
        if(drag.click){
          // Host is never CSS-transformed here, so rect math == untransformed coords.
          const rect = this.host.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const steps = Math.round((clickX - this.vw / 2) / this.itemWidth);
          if(steps === 0 && typeof this.o.onOpen === 'function'){
            const n = this.images.length;
            this.o.onOpen(((current % n) + n) % n);
            return;
          }
          this.targetX = (current + steps) * this.itemWidth - this.centerOffset;
          this.snapTimer = 0;
        }else if(this.o.mode === 'snap'){
          this.targetX = current * this.itemWidth - this.centerOffset;
        }
      };
      this._onWheel = (e)=>{
        if(this.o.mode === 'smooth') this.targetX += e.deltaX || e.deltaY;
      };
      this.host.addEventListener('pointerdown', this._onDown);
      window.addEventListener('pointermove', this._onMove);
      window.addEventListener('pointerup', this._onUp);
      window.addEventListener('pointercancel', this._onUp);
      this.host.addEventListener('wheel', this._onWheel, { passive:true });
    }

    _dragGain(){
      return DRAG_GAIN_MIN + (Math.max(0, Math.min(100, this.o.drag)) / 100) * (DRAG_GAIN_MAX - DRAG_GAIN_MIN);
    }
    _snapInterval(){ return this.o.speed <= 0 ? Infinity : SNAP_INTERVAL_AT_50 * (50 / this.o.speed); }
    _damping(){ return (Math.max(1, Math.min(100, this.o.damping)) / 100) * DAMP_AT_100; }

    _resize(){
      // honey: cap DPR lower on narrow screens - halves GPU pixels on phones
      // (biggest mobile lag saver) while desktop keeps full 2x.
      const maxDpr = matchMedia('(max-width:900px)').matches ? 1.25 : 2;
      this.dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      this.vw = Math.max(1, this.host.clientWidth);
      this.vh = Math.max(1, this.host.clientHeight);
      // Responsive picture box: fills the stage up to maxWidth, keeps ratio.
      this.cw = Math.max(240, Math.min(this.o.maxWidth, this.vw - 48));
      this.ch = Math.round(this.cw * this.o.ratio);
      const bw = Math.round(this.vw * this.dpr);
      const bh = Math.round(this.vh * this.dpr);
      for(const c of [this.glCanvas, this.fbCanvas, this.strip]){
        c.width = bw;
        c.height = bh;
      }
      if(this.hasGL) this.gl.viewport(0, 0, bw, bh);
    }

    _tick(now, dt){
      const o = this.o;
      const drawW = this.cw, drawH = this.ch;
      this.itemWidth = drawW + o.gap;
      const total = Math.max(1, this.images.length * this.itemWidth);
      this.centerOffset = (this.vw - drawW) / 2;
      const interval = this._snapInterval();

      // Auto-advance (paused while dragging, modal open, or reduced motion).
      if(!this.drag.active && !this.paused && !o.reducedMotion && Number.isFinite(interval)){
        if(o.mode === 'smooth'){
          this.targetX += (o.speed / 50) * SMOOTH_AT_50 * dt;
        }else{
          this.snapTimer += dt;
          if(this.snapTimer >= interval){
            const current = Math.round((this.targetX + this.centerOffset) / this.itemWidth);
            this.targetX = (current + 1) * this.itemWidth - this.centerOffset;
            this.snapTimer = 0;
            this.snapAnim = { t0: now, from: this.scrollX, delta: this.targetX - this.scrollX, dur: 500 };
          }
        }
      }

      if(this.snapAnim){
        const a = this.snapAnim;
        let p = (now - a.t0) / a.dur;
        if(p >= 1){ this.scrollX = a.from + a.delta; this.snapAnim = null; }
        else { p = 1 - Math.pow(1 - p, 3); this.scrollX = a.from + a.delta * p; } // easeOutCubic
      }else{
        const lf = 1 - Math.pow(1 - this._damping(), dt * 60);
        this.scrollX += (this.targetX - this.scrollX) * lf;
      }

      // Snap zoom: shrink toward the gap between cards.
      let visualScale = 1;
      if(o.mode === 'snap' && o.zoom > 0 && !o.reducedMotion){
        const nearest = Math.round((this.scrollX + this.centerOffset) / this.itemWidth) * this.itemWidth - this.centerOffset;
        let ratio = Math.min(Math.abs(this.scrollX - nearest) / (this.itemWidth / 2), 1);
        ratio = ratio * ratio * (3 - 2 * ratio);
        visualScale = 1 - ratio * (o.zoom / 100);
      }

      // --- compose the strip ---
      const sctx = this.stripCtx;
      if(sctx){
        sctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        sctx.clearRect(0, 0, this.vw, this.vh);
        if(this.images.length){
          sctx.save();
          if(visualScale !== 1){
            sctx.translate(this.vw / 2, this.vh / 2);
            sctx.scale(visualScale, visualScale);
            sctx.translate(-this.vw / 2, -this.vh / 2);
          }
          const y = (this.vh - drawH) / 2;
          let wrapped = this.scrollX % total;
          if(wrapped < 0) wrapped += total;
          let x = -wrapped;
          const leftBound = -this.vw * 1.5;
          const rightBound = this.vw * 2.5;
          while(x < rightBound){
            for(let i = 0; i < this.images.length; i++){
              const px = x + i * this.itemWidth;
              if(px + drawW > leftBound && px < rightBound)
                drawCover(sctx, this.images[i], px, y, drawW, drawH, o.rounded);
            }
            x += total;
          }
          sctx.restore();
        }
      }

      // --- edge pass (WebGL) or plain copy (fallback) ---
      if(this.hasGL){
        const gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.strip);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(this.u.uTime, now * 0.001);
        gl.uniform2f(this.u.uResolution, this.glCanvas.width, this.glCanvas.height);
        gl.uniform1f(this.u.uEdgeWidth, (drawW / this.vw) * o.grainWidth);
        gl.uniform1f(this.u.uNoiseSpeed, (o.grain.speed / 50) * 0.15);
        gl.uniform1f(this.u.uGrainScale, o.grain.scale);
        gl.uniform1f(this.u.uGrainAmount, Math.max(0, Math.min(100, o.grain.amount)) / 100);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }else{
        const fb = this.fbCanvas.getContext('2d');
        fb.setTransform(1, 0, 0, 1, 0, 0);
        fb.clearRect(0, 0, this.fbCanvas.width, this.fbCanvas.height);
        fb.drawImage(this.strip, 0, 0);
      }
    }
  }

  window.GrainyCarousel = GrainyCarousel;
})();
