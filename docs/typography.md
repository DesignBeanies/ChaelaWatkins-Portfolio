# Typography

Reference for the portfolio type scale. **Source of truth:** [`src/lib/typography.ts`](../src/lib/typography.ts).

All tokens are Tailwind class strings. Import them in components — do not copy pixel values inline.

```ts
import {
  typeBody,
  typeCardTitle,
  typeCtaMd,
  typeCtaSm,
  typeCtaXs,
  typeDecorativeGlyph,
  typeDisplay,
  typeIconClose,
  typeIconSm,
  typeIntro,
  typeLead,
  typeMeta,
  typePill,
  typeSection,
  typeSectionOnDark,
  typeSectionScroll,
  typeSubsection,
  typeUiLabel,
} from "@/lib/typography";
```

## Font

| Property | Value |
|----------|--------|
| Family | **Afacad** (Google Font via `next/font`) |
| Weights loaded | 400, 500, 600, 700 |
| Applied | `font-sans` on `<body>` in `src/app/layout.tsx` |
| Colors | `text-ink` (`#0f0000`) by default; override per context (e.g. `text-hwite`, `text-ink/80`) |

### Tailwind must scan `src/lib/`

Token classes live in `typography.ts`, not only in JSX string literals. **`tailwind.config.ts` must include `./src/lib/**/*.{js,ts,jsx,tsx,mdx}`** in `content`. If that path is missing, utilities like `text-[32px]` never reach the CSS bundle and headings fall back to ~16px body size.

After changing `typography.ts` or `tailwind.config.ts`, run `npm run verify`. If dev looks wrong or clicks stop working, `rm -rf .next && npm run dev`.

---

## Editorial scale

Use these for page content in `PortfolioPage.tsx`. Prefer the **lowest token that fits** — do not add new sizes.

| Token | Mobile | Desktop | Weight | Leading | Use for |
|-------|--------|---------|--------|---------|---------|
| `typeDisplay` | 64px | 96px | normal | 55px / 0.85 | Hero title only (“UX & PRODUCT DESIGNER”, uppercase) |
| `typeIntro` | 24px | 36px | normal | tight | Hero name line (“I’m Chaela Watkins”) |
| `typeSection` | 32px | 48px | normal | 1.1 | Major sections: “Who are you?”, “Case studies”, “What I do”, “Let’s chat IRL” |
| `typeSectionOnDark` | same as `typeSection` | same | same | same | Section headings on **`bg-ink`** surfaces (espresso break) — use instead of `typeSection` + `text-hwite` |
| `typeSectionScroll` | same as `typeSection` | same | same | same + `scroll-mt-24 md:scroll-mt-28` | **Case study project titles** and anchored Jane H2s (`id` + `tabIndex={-1}`) |
| `typeSubsection` | 24px | 32px | normal | 1.15 | Challenge / Solution / Design & build labels, column titles, Jane row labels, principle titles, **Before / After** |
| `typeLead` | 18px | 24px | normal | snug | One line under a heading: hub intro, hero blurb, **case study subtitle** |
| `typeBody` | **16px** | **16px** | normal | **1.76** | **All** long-form body copy |

### Hierarchy rules

1. **Section title = case study project title** — both use `typeSection` / `typeSectionScroll` (not bold, same 32/48 scale).
2. **Subsection labels are one tier** — “The Challenge”, “Design & build”, Jane “My experience”, and “Before / After” all use `typeSubsection`.
3. **Body is always 16px** — case study paragraphs, Jane lists, principle bodies, hub card descriptions, lens card descriptions, contact footer blurb. No 18px or 24px body text.
4. **Lead vs body** — metrics line under a project title (`subtitle` in data) = `typeLead`. Multi-sentence copy = `typeBody`.

---

## UI chrome (not editorial headings)

| Token | Size | Weight | Use for |
|-------|------|--------|---------|
| `typeCardTitle` | **24px** | bold | Hub case study card titles, lens picker titles, **memory-card case study name** |
| `typePill` | 14px | normal | Skill pills on case studies |
| `typeUiLabel` | 14px | bold, uppercase | Memory-card dialog title bar (“Loading”, “Ready”) |
| `typeMeta` | 11px | bold, uppercase | “Memory card” frame label, “Please wait…” status |
| `typeCtaXs` | 12px | bold (via `retroCtaClasses`) | Retro CTA `size="xs"` label |
| `typeCtaSm` | 13px → 14px | bold (via `retroCtaClasses`) | Retro CTA `size="sm"` — lens pill, scroll hint, hub “View” |
| `typeCtaMd` | 16px | bold (via `retroCtaClasses`) | Retro CTA default — Email, LinkedIn, Play |
| `typeDecorativeGlyph` | 48px | bold | Placeholder initial when hub / memory-card image is missing |
| `typeIconClose` | 24px | bold | Memory-card loader close (×) |
| `typeIconSm` | 14px | — | Lens-pill chevron, other inline icons |

**Padding / borders / shadows** for retro CTAs stay in `retroCtaClasses` (`PortfolioPage.tsx`). Only the label size + tracking are tokenized.

---

## Where each token is used

| Screen / block | Heading | Subcopy / body |
|----------------|---------|----------------|
| Hero | `typeDisplay` | `typeIntro`, `typeLead` |
| Who are you? | `typeSection` | — |
| Lens picker cards | `typeCardTitle` | `typeBody` |
| Hub | `typeSection` | `typeLead` (intro) |
| Hub cards | `typeCardTitle` | `typeBody` + `text-ink/80` |
| Case study (recruiter & designer) | `typeSectionScroll` | `typeLead` (subtitle) |
| Challenge / Solution | `typeSubsection` via `DetailRow` | `typeBody` |
| Design & build (designer) | `typeSubsection` | `typeBody` |
| Before / After | `typeSubsection` (figcaption) | — |
| Jane — What I do | `typeSectionScroll` | `typeBody` in rows |
| Jane — row labels | `typeSubsection` (`JaneRow`) | — |
| Jane — principles | `typeSubsection` | `typeBody` |
| Espresso break | `typeSectionOnDark` | — |
| Contact footer | `typeSection` (“Let’s chat IRL”) | `typeBody` (blurb); Email / LinkedIn use `retroCtaClasses` + `typeCtaMd` |
| Memory card loader | `typeUiLabel` (title bar) | `typeCardTitle` (study name), `typeMeta` (frame + wait) |
| Lens pill | — | `typeBody` (label + menu items); chevron → `typeIconSm` |
| App error page | `typeLead` | `typeBody` |

---

## Adding a case study

### Recruiter (`PROJECTS` in `PortfolioPage.tsx`)

Layout is handled by `ProjectSection`. You only add data; typography is automatic:

- **Title** → `typeSectionScroll`
- **Subtitle** → `typeLead`
- **Challenge / Approach / Solution** → `DetailRow` (`typeSubsection` + `typeBody`)
- **Before / After** → `typeSubsection` captions
- **Skills** → `typePill` via `CaseStudySkillPills`

### Designer (`DESIGNER_PROJECTS`)

Layout is handled by `DesignerProjectSection`:

- **Title** → `typeSectionScroll`
- **Subtitle** → `typeLead`
- **Challenge / Solution** → `DetailRow`
- **Design & build** — `designBuild` array: each column title → `typeSubsection`, body → `typeBody`
- **Before / After** → same as recruiter

### Hub preview card

Hub sections are generated from the same project arrays. Card title/description use `typeCardTitle` and `typeBody` automatically.

---

## Changing the scale

1. Edit values **only** in `src/lib/typography.ts`.
2. Run `npm run verify` (lint + build + styling checks).
3. Spot-check at **375px** and **1280px**: hero, hub, one full-scroll case study per lens, Jane, contact footer.

Do not add one-off `text-[Npx]` for editorial content — extend the tokens if a new role is truly needed.

---

## Checklist when adding new UI

Use this whenever you add a component, section, or screen:

1. **Pick an existing token** from the tables above. If nothing fits, add a named export in `typography.ts` and document it here — do not inline `text-[Npx]`.
2. **Import the token** in the component (`import { typeBody, … } from "@/lib/typography"`).
3. **Update this doc** — add a row to “Where each token is used” (or the token table if you created a new one).
4. **Run `npm run verify`** and spot-check mobile + desktop.
5. **If dev looks unstyled** after a Tailwind or token change: `rm -rf .next && npm run dev` (stale cache can drop token utilities or JS chunks).

### Quick token picker

- [ ] Major heading? → `typeSection` or `typeSectionScroll` if it needs scroll anchor
- [ ] Label under a major heading (metrics, intro line)? → `typeLead`
- [ ] Section label (challenge, row name, before/after)? → `typeSubsection`
- [ ] Paragraph or list content? → `typeBody` (16px)
- [ ] Interactive card title on hub/lens picker? → `typeCardTitle`
- [ ] Skill tag? → `typePill`
- [ ] Retro press button? → `retroCtaClasses` + `typeCtaXs` / `typeCtaSm` / `typeCtaMd`
- [ ] Memory-card / dialog chrome? → `typeUiLabel`, `typeMeta`, `typeIconClose`
- [ ] Missing-image placeholder letter? → `typeDecorativeGlyph`
