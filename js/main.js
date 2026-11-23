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
 * Services Dropdown handling on Desktop
 */
function initServicesDropdown() {
  const dropdownTrigger = document.getElementById('servicesDropdownTrigger');
  const toggleBtn = dropdownTrigger ? (dropdownTrigger.querySelector('.dropdown-toggle-btn') || dropdownTrigger.querySelector('.dropdown-toggle')) : null;
  const dropdown = document.getElementById('servicesDropdown');

  if (!dropdownTrigger || !toggleBtn || !dropdown) return;

  let closeTimer = null;

  // Graceful hover on desktop: bridge delay prevents flickering when moving from trigger to menu
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

  // Toggle on button click for keyboard or touch accessibility
  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
    dropdownTrigger.classList.toggle('open', !isExpanded);
  });

  // Close when focus leaves the dropdown
  dropdownTrigger.addEventListener('focusout', (e) => {
    if (!dropdownTrigger.contains(e.relatedTarget)) {
      toggleBtn.setAttribute('aria-expanded', 'false');
      dropdownTrigger.classList.remove('open');
    }
  });
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
function initEinsatzgebietMap() {
  const mapContainer = document.getElementById('einsatzgebietMap');
  if (!mapContainer || typeof L === 'undefined') return;

  // Schreyerring 49, 22309 Hamburg coordinates
  const hmbLat = 53.6109;
  const hmbLng = 10.0594;

  // Center map slightly southwest so the floating top-right card leaves the Hamburg area clearly visible
  const viewCenter = [53.58, 10.03];

  try {
    const map = L.map('einsatzgebietMap', {
      center: viewCenter,
      zoom: 10,
      minZoom: 8,
      maxZoom: 14,
      scrollWheelZoom: false,
      zoomControl: false, // We'll add it in bottomleft
      attributionControl: false
    });

    // Add Esri World Light Gray Canvas tiles (clean, light, architectural, no API key required)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      attribution: 'Esri, HERE, Garmin, &copy; OpenStreetMap contributors'
    }).addTo(map);

    // City labels and road reference layer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16
    }).addTo(map);

    // Zoom controls in bottom-left corner
    L.control.zoom({
      position: 'bottomleft'
    }).addTo(map);

    // Outer service radius circle (covers Metropolregion Hamburg, Stormarn, Pinneberg, Segeberg, Harburg Umland ~35 km)
    L.circle([hmbLat, hmbLng], {
      radius: 35000,
      color: '#D9541E',
      weight: 1.5,
      opacity: 0.55,
      dashArray: '6, 8',
      fillColor: '#D9541E',
      fillOpacity: 0.04
    }).addTo(map);

    // Core central service radius (Hamburg & direct surroundings ~15 km)
    L.circle([hmbLat, hmbLng], {
      radius: 15000,
      color: '#D9541E',
      weight: 2,
      opacity: 0.75,
      fillColor: '#D9541E',
      fillOpacity: 0.12
    }).addTo(map);

    // Custom pulsing orange pin icon
    const customIcon = L.divIcon({
      className: 'map-pulse-marker',
      html: `
        <div class="map-pulse-halo"></div>
        <div class="map-pin-icon-wrap" title="Elektrotechnik Malawko GmbH – Schreyerring 49, 22309 Hamburg">
          <svg width="34" height="42" viewBox="0 0 24 30" fill="none">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 18 12 18s12-9 12-18c0-6.63-5.37-12-12-12z" fill="#D9541E"/>
            <circle cx="12" cy="11" r="4.5" fill="#FFFFFF"/>
          </svg>
        </div>
      `,
      iconSize: [40, 48],
      iconAnchor: [20, 42],
      popupAnchor: [0, -42]
    });

    const marker = L.marker([hmbLat, hmbLng], { icon: customIcon }).addTo(map);

    // Click popup
    marker.bindPopup(`
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px 6px; text-align: center;">
        <strong style="color: #111; font-size: 14px; display: block; margin-bottom: 2px;">Elektrotechnik Malawko GmbH</strong>
        <span style="color: #555; font-size: 12px; display: block; margin-bottom: 4px;">Schreyerring 49, 22309 Hamburg</span>
        <span style="color: #D9541E; font-size: 12px; font-weight: 700;">Zentrale Hamburg &amp; Metropolregion</span>
      </div>
    `);

  } catch (err) {
    console.error('Error initializing Einsatzgebiet map:', err);
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

  // Step Indicators & Connectors
  const indicators = {
    1: document.getElementById('stoerungStepIndicator1'),
    2: document.getElementById('stoerungStepIndicator2'),
    3: document.getElementById('stoerungStepIndicator3')
  };
  const connectors = {
    1: document.getElementById('stoerungConnector1'),
    2: document.getElementById('stoerungConnector2')
  };

  // Step panels
  const panels = {
    1: document.getElementById('stoerungStep1'),
    2: document.getElementById('stoerungStep2'),
    3: document.getElementById('stoerungStep3')
  };

  // State
  let currentStep = 1;
  const totalSteps = 3;
  let isSubmitting = false;

  const state = {
    name: '',
    company: '',
    email: '',
    phone: '',
    category: 'Stromausfall / keine Spannung',
    message: '',
    files: [],
    datenschutz: false
  };

  // Input Elements
  const inputName = document.getElementById('stoerungName');
  const inputCompany = document.getElementById('stoerungCompany');
  const inputEmail = document.getElementById('stoerungEmail');
  const inputPhone = document.getElementById('stoerungPhone');
  const inputMessage = document.getElementById('stoerungMessage');
  const inputDatenschutz = document.getElementById('stoerungDatenschutz');

  // Error Message Elements
  const errName = document.getElementById('errStoerungName');
  const errEmail = document.getElementById('errStoerungEmail');
  const errPhone = document.getElementById('errStoerungPhone');
  const errCategory = document.getElementById('errStoerungCategory');
  const errMessage = document.getElementById('errStoerungMessage');
  const errDatenschutz = document.getElementById('errStoerungDatenschutz');

  // Dropzone Elements
  const dropzone = document.getElementById('stoerungDropzone');
  const fileInput = document.getElementById('stoerungFileInput');
  const fileList = document.getElementById('stoerungFileList');

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------
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
  if (inputName) inputName.addEventListener('input', () => clearFieldError(inputName, errName));
  if (inputEmail) inputEmail.addEventListener('input', () => clearFieldError(inputEmail, errEmail));
  if (inputPhone) inputPhone.addEventListener('input', () => clearFieldError(inputPhone, errPhone));
  if (inputMessage) inputMessage.addEventListener('input', () => clearFieldError(inputMessage, errMessage));
  if (inputDatenschutz) inputDatenschutz.addEventListener('change', () => clearFieldError(null, errDatenschutz));

  function updateTracker(step) {
    // Step items
    for (let i = 1; i <= totalSteps; i++) {
      const ind = indicators[i];
      if (!ind) continue;
      ind.classList.remove('active', 'completed');
      if (i === step) {
        ind.classList.add('active');
      } else if (i < step) {
        ind.classList.add('completed');
      }
    }

    // Connectors
    if (connectors[1]) {
      if (step >= 2) connectors[1].classList.add('active');
      else connectors[1].classList.remove('active');
    }
    if (connectors[2]) {
      if (step >= 3) connectors[2].classList.add('active');
      else connectors[2].classList.remove('active');
    }
  }

  function updateNav(step) {
    if (btnBack) {
      btnBack.disabled = (step === 1);
    }
    if (btnNext && btnNextText && btnNextIcon) {
      if (step === totalSteps) {
        btnNextText.textContent = 'Störung melden';
        btnNextIcon.innerHTML = `
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        `;
      } else {
        btnNextText.textContent = 'Weiter';
        btnNextIcon.innerHTML = `
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        `;
      }
    }
  }

  function goToStep(targetStep) {
    if (targetStep < 1 || targetStep > totalSteps) return;
    hideAlert();

    // Hide all step panels
    Object.values(panels).forEach(panel => {
      if (panel) {
        panel.style.display = 'none';
        panel.classList.remove('active');
      }
    });

    // Show target step panel
    const targetPanel = panels[targetStep];
    if (targetPanel) {
      targetPanel.style.display = 'block';
      targetPanel.classList.add('active');
    }

    currentStep = targetStep;
    updateTracker(currentStep);
    updateNav(currentStep);

    // Smooth scroll into view if card is scrolled off-screen
    const rect = card.getBoundingClientRect();
    if (rect.top < 60 || rect.top > window.innerHeight) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // --------------------------------------------------------------------------
  // Step 2: Option Selection Cards
  // --------------------------------------------------------------------------
  const optionCards = card.querySelectorAll('.stoerung-option-card');
  optionCards.forEach(c => {
    const selectOption = () => {
      optionCards.forEach(item => {
        item.classList.remove('is-selected');
        item.setAttribute('aria-checked', 'false');
      });
      c.classList.add('is-selected');
      c.setAttribute('aria-checked', 'true');
      state.category = c.getAttribute('data-value') || '';
      clearFieldError(null, errCategory);
    };

    c.addEventListener('click', selectOption);
    c.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        selectOption();
      }
    });
  });

  // --------------------------------------------------------------------------
  // Step 3: File Upload Dropzone
  // --------------------------------------------------------------------------
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
    const allowed = ['image/jpeg', 'image/png', 'application/pdf', '.jpg', '.jpeg', '.png', '.pdf'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

    Array.from(fileListObj).forEach(file => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!allowed.includes(file.type) && !allowed.includes(ext)) {
        showAlert(`Format nicht unterstützt: ${file.name} (Erlaubt: JPG, PNG, PDF)`);
        return;
      }
      if (file.size > maxSizeBytes) {
        showAlert(`Datei zu groß: ${file.name} (Maximal 10 MB erlaubt)`);
        return;
      }
      // Check if duplicate
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
      const sizeStr = (file.size / 1024 > 1000) ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' : Math.round(file.size / 1024) + ' KB';
      item.innerHTML = `
        <span>${escapeHtml(file.name)} <small style="color:#6B7280;">(${sizeStr})</small></span>
        <button type="button" class="stoerung-file-remove" aria-label="Datei entfernen" data-index="${index}">&times;</button>
      `;
      const removeBtn = item.querySelector('.stoerung-file-remove');
      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          state.files.splice(index, 1);
          renderFileList();
        });
      }
      fileList.appendChild(item);
    });
  }

  // --------------------------------------------------------------------------
  // Step Validation
  // --------------------------------------------------------------------------
  function validateStep(step) {
    let isValid = true;
    hideAlert();

    if (step === 1) {
      state.name = inputName ? inputName.value.trim() : '';
      state.company = inputCompany ? inputCompany.value.trim() : '';
      state.email = inputEmail ? inputEmail.value.trim() : '';
      state.phone = inputPhone ? inputPhone.value.trim() : '';

      if (!state.name) {
        setFieldError(inputName, errName, 'Bitte geben Sie Ihren Namen ein.');
        isValid = false;
      } else {
        clearFieldError(inputName, errName);
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!state.email || !emailRegex.test(state.email)) {
        setFieldError(inputEmail, errEmail, 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
        isValid = false;
      } else {
        clearFieldError(inputEmail, errEmail);
      }

      const phoneClean = state.phone.replace(/[\s\-\/\(\)]/g, '');
      if (!state.phone || phoneClean.length < 6) {
        setFieldError(inputPhone, errPhone, 'Bitte geben Sie eine gültige Telefonnummer ein.');
        isValid = false;
      } else {
        clearFieldError(inputPhone, errPhone);
      }

      if (!isValid) {
        showAlert('Bitte füllen Sie alle erforderlichen Pflichtfelder korrekt aus.');
      }
    } else if (step === 2) {
      if (!state.category) {
        setFieldError(null, errCategory, 'Bitte wählen Sie die Art der Störung aus.');
        isValid = false;
      } else {
        clearFieldError(null, errCategory);
      }
    } else if (step === 3) {
      state.message = inputMessage ? inputMessage.value.trim() : '';
      state.datenschutz = inputDatenschutz ? inputDatenschutz.checked : false;

      if (!state.message || state.message.length < 5) {
        setFieldError(inputMessage, errMessage, 'Bitte beschreiben Sie das aufgetretene Problem kurz.');
        isValid = false;
      } else {
        clearFieldError(inputMessage, errMessage);
      }

      if (!state.datenschutz) {
        setFieldError(null, errDatenschutz, 'Bitte stimmen Sie der Datenschutzerklärung zu.');
        isValid = false;
      } else {
        clearFieldError(null, errDatenschutz);
      }

      if (!isValid) {
        showAlert('Bitte überprüfen Sie Ihre Eingaben und stimmen Sie der Datenschutzerklärung zu.');
      }
    }

    return isValid;
  }

  // --------------------------------------------------------------------------
  // Navigation Event Handlers
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // Submission
  // --------------------------------------------------------------------------
  function submitStoerungReport() {
    isSubmitting = true;
    btnNext.disabled = true;
    btnNextText.textContent = 'Wird übermittelt...';

    const timestamp = new Date().toISOString();
    const formattedDate = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
    const refId = '#ST-' + Math.floor(1000 + Math.random() * 9000);

    const payload = {
      subject: 'Neue Störungsmeldung – Malawko Website',
      referenceId: refId,
      submittedAt: timestamp,
      formattedDate: formattedDate,
      customer: {
        name: state.name,
        company: state.company || null,
        email: state.email,
        phone: state.phone
      },
      fault: {
        category: state.category,
        message: state.message,
        attachments: state.files.map(f => ({ name: f.name, size: f.size, type: f.type }))
      },
      privacyConsent: true,
      recipient: 'kontakt@elektrotechnik-malawko.de'
    };

    console.log('--- NEUE STÖRUNGSMELDUNG (STRUKTURIERTE E-MAIL) ---', payload);

    // Reliable transition to confirmation panel
    setTimeout(() => {
      // Hide form steps and header
      form.style.display = 'none';
      const cardHeader = card.querySelector('.stoerung-card-header');
      if (cardHeader) cardHeader.style.display = 'none';
      const tracker = card.querySelector('.stoerung-progress-tracker');
      if (tracker) tracker.style.display = 'none';

      // Update confirmation details
      const confirmRef = document.getElementById('stoerungConfirmRef');
      const confirmCat = document.getElementById('stoerungConfirmCategory');
      const confirmContact = document.getElementById('stoerungConfirmContact');

      if (confirmRef) confirmRef.textContent = refId;
      if (confirmCat) confirmCat.textContent = state.category;
      if (confirmContact) {
        confirmContact.textContent = state.name + (state.company ? ` (${state.company})` : '') + ` • ${state.email}`;
      }

      if (confirmationPanel) {
        confirmationPanel.style.display = 'block';
        confirmationPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      isSubmitting = false;
      btnNext.disabled = false;
      btnNextText.textContent = 'Störung melden';
    }, 600);
  }

  // --------------------------------------------------------------------------
  // Reset
  // --------------------------------------------------------------------------
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      // Reset state
      state.name = '';
      state.company = '';
      state.email = '';
      state.phone = '';
      state.category = 'Stromausfall / keine Spannung';
      state.message = '';
      state.files = [];
      state.datenschutz = false;

      // Reset form controls
      form.reset();
      renderFileList();

      // Reset option cards
      optionCards.forEach((c, idx) => {
        if (idx === 0) {
          c.classList.add('is-selected');
          c.setAttribute('aria-checked', 'true');
        } else {
          c.classList.remove('is-selected');
          c.setAttribute('aria-checked', 'false');
        }
      });

      // Show header & form, hide confirmation
      const cardHeader = card.querySelector('.stoerung-card-header');
      if (cardHeader) cardHeader.style.display = 'block';
      const tracker = card.querySelector('.stoerung-progress-tracker');
      if (tracker) tracker.style.display = 'flex';
      form.style.display = 'block';
      if (confirmationPanel) confirmationPanel.style.display = 'none';

      goToStep(1);
    });
  }

  // Handle direct navigation via URL hash (#stoerung or #stoerung-melden)
  if (window.location.hash === '#stoerung' || window.location.hash === '#stoerung-melden') {
    setTimeout(() => {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  }
}

/**
 * Interactive Service Selector for Solutions in Detail (Elektroinstallation Page)
 */
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
