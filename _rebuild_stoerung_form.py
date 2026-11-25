"""Rebuild the Störung-Formular with 9 Steps in new order:
1. Worum geht es? (Anlage)
2. Betroffener Bereich (Raum)
3. Wie oft & seit wann? (Zeitpunkt + Dauerhaft/Sporadisch)
4. Sicherungen geprüft? (FI/RCD)
5. Fehlercode + PV-Zusatz (conditional)
6. Auffälligkeiten (Geräusche/Gerüche)
7. Beschreibung + Fotos
8. Kontaktdaten (Name, Firma, Tel, Email, Kundennummer)
9. Störungsort + Rückruf

All existing field IDs are kept so JS submission works.
"""
import re
from pathlib import Path

PROGRESS_TRACKER = '''<div class="stoerung-progress-tracker" aria-label="Fortschritt der Störungsmeldung" role="progressbar" aria-valuemin="1" aria-valuemax="9" aria-valuenow="1" id="stoerungProgressBar">
            <div class="stoerung-step-item active" id="stoerungStepIndicator1">
              <div class="stoerung-step-circle">1</div>
              <span class="stoerung-step-label">Anlage</span>
            </div>
            <div class="stoerung-progress-connector" id="stoerungConnector1"><div class="stoerung-connector-fill"></div></div>
            <div class="stoerung-step-item" id="stoerungStepIndicator2">
              <div class="stoerung-step-circle">2</div>
              <span class="stoerung-step-label">Bereich</span>
            </div>
            <div class="stoerung-progress-connector" id="stoerungConnector2"><div class="stoerung-connector-fill"></div></div>
            <div class="stoerung-step-item" id="stoerungStepIndicator3">
              <div class="stoerung-step-circle">3</div>
              <span class="stoerung-step-label">Zeit &amp; Muster</span>
            </div>
            <div class="stoerung-progress-connector" id="stoerungConnector3"><div class="stoerung-connector-fill"></div></div>
            <div class="stoerung-step-item" id="stoerungStepIndicator4">
              <div class="stoerung-step-circle">4</div>
              <span class="stoerung-step-label">Sicherung</span>
            </div>
            <div class="stoerung-progress-connector" id="stoerungConnector4"><div class="stoerung-connector-fill"></div></div>
            <div class="stoerung-step-item" id="stoerungStepIndicator5">
              <div class="stoerung-step-circle">5</div>
              <span class="stoerung-step-label">Fehlercode</span>
            </div>
            <div class="stoerung-progress-connector" id="stoerungConnector5"><div class="stoerung-connector-fill"></div></div>
            <div class="stoerung-step-item" id="stoerungStepIndicator6">
              <div class="stoerung-step-circle">6</div>
              <span class="stoerung-step-label">Auffälligkeit</span>
            </div>
            <div class="stoerung-progress-connector" id="stoerungConnector6"><div class="stoerung-connector-fill"></div></div>
            <div class="stoerung-step-item" id="stoerungStepIndicator7">
              <div class="stoerung-step-circle">7</div>
              <span class="stoerung-step-label">Beschreibung</span>
            </div>
            <div class="stoerung-progress-connector" id="stoerungConnector7"><div class="stoerung-connector-fill"></div></div>
            <div class="stoerung-step-item" id="stoerungStepIndicator8">
              <div class="stoerung-step-circle">8</div>
              <span class="stoerung-step-label">Kontakt</span>
            </div>
            <div class="stoerung-progress-connector" id="stoerungConnector8"><div class="stoerung-connector-fill"></div></div>
            <div class="stoerung-step-item" id="stoerungStepIndicator9">
              <div class="stoerung-step-circle">9</div>
              <span class="stoerung-step-label">Ort &amp; Rückruf</span>
            </div>
          </div>'''


FORM_BODY = '''<form id="stoerungForm" class="stoerung-form" novalidate>

            <!-- STEP 1: Worum geht es? (Anlage) -->
            <div class="stoerung-step-panel active" id="stoerungStep1" role="region" aria-label="Schritt 1 von 9: Worum geht es">
              <div class="stoerung-step-heading">
                <h3>Worum geht es?</h3>
                <p>Wählen Sie die betroffene Anlage oder das betroffene Gewerk.</p>
              </div>
              <div class="stoerung-field-group stoerung-category-group" role="radiogroup" aria-label="Betroffene Anlage">
                <label class="stoerung-category-item"><input type="radio" name="category" value="Elektroinstallation (Steckdosen / Schalter / Leitungen)" checked><span class="stoerung-category-label"><strong>01. Elektroinstallation</strong><small>Steckdosen, Schalter, Leitungen</small></span></label>
                <label class="stoerung-category-item"><input type="radio" name="category" value="Zähler &amp; Hausanschluss (Sicherungskasten, FI-Schalter)"><span class="stoerung-category-label"><strong>02. Zähler &amp; Hausanschluss</strong><small>Sicherungskasten, FI-Schalter</small></span></label>
                <label class="stoerung-category-item"><input type="radio" name="category" value="Wallbox &amp; E-Mobilität (Ladestation, Ladefehler)"><span class="stoerung-category-label"><strong>03. Wallbox &amp; E-Mobilität</strong><small>Ladestation, Ladefehler</small></span></label>
                <label class="stoerung-category-item"><input type="radio" name="category" value="Smart Home &amp; KNX (Gebäudeautomation, Bus-Ausfall)"><span class="stoerung-category-label"><strong>04. Smart Home &amp; KNX</strong><small>Gebäudeautomation, Bus-Ausfall</small></span></label>
                <label class="stoerung-category-item"><input type="radio" name="category" value="Beleuchtung (Lichtausfall, LED-Treiber, Außenlicht)"><span class="stoerung-category-label"><strong>05. Beleuchtung</strong><small>Lichtausfall, LED-Treiber</small></span></label>
                <label class="stoerung-category-item"><input type="radio" name="category" value="Netzwerk &amp; Kommunikation (LAN, Datenschrank)"><span class="stoerung-category-label"><strong>06. Netzwerk &amp; Kommunikation</strong><small>LAN, Datenschrank</small></span></label>
                <label class="stoerung-category-item"><input type="radio" name="category" value="Prüfung &amp; Wartung (Mängelbehebung, DGUV V3)"><span class="stoerung-category-label"><strong>07. Prüfung &amp; Wartung</strong><small>Mängelbehebung, DGUV V3</small></span></label>
                <label class="stoerung-category-item"><input type="radio" name="category" value="Photovoltaik &amp; Speicher (Wechselrichter, Inverter)"><span class="stoerung-category-label"><strong>08. Photovoltaik &amp; Speicher</strong><small>Wechselrichter, Inverter</small></span></label>
                <label class="stoerung-category-item"><input type="radio" name="category" value="Wärmepumpen-Anschluss (Elektrik, EVU-Sperre)"><span class="stoerung-category-label"><strong>09. Wärmepumpen-Anschluss</strong><small>Elektrik, EVU-Sperre</small></span></label>
                <label class="stoerung-category-item stoerung-category-item-emergency"><input type="radio" name="category" value="Akuter Stromausfall / Notfall (Ganzes Gebäude)"><span class="stoerung-category-label"><strong>10. Akuter Stromausfall</strong><small>Notfall — ganzes Gebäude</small></span></label>
              </div>
              <div class="stoerung-error-msg" id="errStoerungCategory"></div>
            </div>

            <!-- STEP 2: Betroffener Bereich -->
            <div class="stoerung-step-panel" id="stoerungStep2" role="region" aria-label="Schritt 2 von 9: Betroffener Bereich">
              <div class="stoerung-step-heading">
                <h3>Welcher Bereich / Raum ist betroffen?</h3>
                <p>Grenzen Sie das Problem räumlich ein.</p>
              </div>
              <div class="stoerung-field-group">
                <label for="stoerungArea" class="stoerung-label">Betroffener Bereich <span class="stoerung-required">*</span></label>
                <select id="stoerungArea" name="area" class="stoerung-input" required>
                  <option value="">Bitte Bereich auswählen ...</option>
                  <option value="Küche">Küche</option>
                  <option value="Badezimmer / WC">Badezimmer / WC</option>
                  <option value="Wohn- / Schlafräume">Wohn- / Schlafräume</option>
                  <option value="Keller / Haustechnik / Zählerraum">Keller / Haustechnik / Zählerraum</option>
                  <option value="Dachboden / Dachfläche (PV)">Dachboden / Dachfläche (PV)</option>
                  <option value="Außenbereich / Garten / Garage / Carport">Außenbereich / Garten / Garage / Carport</option>
                  <option value="Büro / Gewerbefläche / Werkstatt">Büro / Gewerbefläche / Werkstatt</option>
                  <option value="Gesamtes Gebäude / Komplette Wohnung">Gesamtes Gebäude / Komplette Wohnung</option>
                  <option value="Sonstiger Bereich">Sonstiger Bereich</option>
                </select>
                <div class="stoerung-error-msg" id="errStoerungArea"></div>
              </div>
            </div>

            <!-- STEP 3: Zeitpunkt + Muster -->
            <div class="stoerung-step-panel" id="stoerungStep3" role="region" aria-label="Schritt 3 von 9: Wie oft und seit wann">
              <div class="stoerung-step-heading">
                <h3>Wann &amp; wie oft tritt es auf?</h3>
                <p>Zeitpunkt des ersten Auftretens und Muster des Fehlers.</p>
              </div>
              <div class="stoerung-field-group">
                <label for="stoerungTimeOccurred" class="stoerung-label">Wann trat die Störung erstmals auf? <span class="stoerung-required">*</span></label>
                <select id="stoerungTimeOccurred" name="timeOccurred" class="stoerung-input" required>
                  <option value="">Bitte Zeitpunkt wählen ...</option>
                  <option value="Gerade eben (innerhalb der letzten 2 Stunden)">Gerade eben (innerhalb der letzten 2 Stunden)</option>
                  <option value="Heute im Tagesverlauf">Heute im Tagesverlauf</option>
                  <option value="Gestern">Gestern</option>
                  <option value="Vor wenigen Tagen">Vor wenigen Tagen</option>
                  <option value="Seit mehreren Wochen">Seit mehreren Wochen</option>
                  <option value="Wiederkehrend (tritt sporadisch auf)">Wiederkehrend (tritt sporadisch auf)</option>
                  <option value="Seit längerer Zeit / dauerhaft">Seit längerer Zeit / dauerhaft</option>
                </select>
                <div class="stoerung-error-msg" id="errStoerungTimeOccurred"></div>
              </div>
              <div class="stoerung-field-group">
                <label class="stoerung-label">Tritt der Fehler dauerhaft oder unregelmäßig auf? <span class="stoerung-required">*</span></label>
                <div class="stoerung-radio-row" role="radiogroup">
                  <label class="stoerung-radio-pill"><input type="radio" name="behavior" value="Dauerhaft (durchgehend vorhanden)" checked><span>Dauerhaft (durchgehend)</span></label>
                  <label class="stoerung-radio-pill"><input type="radio" name="behavior" value="Sporadisch / unregelmäßig"><span>Sporadisch / unregelmäßig</span></label>
                  <label class="stoerung-radio-pill"><input type="radio" name="behavior" value="Nur bei Last / bestimmten Geräten"><span>Nur bei Last / Geräten</span></label>
                  <label class="stoerung-radio-pill"><input type="radio" name="behavior" value="Einmaliger Ausfall"><span>Einmaliger Ausfall</span></label>
                </div>
              </div>
            </div>

            <!-- STEP 4: Sicherungen geprüft -->
            <div class="stoerung-step-panel" id="stoerungStep4" role="region" aria-label="Schritt 4 von 9: Sicherungen">
              <div class="stoerung-step-heading">
                <h3>Wurden Sicherungen / FI-Schutzschalter geprüft?</h3>
                <p>Das hilft unserem Techniker bei der Ersteinschätzung enorm.</p>
              </div>
              <div class="stoerung-field-group">
                <div class="stoerung-radio-row" role="radiogroup">
                  <label class="stoerung-radio-pill"><input type="radio" name="breakers" value="Ja – FI / Sicherung löst sofort wieder aus" checked><span>Ja — löst sofort wieder aus</span></label>
                  <label class="stoerung-radio-pill"><input type="radio" name="breakers" value="Ja – lässt sich nicht einschalten"><span>Ja — lässt sich nicht umlegen</span></label>
                  <label class="stoerung-radio-pill"><input type="radio" name="breakers" value="Nein – noch nicht geprüft"><span>Nein — noch nicht geprüft</span></label>
                  <label class="stoerung-radio-pill"><input type="radio" name="breakers" value="Nicht sicher / kein Zugang zur Verteilung"><span>Nicht sicher / kein Zugang</span></label>
                </div>
              </div>
            </div>

            <!-- STEP 5: Fehlercode (optional) + PV conditional -->
            <div class="stoerung-step-panel" id="stoerungStep5" role="region" aria-label="Schritt 5 von 9: Fehlercode">
              <div class="stoerung-step-heading">
                <h3>Fehlercode oder Display-Meldung?</h3>
                <p>Optional — falls das Gerät eine Meldung anzeigt (z.&nbsp;B. Wechselrichter, Wärmepumpe, Ladestation).</p>
              </div>
              <div class="stoerung-field-group">
                <label for="stoerungErrorCode" class="stoerung-label">Fehlercode oder Displaymeldung <span class="stoerung-optional">(optional)</span></label>
                <input type="text" id="stoerungErrorCode" name="errorCode" class="stoerung-input" placeholder="z. B. E-005 / „kein Netz" / FI löst alle 3 h aus">
              </div>
              <!-- PV-Diagnostik: wird per JS angezeigt wenn Photovoltaik in Step 1 gewählt -->
              <div class="stoerung-pv-block" id="pvDiagnosticBlock" style="display:none;">
                <h4 class="stoerung-pv-heading">Zusätzliche Angaben für Photovoltaikanlagen</h4>
                <div class="stoerung-field-group">
                  <label for="stoerungPvInverter" class="stoerung-label">Wechselrichter-Hersteller &amp; Modell</label>
                  <input type="text" id="stoerungPvInverter" name="pvInverter" class="stoerung-input" placeholder="z. B. SMA Sunny Tripower 8.0">
                </div>
                <div class="stoerung-field-group">
                  <label for="stoerungPvErrorCode" class="stoerung-label">Angezeigter Fehlercode / App-Meldung</label>
                  <input type="text" id="stoerungPvErrorCode" name="pvErrorCode" class="stoerung-input" placeholder="z. B. E-004 / App zeigt „Isolationsfehler"">
                </div>
                <div class="stoerung-field-group">
                  <label class="stoerung-label">Art des Ausfalls</label>
                  <div class="stoerung-radio-row" role="radiogroup">
                    <label class="stoerung-radio-pill"><input type="radio" name="pvOutputStatus" value="Komplettausfall (keine Stromerzeugung, Anlage steht)" checked><span>Komplettausfall</span></label>
                    <label class="stoerung-radio-pill"><input type="radio" name="pvOutputStatus" value="Reduzierte Leistung (Teilausfall / Ertragseinbruch)"><span>Reduzierte Leistung</span></label>
                    <label class="stoerung-radio-pill"><input type="radio" name="pvOutputStatus" value="Speicher / App-Verbindung gestört"><span>Speicher / App-Verbindung</span></label>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 6: Auffälligkeiten -->
            <div class="stoerung-step-panel" id="stoerungStep6" role="region" aria-label="Schritt 6 von 9: Auffälligkeiten">
              <div class="stoerung-step-heading">
                <h3>Ungewöhnliche Auffälligkeiten?</h3>
                <p>Geräusche, Gerüche oder visuelle Spuren können auf akute Gefahr hindeuten.</p>
              </div>
              <div class="stoerung-field-group">
                <div class="stoerung-symptom-grid">
                  <label class="stoerung-check-pill"><input type="checkbox" name="symptoms" value="Keine Auffälligkeiten"><span>Keine Auffälligkeiten</span></label>
                  <label class="stoerung-check-pill"><input type="checkbox" name="symptoms" value="Schmor- oder Brandgeruch"><span>Schmor- / Brandgeruch</span></label>
                  <label class="stoerung-check-pill"><input type="checkbox" name="symptoms" value="Knistern, Summen oder Brummen"><span>Knistern / Brummen</span></label>
                  <label class="stoerung-check-pill"><input type="checkbox" name="symptoms" value="Schmorspuren, Ruß oder Verfärbung"><span>Schmorspuren / Verfärbung</span></label>
                  <label class="stoerung-check-pill"><input type="checkbox" name="symptoms" value="Flackerndes Licht / Schwankungen"><span>Flackerndes Licht</span></label>
                </div>
              </div>
            </div>

            <!-- STEP 7: Beschreibung + Fotos -->
            <div class="stoerung-step-panel" id="stoerungStep7" role="region" aria-label="Schritt 7 von 9: Beschreibung und Fotos">
              <div class="stoerung-step-heading">
                <h3>Beschreibung &amp; Fotos</h3>
                <p>Je präziser Sie beschreiben, desto besser können wir vorbereitet anrücken.</p>
              </div>
              <div class="stoerung-field-group">
                <label for="stoerungMessage" class="stoerung-label">Genaue Beschreibung der Störung <span class="stoerung-required">*</span></label>
                <textarea id="stoerungMessage" name="message" class="stoerung-input stoerung-textarea" rows="5" required placeholder="z. B.: Seit heute Morgen kein Strom in Küche &amp; Esszimmer. Küchen-FI lässt sich nicht umlegen, Herd war in Betrieb als es abschaltete."></textarea>
                <div class="stoerung-error-msg" id="errStoerungMessage"></div>
              </div>
              <div class="stoerung-field-group">
                <label class="stoerung-label">Fotos oder Dokumente hochladen <span class="stoerung-optional">(sehr empfohlen)</span></label>
                <div class="stoerung-dropzone" id="stoerungDropzone">
                  <input type="file" id="stoerungFileInput" accept=".jpg,.jpeg,.png,.pdf" multiple style="display:none;">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  <p>Fotos hierhin ziehen oder Dateien auswählen</p>
                  <small>Ideal: Zählerschrank, Verteiler, Wechselrichter-Display, Typenschild (JPG, PNG, PDF bis 15&nbsp;MB)</small>
                </div>
                <div class="stoerung-file-list" id="stoerungFileList"></div>
              </div>
            </div>

            <!-- STEP 8: Kontaktdaten -->
            <div class="stoerung-step-panel" id="stoerungStep8" role="region" aria-label="Schritt 8 von 9: Kontaktdaten">
              <div class="stoerung-step-heading">
                <h3>Ihre Kontaktdaten</h3>
                <p>So erreichen wir Sie für Rückfragen und Terminabstimmung.</p>
              </div>
              <div class="stoerung-fields-grid">
                <div class="stoerung-field-group">
                  <label for="stoerungVorname" class="stoerung-label">Vorname <span class="stoerung-required">*</span></label>
                  <input type="text" id="stoerungVorname" name="vorname" class="stoerung-input" placeholder="z. B. Max" required autocomplete="given-name">
                  <div class="stoerung-error-msg" id="errStoerungVorname"></div>
                </div>
                <div class="stoerung-field-group">
                  <label for="stoerungNachname" class="stoerung-label">Nachname <span class="stoerung-required">*</span></label>
                  <input type="text" id="stoerungNachname" name="nachname" class="stoerung-input" placeholder="z. B. Mustermann" required autocomplete="family-name">
                  <div class="stoerung-error-msg" id="errStoerungNachname"></div>
                </div>
                <div class="stoerung-field-group">
                  <label for="stoerungCompany" class="stoerung-label">Firma / Unternehmen <span class="stoerung-optional">(bei Gewerbekunden)</span></label>
                  <input type="text" id="stoerungCompany" name="company" class="stoerung-input" placeholder="z. B. Musterfirma GmbH" autocomplete="organization">
                </div>
                <div class="stoerung-field-group">
                  <label for="stoerungCustomerNumber" class="stoerung-label">Kundennummer <span class="stoerung-optional">(falls vorhanden)</span></label>
                  <input type="text" id="stoerungCustomerNumber" name="customerNumber" class="stoerung-input" placeholder="z. B. K-00123">
                </div>
                <div class="stoerung-field-group">
                  <label for="stoerungPhone" class="stoerung-label">Telefon <span class="stoerung-required">*</span></label>
                  <input type="tel" id="stoerungPhone" name="phone" class="stoerung-input" placeholder="z. B. 0170 1234567" required autocomplete="tel">
                  <div class="stoerung-error-msg" id="errStoerungPhone"></div>
                </div>
                <div class="stoerung-field-group">
                  <label for="stoerungEmail" class="stoerung-label">E-Mail <span class="stoerung-required">*</span></label>
                  <input type="email" id="stoerungEmail" name="email" class="stoerung-input" placeholder="z. B. max@mustermann.de" required autocomplete="email">
                  <div class="stoerung-error-msg" id="errStoerungEmail"></div>
                </div>
              </div>
            </div>

            <!-- STEP 9: Störungsort + Rückruf -->
            <div class="stoerung-step-panel" id="stoerungStep9" role="region" aria-label="Schritt 9 von 9: Störungsort und Rückruf">
              <div class="stoerung-step-heading">
                <h3>Störungsort &amp; Rückruf</h3>
                <p>Letzter Schritt: Wo genau ist das Problem und wie möchten Sie erreicht werden?</p>
              </div>

              <div class="stoerung-field-group">
                <label class="stoerung-label">Wo befindet sich die Störung?</label>
                <div class="stoerung-radio-row" role="radiogroup">
                  <label class="stoerung-radio-pill"><input type="radio" name="locationChoice" value="saved" id="stoerungLocationSaved"><span>Gespeicherte Adresse verwenden</span></label>
                  <label class="stoerung-radio-pill"><input type="radio" name="locationChoice" value="new" id="stoerungLocationNew" checked><span>Andere Adresse eingeben</span></label>
                </div>
                <div class="stoerung-saved-address-hint" id="stoerungSavedAddressHint" style="display:none;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span id="stoerungSavedAddressText">Gespeicherte Adresse wird verwendet.</span>
                  <button type="button" class="btn-load-saved-address" id="btnLoadSavedAddress">Erneut laden</button>
                </div>
              </div>

              <div class="stoerung-location-fields" id="stoerungLocationFields">
                <div class="stoerung-fields-grid">
                  <div class="stoerung-field-group stoerung-field-span-2">
                    <label for="stoerungStreet" class="stoerung-label">Straße &amp; Hausnummer <span class="stoerung-required">*</span></label>
                    <input type="text" id="stoerungStreet" name="street" class="stoerung-input" placeholder="z. B. Musterstraße 12" autocomplete="street-address">
                    <div class="stoerung-error-msg" id="errStoerungStreet"></div>
                  </div>
                  <div class="stoerung-field-group">
                    <label for="stoerungZip" class="stoerung-label">PLZ <span class="stoerung-required">*</span></label>
                    <input type="text" id="stoerungZip" name="zip" class="stoerung-input" placeholder="z. B. 22309" inputmode="numeric" autocomplete="postal-code">
                    <div class="stoerung-error-msg" id="errStoerungZip"></div>
                  </div>
                  <div class="stoerung-field-group">
                    <label for="stoerungCity" class="stoerung-label">Ort / Stadtteil <span class="stoerung-required">*</span></label>
                    <input type="text" id="stoerungCity" name="city" class="stoerung-input" value="Hamburg" autocomplete="address-level2">
                    <div class="stoerung-error-msg" id="errStoerungCity"></div>
                  </div>
                </div>
                <div class="stoerung-save-address-toggle">
                  <label>
                    <input type="checkbox" id="stoerungSaveAddress" name="saveAddress">
                    <span>Diese Adresse für zukünftige Störungsmeldungen in diesem Browser merken</span>
                  </label>
                </div>
              </div>

              <div class="stoerung-field-group" style="margin-top: 28px;">
                <label class="stoerung-label">Möchten Sie einen Rückruf?</label>
                <div class="stoerung-radio-row" role="radiogroup">
                  <label class="stoerung-radio-pill"><input type="radio" name="callbackRequested" value="Ja" checked><span>Ja, bitte um Rückruf</span></label>
                  <label class="stoerung-radio-pill"><input type="radio" name="callbackRequested" value="Nein"><span>Nein, E-Mail genügt</span></label>
                </div>
              </div>

              <div class="stoerung-field-group" id="stoerungCallbackWay">
                <label class="stoerung-label">Bevorzugter Kontaktweg</label>
                <div class="stoerung-radio-row" role="radiogroup">
                  <label class="stoerung-radio-pill"><input type="radio" name="contactWay" value="Telefon" checked><span>Telefon</span></label>
                  <label class="stoerung-radio-pill"><input type="radio" name="contactWay" value="E-Mail"><span>E-Mail</span></label>
                  <label class="stoerung-radio-pill"><input type="radio" name="contactWay" value="WhatsApp"><span>WhatsApp</span></label>
                </div>
              </div>

              <div class="stoerung-field-group" id="stoerungCallbackTimeGroup">
                <label for="stoerungCallbackTime" class="stoerung-label">Bevorzugte Rückrufzeit</label>
                <select id="stoerungCallbackTime" name="callbackTime" class="stoerung-input">
                  <option value="Schnellstmöglich">Schnellstmöglich</option>
                  <option value="Vormittags (08:00 – 12:00 Uhr)">Vormittags (08:00 – 12:00 Uhr)</option>
                  <option value="Nachmittags (12:00 – 17:00 Uhr)">Nachmittags (12:00 – 17:00 Uhr)</option>
                  <option value="Abends (17:00 – 19:00 Uhr)">Abends (17:00 – 19:00 Uhr)</option>
                </select>
              </div>

              <div class="stoerung-field-group stoerung-datenschutz-row">
                <label class="stoerung-datenschutz-label">
                  <input type="checkbox" id="stoerungDatenschutz" name="datenschutz" required>
                  <span>Ich habe die <a href="/datenschutz" target="_blank">Datenschutzerklärung</a> zur Kenntnis genommen und willige in die Verarbeitung meiner Daten zur Bearbeitung dieser Störungsmeldung ein. <span class="stoerung-required">*</span></span>
                </label>
                <div class="stoerung-error-msg" id="errStoerungDatenschutz"></div>
              </div>
            </div>

            <!-- NAVIGATION FOOTER -->
            <div class="stoerung-nav-footer" id="stoerungNavFooter">
              <button type="button" class="stoerung-btn-back" id="stoerungBtnBack" style="visibility:hidden;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 19"></polyline></svg>
                <span>Zurück</span>
              </button>
              <div class="stoerung-step-counter" id="stoerungStepCounter">Schritt 1 von 9</div>
              <button type="button" class="stoerung-btn-next" id="stoerungBtnNext">
                <span id="stoerungBtnNextText">Weiter</span>
                <svg id="stoerungBtnNextIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
            </div>

          </form>'''


def rebuild():
    p = Path("stoerung-melden.html")
    h = p.read_text(encoding="utf-8")

    # --- Replace progress-tracker ---
    pt_start = h.find('<div class="stoerung-progress-tracker"')
    # find matching close
    depth = 0
    i = pt_start
    while i < len(h):
        if h[i:i+4] == '<div':
            depth += 1
            i = h.find('>', i) + 1
        elif h[i:i+6] == '</div>':
            depth -= 1
            i += 6
            if depth == 0:
                break
        else:
            i += 1
    pt_end = i
    h = h[:pt_start] + PROGRESS_TRACKER + h[pt_end:]

    # --- Replace form ---
    form_start = h.find('<form id="stoerungForm"')
    form_end = h.find('</form>', form_start) + len('</form>')
    h = h[:form_start] + FORM_BODY + h[form_end:]

    p.write_text(h, encoding="utf-8")
    print("stoerung-melden.html rebuilt.")
    print(f"  file length: {len(h)} chars")


if __name__ == "__main__":
    rebuild()
