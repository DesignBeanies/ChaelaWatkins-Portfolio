# Portfolio

A Next.js 14 portfolio landing page implemented from a Figma design.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** for styling
- **Framer Motion** for animation
- **Afacad** (Google Fonts) for typography

## Design source

Figma: [2024 Branding Ideation — Homepage_Desktop](https://www.figma.com/design/47824KGJXNC7IGpgxvzAhC/2024-Branding-Ideation?node-id=344-5401&m=dev)

## Interaction

The homepage shows a hero, a "Who are you?" question, and three selectable cards (Recruiter / Designer / Jane Doe). Clicking a card:

1. Animates a 4px black divider line downward (`~600ms`, ease-out-cubic)
2. Reveals an empty variant section beneath it (fade + slide, `~500ms`, delayed `250ms`)

The variant section is intentionally a placeholder — routing / variant content / real selection logic is not wired yet. See the `TODO` comments in `src/app/page.tsx`.

## Assets

All illustrations are SVGs in `public/`:

| File               | Usage                     |
| ------------------ | ------------------------- |
| `rainbow-hero.svg` | Hero decorative wave      |
| `recruiter.svg`    | Retro phone character     |
| `designer.svg`     | Retro soda-can character  |
| `jane-doe.svg`     | Retro ghost character     |

## Design tokens

Colors from the Figma file are exposed as Tailwind theme colors in `tailwind.config.ts`:

- `hwite` (#f7f8f8), `ink` (#0f0000)
- `sunnies` (#febe14), `coldday` (#33847b), `tear` (#a9dac9)
- `farmersmarket` (#9cc581), `millennial` (#ffb5b6)
- `salmon` (#f76e6e), `goldenhour` (#e98142)

Typography tokens (`typeSection`, `typeBody`, etc.) live in `src/lib/typography.ts`. See **[docs/typography.md](docs/typography.md)** for the full scale, hierarchy rules, and how to add case studies.

## Scripts

```bash
npm run dev     # start dev server
npm run build   # production build
npm run start   # run production build
npm run lint    # lint
```

## Prerequisites

- Node 20+ (use `nvm install 20`)
