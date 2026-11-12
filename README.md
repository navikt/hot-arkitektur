# hot-arkitektur

Arkitekturportal for Team HOT (Hjelpemidler og tilrettelegging) i Nav. Portalen viser domenemodell og databasemodell for Hotsak. Den er åpen, uten innlogging, og bygget med Next.js og Aksel.

## Kjøre lokalt

Krever Node 22.12 eller nyere og pnpm 10.

```bash
pnpm install
pnpm dev
```

Portalen åpnes på http://localhost:3000.

| Kommando         | Hva den gjør                               |
| ---------------- | ------------------------------------------ |
| `pnpm typecheck` | Typesjekker med `tsc`                      |
| `pnpm lint`      | Kjører Oxlint                              |
| `pnpm test`      | Kjører datatestene i `scripts/*.test.mjs`  |
| `pnpm build`     | Bygger portalen (standalone-resultat)      |

## Struktur

- `app/`: sider og layout. `app/globals.css` har rammen (sidebar, hero, hoppmeny).
- `components/`: sidebar, tema og delte byggeklosser. `components/page/` har `Section`, `JumpNav` og `HeroStats`.
- `lib/navigation.ts`: den ene listen over menypunkter.
- `lib/`: tema, sidebar, fargetoner og SVG-hjelpere.
- `data/schema.json`: databaseskjemaet, generert fra Hotsak.
- `scripts/`: skjemagenerering og datatester.
- `.nais/`: Nais-manifest og miljøvariabler.

Sidespesifikk CSS ligger i CSS-moduler ved siden av komponentene, ikke i `app/globals.css`.

## Legge til en side

1. Lag `app/<sti>/page.tsx` og eksporter `metadata` med tittel.
2. Legg siden til i `NAVIGATION` i `lib/navigation.ts`. Typen `PageHref` oppdateres av seg selv.

## Legge til en applikasjon

1. Lag mappen `app/applikasjoner/<applikasjon>/` med en `page.tsx` som lenker til modellsidene.
2. Legg en ny seksjon eller gruppe for applikasjonen i `lib/navigation.ts`.
3. Legg applikasjonen til i listen i `app/applikasjoner/page.tsx`.

## Generere databaseskjemaet

`data/schema.json` genereres fra Flyway-migreringene i hotsak-api. Skriptet kjører migreringene i PGlite, så det trenger ikke en kjørende database.

```bash
HOTSAK_API_DIR=../hotsak-api pnpm schema
pnpm schema:check
```

- `pnpm schema` leser migreringene fra `HOTSAK_API_DIR` (standard `../hotsak-api`) og skriver `data/schema.json`.
- `pnpm schema:check` sammenligner fingeravtrykket i den innsjekkede filen med migreringene lokalt. CI kjører ikke denne, fordi CI ikke sjekker ut hotsak-api.

## Deploy

Workflowen `.github/workflows/build-deploy.yaml` kjører ved push til `main`, ved pull request og manuelt.

1. Typesjekk, lint, test og `pnpm build`.
2. `nais/docker-build-push` lager imaget fra `Dockerfile`, som bare kopierer `.next/standalone`, `.next/static` og `public`.
3. `nais/deploy` ruller ut til dev-gcp med `.nais/nais.yaml` og verdiene i `.nais/dev.yaml`.

Pull requests bygger og tester, men deployer ikke.

Portalen kjører i namespace `teamdigihot` og er tilgjengelig på:

- https://hot-arkitektur.intern.dev.nav.no
- https://hot-arkitektur.ansatt.dev.nav.no
