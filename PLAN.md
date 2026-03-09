# SchichtBlitz — Produktplan

> Der einfachste Weg für Gastro-Betriebe, rechtssichere Wochenpläne per KI zu erstellen und per WhatsApp ans Team zu pushen.

---

## 1. Produktvision

**Produktname:** SchichtBlitz

**Problem:** Schichtplanung in der Gastronomie ist zeitfressend, fehleranfällig und rechtlich komplex. ~60% der kleinen Betriebe planen noch mit Excel oder Papier. Bestehende Tools (Gastromatic, Planday, Shiftbase) sind überladen, teuer und für kleine Betriebe Overkill.

**Lösung:** Mobile-first Web-App, die Wochenpläne per KI auf Knopfdruck erstellt, automatisch ArbZG-Compliance prüft und den fertigen Plan per WhatsApp ans Team pusht.

**Zielgruppe:** Inhaber und Betriebsleiter kleiner bis mittelgroßer Gastro-Betriebe (5–50 Mitarbeiter) — Restaurants, Cafés, Bars, Imbisse. Mix aus Vollzeit, Teilzeit und Minijob.

**Kern-Differenziatoren:**
- Einfachheit — simpler als alles andere ("3 Taps und der Plan steht")
- ArbZG-Compliance automatisch eingebaut
- KI-Automatisierung (Plan auf Knopfdruck)
- WhatsApp/Telegram-Integration für MA-Kommunikation

**Pricing:** Erstmal kostenlos, später monetarisieren.

---

## 2. Wettbewerb

| Tool | Stärke | Schwäche | Preis |
|---|---|---|---|
| **Gastromatic** | Marktführer DACH, umfangreich | Komplex, teuer, für große Betriebe | ab ~3€/MA/Monat |
| **Planday** | Gutes UX, international | Nicht auf DE-Regulatorik spezialisiert | ab ~2,50€/MA/Monat |
| **Shiftbase** | Günstig | UX mittelmäßig | ab ~2€/MA/Monat |
| **Excel/Papier** | Kostenlos, bekannt | Keine Compliance, kein Automatismus | 0€ |
| **SchichtBlitz** | KI + WhatsApp + ArbZG in simpel | Noch kein Produkt | 0€ (MVP) |

**Positionierung:** Keiner der Wettbewerber kombiniert KI-Planerstellung + WhatsApp-Delivery + deutsche ArbZG-Compliance in einem einfachen Paket.

---

## 3. Tech-Stack

| Komponente | Lösung | Kosten |
|---|---|---|
| Frontend + API | Next.js 14 (App Router) + TypeScript + TailwindCSS + shadcn/ui | Vercel Free Tier |
| Datenbank | PostgreSQL 16 via Docker auf Strato V-Server | 0€ (bereits bezahlt) |
| ORM | Prisma | Open Source |
| Auth | Dev-Account (hardcoded) → später Clerk | 0€ |
| Queue (ab Phase 3) | BullMQ + Redis via Docker auf Strato V-Server | 0€ |
| KI (ab Phase 3) | OpenAI GPT-4o-mini | Pay-per-use (~0,15$/1M Input-Tokens) |
| WhatsApp (ab Phase 4) | 360dialog oder Twilio | Pay-per-message (~0,05€/Nachricht) |

**Effektive Kosten bis Phase 3: 0€.**

### Infrastruktur

- **Vercel:** Frontend-Hosting + Serverless API Routes
- **Strato V-Server:** Docker-Host für PostgreSQL + Redis
- **Docker Compose:** Orchestrierung der DB-Services

```yaml
# docker-compose.yml (Strato V-Server)
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: schichtblitz
      POSTGRES_USER: schichtblitz
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    restart: unless-stopped

volumes:
  pgdata:
  redisdata:
```

---

## 4. Workflow

### 4.1 Ersteinrichtung (einmalig)

**Schritt 1 — Betrieb anlegen:**
- Name, Adresse, Branche (Restaurant/Café/Bar/Imbiss)
- Öffnungszeiten pro Wochentag (z.B. Mo–Sa 10:00–23:00, So 11:00–22:00)
- Grundlage für alles — Schichten können nur innerhalb der Öffnungszeiten liegen

**Schritt 2 — Schichtvorlagen definieren:**
- Chef legt typische Schichten an, z.B.:
  - Frühschicht: 06:00–14:00, braucht 2 MA, davon 1× Küche + 1× Service
  - Mittagsschicht: 10:00–16:00, braucht 3 MA
  - Spätschicht: 16:00–23:00, braucht 4 MA, davon 1× Bar
- Pro Schicht: Name, Start, Ende, Anzahl MA, benötigte Qualifikationen
- Templates sind wiederverwendbar — einmal anlegen, jede Woche nutzen

**Schritt 3 — Mitarbeiter anlegen:**
- Zwei Wege:
  - **Schnell-Anlage:** Nur Name + Vertragsart + Wochenstunden (reicht zum Planen)
  - **Vollständig:** + Stundenlohn, Qualifikationen, Telefon, Geburtsdatum (für Jugendarbeitsschutz)
- Vertragsart bestimmt die Regeln automatisch: Vollzeit (40h), Teilzeit (z.B. 20h), Minijob (520€-Grenze)
- Qualifikationen per Chip/Tag: Küche, Service, Bar, Kasse — Mehrfachauswahl

**Schritt 4 — Verfügbarkeiten erfassen:**
- Pro MA pro Wochentag: verfügbar / nicht verfügbar / bevorzugt
- Optional mit Zeitfenster: "Montag nur ab 14:00"
- Input für die KI-Planung — ohne Verfügbarkeiten plant die KI blind

### 4.2 Regelwerk (Compliance-Setup)

**A) Gesetzliche Regeln (voreingestellt, nicht abschaltbar):**
- Max. 10h/Tag mit Ausgleich (§3 ArbZG)
- Min. 10h Ruhezeit zwischen Schichten — Gastro-Ausnahme (§5 Abs. 2 ArbZG)
- Pausenregelung: 30min ab 6h, 45min ab 9h (§4 ArbZG)
- Minijob: 520€-Grenze automatisch berechnet
- Jugendarbeitsschutz wenn Geburtsdatum < 18 Jahre (JArbSchG)

**B) Betriebsregeln (Phase 1: hardcoded Defaults → später konfigurierbar im UI):**
- Max. Tage am Stück (Default: 5)
- Min. freie Wochenenden pro Monat (Default: 1)
- Qualifikations-Mindestbesetzung pro Schicht
- Team-Regeln (z.B. "Azubi nie alleine in der Küche")
- Fairness-Regeln (z.B. "Wochenend-Schichten gleichmäßig verteilen")

> **Strategie:** Betriebsregeln starten als sinnvolle Defaults (hardcoded). Ab Phase 2/3 werden sie als eigenes DB-Modell (`BusinessRule`) konfigurierbar im UI — der Chef kann Werte anpassen, Regeln ein-/ausschalten.

### 4.3 Wöchentlicher Planungs-Workflow

```
Schritt 1: Abwesenheiten prüfen
    ↓
Schritt 2: Plan generieren (KI) oder manuell erstellen
    ↓
Schritt 3: Compliance-Check (automatisch)
    ↓
Schritt 4: Anpassen & Bestätigen
    ↓
Schritt 5: Veröffentlichen → WhatsApp an Team
```

**Schritt 1 — Abwesenheiten prüfen:**
- Dashboard zeigt: "KW 12 planen — 2 Abwesenheiten eingetragen"
- Urlaub (genehmigt), Krankmeldungen, Frei-Wünsche
- Frei-Wünsche kann der Chef hier genehmigen/ablehnen

**Schritt 2 — Plan erstellen:**
- **KI-Weg (ab Phase 3):** Button "Plan generieren" → App schickt alle MA-Daten, Verfügbarkeiten, Abwesenheiten, Schichttemplates und Regeln an GPT → bekommt optimalen Wochenplan zurück
- **Manueller Weg (Phase 1):** Kalender-Grid öffnen, auf leere Zelle tippen, MA auswählen. App zeigt Verfügbarkeit und Eignung pro MA an.
- **Hybrid:** KI-Plan generieren lassen, dann manuell nachjustieren

**Schritt 3 — Compliance-Check (automatisch):**
- Läuft bei jeder Änderung in Echtzeit
- Inline-Warnungen im Kalender-Grid
- Errors (rot): blockieren Veröffentlichung
- Warnings (gelb): erlauben Veröffentlichung mit Bestätigung

**Schritt 4 — Anpassen:**
- Drag & Drop: MA zwischen Schichten verschieben
- Tausch vorschlagen: "Wer kann stattdessen?"
- Unterbesetzung sichtbar: "Mittwoch Spätschicht: 3/4 MA besetzt"

**Schritt 5 — Veröffentlichen:**
- Status wechselt von DRAFT → PUBLISHED
- WhatsApp-Nachricht an alle MA (ab Phase 4): "Dein Schichtplan KW 12: Mo 06–14, Di frei, Mi 16–23..."
- PDF-Export für Aushang

---

## 5. Datenmodell

```
Organization
├── Location (Multi-Standort)
│   ├── Employee
│   │   ├── Vertragsart (Vollzeit / Teilzeit / Minijob)
│   │   ├── Wochenstunden-Soll
│   │   ├── Stundenlohn
│   │   ├── Qualifikationen (Küche / Service / Bar / Kasse)
│   │   ├── Availability (pro Wochentag + Zeitfenster)
│   │   └── Absence (Urlaub / Krank / Frei-Wunsch)
│   │
│   ├── ShiftTemplate
│   │   ├── Name (z.B. Frühschicht, Spätschicht)
│   │   ├── Startzeit / Endzeit
│   │   ├── Benötigte Anzahl MA
│   │   └── Benötigte Qualifikationen
│   │
│   └── WeekPlan (KW, Status: draft / published)
│       └── ShiftAssignment (Employee ↔ ShiftTemplate ↔ Tag)
│           └── ComplianceViolation (Regel, Schwere, Beschreibung)
```

### Prisma-Schema (Entwurf)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Organization {
  id        String     @id @default(cuid())
  name      String
  locations Location[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model Location {
  id             String          @id @default(cuid())
  name           String
  address        String?
  organizationId String
  organization   Organization    @relation(fields: [organizationId], references: [id])
  employees      Employee[]
  shiftTemplates ShiftTemplate[]
  weekPlans      WeekPlan[]
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
}

enum ContractType {
  FULLTIME
  PARTTIME
  MINIJOB
}

enum Qualification {
  KITCHEN
  SERVICE
  BAR
  CASHIER
}

model Employee {
  id              String          @id @default(cuid())
  firstName       String
  lastName        String
  email           String?
  phone           String?
  contractType    ContractType
  weeklyHours     Float
  hourlyRate      Float?
  qualifications  Qualification[]
  startDate       DateTime
  isActive        Boolean         @default(true)
  locationId      String
  location        Location        @relation(fields: [locationId], references: [id])
  availabilities  Availability[]
  absences        Absence[]
  shiftAssignments ShiftAssignment[]
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

enum DayOfWeek {
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
  SUNDAY
}

enum AvailabilityStatus {
  AVAILABLE
  UNAVAILABLE
  PREFERRED
}

model Availability {
  id         String             @id @default(cuid())
  employeeId String
  employee   Employee           @relation(fields: [employeeId], references: [id])
  dayOfWeek  DayOfWeek
  status     AvailabilityStatus
  startTime  String?            // "06:00" — null = ganzer Tag
  endTime    String?            // "14:00"
  createdAt  DateTime           @default(now())
  updatedAt  DateTime           @updatedAt

  @@unique([employeeId, dayOfWeek])
}

enum AbsenceType {
  VACATION
  SICK
  FREE_WISH
  OTHER
}

enum AbsenceStatus {
  PENDING
  APPROVED
  REJECTED
}

model Absence {
  id         String        @id @default(cuid())
  employeeId String
  employee   Employee      @relation(fields: [employeeId], references: [id])
  type       AbsenceType
  status     AbsenceStatus @default(PENDING)
  startDate  DateTime
  endDate    DateTime
  note       String?
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt
}

model ShiftTemplate {
  id                  String          @id @default(cuid())
  name                String          // "Frühschicht", "Spätschicht"
  startTime           String          // "06:00"
  endTime             String          // "14:00"
  requiredEmployees   Int
  requiredQualifications Qualification[]
  locationId          String
  location            Location        @relation(fields: [locationId], references: [id])
  shiftAssignments    ShiftAssignment[]
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt
}

enum WeekPlanStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model WeekPlan {
  id               String           @id @default(cuid())
  calendarWeek     Int              // KW 1-53
  year             Int
  status           WeekPlanStatus   @default(DRAFT)
  locationId       String
  location         Location         @relation(fields: [locationId], references: [id])
  shiftAssignments ShiftAssignment[]
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt

  @@unique([locationId, calendarWeek, year])
}

model ShiftAssignment {
  id              String               @id @default(cuid())
  weekPlanId      String
  weekPlan        WeekPlan             @relation(fields: [weekPlanId], references: [id])
  shiftTemplateId String
  shiftTemplate   ShiftTemplate        @relation(fields: [shiftTemplateId], references: [id])
  employeeId      String
  employee        Employee             @relation(fields: [employeeId], references: [id])
  dayOfWeek       DayOfWeek
  violations      ComplianceViolation[]
  createdAt       DateTime             @default(now())
  updatedAt       DateTime             @updatedAt

  @@unique([weekPlanId, shiftTemplateId, employeeId, dayOfWeek])
}

enum ViolationSeverity {
  WARNING
  ERROR
}

model ComplianceViolation {
  id                String            @id @default(cuid())
  shiftAssignmentId String
  shiftAssignment   ShiftAssignment   @relation(fields: [shiftAssignmentId], references: [id])
  rule              String            // "MAX_DAILY_HOURS", "MIN_REST_PERIOD", etc.
  severity          ViolationSeverity
  message           String            // "Max. 10h/Tag überschritten (geplant: 11h)"
  createdAt         DateTime          @default(now())
}
```

---

## 6. ArbZG-Compliance-Regeln (Gastro-spezifisch)

### Gesetzliche Grundlagen

| Regel | Gesetz | Details |
|---|---|---|
| Max. Arbeitszeit | §3 ArbZG | 8h/Tag, bis 10h mit Ausgleich innerhalb 24 Wochen |
| Ruhezeit | §5 ArbZG | 11h zwischen Schichten, Gastro-Ausnahme: 10h (§5 Abs. 2) |
| Sonntagsarbeit | §11 ArbZG | Erlaubt in Gastro, aber 15 Sonntage/Jahr müssen frei sein |
| Minijob-Grenze | MiLoG | 520€/Monat → max. Stunden = 520€ ÷ Stundenlohn |
| Jugendarbeitsschutz | JArbSchG | Max. 8h/Tag, 40h/Woche, keine Nachtarbeit nach 22:00 |
| Pausenregelung | §4 ArbZG | 30min ab 6h, 45min ab 9h Arbeitszeit |
| Aufzeichnungspflicht | §17 MiLoG | Beginn, Ende und Dauer für Minijobber dokumentieren |

### Compliance-Engine Verhalten

- **Echtzeit-Validierung:** Beim Planen werden Verstöße sofort inline angezeigt (rote/gelbe Markierung)
- **Blocking vs. Warning:** ERROR-Verstöße (z.B. Jugendarbeitsschutz) blockieren Veröffentlichung, WARNINGs (z.B. Überstunden mit Ausgleich möglich) erlauben Veröffentlichung mit Hinweis
- **Minijob-Rechner:** Automatische Berechnung der verbleibenden Stunden pro Monat basierend auf Stundenlohn und 520€-Grenze

---

## 7. Phasen & Sprint-Plan

### Phase 1: MA- & Verfügbarkeits-Management (Sprint 1–3)

**Sprint 1 — Grundgerüst & Mitarbeiterverwaltung**
- Projekt-Setup: Next.js 14, Prisma, PostgreSQL (Docker), Dev-Account
- Organization + Location + Employee CRUD
- Employee-Felder: Name, Vertragsart, Wochenstunden, Stundenlohn, Qualifikationen, Eintrittsdatum
- Onboarding-Flow: Betrieb anlegen → erste MA erfassen
- Mobile-first UI: MA-Liste, MA-Detail, Hinzufügen-Dialog

**Sprint 2 — Verfügbarkeiten & Schichtvorlagen**
- Availability-Modell: pro MA pro Wochentag (verfügbar/nicht verfügbar/bevorzugt + Zeitfenster)
- ShiftTemplate-Modell: Name, Start, Ende, benötigte Anzahl MA, benötigte Qualifikationen
- Templates-UI: Frühschicht 06–14, Spätschicht 14–22 etc. — frei konfigurierbar
- Wochen-Übersicht: Kalender-Grid (Tage × Schichten), noch ohne Zuordnung

**Sprint 3 — Manuelle Planerstellung**
- WeekPlan + ShiftAssignment CRUD
- Drag & Drop UI: MA auf Schicht ziehen
- Verfügbarkeits-Anzeige beim Planen (grün/gelb/rot pro MA pro Slot)
- Wochenplan-Ansicht (Kalender) + MA-Ansicht ("mein Plan diese Woche")
- PDF-Export des Wochenplans (Aushang-tauglich)

### Phase 2: ArbZG-Compliance-Engine (Sprint 4–5)

**Sprint 4 — Regelwerk & Validierung**
- ComplianceRule-Engine: konfigurierbare Regeln pro Betrieb
- Kernregeln: Max-Arbeitszeit, Ruhezeit, Sonntags-Regelung, Minijob-Stundendeckel, Jugendarbeitsschutz, Pausen
- Echtzeit-Validierung beim Planen: Warnungen inline im Kalender-Grid
- ComplianceViolation-Log: was wurde wann warum geflaggt

**Sprint 5 — Abwesenheiten & Stundentracking**
- Absence-Modell: Urlaub, Krank, Frei-Wunsch mit Genehmigungsflow
- Stunden-Übersicht pro MA pro Woche/Monat (Soll vs. Ist)
- Minijob-Warnung: "Lisa hat noch 12h übrig diesen Monat bis zur 520€-Grenze"
- Überstunden-Tracking mit ArbZG-Ausgleichszeitraum (24 Wochen)

### Phase 3: KI-Plangeneration (Sprint 6–7)

**Sprint 6 — KI-Kern**
- Prompt-Engineering: GPT-4o-mini bekommt MA-Daten, Verfügbarkeiten, Schichttemplates, Compliance-Regeln, Abwesenheiten → optimaler Wochenplan
- Constraint-Solving: Fairness (gleichmäßige Verteilung), Qualifikations-Match, Wunsch-Berücksichtigung
- Async-Queue: BullMQ + Redis → Plan generieren → Review-Ansicht
- "Plan generieren"-Button → Vorschlag → manuell anpassen → bestätigen

**Sprint 7 — KI-Feinschliff**
- Lerneffekt: Feedback aus manuellen Korrekturen speichern
- Fairness-Score: Visualisierung wer wie oft Wochenende/Feiertag arbeitet
- Multi-Vorschlag: 2–3 Plan-Varianten zur Auswahl
- "Warum diese Zuordnung?"-Erklärungen pro Schicht

### Phase 4: WhatsApp-Integration (Sprint 8–9)

**Sprint 8 — Notifications**
- WhatsApp Business API (360dialog oder Twilio)
- Wochenplan-Versand an alle MA (personalisiert: "Deine Schichten diese Woche")
- Erinnerungen: 12h vor Schichtbeginn
- MA-Opt-in-Flow (DSGVO-konform)

**Sprint 9 — Zwei-Wege-Kommunikation**
- MA kann per WhatsApp: Verfügbarkeit melden, Tausch anfragen, Krank melden
- Tauschbörse: "Kann jemand Samstag für mich übernehmen?" → Broadcast an qualifizierte MA
- Chef-Dashboard: eingehende Anfragen genehmigen/ablehnen

---

## 8. UI-Konzept (Mobile-first)

### Hauptnavigation (Bottom Tab Bar)
1. **Dashboard** — Aktuelle KW-Übersicht, offene Anfragen, Warnungen
2. **Wochenplan** — Kalender-Grid (Tage × Schichten), Drag & Drop, KI-Button
3. **Team** — MA-Liste, Verfügbarkeiten, Abwesenheiten
4. **Einstellungen** — Betrieb, Schichtvorlagen, Compliance-Regeln

### Kern-Screens
- **Wochenplan-Grid:** Spalten = Mo–So, Zeilen = Schichtvorlagen. Jede Zelle zeigt zugewiesene MA mit Farbcoding (Qualifikation) und Compliance-Status (grün/gelb/rot).
- **MA-Zuordnung:** Tippe auf leere Zelle → Liste verfügbarer MA (sortiert nach Eignung: Qualifikation + Verfügbarkeit + Fairness-Score).
- **KI-Vorschlag:** Floating Action Button "Plan generieren" → Ladeanimation → Vorschlag mit Diff-Ansicht (was hat die KI geändert).

---

## 9. Offene Entscheidungen

- [ ] Domain & Branding (schichtblitz.de?)
- [ ] Clerk vs. anderer Auth-Provider (nach MVP)
- [ ] KI-Modell: GPT-4o-mini vs. lokales Modell vs. Constraint-Solver ohne LLM
- [ ] WhatsApp-Provider: 360dialog vs. Twilio vs. Meta Cloud API direkt
- [ ] Monetarisierung: Freemium? Per-MA-Pricing? Flat Fee?
- [ ] Native App später? (PWA als Zwischenlösung?)
