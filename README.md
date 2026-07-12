# Flutlicht-Helden Hub

Statistik- und Managementplattform für EA FC Pro Clubs.

## Lokaler Start

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Dann öffnen: http://localhost:3000

## V1.0 Scope

- Spieler verwalten
- Wettbewerbe verwalten
- Saisons verwalten
- Spiele anlegen
- Kader verwalten
- Spielerleistungen erfassen
- Basis-Statistiken berechnen
- Dashboard & Rankings anzeigen
