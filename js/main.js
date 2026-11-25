/**
 * Elektrotechnik Malawko GmbH — Homepage Hero JavaScript
 * Vanilla JavaScript implementation for interactions, accessibility and responsiveness.
 */

// Clean URLs in address bar: strips .html extension and maps /index or /index.html to /
(function cleanUrlExtension() {
  if (typeof window === 'undefined' || !window.location) return;
  if (window.location.protocol.startsWith('http')) {
    const pathname = window.location.pathname;
    if (pathname.endsWith('.html') || pathname === '/index' || pathname.endsWith('/index')) {
      let clean = pathname.replace(/\.html$/, '');
      if (clean === '/index' || clean.endsWith('/index')) {
        clean = clean.slice(0, -6) || '/';
      }
      const newUrl = clean + window.location.search + window.location.hash;
      window.history.replaceState(null, '', newUrl);
    }
  }

  // Graceful fallback for direct filesystem (file://) testing
  if (window.location.protocol === 'file:') {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a || !a.getAttribute('href')) return;
      const href = a.getAttribute('href');
      if (href.startsWith('http') || href.startsWith('//') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#') || href.startsWith('javascript:')) return;
      const [path, hash] = href.split('#');
      if (path && !path.includes('.')) {
        e.preventDefault();
        const base = (path === '/' || path === 'home' || path === '/home' || path === 'startseite' || path === '/startseite') ? 'index.html' : (path.replace(/^\//, '') + '.html');
        window.location.href = base + (hash ? '#' + hash : '');
      }
    });
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initMobileMenu();
  initServicesDropdown();
  initKeyboardNav();
  initEinsatzgebietMap();
  initHomeHeroSlider();
  initProjectsPage();
  initInteractiveConfigurator();
  initStoerungForm();
  initSolutionsSelector();
  initScrollReveal();
  initCallbackModal();
  initCookieConsent();
});

/**
 * Adjust header style upon scrolling
 */
function initNavbarScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * Mobile Navigation Drawer Toggle and Submenu Accordion
 */
function initMobileMenu() {
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const subToggle = document.getElementById('mobileSubToggle');
  const submenu = document.getElementById('mobileSubmenu');

  if (!mobileToggle || !mobileDrawer) return;

  const toggleDrawer = (forceState) => {
    const isOpen = typeof forceState === 'boolean'
      ? forceState
      : !mobileDrawer.classList.contains('open');

    mobileDrawer.classList.toggle('open', isOpen);
    mobileToggle.classList.toggle('open', isOpen);
    mobileToggle.setAttribute('aria-expanded', String(isOpen));
    mobileDrawer.setAttribute('aria-hidden', String(!isOpen));

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  mobileToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDrawer();
  });

  // Services accordion in mobile menu
  if (subToggle && submenu) {
    if (submenu.classList.contains('open')) {
      const icon = subToggle.querySelector('.chevron-icon');
      if (icon) icon.style.transform = 'rotate(180deg)';
    }

    subToggle.addEventListener('click', (e) => {
      e.preventDefault();
      const isSubOpen = submenu.classList.toggle('open');
      subToggle.setAttribute('aria-expanded', String(isSubOpen));
      const icon = subToggle.querySelector('.chevron-icon');
      if (icon) {
        icon.style.transform = isSubOpen ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    });
  }

  // Kontakt accordion in mobile menu
  const contactSubToggle = document.getElementById('mobileContactSubToggle');
  const contactSubmenu = document.getElementById('mobileContactSubmenu');
  if (contactSubToggle && contactSubmenu) {
    contactSubToggle.addEventListener('click', (e) => {
      e.preventDefault();
      const isSubOpen = contactSubmenu.classList.toggle('open');
      contactSubToggle.setAttribute('aria-expanded', String(isSubOpen));
      const icon = contactSubToggle.querySelector('.chevron-icon');
      if (icon) {
        icon.style.transform = isSubOpen ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    });
  }

  // Close drawer when clicking outside
  document.addEventListener('click', (e) => {
    if (mobileDrawer.classList.contains('open') &&
      !mobileDrawer.contains(e.target) &&
      !mobileToggle.contains(e.target)) {
      toggleDrawer(false);
    }
  });

  // Close drawer when any nav link is clicked
  const mobileLinks = mobileDrawer.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleDrawer(false);
    });
  });

  // Close drawer on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 992 && mobileDrawer.classList.contains('open')) {
      toggleDrawer(false);
    }
  }, { passive: true });
}

/**
 * Generic Desktop Dropdown handler (hover + keyboard)
 */
function initDesktopDropdown(triggerId, dropdownId) {
  const dropdownTrigger = document.getElementById(triggerId);
  const toggleBtn = dropdownTrigger ? (dropdownTrigger.querySelector('.dropdown-toggle-btn') || dropdownTrigger.querySelector('.dropdown-toggle')) : null;
  const dropdown = document.getElementById(dropdownId);

  if (!dropdownTrigger || !toggleBtn || !dropdown) return;

  let closeTimer = null;
  dropdownTrigger.addEventListener('mouseenter', () => {
    if (closeTimer) clearTimeout(closeTimer);
    toggleBtn.setAttribute('aria-expanded', 'true');
    dropdownTrigger.classList.add('open');
  });
  dropdownTrigger.addEventListener('mouseleave', () => {
    closeTimer = setTimeout(() => {
      toggleBtn.setAttribute('aria-expanded', 'false');
      dropdownTrigger.classList.remove('open');
    }, 240);
  });
  dropdown.addEventListener('mouseenter', () => {
    if (closeTimer) clearTimeout(closeTimer);
    dropdownTrigger.classList.add('open');
  });
  dropdown.addEventListener('mouseleave', () => {
    closeTimer = setTimeout(() => {
      toggleBtn.setAttribute('aria-expanded', 'false');
      dropdownTrigger.classList.remove('open');
    }, 240);
  });
  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
    dropdownTrigger.classList.toggle('open', !isExpanded);
  });
  dropdownTrigger.addEventListener('focusout', (e) => {
    if (!dropdownTrigger.contains(e.relatedTarget)) {
      toggleBtn.setAttribute('aria-expanded', 'false');
      dropdownTrigger.classList.remove('open');
    }
  });
}

/**
 * Services Dropdown handling on Desktop
 */
function initServicesDropdown() {
  initDesktopDropdown('servicesDropdownTrigger', 'servicesDropdown');
  initDesktopDropdown('contactDropdownTrigger', 'contactDropdown');
}

/**
 * Global Keyboard Navigation (ESC to close drawers/menus)
 */
function initKeyboardNav() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const mobileDrawer = document.getElementById('mobileDrawer');
      const mobileToggle = document.getElementById('mobileMenuToggle');
      const dropdownTrigger = document.getElementById('servicesDropdownTrigger');
      const toggleBtn = dropdownTrigger ? dropdownTrigger.querySelector('.dropdown-toggle') : null;

      if (mobileDrawer && mobileDrawer.classList.contains('open')) {
        mobileDrawer.classList.remove('open');
        if (mobileToggle) {
          mobileToggle.classList.remove('open');
          mobileToggle.setAttribute('aria-expanded', 'false');
          mobileToggle.focus();
        }
        document.body.style.overflow = '';
      }

      if (dropdownTrigger && dropdownTrigger.classList.contains('open')) {
        dropdownTrigger.classList.remove('open');
        if (toggleBtn) {
          toggleBtn.setAttribute('aria-expanded', 'false');
          toggleBtn.focus();
        }
      }
    }
  });
}

/**
 * Initialize Interactive Einsatzgebiet Leaflet Map (Hamburg & Metropolregion)
 * Centered on Elektrotechnik Malawko GmbH: Schreyerring 49, 22309 Hamburg
 */
let einsatzgebietMapInstance = null;

function renderEinsatzgebietMap() {
  const mapContainer = document.getElementById('einsatzgebietMap');
  if (!mapContainer || typeof L === 'undefined' || einsatzgebietMapInstance) return;

  const placeholder = mapContainer.querySelector('.map-consent-placeholder');
  if (placeholder) placeholder.remove();

  const hmbLat = 53.6109;
  const hmbLng = 10.0594;
  const viewCenter = [53.58, 10.03];

  try {
    const map = L.map('einsatzgebietMap', {
      center: viewCenter,
      zoom: 10,
      minZoom: 8,
      maxZoom: 14,
      scrollWheelZoom: false,
      zoomControl: false,
      attributionControl: false
    });
    einsatzgebietMapInstance = map;

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      attribution: 'Esri, HERE, Garmin, &copy; OpenStreetMap contributors'
    }).addTo(map);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16
    }).addTo(map);

    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    L.circle([hmbLat, hmbLng], {
      radius: 35000,
      color: '#D9541E',
      weight: 1.5,
      opacity: 0.7,
      fillColor: '#D9541E',
      fillOpacity: 0.04,
      dashArray: '6, 6'
    }).addTo(map);

    L.circle([hmbLat, hmbLng], {
      radius: 16000,
      color: '#D9541E',
      weight: 2,
      opacity: 0.9,
      fillColor: '#D9541E',
      fillOpacity: 0.08
    }).addTo(map);

    const customPulseIcon = L.divIcon({
      className: 'map-pulse-marker',
      html: `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(217, 84, 30, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 14px; height: 14px; border-radius: 50%; background: #D9541E; border: 2.5px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    const marker = L.marker([hmbLat, hmbLng], { icon: customPulseIcon }).addTo(map);
    marker.bindPopup(`
      <div style="font-family: inherit; font-size: 13px; color: #1E293B; line-height: 1.4; padding: 2px;">
        <strong style="color: #0F172A; display: block; margin-bottom: 2px;">Elektrotechnik Malawko</strong>
        <span>Schreyerring 49, 22309 Hamburg</span><br>
        <span style="color: #D9541E; font-size: 12px; font-weight: 700;">Zentrale Hamburg &amp; Metropolregion</span>
      </div>
    `);
  } catch (err) {
    console.error('Error initializing Einsatzgebiet map:', err);
  }
}

function showMapConsentPlaceholder(mapContainer) {
  if (!mapContainer || mapContainer.querySelector('.map-consent-placeholder')) return;
  mapContainer.innerHTML = `
    <div class="map-consent-placeholder" id="mapConsentPlaceholder">
      <div class="map-consent-card">
        <div class="map-consent-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D9541E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
        </div>
        <h4 class="map-consent-title">Interaktive Karte deaktiviert</h4>
        <p class="map-consent-text">
          Aus Datenschutzgründen werden externe Kartendaten (Esri / OpenStreetMap) erst nach Ihrer Einwilligung geladen.
        </p>
        <button type="button" class="btn-primary-orange map-consent-btn" onclick="acceptExternalMedia()">
          <span>Karte laden &amp; zustimmen</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
        <a href="/datenschutz" class="map-consent-link" target="_blank">Datenschutzerklärung lesen</a>
      </div>
    </div>
  `;
}

function initEinsatzgebietMap() {
  const mapContainer = document.getElementById('einsatzgebietMap');
  if (!mapContainer) return;

  const consent = localStorage.getItem('malawko_cookie_consent');
  if (consent === 'all') {
    renderEinsatzgebietMap();
  } else {
    showMapConsentPlaceholder(mapContainer);
  }
}

/**
 * Initialize Referenzen/Projects Page Interactive Features
 */
function initProjectsPage() {
  // 1. Category Filter Pills
  const filterPills = document.querySelectorAll('.project-filter-bar .filter-pill');
  const projectCards = document.querySelectorAll('#featuredProjectsGrid .project-card-item');

  if (filterPills.length > 0 && projectCards.length > 0) {
    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => {
          p.classList.remove('active');
          p.setAttribute('aria-selected', 'false');
        });
        pill.classList.add('active');
        pill.setAttribute('aria-selected', 'true');

        const filter = pill.getAttribute('data-filter');

        projectCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.classList.remove('hidden');
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            setTimeout(() => {
              card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 30);
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });
  }

  // 2. Case Study Gallery Thumbnails & Prev/Next
  const mainImg = document.getElementById('detailMainImg');
  const thumbBtns = document.querySelectorAll('.detail-thumbnails-row .detail-thumb-btn');
  const prevBtn = document.getElementById('detailPrevBtn');
  const nextBtn = document.getElementById('detailNextBtn');

  if (mainImg && thumbBtns.length > 0) {
    let currentIndex = 0;

    const selectImage = (index) => {
      currentIndex = (index + thumbBtns.length) % thumbBtns.length;
      thumbBtns.forEach((btn, idx) => {
        if (idx === currentIndex) {
          btn.classList.add('active');
          const newSrc = btn.getAttribute('data-img');
          if (newSrc && mainImg.src !== newSrc) {
            mainImg.style.opacity = '0.4';
            setTimeout(() => {
              mainImg.src = newSrc;
              mainImg.style.opacity = '1';
            }, 120);
          }
        } else {
          btn.classList.remove('active');
        }
      });
    };

    thumbBtns.forEach((btn, idx) => {
      btn.addEventListener('click', () => selectImage(idx));
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', () => selectImage(currentIndex - 1));
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => selectImage(currentIndex + 1));
    }
  }

  // 3. Video Modal Trigger
  const playVideoBtn = document.getElementById('playVideoBtn');
  const videoModal = document.getElementById('videoModal');
  const closeVideoBtn = document.getElementById('closeVideoBtn');

  if (playVideoBtn && videoModal) {
    playVideoBtn.addEventListener('click', () => {
      videoModal.style.display = 'flex';
      videoModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });

    const closeModal = () => {
      videoModal.style.display = 'none';
      videoModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    if (closeVideoBtn) closeVideoBtn.addEventListener('click', closeModal);

    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && videoModal.style.display === 'flex') {
        closeModal();
      }
    });
  }
}

/* ==========================================================================
   INTERACTIVE 6-STEP PROJECT CONFIGURATOR (MALAWKO KONTAKT PAGE)
   ========================================================================== */
function initInteractiveConfigurator() {
  const form = document.getElementById('projectConfiguratorForm');
  const card = document.getElementById('configuratorCard');
  if (!form || !card) return;

  // Navigation elements
  const btnNext = document.getElementById('btnConfigNext');
  const btnBack = document.getElementById('btnConfigBack');
  const btnNextText = document.getElementById('btnNextText');
  const btnNextIcon = document.getElementById('btnNextIcon');
  const stepCounter = document.getElementById('configStepCounter');
  const progressBar = document.getElementById('configProgressBar');
  const alertBox = document.getElementById('configAlertBox');
  const navFooter = document.getElementById('configNavFooter');
  const confirmationPanel = document.getElementById('configConfirmation');
  const btnReset = document.getElementById('btnResetConfigurator');

  // Step panels
  const panels = {
    1: document.getElementById('configStep1'),
    2: document.getElementById('configStep2'),
    3: document.getElementById('configStep3'),
    4: document.getElementById('configStep4'),
    5: document.getElementById('configStep5'),
    6: document.getElementById('configStep6')
  };

  // State
  let currentStep = 1;
  const totalSteps = 6;
  const state = {
    services: ['Elektroinstallation'],
    property: 'Einfamilienhaus',
    phase: 'Erste Idee',
    details: {},
    message: '',
    files: [],
    contact: {
      vorname: '',
      nachname: '',
      email: '',
      telefon: '',
      preferredContact: 'E-Mail',
      contactTime: 'Jederzeit',
      datenschutz: false
    }
  };

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------
  function showAlert(msg) {
    if (!alertBox) return;
    alertBox.textContent = msg;
    alertBox.style.display = 'block';
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideAlert() {
    if (!alertBox) return;
    alertBox.style.display = 'none';
    alertBox.textContent = '';
  }

  function updateProgress(step) {
    if (stepCounter) {
      stepCounter.textContent = `Schritt ${step} von ${totalSteps}`;
    }
    if (progressBar) {
      progressBar.setAttribute('aria-valuenow', String(step));
      const segments = progressBar.querySelectorAll('.config-progress-seg');
      segments.forEach((seg, idx) => {
        if (idx < step) {
          seg.classList.add('active');
        } else {
          seg.classList.remove('active');
        }
      });
    }
  }

  function updateNavButtons(step) {
    if (!btnBack || !btnNext) return;
    btnBack.disabled = (step === 1);

    if (step === totalSteps) {
      btnNextText.textContent = 'Anfrage senden';
      btnNext.classList.add('btn-submit-mode');
      btnNextIcon.innerHTML = `
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      `;
    } else {
      btnNextText.textContent = 'Weiter';
      btnNext.classList.remove('btn-submit-mode');
      btnNextIcon.innerHTML = `
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      `;
    }
  }

  function goToStep(targetStep) {
    if (targetStep < 1 || targetStep > totalSteps) return;
    hideAlert();

    // Hide all panels
    Object.values(panels).forEach(panel => {
      if (panel) panel.classList.remove('active');
    });

    // Show target panel
    const targetPanel = panels[targetStep];
    if (targetPanel) {
      targetPanel.classList.add('active');
    }

    currentStep = targetStep;
    updateProgress(currentStep);
    updateNavButtons(currentStep);

    // Dynamic actions per step
    if (currentStep === 4) {
      renderDynamicStep4Fields();
    } else if (currentStep === 6) {
      updateStep6Summary();
    }

    // Scroll to configurator if needed on mobile
    if (window.innerWidth <= 768) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // --------------------------------------------------------------------------
  // STEP 1: Single-Select Property Cards
  // --------------------------------------------------------------------------
  const step1Cards = panels[1].querySelectorAll('.config-card-singleselect');
  step1Cards.forEach(cardEl => {
    const selectProperty = () => {
      step1Cards.forEach(c => {
        c.classList.remove('is-selected');
        c.setAttribute('aria-checked', 'false');
      });
      cardEl.classList.add('is-selected');
      cardEl.setAttribute('aria-checked', 'true');
      state.property = cardEl.getAttribute('data-value');
      hideAlert();

      // Auto-advance to Step 2 on single choice selection
      setTimeout(() => {
        if (currentStep === 1) {
          goToStep(2);
        }
      }, 260);
    };

    cardEl.addEventListener('click', selectProperty);
    cardEl.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        selectProperty();
      }
    });
  });

  // --------------------------------------------------------------------------
  // STEP 2: Multi-Select Service Cards
  // --------------------------------------------------------------------------
  const step2Cards = panels[2].querySelectorAll('.config-card-multiselect');
  // Pre-select service from URL query param if present
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const paramService = urlParams.get('service');
    if (paramService) {
      step2Cards.forEach(cardEl => {
        const val = cardEl.getAttribute('data-value');
        if (val && val.toLowerCase() === paramService.toLowerCase()) {
          step2Cards.forEach(c => {
            c.classList.remove('is-selected');
            c.setAttribute('aria-checked', 'false');
          });
          state.services = [val];
          cardEl.classList.add('is-selected');
          cardEl.setAttribute('aria-checked', 'true');
        }
      });
    }
  } catch (err) { }

  step2Cards.forEach(cardEl => {
    const toggleSelection = () => {
      const val = cardEl.getAttribute('data-value');
      const isSelected = cardEl.classList.toggle('is-selected');
      cardEl.setAttribute('aria-checked', String(isSelected));

      if (isSelected) {
        if (!state.services.includes(val)) state.services.push(val);
      } else {
        state.services = state.services.filter(s => s !== val);
      }
      hideAlert();
    };

    cardEl.addEventListener('click', toggleSelection);
    cardEl.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggleSelection();
      }
    });
  });

  // --------------------------------------------------------------------------
  // STEP 3: Single-Select Project Phase Cards
  // --------------------------------------------------------------------------
  const step3Cards = panels[3].querySelectorAll('.config-card-singleselect');
  step3Cards.forEach(cardEl => {
    const selectPhase = () => {
      step3Cards.forEach(c => {
        c.classList.remove('is-selected');
        c.setAttribute('aria-checked', 'false');
      });
      cardEl.classList.add('is-selected');
      cardEl.setAttribute('aria-checked', 'true');
      state.phase = cardEl.getAttribute('data-value');
      hideAlert();

      // Auto-advance to Step 4 on single choice selection
      setTimeout(() => {
        if (currentStep === 3) {
          goToStep(4);
        }
      }, 260);
    };

    cardEl.addEventListener('click', selectPhase);
    cardEl.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        selectPhase();
      }
    });
  });

  // --------------------------------------------------------------------------
  // STEP 4: Dynamic Fields Tailored to Selected Services
  // --------------------------------------------------------------------------
  const dynamicContainer = document.getElementById('configDynamicFields');
  const projectMsgTextarea = document.getElementById('configProjectMessage');

  function renderDynamicStep4Fields() {
    if (!dynamicContainer) return;
    dynamicContainer.innerHTML = '';

    const services = state.services;
    let fieldCount = 0;

    // Helper to create a segmented group
    function createSegmentedGroup(label, key, options, defaultVal) {
      fieldCount++;
      const group = document.createElement('div');
      group.className = 'config-field-group';

      const lbl = document.createElement('label');
      lbl.className = 'config-field-label';
      lbl.textContent = label;
      group.appendChild(lbl);

      const row = document.createElement('div');
      row.className = 'config-segmented-row';

      const currentVal = state.details[key] || defaultVal || options[0];
      state.details[key] = currentVal;

      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'config-seg-btn' + (opt === currentVal ? ' active' : '');
        btn.textContent = opt;
        btn.addEventListener('click', () => {
          row.querySelectorAll('.config-seg-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.details[key] = opt;
        });
        row.appendChild(btn);
      });

      group.appendChild(row);
      dynamicContainer.appendChild(group);
    }

    // 1. Elektroinstallation
    if (services.includes('Elektroinstallation')) {
      createSegmentedGroup(
        'Elektroinstallation: Bauvorhaben',
        'elektro_type',
        ['Neubau', 'Komplettsanierung', 'Teilsanierung', 'Erweiterung'],
        'Neubau'
      );
      createSegmentedGroup(
        'Umfang der Räume',
        'elektro_rooms',
        ['1 – 3 Räume', '4 – 6 Räume', '7+ Räume', 'Ganzes Gebäude'],
        '4 – 6 Räume'
      );
    }

    // 2. Zähler und Hausanschluss
    if (services.includes('Zähler und Hausanschluss')) {
      createSegmentedGroup(
        'Zähler & Hausanschluss: Bestehender Zählerschrank vorhanden?',
        'zaehler_schrank',
        ['Ja, vorhanden', 'Nein (Neubau)', 'Nicht sicher / Vor-Ort-Check'],
        'Ja, vorhanden'
      );
      createSegmentedGroup(
        'Gewünschte Maßnahme',
        'zaehler_action',
        ['Zählerplatz-Modernisierung', 'Anschlussverstärkung', 'Zusammenlegung', 'Neuanschluss'],
        'Zählerplatz-Modernisierung'
      );
    }

    // 3. Wallbox und E-Mobilität
    if (services.includes('Wallbox und E-Mobilität')) {
      createSegmentedGroup(
        'Wallbox: Anzahl gewünschter Ladepunkte',
        'wallbox_points',
        ['1 Ladepunkt (11/22 kW)', '2 Ladepunkte', 'Flottenlösung (> 2)'],
        '1 Ladepunkt (11/22 kW)'
      );
      createSegmentedGroup(
        'Montageort',
        'wallbox_location',
        ['Garage', 'Carport', 'Außenstellplatz', 'Tiefgarage'],
        'Garage'
      );
    }

    // 4. Smart Home und KNX
    if (services.includes('Smart Home und KNX')) {
      createSegmentedGroup(
        'Smart Home: Systemstatus',
        'smarthome_status',
        ['Neubau (KNX geplant)', 'Nachrüstung Bestandsbau', 'Beratung offen'],
        'Neubau (KNX geplant)'
      );
      createSegmentedGroup(
        'Gewünschte Schwerpunkte',
        'smarthome_focus',
        ['Beleuchtung & Beschattung', 'Heizung & Energie', 'Gesamtautomatisation'],
        'Beleuchtung & Beschattung'
      );
    }

    // 5. Beleuchtung
    if (services.includes('Beleuchtung')) {
      createSegmentedGroup(
        'Beleuchtung: Einsatzbereich',
        'lighting_area',
        ['Wohnraum / Innenbereich', 'Garten & Außenfassade', 'Gewerbe / Büro'],
        'Wohnraum / Innenbereich'
      );
    }

    // 6. Netzwerk und Kommunikation
    if (services.includes('Netzwerk und Kommunikation')) {
      createSegmentedGroup(
        'Netzwerk: Geschätzte Anschlüsse / Ports',
        'network_ports',
        ['1 – 6 Ports', '7 – 16 Ports', '17+ Ports (Strukturierte Firmenverkabelung)'],
        '7 – 16 Ports'
      );
    }

    // 7. Prüfung und Wartung
    if (services.includes('Prüfung und Wartung')) {
      createSegmentedGroup(
        'Prüfung & Wartung: Art der Prüfung',
        'pruefung_type',
        ['E-Check für Privat', 'DGUV V3 für Gewerbe', 'Wiederholungsprüfung'],
        'E-Check für Privat'
      );
    }

    // 8. Störung und Reparatur
    if (services.includes('Störung und Reparatur')) {
      createSegmentedGroup(
        'Störung & Reparatur: Dringlichkeit',
        'stoerung_urgency',
        ['Dringend / Akuter Teilausfall', 'Totalausfall', 'Normaler Servicetermin'],
        'Dringend / Akuter Teilausfall'
      );
    }
    // 9. Photovoltaik
    if (services.includes('Photovoltaik')) {
      createSegmentedGroup(
        'Photovoltaik: Geplante Dacheindeckung & Gebäude',
        'pv_roof',
        ['Satteldach / Ziegeldach', 'Flachdach', 'Blech- / Trapezdach', 'Freifläche / Carport'],
        'Satteldach / Ziegeldach'
      );
      createSegmentedGroup(
        'Gewünschter Stromspeicher',
        'pv_storage',
        ['Mit Stromspeicher (5 – 15 kWh)', 'Großspeicher (> 15 kWh)', 'Ohne Speicher', 'Beratung gewünscht'],
        'Mit Stromspeicher (5 – 15 kWh)'
      );
    }

    // 10. Wärmepumpe
    if (services.includes('Wärmepumpe')) {
      createSegmentedGroup(
        'Wärmepumpen-Anschluss: Art der Wärmepumpe',
        'wp_type',
        ['Luft-Wasser-Wärmepumpe', 'Sole-Wasser (Erdwärme)', 'Hybrid-System', 'Noch in Planung'],
        'Luft-Wasser-Wärmepumpe'
      );
      createSegmentedGroup(
        '§ 14a EnWG & Messkonzept',
        'wp_measure',
        ['Zählerkaskade (Haushalt + PV + WP)', 'Separater Zählerplatz', 'Nur Zuleitung & Absicherung', 'Beratung offen'],
        'Zählerkaskade (Haushalt + PV + WP)'
      );
    }


    // Fallback if no specific services
    if (fieldCount === 0) {
      createSegmentedGroup(
        'Projektumfang',
        'general_scope',
        ['Kleinprojekt / Einzelmaßnahme', 'Mittleres Vorhaben', 'Großprojekt'],
        'Mittleres Vorhaben'
      );
    }
  }

  // --------------------------------------------------------------------------
  // STEP 5: File Upload & Drag-and-Drop
  // --------------------------------------------------------------------------
  const dropzone = document.getElementById('configDropzone');
  const fileInput = document.getElementById('configFileUpload');
  const fileList = document.getElementById('configFileList');

  function renderFileList() {
    if (!fileList) return;
    fileList.innerHTML = '';

    if (state.files.length === 0) {
      fileList.innerHTML = '';
      return;
    }

    state.files.forEach((file, index) => {
      const item = document.createElement('div');
      item.className = 'config-file-item';

      const info = document.createElement('div');
      info.className = 'config-file-info';

      const sizeKb = (file.size / 1024).toFixed(0);
      const sizeStr = sizeKb > 1024 ? (sizeKb / 1024).toFixed(1) + ' MB' : sizeKb + ' KB';

      info.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D9541E" stroke-width="2.2" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
        <span title="${escapeHtml(file.name)}"><strong>${escapeHtml(file.name)}</strong> (${sizeStr})</span>
      `;

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'config-file-remove';
      removeBtn.setAttribute('aria-label', `Datei ${file.name} entfernen`);
      removeBtn.innerHTML = '&times; Entfernen';
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.files.splice(index, 1);
        renderFileList();
      });

      item.appendChild(info);
      item.appendChild(removeBtn);
      fileList.appendChild(item);
    });
  }

  function handleFiles(files) {
    const validFiles = Array.from(files).filter(f => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      const ext = f.name.toLowerCase().split('.').pop();
      const validExts = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
      const isTypeValid = validTypes.includes(f.type) || validExts.includes(ext);

      if (!isTypeValid) {
        showAlert(`Format nicht unterstützt: ${f.name} (Erlaubt: JPG, PNG, PDF)`);
        return false;
      }
      if (f.size > 10 * 1024 * 1024) {
        showAlert(`Datei zu groß: ${f.name} (Maximal 10 MB pro Datei)`);
        return false;
      }
      return true;
    });

    state.files = state.files.concat(validFiles).slice(0, 8); // max 8 files
    renderFileList();
  }

  if (dropzone && fileInput) {
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files) {
        handleFiles(fileInput.files);
        fileInput.value = ''; // reset so same file can be re-selected
      }
    });
  }

  // --------------------------------------------------------------------------
  // STEP 6: Preferred Contact Methods & Summary
  // --------------------------------------------------------------------------
  const prefButtons = panels[6].querySelectorAll('.config-pref-btn');
  prefButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      prefButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      state.contact.preferredContact = btn.getAttribute('data-pref');
    });
  });

  const sumServices = document.getElementById('sumServices');
  const sumProperty = document.getElementById('sumProperty');
  const sumPhase = document.getElementById('sumPhase');
  const sumFiles = document.getElementById('sumFiles');
  const btnEditConfig = document.getElementById('btnEditConfig');

  if (btnEditConfig) {
    btnEditConfig.addEventListener('click', () => {
      goToStep(1);
    });
  }

  function updateStep6Summary() {
    if (sumServices) sumServices.textContent = state.services.join(', ') || 'Keine gewählt';
    if (sumProperty) sumProperty.textContent = state.property || '-';
    if (sumPhase) sumPhase.textContent = state.phase || '-';
    if (sumFiles) {
      const count = state.files.length;
      sumFiles.textContent = count === 0 ? 'Keine' : `${count} Datei${count > 1 ? 'en' : ''} angehängt`;
    }
  }

  // --------------------------------------------------------------------------
  // Step Validation
  // --------------------------------------------------------------------------
  function validateStep(step) {
    hideAlert();

    if (step === 1) {
      if (!state.property) {
        showAlert('Bitte wählen Sie die Art der Immobilie aus.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!state.services || state.services.length === 0) {
        showAlert('Bitte wählen Sie mindestens eine gewünschte Leistung aus.');
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (!state.phase) {
        showAlert('Bitte wählen Sie den aktuellen Status Ihres Projekts aus.');
        return false;
      }
      return true;
    }

    if (step === 4) {
      if (projectMsgTextarea) {
        state.message = projectMsgTextarea.value.trim();
      }
      return true;
    }

    if (step === 5) {
      return true; // Files are optional
    }

    if (step === 6) {
      const vornameEl = document.getElementById('configVorname');
      const nachnameEl = document.getElementById('configNachname');
      const emailEl = document.getElementById('configEmail');
      const telefonEl = document.getElementById('configTelefon');
      const datenschutzEl = document.getElementById('configDatenschutz');
      const timeEl = document.getElementById('configContactTime');

      const errVorname = document.getElementById('errVorname');
      const errNachname = document.getElementById('errNachname');
      const errEmail = document.getElementById('errEmail');
      const errTelefon = document.getElementById('errTelefon');
      const errDatenschutz = document.getElementById('errDatenschutz');

      let isValid = true;

      // Vorname
      if (!vornameEl.value.trim()) {
        vornameEl.classList.add('has-error');
        if (errVorname) errVorname.style.display = 'block';
        isValid = false;
      } else {
        vornameEl.classList.remove('has-error');
        if (errVorname) errVorname.style.display = 'none';
      }

      // Nachname
      if (!nachnameEl.value.trim()) {
        nachnameEl.classList.add('has-error');
        if (errNachname) errNachname.style.display = 'block';
        isValid = false;
      } else {
        nachnameEl.classList.remove('has-error');
        if (errNachname) errNachname.style.display = 'none';
      }

      // Email
      const emailVal = emailEl.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailVal || !emailRegex.test(emailVal)) {
        emailEl.classList.add('has-error');
        if (errEmail) errEmail.style.display = 'block';
        isValid = false;
      } else {
        emailEl.classList.remove('has-error');
        if (errEmail) errEmail.style.display = 'none';
      }

      // Telefon
      const telVal = telefonEl.value.trim();
      if (!telVal || telVal.length < 6) {
        telefonEl.classList.add('has-error');
        if (errTelefon) errTelefon.style.display = 'block';
        isValid = false;
      } else {
        telefonEl.classList.remove('has-error');
        if (errTelefon) errTelefon.style.display = 'none';
      }

      // Datenschutz
      if (!datenschutzEl.checked) {
        if (errDatenschutz) errDatenschutz.style.display = 'block';
        isValid = false;
      } else {
        if (errDatenschutz) errDatenschutz.style.display = 'none';
      }

      if (!isValid) {
        showAlert('Bitte füllen Sie alle erforderlichen Pflichtfelder (*) korrekt aus.');
        return false;
      }

      // Save state
      state.contact.vorname = vornameEl.value.trim();
      state.contact.nachname = nachnameEl.value.trim();
      state.contact.email = emailVal;
      state.contact.telefon = telVal;
      state.contact.contactTime = timeEl ? timeEl.value : 'Jederzeit';
      state.contact.datenschutz = true;

      return true;
    }

    return true;
  }

  // --------------------------------------------------------------------------
  // Navigation Button Handlers
  // --------------------------------------------------------------------------
  if (btnNext) {
    btnNext.addEventListener('click', (e) => {
      e.preventDefault();

      if (!validateStep(currentStep)) return;

      if (currentStep < totalSteps) {
        goToStep(currentStep + 1);
      } else {
        submitConfiguratorInquiry();
      }
    });
  }

  if (btnBack) {
    btnBack.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentStep > 1) {
        goToStep(currentStep - 1);
      }
    });
  }

  // --------------------------------------------------------------------------
  // Form Submission
  // --------------------------------------------------------------------------
  function submitConfiguratorInquiry() {
    btnNext.disabled = true;
    btnNextText.textContent = 'Wird übermittelt...';

    const timestamp = new Date().toISOString();
    const formattedDate = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
    const refId = '#MLK-' + Math.floor(1000 + Math.random() * 9000);

    const inquiryPayload = {
      referenceId: refId,
      customer: {
        firstName: state.contact.vorname,
        lastName: state.contact.nachname,
        email: state.contact.email,
        phone: state.contact.telefon,
        preferredContact: state.contact.preferredContact,
        contactTime: state.contact.contactTime
      },
      project: {
        services: state.services,
        propertyType: state.property,
        phase: state.phase,
        scopeDetails: state.details,
        message: state.message || 'Keine zusätzliche Nachricht'
      },
      attachments: state.files.map(f => ({ name: f.name, size: f.size, type: f.type })),
      metadata: {
        submittedAt: timestamp,
        formattedDate: formattedDate,
        recipient: 'kontakt@elektrotechnik-malawko.de'
      }
    };

    console.log('--- MALAWKO INTERAKTIVE PROJEKTANFRAGE (STRUKTURIERTE E-MAIL DATEN) ---', inquiryPayload);

    try {
      if (typeof fetch === 'function') {
        fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inquiryPayload)
        }).catch(() => {});
      }
    } catch (e) {}

    // Simulate reliable submission transition
    setTimeout(() => {
      // Hide step panels and card header, keep form container visible
      Object.values(panels).forEach(p => { if (p) p.style.display = 'none'; });
      const cardHeader = card.querySelector('.config-card-header');
      if (cardHeader) cardHeader.style.display = 'none';
      if (navFooter) navFooter.style.display = 'none';

      // Update and show confirmation panel
      const confirmRef = document.getElementById('confirmRefId');
      const confirmEmail = document.getElementById('confirmEmailDisplay');

      if (confirmRef) confirmRef.textContent = refId;
      if (confirmEmail) confirmEmail.textContent = state.contact.email;

      if (confirmationPanel) {
        confirmationPanel.style.display = 'block';
        confirmationPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 600);
  }

  // --------------------------------------------------------------------------
  // Reset Configurator
  // --------------------------------------------------------------------------
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      // Reset state
      state.services = ['Elektroinstallation'];
      state.property = 'Einfamilienhaus';
      state.phase = 'Erste Idee';
      state.details = {};
      state.message = '';
      state.files = [];

      form.reset();
      const cardHeader = card.querySelector('.config-card-header');
      if (cardHeader) cardHeader.style.display = 'flex';
      if (navFooter) navFooter.style.display = 'flex';
      if (confirmationPanel) confirmationPanel.style.display = 'none';

      // Reset step 1 cards
      step1Cards.forEach(c => {
        const isDefault = c.getAttribute('data-value') === 'Elektroinstallation';
        c.classList.toggle('is-selected', isDefault);
        c.setAttribute('aria-checked', String(isDefault));
      });

      // Reset step 2 cards
      step2Cards.forEach(c => {
        const isDefault = c.getAttribute('data-value') === 'Einfamilienhaus';
        c.classList.toggle('is-selected', isDefault);
        c.setAttribute('aria-checked', String(isDefault));
      });

      // Reset step 3 cards
      step3Cards.forEach(c => {
        const isDefault = c.getAttribute('data-value') === 'Erste Idee';
        c.classList.toggle('is-selected', isDefault);
        c.setAttribute('aria-checked', String(isDefault));
      });

      renderFileList();
      goToStep(1);
    });
  }

  // Initialize Step 1
  goToStep(1);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

/**
 * ----------------------------------------------------------------------------
 * 3-STEP INTERACTIVE STÖRUNG MELDEN (FAULT REPORT) FORM
 * ----------------------------------------------------------------------------
 */
function initStoerungForm() {
  const form = document.getElementById('stoerungForm');
  const card = document.getElementById('stoerungCard');
  if (!form || !card) return;

  // Navigation elements
  const btnNext = document.getElementById('stoerungBtnNext');
  const btnBack = document.getElementById('stoerungBtnBack');
  const btnNextText = document.getElementById('stoerungBtnNextText');
  const btnNextIcon = document.getElementById('stoerungBtnNextIcon');
  const alertBox = document.getElementById('stoerungAlertBox');
  const confirmationPanel = document.getElementById('stoerungConfirmation');
  const btnReset = document.getElementById('btnResetStoerung');
  const btnMailtoSummary = document.getElementById('btnMailtoSummary');

  // Step Indicators & Connectors (9 Steps)
  const indicators = {};
  const connectors = {};
  const panels = {};
  for (let i = 1; i <= 9; i++) {
    indicators[i] = document.getElementById('stoerungStepIndicator' + i);
    panels[i] = document.getElementById('stoerungStep' + i);
    if (i < 9) connectors[i] = document.getElementById('stoerungConnector' + i);
  }

  const stepCounter = document.getElementById('stoerungStepCounter');
  const locationFields = document.getElementById('stoerungLocationFields');
  const savedAddressHint = document.getElementById('stoerungSavedAddressHint');
  const callbackWayGroup = document.getElementById('stoerungCallbackWay');
  const callbackTimeGroup = document.getElementById('stoerungCallbackTimeGroup');

  // State
  let currentStep = 1;
  const totalSteps = 9;
  let isSubmitting = false;

  const state = {
    vorname: '',
    nachname: '',
    company: '',
    customerNumber: '',
    email: '',
    phone: '',
    street: '',
    zip: '',
    city: 'Hamburg',
    category: 'Elektroinstallation (Steckdosen / Schalter / Leitungen)',
    area: '',
    timeOccurred: '',
    behavior: 'Dauerhaft (durchgehend vorhanden)',
    breakers: 'Ja – FI / Sicherung löst sofort wieder aus',
    errorCode: '',
    symptoms: [],
    pvInverter: '',
    pvErrorCode: '',
    pvOutputStatus: 'Komplettausfall (keine Stromerzeugung, Anlage steht)',
    message: '',
    files: [],
    locationChoice: 'new',
    callbackRequested: 'Ja',
    contactWay: 'Telefon',
    callbackTime: 'Schnellstmöglich',
    datenschutz: false
  };

  // Step 1 Inputs
  const inputVorname = document.getElementById('stoerungVorname');
  const inputNachname = document.getElementById('stoerungNachname');
  const inputCompany = document.getElementById('stoerungCompany');
  const inputCustomerNumber = document.getElementById('stoerungCustomerNumber');
  const inputEmail = document.getElementById('stoerungEmail');
  const inputPhone = document.getElementById('stoerungPhone');
  const inputStreet = document.getElementById('stoerungStreet');
  const inputZip = document.getElementById('stoerungZip');
  const inputCity = document.getElementById('stoerungCity');
  const inputSaveAddress = document.getElementById('stoerungSaveAddress');
  const btnLoadSavedAddress = document.getElementById('btnLoadSavedAddress');

  // Step 2 Inputs
  const selectArea = document.getElementById('stoerungArea');
  const selectTimeOccurred = document.getElementById('stoerungTimeOccurred');
  const pvDiagnosticBlock = document.getElementById('pvDiagnosticBlock');

  // Step 3 Inputs
  const inputErrorCode = document.getElementById('stoerungErrorCode');
  const inputPvInverter = document.getElementById('stoerungPvInverter');
  const inputPvErrorCode = document.getElementById('stoerungPvErrorCode');
  const inputMessage = document.getElementById('stoerungMessage');
  const inputDatenschutz = document.getElementById('stoerungDatenschutz');
  const callbackTimeWrap = document.getElementById('callbackTimeWrap');
  const selectCallbackTime = document.getElementById('stoerungCallbackTime');

  // Dropzone Elements
  const dropzone = document.getElementById('stoerungDropzone');
  const fileInput = document.getElementById('stoerungFileInput');
  const fileList = document.getElementById('stoerungFileList');

  // Errors
  const errVorname = document.getElementById('errStoerungVorname');
  const errNachname = document.getElementById('errStoerungNachname');
  const errEmail = document.getElementById('errStoerungEmail');
  const errPhone = document.getElementById('errStoerungPhone');
  const errStreet = document.getElementById('errStoerungStreet');
  const errZip = document.getElementById('errStoerungZip');
  const errCity = document.getElementById('errStoerungCity');
  const errCategory = document.getElementById('errStoerungCategory');
  const errArea = document.getElementById('errStoerungArea');
  const errTimeOccurred = document.getElementById('errStoerungTimeOccurred');
  const errMessage = document.getElementById('errStoerungMessage');
  const errDatenschutz = document.getElementById('errStoerungDatenschutz');

  // Helper functions
  function showAlert(msg) {
    if (!alertBox) return;
    alertBox.textContent = msg;
    alertBox.style.display = 'block';
  }

  function hideAlert() {
    if (!alertBox) return;
    alertBox.style.display = 'none';
    alertBox.textContent = '';
  }

  function setFieldError(inputEl, errEl, msg) {
    if (inputEl) inputEl.classList.add('has-error');
    if (errEl) {
      errEl.textContent = msg;
      errEl.classList.add('visible');
    }
  }

  function clearFieldError(inputEl, errEl) {
    if (inputEl) inputEl.classList.remove('has-error');
    if (errEl) {
      errEl.textContent = '';
      errEl.classList.remove('visible');
    }
  }

  // Clear errors on input
  if (inputVorname) inputVorname.addEventListener('input', () => clearFieldError(inputVorname, errVorname));
  if (inputNachname) inputNachname.addEventListener('input', () => clearFieldError(inputNachname, errNachname));
  if (inputEmail) inputEmail.addEventListener('input', () => clearFieldError(inputEmail, errEmail));
  if (inputPhone) inputPhone.addEventListener('input', () => clearFieldError(inputPhone, errPhone));
  if (inputStreet) inputStreet.addEventListener('input', () => clearFieldError(inputStreet, errStreet));
  if (inputZip) inputZip.addEventListener('input', () => clearFieldError(inputZip, errZip));
  if (inputCity) inputCity.addEventListener('input', () => clearFieldError(inputCity, errCity));
  if (selectArea) selectArea.addEventListener('change', () => clearFieldError(selectArea, errArea));
  if (selectTimeOccurred) selectTimeOccurred.addEventListener('change', () => clearFieldError(selectTimeOccurred, errTimeOccurred));
  if (inputMessage) inputMessage.addEventListener('input', () => clearFieldError(inputMessage, errMessage));
  if (inputDatenschutz) inputDatenschutz.addEventListener('change', () => clearFieldError(null, errDatenschutz));

  // Amazon-style Saved Address
  const STORAGE_KEY = 'malawko_saved_address';
  function checkSavedAddress() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && btnLoadSavedAddress) {
        btnLoadSavedAddress.style.display = 'inline-flex';
      }
    } catch (e) {}
  }

  function loadSavedAddress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.vorname && inputVorname && !inputVorname.value) inputVorname.value = data.vorname;
      if (data.nachname && inputNachname && !inputNachname.value) inputNachname.value = data.nachname;
      if (data.phone && inputPhone && !inputPhone.value) inputPhone.value = data.phone;
      if (data.email && inputEmail && !inputEmail.value) inputEmail.value = data.email;
      if (data.company && inputCompany && !inputCompany.value) inputCompany.value = data.company;
      if (data.customerNumber && inputCustomerNumber && !inputCustomerNumber.value) inputCustomerNumber.value = data.customerNumber;
      if (data.street && inputStreet) inputStreet.value = data.street;
      if (data.zip && inputZip) inputZip.value = data.zip;
      if (data.city && inputCity) inputCity.value = data.city;

      if (btnLoadSavedAddress) {
        const span = btnLoadSavedAddress.querySelector('span');
        if (span) span.textContent = 'Adresse geladen!';
        setTimeout(() => {
          if (span) span.textContent = 'Gespeicherte Adresse laden';
        }, 2000);
      }
    } catch (e) {}
  }

  if (btnLoadSavedAddress) {
    btnLoadSavedAddress.addEventListener('click', (e) => {
      e.preventDefault();
      loadSavedAddress();
    });
  }
  checkSavedAddress();

  // Callback visibility toggle
  window.toggleCallbackTime = function(show) {
    if (callbackTimeWrap) {
      callbackTimeWrap.style.display = show ? 'block' : 'none';
    }
  };

  // Symptoms: If "Keine Auffälligkeiten" is checked, uncheck others and vice-versa
  const symNone = document.getElementById('symNone');
  const otherSymptoms = document.querySelectorAll('input[name="symptoms"]:not(#symNone)');
  if (symNone) {
    symNone.addEventListener('change', () => {
      if (symNone.checked) {
        otherSymptoms.forEach(cb => cb.checked = false);
      }
    });
    otherSymptoms.forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.checked && symNone) {
          symNone.checked = false;
        }
      });
    });
  }

  // Tracker & Navigation
  function updateTracker(step) {
    for (let i = 1; i <= totalSteps; i++) {
      const ind = indicators[i];
      if (!ind) continue;
      ind.classList.remove('active', 'completed');
      if (i === step) ind.classList.add('active');
      else if (i < step) ind.classList.add('completed');
    }
    for (let i = 1; i < totalSteps; i++) {
      const c = connectors[i];
      if (!c) continue;
      if (step > i) c.classList.add('active');
      else c.classList.remove('active');
    }
  }

  const STEP_TITLES = {
    1: 'Anlage', 2: 'Bereich', 3: 'Zeit & Muster', 4: 'Sicherung',
    5: 'Fehlercode', 6: 'Auffälligkeit', 7: 'Beschreibung', 8: 'Kontakt',
    9: 'Ort & Rückruf'
  };
  const mobileBadgeStep = document.getElementById('stoerungMobileBadgeStep');
  const mobileBadgeTitle = document.getElementById('stoerungMobileBadgeTitle');

  function updateNav(step) {
    if (btnBack) {
      btnBack.disabled = (step === 1);
      btnBack.style.visibility = (step === 1) ? 'hidden' : 'visible';
    }
    if (stepCounter) stepCounter.textContent = 'Schritt ' + step + ' von ' + totalSteps;
    if (mobileBadgeStep) mobileBadgeStep.textContent = 'Schritt ' + step + ' von ' + totalSteps;
    if (mobileBadgeTitle) mobileBadgeTitle.textContent = STEP_TITLES[step] || '';
    if (btnNext && btnNextText && btnNextIcon) {
      if (step === totalSteps) {
        btnNextText.textContent = 'Störung verbindlich melden';
        btnNextIcon.innerHTML = `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>`;
      } else {
        btnNextText.textContent = 'Weiter';
        btnNextIcon.innerHTML = `<line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>`;
      }
    }
  }

  function checkPvToggle() {
    if (!pvDiagnosticBlock) return;
    const checkedCat = document.querySelector('input[name="category"]:checked');
    const catVal = checkedCat ? checkedCat.value : state.category;
    const isPv = (catVal || '').toLowerCase().includes('photovoltaik');
    pvDiagnosticBlock.style.display = isPv ? 'block' : 'none';
  }

  function goToStep(targetStep) {
    if (targetStep < 1 || targetStep > totalSteps) return;
    hideAlert();

    Object.values(panels).forEach(panel => {
      if (panel) {
        panel.style.display = 'none';
        panel.classList.remove('active');
      }
    });

    const targetPanel = panels[targetStep];
    if (targetPanel) {
      targetPanel.style.display = 'block';
      targetPanel.classList.add('active');
    }

    if (targetStep === 5) {
      checkPvToggle();
    }

    currentStep = targetStep;
    updateTracker(currentStep);
    updateNav(currentStep);

    const rect = card.getBoundingClientRect();
    if (rect.top < 60 || rect.top > window.innerHeight) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Category (Step 1) Radio
  document.querySelectorAll('input[name="category"]').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) {
        state.category = cb.value;
        clearFieldError(null, errCategory);
        checkPvToggle();
      }
    });
  });
  // Init state.category from checked radio
  const chk = document.querySelector('input[name="category"]:checked');
  if (chk) state.category = chk.value;

  // Location Choice (Step 9): toggle felder
  function updateLocationVisibility() {
    const sel = document.querySelector('input[name="locationChoice"]:checked');
    const val = sel ? sel.value : 'new';
    state.locationChoice = val;
    if (val === 'saved') {
      if (locationFields) locationFields.style.display = 'none';
      if (savedAddressHint) savedAddressHint.style.display = 'flex';
      // Auto-load saved address into hidden inputs
      try {
        const raw = localStorage.getItem('malawko_saved_address');
        if (raw) {
          const data = JSON.parse(raw);
          if (inputStreet && data.street) inputStreet.value = data.street;
          if (inputZip && data.zip) inputZip.value = data.zip;
          if (inputCity && data.city) inputCity.value = data.city;
          const txt = document.getElementById('stoerungSavedAddressText');
          if (txt) txt.textContent = (data.street || '') + ', ' + (data.zip || '') + ' ' + (data.city || '');
        }
      } catch (e) {}
    } else {
      if (locationFields) locationFields.style.display = 'block';
      if (savedAddressHint) savedAddressHint.style.display = 'none';
    }
  }
  document.querySelectorAll('input[name="locationChoice"]').forEach(cb => {
    cb.addEventListener('change', updateLocationVisibility);
  });
  // Show "saved" option only if there is a saved address
  try {
    const hasSaved = !!localStorage.getItem('malawko_saved_address');
    if (!hasSaved) {
      const savedOption = document.getElementById('stoerungLocationSaved');
      if (savedOption && savedOption.parentElement) savedOption.parentElement.style.display = 'none';
    }
  } catch (e) {}

  // Callback toggles (Step 9)
  function updateCallbackVisibility() {
    const sel = document.querySelector('input[name="callbackRequested"]:checked');
    const val = sel ? sel.value : 'Ja';
    state.callbackRequested = val;
    const show = (val === 'Ja');
    if (callbackWayGroup) callbackWayGroup.style.display = show ? 'block' : 'none';
    if (callbackTimeGroup) callbackTimeGroup.style.display = show ? 'block' : 'none';
  }
  document.querySelectorAll('input[name="callbackRequested"]').forEach(cb => {
    cb.addEventListener('change', updateCallbackVisibility);
  });
  document.querySelectorAll('input[name="contactWay"]').forEach(cb => {
    cb.addEventListener('change', () => { if (cb.checked) state.contactWay = cb.value; });
  });

  // Step 3 File Upload Dropzone
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
      }
    });

    ['dragenter', 'dragover'].forEach(evt => {
      dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(evt => {
      dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files) {
        handleFiles(fileInput.files);
      }
    });
  }

  function handleFiles(fileListObj) {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf', 'image/heic', '.jpg', '.jpeg', '.png', '.pdf', '.heic'];
    const maxSizeBytes = 15 * 1024 * 1024; // 15MB

    Array.from(fileListObj).forEach(file => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!allowed.includes(file.type) && !allowed.includes(ext)) {
        showAlert(`Format nicht unterstützt: ${file.name} (Erlaubt: JPG, PNG, PDF, HEIC)`);
        return;
      }
      if (file.size > maxSizeBytes) {
        showAlert(`Datei zu groß: ${file.name} (Maximal 15 MB erlaubt)`);
        return;
      }
      if (!state.files.some(f => f.name === file.name && f.size === file.size)) {
        state.files.push(file);
      }
    });
    renderFileList();
  }

  function renderFileList() {
    if (!fileList) return;
    fileList.innerHTML = '';
    state.files.forEach((file, index) => {
      const item = document.createElement('div');
      item.className = 'stoerung-file-item';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'stoerung-file-name';
      const sizeKb = (file.size / 1024).toFixed(0);
      nameSpan.textContent = `📎 ${file.name} (${sizeKb} KB)`;

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'stoerung-file-remove';
      removeBtn.innerHTML = '&times; Entfernen';
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.files.splice(index, 1);
        renderFileList();
      });

      item.appendChild(nameSpan);
      item.appendChild(removeBtn);
      fileList.appendChild(item);
    });
  }

  // Validation for 9-step form
  function validateStep(step) {
    let isValid = true;
    hideAlert();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (step === 1) {
      const chk = document.querySelector('input[name="category"]:checked');
      state.category = chk ? chk.value : '';
      if (!state.category) {
        setFieldError(null, errCategory, 'Bitte wählen Sie die Art der betroffenen Anlage aus.');
        showAlert('Bitte wählen Sie eine Anlage.');
        isValid = false;
      } else {
        clearFieldError(null, errCategory);
      }
    } else if (step === 2) {
      state.area = selectArea ? selectArea.value : '';
      if (!state.area) {
        setFieldError(selectArea, errArea, 'Bitte wählen Sie den betroffenen Bereich aus.');
        showAlert('Bitte wählen Sie einen Bereich.');
        isValid = false;
      } else {
        clearFieldError(selectArea, errArea);
      }
    } else if (step === 3) {
      state.timeOccurred = selectTimeOccurred ? selectTimeOccurred.value : '';
      const rb = document.querySelector('input[name="behavior"]:checked');
      state.behavior = rb ? rb.value : state.behavior;
      if (!state.timeOccurred) {
        setFieldError(selectTimeOccurred, errTimeOccurred, 'Bitte wählen Sie den Zeitpunkt aus.');
        showAlert('Bitte Zeitpunkt wählen.');
        isValid = false;
      } else {
        clearFieldError(selectTimeOccurred, errTimeOccurred);
      }
    } else if (step === 4) {
      const rb = document.querySelector('input[name="breakers"]:checked');
      state.breakers = rb ? rb.value : state.breakers;
      // keine Pflicht
    } else if (step === 5) {
      state.errorCode = inputErrorCode ? inputErrorCode.value.trim() : '';
      state.pvInverter = inputPvInverter ? inputPvInverter.value.trim() : '';
      state.pvErrorCode = inputPvErrorCode ? inputPvErrorCode.value.trim() : '';
      const rb = document.querySelector('input[name="pvOutputStatus"]:checked');
      state.pvOutputStatus = rb ? rb.value : state.pvOutputStatus;
      // optional
    } else if (step === 6) {
      state.symptoms = [];
      document.querySelectorAll('input[name="symptoms"]:checked').forEach(cb => state.symptoms.push(cb.value));
      // optional
    } else if (step === 7) {
      state.message = inputMessage ? inputMessage.value.trim() : '';
      if (!state.message || state.message.length < 15) {
        setFieldError(inputMessage, errMessage, 'Bitte beschreiben Sie das Problem genauer (mindestens 15 Zeichen).');
        showAlert('Beschreibung ist zu kurz — mindestens 15 Zeichen.');
        isValid = false;
      } else {
        clearFieldError(inputMessage, errMessage);
      }
    } else if (step === 8) {
      state.vorname = inputVorname ? inputVorname.value.trim() : '';
      state.nachname = inputNachname ? inputNachname.value.trim() : '';
      state.company = inputCompany ? inputCompany.value.trim() : '';
      state.customerNumber = inputCustomerNumber ? inputCustomerNumber.value.trim() : '';
      state.email = inputEmail ? inputEmail.value.trim() : '';
      state.phone = inputPhone ? inputPhone.value.trim() : '';

      if (!state.vorname || state.vorname.length < 2) {
        setFieldError(inputVorname, errVorname, 'Bitte Vornamen eingeben.');
        isValid = false;
      } else clearFieldError(inputVorname, errVorname);

      if (!state.nachname || state.nachname.length < 2) {
        setFieldError(inputNachname, errNachname, 'Bitte Nachnamen eingeben.');
        isValid = false;
      } else clearFieldError(inputNachname, errNachname);

      if (!state.email || !emailRegex.test(state.email)) {
        setFieldError(inputEmail, errEmail, 'Bitte gültige E-Mail eingeben.');
        isValid = false;
      } else clearFieldError(inputEmail, errEmail);

      const cleanPhone = state.phone.replace(/[^0-9+]/g, '');
      if (!state.phone || cleanPhone.length < 6) {
        setFieldError(inputPhone, errPhone, 'Bitte Telefonnummer eingeben.');
        isValid = false;
      } else clearFieldError(inputPhone, errPhone);

      if (!isValid) showAlert('Bitte alle Pflichtfelder Ihrer Kontaktdaten ausfüllen.');
    } else if (step === 9) {
      const locSel = document.querySelector('input[name="locationChoice"]:checked');
      state.locationChoice = locSel ? locSel.value : 'new';

      if (state.locationChoice === 'new') {
        state.street = inputStreet ? inputStreet.value.trim() : '';
        state.zip = inputZip ? inputZip.value.trim() : '';
        state.city = inputCity ? inputCity.value.trim() : '';

        if (!state.street || state.street.length < 3) {
          setFieldError(inputStreet, errStreet, 'Straße fehlt.');
          isValid = false;
        } else clearFieldError(inputStreet, errStreet);

        if (!state.zip || state.zip.length < 4) {
          setFieldError(inputZip, errZip, 'PLZ fehlt.');
          isValid = false;
        } else clearFieldError(inputZip, errZip);

        if (!state.city || state.city.length < 2) {
          setFieldError(inputCity, errCity, 'Ort fehlt.');
          isValid = false;
        } else clearFieldError(inputCity, errCity);
      }

      const rbCb = document.querySelector('input[name="callbackRequested"]:checked');
      state.callbackRequested = rbCb ? rbCb.value : 'Ja';
      const rbCw = document.querySelector('input[name="contactWay"]:checked');
      state.contactWay = rbCw ? rbCw.value : 'Telefon';
      state.callbackTime = (selectCallbackTime && selectCallbackTime.value) ? selectCallbackTime.value : 'Schnellstmöglich';
      state.datenschutz = inputDatenschutz ? inputDatenschutz.checked : false;

      if (!state.datenschutz) {
        setFieldError(null, errDatenschutz, 'Bitte in Datenschutz einwilligen.');
        isValid = false;
      } else clearFieldError(null, errDatenschutz);

      if (!isValid) showAlert('Bitte Störungsort angeben und in Datenschutz einwilligen.');
    }

    return isValid;
  }

  // Navigation Event Handlers
  if (btnNext) {
    btnNext.addEventListener('click', (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      if (!validateStep(currentStep)) return;

      if (currentStep < totalSteps) {
        goToStep(currentStep + 1);
      } else {
        submitStoerungReport();
      }
    });
  }

  if (btnBack) {
    btnBack.addEventListener('click', (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      if (currentStep > 1) {
        goToStep(currentStep - 1);
      }
    });
  }

  // Submission
  function submitStoerungReport() {
    isSubmitting = true;
    btnNext.disabled = true;
    btnNextText.textContent = 'Wird übermittelt...';

    // Save address to localStorage if checked (Amazon-style)
    if (inputSaveAddress && inputSaveAddress.checked) {
      try {
        const addressToSave = {
          vorname: state.vorname,
          nachname: state.nachname,
          company: state.company,
          customerNumber: state.customerNumber,
          phone: state.phone,
          email: state.email,
          street: state.street,
          zip: state.zip,
          city: state.city
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(addressToSave));
        if (btnLoadSavedAddress) btnLoadSavedAddress.style.display = 'inline-flex';
      } catch (e) {}
    }

    const timestamp = new Date().toISOString();
    const formattedDate = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
    const refId = '#ST-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    const isPvCategory = (state.category || '').toLowerCase().includes('photovoltaik');

    const payload = {
      subject: `Störungsmeldung ${refId}: ${state.category} – ${state.vorname} ${state.nachname} (${state.city})`,
      referenceId: refId,
      submittedAt: timestamp,
      formattedDate: formattedDate,
      recipient: 'kontakt@elektrotechnik-malawko.de',
      customer: {
        name: `${state.vorname} ${state.nachname}`,
        vorname: state.vorname,
        nachname: state.nachname,
        company: state.company || 'Privatkunde',
        customerNumber: state.customerNumber || 'Nicht vorhanden',
        email: state.email,
        phone: state.phone,
        address: `${state.street}, ${state.zip} ${state.city}`,
        street: state.street,
        zip: state.zip,
        city: state.city
      },
      fault: {
        category: state.category,
        area: state.area,
        timeOccurred: state.timeOccurred,
        behavior: state.behavior,
        breakersChecked: state.breakers,
        errorCode: state.errorCode || 'Keiner angegeben',
        symptoms: state.symptoms.length ? state.symptoms.join(', ') : 'Keine Auffälligkeiten',
        photovoltaik: isPvCategory ? {
          inverter: state.pvInverter || 'Nicht spezifiziert',
          errorCode: state.pvErrorCode || 'Keiner angegeben',
          outputStatus: state.pvOutputStatus
        } : null,
        message: state.message,
        callbackRequested: state.callbackRequested,
        callbackTime: state.callbackRequested === 'Ja' ? state.callbackTime : 'Nicht gewünscht',
        attachments: state.files.map(f => ({ name: f.name, size: f.size, type: f.type }))
      },
      privacyConsent: true
    };

    console.log('--- STÖRUNGSMELDUNG AN kontakt@elektrotechnik-malawko.de ---', payload);

    // Prepare mailto link for direct customer transmission or copy
    const mailSubject = encodeURIComponent(`Störungsmeldung ${refId}: ${state.category}`);
    let mailBody = `STÖRUNGSMELDUNG – ELEKTROTECHNIK MALAWKO GMBH\n` +
      `===================================================\n` +
      `Ticket-Nr: ${refId}\n` +
      `Datum/Zeit: ${formattedDate}\n\n` +
      `1. KUNDENDATEN & EINSATZORT\n` +
      `---------------------------------------------------\n` +
      `Name: ${state.vorname} ${state.nachname}\n` +
      `Firma: ${state.company || '–'}\n` +
      `Kundennummer: ${state.customerNumber || '–'}\n` +
      `Telefon: ${state.phone}\n` +
      `E-Mail: ${state.email}\n` +
      `Schadenort: ${state.street}, ${state.zip} ${state.city}\n\n` +
      `2. ANLAGE & DIAGNOSEDATEN\n` +
      `---------------------------------------------------\n` +
      `Art der Anlage: ${state.category}\n` +
      `Betroffener Bereich: ${state.area}\n` +
      `Erstmals aufgetreten: ${state.timeOccurred}\n` +
      `Fehler-Verhalten: ${state.behavior}\n` +
      `Sicherungen / FI geprüft: ${state.breakers}\n` +
      `Auffälligkeiten / Symptome: ${state.symptoms.length ? state.symptoms.join(', ') : 'Keine'}\n` +
      `Fehlercode / Display: ${state.errorCode || 'Keiner'}\n`;

    if (payload.fault.photovoltaik) {
      mailBody += `\nPV-Spezifikationen:\n` +
        `- Wechselrichter: ${payload.fault.photovoltaik.inverter}\n` +
        `- Fehlercode: ${payload.fault.photovoltaik.errorCode}\n` +
        `- Art des Ausfalls: ${payload.fault.photovoltaik.outputStatus}\n`;
    }

    mailBody += `\n3. BESCHREIBUNG DER STÖRUNG\n` +
      `---------------------------------------------------\n` +
      `${state.message}\n\n` +
      `4. RÜCKRUF & ANHÄNGE\n` +
      `---------------------------------------------------\n` +
      `Rückruf gewünscht: ${state.callbackRequested === 'Ja' ? `Ja (${state.callbackTime || 'Schnellstmöglich'})` : 'Nein (rein per E-Mail)'}\n` +
      `Fotos angehängt: ${state.files.length} Datei(en)\n` +
      `Datenschutz-Einwilligung: Erteilt\n`;

    if (btnMailtoSummary) {
      btnMailtoSummary.href = `mailto:kontakt@elektrotechnik-malawko.de?subject=${mailSubject}&body=${encodeURIComponent(mailBody)}`;
    }

    // Try posting to /api/contact if available
    try {
      if (typeof fetch === 'function') {
        fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});
      }
    } catch (e) {}

    setTimeout(() => {
      form.style.display = 'none';
      const progressWrap = card.querySelector('.stoerung-progress-tracker');
      if (progressWrap) progressWrap.style.display = 'none';

      if (confirmationPanel) {
        confirmationPanel.style.display = 'block';

        const confRef = document.getElementById('stoerungConfirmRef');
        const confCat = document.getElementById('stoerungConfirmCategory');
        const confArea = document.getElementById('stoerungConfirmArea');
        const confAddr = document.getElementById('stoerungConfirmAddress');
        const confContact = document.getElementById('stoerungConfirmContact');
        const confBehavior = document.getElementById('stoerungConfirmBehavior');
        const confBreakers = document.getElementById('stoerungConfirmBreakers');
        const confCallback = document.getElementById('stoerungConfirmCallback');
        const confPvRow = document.getElementById('stoerungConfirmRowPv');
        const confPv = document.getElementById('stoerungConfirmPv');

        if (confRef) confRef.textContent = refId;
        if (confCat) confCat.textContent = state.category;
        if (confArea) confArea.textContent = state.area;
        if (confAddr) confAddr.textContent = `${state.street}, ${state.zip} ${state.city}`;
        if (confContact) confContact.textContent = `${state.vorname} ${state.nachname} (${state.phone})`;
        if (confBehavior) confBehavior.textContent = state.behavior.split(' (')[0];
        if (confBreakers) confBreakers.textContent = state.breakers.split(' – ')[0] || state.breakers;
        if (confCallback) {
          confCallback.textContent = state.callbackRequested === 'Ja' ? `Ja (${state.callbackTime || 'Schnellstmöglich'})` : 'Nein (E-Mail)';
        }

        if (confPvRow && confPv) {
          if (isPvCategory) {
            confPvRow.style.display = 'flex';
            confPv.textContent = `${state.pvInverter || 'PV-Anlage'} (${state.pvOutputStatus.split(' (')[0]})`;
          } else {
            confPvRow.style.display = 'none';
          }
        }
      }

      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      isSubmitting = false;
      btnNext.disabled = false;
      btnNextText.textContent = 'Störung verbindlich melden';
    }, 600);
  }

  // Reset handler
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      form.reset();
      state.files = [];
      renderFileList();
      hideAlert();

      if (confirmationPanel) confirmationPanel.style.display = 'none';
      const progressWrap = card.querySelector('.stoerung-progress-tracker');
      if (progressWrap) progressWrap.style.display = 'flex';

      form.style.display = 'block';
      goToStep(1);
    });
  }
}


function initSolutionsSelector() {
  const container = document.getElementById('solutionsInteractiveGrid');
  if (!container) return;

  const solutionsData = (window.pageSolutionsData && Object.keys(window.pageSolutionsData).length > 0) ? window.pageSolutionsData : {
    verteiler: {
      title: 'Verteilertechnik',
      desc: 'Planung, Aufbau und Modernisierung von Verteilungen – für eine sichere und zuverlässige Stromversorgung in Wohn- und Gewerbegebäuden.',
      image: 'assets/images/client/solution-elektro.jpg',
      imageAlt: 'Fachgerecht verdrahteter Elektro-Verteilerkasten mit Sicherungsautomaten',
      iconSvg: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>',
      checklist: [
        'Planung und Dimensionierung',
        'Fachgerechte Installation',
        'Erweiterung bestehender Anlagen',
        'Sichere und normgerechte Ausführung'
      ]
    },
    beleuchtung: {
      title: 'Beleuchtungsinstallation',
      desc: 'Individuelle Lichtplanung und energieeffiziente LED-Beleuchtungssysteme für stimmungsvolle Wohnräume und funktionale Arbeitsbereiche.',
      image: 'assets/images/client/solution-beleuchtung.jpg',
      imageAlt: 'Moderne energieeffiziente Deckenbeleuchtung und LED-Lichtkonzepte',
      iconSvg: '<path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6h8c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z"></path>',
      checklist: [
        'Individuelle Lichtplanung & Beratung',
        'Moderne LED- & Dimm-Konzepte',
        'Stimmungsvolle Akzentbeleuchtung',
        'Fachgerechte Decken- & Wandeinbauten'
      ]
    },
    steckdosen: {
      title: 'Steckdosen & Schalter',
      desc: 'Praxisgerechte Platzierung und hochwertige Design-Schalterprogramme für maximale Sicherheit und zeitlose Ästhetik in jedem Raum.',
      image: 'assets/images/service-sockets-2x.jpg',
      imageAlt: 'Minimalistische Schuko-Steckdosen und Lichtschalter an matter Wand',
      iconSvg: '<rect x="5" y="2" width="14" height="20" rx="3"></rect><circle cx="12" cy="8" r="1.5"></circle><circle cx="12" cy="16" r="1.5"></circle>',
      checklist: [
        'Bedarfsgerechte Positionierung',
        'Hochwertige Schalterprogramme',
        'Integrierte USB- & Netzwerkdosen',
        'Berührungsschutz & Kindersicherung'
      ]
    },
    smarthome: {
      title: 'Smart Home & KNX',
      desc: 'Intelligente Gebäudesteuerung vernetzt Licht, Heizung, Beschattung und Sicherheit zu einem harmonischen, energieeffizienten Gesamtsystem.',
      image: 'assets/images/client/solution-smarthome.jpg',
      imageAlt: 'Wandmontiertes Smart Home Touch-Panel zur intelligenten Gebäudesteuerung',
      iconSvg: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
      checklist: [
        'Herstellerunabhängige KNX-Planung',
        'Szenen für Beleuchtung & Beschattung',
        'Intuitive Steuerung via Touch & Smartphone',
        'Zukunftssicher und flexibel erweiterbar'
      ]
    },
    emobilitaet: {
      title: 'Wallbox & E-Mobilität',
      desc: 'Zukunftssichere Ladelösungen für private Haushalte, Mehrfamilienhäuser und gewerbliche Fuhrparks inklusive Lastmanagement und Netzanmeldung.',
      image: 'assets/images/client/solution-wallbox.jpg',
      imageAlt: 'Moderne Wallbox-Ladestation an einer Wohngebäude-Außenwand',
      iconSvg: '<rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M7 15h10"></path><path d="M10 9l4 6"></path>',
      checklist: [
        'Installation von 11 kW & 22 kW Wallboxen',
        'Dynamisches Lastmanagement',
        'Fachgerechte Anmeldung beim Netzbetreiber',
        'Optimierung mit Photovoltaik-Eigenstrom'
      ]
    },
    sicherheit: {
      title: 'Sicherheitstechnik',
      desc: 'Geprüfte Schutzsysteme vom funkvernetzten Rauchwarnmelder über Bewegungssensoren bis zum ganzheitlichen Überspannungs- und FI-Schutz.',
      image: 'assets/images/service-security-2x.jpg',
      imageAlt: 'Deckenmontierter smarter Rauchmelder und Bewegungssensor',
      iconSvg: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>',
      checklist: [
        'Vernetzte Rauch- & Hitzemelder',
        'Präzise Bewegungs- & Präsenzmelder',
        'Modernster Überspannungs- & Blitzschutz',
        'Normgerechte FI/RCD-Schutzschalter'
      ]
    }
  };

  const tabButtons = container.querySelectorAll('.solutions-tab-btn');
  const photoImg = document.getElementById('solutionsPhotoImg');
  const detailTitle = document.getElementById('detailCardTitle');
  const detailDesc = document.getElementById('detailCardDesc');
  const detailChecklist = document.getElementById('detailChecklist');
  const detailIconWrap = document.getElementById('detailCardIconWrap');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-solution');
      const data = solutionsData[key];
      if (!data) return;

      // Update button states
      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Update photo with smooth crossfade
      if (photoImg) {
        photoImg.style.opacity = '0.35';
        setTimeout(() => {
          photoImg.src = data.image;
          photoImg.alt = data.imageAlt;
          photoImg.style.opacity = '1';
        }, 120);
      }

      // Update detail card
      if (detailTitle) detailTitle.textContent = data.title;
      if (detailDesc) detailDesc.textContent = data.desc;
      if (detailIconWrap) {
        detailIconWrap.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">${data.iconSvg}</svg>`;
      }

      // Update checklist
      if (detailChecklist) {
        detailChecklist.innerHTML = data.checklist.map(item => `
          <li class="detail-check-item">
            <span class="check-badge" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
            <span>${escapeHtml(item)}</span>
          </li>
        `).join('');
      }
    });
  });
}






/**
 * Auto Scroll Reveal for Headings, Buttons, Cards, and Sections
 * Makes the entire website feel lively, modern, and engaging.
 */
function initScrollReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const selectors = [
    '.section-badge-inline',
    '.service-intro-badge',
    '.service-intro-title',
    '.service-intro-desc',
    '.service-offerings-badge',
    '.service-offerings-title',
    '.service-offerings-subtitle',
    '.solutions-detail-badge',
    '.solutions-detail-title',
    '.solutions-detail-subtitle',
    '.project-steps-badge',
    '.project-steps-title',
    '.project-steps-subtitle',
    '.einsatzgebiet-title',
    '.einsatzgebiet-desc',
    '.cta-banner-tag',
    '.cta-banner-headline',
    '.cta-banner-actions',
    '.section-header',
    '.why-us-content',
    '.contact-header',
    '.contact-form-card',
    '.service-intro-left .btn-primary-orange',
    '.solutions-detail-card .btn-primary-orange',
    '.offering-card',
    '.step-process-card',
    '.service-benefit-item',
    '.einsatzgebiet-feature-card',
    '.service-intro-right',
    '.solutions-interactive-grid',
    '.einsatzgebiet-map-wrapper',
    '.contact-info-card'
  ];

  const gridSelectors = [
    '.service-offerings-grid',
    '.project-steps-grid',
    '.service-intro-benefits',
    '.einsatzgebiet-features',
    '.contact-cards-grid'
  ];

  gridSelectors.forEach(gridSel => {
    document.querySelectorAll(gridSel).forEach(grid => {
      Array.from(grid.children).forEach((child, idx) => {
        child.classList.add('reveal-delay-' + ((idx % 6) + 1));
      });
    });
  });

  const candidates = document.querySelectorAll(selectors.join(', '));
  if (!candidates.length) return;

  const toObserve = [];
  candidates.forEach(el => {
    if (
      el.closest('.service-hero-section') ||
      el.closest('.hero-section') ||
      el.closest('.contact-hero-section') ||
      el.closest('.projects-hero-section')
    ) {
      return;
    }
    el.classList.add('reveal-on-scroll');
    toObserve.push(el);
  });

  if (!toObserve.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    toObserve.forEach(el => observer.observe(el));
  } else {
    toObserve.forEach(el => el.classList.add('is-revealed'));
  }
}


/**
 * Homepage Hero Ken Burns Slider
 */
function initHomeHeroSlider() {
  const wrapper = document.querySelector('.hero-slider-wrapper');
  if (!wrapper) return;

  const slides = wrapper.querySelectorAll('.hero-slide');
  const dots = wrapper.querySelectorAll('.hero-slider-dot');
  if (slides.length <= 1) return;

  let currentIndex = 0;
  let intervalId = null;
  const slideDuration = 7000; // Exactly 7s per slide as requested

  function goToSlide(index) {
    if (index === currentIndex) return;

    // Remove active from current
    slides[currentIndex].classList.remove('active');
    if (dots[currentIndex]) {
      dots[currentIndex].classList.remove('active');
      dots[currentIndex].setAttribute('aria-selected', 'false');
    }

    // Set new index
    currentIndex = (index + slides.length) % slides.length;

    // Add active to new
    slides[currentIndex].classList.add('active');
    if (dots[currentIndex]) {
      dots[currentIndex].classList.add('active');
      dots[currentIndex].setAttribute('aria-selected', 'true');
    }
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function startAutoplay() {
    stopAutoplay();
    intervalId = setInterval(nextSlide, slideDuration);
  }

  function stopAutoplay() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  // Dot click handlers
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-slide'), 10);
      if (!isNaN(idx)) {
        goToSlide(idx);
        startAutoplay();
      }
    });
  });

  // Start autoplay (rotates exactly every 7s)
  startAutoplay();
}

/**
 * Interactive Callback Request Modal (Rückruf anfordern)
 */
function getCallbackModalMarkup() {
  return `
    <div class="callback-modal-backdrop" data-close-callback></div>
    <div class="callback-modal-dialog">
      <button type="button" class="callback-modal-close" data-close-callback aria-label="Dialog schließen">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div class="callback-modal-header">
        <div class="callback-badge">
          <span class="badge-dash" aria-hidden="true"></span>
          <span>RÜCKRUF-SERVICE</span>
        </div>
        <h3 class="callback-modal-title" id="callbackModalTitle">Rückruf anfordern</h3>
        <p class="callback-modal-subtitle">
          Hinterlassen Sie uns kurz Ihre Kontaktdaten und Ihr Anliegen – wir rufen Sie gerne verlässlich zurück.
        </p>
      </div>

      <form id="callbackForm" class="callback-modal-form" novalidate>
        <div class="callback-form-group">
          <label for="cbName" class="callback-label">Ihr Name <span class="req-star">*</span></label>
          <input type="text" id="cbName" name="name" class="callback-input" placeholder="z. B. Max Mustermann" required autocomplete="name">
          <div class="field-error-msg" id="cbNameError" aria-live="polite"></div>
        </div>

        <div class="callback-form-group">
          <label for="cbPhone" class="callback-label">Ihre Telefonnummer <span class="req-star">*</span></label>
          <input type="tel" id="cbPhone" name="phone" class="callback-input" placeholder="z. B. 0151 12345678" required autocomplete="tel">
          <div class="field-error-msg" id="cbPhoneError" aria-live="polite"></div>
        </div>

        <div class="callback-form-group">
          <label class="callback-label">Wann passt es Ihnen am besten?</label>
          <div class="callback-time-pills" role="radiogroup" aria-label="Bevorzugte Rückrufzeit">
            <button type="button" class="callback-time-pill active" data-time="Schnellstmöglich" role="radio" aria-checked="true">Schnellstmöglich</button>
            <button type="button" class="callback-time-pill" data-time="Vormittags (08–12 Uhr)" role="radio" aria-checked="false">Vormittags (08–12 Uhr)</button>
            <button type="button" class="callback-time-pill" data-time="Nachmittags (12–17 Uhr)" role="radio" aria-checked="false">Nachmittags (12–17 Uhr)</button>
          </div>
          <input type="hidden" id="cbPreferredTime" name="preferredTime" value="Schnellstmöglich">
        </div>

        <div class="callback-form-group">
          <label for="cbReason" class="callback-label">Grund des Rückrufs <span class="req-star">*</span></label>
          <textarea id="cbReason" name="reason" class="callback-textarea" rows="3" placeholder="Worum geht es kurz? z. B. Wallbox-Installation, Zählerschrank oder PV-Anlage..." required></textarea>
          <div class="field-error-msg" id="cbReasonError" aria-live="polite"></div>
        </div>

        <div class="callback-form-group callback-checkbox-group">
          <label class="callback-checkbox-label">
            <input type="checkbox" id="cbDatenschutz" required>
            <span class="chk-text">Ich habe die <a href="/datenschutz" target="_blank">Datenschutzerklärung</a> zur Kenntnis genommen und willige in die Verarbeitung meiner Daten ein. <span class="req-star">*</span></span>
          </label>
          <div class="field-error-msg" id="cbDatenschutzError" aria-live="polite"></div>
        </div>

        <div class="callback-form-actions">
          <button type="submit" class="btn-primary-orange btn-block" id="btnSubmitCallback">
            <span>Rückruf anfordern</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 19"></polyline>
            </svg>
          </button>
        </div>
      </form>

      <!-- Confirmation state -->
      <div class="callback-success-panel" id="callbackSuccess" style="display: none;">
        <div class="callback-success-icon-wrap" aria-hidden="true">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#D9541E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h4 class="callback-success-title">Rückrufbitte erfolgreich gesendet!</h4>
        <p class="callback-success-text">
          Vielen Dank, <strong id="cbSuccessName"></strong>. Wir haben Ihre Rückrufanfrage erhalten und melden uns unter <strong id="cbSuccessPhone"></strong> bei Ihnen.
        </p>
        <button type="button" class="btn-secondary-glass btn-block" data-close-callback style="margin-top: 20px;">
          <span>Fenster schließen</span>
        </button>
      </div>
    </div>
  `;
}

function initCallbackModal() {
  function ensureModal() {
    let modal = document.getElementById('callbackModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'callbackModal';
      modal.className = 'callback-modal-overlay';
      modal.style.display = 'none';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'callbackModalTitle');
      modal.setAttribute('aria-hidden', 'true');
      modal.innerHTML = getCallbackModalMarkup();
      document.body.appendChild(modal);
      bindModalEvents(modal);
    }
    return modal;
  }

  function bindModalEvents(modal) {
    const closeBtns = modal.querySelectorAll('[data-close-callback]');
    const form = modal.querySelector('#callbackForm');
    const successPanel = modal.querySelector('#callbackSuccess');
    const timePills = modal.querySelectorAll('.callback-time-pill');
    const hiddenTimeInput = modal.querySelector('#cbPreferredTime');

    closeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
      });
    });

    // Time pills selection
    timePills.forEach(pill => {
      pill.addEventListener('click', () => {
        timePills.forEach(p => {
          p.classList.remove('active');
          p.setAttribute('aria-checked', 'false');
        });
        pill.classList.add('active');
        pill.setAttribute('aria-checked', 'true');
        if (hiddenTimeInput) {
          hiddenTimeInput.value = pill.getAttribute('data-time') || 'Schnellstmöglich';
        }
      });
    });

    // Form submission
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputName = modal.querySelector('#cbName');
        const inputPhone = modal.querySelector('#cbPhone');
        const inputReason = modal.querySelector('#cbReason');
        const chkDatenschutz = modal.querySelector('#cbDatenschutz');

        const errName = modal.querySelector('#cbNameError');
        const errPhone = modal.querySelector('#cbPhoneError');
        const errReason = modal.querySelector('#cbReasonError');
        const errDatenschutz = modal.querySelector('#cbDatenschutzError');

        let isValid = true;

        // Validate Name
        if (!inputName || !inputName.value.trim()) {
          if (inputName) inputName.classList.add('error');
          if (errName) errName.textContent = 'Bitte geben Sie Ihren Namen ein.';
          isValid = false;
        } else {
          inputName.classList.remove('error');
          if (errName) errName.textContent = '';
        }

        // Validate Phone
        if (!inputPhone) {
          isValid = false;
        } else {
          const cleanPhone = inputPhone.value.replace(/[\s\-\/\(\)]/g, '');
          if (!inputPhone.value.trim() || cleanPhone.length < 6) {
            inputPhone.classList.add('error');
            if (errPhone) errPhone.textContent = 'Bitte geben Sie eine gültige Telefonnummer an.';
            isValid = false;
          } else {
            inputPhone.classList.remove('error');
            if (errPhone) errPhone.textContent = '';
          }
        }

        // Validate Reason
        if (!inputReason || !inputReason.value.trim() || inputReason.value.trim().length < 3) {
          if (inputReason) inputReason.classList.add('error');
          if (errReason) errReason.textContent = 'Bitte nennen Sie uns kurz den Grund Ihres Rückrufs.';
          isValid = false;
        } else {
          inputReason.classList.remove('error');
          if (errReason) errReason.textContent = '';
        }

        // Validate Datenschutz
        if (!chkDatenschutz || !chkDatenschutz.checked) {
          if (errDatenschutz) errDatenschutz.textContent = 'Bitte stimmen Sie der Datenschutzerklärung zu.';
          isValid = false;
        } else {
          if (errDatenschutz) errDatenschutz.textContent = '';
        }

        if (!isValid) return;

        const submitBtn = modal.querySelector('#btnSubmitCallback');
        if (submitBtn) {
          submitBtn.disabled = true;
          const submitSpan = submitBtn.querySelector('span');
          if (submitSpan) submitSpan.textContent = 'Wird gesendet...';
        }

        const callbackPayload = {
          recipient: 'kontakt@elektrotechnik-malawko.de',
          name: inputName.value.trim(),
          phone: inputPhone.value.trim(),
          preferredTime: hiddenTimeInput ? hiddenTimeInput.value : 'Schnellstmöglich',
          reason: inputReason.value.trim(),
          timestamp: new Date().toISOString()
        };

        console.log('--- RÜCKRUF-ANFRAGE GESENDET AN kontakt@elektrotechnik-malawko.de ---', callbackPayload);

        try {
          if (typeof fetch === 'function') {
            fetch('/api/contact', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(callbackPayload)
            }).catch(() => {});
          }
        } catch (e) {}

        setTimeout(() => {
          form.style.display = 'none';
          if (successPanel) {
            const sName = modal.querySelector('#cbSuccessName');
            const sPhone = modal.querySelector('#cbSuccessPhone');
            if (sName) sName.textContent = inputName.value.trim();
            if (sPhone) sPhone.textContent = inputPhone.value.trim();
            successPanel.style.display = 'block';
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            const submitSpan = submitBtn.querySelector('span');
            if (submitSpan) submitSpan.textContent = 'Rückruf anfordern';
          }
        }, 500);
      });
    }
  }

  function openModal() {
    const modal = ensureModal();
    modal.style.display = 'flex';
    // Force layout reflow before triggering transition
    modal.offsetHeight;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    const firstInput = modal.querySelector('input:not([type="hidden"])');
    if (firstInput) setTimeout(() => firstInput.focus(), 150);
  }

  function closeModal() {
    const modal = document.getElementById('callbackModal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    setTimeout(() => {
      if (!modal.classList.contains('open')) {
        modal.style.display = 'none';
      }
    }, 300);
  }

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-open-callback], #openCallbackModal');
    if (trigger) {
      e.preventDefault();
      openModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('callbackModal');
      if (modal && modal.classList.contains('open')) {
        closeModal();
      }
    }
  });
}

/**
 * =====================================================================
 * COOKIE CONSENT & PRIVACY BANNER MANAGEMENT (DSGVO / TTDSG)
 * =====================================================================
 */
function initCookieConsent() {
  const banner = document.getElementById('cookieBanner');
  const consent = localStorage.getItem('malawko_cookie_consent');

  // Ensure persistent floating cookie trigger exists on the bottom-left
  let floatBtn = document.getElementById('cookieFloatingBtn');
  if (!floatBtn) {
    floatBtn = document.createElement('button');
    floatBtn.type = 'button';
    floatBtn.className = 'cookie-floating-btn';
    floatBtn.id = 'cookieFloatingBtn';
    floatBtn.setAttribute('aria-label', 'Cookie-Einstellungen verwalten');
    floatBtn.setAttribute('title', 'Cookie-Einstellungen');
    floatBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path>
        <path d="M8.5 8.5v.01"></path>
        <path d="M16 15.5v.01"></path>
        <path d="M12 12v.01"></path>
        <path d="M11 17v.01"></path>
        <path d="M7 13v.01"></path>
      </svg>
      <span class="cookie-floating-text">Cookies</span>
    `;
    floatBtn.onclick = openCookieBanner;
    document.body.appendChild(floatBtn);
  }

  if (!consent && banner) {
    setTimeout(() => {
      openCookieBanner();
    }, 600);
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href="#cookies"], [data-open-cookies], #cookieFloatingBtn');
    if (a) {
      e.preventDefault();
      openCookieBanner();
    }
  });
}

function openCookieBanner() {
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;
  const optExternal = document.getElementById('cookieOptExternal');
  const currentConsent = localStorage.getItem('malawko_cookie_consent');
  if (optExternal) {
    optExternal.checked = (currentConsent === 'all');
  }
  document.body.classList.add('cookie-banner-active');
  banner.style.display = 'block';
  setTimeout(() => banner.classList.add('open'), 10);

  const floatBtn = document.getElementById('cookieFloatingBtn');
  if (floatBtn) {
    floatBtn.style.opacity = '0';
    floatBtn.style.pointerEvents = 'none';
  }
}

function closeCookieBanner() {
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;
  banner.classList.remove('open');
  document.body.classList.remove('cookie-banner-active');
  setTimeout(() => {
    if (!banner.classList.contains('open')) {
      banner.style.display = 'none';
    }
  }, 350);

  const floatBtn = document.getElementById('cookieFloatingBtn');
  if (floatBtn) {
    floatBtn.style.opacity = '1';
    floatBtn.style.pointerEvents = 'auto';
  }
}

function acceptAllCookies() {
  localStorage.setItem('malawko_cookie_consent', 'all');
  closeCookieBanner();
  renderEinsatzgebietMap();
}

function acceptEssentialOnly() {
  localStorage.setItem('malawko_cookie_consent', 'essential');
  closeCookieBanner();
}

function saveCustomCookies() {
  const optExternal = document.getElementById('cookieOptExternal');
  if (optExternal && optExternal.checked) {
    acceptAllCookies();
  } else {
    acceptEssentialOnly();
  }
}

function acceptExternalMedia() {
  localStorage.setItem('malawko_cookie_consent', 'all');
  closeCookieBanner();
  renderEinsatzgebietMap();
}

// Global exposure for direct inline calls
window.openCookieBanner = openCookieBanner;
window.closeCookieBanner = closeCookieBanner;
window.acceptAllCookies = acceptAllCookies;
window.acceptEssentialOnly = acceptEssentialOnly;
window.saveCustomCookies = saveCustomCookies;
window.acceptExternalMedia = acceptExternalMedia;

/**
 * =====================================================================
 * PROJECT IMAGE REVIEW LIGHTBOX (PROJEKTE.HTML)
 * =====================================================================
 */
let currentLightboxGallery = [];
let currentLightboxIndex = 0;

function openProjectLightbox(cardEl) {
  const lightbox = document.getElementById('imageLightbox');
  if (!lightbox) return;

  let gallery = [];
  try {
    const raw = cardEl.getAttribute('data-gallery');
    if (raw) {
      gallery = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Could not parse data-gallery:', err);
  }

  if (!gallery || gallery.length === 0) {
    const img = cardEl.querySelector('.project-card-photo');
    if (img && img.src) {
      gallery = [img.src];
    }
  }

  if (gallery.length === 0) return;

  currentLightboxGallery = gallery;
  currentLightboxIndex = 0;

  updateLightboxContent();

  lightbox.style.display = 'flex';
  setTimeout(() => {
    lightbox.classList.add('open');
    document.body.classList.add('modal-open');
  }, 10);
}

function updateLightboxContent() {
  const imgEl = document.getElementById('lightboxImg');
  const counterEl = document.getElementById('lightboxCounter');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');

  if (!imgEl || currentLightboxGallery.length === 0) return;

  const currentSrc = currentLightboxGallery[currentLightboxIndex];
  imgEl.src = currentSrc;

  if (currentLightboxGallery.length > 1) {
    if (prevBtn) prevBtn.style.display = 'flex';
    if (nextBtn) nextBtn.style.display = 'flex';
    if (counterEl) {
      counterEl.style.display = 'block';
      counterEl.textContent = `${currentLightboxIndex + 1} / ${currentLightboxGallery.length}`;
    }
  } else {
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    if (counterEl) counterEl.style.display = 'none';
  }
}

function closeImageLightbox() {
  const lightbox = document.getElementById('imageLightbox');
  if (!lightbox) return;

  lightbox.classList.remove('open');
  document.body.classList.remove('modal-open');
  setTimeout(() => {
    if (!lightbox.classList.contains('open')) {
      lightbox.style.display = 'none';
    }
  }, 250);
}

function navigateLightbox(direction) {
  if (currentLightboxGallery.length <= 1) return;
  currentLightboxIndex = (currentLightboxIndex + direction + currentLightboxGallery.length) % currentLightboxGallery.length;
  updateLightboxContent();
}

// Global exposure
window.openProjectLightbox = openProjectLightbox;
window.closeImageLightbox = closeImageLightbox;
window.navigateLightbox = navigateLightbox;

document.addEventListener('keydown', (e) => {
  const lightbox = document.getElementById('imageLightbox');
  if (!lightbox || !lightbox.classList.contains('open')) return;

  if (e.key === 'Escape') {
    closeImageLightbox();
  } else if (e.key === 'ArrowLeft') {
    navigateLightbox(-1);
  } else if (e.key === 'ArrowRight') {
    navigateLightbox(1);
  }
});
