/* ==========================================================================
   Pull cord: a physics rope (Verlet integration) drawn on a canvas.
   Swing it, brush past it, grab it anywhere, fling it. Pulling it down past
   the switch's travel fires a 'cord:toggle' event (main.js switches the
   theme), then the spring snaps it back up and gravity settles it again.
   The loop sleeps once the rope hangs still, so idle pages cost nothing.
   ========================================================================== */
(() => {
  'use strict';
  const wrap = document.getElementById('cord');
  const hit = document.getElementById('cord-hit');
  if (!wrap || !hit) return;

  const cv = document.createElement('canvas');
  cv.className = 'cord-cv';
  cv.setAttribute('aria-hidden', 'true');
  wrap.prepend(cv);
  const ctx = cv.getContext('2d');
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ---- tuning -------------------------------------------------------------
  const N = 24;            // rope segments
  const STEP = 1 / 120;    // fixed physics step (s)
  const PASSES = 14;       // constraint relaxation passes per step
  const GRAV = 4300;       // px/s², gives a lifelike ~1.2 s swing for this length
  const SPRING_K = 780;    // switch spring stiffness
  const SPRING_C = 22;     // switch spring damping

  let W = 320, H = 480, dpr = 1;
  let ax = 260;            // anchor x inside the canvas
  let len = 220;           // visible rope length
  let travel = 64;         // how far the switch can be pulled down
  let hidden = 84;         // rope kept above the top edge (feeds out as you pull)
  let seg = 12, rope = 3.4, kscale = 1.25;

  const P = [];            // points: { x, y, ox, oy, m }  (m = inverse mass, 0 = pinned)
  let ext = 0, extV = 0;   // switch extension + velocity
  let armed = true, active = false, dropped = false, time = 0;

  let grabbed = -1, gOff = { x: 0, y: 0 }, hand = null, handPrev = null, goal = null;
  let downT = 0, downP = null, maxMove = 0;
  let lastT = 0, acc = 0, asleep = true, quiet = 0, touched = 0;
  let brushLast = null;

  const rem = () => parseFloat(getComputedStyle(root).fontSize) || 16;

  // Where the cord hangs (viewport x): beside the clock on desktop,
  // in the gap between the clock and the Menu button on smaller screens.
  function anchorViewportX(vw) {
    const pill = document.querySelector('.time-pill');
    const menu = document.getElementById('menu-btn');
    const pr = pill && pill.offsetWidth ? pill.getBoundingClientRect() : null;
    const mr = menu && menu.offsetWidth ? menu.getBoundingClientRect() : null;
    if (pr && mr && mr.left > pr.right) return (pr.right + mr.left) / 2;
    if (pr) return Math.min(vw - 18, pr.right + 2.1 * rem());
    return vw - 40;
  }

  function layout() {
    const vw = window.innerWidth, vh = window.innerHeight;
    if (vw >= 1024) { len = Math.min(270, Math.max(190, vh * 0.3)); travel = 70; rope = 3.6; kscale = 1.3; }
    else if (vw >= 640) { len = Math.min(220, Math.max(150, vh * 0.2)); travel = 60; rope = 3.3; kscale = 1.2; }
    else { len = 70; travel = 52; rope = 3; kscale = 1.1; }
    hidden = travel + 20;
    W = Math.min(vw, 340);
    H = Math.round(len + travel + 180);
    wrap.style.width = `${W}px`;
    wrap.style.height = `${H}px`;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    seg = (len + hidden) / N;
    const nx = anchorViewportX(vw) - (vw - W);
    if (!P.length) {
      for (let i = 0; i <= N; i++) {
        const y = -hidden + i * seg;
        P.push({ x: nx, y, ox: nx, oy: y, m: i === 0 ? 0 : (i === N ? 0.3 : 1) });
      }
    } else {
      const d = nx - ax;
      for (const p of P) { p.x += d; p.ox += d; }
    }
    ax = nx;
  }

  // ---- physics ------------------------------------------------------------
  function step(dt) {
    if (!dropped) return;
    time += dt;

    if (grabbed < 0) {                    // nobody pulling: the switch springs back up
      extV += (-SPRING_K * ext - SPRING_C * extV) * dt;
      ext += extV * dt;
    }
    if (active && armed && ext > travel * 0.8) { armed = false; flip(); }
    if (ext < travel * 0.25) armed = true;

    const top = P[0];
    top.x = top.ox = ax;
    top.y = top.oy = -hidden + ext;

    const breeze = reduce.matches ? 0 : Math.sin(time * 0.7) * 14 + Math.sin(time * 1.9 + 0.8) * 6;
    const keep = grabbed >= 0 ? 0.993 : 0.988;
    for (let i = 1; i <= N; i++) {
      if (i === grabbed) continue;
      const p = P[i];
      const vx = (p.x - p.ox) * keep, vy = (p.y - p.oy) * keep;
      p.ox = p.x; p.oy = p.y;
      p.x += vx + breeze * dt * dt * (i / N);
      p.y += vy + GRAV * dt * dt;
    }
    if (grabbed >= 0 && goal) {
      const g = P[grabbed];
      g.ox = g.x; g.oy = g.y;
      g.x = goal.x; g.y = goal.y;
    }
    for (let k = 0; k < PASSES; k++) {
      for (let i = 0; i < N; i++) {
        const a = P[i], b = P[i + 1];
        const wa = i === grabbed ? 0 : a.m, wb = i + 1 === grabbed ? 0 : b.m, ws = wa + wb;
        if (!ws) continue;
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1e-6;
        const f = (d - seg) / d / ws;
        a.x += dx * f * wa; a.y += dy * f * wa;
        b.x -= dx * f * wb; b.y -= dy * f * wb;
      }
    }
    for (let i = 1; i <= N; i++) {        // stay inside the canvas
      const p = P[i];
      p.x = Math.max(14, Math.min(W - 14, p.x));
      if (p.y > H - 50) p.y = H - 50;
    }
  }

  // While dragging, the hand sets the grabbed point; the switch gives way up to
  // its travel, then the cord resists like stiff rubber.
  function follow() {
    if (grabbed < 0 || !hand) return;
    let tx = hand.x - gOff.x, ty = hand.y - gOff.y;
    const sx = ax, sy = -hidden, reach = grabbed * seg;
    const dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy) || 1e-6;
    let over = d - reach;
    if (over > travel) {
      const extra = over - travel;
      const allow = reach + travel + extra * 0.15 / (1 + extra / 150);
      tx = sx + dx / d * allow; ty = sy + dy / d * allow;
      over = travel;
    }
    const prev = ext;
    ext += (Math.max(0, over) - ext) * 0.5;
    extV = (ext - prev) * 60;
    goal = { x: Math.max(14, Math.min(W - 14, tx)), y: Math.min(H - 50, ty) };
  }

  function flip() {
    window.dispatchEvent(new CustomEvent('cord:toggle'));
    try { navigator.vibrate && navigator.vibrate(12); } catch (e) { /* not supported */ }
  }

  // ---- input --------------------------------------------------------------
  const local = (e) => { const r = wrap.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

  function startDrag(e, idx) {
    wake();
    grabbed = idx;
    const p = local(e), g = P[idx];
    gOff = { x: p.x - g.x, y: p.y - g.y };
    hand = handPrev = p;
    goal = { x: g.x, y: g.y };
    downT = performance.now(); downP = p; maxMove = 0;
    wrap.classList.add('dragging');
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
  }
  function onMove(e) {
    if (grabbed < 0) return;
    e.preventDefault();
    handPrev = hand; hand = local(e);
    maxMove = Math.max(maxMove, Math.hypot(hand.x - downP.x, hand.y - downP.y));
  }
  function endDrag() {
    if (grabbed < 0) return;
    const g = P[grabbed];
    if (hand && handPrev) {                // fling: hand velocity carries into the rope
      g.ox = g.x - (hand.x - handPrev.x) * 0.5;
      g.oy = g.y - (hand.y - handPrev.y) * 0.5;
    }
    const tap = maxMove < 6 && performance.now() - downT < 300;
    grabbed = -1; goal = null; hand = handPrev = null;
    wrap.classList.remove('dragging');
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
    if (tap) tug();
  }
  // a click, tap or keypress gives the cord a quick tug (enough to click the switch)
  function tug() { wake(); extV = travel * 45; P[N].ox = P[N].x + 1.5; }

  hit.addEventListener('pointerdown', (e) => {
    if (!dropped) return;
    e.preventDefault();
    try { hit.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    startDrag(e, N);
  });
  hit.addEventListener('click', (e) => e.preventDefault());
  hit.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tug(); }
  });

  // mouse: grab the rope anywhere along its length
  document.addEventListener('pointerdown', (e) => {
    if (!dropped || e.pointerType !== 'mouse' || e.button !== 0 || grabbed >= 0 || e.target === hit) return;
    const p = local(e);
    if (p.x < 0 || p.y < 0 || p.x > W || p.y > H) return;
    let best = -1, bd = 11;
    for (let i = 2; i <= N; i++) {
      if (P[i].y < 0) continue;
      const d = Math.hypot(P[i].x - p.x, P[i].y - p.y);
      if (d < bd) { bd = d; best = i; }
    }
    if (best > 0) { e.preventDefault(); startDrag(e, best); }
  });

  // mouse: brushing past the rope nudges it
  window.addEventListener('pointermove', (e) => {
    if (!dropped || grabbed >= 0 || e.pointerType !== 'mouse') return;
    const p = local(e);
    if (p.x < -20 || p.y < -20 || p.x > W + 20 || p.y > H + 20) { brushLast = null; return; }
    if (brushLast) {
      const vx = p.x - brushLast.x, vy = p.y - brushLast.y;
      let hitAny = false;
      for (let i = 2; i <= N; i++) {
        const q = P[i], d = Math.hypot(q.x - p.x, q.y - p.y);
        if (d < 16) { const f = (1 - d / 16) * 0.35; q.x += vx * f; q.y += vy * f * 0.5; hitAny = true; }
      }
      if (hitAny) wake();
    }
    brushLast = p;
  }, { passive: true });

  // ---- drawing ------------------------------------------------------------
  function trace(c) {                      // smooth curve through the points
    c.beginPath();
    c.moveTo(P[0].x, P[0].y);
    for (let i = 1; i < N; i++) {
      c.quadraticCurveTo(P[i].x, P[i].y, (P[i].x + P[i + 1].x) / 2, (P[i].y + P[i + 1].y) / 2);
    }
    c.lineTo(P[N].x, P[N].y);
  }

  function knobOutline(c) {                // turned acorn, hanging down from its ferrule
    c.beginPath();
    c.moveTo(-2.8, 6);
    c.bezierCurveTo(-4, 11, -9.8, 14, -9.8, 23);
    c.bezierCurveTo(-9.8, 31, -5.2, 36, 0, 36);
    c.bezierCurveTo(5.2, 36, 9.8, 31, 9.8, 23);
    c.bezierCurveTo(9.8, 14, 4, 11, 2.8, 6);
    c.closePath();
  }

  function drawKnob(c, x, y, ang, shadow) {
    c.save();
    c.translate(x, y);
    c.rotate(ang - Math.PI / 2);
    c.scale(kscale, kscale);
    if (shadow) { knobOutline(c); c.fill(); c.fillRect(-3.4, -0.5, 6.8, 7.5); c.restore(); return; }

    // brass ferrule
    const brass = c.createLinearGradient(-3.6, 0, 3.6, 0);
    brass.addColorStop(0, '#5a4826'); brass.addColorStop(0.32, '#ecd9a0');
    brass.addColorStop(0.55, '#b39451'); brass.addColorStop(1, '#46371c');
    c.fillStyle = brass;
    c.beginPath();
    if (c.roundRect) c.roundRect(-3.5, -0.6, 7, 7.6, 1.2); else c.rect(-3.5, -0.6, 7, 7.6);
    c.fill();
    c.fillStyle = 'rgba(0,0,0,.25)';
    c.fillRect(-3.5, 2.5, 7, 0.7); c.fillRect(-3.5, 4.4, 7, 0.6);

    // walnut body
    knobOutline(c);
    const wood = c.createLinearGradient(-9.8, 0, 9.8, 0);
    wood.addColorStop(0, '#22140b'); wood.addColorStop(0.22, '#6d4023'); wood.addColorStop(0.42, '#a66a3e');
    wood.addColorStop(0.6, '#7a4727'); wood.addColorStop(0.86, '#3a2112'); wood.addColorStop(1, '#1c1009');
    c.fillStyle = wood;
    c.fill();

    c.save();
    knobOutline(c);
    c.clip();
    c.strokeStyle = 'rgba(30,14,6,.28)';    // grain
    c.lineWidth = 0.55;
    for (let k = -3; k <= 3; k++) {
      c.beginPath(); c.moveTo(k * 2.4 - 0.6, 8);
      c.bezierCurveTo(k * 2.9 + 1, 16, k * 2.2 - 1, 26, k * 1.6, 36);
      c.stroke();
    }
    const glow = c.createRadialGradient(-3.6, 17, 0.5, -3.6, 17, 9);   // key light
    glow.addColorStop(0, 'rgba(255,226,190,.42)'); glow.addColorStop(1, 'rgba(255,226,190,0)');
    c.fillStyle = glow; c.fillRect(-10, 6, 20, 31);
    const occl = c.createLinearGradient(0, 24, 0, 36.5);                // bottom occlusion
    occl.addColorStop(0, 'rgba(0,0,0,0)'); occl.addColorStop(1, 'rgba(0,0,0,.35)');
    c.fillStyle = occl; c.fillRect(-10, 6, 20, 31);
    c.restore();

    c.fillStyle = 'rgba(255,240,220,.38)';  // specular streak
    c.beginPath(); c.ellipse(-4.4, 20.5, 1.1, 5.2, -0.08, 0, Math.PI * 2); c.fill();
    c.restore();
  }

  function draw() {
    const c = ctx;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, W, H);
    const end = P[N], prev = P[N - 1];
    const ang = Math.atan2(end.y - prev.y, end.x - prev.x);

    // soft shadow cast on the wall behind
    const sa = parseFloat(getComputedStyle(root).getPropertyValue('--cord-shadow')) || 0.18;
    c.save();
    c.translate(7, 11);
    if ('filter' in c) c.filter = 'blur(3px)';
    c.lineCap = 'round';
    c.strokeStyle = `rgba(0,0,0,${sa * 0.8})`; c.lineWidth = rope + 1;
    trace(c); c.stroke();
    c.fillStyle = `rgba(0,0,0,${sa})`;
    drawKnob(c, end.x, end.y, ang, true);
    c.restore();

    // braided cotton cord: dark rim, cream body, twist marks, lit edge
    c.lineCap = 'round'; c.lineJoin = 'round';
    trace(c);
    c.strokeStyle = '#6f6455'; c.lineWidth = rope + 1.3; c.stroke();
    c.strokeStyle = '#d6ccba'; c.lineWidth = rope; c.stroke();

    c.lineWidth = Math.max(0.6, rope * 0.24);
    c.strokeStyle = 'rgba(96,82,64,.55)';
    c.beginPath();
    const gap = rope * 1.05;
    let carry = 0;
    for (let i = 0; i < N; i++) {
      const a = P[i], b = P[i + 1];
      const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1e-6;
      const tx = dx / l, ty = dy / l, nx = -ty, ny = tx, h = rope * 0.5;
      let s = carry;
      for (; s < l; s += gap) {
        const x = a.x + tx * s, y = a.y + ty * s;
        if (y < -2) continue;
        c.moveTo(x - nx * h - tx * h * 0.7, y - ny * h - ty * h * 0.7);
        c.lineTo(x + nx * h + tx * h * 0.7, y + ny * h + ty * h * 0.7);
      }
      carry = s - l;
    }
    c.stroke();

    c.save();
    c.translate(-rope * 0.2, -rope * 0.05);
    trace(c);
    c.strokeStyle = 'rgba(255,252,244,.55)'; c.lineWidth = rope * 0.28; c.stroke();
    c.restore();

    drawKnob(c, end.x, end.y, ang, false);

    // keep the (invisible) switch button over the knob
    const kx = end.x + Math.cos(ang) * 20 * kscale, ky = end.y + Math.sin(ang) * 20 * kscale;
    hit.style.transform = `translate(${kx}px, ${ky}px)`;
  }

  // ---- never cut across a door ---------------------------------------------
  // The cord is fixed to the screen, so on narrow screens (where it hangs inside
  // the content column) it would cross the doors as they scroll past. While any
  // part of the rope or knob overlaps a door it fades out; it never does so mid-pull.
  let frame = 0, scrollQueued = false;
  function checkDoors() {
    if (grabbed >= 0) return;
    const doors = document.querySelectorAll('.door');
    let away = false;
    if (dropped && doors.length) {
      const off = window.innerWidth - W;
      let minX = Infinity, maxX = -Infinity, maxY = 0;
      for (let i = 1; i <= N; i++) {
        const p = P[i];
        if (p.y < 0) continue;
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      }
      const pad = 13 * kscale;
      const l = off + minX - pad, r = off + maxX + pad, b = maxY + 38 * kscale;
      for (const d of doors) {
        const dr = d.getBoundingClientRect();
        if (dr.width && l < dr.right + 4 && r > dr.left - 4 && dr.top < b && dr.bottom > 0) { away = true; break; }
      }
    }
    wrap.classList.toggle('away', away);
  }
  window.addEventListener('scroll', () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => { scrollQueued = false; checkDoors(); });
  }, { passive: true });
  window.addEventListener('hashchange', () => setTimeout(checkDoors, 900));

  // ---- loop ---------------------------------------------------------------
  function wake() {
    quiet = 0; touched = performance.now();
    if (!asleep) return;
    asleep = false; lastT = 0; acc = 0;
    requestAnimationFrame(loop);
  }

  function loop(now) {
    if (!lastT) lastT = now;
    const dt = Math.min((now - lastT) / 1000, 1 / 20);
    lastT = now;
    follow();
    acc += dt;
    while (acc >= STEP) { step(STEP); acc -= STEP; }
    // left alone, the swing calms a little faster so the rope comes to rest sooner
    if (active && grabbed < 0 && now - touched > 2500) {
      for (const q of P) { q.ox += (q.x - q.ox) * 0.06; q.oy += (q.y - q.oy) * 0.06; }
    }
    draw();
    if (++frame % 8 === 0) checkDoors();
    let motion = Math.abs(extV) + Math.abs(ext);
    for (const q of P) motion = Math.max(motion, Math.abs(q.x - q.ox) + Math.abs(q.y - q.oy));
    if (active && grabbed < 0 && motion < 0.06) {
      if (++quiet > 30) { for (const q of P) { q.ox = q.x; q.oy = q.y; } asleep = true; return; }
    } else quiet = 0;
    requestAnimationFrame(loop);
  }

  // ---- start: folded up out of view, drops in after the intro ---------------
  layout();
  P.forEach((p, i) => { p.y = p.oy = -hidden - i * seg * 0.98; p.x = p.ox = ax + Math.sin(i * 0.5) * 1.5; });
  draw();

  function drop() {
    if (dropped) return;
    layout();
    dropped = true;
    for (const p of P) p.ox = p.x - 0.45;   // a slight sideways swing as it falls
    setTimeout(() => { active = true; }, 900);
    wake();
  }
  // drop in once the opening intro has finished (main.js fires 'intro:ready' and sets body.ready)
  if (document.body.classList.contains('ready')) setTimeout(drop, 350);
  else window.addEventListener('intro:ready', () => setTimeout(drop, 450), { once: true });
  setTimeout(drop, 10000); // safety net

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { layout(); wake(); });
  let rt = 0;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { layout(); wake(); checkDoors(); }, 100); });
  new MutationObserver(wake).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
})();
