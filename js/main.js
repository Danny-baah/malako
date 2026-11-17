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
  initContactPage();
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

/**
 * Initialize Contact Page Interactions (Form validation, conditional fields, file uploads)
 */
function initContactPage() {
  const form = document.getElementById('projectInquiryForm');
  if (!form) return;

  const anliegenSelect = document.getElementById('anliegenSelect');
  const umfangSelect = document.getElementById('umfangSelect');
  const fileInput = document.getElementById('fileUploadInput');
  const fileDropzone = document.getElementById('fileDropzone');
  const fileListContainer = document.getElementById('fileListContainer');
  const feedbackSuccess = document.getElementById('formFeedbackSuccess');
  const feedbackError = document.getElementById('formFeedbackError');

  // Track uploaded files
  let attachedFiles = [];

  // 1. Conditional Scope Options based on Selected Service / Anliegen
  const scopeOptionsMap = {
    'wallbox': [
      { val: '1_point', text: '1 Ladepunkt (z.B. Einfamilienhaus)' },
      { val: '2_points', text: '2 Ladepunkte (Doppelgarage / Carport)' },
      { val: 'fleet', text: 'Gewerbliche Ladeinfrastruktur (> 3 Ladepunkte)' }
    ],
    'smarthome': [
      { val: 'complete', text: 'Komplettes Gebäude (KNX Neubau / Sanierung)' },
      { val: 'retrofit', text: 'Nachrüstung einzelner Räume / Funk-System' },
      { val: 'lighting_shading', text: 'Smarte Beleuchtung & Beschattung' }
    ],
    'sanierung': [
      { val: 'new_build', text: 'Neubauinstallation' },
      { val: 'core_renovation', text: 'Komplette Kernsanierung' },
      { val: 'partial_renovation', text: 'Teilsanierung (z.B. Küche / Bad)' }
    ],
    'modernisierung': [
      { val: 'distribution_board', text: 'Zählerschrank & Unterverteilung' },
      { val: 'wiring_switches', text: 'Erneuerung Leitungen & Schaltermaterial' },
      { val: 'led_lighting', text: 'Umstellung auf energieeffiziente LED-Beleuchtung' }
    ],
    'stoerung': [
      { val: 'power_loss', text: 'Teilweiser oder kompletter Stromausfall' },
      { val: 'rccb_tripped', text: 'FI-Schutzschalter löst wiederholt aus' },
      { val: 'appliance_fault', text: 'Defekt an Großgerät / Heizungsanschluss' }
    ],
    'wartung': [
      { val: 'e_check_private', text: 'E-Check Prüfung für Privathaushalt' },
      { val: 'dguv_v3_commercial', text: 'DGUV V3 Prüfung für Gewerbe & Betrieb' },
      { val: 'annual_inspection', text: 'Wiederkehrende Anlagenwartung' }
    ]
  };

  const defaultScopeOptions = [
    { val: 'small', text: 'Kleineres Vorhaben (< 1 Tag)' },
    { val: 'medium', text: 'Mittleres Projekt (mehrere Tage)' },
    { val: 'large', text: 'Großprojekt / Gesamtanlage' }
  ];

  if (anliegenSelect && umfangSelect) {
    anliegenSelect.addEventListener('change', () => {
      const selectedAnliegen = anliegenSelect.value;
      let optionsToUse = defaultScopeOptions;

      if (selectedAnliegen.includes('wallbox')) optionsToUse = scopeOptionsMap.wallbox;
      else if (selectedAnliegen.includes('smarthome') || selectedAnliegen.includes('knx')) optionsToUse = scopeOptionsMap.smarthome;
      else if (selectedAnliegen.includes('baue') || selectedAnliegen.includes('saniere')) optionsToUse = scopeOptionsMap.sanierung;
      else if (selectedAnliegen.includes('modernisieren')) optionsToUse = scopeOptionsMap.modernisierung;
      else if (selectedAnliegen.includes('stoerung') || selectedAnliegen.includes('notfall')) optionsToUse = scopeOptionsMap.stoerung;
      else if (selectedAnliegen.includes('pruefung') || selectedAnliegen.includes('wartung')) optionsToUse = scopeOptionsMap.wartung;

      umfangSelect.innerHTML = '<option value="">Bitte wählen</option>';
      optionsToUse.forEach(opt => {
        const optionEl = document.createElement('option');
        optionEl.value = opt.val;
        optionEl.textContent = opt.text;
        umfangSelect.appendChild(optionEl);
      });
    });
  }

  // 2. File Upload & Drag-and-Drop Handling
  if (fileDropzone && fileInput) {
    fileDropzone.addEventListener('click', (e) => {
      if (e.target.closest('.file-remove-btn')) return;
      fileInput.click();
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      fileDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        fileDropzone.style.backgroundColor = '#FFF4EC';
        fileDropzone.style.borderColor = '#D9541E';
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      fileDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        fileDropzone.style.backgroundColor = '';
        fileDropzone.style.borderColor = '';
      });
    });

    fileDropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files) {
        handleFiles(Array.from(e.dataTransfer.files));
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files) {
        handleFiles(Array.from(fileInput.files));
      }
    });
  }

  function handleFiles(files) {
    const validExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'webp'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

    files.forEach(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!validExtensions.includes(ext)) {
        alert(`Dateityp nicht zulässig: ${file.name}. Erlaubt sind JPG, PNG, PDF.`);
        return;
      }
      if (file.size > maxSizeBytes) {
        alert(`Datei ist zu groß: ${file.name} (${(file.size / (1024*1024)).toFixed(1)} MB). Maximal erlaubt sind 10 MB.`);
        return;
      }
      if (!attachedFiles.some(f => f.name === file.name && f.size === file.size)) {
        attachedFiles.push(file);
      }
    });

    renderFileList();
  }

  function renderFileList() {
    if (!fileListContainer) return;
    fileListContainer.innerHTML = '';
    attachedFiles.forEach((file, index) => {
      const tag = document.createElement('span');
      tag.className = 'file-tag';
      tag.innerHTML = `
        📄 <span>${escapeHtml(file.name)} (${(file.size / 1024).toFixed(0)} KB)</span>
        <button type="button" class="file-remove-btn" aria-label="Datei entfernen" data-index="${index}">&times;</button>
      `;
      fileListContainer.appendChild(tag);
    });

    fileListContainer.querySelectorAll('.file-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        attachedFiles.splice(idx, 1);
        renderFileList();
      });
    });
  }

  // 3. Form Validation & Structured Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (feedbackSuccess) feedbackSuccess.style.display = 'none';
    if (feedbackError) feedbackError.style.display = 'none';

    // Retrieve form fields
    const anliegen = form.elements['anliegen'] ? form.elements['anliegen'].value.trim() : '';
    const objektart = form.elements['objektart'] ? form.elements['objektart'].value.trim() : '';
    const projektstatus = form.elements['projektstatus'] ? form.elements['projektstatus'].value.trim() : '';
    const umfang = form.elements['umfang'] ? form.elements['umfang'].value.trim() : '';
    const nachricht = form.elements['nachricht'] ? form.elements['nachricht'].value.trim() : '';

    const vorname = form.elements['vorname'] ? form.elements['vorname'].value.trim() : '';
    const nachname = form.elements['nachname'] ? form.elements['nachname'].value.trim() : '';
    const email = form.elements['email'] ? form.elements['email'].value.trim() : '';
    const telefon = form.elements['telefon'] ? form.elements['telefon'].value.trim() : '';
    const rueckmeldung = form.querySelector('input[name="rueckmeldung"]:checked') ? form.querySelector('input[name="rueckmeldung"]:checked').value : 'E-Mail';
    const datenschutz = form.elements['datenschutz'] ? form.elements['datenschutz'].checked : false;

    // Validate Required Fields
    let missing = [];
    if (!anliegen) missing.push('Ihr Anliegen');
    if (!objektart) missing.push('Die Objektart');
    if (!vorname) missing.push('Ihr Vorname');
    if (!nachname) missing.push('Ihr Nachname');
    if (!email || !validateEmail(email)) missing.push('Eine gültige E-Mail-Adresse');
    if (!telefon) missing.push('Ihre Telefonnummer');
    if (!datenschutz) missing.push('Zustimmung zur Datenschutzerklärung');

    if (missing.length > 0) {
      if (feedbackError) {
        feedbackError.innerHTML = `<strong>Bitte überprüfen Sie Ihre Angaben:</strong><br>Folgende Pflichtfelder fehlen oder sind unvollständig: ${missing.join(', ')}.`;
        feedbackError.style.display = 'block';
        feedbackError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return;
    }

    // Prepare Structured Inquiry Payload
    const submissionTimestamp = new Date().toISOString();
    const formattedDate = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });

    const inquiryPayload = {
      customer: {
        firstName: vorname,
        lastName: nachname,
        email: email,
        phone: telefon,
        preferredContact: rueckmeldung
      },
      project: {
        service: anliegen,
        propertyType: objektart,
        status: projektstatus || 'Nicht angegeben',
        scope: umfang || 'Nicht angegeben',
        message: nachricht || 'Keine zusätzliche Nachricht'
      },
      attachments: attachedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })),
      metadata: {
        submittedAt: submissionTimestamp,
        formattedDate: formattedDate,
        recipient: 'info@malawko-elektrotechnik.de'
      }
    };

    console.log('--- MALAWKO NEUE PROJEKTANFRAGE (STRUKTURIERTE E-MAIL DATEN) ---', inquiryPayload);

    // Provide friendly success feedback
    if (feedbackSuccess) {
      feedbackSuccess.innerHTML = `
        <strong>✓ Vielen Dank, ${escapeHtml(vorname)} ${escapeHtml(nachname)}!</strong><br>
        Ihre Projektanfrage zu <em>${escapeHtml(anliegen)}</em> wurde erfolgreich erfasst.<br>
        Wir prüfen Ihre Angaben und melden uns zeitnah per ${escapeHtml(rueckmeldung)} (${escapeHtml(email)}) bei Ihnen.
      `;
      feedbackSuccess.style.display = 'block';
      feedbackSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Reset form inputs (preserve success message)
    form.reset();
    attachedFiles = [];
    renderFileList();
  });
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
