/** Afacad type scale — single source for editorial + UI copy in PortfolioPage. */
/** Full reference: docs/typography.md */

/** Hero “UX & PRODUCT DESIGNER” */
export const typeDisplay =
  "text-[64px] font-normal uppercase leading-[55px] text-ink md:text-[96px] md:leading-[0.85]";

/** “I’m Chaela Watkins” */
export const typeIntro =
  "text-[24px] font-normal leading-tight text-ink md:text-[36px]";

/** Major sections, case study project titles, espresso + contact headings */
export const typeSection =
  "text-[32px] font-normal leading-[1.1] text-ink md:text-[48px]";

export const typeSectionScroll =
  `${typeSection} scroll-mt-24 outline-none md:scroll-mt-28`;

/** Challenge / Solution, Design & build, Jane rows, principles, Before / After */
export const typeSubsection =
  "text-[24px] font-normal leading-[1.15] text-ink md:text-[32px]";

/** Deck lines: hub intro, hero blurb, case study subtitle */
export const typeLead =
  "text-[18px] font-normal leading-snug text-ink md:text-[24px]";

/** All long-form body copy — 16px everywhere */
export const typeBody = "text-[16px] font-normal leading-[1.76] text-ink";

/** Hub case study cards + “Who are you?” lens picker card titles */
export const typeCardTitle =
  "text-[24px] font-bold leading-tight text-ink";

/** Skill pills */
export const typePill = "text-[14px] font-normal leading-none text-ink";

/** Muted uppercase labels (memory card frame, wait state, etc.) */
export const typeMeta =
  "text-[11px] font-bold uppercase tracking-widest text-ink/60";

/** Memory-card dialog title bar (Loading, Ready) */
export const typeUiLabel =
  "text-[14px] font-bold uppercase tracking-wide text-ink";

/** Retro CTA label sizes — pair with padding in `retroCtaClasses` */
export const typeCtaXs = "text-[12px] tracking-[0.1em]";
export const typeCtaSm = "text-[13px] tracking-[0.12em] md:text-[14px]";
export const typeCtaMd = "text-[16px] tracking-[0.15em]";

/** Placeholder initials when a hub / memory-card image is missing */
export const typeDecorativeGlyph = "text-[48px] font-bold leading-none";

/** Dialog close control (×) */
export const typeIconClose = "text-[24px] font-bold leading-none";

/** Small inline icons (lens-pill chevron, etc.) */
export const typeIconSm = "text-[14px] leading-none";
