/* ==========================================================================
   Ability card: a 3D holographic trading card in a full-screen overlay.
   Pure CSS 3D + canvas (no libraries). Hover to tilt, drag to rotate,
   double-click (or tap) to flip. Frame, ornaments and foil are drawn in code.
   Opened by main.js via window.AbilityCard.open(opener).
   ========================================================================== */
(() => {
  'use strict';
  const S = window.SITE;
  if (!S) return;
  const A = S.ability || {};
  const C = Object.assign({
    role: S.tagline || '', photo: S.portraitReveal || S.portrait, stats: [],
    based: S.location || '', works: 'Remotely', replies: '',
  }, A.card || {});

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // ---- markup ---------------------------------------------------------------
  const pips = (v) => {
    const on = Math.round(clamp(Number(v) || 0, 0, 100) / 10);
    return Array.from({ length: 10 }, (_, i) => `<i${i < on ? ' class="on"' : ''}></i>`).join('');
  };
  const stat = (s) => `<div class="hc-stat"><b>${esc(s.label)}</b><span class="hc-pips" aria-hidden="true">${pips(s.value)}</span><em>${esc(s.value)}</em></div>`;
  const stats = C.stats || [];
  const half = Math.ceil(stats.length / 2);
  const corner = (cls) => `<svg class="hc-orn ${cls}" viewBox="0 0 64 64" aria-hidden="true"><use href="#hc-corner"/></svg>`;
  const initials = String(S.name || '').split(/\s+/).map((w) => w[0] || '').join('').slice(0, 2).toUpperCase();

  const layer = document.createElement('div');
  layer.className = 'holo';
  layer.id = 'holo';
  layer.hidden = true;
  layer.setAttribute('role', 'dialog');
  layer.setAttribute('aria-modal', 'true');
  layer.setAttribute('aria-label', `${S.name}: ability card`);
  layer.innerHTML = `
    <svg width="0" height="0" style="position:absolute" aria-hidden="true">
      <defs>
        <linearGradient id="hc-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#fff3c8"/><stop offset=".35" stop-color="#d9b05a"/>
          <stop offset=".6" stop-color="#8f6a26"/><stop offset="1" stop-color="#f1d58e"/>
        </linearGradient>
        <radialGradient id="hc-gem" cx=".35" cy=".35" r=".7">
          <stop offset="0" stop-color="#8fb6c9"/><stop offset=".55" stop-color="#2b3d52"/><stop offset="1" stop-color="#0e1620"/>
        </radialGradient>
        <symbol id="hc-corner" viewBox="0 0 64 64">
          <path d="M5 60V22C5 12 12 5 22 5h38" fill="none" stroke="url(#hc-gold)" stroke-width="2.6"/>
          <path d="M11 54V25c0-8 6-14 14-14h29" fill="none" stroke="url(#hc-gold)" stroke-width="1.2" opacity=".85"/>
          <path d="M17 31c0-9 5-14 14-14c7 0 10 6 6 10c-3 3-8 1-7-3" fill="none" stroke="url(#hc-gold)" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M31 17c-2-4-1-8 3-9M17 31c-4-2-8-1-9 3" fill="none" stroke="url(#hc-gold)" stroke-width="1.4" stroke-linecap="round"/>
          <circle cx="14" cy="14" r="4.6" fill="url(#hc-gold)"/><circle cx="14" cy="14" r="3" fill="url(#hc-gem)"/>
          <path d="M40 5l3-3l3 3l-3 3zM5 40l-3 3l3 3l3-3z" fill="url(#hc-gold)"/>
        </symbol>
      </defs>
    </svg>
    <canvas class="holo-embers" aria-hidden="true"></canvas>
    <div class="holo-brand" aria-hidden="true"><p>${esc(S.name)}</p><p><em>Ability card</em></p></div>
    <button class="holo-close" type="button"><span aria-hidden="true">✕</span> Close</button>

    <div class="holo-load" aria-live="polite">
      <p class="holo-load-name">${esc(S.name)}</p>
      <div class="holo-load-bar"><i></i></div>
      <p class="holo-load-row"><span>Loading the card</span><b>0%</b></p>
    </div>

    <div class="holo-stage">
      <div class="holo-float">
        <div class="holo-card" tabindex="0" role="img"
             aria-label="${esc(S.name)}, ${esc(C.role)}. ${esc(stats.map((s) => `${s.label} ${s.value}`).join(', '))}. Based in ${esc(C.based)}, works ${esc(C.works)}.">
          <div class="hc-face hc-front">
            <div class="hc-frame">
              <div class="hc-body">
                ${corner('tl')}${corner('tr')}${corner('bl')}${corner('br')}
                <div class="hc-banner"><span>${esc(S.name)}</span></div>
                <div class="hc-photo">
                  <img src="${esc(C.photo)}" alt="" draggable="false">
                  <i class="hc-foil"></i><i class="hc-sparkle"></i>
                </div>
                <div class="hc-ribbon"><span>${esc(C.role)}</span></div>
                <div class="hc-stats">
                  ${stats.slice(0, half).map(stat).join('')}
                  <div class="hc-divider" aria-hidden="true"><i></i></div>
                  ${stats.slice(half).map(stat).join('')}
                </div>
                <div class="hc-foot">
                  ${C.based ? `<span><small>based</small> ${esc(C.based)}</span>` : ''}
                  ${C.works ? `<span><small>works</small> ${esc(C.works)}</span>` : ''}
                  ${C.replies ? `<span><small>replies</small> ${esc(C.replies)}</span>` : ''}
                </div>
              </div>
            </div>
            <i class="hc-holo"></i><i class="hc-glare"></i>
          </div>

          <div class="hc-face hc-back">
            <div class="hc-frame">
              <div class="hc-body hc-body-back">
                ${corner('tl')}${corner('tr')}${corner('bl')}${corner('br')}
                <div class="hc-medal"><span>${esc(initials)}</span></div>
                <p class="hc-back-name">${esc(S.name)}</p>
                <p class="hc-back-role">${esc(C.role)}</p>
                <div class="hc-back-rule" aria-hidden="true"><i></i></div>
                <p class="hc-back-h">Strengths</p>
                <p class="hc-back-list">${(A.strengths || []).slice(0, 5).map(esc).join(' · ')}</p>
                <p class="hc-back-h">Toolkit</p>
                <p class="hc-back-list">${(A.tools || []).slice(0, 8).map(esc).join(' · ')}</p>
                <button class="hc-hire" type="button" data-card-hire>Hire me <span aria-hidden="true">→</span></button>
                <p class="hc-back-mail">${esc(S.email || '')}</p>
              </div>
            </div>
            <i class="hc-holo"></i><i class="hc-glare"></i>
          </div>
        </div>
      </div>
    </div>
    <p class="holo-hint">${fine.matches ? 'Hover to tilt · Drag to rotate · Double-click to flip' : 'Tilt or drag it · Tap to flip'}</p>`;
  document.body.appendChild(layer);

  const card = layer.querySelector('.holo-card');
  const floatEl = layer.querySelector('.holo-float');
  const stage = layer.querySelector('.holo-stage');
  const closeBtn = layer.querySelector('.holo-close');
  const loadEl = layer.querySelector('.holo-load');
  const loadPct = layer.querySelector('.holo-load-row b');
  const cv = layer.querySelector('.holo-embers');
  const ctx = cv.getContext('2d');

  // ---- card motion -----------------------------------------------------------
  let open = false, raf = 0, lastT = 0, time = 0;
  let rx = 0, ry = 0, vx = 0, vy = 0;          // current angles + angular velocity
  let baseY = 0;                                // 0 = front, 180 = back (multiples)
  let tiltX = 0, tiltY = 0, hover = false;      // hover tilt targets
  let drag = null;                              // { x, y, rx, ry, lx, ly, lt, vx, vy, moved }
  let px = 0.5, py = 0.5;                       // pointer position over the card (0..1)
  let opener = null;
  let lastTap = 0;                              // for double-click detection (pointer capture eats dblclick)

  function frame(now) {
    if (!open) return;
    const dt = Math.min(0.05, lastT ? (now - lastT) / 1000 : 0.016);
    lastT = now; time += dt;

    if (drag) {
      rx = drag.rx; ry = drag.ry;              // set directly by the pointer
    } else {
      const idle = reduce.matches ? 0 : 1;
      const gx = (hover ? tiltX : Math.sin(time * 0.6) * 3 * idle);
      const gy = baseY + (hover ? tiltY : Math.sin(time * 0.45) * 5 * idle);
      const K = 70, D = 12;                     // spring stiffness / damping
      vx += ((gx - rx) * K - vx * D) * dt;
      vy += ((gy - ry) * K - vy * D) * dt;
      rx += vx * dt; ry += vy * dt;
    }
    const bob = reduce.matches ? 0 : Math.sin(time * 1.1) * 6;
    floatEl.style.transform = `translateY(${bob.toFixed(2)}px)`;
    card.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;

    // light: glare follows the pointer (or the angle), foil shifts with the turn
    const turn = ((ry % 360) + 360) % 360;
    const lx = hover || drag ? px * 100 : 50 + Math.sin(turn * Math.PI / 180) * 40;
    const ly = hover || drag ? py * 100 : 35 - rx * 1.5;
    card.style.setProperty('--gx', `${lx.toFixed(1)}%`);
    card.style.setProperty('--gy', `${ly.toFixed(1)}%`);
    card.style.setProperty('--hx', `${(50 + ry * 0.9).toFixed(1)}%`);
    card.style.setProperty('--hy', `${(50 + rx * 1.4).toFixed(1)}%`);
    card.style.setProperty('--go', hover || drag ? '1' : '.55');

    drawEmbers(dt);
    raf = requestAnimationFrame(frame);
  }

  const local = (e) => {
    const r = card.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };

  // Hover is tracked on the stage: inside a 3D scene the browser may report the
  // wrapper rather than the card as the event target, so check the card's box.
  const hoverAt = (e) => {
    const p = local(e);
    px = clamp(p.x, 0, 1); py = clamp(p.y, 0, 1);
    const inside = p.x > -0.04 && p.x < 1.04 && p.y > -0.04 && p.y < 1.04;
    hover = inside && e.pointerType === 'mouse';
    if (hover) {
      tiltY = (px - 0.5) * 36;                // the side under the cursor dips away
      tiltX = -(py - 0.5) * 28;
    }
  };
  stage.addEventListener('pointerleave', () => { if (!drag) hover = false; });

  stage.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.target.closest('button')) return;
    e.preventDefault();
    try { stage.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    drag = { x: e.clientX, y: e.clientY, rx0: rx, ry0: ry, rx, ry, lx: e.clientX, lt: performance.now(), v: 0, moved: 0, type: e.pointerType };
    layer.classList.add('dragging');
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag) { hoverAt(e); return; }
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.moved = Math.max(drag.moved, Math.hypot(dx, dy));
    drag.ry = drag.ry0 + dx * 0.45;
    drag.rx = clamp(drag.rx0 - dy * 0.3, -40, 40);
    const now = performance.now(), dtt = Math.max(1, now - drag.lt);
    drag.v = drag.v * 0.6 + ((e.clientX - drag.lx) * 0.45 / dtt) * 1000 * 0.4;   // deg/s
    drag.lx = e.clientX; drag.lt = now;
    const p = local(e); px = clamp(p.x, 0, 1); py = clamp(p.y, 0, 1);
  });
  const endDrag = () => {
    if (!drag) return;
    const d = drag; drag = null;
    layer.classList.remove('dragging');
    rx = d.rx; ry = d.ry;
    if (d.moved < 6) {                          // a tap: touch flips; mouse flips on a double-click
      const now = performance.now();
      if (d.type !== 'mouse' || now - lastTap < 380) { flip(); lastTap = 0; } else lastTap = now;
      return;
    }
    vy = clamp(d.v, -900, 900);                 // fling, then settle on the nearest face
    const land = ry + vy * 0.25;
    baseY = Math.round(land / 180) * 180;
    vx = 0;
  };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  function flip() { baseY += 180; vy += 120; }

  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); baseY -= 180; }
    else if (e.key === 'ArrowRight') { e.preventDefault(); baseY += 180; }
  });

  // ---- embers ---------------------------------------------------------------
  let W = 0, H = 0, dpr = 1, embers = [];
  function sizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  }
  function makeEmber(fresh) {
    const big = Math.random() < 0.18;
    return {
      x: Math.random() * W,
      y: fresh ? Math.random() * H : H + 20,
      r: big ? 4 + Math.random() * 7 : 0.8 + Math.random() * 2.2,
      vy: -(big ? 6 + Math.random() * 10 : 12 + Math.random() * 30),
      vx: (Math.random() - 0.5) * 8,
      a: big ? 0.12 + Math.random() * 0.18 : 0.45 + Math.random() * 0.5,
      hue: 12 + Math.random() * 26,
      ph: Math.random() * Math.PI * 2,
      big,
    };
  }
  function drawEmbers(dt) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (reduce.matches) return;
    ctx.globalCompositeOperation = 'lighter';
    for (const p of embers) {
      p.y += p.vy * dt; p.x += (p.vx + Math.sin(time * 0.8 + p.ph) * 6) * dt;
      if (p.y < -30) Object.assign(p, makeEmber(false));
      const flick = p.big ? 1 : 0.65 + Math.sin(time * 6 + p.ph) * 0.35;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * (p.big ? 1 : 3));
      g.addColorStop(0, `hsla(${p.hue}, 90%, ${p.big ? 55 : 65}%, ${p.a * flick})`);
      g.addColorStop(1, `hsla(${p.hue}, 90%, 50%, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (p.big ? 1 : 3), 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  // ---- open / close -----------------------------------------------------------
  const preload = (src) => new Promise((res) => { const i = new Image(); i.onload = i.onerror = res; i.src = src; });

  function openCard(from) {
    if (open) return;
    opener = from || document.activeElement;
    open = true;
    layer.hidden = false;
    document.documentElement.classList.add('holo-open');
    sizeCanvas();
    embers = Array.from({ length: W < 700 ? 38 : 70 }, () => makeEmber(true));
    rx = -8; ry = baseY - 28; vx = vy = 0; hover = false; drag = null;
    layer.classList.remove('ready');
    requestAnimationFrame(() => layer.classList.add('on'));
    closeBtn.focus({ preventScroll: true });
    lastT = 0; raf = requestAnimationFrame(frame);

    // "Loading the card": real progress (photo + fonts), never shorter than ~0.8 s
    let target = 0.15, shown = 0, t0 = performance.now();
    const fonts = document.fonts && document.fonts.load ? Promise.all([
      document.fonts.load('italic 400 16px "EB Garamond"'), document.fonts.load('800 16px Onest'),
    ]).catch(() => {}) : Promise.resolve();
    Promise.all([preload(C.photo).then(() => { target = Math.max(target, 0.7); }), fonts]).then(() => { target = 1; });
    setTimeout(() => { target = 1; }, 4000);
    const tick = (now) => {
      if (!open) return;
      const time01 = Math.min(1, (now - t0) / 800);
      const want = Math.min(target, time01);
      shown += (want - shown) * 0.2;
      if (want - shown < 0.004) shown = want;
      loadEl.style.setProperty('--p', shown.toFixed(3));
      loadPct.textContent = `${Math.round(shown * 100)}%`;
      if (shown < 1) requestAnimationFrame(tick);
      else setTimeout(() => { if (open) { layer.classList.add('ready'); vy += 60; } }, 180);
    };
    if (reduce.matches) { loadEl.style.setProperty('--p', 1); loadPct.textContent = '100%'; layer.classList.add('ready'); }
    else requestAnimationFrame(tick);
  }

  function closeCard() {
    if (!open) return;
    open = false;
    cancelAnimationFrame(raf);
    layer.classList.remove('on');
    document.documentElement.classList.remove('holo-open');
    setTimeout(() => { if (!open) layer.hidden = true; }, 450);
    if (opener && opener.focus) opener.focus({ preventScroll: true });
  }

  closeBtn.addEventListener('click', closeCard);
  layer.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); closeCard(); return; }
    if (e.key === 'Tab') {                    // keep focus inside the overlay
      const f = [closeBtn, card, layer.querySelector('[data-card-hire]')];
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  layer.querySelector('[data-card-hire]').addEventListener('click', () => {
    closeCard();
    setTimeout(() => {
      const btn = document.querySelector('[data-open-contact]');
      if (btn) btn.click();
    }, 380);
  });
  window.addEventListener('resize', () => { if (open) sizeCanvas(); });

  window.AbilityCard = { open: openCard, close: closeCard };
})();
