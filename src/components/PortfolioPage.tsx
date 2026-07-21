"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { publicPath } from "@/lib/publicPath";
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
  typeSectionScroll,
  typeSubsection,
  typeUiLabel,
} from "@/lib/typography";

// ───────────────────────────────────────────────────────────────────────────
// Lens model
// ───────────────────────────────────────────────────────────────────────────

type Lens = "recruiter" | "designer" | "jane";

type LensMeta = {
  label: string;
  desc: string;
  bg: string;
  // Tailwind class for the "Am I the right fit?" band background.
  fitBg: string;
  character: {
    src: string;
    width: number;
    height: number;
    alt: string;
  };
};

const LENS_ORDER: Lens[] = ["recruiter", "designer", "jane"];

const LENSES: Record<Lens, LensMeta> = {
  recruiter: {
    label: "Recruiter",
    desc: "I don’t know a lot about design but I know the requirements my client or company is looking for.",
    bg: "#ffb5b6",
    fitBg: "bg-millennial",
    character: {
      src: publicPath("/recruiter.svg"),
      width: 247,
      height: 226,
      alt: "Retro phone character",
    },
  },
  designer: {
    label: "Designer",
    desc: "The craft and the outcome both matter. I’m trying to figure out if you can actually deliver it.",
    bg: "#a9dac9",
    fitBg: "bg-tear",
    character: {
      src: publicPath("/designer.svg"),
      width: 188,
      height: 213,
      alt: "Retro soda-can character",
    },
  },
  jane: {
    label: "Jane Doe",
    desc: "I’m not sure why I’m here yet but something made me click and now I’m curious.",
    bg: "rgba(254, 190, 20, 0.55)",
    fitBg: "bg-goldenhour/60",
    character: {
      src: publicPath("/jane-doe.svg"),
      width: 166,
      height: 199,
      alt: "Retro ghost character",
    },
  },
};

type ContentView = "hub" | "full" | "caseStudy";

type DrawerSnapshot = {
  lens: Lens | null;
  contentView: ContentView;
  /** Hub→full: curtain line sits below the hub block, not at the hero. */
  anchor?: "hero" | "belowHub";
};

function caseStudyId(title: string): string {
  return `case-study-${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`;
}

function firstCaseStudySectionId(lens: Exclude<Lens, "jane">): string {
  const title =
    lens === "recruiter" ? PROJECTS[0].title : DESIGNER_PROJECTS[0].title;
  return caseStudyId(title);
}

function scrollToSectionHeading(id: string, smooth: boolean): boolean {
  const el = document.getElementById(id);
  if (!el) return false;

  const scrollMarginTop =
    parseFloat(window.getComputedStyle(el).scrollMarginTop) || 0;
  const top =
    window.scrollY + el.getBoundingClientRect().top - scrollMarginTop;

  window.scrollTo({
    top: Math.max(0, top),
    left: 0,
    behavior: smooth ? "smooth" : "auto",
  });
  return true;
}

/** Scrolls to this section's heading when hub navigation targets its id. */
function SectionScrollAnchor({
  id,
  scrollTarget,
  onComplete,
}: {
  id: string;
  scrollTarget: string | null;
  onComplete: () => void;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    if (scrollTarget !== id) return;

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    let cancelled = false;
    const timeouts: number[] = [];

    const finish = (found: boolean) => {
      if (cancelled) return;
      if (found) {
        document.getElementById(id)?.focus({ preventScroll: true });
      }
      onComplete();
    };

    const run = (smooth: boolean) =>
      scrollToSectionHeading(id, smooth && !prefersReducedMotion);

    const settle = (found: boolean) => {
      if (cancelled) return;
      if (!found) {
        finish(false);
        return;
      }
      if (prefersReducedMotion) {
        finish(true);
        return;
      }
      timeouts.push(
        window.setTimeout(() => {
          if (!cancelled) {
            run(false);
            finish(true);
          }
        }, 450),
      );
    };

    const tryScroll = (attempt: number) => {
      if (cancelled) return;
      const smooth = attempt === 0;
      if (run(smooth)) {
        settle(true);
        return;
      }
      if (attempt < 8) {
        timeouts.push(
          window.setTimeout(() => tryScroll(attempt + 1), 50 * (attempt + 1)),
        );
      } else {
        finish(false);
      }
    };

    tryScroll(0);

    return () => {
      cancelled = true;
      timeouts.forEach((t) => window.clearTimeout(t));
    };
  }, [scrollTarget, id, onComplete, prefersReducedMotion]);

  return null;
}

/** Scrolls to a section heading (Jane lens — no hub). */
function ScrollAnchor({
  targetId,
  onComplete,
}: {
  targetId: string | null;
  onComplete: () => void;
}) {
  if (!targetId) return null;
  return (
    <SectionScrollAnchor
      id={targetId}
      scrollTarget={targetId}
      onComplete={onComplete}
    />
  );
}

const HUB_INTRO: Record<Exclude<Lens, "jane">, string> = {
  recruiter:
    "Jump straight to a case study or scroll through the whole story.",
  designer:
    "Three projects with craft and outcomes. Pick one or wander the full page.",
};

type Project = {
  title: string;
  subtitle: string;
  skills: string[];
  moreSkills: string[];
  challenge: string;
  approach: string;
  solution: string;
  images: {
    hero: string;
    heroMobile?: string;
    before: string;
    after: string;
  };
};

const PROJECTS: Project[] = [
  {
    title: "Powersports site overhaul",
    subtitle:
      "80% increase in conversions YoY | 5 stores unified | 3 month delivery",
    skills: [
      "User Experience (UX) Design",
      "Design Systems",
      "Figma",
      "Prototyping",
      "Usability Testing",
      "Cross-functional Collaboration",
    ],
    moreSkills: [
      "AI prototyping",
      "Brand identity",
      "Stakeholder alignment",
      "Commerce & conversion",
      "Content strategy",
      "Regulated & partner constraints",
      "Workshop facilitation",
      "Outcomes & metrics",
    ],
    challenge:
      "Team Mancuso Powersports wanted to consolidate five Houston-area stores into a single ecommerce site. What looked straightforward on paper wasn’t: each store had distinct manufacturer relationships with strict OEM compliance rules about how brands could be displayed online, and the store teams had no interest in losing their individual identities to a generic parent brand. The real challenge wasn’t the design. It was building the case for the project itself.",
    approach:
      "I started upstream: workshops, store shadowing, card sorts, competitive analysis, and customer sentiment research before touching Figma. That groundwork gave us the alignment we needed to move fast. Close collaboration with an OEM-certified host partner, built on weekly alignment sessions throughout, is what made the 3-month deadline possible.",
    solution:
      "The design solution centered on location-specific splash pages that let each store maintain its identity and stay OEM-compliant while living under the Team Mancuso umbrella. Consolidated five years of fragmented branding into a unified front: improving brand recognition across all touchpoints and giving the business one system to maintain instead of five.",
    images: {
      hero: publicPath("/projects/tmp-hero.png"),
      before: publicPath("/projects/tmp-before.png"),
      after: publicPath("/projects/tmp-after.png"),
    },
  },
  {
    title: "Credit application redesign",
    subtitle:
      "40% improved completion rates | 15 steps to 7 | Scaled to 100+ locations",
    skills: [
      "User Experience (UX) Design",
      "Design Systems",
      "Figma",
      "Prototyping",
      "Usability Testing",
      "Cross-functional Collaboration",
    ],
    moreSkills: [
      "Form design",
      "Conditional logic design",
      "Accessibility (WCAG/ADA)",
      "Leadership-facing delivery",
      "Stakeholder alignment",
      "Product strategy",
      "Information Architecture",
      "Analytics",
      "Design ops",
      "Micro-interactions",
    ],
    challenge:
      "EchoPark’s credit application lived inside a third-party iframe that frustrated users and blocked internal teams from seeing where people were dropping off. Beyond the technical limitations the UX had deeper problems — inconsistent requirements across teams, unclear store routing, mixed cosigner information causing in-store confusion, and a form collecting more data than it needed to. Nobody had visibility into what was broken or why.",
    approach:
      "I inherited an incomplete audit and finished it — documenting the existing iframe logic and researching across teams to separate operational needs from user needs. Content wireframes aligned stakeholders on flow structure early, before anyone got attached to a solution. I prioritized sketches and mid-fidelity wireframes to validate conditional logic before committing to visual design, applied EchoPark’s design system, introduced new components where needed, and built in ADA compliance and microinteractions throughout.",
    solution:
      "Usability testing on the most complex parts of the flow surfaced the final interaction refinements. The result was a fully in-house, on-brand credit application — analytics-enabled, ADA compliant, and half the steps of the original.",
    images: {
      hero: publicPath("/projects/sca-hero.png"),
      before: publicPath("/projects/sca-before.png"),
      after: publicPath("/projects/sca-after.png"),
    },
  },
  {
    title: "Cazador del Oso: multimedia web design",
    subtitle:
      "Storytelling ecommerce | $14K+ revenue | End-to-end solo delivery",
    skills: [
      "User Experience (UX) Design",
      "Design Systems",
      "Figma",
      "Prototyping",
      "Usability Testing",
      "Cross-functional Collaboration",
    ],
    moreSkills: [
      "AI prototyping",
      "Storytelling",
      "Brand identity",
      "Front-end development",
      "Commerce & conversion",
      "Client management",
      "End-to-end delivery",
      "Content strategy",
      "Photography",
      "Merchandising",
    ],
    challenge:
      "ZFunk Productions poured a decade of work in Cazador Del Oso—a story of Montana’s history shown through original compositions and visual art—but the website did not stack up due to a lack of branding, paragraphs of content, and overall readability issues. We needed to tell the story clearly enough to sell gala tickets, products, and to get donations all while keeping the artist’s vision and passion at the heart. A blank canvas sounds like freedom. In practice it’s the hardest brief to execute.",
    approach:
      "I started with competitive and comparative research, a full audit of the original site, and stakeholder workshops so we could align on narrative, content, and hierarchy before visual design. Art direction came from the work itself: a moodier palette drawn from the main piece instead of default western-earth tones. On build, every ambitious layout choice had a technical conversation underneath it: what the CMS allows, what custom CSS can carry, and what still has to hold up across devices.",
    solution:
      "A storytelling-driven ecommerce site that weaves art, music, and narrative into a single cohesive website experience. Delivered end-to-end as sole designer and developer, helping ZFunk Productions’ Cazador del Oso generate over $14K in revenue.",
    images: {
      hero: publicPath("/projects/cdo-hero.png"),
      before: publicPath("/projects/cdo-before.png"),
      after: publicPath("/projects/cdo-after.png"),
    },
  },
];

// ───────────────────────────────────────────────────────────────────────────
// Designer variant case studies
//
// Separate from PROJECTS because the designer variant has (a) a different
// lineup/order (CDO → Powersports → SRP; no Credit app), (b) different tone
// & depth in the Challenge/Solution copy, and (c) a new "Design & build"
// three-column section per case study — each column is an illustration plus
// a sub-title and paragraph detailing a slice of the process.
// ───────────────────────────────────────────────────────────────────────────

type DesignBuildColumn = {
  title: string;
  body: string;
  illustration: string;
};

type DesignerProject = {
  title: string;
  subtitle: string;
  skills: string[];
  moreSkills: string[];
  challenge: string;
  solution: string;
  designBuild: readonly [
    DesignBuildColumn,
    DesignBuildColumn,
    DesignBuildColumn,
  ];
  images: { hero: string; heroMobile?: string; before: string; after: string };
};

const DESIGNER_PROJECTS: DesignerProject[] = [
  {
    title: "Cazador del Oso: multimedia web design",
    subtitle:
      "UX Designer & Developer · Arts & Culture Ecommerce · 2025–2026",
    skills: [
      "Systems Thinking",
      "Information Architecture",
      "Interaction Design",
      "Research Synthesis",
      "Storytelling",
      "Accessibility (WCAG/ADA)",
    ],
    moreSkills: [
      "AI prototyping",
      "Brand identity",
      "Content strategy",
      "Client management",
      "Front-end development",
      "CMS constraints",
      "End-to-end delivery",
      "Sole ownership",
      "Commerce & conversion",
      "Typography",
      "Art direction",
      "Layout & grid systems",
      "Responsive design",
      "Micro-interactions",
    ],
    challenge:
      "ZFunk Productions poured a decade of work in Cazador Del Oso—a story of Montana’s history shown through original compositions and visual art—but the website did not stack up due to a lack of branding, paragraphs of content, and overall readability issues. We needed to tell the story clearly enough to sell gala tickets, products, and to get donations all while keeping the artist’s vision and passion at the heart. A blank canvas sounds like freedom. In practice it’s the hardest brief to execute.",
    solution:
      "A storytelling-driven ecommerce site that weaves art, music, and narrative into a single cohesive website experience. Delivered end-to-end as sole designer and developer, helping ZFunk Productions’ Cazador del Oso generate over $14K in revenue.",
    designBuild: [
      {
        title: "Understanding the context",
        body: "When there’s no brand system to work within you build the guardrails first. I started with competitive/comparative research of other multi-media projects, original site content audit, and stakeholder workshops to align on content and hierarchy before any visual decision got made. Getting a client to react to structure, flows, and solutions before aesthetics is how I avoid redesigning everything in hifis.",
        illustration: publicPath("/projects/designer/cdo-understanding.svg"),
      },
      {
        title: "Improving the design & story",
        body: "I pulled the color palette directly from the main art piece. The easy choice would have been to keep the earthy, western tones of the original website, instead we went darker and moodier to visually communicate the psychological depth and mystery at the heart of the story.",
        illustration: publicPath("/projects/designer/cdo-improving.svg"),
      },
      {
        title: "Building the vibes",
        body: "CMS has restrictions on layouts that don’t always match what a visually ambitious client imagines, or myself for that matter. Every creative decision had a technical conversation underneath it: what’s possible, what’s solvable through custom CSS, what’s a trade-off between the vision and what holds up across devices.",
        illustration: publicPath("/projects/designer/cdo-vibes.svg"),
      },
    ],
    images: {
      hero: publicPath("/projects/cdo-hero.png"),
      before: publicPath("/projects/cdo-before.png"),
      after: publicPath("/projects/cdo-after.png"),
    },
  },
  {
    title: "Powersports site overhaul",
    subtitle:
      "80% increase in conversions YoY | 5 stores unified | 3 month delivery",
    skills: [
      "Systems Thinking",
      "Information Architecture",
      "Interaction Design",
      "Research Synthesis",
      "Storytelling",
      "Accessibility (WCAG/ADA)",
    ],
    moreSkills: [
      "AI prototyping",
      "Design Systems",
      "Regulated & partner constraints",
      "Style guide creation",
      "Brand identity",
      "Workshop facilitation",
      "Omnichannel",
      "Stakeholder alignment",
      "User research",
      "Card sorting",
      "Content strategy",
      "Responsive design",
      "Cross-functional Collaboration",
    ],
    challenge:
      "When a business asks you to do something, your first job isn’t to design it. It’s to understand whether it’s actually possible. The ask was straightforward: consolidate five dealership websites into one. What nobody knew (including us) was that OEM compliance rules made a single unified homepage nearly impossible. Certain manufacturers can’t appear alongside others. Certain promotions can’t show at noncompliant locations. Finding that out mid-project is the kind of thing that either derails a timeline or forces a better solution.",
    solution:
      "To address compliance requirements, we treated each of the five store pages as independent “homepages,” while maintaining a consistent navigation mental model for users. We also streamlined multiple style guides into one cohesive brand, which helped gain alignment from both operations and store teams. This approach led to improved brand awareness, aggregate inventory search, and an overall 80% increase in KPIs.",
    designBuild: [
      {
        title: "Understanding the context",
        body: "We went on-site before designing because you can’t design for five distinct stores without knowing what makes each of them unique. Card sorts, customer sentiment, competitive/comparative analyses were conducted to get an even deeper understanding of the powersports industry and user type.",
        illustration: publicPath("/projects/designer/tmp-understanding.svg"),
      },
      {
        title: "During the process",
        body: "Constant collaboration, workshops, and feedback loops with ops and dev team kept us on track while uncovering nuances, store needs/wants, and technical constraints. This is what helped us uncover the major compliance red flag among other risks, pain points, and trade-offs.",
        illustration: publicPath("/projects/designer/tmp-process.svg"),
      },
      {
        title: "How we got a compliant site",
        body: "If we kept the original sites’ URL that redirected to store splash pages containing OEM promos, approved brands, and the correct items “above the fold,” we could make the business request work within the OEM guidelines. Not the most obvious solution — but collaboration allows for the best solutions to grow.",
        illustration: publicPath("/projects/designer/tmp-compliant.svg"),
      },
    ],
    images: {
      hero: publicPath("/projects/tmp-hero.png"),
      before: publicPath("/projects/tmp-before.png"),
      after: publicPath("/projects/tmp-after.png"),
    },
  },
  {
    title: "SRP tile redesign",
    subtitle: "UX Designer | Automotive Ecommerce | 2023",
    skills: [
      "Systems Thinking",
      "Information Architecture",
      "Interaction Design",
      "Research Synthesis",
      "Storytelling",
      "Accessibility (WCAG/ADA)",
    ],
    moreSkills: [
      "AI prototyping",
      "Component design",
      "Information hierarchy",
      "A/B testing",
      "Responsive design",
      "Usability Testing",
      "Heuristic evaluation",
      "Design Systems",
      "Analytics",
      "Hypothesis-driven design",
      "Cross-functional Collaboration",
      "Design-to-dev handoff",
      "Regulated & partner constraints",
    ],
    challenge:
      "Two weeks into a new role I was handed the redesign of the search results tile: the component carrying almost all traffic on a nationwide automotive ecommerce platform. In the current state there were a few major issues — users couldn’t tell where the car was located, the stock number meant nothing to them, and the layout wasn’t surfacing what mattered most. On such a small but impactful component we had to balance what users wanted with what pushed business KPIs.",
    solution:
      "A redesigned tile that led with location, simplified the information density, and adopted an F-pattern layout for faster scanning. A/B testing confirmed the new design outperformed the original across 90% of KPIs — enough signal to roll the redesign out platform-wide.",
    designBuild: [
      {
        title: "Ramp up",
        body: "New to the team, I rapidly navigated a steep learning curve: mastering industry jargon, design systems, and team processes. By proactively asking questions and leaning on team expertise, I quickly built the context needed to make effective decisions.",
        illustration: publicPath("/projects/designer/srp-rampup.svg"),
      },
      {
        title: "Optimizing content & hierarchy",
        body: "User research showed the car tile had enough information for decision-making, but was missing a critical detail: location. A major issue for a nationwide business with real shipping logistics. Instead of adding more content, we simplified — removing “quick info” and prioritizing clarity. A consistent F-pattern layout improved scannability across listings.",
        illustration: publicPath("/projects/designer/srp-content-hierarchy.svg"),
      },
      {
        title: "A push forward",
        body: "A/B testing showed the new SRP outperformed the old across 90% of KPIs, but a drop in “Ask about this car” interactions paused rollout. We found the CTA on the car tile had been used as a workaround for missing location info. Once we solved that, the need disappeared. What looked like a loss proved the design worked — enabling full launch.",
        illustration: publicPath("/projects/designer/srp-pushforward.svg"),
      },
    ],
    images: {
      hero: publicPath("/projects/SRPDESKTOP.svg"),
      heroMobile: publicPath("/projects/srp-hero-mobile.png"),
      before: publicPath("/projects/srp-before.png"),
      after: publicPath("/projects/srp-after.png"),
    },
  },
];

function resolveCaseStudyMeta(
  lens: Exclude<Lens, "jane">,
  sectionId: string,
): { title: string; image: string; accentFit: string; accent: Accent } | null {
  if (lens === "recruiter") {
    const project = PROJECTS.find((p) => caseStudyId(p.title) === sectionId);
    if (!project) return null;
    return {
      title: project.title,
      image: project.images.hero,
      accentFit: ACCENTS.recruiter.pill,
      accent: ACCENTS.recruiter,
    };
  }

  const project = DESIGNER_PROJECTS.find(
    (p) => caseStudyId(p.title) === sectionId,
  );
  if (!project) return null;
  return {
    title: project.title,
    image: project.images.hero,
    accentFit: ACCENTS.designer.pill,
    accent: ACCENTS.designer,
  };
}

const EASE_OUT_CUBIC = [0.22, 1, 0.36, 1] as const;

function curtainTiming(anchor?: DrawerSnapshot["anchor"]) {
  if (anchor === "belowHub") {
    return { holdMs: 50, sweepMs: 1050 };
  }
  return { holdMs: 100, sweepMs: 900 };
}

function curtainTotalMs(anchor?: DrawerSnapshot["anchor"]) {
  const { holdMs, sweepMs } = curtainTiming(anchor);
  return holdMs + sweepMs;
}

/** Scroll-through reveal — content unfolds below the hub instead of popping in. */
function FullPortfolioReveal({
  revealing,
  children,
}: {
  revealing: boolean;
  children: React.ReactNode;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { holdMs, sweepMs } = curtainTiming("belowHub");

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={
        revealing
          ? { clipPath: "inset(0 0 100% 0)", y: -32, opacity: 0.88 }
          : false
      }
      animate={{ clipPath: "inset(0 0 0% 0)", y: 0, opacity: 1 }}
      transition={{
        duration: sweepMs / 1000,
        delay: revealing ? holdMs / 1000 : 0,
        ease: EASE_OUT_CUBIC,
      }}
      className="origin-top will-change-[clip-path,transform,opacity]"
    >
      {children}
    </motion.div>
  );
}

/** Retro press CTA — matches memory-card Play button. */
function retroCtaClasses({
  size = "md",
  accentClass = "",
  variant = "accent",
}: {
  size?: "md" | "sm" | "xs";
  accentClass?: string;
  variant?: "accent" | "surface" | "ink" | "outline";
}): string {
  const sizeClass =
    size === "xs"
      ? `px-3 py-1.5 ${typeCtaXs}`
      : size === "sm"
        ? `px-4 py-2 md:px-5 md:py-2.5 ${typeCtaSm}`
        : `px-8 py-2.5 ${typeCtaMd}`;

  const variantClass =
    variant === "ink"
      ? `hover-cursor-on-dark bg-ink text-hwite ${accentClass}`
      : variant === "outline"
        ? `bg-hwite ${accentClass}`
        : variant === "surface"
          ? "bg-hwite"
          : accentClass;

  return [
    "inline-flex items-center justify-center border-[3px] border-ink font-bold uppercase",
    sizeClass,
    variant === "ink" ? "" : "text-ink",
    "shadow-[4px_4px_0_0_#0f0000] outline-none transition-[transform,colors]",
    "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0f0000]",
    "focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-60",
    "disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_0_#0f0000]",
    variantClass,
  ]
    .filter(Boolean)
    .join(" ");
}

// The ink curtain holds briefly, then slides down to reveal the view beneath.
const CURTAIN_FINISH_BUFFER_MS = 48;

/** Hub → case study “memory card” load screen duration. */
const MEMORY_CARD_LOAD_MS = 2400;
const MEMORY_CARD_BLACKOUT_MS = 550;
const CASE_STUDY_REVEAL_MS = 1100;
const FULL_PORTFOLIO_SCROLL_HINT_DELAY_MS = 3000;

type Phase = "idle" | "animating";

type CaseStudyNavMeta = {
  label: string;
  image?: string;
};

type PendingCaseStudy = CaseStudyNavMeta & {
  sectionId: string;
};

// ───────────────────────────────────────────────────────────────────────────
// Home
// ───────────────────────────────────────────────────────────────────────────

export default function Home() {
  const [lens, setLens] = useState<Lens | null>(null);
  /** Hub overview vs. full scrollable portfolio after a lens is picked. */
  const [contentView, setContentView] = useState<ContentView>("hub");
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);
  const clearScrollTarget = useCallback(() => setScrollTarget(null), []);
  const [pendingCaseStudy, setPendingCaseStudy] =
    useState<PendingCaseStudy | null>(null);
  const [focusedCaseStudyId, setFocusedCaseStudyId] = useState<string | null>(
    null,
  );
  const [caseStudyBlackout, setCaseStudyBlackout] = useState<
    "off" | "solid" | "fading"
  >("off");
  // Snapshot of the view sliding away during the hero curtain transition.
  const [drawerSnapshot, setDrawerSnapshot] = useState<DrawerSnapshot | null>(
    null,
  );
  const [phase, setPhase] = useState<Phase>("idle");
  const [scrollHintVisible, setScrollHintVisible] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const scrollHintDismissedRef = useRef(false);
  const scrollHintVisibleRef = useRef(false);
  const hubSectionRef = useRef<HTMLElement>(null);
  // Viewport Y (px) for the top of the fixed curtain drawer, captured at
  // the moment the user picks a lens. First pick from the landing page may
  // be mid-scroll; switching lenses scrolls to top first so this matches
  // the hero bottom at y=0.
  const [drawerTopPx, setDrawerTopPx] = useState<number | null>(null);
  /** Hub scroll position before opening a case study — restored on eject. */
  const hubScrollYRef = useRef(0);
  const curtainTimeoutRef = useRef<number | null>(null);

  const finishCurtain = useCallback(() => {
    if (curtainTimeoutRef.current !== null) {
      window.clearTimeout(curtainTimeoutRef.current);
      curtainTimeoutRef.current = null;
    }
    setPhase("idle");
    setDrawerSnapshot(null);
    setDrawerTopPx(null);
  }, []);

  const restoreHubScroll = useCallback(() => {
    const y = hubScrollYRef.current;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: y, left: 0, behavior: "auto" });
      });
    });
  }, []);

  const runCurtainTransition = useCallback(
    (snapshot: DrawerSnapshot, apply: () => void) => {
      if (curtainTimeoutRef.current !== null) {
        window.clearTimeout(curtainTimeoutRef.current);
        curtainTimeoutRef.current = null;
      }

      if (prefersReducedMotion) {
        apply();
        return;
      }

      const anchorEl =
        snapshot.anchor === "belowHub"
          ? hubSectionRef.current
          : heroRef.current;
      const y = anchorEl ? anchorEl.getBoundingClientRect().bottom - 2 : 0;
      setDrawerTopPx(y);
      setDrawerSnapshot(snapshot);
      apply();
      setPhase("animating");
      curtainTimeoutRef.current = window.setTimeout(
        finishCurtain,
        curtainTotalMs(snapshot.anchor) + CURTAIN_FINISH_BUFFER_MS,
      );
    },
    [prefersReducedMotion, finishCurtain],
  );

  useEffect(() => {
    return () => {
      if (curtainTimeoutRef.current !== null) {
        window.clearTimeout(curtainTimeoutRef.current);
      }
    };
  }, []);

  // Recover if a dev hot-reload drops the curtain timeout while phase stays locked.
  useEffect(() => {
    if (phase !== "animating") return;
    const recovery = window.setTimeout(
      finishCurtain,
      curtainTotalMs(drawerSnapshot?.anchor) + 120,
    );
    return () => window.clearTimeout(recovery);
  }, [phase, finishCurtain, drawerSnapshot?.anchor]);

  // Lock scroll during lens curtain, memory-card load, or case-study reveal.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    const locked =
      phase !== "idle" ||
      pendingCaseStudy !== null ||
      caseStudyBlackout !== "off";
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase, pendingCaseStudy, caseStudyBlackout]);

  useEffect(() => {
    if (caseStudyBlackout !== "fading") return;
    const recovery = window.setTimeout(() => {
      setCaseStudyBlackout("off");
    }, CASE_STUDY_REVEAL_MS + 120);
    return () => window.clearTimeout(recovery);
  }, [caseStudyBlackout]);

  function requestCaseStudy(sectionId: string, meta: CaseStudyNavMeta) {
    if (phase !== "idle" || pendingCaseStudy) return;

    hubScrollYRef.current = window.scrollY;

    if (prefersReducedMotion) {
      setContentView("caseStudy");
      setFocusedCaseStudyId(sectionId);
      return;
    }

    setPendingCaseStudy({ sectionId, ...meta });
  }

  const revealCaseStudy = useCallback((sectionId: string) => {
    setCaseStudyBlackout("solid");
    setContentView("caseStudy");
    setFocusedCaseStudyId(sectionId);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    requestAnimationFrame(() => {
      setPendingCaseStudy(null);
      requestAnimationFrame(() => {
        setCaseStudyBlackout("fading");
      });
    });
  }, []);

  const cancelCaseStudyLoad = useCallback(() => {
    setPendingCaseStudy(null);
  }, []);

  const ejectCaseStudy = useCallback(() => {
    if (prefersReducedMotion) {
      setContentView("hub");
      setScrollTarget(null);
      setFocusedCaseStudyId(null);
      setCaseStudyBlackout("off");
      restoreHubScroll();
      return;
    }

    setCaseStudyBlackout("solid");
    window.setTimeout(() => {
      setContentView("hub");
      setScrollTarget(null);
      setFocusedCaseStudyId(null);
      restoreHubScroll();
      requestAnimationFrame(() => {
        setCaseStudyBlackout("fading");
      });
    }, MEMORY_CARD_BLACKOUT_MS);
  }, [prefersReducedMotion, restoreHubScroll]);

  function showFullPortfolio() {
    if (
      phase !== "idle" ||
      contentView !== "hub" ||
      lens === null ||
      lens === "jane"
    ) {
      return;
    }

    runCurtainTransition(
      { lens, contentView: "hub", anchor: "belowHub" },
      () => {
      setContentView("full");
      setScrollTarget(null);
      setFocusedCaseStudyId(null);
      setCaseStudyBlackout("off");
    },
    );
  }

  function requestLens(next: Lens) {
    if (phase !== "idle" || next === lens) return;

    const switchingFromAnotherLens = lens !== null;
    if (switchingFromAnotherLens) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }

    runCurtainTransition({ lens, contentView }, () => {
      setContentView(next === "jane" ? "full" : "hub");
      setScrollTarget(null);
      setFocusedCaseStudyId(null);
      setCaseStudyBlackout("off");
      setLens(next);
    });
  }

  const locked =
    phase !== "idle" ||
    pendingCaseStudy !== null ||
    caseStudyBlackout !== "off";

  const scrollHintActive =
    contentView === "full" &&
    lens !== null &&
    lens !== "jane" &&
    phase === "idle" &&
    pendingCaseStudy === null &&
    caseStudyBlackout === "off";

  useEffect(() => {
    scrollHintVisibleRef.current = scrollHintVisible;
  }, [scrollHintVisible]);

  useEffect(() => {
    if (!scrollHintActive) {
      setScrollHintVisible(false);
      scrollHintDismissedRef.current = false;
      return;
    }

    let timer: number | null = null;

    const clearTimer = () => {
      if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
      }
    };

    const scheduleShow = () => {
      if (scrollHintDismissedRef.current) return;
      clearTimer();
      timer = window.setTimeout(() => {
        if (!scrollHintDismissedRef.current) {
          setScrollHintVisible(true);
        }
      }, FULL_PORTFOLIO_SCROLL_HINT_DELAY_MS);
    };

    const onScroll = () => {
      if (scrollHintDismissedRef.current) return;

      if (scrollHintVisibleRef.current) {
        scrollHintDismissedRef.current = true;
        setScrollHintVisible(false);
        clearTimer();
        return;
      }

      setScrollHintVisible(false);
      scheduleShow();
    };

    setScrollHintVisible(false);
    scheduleShow();

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearTimer();
      window.removeEventListener("scroll", onScroll);
    };
  }, [scrollHintActive]);

  const scrollToFirstCaseStudy = useCallback(() => {
    if (!lens || lens === "jane") return;
    scrollToSectionHeading(
      firstCaseStudySectionId(lens),
      !prefersReducedMotion,
    );
    scrollHintDismissedRef.current = true;
    setScrollHintVisible(false);
  }, [lens, prefersReducedMotion]);

  const caseStudyMeta =
    lens &&
    lens !== "jane" &&
    contentView === "caseStudy" &&
    focusedCaseStudyId
      ? resolveCaseStudyMeta(lens, focusedCaseStudyId)
      : null;

  return (
    <main className="relative min-h-screen bg-hwite text-ink selection:bg-ink selection:text-hwite">
      {contentView !== "caseStudy" ? (
        <Hero
          ref={heroRef}
          hideBottomBorder={lens !== null}
        />
      ) : null}

      {/* Fixed top-right chrome — lens pill, or eject memory card in case-study focus. */}
      {caseStudyMeta ? (
        <RemoveMemoryCardPill
          title={caseStudyMeta.title}
          accent={caseStudyMeta.accent}
          onRemove={ejectCaseStudy}
          disabled={locked}
        />
      ) : lens !== null ? (
        <LensPill
          current={lens}
          onPick={requestLens}
          disabled={locked}
        />
      ) : null}

      <LensView
        lens={lens}
        contentView={contentView}
        focusedCaseStudyId={focusedCaseStudyId}
        scrollTarget={scrollTarget}
        onScrollTargetHandled={clearScrollTarget}
        onPick={requestLens}
        onNavigate={requestCaseStudy}
        onShowFull={showFullPortfolio}
        disabled={locked}
        hubSectionRef={hubSectionRef}
        fullPortfolioRevealing={
          phase === "animating" && drawerSnapshot?.anchor === "belowHub"
        }
      />

      {/* Sliding drawer — a snapshot of the old view capped by a 3px ink
          line, translating straight down to reveal the new view beneath.
          The drawer's top sits exactly where the hero's (now-hidden)
          bottom border used to live so the single line reads as
          continuous, not stacked or split. */}
      <AnimatePresence>
        {phase === "animating" &&
        drawerTopPx !== null &&
        drawerSnapshot &&
        drawerSnapshot.anchor !== "belowHub" ? (
          <motion.div
            key="drawer"
            aria-hidden
            className="pointer-events-none fixed inset-x-0 bottom-0 z-[55] overflow-hidden bg-hwite border-t-[3px] border-ink will-change-transform"
            style={{ top: drawerTopPx }}
            initial={{ y: 0 }}
            animate={{ y: "calc(100% + 3px)" }}
            transition={{
              duration: curtainTiming(drawerSnapshot.anchor).sweepMs / 1000,
              delay: curtainTiming(drawerSnapshot.anchor).holdMs / 1000,
              ease: EASE_OUT_CUBIC,
            }}
            onAnimationComplete={finishCurtain}
          >
            <div className="pointer-events-none">
              <LensView
                lens={drawerSnapshot.lens}
                contentView={drawerSnapshot.contentView}
                focusedCaseStudyId={focusedCaseStudyId}
                scrollTarget={null}
                onScrollTargetHandled={() => {}}
                onPick={() => {}}
                onNavigate={() => {}}
                onShowFull={() => {}}
                disabled
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {pendingCaseStudy && lens && lens !== "jane" ? (
          <MemoryCardLoader
            key={pendingCaseStudy.sectionId}
            title={pendingCaseStudy.label}
            image={pendingCaseStudy.image}
            accentFit={ACCENTS[lens].pill}
            accent={ACCENTS[lens]}
            durationMs={MEMORY_CARD_LOAD_MS}
            onPlay={() => revealCaseStudy(pendingCaseStudy.sectionId)}
            onDismiss={cancelCaseStudyLoad}
          />
        ) : null}
      </AnimatePresence>

      {lens && lens !== "jane" ? (
        <FullPortfolioScrollHint
          visible={scrollHintVisible}
          accent={ACCENTS[lens]}
          onScrollToFirst={scrollToFirstCaseStudy}
        />
      ) : null}

      <AnimatePresence>
        {caseStudyBlackout !== "off" ? (
          <motion.div
            key="case-study-blackout"
            aria-hidden
            className="pointer-events-none fixed inset-0 z-[65] bg-ink"
            initial={{ opacity: 1 }}
            animate={{ opacity: caseStudyBlackout === "fading" ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: CASE_STUDY_REVEAL_MS / 1000,
              ease: EASE_OUT_CUBIC,
            }}
            onAnimationComplete={() => {
              if (caseStudyBlackout === "fading") {
                setCaseStudyBlackout("off");
              }
            }}
          />
        ) : null}
      </AnimatePresence>
    </main>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// LensView — renders whatever lens is active (or the card picker if null)
// ───────────────────────────────────────────────────────────────────────────

function LensView({
  lens,
  contentView,
  focusedCaseStudyId,
  scrollTarget,
  onScrollTargetHandled,
  onPick,
  onNavigate,
  onShowFull,
  disabled,
  hubSectionRef,
  fullPortfolioRevealing = false,
}: {
  lens: Lens | null;
  contentView: ContentView;
  focusedCaseStudyId: string | null;
  scrollTarget: string | null;
  onScrollTargetHandled: () => void;
  onPick: (lens: Lens) => void;
  onNavigate: (sectionId: string, meta: CaseStudyNavMeta) => void;
  onShowFull: () => void;
  disabled: boolean;
  hubSectionRef?: React.Ref<HTMLElement>;
  fullPortfolioRevealing?: boolean;
}) {
  if (lens === null) {
    return <WhoAreYouSection onPick={onPick} disabled={disabled} />;
  }
  if (
    contentView === "caseStudy" &&
    lens !== "jane" &&
    focusedCaseStudyId
  ) {
    return (
      <CaseStudyFocusView
        lens={lens}
        sectionId={focusedCaseStudyId}
      />
    );
  }
  if (lens === "recruiter")
    return (
      <>
        {contentView === "hub" || contentView === "full" ? (
          <LensHub
            ref={hubSectionRef}
            lens="recruiter"
            onNavigate={onNavigate}
            onShowFull={onShowFull}
            disabled={disabled}
            hideScrollThrough={contentView === "full"}
          />
        ) : null}
        {contentView === "full" ? (
          <FullPortfolioReveal revealing={fullPortfolioRevealing}>
            <RecruiterVariant
              belowHub
              scrollTarget={scrollTarget}
              onScrollTargetHandled={onScrollTargetHandled}
            />
          </FullPortfolioReveal>
        ) : null}
      </>
    );
  if (lens === "designer")
    return (
      <>
        {contentView === "hub" || contentView === "full" ? (
          <LensHub
            ref={hubSectionRef}
            lens="designer"
            onNavigate={onNavigate}
            onShowFull={onShowFull}
            disabled={disabled}
            hideScrollThrough={contentView === "full"}
          />
        ) : null}
        {contentView === "full" ? (
          <FullPortfolioReveal revealing={fullPortfolioRevealing}>
            <DesignerVariant
              belowHub
              scrollTarget={scrollTarget}
              onScrollTargetHandled={onScrollTargetHandled}
            />
          </FullPortfolioReveal>
        ) : null}
      </>
    );
  if (lens === "jane")
    return (
      <JaneVariant
        scrollTarget={scrollTarget}
        onScrollTargetHandled={onScrollTargetHandled}
      />
    );
  // All three lens types are handled above; TS narrows `lens` to never here.
  return null;
}

// Per-lens accent tokens used by the case-study, hub, and contact sections.
type Accent = {
  pill: string;
  divider: string;
  buttonHoverBorder: string;
  buttonHoverBg: string;
  buttonHoverShadow: string;
  /** Primary CTA hover fill — lighter lens accent (must be literal for Tailwind). */
  emailHoverBg: string;
};

const ACCENTS: Record<Lens, Accent> = {
  recruiter: {
    pill: "bg-millennial",
    divider: "bg-salmon",
    buttonHoverBorder: "hover:border-salmon",
    buttonHoverBg: "hover:bg-salmon",
    buttonHoverShadow: "hover:shadow-[inset_0_0_0_1px_theme(colors.salmon)]",
    emailHoverBg: "hover:bg-millennial",
  },
  designer: {
    pill: "bg-tear",
    divider: "bg-coldday",
    buttonHoverBorder: "hover:border-tear",
    buttonHoverBg: "hover:bg-tear",
    buttonHoverShadow: "hover:shadow-[inset_0_0_0_1px_theme(colors.tear)]",
    emailHoverBg: "hover:bg-tear",
  },
  jane: {
    pill: "bg-sunnies",
    divider: "bg-goldenhour",
    buttonHoverBorder: "hover:border-goldenhour",
    buttonHoverBg: "hover:bg-goldenhour",
    buttonHoverShadow: "hover:shadow-[inset_0_0_0_1px_theme(colors.goldenhour)]",
    emailHoverBg: "hover:bg-sunnies",
  },
};

/** White default — hover fills lighter lens accent (millennial / tear / sunnies). */
function retroCtaOutlineHover(accent: Accent): string {
  return `${accent.emailHoverBg} hover:text-ink`;
}

function FullPortfolioScrollHint({
  visible,
  accent,
  onScrollToFirst,
}: {
  visible: boolean;
  accent: Accent;
  onScrollToFirst: () => void;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="full-portfolio-scroll-hint"
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 72 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 48 }}
          transition={{
            duration: prefersReducedMotion ? 0.2 : 0.5,
            ease: EASE_OUT_CUBIC,
          }}
          className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2"
        >
          <motion.button
            type="button"
            animate={
              prefersReducedMotion ? undefined : { y: [0, 5, 0] }
            }
            transition={
              prefersReducedMotion
                ? undefined
                : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
            }
            onClick={onScrollToFirst}
            aria-label="Scroll to first case study"
            className={`hover-cursor-on-dark ${retroCtaClasses({
              size: "sm",
              variant: "outline",
              accentClass: retroCtaOutlineHover(accent),
            })}`}
          >
            Scroll down ↓
          </motion.button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Memory card chrome — shared frame for loader, case-study header, eject bar
// ───────────────────────────────────────────────────────────────────────────

function MemoryCardFrame({
  image,
  title,
  accentFit,
  footer,
  imageClassName = "aspect-[4/3] w-full object-cover",
  className = "",
}: {
  image?: string;
  title: string;
  accentFit: string;
  footer?: React.ReactNode;
  imageClassName?: string;
  className?: string;
}) {
  return (
    <div
      className={`border-[3px] border-ink bg-[#e8e8e8] p-2 shadow-[inset_2px_2px_0_#ffffff,inset_-2px_-2px_0_#808080] ${className}`}
    >
      <div className="overflow-hidden bg-hwite">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className={`block ${imageClassName}`}
            draggable={false}
          />
        ) : (
          <div
            className={`flex items-center justify-center ${accentFit} ${imageClassName}`}
            aria-hidden
          >
            <span className={`${typeDecorativeGlyph} text-ink/25`}>
              {title.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <p className={`mt-2 text-center ${typeMeta}`}>
        Memory card
      </p>
      {footer}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Case study focus — single study after memory-card “Play”
// ───────────────────────────────────────────────────────────────────────────

function CaseStudyFocusView({
  lens,
  sectionId,
}: {
  lens: Exclude<Lens, "jane">;
  sectionId: string;
}) {
  if (lens === "recruiter") {
    const project = PROJECTS.find((p) => caseStudyId(p.title) === sectionId);
    if (!project) return null;
    return (
      <div className="relative z-10 border-t-[3px] border-ink bg-hwite md:border-t-0">
        <ProjectSection
          project={project}
          id={sectionId}
          scrollTarget={null}
          onScrollTargetHandled={() => {}}
          variant="landing"
          beforeFooter
        />
        <ContactFooter lens="recruiter" />
      </div>
    );
  }

  const project = DESIGNER_PROJECTS.find(
    (p) => caseStudyId(p.title) === sectionId,
  );
  if (!project) return null;
  return (
    <div className="relative z-10 border-t-[3px] border-ink bg-hwite md:border-t-0">
      <DesignerProjectSection
        project={project}
        id={sectionId}
        scrollTarget={null}
        onScrollTargetHandled={() => {}}
        variant="landing"
        beforeFooter
      />
      <ContactFooter lens="designer" />
    </div>
  );
}

function RemoveMemoryCardPill({
  title,
  accent,
  onRemove,
  disabled,
}: {
  title: string;
  accent: Accent;
  onRemove: () => void;
  disabled: boolean;
}) {
  return (
    <div className="fixed right-4 top-4 z-40 md:right-6 md:top-6">
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        aria-label={`Remove memory card: ${title}`}
        className={`hover-cursor-on-dark shrink-0 gap-2 ${retroCtaClasses({ size: "sm", variant: "outline", accentClass: retroCtaOutlineHover(accent) })}`}
      >
        <img
          src={publicPath("/icons/eject.svg")}
          alt=""
          aria-hidden
          className="h-4 w-4 shrink-0"
          draggable={false}
        />
        <span>Remove memory card</span>
      </button>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Memory card load — retro “inserting cartridge” screen after hub pick
// ───────────────────────────────────────────────────────────────────────────

function MemoryCardLoader({
  title,
  image,
  accentFit,
  accent,
  durationMs,
  onPlay,
  onDismiss,
}: {
  title: string;
  image?: string;
  accentFit: string;
  accent: Accent;
  durationMs: number;
  onPlay: () => void;
  onDismiss: () => void;
}) {
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const durationSec = durationMs / 1000;

  const handlePlay = () => {
    if (playing) return;
    setPlaying(true);
    window.setTimeout(onPlay, MEMORY_CARD_BLACKOUT_MS);
  };

  return (
    <motion.div
      role="dialog"
      aria-modal
      aria-labelledby="memory-card-load-title"
      aria-busy={!ready}
      className="fixed inset-0 z-[60] flex cursor-surface-dark items-center justify-center p-6"
      style={{
        transitionDuration: `${MEMORY_CARD_BLACKOUT_MS}ms`,
        backgroundColor: playing ? "rgb(15 0 0)" : "rgba(15, 0, 0, 0.4)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={playing ? undefined : onDismiss}
    >
      <motion.div
        className="w-full max-w-[420px] cursor-auto border-[3px] border-ink bg-[#c0c0c0] shadow-[4px_4px_0_0_#0f0000]"
        initial={{ y: 16, scale: 0.96 }}
        animate={
          playing
            ? { y: 8, scale: 0.94, opacity: 0 }
            : { y: 0, scale: 1, opacity: 1 }
        }
        exit={{ y: 8, opacity: 0 }}
        transition={{ duration: MEMORY_CARD_BLACKOUT_MS / 1000, ease: EASE_OUT_CUBIC }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-[3px] border-ink bg-[#dfdfdf] px-3 py-2">
          <p id="memory-card-load-title" className={typeUiLabel}>
            {ready ? "Ready" : "Loading"}
          </p>
          <button
            type="button"
            onClick={onDismiss}
            disabled={playing}
            aria-label="Close"
            className="hover-cursor-on-dark inline-flex h-10 w-10 shrink-0 items-center justify-center text-ink outline-none transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50"
          >
            <span aria-hidden className={typeIconClose}>
              ×
            </span>
          </button>
        </div>

        <div className="bg-hwite p-6 md:p-8">
          <div className="mx-auto max-w-[220px]">
            <MemoryCardFrame
              image={image}
              title={title}
              accentFit={accentFit}
              footer={
                <p className={`mt-2 text-center ${typeCardTitle}`}>{title}</p>
              }
            />
          </div>

          <div className="mt-5 border-[3px] border-ink bg-[#e8e8e8] p-1 shadow-[inset_2px_2px_0_#808080,inset_-2px_-2px_0_#ffffff]">
            <motion.div
              className="h-5 bg-ink"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: durationSec, ease: "linear" }}
              onAnimationComplete={() => setReady(true)}
            />
          </div>

          <AnimatePresence mode="wait">
            {ready ? (
              <motion.div
                key="play"
                className="mt-5 flex justify-center"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: EASE_OUT_CUBIC }}
              >
                <button
                  type="button"
                  onClick={handlePlay}
                  disabled={playing}
                  className={`hover-cursor-on-dark ${retroCtaClasses({ variant: "outline", accentClass: retroCtaOutlineHover(accent) })}`}
                >
                  ▶ Play
                </button>
              </motion.div>
            ) : (
              <motion.p
                key="wait"
                className={`mt-3 text-center ${typeMeta} text-ink/70`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Please wait…
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Lens hub — high-level overview after picking a lens
// ───────────────────────────────────────────────────────────────────────────

type HubSection = {
  id: string;
  label: string;
  desc: string;
  image?: string;
  imageMobile?: string;
  imageAlt?: string;
};

const LensHub = React.forwardRef<
  HTMLElement,
  {
    lens: Exclude<Lens, "jane">;
    onNavigate: (sectionId: string, meta: CaseStudyNavMeta) => void;
    onShowFull: () => void;
    disabled: boolean;
    hideScrollThrough?: boolean;
  }
>(function LensHub(
  {
    lens,
    onNavigate,
    onShowFull,
    disabled,
    hideScrollThrough = false,
  },
  ref,
) {
  const accent = ACCENTS[lens];

  const primarySections: HubSection[] =
    lens === "recruiter"
      ? PROJECTS.map((p) => ({
          id: caseStudyId(p.title),
          label: p.title,
          desc: p.subtitle,
          image: p.images.hero,
          imageAlt: `${p.title} — preview`,
        }))
      : DESIGNER_PROJECTS.map((p) => ({
          id: caseStudyId(p.title),
          label: p.title,
          desc: p.subtitle,
          image: p.images.hero,
          imageMobile: p.images.heroMobile,
          imageAlt: `${p.title} — preview`,
        }));

  return (
    <section
      ref={ref}
      id="lens-hub"
      className={`relative z-10 border-t-[3px] border-ink md:border-t-0 ${LENSES[lens].fitBg}`}
      aria-labelledby="lens-hub-heading"
    >
      <div className="mx-auto max-w-[1280px] px-6 py-12 md:px-20 md:py-20">
        <div className="text-center md:text-left">
            <h2 id="lens-hub-heading" className={typeSection}>
              Case studies
            </h2>
            <p className={`mt-3 max-w-[560px] ${typeLead}`}>
              {HUB_INTRO[lens]}
            </p>
        </div>

        <div
          className={`mt-12 grid items-stretch gap-6 ${
            primarySections.length === 3
              ? "md:grid-cols-3"
              : "md:grid-cols-2"
          }`}
        >
          {primarySections.map((section) => (
            <button
              key={section.id}
              type="button"
              disabled={disabled}
              onClick={() =>
                onNavigate(section.id, {
                  label: section.label,
                  image: section.image,
                })
              }
              className={[
                "group relative m-0 flex h-full w-full flex-col overflow-hidden border-[3px] border-ink bg-hwite p-0 text-left text-ink outline-none",
                "transition-[transform,box-shadow] duration-200 ease-out",
                "focus-visible:-translate-y-1 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-hwite focus-visible:shadow-[3px_3px_0_0_#0f0000]",
                disabled
                  ? "cursor-not-allowed opacity-80"
                  : "cursor-pointer hover:-translate-y-1 hover:shadow-[3px_3px_0_0_#0f0000]",
              ].join(" ")}
            >
              {section.image ? (
                <span className="block w-full overflow-hidden border-b-[3px] border-ink">
                  {section.imageMobile ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={section.imageMobile}
                        alt={section.imageAlt ?? ""}
                        className="block h-auto w-full select-none md:hidden"
                        draggable={false}
                        loading="lazy"
                      />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={section.image}
                        alt={section.imageAlt ?? ""}
                        className="hidden h-auto w-full select-none md:block"
                        draggable={false}
                        loading="lazy"
                      />
                    </>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={section.image}
                      alt={section.imageAlt ?? ""}
                      className="block h-auto w-full select-none"
                      draggable={false}
                      loading="lazy"
                    />
                  )}
                </span>
              ) : (
                <span
                  className={`flex h-[120px] items-center justify-center border-b-[3px] border-ink md:h-[140px] ${accent.pill}`}
                  aria-hidden
                >
                  <span className={`${typeDecorativeGlyph} text-ink/20`}>
                    {section.label.charAt(0)}
                  </span>
                </span>
              )}
              <span className="flex min-h-0 flex-1 flex-col p-5 md:p-6">
                <span className={typeCardTitle}>{section.label}</span>
                <span className={`mt-2 ${typeBody} text-ink/80`}>
                  {section.desc}
                </span>
                <span className="min-h-8 flex-1" aria-hidden="true" />
                <span
                  className={`w-fit ${retroCtaClasses({
                    size: "sm",
                    variant: "outline",
                    accentClass: retroCtaOutlineHover(accent),
                  })}`}
                >
                  Load case study
                </span>
              </span>
            </button>
          ))}
        </div>

        {!hideScrollThrough ? (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              disabled={disabled}
              onClick={onShowFull}
              className={retroCtaClasses({
                variant: "outline",
                accentClass: retroCtaOutlineHover(accent),
              })}
            >
              Scroll through everything ↓
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
});

// ───────────────────────────────────────────────────────────────────────────
// Hero — always mounted. The 3px bottom border is only for the pre-lens
// landing view (card picker); after any lens is chosen it stays off so
// the moving curtain line is not duplicated when switching lenses.
// ───────────────────────────────────────────────────────────────────────────

const Hero = React.forwardRef<HTMLElement, { hideBottomBorder?: boolean }>(
  function Hero({ hideBottomBorder = false }, ref) {
  // Figma 465:22918 baseline; mobile hero + rainbow scaled ~15% down for dev handoff.
  return (
    <section
      ref={ref}
      className={`relative min-h-0 overflow-hidden bg-hwite ${
        hideBottomBorder ? "" : "border-b-[3px] border-ink"
      }`}
    >
      {/*
        Mobile rainbow: bottom-anchored with matching padding on the copy column
        (max-md:pb-[250px]) so the section height doesn’t use a loose min-h (604) —
        that extra min left a band of bg-hwite between the art and the border.
      */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[250px] overflow-hidden md:hidden"
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={publicPath("/mobile-hero-rainbow.svg")}
          alt=""
          aria-hidden
          draggable={false}
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 pt-[53px] max-md:pb-[250px] md:px-20 md:pb-24 md:pt-28">
        <div className="min-w-0 max-w-full w-2/3 max-[499px]:w-full text-ink">
          <p className={typeIntro}>I&rsquo;m Chaela Watkins</p>
          <h1 className={`mt-2 md:mt-6 ${typeDisplay}`}>
            UX &amp; Product Designer
          </h1>
          <p className={`mt-2 max-w-full md:mt-10 ${typeLead}`}>
            I design strategic, creative experiences that reduce friction and impact
            those numbers people stare at in meetings.
          </p>
        </div>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={publicPath("/rainbow-hero.svg")}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden h-full w-auto max-w-none select-none md:block"
      />
    </section>
  );
});

// ───────────────────────────────────────────────────────────────────────────
// "Who are you?" — only mounted before a lens is picked
// ───────────────────────────────────────────────────────────────────────────

function WhoAreYouSection({
  onPick,
  disabled,
}: {
  onPick: (lens: Lens) => void;
  disabled: boolean;
}) {
  const cardNameId = useId();
  const mobileScrollRef = useRef<HTMLDivElement | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const goToSlide = (index: number) => {
    const el = mobileScrollRef.current;
    if (!el) return;
    const child = el.children[index] as HTMLElement | undefined;
    if (!child) return;
    child.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  useEffect(() => {
    const el = mobileScrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const children = Array.from(el.children) as HTMLElement[];
      if (children.length === 0) return;
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      children.forEach((ch, i) => {
        const cMid = ch.offsetLeft + ch.offsetWidth / 2;
        const d = Math.abs(cMid - mid);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setActiveSlide(best);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative z-10 font-sans text-ink antialiased">
    <div className="mx-auto w-full max-w-[1280px] border-t-[3px] border-ink bg-hwite pb-12 pt-6 md:border-t-0 md:px-20 md:pb-28 md:pt-20">
      <h2 className={`px-6 text-center md:px-0 ${typeSection}`}>
        Who are you?
      </h2>

      <div
        ref={mobileScrollRef}
        className="mt-6 flex snap-x snap-mandatory flex-row items-end justify-start gap-[27px] overflow-x-auto overflow-y-visible overscroll-x-contain px-6 pb-2 [scrollbar-width:none] scroll-smooth touch-pan-x md:mx-0 md:mt-16 md:items-end md:justify-center md:gap-4 md:overflow-x-visible md:px-0 md:pb-0 md:touch-auto md:[&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {LENS_ORDER.map((lensId) => {
          const meta = LENSES[lensId];
          const titleId = `${cardNameId}-${lensId}-title`;
          const descId = `${cardNameId}-${lensId}-desc`;
          return (
            <button
              key={lensId}
              type="button"
              disabled={disabled}
              aria-labelledby={`${titleId} ${descId}`}
              onClick={() => onPick(lensId)}
              className={[
                "m-0 appearance-none border-0 bg-transparent p-0 font-sans",
                "group relative flex w-[263px] max-w-[80vw] shrink-0 snap-center flex-col items-stretch text-left text-ink transition-transform duration-200",
                "scroll-mx-4 outline-none",
                "focus-visible:-translate-y-1 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-hwite",
                "md:max-w-[263px]",
                disabled
                  ? "cursor-not-allowed opacity-80"
                  : "cursor-pointer md:hover:-translate-y-1",
              ].join(" ")}
            >
              <span className="relative z-10 -mb-[126px] box-border flex h-[180px] w-full items-end justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={meta.character.src}
                  alt=""
                  aria-hidden
                  width={meta.character.width}
                  height={meta.character.height}
                  className="pointer-events-none h-full w-auto max-w-full select-none object-contain"
                  draggable={false}
                />
              </span>

              <span
                className="box-border flex h-[304px] w-full flex-col justify-end border-[3px] border-ink p-5 pb-6 text-ink"
                style={{ backgroundColor: meta.bg }}
              >
                <span id={titleId} className={`block text-left ${typeCardTitle}`}>
                  {meta.label}
                </span>
                <span id={descId} className={`mt-3 block text-left ${typeBody}`}>
                  {meta.desc}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <ul
        className="mt-3 flex list-none items-center justify-center gap-2 p-0 md:hidden"
        aria-label="Who are you carousel"
      >
        {LENS_ORDER.map((lensId, i) => (
          <li key={lensId} className="list-none p-0">
            <button
              type="button"
              aria-label={`Show ${LENSES[lensId].label} card`}
              aria-current={i === activeSlide ? "true" : undefined}
              disabled={disabled}
              onClick={() => goToSlide(i)}
              className={
                i === activeSlide
                  ? "h-2.5 w-2.5 rounded-full border-[3px] border-ink bg-ink p-0 outline-none transition-transform focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-hwite active:scale-90 disabled:opacity-50"
                  : "h-2.5 w-2.5 rounded-full border-[3px] border-ink bg-hwite p-0 outline-none transition-transform focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-hwite active:scale-90 disabled:opacity-50"
              }
            />
          </li>
        ))}
      </ul>
    </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Lens-switcher pill (persistent, top-right)
// ───────────────────────────────────────────────────────────────────────────

function LensPill({
  current,
  onPick,
  disabled,
}: {
  current: Lens;
  onPick: (lens: Lens) => void;
  disabled: boolean;
}) {
  const panelId = useId();
  const switchHeadingId = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Close the menu if the app is mid-transition.
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  const meta = LENSES[current];
  const others = LENS_ORDER.filter((l) => l !== current);

  return (
    <div
      ref={rootRef}
      className="fixed right-4 top-4 z-40 md:right-6 md:top-6"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        aria-haspopup="true"
        aria-controls={open ? panelId : undefined}
        aria-expanded={open}
        className={`hover-cursor-on-dark flex items-center gap-2 normal-case ${retroCtaClasses({ size: "sm", variant: "outline", accentClass: retroCtaOutlineHover(ACCENTS[current]) })}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={meta.character.src}
          alt=""
          aria-hidden
          className="h-7 w-auto"
          draggable={false}
        />
        <span className={typeBody}>{meta.label}</span>
        <motion.span
          aria-hidden
          className={`ml-1 ${typeIconSm}`}
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18, ease: EASE_OUT_CUBIC }}
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="lens-menu"
            id={panelId}
            role="group"
            aria-labelledby={switchHeadingId}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: EASE_OUT_CUBIC }}
            className="absolute right-0 mt-3 min-w-[240px] origin-top-right overflow-hidden border-[3px] border-ink bg-hwite shadow-[4px_4px_0_0_#0f0000]"
          >
            <div
              id={switchHeadingId}
              className={`border-b-[3px] border-ink/30 px-4 py-2 uppercase tracking-wide text-ink/60 ${typeBody}`}
            >
              Switch lens
            </div>
            <ul className="m-0 list-none p-0">
              {others.map((lensId) => {
                const m = LENSES[lensId];
                return (
                  <li key={lensId} className="list-none">
                    <button
                      type="button"
                      aria-label={`Switch to ${m.label}`}
                      onClick={() => {
                        setOpen(false);
                        onPick(lensId);
                      }}
                      className={`hover-cursor-on-dark flex w-full items-center gap-3 px-4 py-3 text-left outline-none transition-colors hover:bg-ink hover:text-hwite focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink ${typeBody}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.character.src}
                        alt=""
                        aria-hidden
                        className="h-8 w-auto"
                        draggable={false}
                      />
                      <span>{m.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Recruiter variant
// ───────────────────────────────────────────────────────────────────────────

function RecruiterVariant({
  belowHub = false,
  scrollTarget,
  onScrollTargetHandled,
}: {
  belowHub?: boolean;
  scrollTarget: string | null;
  onScrollTargetHandled: () => void;
}) {
  return (
    <div>
      {PROJECTS.map((project, index) => (
        <React.Fragment key={project.title}>
          <ProjectSection
            project={project}
            id={caseStudyId(project.title)}
            scrollTarget={scrollTarget}
            onScrollTargetHandled={onScrollTargetHandled}
            belowHub={belowHub}
            beforeFooter={index === PROJECTS.length - 1}
          />
          {index === 1 && <EspressoBreakSection />}
        </React.Fragment>
      ))}

      <ContactFooter lens="recruiter" />
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Designer variant
//
// Mirrors the recruiter structure (case studies → let's chat) with
// designer-specific data and a per-case-study "Design & build" section.
// ───────────────────────────────────────────────────────────────────────────

function DesignerVariant({
  belowHub = false,
  scrollTarget,
  onScrollTargetHandled,
}: {
  belowHub?: boolean;
  scrollTarget: string | null;
  onScrollTargetHandled: () => void;
}) {
  return (
    <div>
      {DESIGNER_PROJECTS.map((project, index) => (
        <React.Fragment key={project.title}>
          <DesignerProjectSection
            project={project}
            id={caseStudyId(project.title)}
            scrollTarget={scrollTarget}
            onScrollTargetHandled={onScrollTargetHandled}
            belowHub={belowHub}
            beforeFooter={index === DESIGNER_PROJECTS.length - 1}
          />
          {index === 1 && <EspressoBreakSection />}
        </React.Fragment>
      ))}

      <ContactFooter lens="designer" />
    </div>
  );
}

// Shared "Let's chat IRL" block + footer illustration. Pulled out so the
// recruiter / designer / jane variants can each slot it in without
// duplicating the markup. Hover accent follows the active lens so the
// pink/blue brand cue stays consistent end-to-end.
function ContactFooter({ lens }: { lens: Lens }) {
  const accent = ACCENTS[lens];

  return (
    <div id="contact" className="border-t-[3px] border-ink">
      <div className="mx-auto max-w-[1280px] px-6 pt-20 pb-6 text-center md:px-20 md:pt-28 md:pb-8">
        <h2 className={typeSection}>Let&rsquo;s chat IRL</h2>
        <p className={`mx-auto mt-4 max-w-[520px] ${typeBody}`}>
          If you&rsquo;ve made it this far, I&rsquo;m getting the feeling we might work
          well together, and I&rsquo;d love to know what brought you here.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-[23px]">
          <a
            href="mailto:designbeanies@gmail.com"
            className={`hover-cursor-on-dark whitespace-nowrap transition-colors ${retroCtaClasses({
              variant: "outline",
              accentClass: retroCtaOutlineHover(accent),
            })}`}
          >
            Email
          </a>
          <a
            href="https://www.linkedin.com/in/chaelawatkins"
            target="_blank"
            rel="noopener noreferrer"
            className={`hover-cursor-on-dark whitespace-nowrap transition-colors ${retroCtaClasses({
              variant: "outline",
              accentClass: retroCtaOutlineHover(accent),
            })}`}
          >
            LinkedIn
          </a>
        </div>
      </div>
      <FooterIllustration />
    </div>
  );
}

/** Footer strip — rises into view when the illustration enters the viewport. */
function FooterIllustration() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const el = ref.current;
    if (!el) return;

    const check = () => {
      const { top, bottom } = el.getBoundingClientRect();
      if (top < window.innerHeight + 120 && bottom > 0) {
        setRevealed(true);
      }
    };

    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [prefersReducedMotion]);

  const illustration = (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={publicPath("/footer.svg")}
      alt=""
      aria-hidden
      className="block w-full select-none"
      draggable={false}
    />
  );

  if (prefersReducedMotion) {
    return <div ref={ref}>{illustration}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 1, y: 40 }}
      animate={revealed ? { opacity: 1, y: 0 } : { opacity: 1, y: 40 }}
      transition={{ duration: 0.8, ease: EASE_OUT_CUBIC }}
    >
      {illustration}
    </motion.div>
  );
}


/** Subtle scroll-reveal for recruiter / designer case study blocks. */
function CaseStudyReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -4% 0px" }}
      transition={{ duration: 0.52, ease: EASE_OUT_CUBIC, delay }}
    >
      {children}
    </motion.div>
  );
}


/** Scroll-reveal tuned for before / after comparison images. */
function CaseStudyImageReveal({
  children,
  className = "",
  side,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  side: "before" | "after";
  delay?: number;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const x = side === "before" ? -24 : 24;

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x, y: 10 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.18, margin: "0px 0px -8% 0px" }}
      transition={{
        opacity: { duration: 1.05, ease: EASE_OUT_CUBIC, delay },
        x: { duration: 0.95, ease: EASE_OUT_CUBIC, delay },
        y: { duration: 0.95, ease: EASE_OUT_CUBIC, delay },
      }}
    >
      {children}
    </motion.div>
  );
}


const FIT_PILL_MAX = 7;

/** Case-study skill pills shown on each project. */
function CaseStudySkillPills({
  skills,
  moreSkills,
  pillClassName,
  moreButtonClassName,
}: {
  skills: string[];
  moreSkills: string[];
  pillClassName: string;
  moreButtonClassName: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const allSkills = useMemo(() => [...skills, ...moreSkills], [skills, moreSkills]);

  const pillEase = [0.22, 1, 0.36, 1] as const;
  const pillDuration = prefersReducedMotion ? 0 : 0.28;
  const pillStagger = prefersReducedMotion ? 0 : 0.03;

  const head = allSkills.slice(0, FIT_PILL_MAX);
  const tail = allSkills.slice(FIT_PILL_MAX);
  const showExpandControl = tail.length > 0;

  useEffect(() => {
    if (allSkills.length <= FIT_PILL_MAX) setExpanded(false);
  }, [allSkills.length]);

  if (allSkills.length === 0) return null;

  return (
    <motion.div layout className="mt-8 flex flex-wrap gap-2">
      {head.map((s) => (
        <motion.span
          layout="position"
          key={s}
          className={pillClassName}
        >
          {s}
        </motion.span>
      ))}
      <AnimatePresence initial={false} mode="popLayout">
        {expanded &&
          tail.map((s, i) => (
            <motion.span
              layout="position"
              key={s}
              initial={{ opacity: 0, y: -4, scale: 0.92 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  duration: pillDuration,
                  ease: pillEase,
                  delay: i * pillStagger,
                },
              }}
              exit={{
                opacity: 0,
                scale: 0.92,
                transition: {
                  duration: prefersReducedMotion ? 0 : 0.18,
                  ease: pillEase,
                },
              }}
              className={pillClassName}
            >
              {s}
            </motion.span>
          ))}
      </AnimatePresence>
      {showExpandControl && (
        <motion.button
          layout="position"
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className={moreButtonClassName}
        >
          <span className="invisible block" aria-hidden>
            {expanded ? "Show less" : `+${tail.length} more`}
          </span>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={expanded ? "less" : "more"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.2,
                ease: pillEase,
              }}
              className="absolute inset-0 flex items-center justify-center whitespace-nowrap"
            >
              {expanded ? "Show less" : `+${tail.length} more`}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      )}
    </motion.div>
  );
}

/** Case-study landing (memory-card focus) — capped hero height. */
const LANDING_HERO_IMG_CLASS =
  "block h-auto w-full max-h-[min(600px,65vh)] select-none object-cover object-top md:max-h-[min(760px,72vh)]";

function CaseStudyHeroImage({
  hero,
  heroMobile,
  title,
  landing = false,
}: {
  hero: string;
  heroMobile?: string;
  title: string;
  landing?: boolean;
}) {
  const alt = `${title} — screens overview`;
  const className = landing
    ? LANDING_HERO_IMG_CLASS
    : "block h-auto w-full select-none";

  if (!heroMobile) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={hero}
        alt={alt}
        className={className}
        draggable={false}
        loading="lazy"
      />
    );
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={heroMobile}
        alt={alt}
        className={`${className} md:hidden`}
        draggable={false}
        loading="lazy"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={hero}
        alt={alt}
        className={`${className} hidden md:block`}
        draggable={false}
        loading="lazy"
      />
    </>
  );
}

function ProjectSection({
  project,
  id,
  scrollTarget,
  onScrollTargetHandled,
  variant = "default",
  belowHub = false,
  beforeFooter = false,
}: {
  project: Project;
  id: string;
  scrollTarget: string | null;
  onScrollTargetHandled: () => void;
  variant?: "default" | "landing";
  belowHub?: boolean;
  beforeFooter?: boolean;
}) {
  const isLanding = variant === "landing";

  return (
    <section className={beforeFooter ? "bg-hwite pb-10" : "bg-hwite"}>
      <SectionScrollAnchor
        id={id}
        scrollTarget={scrollTarget}
        onComplete={onScrollTargetHandled}
      />
      <CaseStudyReveal>
        <figure className={isLanding ? "w-full overflow-hidden" : "w-full"}>
          <CaseStudyHeroImage
            hero={project.images.hero}
            heroMobile={project.images.heroMobile}
            title={project.title}
            landing={isLanding}
          />
        </figure>
      </CaseStudyReveal>

      <CaseStudyReveal delay={0.06}>
        <div
          className={
            isLanding
              ? "mx-auto max-w-[1280px] px-6 pt-10 md:px-20 md:pt-14"
              : belowHub
                ? "mx-auto max-w-[1280px] px-6 pt-12 md:px-20 md:pt-16"
                : "mx-auto max-w-[1280px] px-6 pt-16 md:px-20 md:pt-24"
          }
        >
          <h3
            id={id}
            tabIndex={-1}
            className={typeSectionScroll}
          >
            {project.title}
          </h3>
          <p className={`mt-2 ${typeLead}`}>
            {project.subtitle}
          </p>

          <CaseStudySkillPills
            skills={project.skills}
            moreSkills={project.moreSkills}
            pillClassName={`bg-millennial p-2 ${typePill}`}
            moreButtonClassName={`hover-cursor-on-dark relative overflow-hidden ${retroCtaClasses({ size: "xs", variant: "outline", accentClass: retroCtaOutlineHover(ACCENTS.recruiter) })}`}
          />
        </div>
      </CaseStudyReveal>

      <div
        className={
          isLanding
            ? "mx-auto max-w-[1280px] px-6 pb-10 md:px-20 md:pb-14"
            : belowHub
              ? "mx-auto max-w-[1280px] px-6 pb-12 md:px-20 md:pb-16"
              : "mx-auto max-w-[1280px] px-6 pb-16 md:px-20 md:pb-24"
        }
      >
        <div className="mt-12 space-y-14 md:mt-[76px] md:space-y-[110px]">
          <DetailRow label="The Challenge" body={project.challenge} revealDelay={0} />
          <DetailRow label="The Approach" body={project.approach} revealDelay={0.08} />
          <DetailRow label="The Solution" body={project.solution} revealDelay={0.16} />
        </div>
      </div>

      <div className="mx-auto mt-16 w-full max-w-[1280px] px-6 pb-8 md:mt-[110px] md:px-20 md:pb-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-12">
          <CaseStudyImageReveal side="before">
            <figure className="flex min-w-0 w-full flex-col items-stretch">
              <figcaption className={`mb-6 text-center ${typeSubsection}`}>
                Before
              </figcaption>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.images.before}
                alt={`${project.title} — before`}
                className="block h-auto w-full max-w-full select-none"
                draggable={false}
                loading="lazy"
              />
            </figure>
          </CaseStudyImageReveal>
          <CaseStudyImageReveal side="after" delay={0.14}>
            <figure className="flex min-w-0 w-full flex-col items-stretch">
              <figcaption className={`mb-6 text-center ${typeSubsection}`}>
                After
              </figcaption>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.images.after}
                alt={`${project.title} — after`}
                className="block h-auto w-full max-w-full select-none"
                draggable={false}
                loading="lazy"
              />
            </figure>
          </CaseStudyImageReveal>
        </div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// DesignerProjectSection — case study layout for the designer lens. Shares
// ProjectSection's hero/title/pills/before–after bones, but swaps the
// Challenge → Approach → Solution triplet for Challenge → Solution, and
// adds a three-column "Design & build" section afterwards.
// ───────────────────────────────────────────────────────────────────────────

function DesignerProjectSection({
  project,
  id,
  scrollTarget,
  onScrollTargetHandled,
  variant = "default",
  belowHub = false,
  beforeFooter = false,
}: {
  project: DesignerProject;
  id: string;
  scrollTarget: string | null;
  onScrollTargetHandled: () => void;
  variant?: "default" | "landing";
  belowHub?: boolean;
  beforeFooter?: boolean;
}) {
  const accent = ACCENTS.designer;
  const isLanding = variant === "landing";

  return (
    <section className={beforeFooter ? "bg-hwite pb-10" : "bg-hwite"}>
      <SectionScrollAnchor
        id={id}
        scrollTarget={scrollTarget}
        onComplete={onScrollTargetHandled}
      />
      <CaseStudyReveal>
        <figure className={isLanding ? "w-full overflow-hidden" : "w-full"}>
          <CaseStudyHeroImage
            hero={project.images.hero}
            heroMobile={project.images.heroMobile}
            title={project.title}
            landing={isLanding}
          />
        </figure>
      </CaseStudyReveal>

      <CaseStudyReveal delay={0.06}>
        <div
          className={
            isLanding
              ? "mx-auto max-w-[1280px] px-6 pt-10 md:px-20 md:pt-14"
              : belowHub
                ? "mx-auto max-w-[1280px] px-6 pt-12 md:px-20 md:pt-16"
                : "mx-auto max-w-[1280px] px-6 pt-16 md:px-20 md:pt-24"
          }
        >
          <h3
            id={id}
            tabIndex={-1}
            className={typeSectionScroll}
          >
            {project.title}
          </h3>
          <p className={`mt-2 ${typeLead}`}>
            {project.subtitle}
          </p>

          <CaseStudySkillPills
            skills={project.skills}
            moreSkills={project.moreSkills}
            pillClassName={`${accent.pill} p-2 ${typePill}`}
            moreButtonClassName={`hover-cursor-on-dark relative box-border overflow-hidden ${retroCtaClasses({ size: "xs", variant: "outline", accentClass: retroCtaOutlineHover(accent) })}`}
          />
        </div>
      </CaseStudyReveal>

      <div
        className={
          isLanding
            ? "mx-auto max-w-[1280px] px-6 pb-10 md:px-20 md:pb-14"
            : belowHub
              ? "mx-auto max-w-[1280px] px-6 pb-12 md:px-20 md:pb-16"
              : "mx-auto max-w-[1280px] px-6 pb-16 md:px-20 md:pb-24"
        }
      >
        <div className="mt-12 space-y-14 md:mt-[76px] md:space-y-[110px]">
          <DetailRow
            label="The Challenge"
            body={project.challenge}
            dividerClass={accent.divider}
            revealDelay={0}
          />
          <DetailRow
            label="The Solution"
            body={project.solution}
            dividerClass={accent.divider}
            revealDelay={0.08}
          />
        </div>
      </div>

      {/* Design & build — three-column grid of illustration + title + body.
          Wide container matches the Figma 1118px content width. */}
      <CaseStudyReveal>
        <div className="mx-auto max-w-[1280px] px-6 pb-16 md:px-20 md:pb-24">
          <h4 className={typeSubsection}>Design &amp; build</h4>
          <div className="mt-10 grid grid-cols-1 gap-10 md:mt-[76px] md:grid-cols-3 md:gap-[58px]">
            {project.designBuild.map((col, index) => (
              <CaseStudyReveal
                key={col.title}
                delay={index * 0.08}
                className="flex flex-col"
              >
                <div className="flex h-[164px] w-[164px] items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={col.illustration}
                    alt=""
                    aria-hidden
                    className="block h-full w-full select-none"
                    draggable={false}
                  />
                </div>
                <h5 className={`mt-10 ${typeSubsection}`}>{col.title}</h5>
                <p className={`mt-4 ${typeBody}`}>{col.body}</p>
              </CaseStudyReveal>
            ))}
          </div>
        </div>
      </CaseStudyReveal>

      <div className="mx-auto w-full max-w-[1280px] px-6 pb-8 md:px-20 md:pb-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-12">
          <CaseStudyImageReveal side="before">
            <figure className="flex min-w-0 w-full flex-col items-stretch">
              <figcaption className={`mb-6 text-center ${typeSubsection}`}>
                Before
              </figcaption>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.images.before}
                alt={`${project.title} — before`}
                className="block h-auto w-full max-w-full select-none"
                draggable={false}
                loading="lazy"
              />
            </figure>
          </CaseStudyImageReveal>
          <CaseStudyImageReveal side="after" delay={0.14}>
            <figure className="flex min-w-0 w-full flex-col items-stretch">
              <figcaption className={`mb-6 text-center ${typeSubsection}`}>
                After
              </figcaption>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.images.after}
                alt={`${project.title} — after`}
                className="block h-auto w-full max-w-full select-none"
                draggable={false}
                loading="lazy"
              />
            </figure>
          </CaseStudyImageReveal>
        </div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Jane Doe variant
//
// Jane arrived out of curiosity, not a hiring scorecard — so her page trades
// the fit-matching + case-study depth for a personality-led story. Two
// sections anchor the variant:
//   1. "What I do" — a dry experience + tools rundown that tells her what
//      Chaela actually ships with (uses the same left-label / divider /
//      right-body tri-column grid as DetailRow for visual continuity).
//   2. "My approach to the craft" — four principle panels in alternating
//      sunnies/goldenhour blocks, each followed by a full-bleed case-study
//      hero as the visual punctuation between principles.
// ───────────────────────────────────────────────────────────────────────────

type JaneExperience = { title: string; company: string; dates: string };

const JANE_EXPERIENCE: JaneExperience[] = [
  {
    title: "Senior User Experience Designer",
    company: "Sonic Automotive",
    dates: "April 2023 – Present",
  },
  {
    title: "Freelance User Experience Designer",
    company: "Design Beanies",
    dates: "November 2021 – Present",
  },
  {
    title: "User Experience Architect",
    company: "Highland Ag Solutions",
    dates: "September 2022 – March 2023",
  },
  {
    title: "Graphic Design Specialist",
    company: "First Internet Bank",
    dates: "November 2019 – August 2022",
  },
];

// Two columns — LTR scan: down col 1, then col 2 (priority order preserved).
const JANE_SKILLS: readonly [string[], string[]] = [
  [
    "UX design",
    "User research",
    "Product strategy",
    "Collaboration",
    "Information architecture",
    "Visual design",
    "User testing",
    "Workshop facilitation",
  ],
  [
    "Interaction design",
    "Design systems",
    "Prototyping",
    "Stakeholder alignment",
    "Information hierarchy",
    "Content strategy",
    "Usability testing",
    "Graphic design",
  ],
];

// Four short columns of tool names, grouped by the type of job they do.
const JANE_TOOLS: readonly [string[], string[], string[], string[]] = [
  ["Figma", "Adobe CC", "Squarespace", "WordPress"],
  ["Claude", "V0 / Vercel", "Cursor", "Github"],
  ["Maze", "UserTesting", "Lookback", "Facilitation"],
  ["Jira", "Monday.com", "Figjam", "Teams/Slack"],
];

type JanePrinciple = {
  title: string;
  body: string;
  // Path to the 256×256 Flaticon SVG. The glyph's fill is baked into the
  // SVG so the icon picks up the alternating sunnies/goldenhour color
  // straight from Figma without needing runtime tinting.
  icon: string;
  // Full-bleed showcase image that follows this principle block.
  image: { src: string; alt: string };
};

const JANE_PRINCIPLES: JanePrinciple[] = [
  {
    title: "I understand before I do anything",
    body: "I go upstream before I go to Figma. Most design problems aren’t design problems. They’re communication problems, operations problems, or someone asking for the wrong thing because they couldn’t articulate the right thing yet. I’d rather spend a week understanding the real problem than a month designing the wrong solution.",
    icon: publicPath("/icons/fi-ss-bulb.svg"),
    image: {
      src: publicPath("/projects/cdo-hero.png"),
      alt: "Cazador del Oso site",
    },
  },
  {
    title: "The story has to land before anything else does",
    body: "If someone doesn’t understand what they’re looking at or why it matters, no amount of good design will get them to act. But the reverse is just as true: great content shown poorly, cheaply, or in a way that feels spammy will lose people just as fast. That’s why I collaborate closely with content designers and have invested in developing my own content skills. The words and the design have to work together to tell the story or neither one works.",
    icon: publicPath("/icons/fi-ss-rocket.svg"),
    image: {
      src: publicPath("/projects/tmp-hero.png"),
      alt: "Team Mancuso Powersports site",
    },
  },
  {
    title: "Some of the best ideas don’t start on the screen",
    body: "There’s something that happens when you slow down and step away from technology. Taking a hike outside, sketching or writing on paper, a conversation over coffee. Inspiration doesn’t always come from staring at a monitor, and in a world where AI can generate anything in seconds, the most interesting ideas still tend to come from being a human first.",
    icon: publicPath("/icons/fi-ss-tree.svg"),
    image: {
      src: publicPath("/projects/SRPDESKTOP.svg"),
      alt: "SRP tile redesign",
    },
  },
  {
    title: "Good design lives at the intersection of three things",
    body: "Empathy, creativity, and passion. Pull any one of them out and something breaks. You might solve the right problem unimaginatively, or pour creative energy into something that misses what people actually need, or execute well on something nobody cared enough about to get right. When all three are in the room, it shows.",
    icon: publicPath("/icons/fi-ss-chart-set-theory.svg"),
    image: {
      src: publicPath("/projects/sca-hero.png"),
      alt: "EchoPark credit application",
    },
  },
];

function JaneVariant({
  scrollTarget,
  onScrollTargetHandled,
}: {
  scrollTarget: string | null;
  onScrollTargetHandled: () => void;
}) {
  return (
    <div>
      <ScrollAnchor
        targetId={scrollTarget}
        onComplete={onScrollTargetHandled}
      />
      <WhatIDoSection />
      <ApproachSection />
      <ContactFooter lens="jane" />
    </div>
  );
}

function WhatIDoSection() {
  // Figma: desktop — label + short sunnies divider (JaneRow). Mobile (465:25440)
  // — 48/56 "What I do", 32px row titles, full-width sunnies dividers, 16px/1.76
  // body, tools in 2×2 at 120px + 24px gap.
  return (
    <section className="bg-[#F3F3F3]">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-[60px] px-6 py-[60px] md:gap-[63px] md:px-20 md:py-20">
        <h2 id="what-i-do" tabIndex={-1} className={typeSectionScroll}>
          What I do
        </h2>

        <div className="flex flex-col gap-[60px] md:gap-[110px]">
          <JaneRow label="My experience">
            <div className={`space-y-5 ${typeBody}`}>
              {JANE_EXPERIENCE.map((job) => (
                <p key={`${job.company}-${job.title}`}>
                  {job.title}, {job.company}
                  <br />
                  {job.dates}
                </p>
              ))}
            </div>
          </JaneRow>

          <JaneRow label="Tools I use">
            <div className={`grid grid-cols-2 content-start gap-6 md:grid-cols-4 md:gap-x-9 md:gap-y-6 ${typeBody}`}>
              {JANE_TOOLS.map((col, i) => (
                <ul key={i} className="w-[120px] md:w-auto">
                  {col.map((tool) => (
                    <li key={tool}>{tool}</li>
                  ))}
                </ul>
              ))}
            </div>
          </JaneRow>

          <JaneRow label="Core skills">
            <div className={`grid grid-cols-2 content-start gap-x-6 gap-y-0 md:gap-x-9 ${typeBody}`}>
              {JANE_SKILLS.map((col, i) => (
                <ul key={i} className="min-w-0">
                  {col.map((skill) => (
                    <li key={skill} className="md:whitespace-nowrap">
                      {skill}
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </JaneRow>
        </div>
      </div>
    </section>
  );
}

function EspressoBreakSection() {
  return (
    <section className="cursor-surface-dark bg-ink px-6 py-16 md:py-[120px] md:pb-[121px]">
      <div className="mx-auto flex w-full max-w-[828px] flex-col items-center gap-20 md:gap-[234px]">
        <CaseStudyReveal>
          <div className="flex w-full max-w-[764px] flex-col items-center gap-3">
            <h2 className={`text-center text-hwite ${typeSection}`}>
              You&rsquo;ve been here a while. Time for an espresso break
            </h2>
            <div
              className="relative w-full max-w-[570px]"
              style={{ aspectRatio: "570.296 / 403" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={publicPath("/jane/coffee-break/espresso-illustration.svg")}
                alt=""
                className="block h-full w-full object-contain"
                draggable={false}
              />
            </div>
          </div>
        </CaseStudyReveal>
        <CaseStudyReveal delay={0.08}>
          <div className="flex w-full flex-col items-center gap-10 md:gap-[62px]">
            <h2 className={`w-full text-center text-hwite ${typeSection}`}>
              Oh, you&rsquo;re hangin&rsquo; around?
            </h2>
            <div className="flex w-full max-w-[540px] flex-col items-center">
              <a
                href="https://makeagif.com/gif/brooklyn-nine-nine-cool-cool-cool-UtoxFx"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-hwite focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://i.makeagif.com/media/8-23-2018/UtoxFx.gif"
                  alt="Brooklyn Nine-Nine — cool, cool, cool…"
                  className="block h-auto w-full"
                  loading="lazy"
                  decoding="async"
                />
              </a>
              <p className={`mt-2 text-center ${typeBody} text-hwite/50`}>
                <a
                  href="https://makeagif.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-sm underline decoration-hwite/30 underline-offset-2 outline-none hover:text-hwite/70 focus-visible:ring-2 focus-visible:ring-hwite focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              >
                MakeaGif
              </a>
            </p>
          </div>
          </div>
        </CaseStudyReveal>
      </div>
    </section>
  );
}

// Shared row chrome for the Jane "What I do" section. Label on the left,
// a short centered sunnies divider floating between the two, and the
// caller's content on the right at a comfortable reading width.
function JaneRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[185px_450px_464px] md:items-start md:gap-0">
      <h3 className={typeSubsection}>{label}</h3>
      <div
        className="h-px w-full max-md:bg-sunnies md:hidden"
        aria-hidden
      />
      <div className="hidden md:relative md:block md:h-[82px]">
        <div
          aria-hidden
          className="absolute left-[98px] top-[24px] h-[1px] w-[245px] bg-sunnies"
        />
      </div>
      <div className="min-w-0 md:max-w-[464px]">{children}</div>
    </div>
  );
}

function ApproachSection() {
  return (
    <section className="bg-hwite">
      <div className="mx-auto max-w-[1280px] bg-[#F3F3F3] px-6 py-[60px] md:bg-hwite md:px-20 md:py-16">
        <h2 id="approach" tabIndex={-1} className={typeSectionScroll}>
          My approach to the craft
        </h2>
      </div>

      {JANE_PRINCIPLES.map((principle, i) => {
        const reversed = i % 2 === 1;
        const iconPanelBg = reversed ? "bg-sunnies" : "bg-goldenhour";
        return (
          <React.Fragment key={principle.title}>
            <PrincipleRow
              principle={principle}
              reversed={reversed}
              iconPanelBg={iconPanelBg}
            />
            <JanePrincipleImage principle={principle} />
          </React.Fragment>
        );
      })}
    </section>
  );
}

function JanePrincipleImage({ principle }: { principle: JanePrinciple }) {
  return (
    <JaneFadeIn className="w-full">
      <figure className="w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={principle.image.src}
          alt={principle.image.alt}
          width={2560}
          height={1722}
          className="block h-auto w-full select-none"
          draggable={false}
          loading="lazy"
        />
      </figure>
    </JaneFadeIn>
  );
}

/** Scroll-reveal fade for Jane full-bleed project strips. */
function JaneFadeIn({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.25, margin: "0px 0px -3% 0px" }}
      transition={{ duration: 0.42, ease: EASE_OUT_CUBIC }}
    >
      {children}
    </motion.div>
  );
}

/** Scroll-reveal for Jane principle icons — slides in from the panel side. */
function JaneSlideInIcon({
  from,
  children,
  className = "",
}: {
  from: "left" | "right";
  children: React.ReactNode;
  className?: string;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const x = from === "left" ? -40 : 40;

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.35, margin: "0px 0px -4% 0px" }}
      transition={{
        opacity: { duration: 1.05, ease: EASE_OUT_CUBIC },
        x: { duration: 0.85, ease: EASE_OUT_CUBIC },
      }}
    >
      {children}
    </motion.div>
  );
}

function PrincipleRow({
  principle,
  reversed,
  iconPanelBg,
}: {
  principle: JanePrinciple;
  reversed: boolean;
  iconPanelBg: string;
}) {
  const iconSlideFrom: "left" | "right" = reversed ? "left" : "right";
  const textSlideFrom: "left" | "right" = reversed ? "right" : "left";

  // Text panel sits on hwite. On md+, the row sits in the shared 1280px rail;
  // full-bleed color is painted by the outer flex wings, not viewport-wide columns.
  const text = (
    <div
      className={[
        "flex min-h-[320px] items-center bg-hwite py-14 md:min-h-[598px]",
        // Page gutters live on the text column only. Horizontal padding on the
        // outer grid would sit between the icon fill and the flex wings, and
        // the padded strip is transparent — so #f7f8f8 shows through as a “white” gap.
        reversed ? "md:pr-20 md:pl-12" : "md:pl-20 md:pr-12",
      ].join(" ")}
    >
      <JaneSlideInIcon
        from={textSlideFrom}
        className={`flex w-full max-w-[549px] flex-col gap-6 md:gap-8 ${reversed ? "md:ml-auto" : ""}`}
      >
        <h3 className={typeSubsection}>{principle.title}</h3>
        <p className={typeBody}>{principle.body}</p>
      </JaneSlideInIcon>
    </div>
  );
  const icon = (
    <div
      className={[
        "flex min-h-[320px] items-center justify-center py-14 md:min-h-[598px]",
        "md:px-0",
        iconPanelBg,
      ].join(" ")}
    >
      <JaneSlideInIcon
        from={iconSlideFrom}
        className="flex items-center justify-center"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={principle.icon}
          alt=""
          aria-hidden
          width={256}
          height={256}
          className="h-[160px] w-[160px] select-none md:h-[256px] md:w-[256px]"
          draggable={false}
        />
      </JaneSlideInIcon>
    </div>
  );

  // Mobile (e.g. 465:64353): stacked, #F3F3F3, 164px round icon, 32/24 type.
  const mobile = (
    <div className="w-full bg-[#F3F3F3] py-[60px] md:hidden">
      <div className="mx-auto max-w-[1280px] px-6">
      <JaneSlideInIcon from="left">
      <div
        className={`flex h-[164px] w-[164px] items-center justify-center self-start rounded-full p-[34px] ${iconPanelBg}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={principle.icon}
          alt=""
          aria-hidden
          width={100}
          height={100}
          className="h-[100px] w-[100px] max-h-[100px] max-w-[100px] object-contain select-none"
          draggable={false}
        />
      </div>
      </JaneSlideInIcon>
      <JaneSlideInIcon from="right" className="flex flex-col gap-8 pt-6">
        <h3 className={typeSubsection}>{principle.title}</h3>
        <p className={typeBody}>{principle.body}</p>
      </JaneSlideInIcon>
      </div>
    </div>
  );

  return (
    <>
      {mobile}
      <div className="hidden min-h-[598px] w-full min-w-0 md:flex md:items-stretch">
        <div
          aria-hidden
          className={[
            "min-w-0 flex-1 basis-0",
            reversed ? iconPanelBg : "bg-hwite",
          ].join(" ")}
        />
        <div className="box-border grid min-w-0 w-[min(100%,1280px)] max-w-[1280px] shrink-0 grid-cols-2">
          {reversed ? (
            <>
              {icon}
              {text}
            </>
          ) : (
            <>
              {text}
              {icon}
            </>
          )}
        </div>
        <div
          aria-hidden
          className={[
            "min-w-0 flex-1 basis-0",
            reversed ? "bg-hwite" : iconPanelBg,
          ].join(" ")}
        />
      </div>
    </>
  );
}

function DetailRow({
  label,
  body,
  dividerClass = "bg-salmon",
  revealDelay = 0,
}: {
  label: string;
  body: string;
  dividerClass?: string;
  revealDelay?: number;
}) {
  return (
    <CaseStudyReveal delay={revealDelay}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(140px,225px)_minmax(0,1fr)] md:items-start md:gap-x-6 lg:gap-x-8 xl:grid-cols-[225px_minmax(48px,303px)_minmax(280px,530px)] xl:items-start xl:gap-x-0">
        <h4 className={`${typeSubsection} md:col-start-1 md:row-start-1`}>
          {label}
        </h4>
        <div
          aria-hidden
          className={`hidden h-[2px] min-w-0 xl:col-start-2 xl:row-start-1 xl:mt-[22px] xl:block ${dividerClass}`}
        />
        <p className={`min-w-0 ${typeBody} md:col-start-2 md:row-start-1 xl:col-start-3 xl:ml-[41px]`}>
          {body}
        </p>
      </div>
    </CaseStudyReveal>
  );
}

