// TAG: Click Effects — Originkit (translated React → plain JS)
// Purpose: 6 interaction modes (rings, burst, particles, crosshair, wavy, sniper)
// Using GSAP for smooth animations, supporting all 6 modes with proper cleanup.

(function(){
  // TAG: Wait for GSAP to load
  function ready(fn) {
    if (window.gsap) return fn();
    const iv = setInterval(() => {
      if (window.gsap) { clearInterval(iv); fn(); }
    }, 50);
    setTimeout(() => clearInterval(iv), 5000);
  }

  ready(() => {
    // TAG: Default configuration
    const config = {
      color: '#ffffff',
      interactionMode: 'sniper',
      duration: 0.3,
      strokeWidth: 2,
      effectSize: 90,
      rotation: 0,
    };

    // TAG: Global container for all effects
    const globalContainer = document.createElement('div');
    globalContainer.id = 'click-effects-originkit';
    Object.assign(globalContainer.style, {
      position: 'fixed',
      left: '0', top: '0', right: '0', bottom: '0',
      pointerEvents: 'none',
      overflow: 'visible',
      zIndex: 9999,
    });
    document.body.appendChild(globalContainer);

    // TAG: Helper function - generate unique ID
    function generateId(x, y, timestamp) {
      return `${timestamp}-${Math.round(x)}-${Math.round(y)}`;
    }

    // TAG: Helper - SVG style positioning
    function getSvgStyle(x, y) {
      return {
        position: 'absolute',
        left: (x - config.effectSize / 2) + 'px',
        top: (y - config.effectSize / 2) + 'px',
        width: config.effectSize + 'px',
        height: config.effectSize + 'px',
        pointerEvents: 'none',
        overflow: 'visible',
        transform: `rotate(${config.rotation}deg)`,
        transformOrigin: 'center',
      };
    }

    // TAG: Mode implementation - RINGS
    function createRingsEffect(x, y, id) {
      const container = document.createElement('div');
      Object.assign(container.style, getSvgStyle(x, y));

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', config.effectSize);
      svg.setAttribute('height', config.effectSize);
      svg.setAttribute('viewBox', `0 0 ${config.effectSize} ${config.effectSize}`);
      svg.style.overflow = 'visible';

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', config.effectSize / 2);
      circle.setAttribute('cy', config.effectSize / 2);
      circle.setAttribute('r', config.effectSize / 4);
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', config.color);
      circle.setAttribute('stroke-width', '5');
      svg.appendChild(circle);
      container.appendChild(svg);
      globalContainer.appendChild(container);

      gsap.set(svg, { scale: 0.5 });
      gsap.timeline({
        onComplete: () => {
          if (globalContainer.contains(container)) {
            globalContainer.removeChild(container);
          }
        }
      })
        .to(svg, {
          scale: 2,
          duration: config.duration,
          ease: 'power3.out'
        }, 0)
        .to(svg, {
          opacity: 0,
          duration: config.duration * 0.2,
          ease: 'linear'
        }, config.duration * 0.8);
    }

    // TAG: Mode implementation - BURST
    function createBurstEffect(x, y, id) {
      const container = document.createElement('div');
      Object.assign(container.style, getSvgStyle(x, y));

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', config.effectSize);
      svg.setAttribute('height', config.effectSize);
      svg.setAttribute('viewBox', `0 0 ${config.effectSize} ${config.effectSize}`);
      svg.style.overflow = 'visible';

      const angles = [45, 80, 115, 150];
      const lines = [];
      const centerX = config.effectSize / 2;
      const centerY = config.effectSize / 2;

      angles.forEach((angle) => {
        const rad = angle * (Math.PI / 180);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', centerX);
        line.setAttribute('y1', centerY);
        line.setAttribute('x2', centerX);
        line.setAttribute('y2', centerY);
        line.setAttribute('stroke', config.color);
        line.setAttribute('stroke-width', config.strokeWidth);
        line.setAttribute('stroke-linecap', 'square');
        svg.appendChild(line);

        const startX = centerX + config.effectSize * 0.1 * Math.cos(rad);
        const startY = centerY - config.effectSize * 0.1 * Math.sin(rad);
        const endX = centerX + config.effectSize * 0.25 * Math.cos(rad);
        const endY = centerY - config.effectSize * 0.25 * Math.sin(rad);

        lines.push({ line, angle: rad, startX, startY, endX, endY });
      });

      container.appendChild(svg);
      globalContainer.appendChild(container);

      const tl = gsap.timeline({
        onComplete: () => {
          if (globalContainer.contains(container)) {
            globalContainer.removeChild(container);
          }
        }
      });

      lines.forEach(({ line, angle, startX, startY, endX, endY }) => {
        const translateX = (config.effectSize / 4) * Math.cos(angle);
        const translateY = (-config.effectSize / 4) * Math.sin(angle);

        tl.to(line, {
          onUpdate: function() {
            const progress = this.progress();
            const currX1 = startX + (endX - startX) * progress;
            const currY1 = startY + (endY - startY) * progress;
            line.setAttribute('x1', currX1);
            line.setAttribute('y1', currY1);
            line.setAttribute('x2', endX + translateX * progress);
            line.setAttribute('y2', endY + translateY * progress);
          },
          duration: config.duration,
          ease: 'power2.out'
        }, 0)
          .to(line, {
            strokeWidth: 0,
            duration: config.duration * 0.4,
            ease: 'linear'
          }, config.duration * 0.6);
      });
    }

    // TAG: Mode implementation - PARTICLES
    function createParticlesEffect(x, y, id) {
      const container = document.createElement('div');
      Object.assign(container.style, {
        position: 'absolute',
        left: x + 'px',
        top: y + 'px',
        width: '0',
        height: '0',
        pointerEvents: 'none',
      });
      globalContainer.appendChild(container);

      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const distance = config.effectSize * 0.2 + Math.random() * (config.effectSize * 0.3);

        const particle = document.createElement('div');
        Object.assign(particle.style, {
          position: 'absolute',
          left: (-config.strokeWidth / 2) + 'px',
          top: (-config.strokeWidth / 2) + 'px',
          width: config.strokeWidth + 'px',
          height: config.strokeWidth + 'px',
          backgroundColor: config.color,
          borderRadius: '50%',
          pointerEvents: 'none',
        });
        container.appendChild(particle);

        const finalX = Math.cos(angle) * distance;
        const finalY = Math.sin(angle) * distance;

        gsap.set(particle, { x: 0, y: 0, width: 0, height: 0 });

        gsap.timeline({
          onComplete: () => {
            if (container.contains(particle)) {
              container.removeChild(particle);
            }
          }
        })
          .to(particle, {
            width: config.strokeWidth,
            height: config.strokeWidth,
            duration: config.duration * 0.2,
            ease: 'power1.out'
          }, 0)
          .to(particle, {
            x: finalX - config.strokeWidth / 2,
            y: finalY - config.strokeWidth / 2,
            duration: config.duration * 0.4,
            ease: 'power1.out'
          }, config.duration * 0.2)
          .to(particle, {
            width: 0,
            height: 0,
            x: finalX,
            y: finalY,
            duration: config.duration * 0.4,
            ease: 'linear'
          }, config.duration * 0.6);
      }

      const cleanupTimer = gsap.delayedCall(config.duration, () => {
        if (globalContainer.contains(container)) {
          globalContainer.removeChild(container);
        }
      });
    }

    // TAG: Mode implementation - CROSSHAIR
    function createCrosshairEffect(x, y, id) {
      const container = document.createElement('div');
      Object.assign(container.style, getSvgStyle(x, y));

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', config.effectSize);
      svg.setAttribute('height', config.effectSize);
      svg.setAttribute('viewBox', `0 0 ${config.effectSize} ${config.effectSize}`);
      svg.style.overflow = 'visible';

      const angles = [0, 90, 180, 270];
      const lines = [];
      const centerX = config.effectSize / 2;
      const centerY = config.effectSize / 2;
      const lineLength = config.effectSize * 0.3;

      angles.forEach((angle) => {
        const rad = angle * (Math.PI / 180);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', centerX);
        line.setAttribute('y1', centerY);
        line.setAttribute('x2', centerX);
        line.setAttribute('y2', centerY);
        line.setAttribute('stroke', config.color);
        line.setAttribute('stroke-width', config.strokeWidth);
        line.setAttribute('stroke-linecap', 'square');
        svg.appendChild(line);

        const startX = centerX + 20 * Math.cos(rad);
        const startY = centerY - 20 * Math.sin(rad);
        const endX = centerX + (20 + lineLength) * Math.cos(rad);
        const endY = centerY - (20 + lineLength) * Math.sin(rad);

        lines.push({ line, rad, startX, startY, endX, endY });
      });

      container.appendChild(svg);
      globalContainer.appendChild(container);

      const tl = gsap.timeline({
        onComplete: () => {
          if (globalContainer.contains(container)) {
            globalContainer.removeChild(container);
          }
        }
      });

      lines.forEach(({ line, rad, startX, startY, endX, endY }) => {
        tl.to(line, {
          onUpdate: function() {
            const progress = this.progress();
            const currX1 = startX + (endX - startX) * progress;
            const currY1 = startY + (endY - startY) * progress;
            line.setAttribute('x1', currX1);
            line.setAttribute('y1', currY1);
            line.setAttribute('x2', endX);
            line.setAttribute('y2', endY);
          },
          duration: config.duration * 0.8,
          ease: 'power1.out'
        }, 0)
          .to(line, {
            strokeWidth: 0,
            duration: config.duration * 0.6,
            ease: 'linear'
          }, config.duration * 0.4);
      });
    }

    // TAG: Mode implementation - WAVY
    function createWavyEffect(x, y, id) {
      const container = document.createElement('div');
      Object.assign(container.style, getSvgStyle(x, y));

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', config.effectSize);
      svg.setAttribute('height', config.effectSize);
      svg.setAttribute('viewBox', `0 0 ${config.effectSize} ${config.effectSize}`);
      svg.style.overflow = 'visible';

      const angles = [45, 90, 135, 180];
      const centerX = config.effectSize / 2;
      const centerY = config.effectSize / 2;
      const startRadius = config.effectSize * 0.1;
      const endRadius = config.effectSize * 0.5;

      angles.forEach((angle) => {
        const rad = (angle * Math.PI) / 180;
        const startX = centerX + startRadius * Math.cos(rad);
        const startY = centerY - startRadius * Math.sin(rad);
        const endX = centerX + endRadius * Math.cos(rad);
        const endY = centerY - endRadius * Math.sin(rad);
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const waveOffset = config.effectSize * 0.05;
        const control1X = midX + waveOffset * Math.cos(rad + Math.PI / 2);
        const control1Y = midY - waveOffset * Math.sin(rad + Math.PI / 2);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const wavyPath = `M ${startX} ${startY} Q ${control1X} ${control1Y} ${midX} ${midY} T ${endX} ${endY}`;
        path.setAttribute('d', wavyPath);
        path.setAttribute('stroke', config.color);
        path.setAttribute('stroke-width', config.strokeWidth);
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('fill', 'none');
        svg.appendChild(path);

        const pathLength = path.getTotalLength();
        gsap.set(path, {
          strokeDasharray: '1, ' + pathLength,
          strokeDashoffset: 0,
        });

        gsap.timeline()
          .to(path, {
            strokeDasharray: `${pathLength}, ${pathLength}`,
            strokeDashoffset: -pathLength,
            duration: config.duration,
            ease: 'power1.out'
          }, 0)
          .to(path, {
            strokeWidth: 0,
            duration: config.duration * 0.4,
            ease: 'linear'
          }, config.duration * 0.6);
      });

      container.appendChild(svg);
      globalContainer.appendChild(container);

      gsap.delayedCall(config.duration, () => {
        if (globalContainer.contains(container)) {
          globalContainer.removeChild(container);
        }
      });
    }

    // TAG: Mode implementation - SNIPER (default)
    function createSniperEffect(x, y, id) {
      const effectContainer = document.createElement('div');
      Object.assign(effectContainer.style, getSvgStyle(x, y));

      // TAG: Sniper crosshair SVG
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', config.effectSize);
      svg.setAttribute('height', config.effectSize);
      svg.setAttribute('viewBox', `0 0 ${config.effectSize} ${config.effectSize}`);
      svg.style.overflow = 'visible';

      const angles = [0, 90, 180, 270];
      const centerX = config.effectSize / 2;
      const centerY = config.effectSize / 2;
      const lineLength = config.effectSize * 0.2;

      angles.forEach((angle) => {
        const rad = angle * (Math.PI / 180);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', centerX);
        line.setAttribute('y1', centerY);
        line.setAttribute('x2', centerX);
        line.setAttribute('y2', centerY);
        line.setAttribute('stroke', config.color);
        line.setAttribute('stroke-width', config.strokeWidth);
        line.setAttribute('stroke-linecap', 'square');
        svg.appendChild(line);

        const startX = centerX + 5 * Math.cos(rad);
        const startY = centerY - 5 * Math.sin(rad);
        const endX = centerX + (5 + lineLength) * Math.cos(rad);
        const endY = centerY - (5 + lineLength) * Math.sin(rad);

        gsap.timeline()
          .to(line, {
            onUpdate: function() {
              const progress = this.progress();
              const currX = startX + (endX - startX) * progress;
              const currY = startY + (endY - startY) * progress;
              line.setAttribute('x1', currX);
              line.setAttribute('y1', currY);
              line.setAttribute('x2', endX + (5 + lineLength) * Math.cos(rad) * progress);
              line.setAttribute('y2', endY - (5 + lineLength) * Math.sin(rad) * progress);
            },
            duration: config.duration,
            ease: 'power2.out'
          }, 0)
          .to(line, {
            strokeWidth: 0,
            duration: config.duration * 0.4,
            ease: 'linear'
          }, config.duration * 0.6);
      });

      effectContainer.appendChild(svg);
      globalContainer.appendChild(effectContainer);

      // TAG: Sniper particles
      const particleAngles = [
        Math.PI / 3, (2 * Math.PI) / 3, (4 * Math.PI) / 3, (5 * Math.PI) / 3,
        Math.PI / 6, (5 * Math.PI) / 6, (7 * Math.PI) / 6, (11 * Math.PI) / 6,
      ];

      let completedAnimations = 0;
      const totalAnimations = particleAngles.length;

      particleAngles.forEach((angle) => {
        const particle = document.createElement('div');
        Object.assign(particle.style, {
          position: 'absolute',
          left: (x - config.strokeWidth / 2) + 'px',
          top: (y - config.strokeWidth / 2) + 'px',
          width: config.strokeWidth + 'px',
          height: config.strokeWidth + 'px',
          backgroundColor: config.color,
          pointerEvents: 'none',
          transformOrigin: 'center',
          transform: `rotate(${config.rotation}deg)`,
        });
        globalContainer.appendChild(particle);

        gsap.set(particle, {
          x: 0,
          y: 0,
          width: config.strokeWidth,
          height: config.strokeWidth,
        });

        gsap.timeline({
          onComplete: () => {
            completedAnimations++;
            if (globalContainer.contains(particle)) {
              globalContainer.removeChild(particle);
            }
            if (completedAnimations === totalAnimations && globalContainer.contains(effectContainer)) {
              globalContainer.removeChild(effectContainer);
            }
          }
        })
          .to(particle, {
            x: Math.cos(angle) * (config.effectSize * 0.4),
            y: Math.sin(angle) * (config.effectSize * 0.4),
            duration: config.duration,
            ease: 'power2.out'
          }, 0)
          .to(particle, {
            width: 0,
            height: 0,
            duration: config.duration * 0.4,
            ease: 'linear'
          }, config.duration * 0.6);
      });
    }

    // TAG: Mode router
    function createEffect(mode, x, y, id) {
      switch(mode) {
        case 'rings':
          return createRingsEffect(x, y, id);
        case 'burst':
          return createBurstEffect(x, y, id);
        case 'particles':
          return createParticlesEffect(x, y, id);
        case 'crosshair':
          return createCrosshairEffect(x, y, id);
        case 'wavy':
          return createWavyEffect(x, y, id);
        case 'sniper':
        default:
          return createSniperEffect(x, y, id);
      }
    }

    // TAG: Click event listener
    document.addEventListener('click', (e) => {
      const x = e.clientX;
      const y = e.clientY;
      const id = generateId(x, y, e.timeStamp);
      createEffect(config.interactionMode, x, y, id);
    }, { passive: true });
  });
})();
