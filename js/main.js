/* ==========================================================================
   Portfolio app — hash router, loader, flip-card rotator, pull-cord theme
   switch, skill doors, story timeline, contact + ability dialogs.
   Content comes from js/content.js (window.SITE).
   ========================================================================== */
(() => {
  'use strict';

  const S = window.SITE;
  if (!S) { console.error('js/content.js did not load'); return; }

  // ---- Helpers ------------------------------------------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
  const pad = (n) => String(n).padStart(2, '0');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canHover = window.matchMedia('(hover: hover)');
  const storage = {
    get(store, k) { try { return window[store].getItem(k); } catch { return null; } },
    set(store, k, v) { try { window[store].setItem(k, v); } catch { /* storage blocked */ } },
  };

  // Per-page cleanups (timers, observers) run on every route change.
  const cleanups = [];
  const onCleanup = (fn) => cleanups.push(fn);
  const runCleanups = () => { while (cleanups.length) { try { cleanups.pop()(); } catch { /* ignore */ } } };

  // ---- Clock --------------------------------------------------------------
  let fmtTime, fmtDate;
  try {
    fmtTime = new Intl.DateTimeFormat('en-US', { timeZone: S.timezone, hour: 'numeric', minute: '2-digit', hour12: true });
    fmtDate = new Intl.DateTimeFormat('en-GB', { timeZone: S.timezone, day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    fmtTime = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    fmtDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  function tick() {
    const now = new Date();
    const time = fmtTime.format(now).replace(/\s/g, '').toLowerCase();          // 11:46pm
    const date = fmtDate.format(now).replace(/^(\d+) (\S+) (\d+)$/, '$1 $2, $3'); // 7 November, 2026
    $$('[data-clock-time]').forEach((el) => { if (el.textContent !== time) el.textContent = time; });
    $$('[data-clock-date]').forEach((el) => { if (el.textContent !== date) el.textContent = date; });
  }

  // ---- Header + footer ----------------------------------------------------
  function renderHeader() {
    const navSkills = S.skills.filter((s) => s.inNav !== false);
    $('#nav').innerHTML = [
      '<a href="#home" data-route="">Home</a>',
      ...navSkills.map((s) => `<a href="#${esc(s.slug)}" data-route="${esc(s.slug)}">${esc(s.nav || s.title)}</a>`),
      '<a href="#about" data-route="about">My story</a>',
      '<button type="button" data-open-contact>Contact</button>',
    ].join('');
  }

  function renderFooter() {
    const socials = (S.socials || []).filter((x) => x && x.href);
    $('#footer').innerHTML = `
      <div class="wrap">
        <div class="foot-grid">
          <div><p class="foot-h">Work</p><ul>${S.skills.map((s) => `<li><a href="#${esc(s.slug)}">${esc(s.title)}</a></li>`).join('')}</ul></div>
          <div><p class="foot-h">Navigate</p><ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><button type="button" data-open-contact>Contact</button></li>
            <li><a href="mailto:${esc(S.email)}">${esc(S.email)}</a></li>
            ${S.phone ? `<li><a href="tel:${esc(S.phone.replace(/\s/g, ''))}">${esc(S.phone)}</a></li>` : ''}
          </ul></div>
          <div><p class="foot-h">Status</p><ul>
            <li>${esc(S.availability.status)}</li>
            <li>${esc(S.availability.region)}</li>
            ${S.location ? `<li>${esc(S.location)}</li>` : ''}
            <li>Local time <b data-clock-time></b></li>
          </ul></div>
          ${socials.length ? `<div><p class="foot-h">Elsewhere</p><ul>${socials.map((x) => `<li><a href="${esc(x.href)}" target="_blank" rel="noopener">${esc(x.label)} ↗</a></li>`).join('')}</ul></div>` : ''}
        </div>
        <div class="foot-base">
          <span>© ${new Date().getFullYear()} ${esc(S.name)}</span>
          <a href="#legal">Privacy &amp; credits</a>
          <button type="button" data-scroll-top>Back to top ↑</button>
        </div>
      </div>`;
  }

  // ---- Pages --------------------------------------------------------------
  function heroHTML() {
    const roles = S.roles || S.skills.map((s) => s.title);
    const longest = roles.reduce((a, b) => (b.length > a.length ? b : a), '');
    return `
    <section class="hero" id="top">
      <div class="wrap hero-grid">
        <div class="hero-copy">
          <p class="eyebrow"><span class="dot"></span>${esc(S.tagline)}</p>
          <h1 class="hero-title"><span class="hi">Hi, I'm ${esc(S.firstName)}.</span><span class="iam">I am a</span></h1>
          <p class="sr-only">${esc(roles.join(', '))}.</p>
          <div class="notepad" id="notepad" aria-hidden="true">
            <div class="rings">${'<i></i>'.repeat(12)}</div>
            <div class="stack">
              <div class="page sizer">${esc(longest)}</div>
              <div class="page under" id="role-under"></div>
              <div class="page top" id="role-top"></div>
            </div>
            <span class="count" id="role-count"></span>
          </div>
          <div class="cta-row">
            <button class="btn btn-dark" type="button" data-open-contact>${esc(S.heroButton)} <span class="arrow" aria-hidden="true">→</span></button>
            <button class="btn btn-ghost" type="button" data-scroll="doors">See my work</button>
          </div>
        </div>
        <figure class="portrait">
          <img src="${esc(portraitSrc())}" data-portrait alt="${esc(S.portraitAlt)}" width="1206" height="943" fetchpriority="high">
          ${S.portraitReveal ? `<img class="portrait-reveal" src="${esc(S.portraitReveal)}" alt="" aria-hidden="true" width="1206" height="943">` : ''}
          <button class="chip" type="button" data-open-ability>${esc(S.ability.title)}</button>
        </figure>
      </div>
      <div class="hero-foot">
        <span>${esc(S.availability.status)}</span>
        <span>${esc(S.availability.region)}</span>
        <button type="button" data-scroll="doors">Scroll to explore ↓</button>
      </div>
    </section>`;
  }

  function doorsHTML() {
    const H = S.headings;
    const plate = (s) => {
      const words = String(s.plate || s.title).split(' ');
      if (words.length < 2) return `<b>${esc(words[0])}</b>`;
      const cut = Math.ceil(words.length / 2);
      return `<b>${esc(words.slice(0, cut).join(' '))}</b><b>${esc(words.slice(cut).join(' '))}</b>`;
    };
    return `
    <section class="doors" id="doors" aria-labelledby="doors-h">
      <div class="doors-head reveal">
        <h2 id="doors-h">${esc(H.doors)}</h2>
      </div>
      <div class="wall">
        <div class="doors-row">
          ${S.skills.map((s) => `
          <a class="door" href="#${esc(s.slug)}" data-door style="--door:${esc(s.color || '#444')}" aria-label="${esc(s.title)}: ${esc(s.subtitle || s.blurb)}. Open this door.">
            <span class="d-frame">
              <span class="d-light"></span>
              <span class="d-leaf">
                <span class="d-panel"></span>
                <span class="d-plate">${plate(s)}</span>
                <span class="d-handle"><i class="lever"></i><i class="keyhole"></i></span>
              </span>
            </span>
            <span class="d-feet" aria-hidden="true"></span>
            <span class="d-enter">Click to enter</span>
          </a>`).join('')}
        </div>
        <div class="dinfo" id="dinfo" aria-hidden="true"><h3 class="dinfo__h"></h3><p class="dinfo__t"></p><ul class="dinfo__p"></ul></div>
        <div class="floor" aria-hidden="true"></div>
      </div>
    </section>`;
  }

  function storyHTML() {
    const n = S.story.length;
    const first = S.story[0] || {};
    const yr = (e, i) => e.year || pad(i + 1);
    return `
    <section class="story" id="about" aria-labelledby="story-h">
      <div class="story-rays" aria-hidden="true"></div>
      <div class="wrap story-grid">
        <div class="story-side">
          <div class="story-side-in">
            <p class="eyebrow"><span class="dot"></span>${esc(S.headings.storyKicker)}</p>
            <h2 id="story-h">${esc(S.headings.story)}</h2>
            ${(S.interests || []).length ? `<p class="story-interests"><span class="mono">Interests</span> ${S.interests.map(esc).join(' · ')}</p>` : ''}
            <p class="big-year" id="story-year" aria-hidden="true"><span>${esc(yr(first, 0))}</span></p>
            <p class="mono story-period" id="story-period">${esc(first.period)}</p>
            <div class="story-count" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/></svg>
              <span class="mono"><b id="story-now">01</b> / ${pad(n)}</span>
              <span class="story-bar"><span id="story-bar" style="width:${100 / n}%"></span></span>
            </div>
          </div>
        </div>
        <ol class="timeline">
          ${S.story.map((e, i) => `
          <li class="t-item${i === 0 ? ' active' : ''}" data-i="${i}">
            ${e.period ? `<p class="mono t-period">${esc(e.period)}</p>` : ''}
            <h3>${esc(e.title)}</h3>
            <p class="t-org">${esc(e.org)}${e.type ? `<span class="t-type">${esc(e.type)}</span>` : ''}</p>
            ${e.summary ? `<p class="t-summary">${esc(e.summary)}</p>` : ''}
            ${(e.bullets || []).length ? `<ul class="t-bullets">${e.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
            ${(e.tags || []).length ? `<ul class="t-tags" aria-label="Tools used">${e.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
            ${e.link ? `<a class="t-link" href="${esc(e.link.href)}" target="_blank" rel="noopener">${esc(e.link.label)} <span aria-hidden="true">↗</span></a>` : ''}
          </li>`).join('')}
        </ol>
      </div>
    </section>`;
  }

  function ctaHTML() {
    return `
    <section class="cta" id="cta">
      <div class="wrap">
        <p class="eyebrow reveal"><span class="dot live"></span>${esc(S.availability.status)}</p>
        <h2 class="cta-title reveal"><span>${esc(S.cta.title)}</span><span class="muted">${esc(S.cta.title2)}</span></h2>
        <p class="cta-text reveal">${esc(S.cta.text)}</p>
        <div class="cta-row reveal">
          <button class="btn btn-dark" type="button" data-open-contact>${esc(S.heroButton)} <span class="arrow" aria-hidden="true">→</span></button>
          <button class="btn btn-ghost" type="button" data-scroll="doors">See my work</button>
        </div>
      </div>
    </section>`;
  }

  function renderHome(main) {
    main.innerHTML = heroHTML() + doorsHTML() + storyHTML() + ctaHTML();
    initRotator();
    initReveal_();
    initDoors();
    initStory();
  }

  function renderSkill(main, s) {
    const i = S.skills.indexOf(s);
    const prev = S.skills[(i - 1 + S.skills.length) % S.skills.length];
    const next = S.skills[(i + 1) % S.skills.length];
    const card = (p, k) => `
      <article class="pcard" style="--k:${k}">
        <div class="pc-text">
          <p class="mono">${esc(p.kind || 'Project')}</p>
          <h3>${esc(p.title)}</h3>
          ${p.subtitle ? `<p class="pc-sub">${esc(p.subtitle)}</p>` : ''}
          <p class="pc-desc">${esc(p.desc)}</p>
          ${(p.bullets || []).length ? `<ul class="t-bullets pc-bullets">${p.bullets.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
          ${(p.tags || []).length ? `<ul class="chips small">${p.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
          ${p.note ? `<p class="pc-note"><span class="dot"></span>${esc(p.note)}</p>` : ''}
          ${p.link ? `<a class="btn btn-ghost pc-link" href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.linkLabel || 'Live demo')} ↗</a>` : ''}
          ${p.code ? `<a class="btn btn-ghost pc-link" href="${esc(p.code)}" target="_blank" rel="noopener">View code ↗</a>` : ''}
        </div>
        <div class="monitor" aria-hidden="${p.image ? 'false' : 'true'}">
          <div class="m-screen">${p.image
            ? `<img src="${esc(p.image)}" alt="${esc(p.title)} screenshot" loading="lazy">`
            : `<span class="m-ph"><b>${esc(p.title)}</b><small>${esc(p.kind || '')}</small></span>`}</div>
          <div class="m-neck"></div><div class="m-foot"></div>
        </div>
      </article>`;
    main.innerHTML = `
    <section class="skill-page" style="--door:${esc(s.color || '#444')}">
      <div class="wrap">
        <header class="skill-head">
          <p class="mono">${pad(i + 1)} / ${pad(S.skills.length)} · ${esc(s.plate || s.title)}</p>
          <h1 class="skill-title">${esc(s.nav || s.title)}</h1>
          <p class="lead">${esc(s.lead || s.blurb)}</p>
        </header>
        <div class="pcards">${(s.projects || []).map(card).join('')}</div>
        <div class="cols">
          <div class="reveal"><h2>What I do</h2><ul class="checks big">${(s.points || []).map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>
          <div class="reveal"><h2>Tools</h2><ul class="chips">${(s.tools || []).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
            <div class="cta-row" style="margin-top:32px"><button class="btn btn-dark" type="button" data-open-contact="${esc(s.title)}">Hire me for this <span class="arrow" aria-hidden="true">→</span></button></div>
          </div>
        </div>
        <nav class="skill-next" aria-label="More skills">
          <a href="#${esc(prev.slug)}"><small>← Previous door</small><strong>${esc(prev.nav || prev.title)}</strong></a>
          <a href="#${esc(next.slug)}"><small>Next door →</small><strong>${esc(next.nav || next.title)}</strong></a>
        </nav>
      </div>
      <a class="back-doors" href="#doors">← Back to the doors</a>
    </section>`;
  }

  function renderLegal(main) {
    main.innerHTML = `
    <section class="page-top legal">
      <div class="wrap">
        <a class="back" href="#home">← Back home</a>
        <h1 class="skill-title">Privacy &amp; credits</h1>
        <p class="lead">This is my personal portfolio. It doesn’t track you, and it only learns anything about you if you choose to get in touch.</p>

        <h2>In short</h2>
        <p>No analytics, no advertising, no cookies and no tracking pixels. Nothing about your visit is recorded or sent to me.</p>

        <h2>Who runs this site</h2>
        <p>${esc(S.name)}, a software developer based in ${esc(S.location || 'Kenya')}. You can reach me at <a href="mailto:${esc(S.email)}">${esc(S.email)}</a>${S.phone ? ` or on ${esc(S.phone)}` : ''}.</p>

        <h2>What this site keeps on your device</h2>
        <p>Two small notes in your own browser. Neither is a cookie, and neither ever leaves your device:</p>
        <ul>
          <li>your light or dark mode choice (local storage, key <code>theme</code>), so the site remembers it next time;</li>
          <li>that you’ve already seen the intro screen on this visit (session storage, key <code>entered</code>). It’s cleared when you close the tab.</li>
        </ul>
        <p>You can clear both at any time from your browser’s settings.</p>

        <h2>Fonts</h2>
        <p>The fonts load from Google Fonts. When the page opens, your browser connects to Google’s servers, which receive your IP address and browser details to deliver the font files. Google’s own privacy policy covers that.</p>

        <h2>When you contact me</h2>
        <p>The “Hire me” form doesn’t send anything to a server. It opens your own email app with your message filled in, and nothing is sent until you press send there. I use what you send only to reply and to discuss your project, and I’ll delete it if you ask.</p>

        <h2>Hosting</h2>
        <p>Like any website, this one is delivered by a hosting company whose servers briefly process technical details, such as your IP address and browser type, to serve the pages and protect them from abuse. I don’t use those logs to identify anyone.</p>

        <h2>Links to other websites</h2>
        <p>Some projects link to live websites. Once you follow a link, you’re on that site and its own privacy policy applies.</p>

        <h2>Your rights</h2>
        <p>You can ask me what personal data I hold about you, and ask me to correct or delete it, by emailing me. I’ll reply within 30 days. You also have rights under Kenya’s Data Protection Act, 2019.</p>

        <h2>Work shown on this site</h2>
        <p>The projects here were built by me, on my own or as part of a team. Product names, logos and screenshots belong to their owners and are shown only to describe my part in the work; showing them doesn’t mean those companies endorse this site. If you own any of it and want it changed or removed, email me and I’ll act on it promptly.</p>
        <p>The photographs of me and my original designs are © ${new Date().getFullYear()} ${esc(S.name)}. Please don’t copy or republish them without my permission.</p>

        <h2>Credits &amp; licences</h2>
        <p>Built with plain HTML, CSS and JavaScript, with no frameworks and no trackers, plus the work of these people:</p>
        <div class="legal-table"><table>
          <thead><tr><th>What</th><th>Used for</th><th>Licence</th></tr></thead>
          <tbody>${(S.credits || []).map((c) => (typeof c === 'string'
            ? `<tr><td colspan="3">${esc(c)}</td></tr>`
            : `<tr><td><strong>${esc(c.name)}</strong><small>${esc(c.by)}</small></td><td data-label="Used for">${esc(c.use)}</td><td data-label="Licence">${esc(c.licence)}</td></tr>`)).join('')}</tbody>
        </table></div>

        <p class="legal-updated">Last updated ${esc(S.legalUpdated || '')}. © ${new Date().getFullYear()} ${esc(S.name)}.</p>
      </div>
    </section>`;
  }

  function renderNotFound(main) {
    main.innerHTML = `
    <section class="page-top">
      <div class="wrap">
        <p class="kicker">404</p>
        <h1 class="skill-title">Nothing behind this door.</h1>
        <a class="btn btn-dark" href="#home">Back home <span class="arrow" aria-hidden="true">→</span></a>
      </div>
    </section>`;
  }

  // ---- Home interactions ----------------------------------------------------
  function initRotator() {
    const roles = S.roles || S.skills.map((s) => s.title);
    const top = $('#role-top'); const under = $('#role-under'); const count = $('#role-count'); const pad_ = $('#notepad');
    if (!top || !roles.length) return;
    let i = 0; let busy = false; let paused = false;
    const setCount = () => { count.textContent = `${pad(i + 1)} / ${pad(roles.length)}`; };
    top.textContent = roles[0];
    under.textContent = roles[1 % roles.length];
    setCount();
    if (roles.length < 2) return;

    const advance = () => {
      if (busy) return;
      const n = (i + 1) % roles.length;
      if (reduceMotion.matches) { i = n; top.textContent = roles[i]; under.textContent = roles[(i + 1) % roles.length]; setCount(); return; }
      busy = true;
      under.textContent = roles[n];
      top.classList.add('flip');
      const done = () => {
        i = n; top.textContent = roles[i]; top.classList.remove('flip');
        under.textContent = roles[(i + 1) % roles.length]; setCount(); busy = false;
      };
      top.addEventListener('animationend', done, { once: true });
    };
    const timer = setInterval(() => { if (!paused && !document.hidden) advance(); }, 2800);
    pad_.addEventListener('pointerenter', () => { paused = true; });
    pad_.addEventListener('pointerleave', () => { paused = false; });
    pad_.addEventListener('click', advance);
    onCleanup(() => clearInterval(timer));
  }

  // Hover the photo: a soft spotlight follows the cursor and shows the
  // original colour photo (with its real background) under the B&W cut-out.
  function initReveal_() {
    const fig = $('.portrait');
    const layer = $('.portrait-reveal');
    if (!fig || !layer) return;
    const move = (e) => {
      const r = layer.getBoundingClientRect();
      layer.style.setProperty('--mx', `${e.clientX - r.left}px`);
      layer.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    const show = (e) => { move(e); fig.classList.add('revealing'); };
    const hide = () => fig.classList.remove('revealing');
    const img = $('img', fig);
    img.addEventListener('pointerenter', show);
    layer.addEventListener('pointerenter', show);
    fig.addEventListener('pointermove', move);
    fig.addEventListener('pointerleave', hide);
    fig.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') show(e); });
    fig.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') hide(); });
    fig.addEventListener('pointercancel', hide);
  }

  // Desktop hover: the door swings open a little, the other doors fade back and
  // what's behind it is written on the wall beside it (right of the first half,
  // left of the second). A dark "Click to enter" pill follows the cursor.
  function initDoors() {
    const sec = $('#doors');
    if (!sec) return;
    const doors = $$('[data-door]', sec);
    const info = $('#dinfo', sec);
    const wall = $('.wall', sec);
    const desk = window.matchMedia('(hover: hover) and (min-width: 961px)');
    let pill = $('#door-cursor');
    if (!pill) {
      pill = document.createElement('div');
      pill.id = 'door-cursor'; pill.className = 'door-cursor'; pill.textContent = 'Click to enter';
      pill.setAttribute('aria-hidden', 'true');
      document.body.appendChild(pill);
    }
    let active = -1; let hideT = 0;

    const fill = (i) => {
      const s = S.skills[i];
      $('.dinfo__h', info).textContent = s.nav || s.title;
      $('.dinfo__t', info).textContent = s.subtitle || s.blurb || '';
      $('.dinfo__p', info).innerHTML = (s.points || []).map((p) => `<li>${esc(p)}</li>`).join('');
    };
    const place = (i) => {
      const wr = wall.getBoundingClientRect(); const r = doors[i].getBoundingClientRect();
      const toRight = i < doors.length / 2 && doors[i + 1];
      const ref = (toRight ? doors[i + 1] : (doors[i - 1] || doors[i])).getBoundingClientRect();
      const left = toRight ? ref.left - wr.left : ref.right - wr.left - info.offsetWidth;
      const top = r.top - wr.top + r.height * 0.5 - info.offsetHeight / 2;
      info.style.left = `${Math.round(left)}px`;
      info.style.top = `${Math.round(top)}px`;
    };
    const show = (i) => {
      if (!desk.matches) return;
      clearTimeout(hideT);
      if (i !== active) {
        active = i;
        info.classList.remove('on');
        fill(i);
        void info.offsetWidth; // restart the list animation
        place(i);
      }
      doors.forEach((d, k) => d.classList.toggle('on', k === i));
      sec.classList.add('focus');
      info.classList.add('on');
    };
    const hide = () => {
      clearTimeout(hideT);
      hideT = setTimeout(() => {
        active = -1;
        sec.classList.remove('focus');
        doors.forEach((d) => d.classList.remove('on'));
        info.classList.remove('on');
      }, 120);
    };
    const movePill = (e) => { pill.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`; };

    doors.forEach((d, i) => {
      d.addEventListener('pointerenter', (e) => {
        if (e.pointerType !== 'mouse') return;
        show(i);
        if (desk.matches) { movePill(e); pill.classList.add('on'); }
      });
      d.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' && desk.matches) movePill(e); });
      d.addEventListener('pointerleave', () => { hide(); pill.classList.remove('on'); });
      d.addEventListener('focus', () => show(i));
      d.addEventListener('blur', hide);
      d.addEventListener('click', () => pill.classList.remove('on'));
    });
    onCleanup(() => { clearTimeout(hideT); pill.classList.remove('on'); });
  }

  // Clicking a door: zoom into it, swing it open, then load the skill page.
  let entering = false;
  function enterDoor(door) {
    const href = door.getAttribute('href');
    if (entering) return;
    if (reduceMotion.matches || !door.animate) { location.hash = href; return; }
    entering = true;
    const frame = $('.d-frame', door);
    const r = frame.getBoundingClientRect();
    const overlay = document.createElement('div');
    overlay.className = 'door-zoom';
    const clone = frame.cloneNode(true);
    clone.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;margin:0;--door:${door.style.getPropertyValue('--door')}`;
    overlay.appendChild(clone);
    document.body.appendChild(overlay);
    const vw = window.innerWidth; const vh = window.innerHeight;
    const s = Math.max(vw / (r.width * 0.62), vh / (r.height * 0.86)) * 1.15;
    const dx = vw / 2 - (r.left + r.width / 2); const dy = vh / 2 - (r.top + r.height * 0.55);
    overlay.animate([{ backgroundColor: 'rgba(10,9,9,0)' }, { backgroundColor: 'rgba(10,9,9,.92)' }], { duration: 450, fill: 'forwards' });
    clone.animate([
      { transform: 'translate(0,0) scale(1)' },
      { transform: `translate(${dx}px,${dy}px) scale(1.25)`, offset: 0.35 },
      { transform: `translate(${dx}px,${dy}px) scale(${s})` },
    ], { duration: 1300, easing: 'cubic-bezier(.6,0,.2,1)', fill: 'forwards' });
    $('.d-leaf', clone).animate([{ transform: 'rotateY(0)' }, { transform: 'rotateY(-82deg)' }], { duration: 700, delay: 420, easing: 'cubic-bezier(.5,0,.2,1)', fill: 'forwards' });
    const flash = document.createElement('div'); flash.className = 'door-flash'; overlay.appendChild(flash);
    flash.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 380, delay: 1000, fill: 'forwards' }).finished.then(() => {
      location.hash = href;
      requestAnimationFrame(() => {
        overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 550, easing: 'ease-out', fill: 'forwards' }).finished.then(() => { overlay.remove(); entering = false; });
      });
    });
  }

  function initStory() {
    const items = $$('.t-item');
    if (!items.length) return;
    const yearEl = $('#story-year'); const periodEl = $('#story-period');
    const now = $('#story-now'); const bar = $('#story-bar');
    const n = items.length;
    let current = 0;
    const show = (i) => {
      if (i === current) return;
      const e = S.story[i]; const yr = (x, k) => x.year || pad(k + 1); const prevYear = yr(S.story[current], current); const newYear = yr(e, i);
      current = i;
      items.forEach((x, k) => x.classList.toggle('active', k === i));
      now.textContent = pad(i + 1);
      bar.style.width = `${((i + 1) / n) * 100}%`;
      periodEl.textContent = e.period;
      if (newYear !== prevYear) {
        const span = document.createElement('span'); span.textContent = newYear;
        // Numbers still rolling out from an earlier change go at once; only the one
        // currently shown rolls out. (Fast scrolling used to leave numbers stacked.)
        $$('span.leaving', yearEl).forEach((x) => x.remove());
        const olds = $$('span', yearEl);
        yearEl.appendChild(span);
        const animate = !reduceMotion.matches && !!span.animate;
        if (animate) span.animate([{ transform: 'translateY(60%) rotateX(-70deg)', opacity: 0, filter: 'blur(6px)' }, { transform: 'none', opacity: 1, filter: 'blur(0)' }], { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)' });
        olds.forEach((old) => {
          if (!animate) { old.remove(); return; }
          old.classList.add('leaving');
          old.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(-60%) rotateX(70deg)', opacity: 0 }], { duration: 500, easing: 'ease-in', fill: 'forwards' })
            .finished.then(() => old.remove(), () => old.remove());
        });
      }
    };
    if (!('IntersectionObserver' in window)) { items.forEach((x) => x.classList.add('active')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) show(Number(e.target.dataset.i)); });
    }, { rootMargin: '-48% 0px -48% 0px' });
    items.forEach((x) => io.observe(x));
    onCleanup(() => io.disconnect());
  }

  function initReveal() {
    const els = $$('.reveal:not(.in)');
    if (!('IntersectionObserver' in window) || reduceMotion.matches) { els.forEach((x) => x.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach((x) => io.observe(x));
    onCleanup(() => io.disconnect());
  }

  // ---- Router -------------------------------------------------------------
  function route() {
    runCleanups();
    closeMenu();
    const path = location.hash.replace(/^#\/?/, '').replace(/\/$/, '');
    const main = $('#main');
    main.classList.remove('plain'); // the plain-HTML version is replaced by the interactive one
    let scrollTarget = null;

    if (['', 'home', 'about', 'doors', 'skills', 'projects', 'contact', 'contact-me'].includes(path)) {
      renderHome(main);
      document.title = S.siteTitle;
      // links from the plain-HTML version of the page (#skills, #projects, #contact) land on the matching part
      if (path === 'about' || path === 'doors') scrollTarget = path;
      if (path === 'skills' || path === 'projects') scrollTarget = 'doors';
      if (path === 'contact' || path === 'contact-me') setTimeout(() => openContact(), 300);
    } else if (path === 'legal') {
      renderLegal(main);
      document.title = `Privacy & credits — ${S.name}`;
    } else {
      const skill = S.skills.find((s) => s.slug === path);
      if (skill) { renderSkill(main, skill); document.title = `${skill.title} — ${S.name}`; }
      else { renderNotFound(main); document.title = `Not found — ${S.name}`; }
    }

    $$('#nav [data-route]').forEach((a) => {
      const active = a.dataset.route === path || (a.dataset.route === '' && path === 'home');
      if (active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });

    tick();
    initReveal();
    if (scrollTarget) {
      requestAnimationFrame(() => document.getElementById(scrollTarget)?.scrollIntoView({ behavior: 'instant' }));
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    main.focus({ preventScroll: true });
    onScroll();
  }

  // ---- Mobile menu --------------------------------------------------------
  const nav = $('#nav'); const menuBtn = $('#menu-btn');
  function closeMenu() {
    nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.textContent = 'Menu'; document.documentElement.classList.remove('nav-open');
  }
  menuBtn.addEventListener('click', () => {
    const open = !nav.classList.contains('open');
    nav.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Close' : 'Menu';
    document.documentElement.classList.toggle('nav-open', open);
  });
  nav.addEventListener('click', (e) => { if (e.target.closest('a, button')) closeMenu(); });

  // ---- Scroll-linked header + floating bar --------------------------------
  const header = $('#header'); const floatBar = $('#float-bar');
  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 10);
    floatBar.classList.toggle('show', y > window.innerHeight * 0.6);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---- Theme + pull cord ----------------------------------------------------
  const cord = $('#cord-hit'); // the switch button riding on the rope's knob (js/cord.js)
  // the hero photo has a dark-mode version with a dimmer background halo
  function portraitSrc() {
    return document.documentElement.dataset.theme === 'dark' && S.portraitDark ? S.portraitDark : S.portrait;
  }
  function setTheme(theme) {
    if (theme === 'dark') document.documentElement.dataset.theme = 'dark';
    else delete document.documentElement.dataset.theme;
    storage.set('localStorage', 'theme', theme);
    const dark = theme === 'dark';
    cord.setAttribute('aria-checked', String(dark));
    cord.setAttribute('aria-label', dark ? 'Pull the cord to switch to light mode' : 'Pull the cord to switch to dark mode');
    $('meta[name="theme-color"]').setAttribute('content', dark ? '#141212' : '#1a1818');
    $$('img[data-portrait]').forEach((img) => {
      const src = portraitSrc();
      if (img.getAttribute('src') !== src) img.setAttribute('src', src);
    });
  }
  const toggleTheme = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

  // The rope (js/cord.js) fires this when it's pulled past the switch, tapped, or Enter is pressed.
  window.addEventListener('cord:toggle', toggleTheme);

  // ---- Dialog helpers -------------------------------------------------------
  function openDialog(dlg) {
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }
  $$('dialog.modal').forEach((dlg) => {
    dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
  });

  // ---- Ability card ---------------------------------------------------------
  function openAbility(from) {
    if (window.AbilityCard) { window.AbilityCard.open(from); return; } // the 3D holo card (js/card.js)
    const a = S.ability;
    $('#ability-body').innerHTML = `
      <p class="kicker">${esc(S.name)}</p>
      <h2 id="ability-title">${esc(a.title)}</h2>
      <p class="ac-sub">${esc(a.subtitle)}</p>
      <dl class="ac-stats">${(a.stats || []).map((s) => `<div><dd>${esc(s.value)}</dd><dt>${esc(s.label)}</dt></div>`).join('')}</dl>
      <p class="ac-h">Strengths</p><ul class="chips">${(a.strengths || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      <p class="ac-h">Toolkit</p><ul class="chips">${(a.tools || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      <div class="done-actions"><button class="btn btn-dark" type="button" data-open-contact>Hire me <span class="arrow" aria-hidden="true">→</span></button></div>`;
    openDialog($('#ability'));
  }

  // ---- Contact (5-step form → prefilled email) ------------------------------
  const contactDlg = $('#contact'); const contactBody = $('#contact-body');
  const steps = [
    { key: 'type', q: 'What do you need?', kind: 'choice', options: S.contactOptions },
    { key: 'about', q: 'Tell me about the project', kind: 'text', help: 'A few lines is plenty: goals, audience, anything you already have.', placeholder: 'I need…' },
    { key: 'timeline', q: 'When do you need it?', kind: 'choice', options: ['As soon as possible', 'Within a month', 'In 2–3 months', 'Just exploring'] },
    { key: 'name', q: 'What should I call you?', kind: 'input', type: 'text', placeholder: 'Your name', autocomplete: 'name' },
    { key: 'email', q: 'Where can I reach you?', kind: 'input', type: 'email', placeholder: 'you@example.com', autocomplete: 'email' },
  ];
  const contact = { step: 0, data: {}, done: false, mailto: '' };

  function openContact(prefill) {
    if (contact.done) { contact.step = 0; contact.data = {}; contact.done = false; }
    if (prefill && typeof prefill === 'string') {
      const match = S.contactOptions.find((o) => o.toLowerCase().includes(prefill.toLowerCase().split(/[ /]/)[0]));
      if (match) contact.data.type = match;
    }
    const other = $('#ability'); if (other.open) other.close();
    renderContact();
    openDialog(contactDlg);
    focusField();
  }

  function focusField() {
    const el = $('input:checked, textarea, input[type="text"], input[type="email"], input[type="radio"]', contactBody);
    if (el) el.focus({ preventScroll: true });
  }

  function renderContact() {
    if (contact.done) {
      contactBody.innerHTML = `
        <div class="done">
          <p class="step-count">Step ${steps.length} of ${steps.length}</p>
          <div class="step-bar"><span style="width:100%"></span></div>
          <h2 id="contact-title">Almost there</h2>
          <p>Your email app should have opened with the message written out. Nothing is sent until you press send there.</p>
          <p>Didn't open? Use the button below, or email <strong>${esc(S.email)}</strong> directly.</p>
          <div class="done-actions">
            <a class="btn btn-dark" href="${esc(contact.mailto)}">Open email again <span class="arrow" aria-hidden="true">→</span></a>
            <button class="btn btn-ghost" type="button" data-copy-email>Copy email</button>
          </div>
        </div>`;
      return;
    }
    const st = steps[contact.step];
    const total = steps.length;
    const val = contact.data[st.key] || '';
    let field;
    if (st.kind === 'choice') {
      field = `<div class="choices" role="radiogroup" aria-labelledby="contact-title">${st.options.map((o) => `
        <label class="choice"><input type="radio" name="${esc(st.key)}" value="${esc(o)}"${o === val ? ' checked' : ''}><span>${esc(o)}</span></label>`).join('')}</div>`;
    } else if (st.kind === 'text') {
      field = `<textarea class="field" name="${esc(st.key)}" placeholder="${esc(st.placeholder)}" aria-labelledby="contact-title" maxlength="2000">${esc(val)}</textarea>`;
    } else {
      field = `<input class="field" name="${esc(st.key)}" type="${esc(st.type)}" value="${esc(val)}" placeholder="${esc(st.placeholder)}" autocomplete="${esc(st.autocomplete)}" aria-labelledby="contact-title" maxlength="200">`;
    }
    const last = contact.step === total - 1;
    contactBody.innerHTML = `
      <p class="step-count">Step ${contact.step + 1} of ${total}</p>
      <div class="step-bar"><span style="width:${(contact.step / total) * 100 + 100 / total}%"></span></div>
      <h2 id="contact-title">${esc(st.q)}</h2>
      ${st.help ? `<p class="step-help">${esc(st.help)}</p>` : ''}
      <form novalidate>
        ${field}
        <p class="form-err" role="alert" hidden></p>
        <div class="step-actions">
          ${contact.step > 0 ? '<button type="button" class="btn btn-ghost" data-back>Back</button>' : '<span></span>'}
          <button class="btn btn-dark" type="submit">${last ? 'Send message' : 'Next'} <span class="arrow" aria-hidden="true">→</span></button>
        </div>
      </form>
      <p class="reply-note">I reply within ${esc(S.replyWindow)}.</p>`;
  }

  function readStep() {
    const st = steps[contact.step];
    if (st.kind === 'choice') return ($(`input[name="${st.key}"]:checked`, contactBody) || {}).value || '';
    return ($(`[name="${st.key}"]`, contactBody) || {}).value?.trim() || '';
  }

  function stepError(st, v) {
    if (!v) return st.kind === 'choice' ? 'Pick one to continue.' : 'This one is needed to continue.';
    if (st.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'That email doesn’t look right.';
    return '';
  }

  contactBody.addEventListener('submit', (e) => {
    e.preventDefault();
    const st = steps[contact.step];
    const v = readStep();
    const err = stepError(st, v);
    const errEl = $('.form-err', contactBody);
    if (err) { errEl.textContent = err; errEl.hidden = false; focusField(); return; }
    contact.data[st.key] = v;
    if (contact.step < steps.length - 1) { contact.step += 1; renderContact(); focusField(); return; }
    // Final step: build a prefilled email.
    const d = contact.data;
    const subject = `${d.type} — enquiry from ${d.name}`;
    const body = `Hi ${S.firstName},\n\nI'd like to talk about: ${d.type}\n\n${d.about}\n\nTimeline: ${d.timeline}\n\nThanks,\n${d.name}\n${d.email}`;
    contact.mailto = `mailto:${S.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    contact.done = true;
    renderContact();
    window.location.href = contact.mailto;
  });
  contactBody.addEventListener('click', (e) => {
    if (e.target.closest('[data-back]')) {
      contact.data[steps[contact.step].key] = readStep();
      contact.step = Math.max(0, contact.step - 1); renderContact(); focusField();
    }
    const copy = e.target.closest('[data-copy-email]');
    if (copy) {
      const done = () => { copy.textContent = 'Copied ✓'; setTimeout(() => { copy.textContent = 'Copy email'; }, 1800); };
      if (navigator.clipboard) navigator.clipboard.writeText(S.email).then(done, () => { copy.textContent = S.email; });
      else copy.textContent = S.email;
    }
  });
  contactBody.addEventListener('change', (e) => {
    if (e.target.matches('input[type="radio"]')) { const err = $('.form-err', contactBody); if (err) err.hidden = true; }
  });

  // ---- Global click delegation --------------------------------------------
  document.addEventListener('click', (e) => {
    const door = e.target.closest('[data-door]');
    if (door && !e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); enterDoor(door); return; }
    const c = e.target.closest('[data-open-contact]');
    if (c) { e.preventDefault(); openContact(c.dataset.openContact); return; }
    const ab = e.target.closest('[data-open-ability]');
    if (ab) { openAbility(ab); return; }
    const s = e.target.closest('[data-scroll]');
    if (s) {
      const el = document.getElementById(s.dataset.scroll);
      if (el) el.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      else location.hash = '#home';
      return;
    }
    if (e.target.closest('[data-scroll-top]')) window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  });

  // ---- Loader -------------------------------------------------------------
  // Opening intro: one pill per door colour stacks up as the page really loads
  // (fonts, then images) while the counter climbs to 100; then the pills slide
  // apart and the site opens by itself. Once per browser session; it can never
  // hold anyone up for more than 9 s. Fires 'intro:ready' (the cord drops then).
  function initLoader() {
    const loader = $('#loader');
    const reveal = () => {
      document.body.classList.add('ready');
      window.dispatchEvent(new Event('intro:ready'));
    };
    if (!loader) { reveal(); return; }
    if (storage.get('sessionStorage', 'entered') === '1') { loader.remove(); reveal(); return; }

    const pills = [
      { label: S.name, bg: '#1f1c1c', ink: '#e8e4e0' },
      ...S.skills.map((s) => ({ label: s.nav || s.title, bg: s.color || '#444', ink: '#f3eeec' })),
      { label: S.introLast || 'Open to work', bg: '#c4b0b0', ink: '#1a1818' },
    ];
    loader.innerHTML = `
      <div class="ld-bg"></div>
      <div class="ld-stack" style="--n:${pills.length}">
        ${pills.map((p, k) => `<div class="ld-pill" style="--k:${k};--c:${esc(p.bg)};--ink:${p.ink};--dir:${k % 2 ? -1 : 1}"><span>${esc(p.label)}</span></div>`).join('')}
      </div>
      <div class="ld-hud">
        <div class="ld-top"><span><b>${esc(S.name)}</b> · Portfolio</span><span>${esc(S.skills.map((s) => s.nav || s.title).join(' · '))}</span></div>
        <div class="ld-bot">
          <p class="ld-num"><small>Opening up the work</small><span id="ld-count">000</span></p>
          <div class="ld-bar"><i></i></div>
        </div>
      </div>`;
    document.documentElement.classList.add('intro');
    const els = $$('.ld-pill', loader); const count = $('#ld-count');

    let opened = false;
    const openUp = () => {
      if (opened) return;
      opened = true;
      storage.set('sessionStorage', 'entered', '1');
      loader.classList.add('out');
      document.documentElement.classList.remove('intro');
      setTimeout(reveal, 260);
      setTimeout(() => { loader.remove(); $('#main').focus({ preventScroll: true }); }, 1300);
    };
    setTimeout(openUp, 9000);

    // real progress: never shows more than has actually loaded
    let loaded = 0.55;
    if (document.fonts) document.fonts.ready.then(() => { loaded = Math.max(loaded, 0.85); });
    const allLoaded = () => { loaded = 1; };
    if (document.readyState === 'complete') allLoaded(); else window.addEventListener('load', allLoaded, { once: true });
    setTimeout(allLoaded, 5000);

    const show = (p) => {
      loader.style.setProperty('--p', p.toFixed(3));
      els.forEach((el, k) => el.classList.toggle('on', p >= 1 || p >= k / els.length + 0.02));
      count.textContent = String(Math.round(p * 100)).padStart(3, '0');
    };
    if (reduceMotion.matches) { show(1); setTimeout(openUp, 450); return; }

    const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2);
    const DURATION = 1700;
    let start = 0; let shown = 0;
    const step = (now) => {
      if (!start) start = now;
      const goal = Math.min(easeInOut(Math.min(1, (now - start) / DURATION)), loaded);
      shown += (goal - shown) * 0.18;
      if (goal - shown < 0.002) shown = goal;
      show(shown);
      if (shown < 1) requestAnimationFrame(step);
      else setTimeout(openUp, 520); // let the last colour land, then open
    };
    requestAnimationFrame(step);
  }

  // ---- Boot ---------------------------------------------------------------
  renderHeader();
  renderFooter();
  window.addEventListener('hashchange', route);
  route();
  initLoader();
  tick();
  setInterval(tick, 10000);
})();
