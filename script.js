/* =========================================================
   SCRIPT.JS — page routing + live background + 100 hearts cloud
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  const UNLOCK_CODE = '0926';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const pages = Array.from(document.querySelectorAll('.page'));
  let currentIndex = 0;

  /* ---------------- LIVE BACKGROUND CANVAS ---------------- */

  const ambientBg = document.getElementById('ambientBg');
  const canvas = document.createElement('canvas');
  canvas.className = 'live-bg-canvas';
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  ambientBg.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  // Cap canvas pixel ratio — full-resolution retina canvases are one of the
  // biggest lag sources on phones, and petals look identical at 1.5x.
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  let width = window.innerWidth;
  let height = window.innerHeight;

  function sizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);

  const particles = [];
  const particleCount = reduceMotion ? 0 : 16;

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height - height;
      this.size = Math.random() * 8 + 4;
      this.speedY = Math.random() * 1.2 + 0.6;
      this.speedX = Math.random() * 0.8 - 0.4;
      this.rotation = Math.random() * 360;
      this.rotSpeed = (Math.random() - 0.5) * 1.5;
      this.opacity = Math.random() * 0.5 + 0.3;
      const colors = ['rgba(246, 198, 214, ', 'rgba(216, 138, 154, ', 'rgba(251, 233, 239, '];
      this.colorBase = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.y += this.speedY;
      this.x += Math.sin(this.y * 0.01) + this.speedX;
      this.rotation += this.rotSpeed;
      if (this.y > height + 20) { this.reset(); this.y = -20; }
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = this.colorBase + this.opacity + ')';
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  for (let i = 0; i < particleCount; i++) particles.push(new Particle());

  function animateLiveBg() {
    ctx.clearRect(0, 0, width, height);
    if (ambientBg.classList.contains('visible')) {
      particles.forEach((p) => { p.update(); p.draw(); });
    }
    requestAnimationFrame(animateLiveBg);
  }

  /* ---------------- Kraft ambient ---------------- */

  const kraftAmbient = document.getElementById('kraftAmbient');

  function initKraftAmbient() {
    if (!kraftAmbient) return;
    const count = reduceMotion ? 0 : 6;
    for (let i = 0; i < count; i++) {
      const s = document.createElement('div');
      s.className = 'sprig';
      s.style.left = (5 + Math.random() * 88) + 'vw';
      s.style.top = (10 + Math.random() * 72) + 'vh';
      s.style.animationDelay = (Math.random() * 5) + 's';
      s.style.animationDuration = (6 + Math.random() * 3) + 's';
      s.innerHTML = '<svg viewBox="0 0 40 40"><path d="M20 4 C10 12 8 24 20 36 C32 24 30 12 20 4 Z" fill="#8b3a3a" opacity="0.55"/><path d="M20 8 L20 32" stroke="#5c2626" stroke-width="1.5" opacity="0.5"/></svg>';
      kraftAmbient.appendChild(s);
    }
  }

  function initAmbient() {
    const butterflyCount = reduceMotion ? 0 : 2;
    for (let i = 0; i < butterflyCount; i++) {
      const b = document.createElement('div');
      b.className = 'butterfly';
      b.style.left = 20 + Math.random() * 60 + 'vw';
      b.style.top = 20 + Math.random() * 50 + 'vh';
      b.style.animationDuration = 5 + Math.random() * 3 + 's';
      ambientBg.appendChild(b);
    }
    if (pages[currentIndex].dataset.skin === 'bloom') ambientBg.classList.add('visible');
    animateLiveBg();
  }

  /* ---------------- Page navigation ---------------- */

  // Route by page ID, not by position — so removing a page can never
  // silently shift every later page one slot.
  function goToPage(n) {
    const next = document.getElementById('page-' + n);
    if (!next) return;
    const targetIndex = pages.indexOf(next);
    if (targetIndex === -1 || targetIndex === currentIndex) return;

    const current = pages[currentIndex];

    gsap.to(current, {
      opacity: 0, scale: 1.04,
      duration: reduceMotion ? 0.01 : 0.4,
      ease: 'power2.in',
      onComplete: () => current.classList.remove('active')
    });

    next.classList.add('active');
    gsap.fromTo(next,
      { opacity: 0, scale: 0.96 },
      { opacity: 1, scale: 1, duration: reduceMotion ? 0.01 : 0.55, ease: 'power2.out', delay: reduceMotion ? 0 : 0.25 }
    );

    animatePageIn(next);
    toggleAmbient(next);
    currentIndex = targetIndex;
  }

  function animatePageIn(pageEl) {
    const items = pageEl.querySelectorAll('.stagger-in');
    gsap.fromTo(items,
      { opacity: 0, y: 22 },
      {
        opacity: 1, y: 0,
        duration: reduceMotion ? 0.01 : 0.6,
        ease: 'back.out(1.4)',
        stagger: reduceMotion ? 0 : 0.12,
        delay: reduceMotion ? 0 : 0.3
      }
    );
  }

  function toggleAmbient(pageEl) {
    const skin = pageEl.dataset.skin;
    ambientBg.classList.toggle('visible', skin === 'bloom');
    if (kraftAmbient) kraftAmbient.classList.toggle('visible', skin === 'kraft');
  }

  /* ---------------- Page 1: unlock ---------------- */

  const digitInputs = Array.from(document.querySelectorAll('.digit-input'));
  const lockError = document.getElementById('lockError');

  digitInputs.forEach((input, i) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^0-9]/g, '').slice(0, 1);
      if (input.value && i < digitInputs.length - 1) digitInputs[i + 1].focus();
      if (digitInputs.every(d => d.value.length === 1)) checkUnlock();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && i > 0) digitInputs[i - 1].focus();
    });
  });

  function checkUnlock() {
    const entered = digitInputs.map(d => d.value).join('');
    entered === UNLOCK_CODE ? unlockSuccess() : unlockFail();
  }

  function unlockSuccess() {
    lockError.textContent = '\u00A0';
    gsap.to('.lock-shackle', { y: -14, rotate: -18, duration: 0.5, ease: 'back.out(2)', transformOrigin: '30px 34px' });
    gsap.to('.lock-body', { y: 6, duration: 0.3, delay: 0.35 });
    gsap.delayedCall(reduceMotion ? 0.1 : 0.9, () => goToPage(2));
  }

  function unlockFail() {
    const panel = document.querySelector('.unlock-panel');
    gsap.fromTo(panel, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)', clearProps: 'x' });
    lockError.textContent = "That's not quite it — try again.";
    digitInputs.forEach(d => (d.value = ''));
    digitInputs[0].focus();
  }

  /* ---------------- Page 2: the envelope ---------------- */

  const envStage = document.getElementById('envStage');
  const envHint = document.getElementById('envHint');

  function openEnvelope() {
    if (!envStage || envStage.classList.contains('opening')) return;
    envStage.classList.add('opening');
    if (envHint) envHint.textContent = 'opening…';
    gsap.delayedCall(reduceMotion ? 0.05 : 0.5, () => {
      envStage.classList.add('open');
      if (envHint) envHint.textContent = 'for you, darlinnn';
    });
    gsap.delayedCall(reduceMotion ? 0.3 : 2.1, () => goToPage(3));
  }

  if (envStage) {
    envStage.addEventListener('click', openEnvelope);
    envStage.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEnvelope(); }
    });
  }
  /* ---------------- Page 3: note ---------------- */

  document.getElementById('toHubBtn').addEventListener('click', () => goToPage(4));

  /* ---------------- Page 4: gift hub ---------------- */

  document.querySelectorAll('.gift-box').forEach(box => {
    box.addEventListener('click', () => openGift(box.dataset.box));
  });

  document.querySelectorAll('.continue-btn').forEach(btn => btn.addEventListener('click', () => goToPage(6)));

  document.addEventListener('click', (e) => {
    if (e.target.closest('.back-btn')) {
      e.preventDefault();
      closeGift();
    }
  });

  function openGift(n) {
    const hub = document.getElementById('hubView');
    const detail = document.getElementById('giftDetail' + n);

    gsap.to(hub, { opacity: 0, scale: 0.96, duration: 0.3, onComplete: () => { hub.style.display = 'none'; } });

    detail.hidden = false;
    gsap.fromTo(detail,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.5, delay: 0.25, ease: 'back.out(1.3)' }
    );

    playGiftAnimation(n);
    document.querySelector(`.gift-box[data-box="${n}"]`).classList.add('opened');
  }

  function closeGift() {
    closeChitModal();
    closeLightbox();
    gsap.killTweensOf('#hubView, .gift-detail');
    document.querySelectorAll('.gift-detail').forEach(d => { d.hidden = true; gsap.set(d, { clearProps: 'all' }); });

    const hub = document.getElementById('hubView');
    hub.style.display = 'flex';
    gsap.fromTo(hub, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.3, clearProps: 'all' });
  }

  function playGiftAnimation(n) {
    if (n === '2') {
      gsap.fromTo('#giftDetail2 .star',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, stagger: 0.15, delay: 0.3, ease: 'back.out(2)' }
      );
      gsap.to('#giftDetail2 .star', { y: '-=8', duration: 1.6, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: 0.25, delay: 1 });
    } else if (n === '3') {
      gsap.fromTo('#giftDetail3 .gift3-collage-wrap',
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, delay: 0.2, ease: 'back.out(1.4)' }
      );
    }
  }

  /* ---------------- Gift 2: Jar Wish Chit Modal ---------------- */

  const jarTrigger = document.getElementById('jarTrigger');
  const chitModal = document.getElementById('chitModal');
  const closeChitBtn = document.getElementById('closeChitBtn');

  if (jarTrigger) jarTrigger.addEventListener('click', openChitModal);
  if (closeChitBtn) closeChitBtn.addEventListener('click', closeChitModal);

  function openChitModal() {
    gsap.fromTo('#jarTrigger svg', { rotate: -6 }, { rotate: 0, duration: 0.4, ease: 'elastic.out(1.2, 0.4)' });
    chitModal.hidden = false;
    gsap.fromTo('.chit-card-wrap', { scale: 0.6, opacity: 0, y: 30 }, { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.5)' });
    gsap.fromTo('.chit-item', { opacity: 0, y: 18, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.08, delay: 0.15, ease: 'power2.out' });
  }

  function closeChitModal() {
    if (!chitModal || chitModal.hidden) return;
    gsap.to('.chit-card-wrap', { scale: 0.8, opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: () => { chitModal.hidden = true; } });
  }

  /* ---------------- Photo Lightbox ---------------- */

  const lightbox = document.getElementById('imageLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeLightboxBtn = document.getElementById('closeLightboxBtn');

  document.querySelectorAll('.clickable-img').forEach(wrap => {
    wrap.addEventListener('click', () => {
      const img = wrap.querySelector('img');
      if (img && img.src && !img.src.includes('YOUR_IMGUR_LINK_HERE') && !img.classList.contains('img-missing')) {
        lightboxImg.src = img.src;
        lightbox.hidden = false;
        gsap.fromTo('.lightbox-content', { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.4)' });
      }
    });
  });

  if (closeLightboxBtn) closeLightboxBtn.addEventListener('click', closeLightbox);
  if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    gsap.to('.lightbox-content', { scale: 0.8, opacity: 0, duration: 0.2, ease: 'power2.in', onComplete: () => { lightbox.hidden = true; } });
  }

  /* ---------------- Page 5 (Orbit of Memories) — REMOVED ----------------
     The gift hub Continue buttons now jump straight to page 6 (first polaroid).
     The orbit page's five photos still live in the Page 23 collage. */

  /* ---------------- Page 7: flip polaroid & routing ---------------- */

  document.getElementById('polaroid2')?.addEventListener('click', function () {
    this.classList.toggle('flipped');
  });

  document.getElementById('toPage7Btn')?.addEventListener('click', () => goToPage(7));
  document.getElementById('toPage8Btn')?.addEventListener('click', () => goToPage(8));
  document.getElementById('toPage9Btn')?.addEventListener('click', () => goToPage(9));
  document.getElementById('toPage10Btn')?.addEventListener('click', () => goToPage(10));

  /* =========================================================
     PAGE 9 — 100 FLOATING HEARTS CLOUD (Smartwatch Launcher Physics)
     ========================================================= */

  const loveReasons100 = [
    "Your laugh instantly turns my worst day around.",
    "The cute way you get excited over tiny things.",
    "The pure excitement I get every time your name pops up on my notifications.",
    "Your incredible kindness towards everyone around you.",
    "The way your eyes sparkle through the screen when you talk about your passions.",
    "How you listen to me with so much care and attention, even miles away.",
    "you taking care of me by late-night talk that fr make the distance completely disappear.",
    "That beautiful eyes like a pecefic ocean.",
    "How you make even simple moment so special.",
    "Your beautiful smile that lights up my entire screen.",
    "How you always know how to make me laugh no matter how far apart we are.",
    "Your calm, tender voice when you speak softly on the phone.",
    "How you celebrate my wins as if they were your own.",
    "The thoughtful little texts you send out of nowhere to check on me.",
    "How you make our virtual world feel so safe, comforting, and real.",
    "Your unique sense of humor.",
    "How adorable you look.",
    "Your unwavering support for all my dreams.",
    "The way you listen to me what me saying.",
    "How you make me feel at home no matter the distance between us.",
    "Your beautiful heart and pure love for me.",
    "How cute you are when you try to be baddie.",
    "The sweet pet names you give me.",
    "How effortlessly gorgeous you look every single day.",
    "my silly inside jokes that make zero sense to anyone but you laugh.",
    "How you always stand up for me.",
    "Remembering 'Maggie night' and how hard we laughed until we felt we truly belonged together.",
    "How you make every song sound like a love letter dedicated to us.",
    "How we always make time for each other no matter how busy life gets.",
    "How you remember the smallest details about us.",
    "Your creative mind and unique perspective on everything 'my artist'.",
    "How you inspire me to be a better person every day.",
    "The adorable way you blush through the phone when I compliment you. me can fr imagine you blushing",
    "How comfy and natural everything feels, even over a screen.",
    "Your presences.",
    "How fiercely protective and caring you are about my feelings.",
    "The sweet, affectionate way you say my name hehhe.",
    "How you bring out my softest, most vulnerable side.",
    "How we can cry for each other and hold space when things get hard still you care about me aditi.",
    "How easy it is to talk to you for hours and hours late into the night.",
    "Your iconic and unique text style that always makes me smile.",
    "How you bring peace to my exhausting days with just a text.",
    "Your sparkling, infectious enthusiasm.",
    "How you always notice right away when something is bothering me.",
    "How close and intimate we feel with each other, even from miles away.",
    "The playful, passionate energy we share that keeps our love so strong and it will always.",
    "Your honest heart and total sincerity with me.",
    "How you make me feel so deeply appreciated and cherished.",
    "The way your smile reaches all the way to your eyes.",
    "How every virtual date and late-night talk feels so special.",
    "Your energy.",
    "How you treat my heart like something priceless.",
    "The warmth in your eyes when me look at your pic.",
    "How you motivate me whenever I feel stuck or overwhelmed.",
    "Your adorable, cute voice.",
    "How you make me feel like the luckiest person alive.",
    "Your gentle patience with me when I miss you.",
    "The way you fall asleep while talking to me.",
    "How effortlessly smart and witty you are.",
    "Our unforgettable late night conversations that go until sunrise.",
    "Your happiness and you when we about to talk on call.",
    "How you make the hardest, lonely days so much easier to bear.",
    "How I can hear your soft giggles in my mind all day.",
    "the way you learn and improve.",
    "How you love me with your entire soul.",
    "Your your boobies.",
    "How we can sit on call in total silence without any awkwardness.",
    "Your unconditional acceptance of all my flaws.",
    "How you ground me whenever my thoughts spiral.",
    "The exact tone of your pretty voice that instantly calms me down.",
    "How you make every single holiday feel special.",
    "Your courage and resilience in tough times.",
    "Dreaming about the day I can finally wrap my arms around you.",
    "How you turn simple moments into unforgettable memories.",
    "Your caring side how you make me feel loved even if you hurt.",
    "How you check up on me throughout the day no matter what you're doing.",
    "Your soft giggle that stays stuck in my head long after we hang up.",
    "How you make me feel completely understood like no one else ever has.",
    "the way you always keep making me feel how the real love is.",
    "Counting down the moments until I can hold your hands in mine fr.",
    "Your kind spirit who always ready to love your sai to take csre of him.",
    "How you make me look forward to every single tomorrow with you.",
    "Your sweet notes, long affectionate messages.",
    "How you make my heart skip a beat every single time you call 'Saiiiiii'.",
    "Your soothing presence when anxiety strikes.",
    "How you make a fucked up day so good sirf ek msg se.",
    "Your gentle, kind soul.",
    "How we promise to marry eachother and take care of each other no matter the distance.",
    "Your beautiful determination to achieve all your goals specially about studies.",
    "How effortlessly changi chings chinese fine shyt and confident you are.",
    "Your cute little reactions when I surprise you on text.",
    "How you make me feel valued beyond words.",
    "Your deep emotional maturity and how well we communicate.",
    "Knowing that one day our distance will finally be zero.",
    "Your loyalty, trust, and unwavering devotion to us.",
    "The way you look at me like I'm your entire world.",
    "Planning our future together, from buying you 500 cakes to going 'br'.",
    "Your infinite picsssss wkdhsueh for your sai.",
    "How you love me for exactly who I am.",
    "Simply because you are YOU Addy— my favorite person in the entire universe."
];


  const loveCloudViewport = document.getElementById('loveCloudViewport');
  const loveCloudCanvas = document.getElementById('loveCloudCanvas');
  const loveReasonModal = document.getElementById('loveReasonModal');
  const unlockedCountEl = document.getElementById('unlockedCount');
  const unlockedSet = new Set();

  let cloudX = 0, cloudY = 0;
  let targetCloudX = 0, targetCloudY = 0;
  let isCloudDragging = false;
  let startX = 0, startY = 0;
  let initialCloudX = 0, initialCloudY = 0;

  function init100HeartsCloud() {
    if (!loveCloudCanvas) return;
    loveCloudCanvas.innerHTML = '';

    const total = 100;
    const cols = 10;
    const spacingX = 85;
    const spacingY = 85;

    for (let i = 0; i < total; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;

      // Staggered honeycomb grid layout with gentle offset
      const offsetX = (row % 2 === 1) ? spacingX * 0.5 : 0;
      const x = col * spacingX + offsetX + (Math.random() * 12 - 6);
      const y = row * spacingY + (Math.random() * 12 - 6);

      const bubble = document.createElement('div');
      bubble.className = 'cloud-heart-bubble';
      bubble.dataset.reasonIndex = i;

      // One of 8 shared float animations — batching identical animations lets
      // the browser group them instead of juggling 100 unique ones.
      bubble.style.left = `${x + 60}px`;
      bubble.style.top = `${y + 60}px`;
      bubble.classList.add('f' + (i % 8));

      bubble.innerHTML = `
        <div class="glass-heart-inner">
          <svg class="cloud-heart-svg" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span class="bubble-num">${i + 1}</span>
        </div>
      `;

      bubble.addEventListener('click', (e) => {
        if (!isCloudDragging) {
          openReasonModal(i, bubble);
        }
      });

      loveCloudCanvas.appendChild(bubble);
    }

    // Center viewport initial transform
    centerCloudViewport();
  }

  function centerCloudViewport() {
    if (!loveCloudViewport || !loveCloudCanvas) return;
    const vWidth = loveCloudViewport.clientWidth || 340;
    const vHeight = loveCloudViewport.clientHeight || 420;
    
    targetCloudX = -(900 - vWidth) / 2;
    targetCloudY = -(900 - vHeight) / 2;
    cloudX = targetCloudX;
    cloudY = targetCloudY;
    // NOTE: do NOT call updateCloudPosition() here — the loop started below
    // already runs it. Calling it here too started a SECOND rAF loop, doubling
    // the transform work every single frame (a big source of the lag).
  }

  /* Drag & Pan Physics for Bubble Cloud */
  if (loveCloudViewport) {
    loveCloudViewport.addEventListener('pointerdown', (e) => {
      isCloudDragging = false;
      startX = e.clientX;
      startY = e.clientY;
      initialCloudX = targetCloudX;
      initialCloudY = targetCloudY;

      loveCloudViewport.classList.add('grabbing');
      loveCloudViewport.setPointerCapture(e.pointerId);
    });

    loveCloudViewport.addEventListener('pointermove', (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        if (!isCloudDragging) loveCloudCanvas?.classList.add('is-dragging');
        isCloudDragging = true;
      }

      if (loveCloudViewport.hasPointerCapture(e.pointerId)) {
        targetCloudX = initialCloudX + dx;
        targetCloudY = initialCloudY + dy;

        // Elastic constraints
        const minX = -(950 - loveCloudViewport.clientWidth);
        const minY = -(950 - loveCloudViewport.clientHeight);

        targetCloudX = Math.max(minX, Math.min(80, targetCloudX));
        targetCloudY = Math.max(minY, Math.min(80, targetCloudY));
      }
    });

    const releaseDrag = (e) => {
      loveCloudViewport.classList.remove('grabbing');
      loveCloudCanvas?.classList.remove('is-dragging');
      if (e && loveCloudViewport.hasPointerCapture(e.pointerId)) {
        loveCloudViewport.releasePointerCapture(e.pointerId);
      }
      setTimeout(() => { isCloudDragging = false; }, 50);
    };

    loveCloudViewport.addEventListener('pointerup', releaseDrag);
    loveCloudViewport.addEventListener('pointercancel', releaseDrag);
  }

  const loveCloudPage = document.getElementById('page-9');
  function updateCloudPosition() {
    // Skip all work while the 100-hearts page is not on screen — no point
    // burning frames on a page nobody is looking at.
    if (!loveCloudPage || loveCloudPage.classList.contains('active')) {
      // Smooth interpolation damping
      cloudX += (targetCloudX - cloudX) * 0.15;
      cloudY += (targetCloudY - cloudY) * 0.15;

      if (loveCloudCanvas) {
        loveCloudCanvas.style.transform = `translate3d(${cloudX}px, ${cloudY}px, 0px)`;
      }
    }
    requestAnimationFrame(updateCloudPosition);
  }

  updateCloudPosition();

  function openReasonModal(index, bubbleEl) {
    const reasonText = loveReasons100[index] || `Reason #${index + 1} — I love you endlessly.`;
    
    document.getElementById('loveReasonNumber').textContent = `Reason #${index + 1}`;
    document.getElementById('loveReasonTitle').textContent = `Why You Are Special to me addy`;
    document.getElementById('loveReasonText').textContent = reasonText;

    bubbleEl.classList.add('opened');
    unlockedSet.add(index);
    if (unlockedCountEl) unlockedCountEl.textContent = unlockedSet.size;

    gsap.fromTo(bubbleEl, { scale: 0.7 }, { scale: 1.15, duration: 0.3, yoyo: true, repeat: 1, ease: 'back.out(2)' });

    loveReasonModal.hidden = false;
    gsap.fromTo('#loveReasonModal .love-reason-card',
      { scale: 0.5, opacity: 0, y: 30 },
      { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.5)' }
    );
  }

  function closeReasonModal() {
    if (!loveReasonModal || loveReasonModal.hidden) return;
    gsap.to('#loveReasonModal .love-reason-card', {
      scale: 0.8, opacity: 0, duration: 0.25, ease: 'power2.in',
      onComplete: () => { loveReasonModal.hidden = true; }
    });
  }

  document.getElementById('closeLoveReasonBtn')?.addEventListener('click', closeReasonModal);
  if (loveReasonModal) {
    loveReasonModal.addEventListener('click', (e) => {
      if (e.target === loveReasonModal) closeReasonModal();
    });
  }

  // Initialize 100 Hearts Grid
  init100HeartsCloud();

  /* ---------------- Chapter 3 ---------------- */

  // Page 10: Coupon Book
  document.querySelectorAll('.coupon').forEach(c => {
    c.addEventListener('click', () => {
      c.classList.toggle('redeemed');
      gsap.fromTo(c, { scale: 0.97 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
    });
  });
  document.getElementById('toPage11Btn')?.addEventListener('click', () => goToPage(11));

  // Page 11: Blow out the candle
  const candleBtn = document.getElementById('candleBtn');
  candleBtn?.addEventListener('click', () => {
    if (candleBtn.classList.contains('blown')) return;
    candleBtn.classList.add('blown');
    gsap.fromTo(candleBtn, { scale: 1 }, { scale: 1.06, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.out' });
  });
  document.getElementById('toPage12Btn')?.addEventListener('click', () => goToPage(12));

  // Page 12: This or That
  document.querySelectorAll('.tt-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const pair = opt.dataset.pair;
      document.querySelectorAll(`.tt-option[data-pair="${pair}"]`).forEach(o => o.classList.remove('picked'));
      opt.classList.add('picked');
      gsap.fromTo(opt, { scale: 0.94 }, { scale: 1.04, duration: 0.3, ease: 'back.out(2.2)' });
    });
  });
  document.getElementById('toPage13Btn')?.addEventListener('click', () => goToPage(13));

  // Page 13: Guess the Memory — caption stays locked until the picture is clear
  let guessTaps = 0;
  const guessMaxTaps = 4;
  const guessPhoto = document.getElementById('guessPhoto');
  const guessTapsLeft = document.getElementById('guessTapsLeft');
  const guessCaption = document.getElementById('guessCaption');
  const guessLocked = document.getElementById('guessLocked');
  const guessPhotoWrap = document.getElementById('guessPhotoWrap');

  if (guessCaption) guessCaption.hidden = true;

  guessPhotoWrap?.addEventListener('click', () => {
    if (guessTaps >= guessMaxTaps) return;
    guessTaps++;

    if (guessPhoto) {
      const blurAmount = Math.max(0, 18 - guessTaps * (18 / guessMaxTaps));
      guessPhoto.style.filter = 'blur(' + blurAmount + 'px) saturate(' + (0.7 + guessTaps * 0.075) + ')';
      gsap.fromTo(guessPhoto, { scale: 1.02 }, { scale: 1, duration: 0.35, ease: 'power2.out' });
    }
    if (guessTapsLeft) {
      guessTapsLeft.textContent = guessTaps >= guessMaxTaps ? 'fully in focus ✨' : (guessMaxTaps - guessTaps) + ' taps left';
    }
    if (guessLocked && guessTaps === guessMaxTaps - 1) guessLocked.textContent = 'one more tap… it is almost clear';

    if (guessTaps >= guessMaxTaps) {
      if (guessLocked) guessLocked.hidden = true;
      if (guessCaption) {
        guessCaption.hidden = false;
        guessCaption.classList.add('revealed');
        gsap.fromTo(guessCaption,
          { opacity: 0, y: 16, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: reduceMotion ? 0.01 : 0.7, ease: 'back.out(1.4)' }
        );
      }
      gsap.fromTo(guessPhotoWrap, { scale: 1 }, { scale: 1.03, duration: 0.4, yoyo: true, repeat: 1, ease: 'power2.inOut' });
      spawnHeartRain(6, guessPhotoWrap);
    }
  });

  document.getElementById('toPage14Btn')?.addEventListener('click', () => goToPage(14));
  // Page 14: Secret Note Box (double unlock)
  const secretOuter = document.getElementById('secretOuter');
  const secretInner = document.getElementById('secretInner');
  const secretLetter = document.getElementById('secretLetter');
  const holdRingProgress = document.getElementById('holdRingProgress');
  const RING_CIRCUMFERENCE = 213.6;
  let holdInterval = null, holdProgress = 0;

  secretOuter?.addEventListener('click', () => {
    gsap.to(secretOuter, {
      opacity: 0, scale: 0.9, duration: 0.35, onComplete: () => {
        secretOuter.hidden = true;
        secretInner.hidden = false;
        gsap.fromTo(secretInner, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.4)' });
      }
    });
  });

  function startHold() {
    if (secretInner.hidden) return;
    clearInterval(holdInterval);
    holdInterval = setInterval(() => {
      holdProgress += 4;
      if (holdRingProgress) holdRingProgress.style.strokeDashoffset = RING_CIRCUMFERENCE - (RING_CIRCUMFERENCE * holdProgress) / 100;
      if (holdProgress >= 100) {
        clearInterval(holdInterval);
        unlockSecretLetter();
      }
    }, 40);
  }
  function cancelHold() {
    clearInterval(holdInterval);
    if (holdProgress < 100) {
      holdProgress = 0;
      if (holdRingProgress) holdRingProgress.style.strokeDashoffset = RING_CIRCUMFERENCE;
    }
  }
  function unlockSecretLetter() {
    gsap.to(secretInner, {
      opacity: 0, scale: 0.9, duration: 0.35, onComplete: () => {
        secretInner.hidden = true;
        secretLetter.hidden = false;
        gsap.fromTo(secretLetter, { opacity: 0, y: 20, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.3)' });
      }
    });
  }
  const holdLock = document.getElementById('holdLock');
  ['pointerdown'].forEach(evt => holdLock?.addEventListener(evt, startHold));
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(evt => holdLock?.addEventListener(evt, cancelHold));

  document.getElementById('toPage15Btn')?.addEventListener('click', () => goToPage(15));

  // Page 15: Favorite Person flip grid
  document.querySelectorAll('.reason-card').forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('flipped'));
  });
  document.getElementById('toPage16Btn')?.addEventListener('click', () => goToPage(16));

  // (Our Song, Our Words page removed)
  document.getElementById('toPage17Btn')?.addEventListener('click', () => goToPage(17));

  /* ---------------- Chapter 4 ---------------- */

  document.getElementById('toPage18Btn')?.addEventListener('click', () => goToPage(18));
  document.getElementById('toPage19Btn')?.addEventListener('click', () => goToPage(19));
  document.getElementById('toPage20Btn')?.addEventListener('click', () => goToPage(20));

  // Page 19: Long-distance countdown — set your real reunion date here
  const NEXT_VISIT_DATE = '2035-12-25T00:00:00';
  function updateCountdown() {
    const target = new Date(NEXT_VISIT_DATE).getTime();
    const now = Date.now();
    let diff = Math.max(0, target - now);
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = String(v).padStart(2, '0'); };
    set('cdDays', d); set('cdHours', h); set('cdMins', m); set('cdSecs', s);
  }
  if (document.getElementById('cdDays')) {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // Page 18: The Mystery Box — tap, get a riddle, reveal the answer, repeat
  const mysteryBox = document.getElementById('mysteryBox');
  const mysteryGlass = document.getElementById('mysteryGlass');
  const mysteryRiddle = document.getElementById('mysteryRiddle');
  const mysteryRevealBtn = document.getElementById('mysteryRevealBtn');
  const mysteryAnswer = document.getElementById('mysteryAnswer');
  const mysteryPrompt = document.getElementById('mysteryPrompt');

  const mysteryPuzzles = [
    {
      riddle: 'kaunsi cheez hai jo roz badalti nahi, par har din thoda zyada ho jaati hai?',
      answer: 'mera pyaar tumse, aditi. roz thoda zyada, kabhi kam nahi — ye hi meri lil mystery thi hehe.'
    },
    {
      riddle: 'us raat ka naam batao jab do log sirf maggie aur hasi pe jee rahe the?',
      answer: 'maggie night, ofcccc. us raat hi lag gaya tha ki hum ek hi kahani hain.'
    },
    {
      riddle: 'ek wish jo maine hazaar baar maangi hai. batao kya?',
      answer: 'tum. bas tum. aur ek din bilkul tumhare paas hona, forever.'
    },
    {
      riddle: 'ek promise jo kabhi cancel nahi hota. kya?',
      answer: '500 cakes. mention karna toh bhool hi gaya tha 😌'
    }
  ];

  let mysteryIndex = -1;

  function showMystery(i) {
    const puzzle = mysteryPuzzles[((i % mysteryPuzzles.length) + mysteryPuzzles.length) % mysteryPuzzles.length];
    mysteryIndex = ((i % mysteryPuzzles.length) + mysteryPuzzles.length) % mysteryPuzzles.length;

    if (mysteryRiddle) mysteryRiddle.textContent = puzzle.riddle;
    if (mysteryAnswer) {
      mysteryAnswer.textContent = puzzle.answer;
      mysteryAnswer.hidden = true;
      mysteryAnswer.classList.add('placeholder-text');
    }
    if (mysteryRevealBtn) {
      mysteryRevealBtn.disabled = false;
      mysteryRevealBtn.textContent = 'Reveal it';
    }

    if (mysteryGlass && mysteryGlass.hidden) {
      mysteryGlass.hidden = false;
      requestAnimationFrame(() => mysteryGlass.classList.add('show'));
      gsap.fromTo(mysteryGlass,
        { opacity: 0, y: 18, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: reduceMotion ? 0.01 : 0.5, ease: 'back.out(1.4)' }
      );
    } else if (mysteryRiddle) {
      gsap.fromTo(mysteryRiddle, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: reduceMotion ? 0.01 : 0.4, ease: 'back.out(1.5)' });
    }
    if (mysteryPrompt) mysteryPrompt.textContent = 'hmm… answer soch liya? 👀';
  }

  mysteryBox?.addEventListener('click', function () {
    const isFirstOpen = !this.classList.contains('opened');
    this.classList.add('opened');
    gsap.fromTo(this, { scale: 1 }, { scale: 1.09, duration: 0.28, yoyo: true, repeat: 1, ease: 'back.out(2)' });
    spawnHeartRain(10, this);
    showMystery(isFirstOpen ? 0 : mysteryIndex + 1);
  });

  mysteryRevealBtn?.addEventListener('click', () => {
    if (!mysteryAnswer || !mysteryAnswer.hidden) return;
    mysteryAnswer.hidden = false;
    mysteryAnswer.classList.remove('placeholder-text');
    gsap.fromTo(mysteryAnswer,
      { opacity: 0, y: 12, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: reduceMotion ? 0.01 : 0.55, ease: 'back.out(1.4)' }
    );
    mysteryRevealBtn.disabled = true;
    mysteryRevealBtn.textContent = 'revealed ✓';
    if (mysteryPrompt) mysteryPrompt.textContent = 'tap the box again for one more →';
    spawnHeartRain(18, mysteryBox);
  });
  // (Would You Rather page removed)

  // Page 22: Future Wishlist
  document.querySelectorAll('.wish-item').forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('checked');
      gsap.fromTo(item, { scale: 0.98 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
    });
  });

  /* ---------------- Interactive polish: tap ripple on every primary/ghost button ---------------- */

  document.querySelectorAll('.btn-primary, .btn-ghost').forEach(btn => {
    btn.addEventListener('pointerdown', (e) => {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height) * 1.3;
      ripple.className = 'btn-ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  /* ---------------- Chapter 5 ---------------- */

  // Page 20: Map of Us
  const mapCaptions = { 1: 'all started from here', 2: 'Where we are right now with beautiful love life.', 3: "Where we're headed together, we will easyily reach there." };
  document.querySelectorAll('.map-pin').forEach(pin => {
    pin.addEventListener('click', () => {
      document.querySelectorAll('.map-pin').forEach(p => p.classList.remove('active'));
      pin.classList.add('active');
      gsap.fromTo(pin, { scale: 1 }, { scale: 1.3, duration: 0.2, yoyo: true, repeat: 1, ease: 'back.out(2)' });
      const cap = document.getElementById('mapCaption');
      if (cap) {
        gsap.to(cap, {
          opacity: 0, duration: 0.15, onComplete: () => {
            cap.textContent = mapCaptions[pin.dataset.pin] || '';
            cap.classList.remove('placeholder-text');
            gsap.to(cap, { opacity: 1, duration: 0.3 });
          }
        });
      }
    });
  });
  document.getElementById('toPage21Btn')?.addEventListener('click', () => goToPage(21));

  // Page 21: The Grand Gift Box
  document.getElementById('grandBox')?.addEventListener('click', function () {
    if (this.classList.contains('opened')) return;
    this.classList.add('opened');
    gsap.fromTo(this, { scale: 1 }, { scale: 1.05, duration: 0.3, yoyo: true, repeat: 1, ease: 'back.out(2)' });
    const reveal = document.getElementById('grandReveal');
    if (reveal) {
      gsap.delayedCall(0.5, () => {
        reveal.hidden = false;
        gsap.fromTo(reveal, { opacity: 0, y: 20, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.3)' });
      });
    }
  });
  document.getElementById('toPage22Btn')?.addEventListener('click', () => goToPage(22));

  // Page 22: If I Could Give You the World (tap-to-reveal, then becomes Continue)
  let worldLineIndex = 1;
  document.getElementById('worldNextBtn')?.addEventListener('click', function () {
    const next = document.querySelector(`.world-line[data-line="${worldLineIndex + 1}"]`);
    if (next) {
      worldLineIndex++;
      next.hidden = false;
      next.classList.remove('placeholder-text');
      gsap.fromTo(next, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.4)' });
      if (!document.querySelector(`.world-line[data-line="${worldLineIndex + 1}"]`)) {
        this.textContent = 'Continue →';
        this.classList.remove('btn-ghost');
        this.classList.add('btn-primary');
      }
    } else {
      goToPage(23);
    }
  });

  // Page 23: Photo Collage (lightbox already wired globally via .clickable-img)
  document.getElementById('toPage24Btn')?.addEventListener('click', () => goToPage(24));

  // Page 24: Just Because
  const jbCompliments = [
    "You make ordinary days feel like a big deal.",
    "Your laugh is doing something to my heart right now, I know it.",
    "I like you more today than yesterday, and that's saying something.",
    "You're the best part of my group chats, and I'm not exaggerating.",
    "Somehow you make distance feel smaller.",
    "You're annoyingly easy to fall for.",
    "I'd choose all of it — the calls, the waiting, all of it — again.",
    "You're my favorite notification.",
    "I like the way you exist, honestly.",
    "This is just me thinking about you. That's it. That's the message."
  ];
  let jbLastIndex = -1;
  document.getElementById('jbShuffleBtn')?.addEventListener('click', () => {
    let idx;
    do { idx = Math.floor(Math.random() * jbCompliments.length); } while (idx === jbLastIndex && jbCompliments.length > 1);
    jbLastIndex = idx;
    const el = document.getElementById('jbText');
    if (el) {
      gsap.to(el, {
        opacity: 0, y: -8, duration: 0.2, onComplete: () => {
          el.textContent = jbCompliments[idx];
          gsap.fromTo(el, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.4)' });
        }
      });
    }
  });
  document.getElementById('toPage25Btn')?.addEventListener('click', () => goToPage(25));

  /* ---------------- Chapter 6 — Finale ---------------- */

  // Reusable confetti burst — used on Page 25 (tap) and Page 27 (auto)
  function spawnConfettiBurst(containerId, count) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const colors = ['#f3b6c9', '#eb9fb0', '#f6da8e', '#d88a9a', '#fbdfe4'];
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      const size = 7 + Math.random() * 9;
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.borderRadius = Math.random() > 0.5 ? '50%' : '3px';
      container.appendChild(el);

      const angle = -Math.PI / 2 + (Math.random() * Math.PI - Math.PI / 2);
      const distance = 120 + Math.random() * 220;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      gsap.fromTo(el,
        { opacity: 1, scale: 0, x: 0, y: 0, rotate: 0 },
        {
          opacity: 0, scale: 1, x: dx, y: dy, rotate: Math.random() * 720 - 360,
          duration: reduceMotion ? 0.01 : 1.4 + Math.random() * 0.8,
          ease: 'power2.out',
          onComplete: () => el.remove()
        }
      );
    }
  }

  // Page 25: Let's Celebrate You — blow the candles, cake + balloons + confetti
  const celebrateBtn = document.getElementById('celebrateBtn');
  const celebrateLine = document.getElementById('celebrateLine');

  let celebrateTaps = 0;
  celebrateBtn?.addEventListener('click', () => {
    celebrateTaps++;
    const nowBlown = celebrateBtn.classList.toggle('blown');

    if (nowBlown) {
      spawnConfettiBurst('celebrationBurstLayer', reduceMotion ? 0 : 46);
      spawnHeartRain(16, celebrateBtn);
      if (celebrateLine) celebrateLine.textContent = 'happy birthday, merii jaan 🎉';
    } else {
      spawnConfettiBurst('celebrationBurstLayer', reduceMotion ? 0 : 22);
      if (celebrateLine) celebrateLine.textContent = 'wish again, my love 🤍';
    }
    if (celebrateTaps === 3 && celebrateLine) celebrateLine.textContent = 'dil se, sabse pyaari ladki ko 💗';

    if (celebrateLine) {
      gsap.fromTo(celebrateLine, { scale: 0.9, opacity: 0.35 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2)' });
    }
    gsap.fromTo(celebrateBtn, { scale: 0.985 }, { scale: 1, duration: 0.5, ease: 'back.out(2)' });
  });

  document.getElementById('toPage26Btn')?.addEventListener('click', () => goToPage(26));
  // Page 26: Love Notes Jar
  const loveNotes = [
    "However far apart, you're still my favorite person to text first.",
    "Happy birthday to the person who makes long distance feel worth it.",
    "I hope today feels exactly as good as you deserve.",
    "Every day I get to know that peace when im with you.",
    "me will love you moree than you expect.",
    "Here's to more calls, more plans, and more us.",
    "waiting for is worth it.",
    "Today's about you. All of it.",
    "I don't say it enough, but I'm really glad you exist.",
    "Happy birthday. I'm so lucky that we met."
  ];
  let lastNoteIndex = -1;
  document.getElementById('notesJar')?.addEventListener('click', function () {
    let idx;
    do { idx = Math.floor(Math.random() * loveNotes.length); } while (idx === lastNoteIndex && loveNotes.length > 1);
    lastNoteIndex = idx;

    gsap.fromTo(this, { rotate: -4 }, { rotate: 4, duration: 0.12, yoyo: true, repeat: 3, ease: 'power1.inOut', clearProps: 'rotate' });

    const note = document.getElementById('pulledNote');
    const text = document.getElementById('pulledNoteText');
    if (note && text) {
      note.hidden = false;
      text.textContent = loveNotes[idx];
      gsap.fromTo(note,
        { opacity: 0, y: 24, scale: 0.9, rotate: -3 },
        { opacity: 1, y: 0, scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(1.5)' }
      );
    }
  });
  document.getElementById('toPage27Btn')?.addEventListener('click', () => {
    goToPage(27);
    gsap.delayedCall(reduceMotion ? 0.05 : 0.5, playFinaleReveal);
  });

  // Page 27: Happy Birthday Finale — cinematic reveal, replays every visit
  function playFinaleReveal() {
    const page = document.getElementById('page-27');
    if (!page) return;
    const spans = page.querySelectorAll('#finaleHeading span');
    const flourish = page.querySelector('.finale-flourish');
    const tag = page.querySelector('.finale-tag');
    const name = page.querySelector('.finale-name');

    // Kill any previous run and reset to a clean base state, so a revisit (or a
    // double-trigger) can never stack tweens and glue the letters on top of each
    // other. LetterSpacing animation removed — it re-layouts the whole line every
    // frame and was a major cause of the finale stutter.
    gsap.killTweensOf([spans, tag, name, flourish, '#finaleHeading']);
    gsap.set([tag, name], { clearProps: 'all' });
    gsap.set(spans, { clearProps: 'all' });

    const tl = gsap.timeline({ defaults: { ease: 'back.out(1.9)' } });
    if (tag) tl.fromTo(tag, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: reduceMotion ? 0.01 : 0.5 });
    tl.fromTo(spans,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: reduceMotion ? 0.01 : 0.5, stagger: reduceMotion ? 0 : 0.055 },
      reduceMotion ? 0 : 0.12
    );
    if (flourish) tl.fromTo(flourish, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.7, ease: 'power3.out' }, '-=0.2');
    if (name) tl.fromTo(name, { opacity: 0, y: 20, scale: 0.85 }, { opacity: 1, y: 0, scale: 1, duration: 0.75 }, '-=0.45');

    gsap.delayedCall(reduceMotion ? 0 : 0.3, () => {
      spawnConfettiBurst('finaleBurst', reduceMotion ? 0 : 58);
      spawnHeartRain(20, null);
    });
    gsap.delayedCall(reduceMotion ? 0 : 1.05, () => {
      spawnConfettiBurst('finaleBurst', reduceMotion ? 0 : 36);
      gsap.fromTo('#finaleHeading', { scale: 1 }, { scale: 1.035, duration: 0.45, yoyo: true, repeat: 1, ease: 'power2.inOut' });
    });
  }

  document.getElementById('toPage28Btn')?.addEventListener('click', () => goToPage(28));
  // Page 28: Replay
  document.getElementById('replayBtn')?.addEventListener('click', () => goToPage(1));

  /* ---------------- Background music + song switcher ---------------- */

  const bgm = document.getElementById('bgmAudio');
  const bgmToggle = document.getElementById('bgmToggle');
  const nowPlayingTitle = document.getElementById('nowPlayingTitle');
  const trackList = document.getElementById('trackList');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const trackHint = document.getElementById('trackHint');

  // add / rename / reorder songs right here — the box on page 8 builds itself
  const playlist = [
    { title: 'Golden Brown', src: 'audio/golden-brown.mp3' },
    { title: 'Love Me Not', src: 'audio/love-me-not.mp3' },
    { title: 'I Think They Call This Love', src: 'audio/i-think-they-call-this-love.mp3' }
  ];
  let trackIndex = 0;
  let bgmStarted = false;

  function syncTrackUI() {
    if (trackList) {
      Array.from(trackList.children).forEach((chip, i) => {
        chip.classList.toggle('active', i === trackIndex);
        chip.classList.toggle('is-playing', i === trackIndex && !bgm.paused);
      });
    }
    if (playPauseBtn) playPauseBtn.classList.toggle('is-playing', bgmStarted && !bgm.paused);
    if (nowPlayingTitle) nowPlayingTitle.textContent = playlist[trackIndex] ? playlist[trackIndex].title : '—';
  }

  function renderTrackList() {
    if (!trackList) return;
    trackList.innerHTML = '';
    playlist.forEach((track, i) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'track-chip';
      chip.dataset.index = i;
      chip.innerHTML = '<span class="track-chip-dot"></span><span class="track-chip-name">' + track.title + '</span>';
      chip.addEventListener('click', () => selectTrack(i, true));
      trackList.appendChild(chip);
    });
    syncTrackUI();
  }

  function selectTrack(i, autoplay) {
    const shouldPlay = autoplay !== false || (bgmStarted && !bgm.paused);
    trackIndex = ((i % playlist.length) + playlist.length) % playlist.length;
    bgm.src = playlist[trackIndex].src;
    bgmStarted = true;
    syncTrackUI();
    if (shouldPlay) {
      bgm.play().catch(() => {
        if (trackHint) trackHint.textContent = 'audio file missing — keep the mp3 inside the audio/ folder';
        syncTrackUI();
      });
    }
    if (trackHint && !trackHint.textContent.includes('missing')) trackHint.textContent = 'tap a song anytime to switch';
  }

  function startBGM() {
    if (bgmStarted) return;
    bgmStarted = true;
    bgm.src = playlist[trackIndex].src;
    syncTrackUI();
    bgm.play().catch(() => { bgmStarted = false; syncTrackUI(); });
  }

  bgm.addEventListener('ended', () => selectTrack(trackIndex + 1, true));
  bgm.addEventListener('play', () => {
    syncTrackUI();
    document.querySelectorAll('.waveform').forEach(w => w.classList.add('playing'));
  });
  bgm.addEventListener('pause', () => {
    syncTrackUI();
    document.querySelectorAll('.waveform').forEach(w => w.classList.remove('playing'));
  });
  bgm.addEventListener('error', () => {
    if (trackHint) trackHint.textContent = 'audio file missing — keep the mp3 inside the audio/ folder';
  });

  document.getElementById('prevTrackBtn')?.addEventListener('click', () => selectTrack(trackIndex - 1, true));
  document.getElementById('nextTrackBtn')?.addEventListener('click', () => selectTrack(trackIndex + 1, true));
  playPauseBtn?.addEventListener('click', () => {
    if (!bgmStarted) { startBGM(); return; }
    if (bgm.paused) bgm.play().catch(() => {}); else bgm.pause();
  });

  renderTrackList();

  document.addEventListener('pointerdown', startBGM, { once: true });
  digitInputs[0]?.addEventListener('keydown', startBGM, { once: true });

  bgmToggle?.addEventListener('click', () => {
    bgm.muted = !bgm.muted;
    bgmToggle.classList.toggle('muted', bgm.muted);
    bgmToggle.setAttribute('aria-pressed', bgm.muted ? 'true' : 'false');
  });

  /* ---------------- Shared polish: floating hearts + performance guards ---------------- */

  function spawnHeartRain(count, originEl) {
    if (reduceMotion || !count) return;
    const box = originEl ? originEl.getBoundingClientRect() : null;
    const cx = box ? box.left + box.width / 2 : window.innerWidth / 2;
    const cy = box ? box.top + box.height / 2 : window.innerHeight / 2;
    const glyphs = ['❤', '💗', '💕', '♡', '✦'];

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'pop-heart';
      el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      el.style.left = (cx + (Math.random() - 0.5) * 90) + 'px';
      el.style.top = (cy + (Math.random() - 0.5) * 60) + 'px';
      el.style.fontSize = (11 + Math.random() * 13) + 'px';
      document.body.appendChild(el);

      gsap.fromTo(el,
        { opacity: 0, scale: 0.4 },
        {
          opacity: 1, scale: 1, duration: 0.34, ease: 'back.out(2)',
          onComplete: () => gsap.to(el, {
            opacity: 0,
            y: -(70 + Math.random() * 110),
            x: (Math.random() - 0.5) * 130,
            scale: 1.25,
            rotate: (Math.random() - 0.5) * 50,
            duration: 1.1 + Math.random() * 0.6,
            ease: 'power1.out',
            onComplete: () => el.remove()
          })
        }
      );
    }
  }

  document.addEventListener('pointerdown', (e) => {
    if (reduceMotion) return;
    const target = e.target.closest('.btn-primary, .btn-ghost, .coupon, .wish-item, .tt-option, .reason-card, .gift-box, .map-pin, .music-btn, .track-chip');
    if (!target) return;
    spawnHeartRain(2, target);
  }, { passive: true });

  /* ---------------- Init ---------------- */

  initAmbient();
  initKraftAmbient();
  animatePageIn(pages[0]);
  digitInputs[0].focus();

});
