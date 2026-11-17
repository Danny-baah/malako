/**
 * Elektrotechnik Malawko GmbH — Homepage Hero JavaScript
 * Vanilla JavaScript implementation for interactions, accessibility and responsiveness.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initMobileMenu();
  initServicesDropdown();
  initKeyboardNav();
  initEinsatzgebietMap();
  initProjectsPage();
  initInteractiveConfigurator();
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
  const toggleBtn = dropdownTrigger ? dropdownTrigger.querySelector('.dropdown-toggle') : null;
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
 * Initialize Interactive Einsatzgebiet Leaflet Map (Kiel & Schleswig-Holstein)
 */
function initEinsatzgebietMap() {
  const mapContainer = document.getElementById('einsatzgebietMap');
  if (!mapContainer || typeof L === 'undefined') return;

  // Kiel coordinates
  const kielLat = 54.3233;
  const kielLng = 10.1228;
  
  // Center map slightly southwest so the floating top-right card leaves the Kiel area clearly visible
  const viewCenter = [54.26, 10.16];

  try {
    const map = L.map('einsatzgebietMap', {
      center: viewCenter,
      zoom: 9,
      minZoom: 8,
      maxZoom: 13,
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

    // Outer service radius circle (covers Rendsburg, Eckernförde, Plön, Segeberg, Ostholstein)
    L.circle([kielLat, kielLng], {
      radius: 44000,
      color: '#D9541E',
      weight: 1.5,
      opacity: 0.55,
      dashArray: '6, 8',
      fillColor: '#D9541E',
      fillOpacity: 0.04
    }).addTo(map);

    // Core central service radius (Kiel & direct surroundings)
    L.circle([kielLat, kielLng], {
      radius: 20000,
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
        <div class="map-pin-icon-wrap" title="Elektrotechnik Malawko Zentrale Kiel">
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

    const marker = L.marker([kielLat, kielLng], { icon: customIcon }).addTo(map);

    // Click popup
    marker.bindPopup(`
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px 6px; text-align: center;">
        <strong style="color: #111; font-size: 14px; display: block; margin-bottom: 2px;">Elektrotechnik Malawko GmbH</strong>
        <span style="color: #D9541E; font-size: 12px; font-weight: 700;">Zentrale Kiel & Region Schleswig-Holstein</span>
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
  // STEP 1: Multi-Select Service Cards
  // --------------------------------------------------------------------------
  const step1Cards = panels[1].querySelectorAll('.config-card-multiselect');
  step1Cards.forEach(cardEl => {
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
  // STEP 2: Single-Select Property Cards
  // --------------------------------------------------------------------------
  const step2Cards = panels[2].querySelectorAll('.config-card-singleselect');
  step2Cards.forEach(cardEl => {
    const selectProperty = () => {
      step2Cards.forEach(c => {
        c.classList.remove('is-selected');
        c.setAttribute('aria-checked', 'false');
      });
      cardEl.classList.add('is-selected');
      cardEl.setAttribute('aria-checked', 'true');
      state.property = cardEl.getAttribute('data-value');
      hideAlert();

      // Auto-advance to Step 3 on single choice selection
      setTimeout(() => {
        if (currentStep === 2) {
          goToStep(3);
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
      if (!state.services || state.services.length === 0) {
        showAlert('Bitte wählen Sie mindestens eine gewünschte Leistung aus.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!state.property) {
        showAlert('Bitte wählen Sie die Art der Immobilie aus.');
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
        recipient: 'info@malawko-elektrotechnik.de'
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
 * Interactive Service Selector for Solutions in Detail (Elektroinstallation Page)
 */
function initSolutionsSelector() {
  const container = document.getElementById('solutionsInteractiveGrid');
  if (!container) return;

  const solutionsData = (window.pageSolutionsData && Object.keys(window.pageSolutionsData).length > 0) ? window.pageSolutionsData : {
    verteiler: {
      title: 'Verteilertechnik',
      desc: 'Planung, Aufbau und Modernisierung von Verteilungen – für eine sichere und zuverlässige Stromversorgung in Wohn- und Gewerbegebäuden.',
      image: 'assets/images/service-clean-v3-1-2x.jpg',
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
      image: 'assets/images/project-lighting-rings-2x.jpg',
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
      image: 'assets/images/service-clean-v3-4-2x.jpg',
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
      image: 'assets/images/service-clean-v3-3-2x.jpg',
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
