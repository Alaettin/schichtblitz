# SchichtBlitz — Sprint 1 Status

## Abgeschlossen
- [x] Phase A: Projekt-Bootstrap (Next.js 14, TailwindCSS, shadcn/ui, Docker-Config)
- [x] Phase B: Datenbank (Prisma Schema + Client generiert)
- [x] Phase C: Auth + Core Lib (Dev-Auth, Zod-Validierungen, Types)
- [x] Phase D+E: Layout (Header, MobileNav, PageHeader) + API Routes (CRUD)
- [x] Phase G+H: Hooks (SWR) + Feature-Komponenten (Employee + Onboarding)
- [x] Phase I: Alle Pages (/, /onboarding, /team, /team/[id], /dashboard, /wochenplan, /einstellungen)
- [x] Phase J: Build-Test — TypeScript + Lint sauber, Build erfolgreich

## Offen / Nächste Schritte
- [ ] Docker starten (`docker compose up -d`)
- [ ] DB migrieren (`npx prisma migrate dev --name init`)
- [ ] Seed-Daten laden (`npx prisma db seed`)
- [ ] App manuell testen (`npm run dev`)
- [ ] Onboarding-Flow durchspielen
- [ ] CRUD-Operationen testen
- [ ] Mobile Responsiveness prüfen
