"""Ergaenzt alle HTML-Seiten um ein Kontakt-Dropdown in der Nav
(Desktop + Mobile), analog zum Leistungen-Dropdown.

Dropdown-Inhalt:
  - Kontaktseite        -> /kontakt
  - Neues Projekt       -> /angebot
  - Stoerungsmeldung    -> /stoerung-melden

Zusaetzlich:
  - kontakt.html: Hero-CTAs auf /angebot + /stoerung-melden
  - stoerung-melden.html: Notfall-Anruf-Box unter das Formular
"""
import re
from pathlib import Path

ROOT = Path(__file__).parent

# ============================================================
# 1) Desktop-Nav: Kontakt <li> ersetzen
# ============================================================
DESKTOP_OLD_RE = re.compile(
    r'<li class="nav-item">\s*<a href="/kontakt" class="nav-link([^"]*)"([^>]*)>Kontakt</a>\s*</li>',
    re.MULTILINE
)

def desktop_new(mo):
    extra_class = mo.group(1)  # might be " active"
    extra_attrs = mo.group(2)   # might be ' aria-current="page"'
    active = "active" if "active" in extra_class else ""
    aria_current = ' aria-current="page"' if 'aria-current' in extra_attrs else ''
    return f'''<li class="nav-item has-dropdown" id="contactDropdownTrigger">
            <div class="nav-link-dropdown-wrap">
              <a href="/kontakt" class="nav-link nav-link-main {active}"{aria_current}>Kontakt</a>
              <button
                type="button"
                class="dropdown-toggle-btn"
                aria-label="Kontakt Untermenü öffnen"
                aria-expanded="false"
                aria-haspopup="true"
                aria-controls="contactDropdown"
              >
                <svg class="chevron-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
            <div class="services-dropdown" id="contactDropdown" role="menu" aria-label="Kontakt Untermenü">
              <div class="dropdown-inner">
                <a href="/kontakt" class="dropdown-item" role="menuitem">
                  <span class="dropdown-num">01</span>
                  <div class="dropdown-text">
                    <strong>Kontaktseite</strong>
                    <small>Telefon, E-Mail, Adresse &amp; Überblick</small>
                  </div>
                </a>
                <a href="/angebot" class="dropdown-item" role="menuitem">
                  <span class="dropdown-num">02</span>
                  <div class="dropdown-text">
                    <strong>Neues Projekt</strong>
                    <small>Projektanfrage &amp; unverbindliches Angebot</small>
                  </div>
                </a>
                <a href="/stoerung-melden" class="dropdown-item" role="menuitem">
                  <span class="dropdown-num">03</span>
                  <div class="dropdown-text">
                    <strong>Störung melden</strong>
                    <small>Strukturiertes Fehler-Meldeformular</small>
                  </div>
                </a>
              </div>
            </div>
          </li>'''.strip()


# ============================================================
# 2) Mobile-Nav: Kontakt <li> ersetzen
# ============================================================
MOBILE_OLD_RE = re.compile(
    r'<li>\s*<a href="/kontakt" class="mobile-nav-link([^"]*)"([^>]*)>Kontakt</a>\s*</li>',
    re.MULTILINE
)

def mobile_new(mo):
    extra_class = mo.group(1)
    extra_attrs = mo.group(2)
    active = "active" if "active" in extra_class else ""
    aria_current = ' aria-current="page"' if 'aria-current' in extra_attrs else ''
    return f'''<li class="mobile-has-sub">
            <div class="mobile-sub-header">
              <a href="/kontakt" class="mobile-nav-link {active}"{aria_current}>Kontakt</a>
              <button type="button" class="mobile-sub-toggle-btn" id="mobileContactSubToggle" aria-label="Kontakt Untermenü umschalten" aria-expanded="false">
                <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
            <ul class="mobile-submenu" id="mobileContactSubmenu">
              <li><a href="/kontakt" class="mobile-submenu-overview"><strong>&rarr; Kontaktseite &amp; Überblick</strong></a></li>
              <li><a href="/angebot">Neues Projekt / Angebot</a></li>
              <li><a href="/stoerung-melden">Störung melden</a></li>
            </ul>
          </li>'''.strip()


# ============================================================
# Apply to all HTML files
# ============================================================
html_files = sorted(ROOT.glob("*.html"))
changed = 0
for p in html_files:
    h = p.read_text(encoding="utf-8")
    original = h

    # Replace desktop nav
    if DESKTOP_OLD_RE.search(h):
        h = DESKTOP_OLD_RE.sub(desktop_new, h, count=1)

    # Replace mobile nav
    if MOBILE_OLD_RE.search(h):
        h = MOBILE_OLD_RE.sub(mobile_new, h, count=1)

    if h != original:
        p.write_text(h, encoding="utf-8")
        changed += 1
        print(f"  {p.name}: nav updated")

print(f"\n{changed} Dateien aktualisiert.")


# ============================================================
# 3) kontakt.html Hero-CTAs: Buttons neu belegen
# ============================================================
kontakt_path = ROOT / "kontakt.html"
h = kontakt_path.read_text(encoding="utf-8")

# Primary Button: href fixen auf /angebot, Label "Projekt zusammenstellen" bleibt
h = re.sub(
    r'(<a href=")#projektanfrage(" class="btn-primary-orange">)',
    r'\1/angebot\2',
    h, count=1
)

# Störung-Button zwischen Primary und "Sofort anrufen" einfuegen
call_btn_re = re.compile(
    r'(<a href="tel:\+4915125383578" class="btn-outline-glass">[\s\S]*?Sofort anrufen[\s\S]*?</a>)'
)
stoerung_btn = '''<a href="/stoerung-melden" class="btn-outline-glass">
              <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span>Störung melden</span>
            </a>'''
h = call_btn_re.sub(stoerung_btn + r"\n            \1", h, count=1)

kontakt_path.write_text(h, encoding="utf-8")
print("  kontakt.html Hero-CTAs aktualisiert.")


# ============================================================
# 4) stoerung-melden.html: Notfall-Anruf-Box UNTER das Formular
# ============================================================
st_path = ROOT / "stoerung-melden.html"
h = st_path.read_text(encoding="utf-8")

# Finde das Ende der stoerung-section (das </section>) -- wir fuegen davor eine Box ein
# Besser: wir fuegen die Box nach dem ersten </form> (Hauptformular) ein,
# aber vor dem naechsten <div> (confirmation panel). Oder ganz am Section-Ende.
# Einfacher: Nach dem stoerung-confirmation-panel's </div> aber vor </section>.

notfall_box = '''
        <!-- Notfall-Anruf-Box UNTER Formular -->
        <div class="stoerung-notfall-box" role="note" aria-label="Notfall-Direktkontakt">
          <div class="stoerung-notfall-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </div>
          <div class="stoerung-notfall-content">
            <span class="stoerung-notfall-eyebrow">Sofort Hilfe benötigt?</span>
            <h3 class="stoerung-notfall-title">Bei akutem Notfall: direkt anrufen</h3>
            <p class="stoerung-notfall-desc">
              Brandgeruch, Rauch, Funken, Stromausfall im ganzen Gebäude oder konkrete Gefahr für Personen?
              Nicht auf eine E-Mail-Antwort warten — rufen Sie uns direkt an. Bei unmittelbarer Gefahr
              zuerst <strong>112</strong> wählen.
            </p>
            <div class="stoerung-notfall-actions">
              <a href="tel:+4915125383578" class="stoerung-notfall-btn stoerung-notfall-btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>Malawko anrufen: 0151 25 38 35 78</span>
              </a>
              <a href="tel:112" class="stoerung-notfall-btn stoerung-notfall-btn-emergency">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <span>Notruf 112</span>
              </a>
            </div>
          </div>
        </div>
'''

# Einfuegen vor </section> der stoerung-section (die letzte vor </main>)
# Wir finden das </section> das zur <section class="stoerung-section"> gehoert.
# Pragmatischer Ansatz: vor dem Pattern "</section>\s*\n\s*</main>" die Box einfuegen.
h = re.sub(
    r'(</section>\s*</main>)',
    notfall_box + r'\n        \1',
    h, count=1
)

st_path.write_text(h, encoding="utf-8")
print("  stoerung-melden.html Notfall-Box ergänzt.")
