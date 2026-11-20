/**
 * MALAWKO ELEKTROTECHNIK - CINEMATIC SCROLL-ANIMATED HERO
 * High-performance frame-based canvas animator
 */
(function () {
  'use strict';

  // Configuration
  const TOTAL_FRAMES = 192;
  const FRAME_DIR = 'assets/frames';
  const FRAME_PREFIX = 'frame_';
  const FRAME_EXT = '.webp';

  // DOM Elements
  const track = document.getElementById('cinematicHeroTrack');
  const canvas = document.getElementById('heroCanvas');
  const fallbackImg = document.getElementById('heroFallback');
  const progressBar = document.getElementById('cinematicProgressBar');
  const progressFill = document.getElementById('cinematicProgressFill');

  const stage1 = document.getElementById('stage1');
  const stage2 = document.getElementById('stage2');
  const stage3 = document.getElementById('stage3');
  const stage4 = document.getElementById('stage4');

  if (!track || !canvas) return;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  // Frame Cache
  const loadedFrames = new Array(TOTAL_FRAMES);
  let loadedCount = 0;
  let isDestroyed = false;

  // Animation State
  let targetFrame = 0;
  let currentFrame = 0;
  let animFrameId = null;
  let isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Format frame URL: assets/frames/frame_0000.webp
  function getFrameUrl(index) {
    const padded = String(index).padStart(4, '0');
    return `${FRAME_DIR}/${FRAME_PREFIX}${padded}${FRAME_EXT}`;
  }

  // Preload a single frame
  function loadSingleFrame(index) {
    return new Promise((resolve) => {
      if (loadedFrames[index]) {
        resolve(loadedFrames[index]);
        return;
      }
      const img = new Image();
      img.src = getFrameUrl(index);
      img.onload = () => {
        if (!isDestroyed) {
          loadedFrames[index] = img;
          loadedCount++;
          updateLoadingProgress();
          // Hide fallback image once first frame is ready
          if (index === 0 && fallbackImg) {
            fallbackImg.style.opacity = '0';
          }
        }
        resolve(img);
      };
      img.onerror = () => {
        resolve(null);
      };
    });
  }

  // Update progress bar
  function updateLoadingProgress() {
    if (!progressFill) return;
    const pct = Math.round((loadedCount / TOTAL_FRAMES) * 100);
    progressFill.style.width = pct + '%';
    if (loadedCount >= TOTAL_FRAMES && progressBar) {
      setTimeout(() => {
        progressBar.style.opacity = '0';
      }, 400);
    }
  }

  // Progressive Preloading Pipeline
  async function startPreloadPipeline() {
    // Phase 1: Load initial frame immediately
    await loadSingleFrame(0);
    renderCurrentFrame();

    // Phase 2: Load first 25 frames for immediate smooth scrolling
    const phase2 = [];
    for (let i = 1; i < Math.min(25, TOTAL_FRAMES); i++) {
      phase2.push(loadSingleFrame(i));
    }
    await Promise.all(phase2);

    // Phase 3: Background chunked loading of all remaining frames
    const CHUNK_SIZE = 25;
    for (let start = 25; start < TOTAL_FRAMES && !isDestroyed; start += CHUNK_SIZE) {
      const chunk = [];
      const end = Math.min(start + CHUNK_SIZE, TOTAL_FRAMES);
      for (let i = start; i < end; i++) {
        chunk.push(loadSingleFrame(i));
      }
      await Promise.all(chunk);
    }
  }

  // Resize canvas to full viewport with Retina DPR support
  function resizeCanvas() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    renderCurrentFrame();
  }

  // Draw image with CSS "cover" aspect ratio
  function drawCover(img) {
    if (!img || !img.complete || img.naturalWidth === 0) return;
    const cWidth = canvas.width;
    const cHeight = canvas.height;
    const hRatio = cWidth / img.naturalWidth;
    const vRatio = cHeight / img.naturalHeight;
    const ratio = Math.max(hRatio, vRatio);
    const shiftX = (cWidth - img.naturalWidth * ratio) / 2;
    const shiftY = (cHeight - img.naturalHeight * ratio) / 2;

    ctx.drawImage(
      img,
      0, 0, img.naturalWidth, img.naturalHeight,
      shiftX, shiftY, img.naturalWidth * ratio, img.naturalHeight * ratio
    );
  }

  // Render current frame with fallback to closest loaded neighbor
  function renderCurrentFrame() {
    const targetIdx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(currentFrame)));
    let img = loadedFrames[targetIdx];

    // Search nearest loaded frame if exact index is buffering
    if (!img) {
      for (let offset = 1; offset < 30; offset++) {
        if (targetIdx - offset >= 0 && loadedFrames[targetIdx - offset]) {
          img = loadedFrames[targetIdx - offset];
          break;
        }
        if (targetIdx + offset < TOTAL_FRAMES && loadedFrames[targetIdx + offset]) {
          img = loadedFrames[targetIdx + offset];
          break;
        }
      }
    }

    if (!img) img = loadedFrames[0];
    if (img) drawCover(img);
  }

  // Animation Loop (lerping currentFrame towards targetFrame)
  function animLoop() {
    if (isDestroyed) return;
    const diff = targetFrame - currentFrame;
    if (Math.abs(diff) > 0.01) {
      currentFrame += diff * 0.18;
      renderCurrentFrame();
    }
    animFrameId = requestAnimationFrame(animLoop);
  }

  // Calculate opacity bell curve for stages
  function calcOpacity(progress, enterStart, enterPeak, exitStart, exitPeak) {
    if (progress < enterStart || progress > exitPeak) return 0;
    if (progress >= enterPeak && progress <= exitStart) return 1;
    if (progress < enterPeak) return (progress - enterStart) / (enterPeak - enterStart);
    return (exitPeak - progress) / (exitPeak - exitStart);
  }

  // Update text stages opacity and translateY
  function updateTextStages(progress) {
    if (isReducedMotion) return;

    // Stage 1: Opening (Elektrotechnik.) [0.00 to 0.22]
    const op1 = calcOpacity(progress, -0.05, 0.0, 0.14, 0.22);
    applyStageStyle(stage1, op1, 24);

    // Stage 2: Durchdacht geplant. [0.24 to 0.48]
    const op2 = calcOpacity(progress, 0.23, 0.30, 0.42, 0.49);
    applyStageStyle(stage2, op2, 30);

    // Stage 3: Präzise umgesetzt. [0.50 to 0.74]
    const op3 = calcOpacity(progress, 0.50, 0.57, 0.68, 0.75);
    applyStageStyle(stage3, op3, 30);

    // Stage 4: Die passende Lösung für Ihr Vorhaben. [0.76 to 0.98]
    const op4 = calcOpacity(progress, 0.76, 0.83, 0.94, 0.99);
    applyStageStyle(stage4, op4, 28);
  }

  function applyStageStyle(element, opacity, maxTranslateY) {
    if (!element) return;
    if (opacity <= 0.005) {
      element.style.opacity = '0';
      element.style.pointerEvents = 'none';
      element.style.display = 'none';
    } else {
      element.style.display = 'flex';
      element.style.opacity = opacity.toFixed(3);
      element.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
      const translateY = ((1 - opacity) * maxTranslateY).toFixed(1);
      element.style.transform = `translateY(${translateY}px)`;
    }
  }

  // Scroll Handler
  function onScroll() {
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const scrollableDist = track.offsetHeight - window.innerHeight;
    if (scrollableDist <= 0) return;

    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / scrollableDist));

    // Map progress to target frame index
    targetFrame = progress * (TOTAL_FRAMES - 1);

    // Update text stages
    updateTextStages(progress);
  }

  // Initialize
  function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    onScroll();
    animLoop();
    startPreloadPipeline();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

