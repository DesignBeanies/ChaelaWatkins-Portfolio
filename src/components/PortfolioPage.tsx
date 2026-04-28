"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { publicPath } from "@/lib/publicPath";

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

// ───────────────────────────────────────────────────────────────────────────
// Fit-section data: case-study tag sets (per lens) + master skill vocabulary
// ───────────────────────────────────────────────────────────────────────────

// Tags curated per (case study × lens). The pills shown by default in the
// "Am I the right fit?" section are the union of every case study's tags for
// the active lens, deduped and in first-appearance order.
const CASE_STUDY_TAGS: Record<string, Partial<Record<Lens, string[]>>> = {
  "Powersports site overhaul": {
    recruiter: [
      "AI-assisted design & critique",
      "Product strategy",
      "Information architecture",
      "Design systems",
      "Brand identity",
      "Stakeholder alignment",
      "Ecommerce",
      "KPI improvement",
      "Workshop facilitation",
    ],
    designer: [
      "AI-assisted design & critique",
      "Systems thinking",
      "Information architecture",
      "OEM compliance",
      "Style guide creation",
      "Brand identity",
      "Workshop facilitation",
      "Omnichannel",
      "Stakeholder alignment",
    ],
    jane: [
      "AI-assisted design & critique",
      "Brand identity",
      "Ecommerce",
      "Stakeholder alignment",
      "Design systems",
      "Information architecture",
      "Revenue impact",
    ],
  },
  "Credit application redesign": {
    recruiter: [
      "AI-assisted design & critique",
      "Information architecture",
      "Form design",
      "Conditional logic design",
      "Usability testing",
      "Design systems",
      "Automotive",
      "Completion rate improvement",
      "Executive presentation",
    ],
  },
  "Cazador del Oso: multimedia web design": {
    recruiter: [
      "AI-assisted design & critique",
      "Visual storytelling",
      "Content strategy",
      "Brand identity",
      "Information architecture",
      "Front-end development",
      "Ecommerce",
      "Client management",
      "End-to-end delivery",
    ],
    designer: [
      "AI-assisted design & critique",
      "Visual storytelling",
      "Brand identity",
      "Content strategy",
      "Client management",
      "Front-end development",
      "CMS constraints",
      "End-to-end delivery",
      "Sole ownership",
    ],
  },
  "SRP tile redesign": {
    designer: [
      "AI-assisted design & critique",
      "Component design",
      "Information hierarchy",
      "A/B testing",
      "Responsive design",
      "Usability testing",
      "Heuristic evaluation",
      "Design systems",
      "Analytics",
    ],
  },
};

// Master vocabulary of every skill/tool/domain the fit section can surface.
// `weight` drives the match %. `aliases` are fuzzy-match hooks so typing
// "IA" or "React" lands on the canonical tag. Aliases are intentionally broad
// (synonyms, tools, acronyms, common recruiter terms) so more queries surface
// the right pill. Every tag referenced in CASE_STUDY_TAGS is guaranteed to
// appear here.
type SkillEntry = { name: string; weight: number; aliases?: string[] };

const SKILL_VOCAB: SkillEntry[] = [
  // Tier 1 — core strengths (1.0)
  {
    name: "Information architecture",
    weight: 1.0,
    aliases: [
      "IA",
      "site architecture",
      "info architecture",
      "navigation",
      "nav",
      "sitemap",
      "content modeling",
      "taxonomies",
    ],
  },
  {
    name: "Design systems",
    weight: 1.0,
    aliases: [
      "DS",
      "design system",
      "component libraries",
      "component library",
      "pattern library",
    ],
  },
  {
    name: "User research",
    weight: 1.0,
    aliases: [
      "UXR",
      "discovery research",
      "research",
      "qualitative research",
      "user insights",
      "ethnography",
    ],
  },
  {
    name: "Usability testing",
    weight: 1.0,
    aliases: ["user testing", "UT", "moderated testing", "unmoderated testing", "usability", "ur"],
  },
  {
    name: "Prototyping",
    weight: 1.0,
    aliases: [
      "prototypes",
      "hi-fi prototyping",
      "hi-fi",
      "interactive prototype",
      "clickable prototype",
      "Figma prototype",
    ],
  },
  {
    name: "UX & product design",
    weight: 1.0,
    aliases: [
      "UX",
      "product design",
      "ux design",
      "user experience",
      "experience design",
      "HCD",
      "UCD",
      "human centered design",
      "digital product",
      "end-to-end design",
    ],
  },
  {
    name: "UI & visual design",
    weight: 1.0,
    aliases: [
      "UI",
      "visual design",
      "user interface",
      "interface design",
      "screen design",
    ],
  },
  { name: "Brand identity", weight: 1.0, aliases: ["brand", "branding", "verbal identity", "visual identity"] },
  { name: "Visual storytelling", weight: 1.0, aliases: ["storytelling", "narrative", "story frames"] },
  { name: "Content strategy", weight: 1.0, aliases: ["copywriting", "content", "messaging", "editorial"] },
  {
    name: "Content design & UX writing",
    weight: 0.6,
    aliases: [
      "content design",
      "UX writing",
      "ux writing",
      "microcopy",
      "in-product copy",
      "product copy",
      "UX content",
    ],
  },

  // Tier 2 — solid (0.9)
  { name: "Product strategy", weight: 0.9, aliases: ["strategy", "strategic", "positioning", "GTM", "go-to-market"] },
  { name: "Systems thinking", weight: 0.9, aliases: ["systems", "holistic", "big-picture", "end-to-end thinking", "ecosystem"] },
  {
    name: "Design tokens",
    weight: 0.9,
    aliases: ["tokens", "design token", "token systems", "semantic tokens", "token naming"],
  },
  {
    name: "Platform thinking",
    weight: 0.9,
    aliases: [
      "platform design",
      "platform UX",
      "platform strategy",
      "multi-product",
      "platform ecosystems",
    ],
  },
  {
    name: "Stakeholder alignment",
    weight: 0.9,
    aliases: [
      "stakeholder management",
      "stakeholder mgmt",
      "stakeholders",
      "stakeholder comms",
      "pm alignment",
      "engineering alignment",
    ],
  },
  {
    name: "Workshop facilitation",
    weight: 0.9,
    aliases: ["workshops", "facilitation", "co-creation", "design workshop", "alignment workshop"],
  },
  { name: "Accessibility", weight: 0.9, aliases: ["a11y", "ADA", "WCAG", "508", "inclusive design"] },
  { name: "Form design", weight: 0.9, aliases: ["forms", "inputs", "form UX", "form patterns", "application form"] },
  { name: "Conditional logic design", weight: 0.9, aliases: ["conditional logic", "branching", "if-then", "form logic", "show hide logic"] },
  { name: "Client management", weight: 0.9, aliases: ["client comms", "client relationships", "account", "stakeholder clients"] },
  { name: "End-to-end delivery", weight: 0.9, aliases: ["e2e", "end to end", "shipping", "delivery", "launch"] },
  { name: "Executive presentation", weight: 0.9, aliases: ["exec pres", "leadership pres", "exec deck", "C-suite", "board deck", "presentations", "QBR", "narrative"] },
  { name: "KPI improvement", weight: 0.9, aliases: ["KPIs", "metrics", "KPI", "OKRs", "results", "targets", "analytics outcomes"] },
  { name: "Revenue impact", weight: 0.9, aliases: ["revenue", "P&L", "growth", "ROAS", "revenue design"] },
  {
    name: "Completion rate improvement",
    weight: 0.9,
    aliases: ["conversion", "completion rate"],
  },
  { name: "Figma", weight: 1.0, aliases: ["figma", "figma file", "component sets", "auto layout", "variants", "figma design"] },
  { name: "FigJam", weight: 0.95, aliases: ["figjam", "figma jam", "fig jam", "workshop board"] },

  // Senior UX craft & methodology
  {
    name: "Wireframing",
    weight: 1.0,
    aliases: ["wireframes", "lo-fi", "low-fidelity", "mid-fi", "mid-fidelity"],
  },
  {
    name: "Journey mapping",
    weight: 1.0,
    aliases: ["customer journey", "user journey", "journey maps"],
  },
  { name: "Design thinking", weight: 1.0, aliases: ["double diamond", "design process", "IDEO", "HCD", "diverge converge"] },
  {
    name: "User interviews",
    weight: 1.0,
    aliases: [
      "interviews",
      "generative research",
      "1:1 interviews",
      "customer interviews",
      "talk to users",
    ],
  },
  {
    name: "Heuristic evaluation",
    weight: 0.9,
    aliases: ["heuristics", "heuristic review", "cognitive load"],
  },
  {
    name: "Persona development",
    weight: 0.9,
    aliases: ["personas", "user personas", "proto-personas"],
  },
  {
    name: "Jobs to be done",
    weight: 0.9,
    aliases: ["JTBD", "jobs-to-be-done"],
  },
  {
    name: "Design sprints",
    weight: 0.9,
    aliases: ["sprints", "design sprint", "GV design sprint", "5-day sprint", "Google sprint"],
  },
  {
    name: "Service design",
    weight: 0.85,
    aliases: ["service blueprint", "service blueprints", "service blueprinting"],
  },
  {
    name: "Card sorting",
    weight: 0.85,
    aliases: ["tree tests", "tree testing", "card sorts"],
  },
  {
    name: "A/B testing",
    weight: 0.9,
    aliases: ["ab testing", "experimentation", "experiments", "split testing", "AB"],
  },
  {
    name: "Hypothesis-driven design",
    weight: 0.9,
    aliases: ["hypothesis", "HDD", "hypothesis testing"],
  },
  {
    name: "Analytics",
    weight: 0.85,
    aliases: [
      "product analytics",
      "Amplitude",
      "Mixpanel",
      "GA",
      "Google Analytics",
      "Pendo",
      "Heap",
    ],
  },

  // Senior UI / visual craft
  { name: "Typography", weight: 1.0, aliases: ["type", "fonts", "type systems"] },
  {
    name: "Layout & grid systems",
    weight: 1.0,
    aliases: ["grids", "grid systems", "layout"],
  },
  {
    name: "Responsive design",
    weight: 1.0,
    aliases: ["responsive", "mobile-first", "adaptive", "responsive web"],
  },
  {
    name: "Micro-interactions",
    weight: 1.0,
    aliases: ["microinteractions", "UI motion", "interaction design"],
  },
  {
    name: "Iconography",
    weight: 0.9,
    aliases: ["icons", "icon design"],
  },
  {
    name: "Art direction",
    weight: 0.9,
    aliases: ["art direction", "creative direction"],
  },
  {
    name: "Illustration",
    weight: 0.85,
    aliases: ["illustrations", "spot illustration"],
  },
  {
    name: "Dark mode & theming",
    weight: 0.85,
    aliases: ["dark mode", "theming", "themes", "color tokens"],
  },
  {
    name: "Internationalization",
    weight: 0.7,
    aliases: ["i18n", "localization", "L10n"],
  },

  // Senior product
  {
    name: "Product roadmapping",
    weight: 0.6,
    aliases: ["roadmap", "product roadmap", "roadmapping", "roadmaps"],
  },
  {
    name: "Product documentation",
    weight: 0.9,
    aliases: [
      "design documentation",
      "spec documentation",
      "product docs",
      "design docs",
      "documentation",
      "specs docs",
    ],
  },
  {
    name: "OKRs",
    weight: 0.9,
    aliases: ["okrs", "objectives and key results", "objectives"],
  },
  {
    name: "Feature prioritization",
    weight: 0.9,
    aliases: ["prioritization", "RICE", "ICE"],
  },
  {
    name: "Cross-functional collaboration",
    weight: 1.0,
    aliases: [
      "collaboration",
      "collab",
      "teamwork",
      "cross-functional",
      "cross functional",
      "xfn",
      "cross-team",
    ],
  },
  {
    name: "Design-to-dev handoff",
    weight: 0.95,
    aliases: [
      "handoff",
      "dev handoff",
      "developer handoff",
      "design specs",
      "specs",
      "engineering handoff",
      "redlines",
      "annotations",
      "inspect",
      "Zeplin",
    ],
  },

  // Senior leadership
  {
    name: "Design critique",
    weight: 0.9,
    aliases: ["critique", "crits", "design crits"],
  },
  {
    name: "Mentorship",
    weight: 0.9,
    aliases: [
      "mentoring",
      "coaching",
      "leadership",
      "IC leadership",
      "org design",
      "team leadership",
      "design leadership",
      "people management",
      "manager",
      "director",
      "1:1s",
    ],
  },
  {
    name: "Hiring & interviewing",
    weight: 0.85,
    aliases: [
      "hiring",
      "design hiring",
      "design interviews",
      "interviewing",
      "portfolio review",
      "onsite",
      "loop",
    ],
  },

  // Tool belt (weights lean on how often Chaela reaches for each)
  {
    name: "Adobe Creative Suite",
    weight: 0.85,
    aliases: [
      "Photoshop",
      "Illustrator",
      "Adobe",
      "Creative Cloud",
      "After Effects",
      "AE",
      "InDesign",
    ],
  },
  { name: "Sketch", weight: 0.6, aliases: ["sketch app"] },
  { name: "Notion", weight: 0.9, aliases: ["notion docs"] },
  {
    name: "Whiteboarding tools",
    weight: 0.85,
    aliases: ["Miro", "Mural", "FigJam boards", "whiteboarding", "whiteboard"],
  },
  {
    name: "Prototyping tools",
    weight: 0.75,
    aliases: ["Framer", "Protopie", "Principle", "ProtoPie"],
  },
  { name: "Lottie", weight: 0.7, aliases: ["lottie animation"] },
  { name: "Storybook", weight: 0.75, aliases: ["storybookjs"] },
  {
    name: "Research tools",
    weight: 0.8,
    aliases: [
      "Dovetail",
      "UserTesting",
      "Maze",
      "Lookback",
      "Condens",
      "UserZoom",
    ],
  },
  {
    name: "AI-assisted design & critique",
    weight: 0.85,
    aliases: [
      "AI",
      "artificial intelligence",
      "gen AI",
      "genai",
      "GenAI",
      "generative AI",
      "LLM",
      "LLMs",
      "ChatGPT",
      "Claude",
      "Copilot",
      "Cursor",
      "prompting",
      "prompt engineering",
      "AI tools",
      "AI prototyping",
      "AI research",
      "machine learning",
    ],
  },
  {
    name: "Human-AI interaction",
    weight: 0.8,
    aliases: [
      "human AI interaction",
      "human-AI interaction",
      "human AI",
      "HAI",
      "human-in-the-loop",
      "human in the loop",
    ],
  },
  {
    name: "AI UX",
    weight: 0.8,
    aliases: [
      "AI product UX",
      "AI/UX",
      "generative UX",
      "AI experience design",
      "machine learning UX",
    ],
  },
  {
    name: "Conversation design & UX",
    weight: 0.8,
    aliases: [
      "conversation design",
      "conversational UX",
      "chat UX",
      "voice UX",
      "dialogue design",
      "assistant UX",
    ],
  },

  // Tier 3 — familiar / adjacent (0.8)
  {
    name: "Front-end development",
    weight: 0.8,
    aliases: [
      "front-end",
      "frontend",
      "FE",
      "React",
      "HTML/CSS",
      "HTML",
      "CSS",
      "JavaScript",
      "JS",
    ],
  },
  {
    name: "Technical UX",
    weight: 0.7,
    aliases: [
      "technical product design",
      "engineering-adjacent UX",
      "implementation-aware design",
      "systems-aware UX",
      "deep technical UX",
    ],
  },
  {
    name: "Ecommerce",
    weight: 0.8,
    aliases: ["e-commerce", "shopify", "commerce", "checkout", "cart", "PDP", "PLP", "D2C", "B2B ecommerce"],
  },
  { name: "Style guide creation", weight: 0.8, aliases: ["style guide"] },
  { name: "Omnichannel", weight: 0.8, aliases: ["omni", "omni channel", "multichannel", "cross-channel", "BOPIS"] },
  { name: "OEM compliance", weight: 0.8, aliases: ["OEM"] },
  {
    name: "CMS constraints",
    weight: 0.8,
    aliases: ["CMS", "Webflow", "WordPress", "Contentful"],
  },
  { name: "Sole ownership", weight: 0.8, aliases: ["solo delivery", "solo"] },
  { name: "Automotive", weight: 0.8, aliases: ["auto", "car", "dealership", "OEM", "vehicles", "powersports", "automotive"] },

  // SRP-tile specific
  {
    name: "Component design",
    weight: 1.0,
    aliases: ["components", "component library design", "component systems"],
  },
  {
    name: "Information hierarchy",
    weight: 1.0,
    aliases: ["content hierarchy", "visual hierarchy"],
  },

  // Tier 4 — growing / tool adjacency (0.6–0.7)
  { name: "Design ops", weight: 0.7, aliases: ["designops", "DesignOps", "ops", "workflows", "intake", "triage", "governance", "rituals"] },
  {
    name: "Motion design",
    weight: 0.6,
    aliases: ["animation", "framer motion", "motion"],
  },
  { name: "Data viz", weight: 0.6, aliases: ["data visualization", "charts", "dashboards", "graph", "data storytelling"] },

  // Enterprise / B2B SaaS — dense workflows & governance (0.7)
  {
    name: "Enterprise & B2B SaaS UX",
    weight: 0.7,
    aliases: [
      "enterprise UX",
      "B2B",
      "SaaS",
      "B2B SaaS",
      "enterprise software",
      "business software",
      "B2B product",
    ],
  },
  {
    name: "Complex workflow design",
    weight: 0.7,
    aliases: [
      "complex workflows",
      "multi-step workflows",
      "multi-step flows",
      "workflow design",
      "linear workflows",
      "branching workflows",
    ],
  },
  {
    name: "Admin & dense UI UX",
    weight: 0.7,
    aliases: [
      "dense admin UIs",
      "admin UX",
      "data-dense UI",
      "internal tools UX",
      "power-user UX",
      "operations UX",
    ],
  },
  {
    name: "Permissions & audit UX",
    weight: 0.7,
    aliases: [
      "permissions UX",
      "roles and permissions",
      "audit trails",
      "governance UX",
      "compliance workflows",
      "access control UX",
    ],
  },
];

// Case studies appear in the order they render on the page — use that order
// as the stable source when building the default tag list so the pills read
// left-to-right as you scroll down.
function defaultTagsForLens(lens: Lens): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const title of Object.keys(CASE_STUDY_TAGS)) {
    const tags = CASE_STUDY_TAGS[title][lens];
    if (!tags) continue;
    for (const tag of tags) {
      if (seen.has(tag)) continue;
      seen.add(tag);
      out.push(tag);
    }
  }
  const fitAnchor = "AI-assisted design & critique";
  return [fitAnchor].concat(out.filter((t) => t !== fitAnchor));
}

function weightOf(name: string): number {
  return SKILL_VOCAB.find((s) => s.name === name)?.weight ?? 0;
}

// Simple dependency-free fuzzy lookup. Ranks by match quality over both the
// canonical name and any aliases: exact > startsWith > substring. Returns
// canonical entries, deduped, in rank order.
function findSkill(query: string): SkillEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored: Array<{ entry: SkillEntry; score: number }> = [];
  for (const entry of SKILL_VOCAB) {
    const candidates = [entry.name, ...(entry.aliases ?? [])].map((s) =>
      s.toLowerCase(),
    );
    let best = 0;
    for (const c of candidates) {
      if (c === q) best = Math.max(best, 3);
      else if (c.startsWith(q)) best = Math.max(best, 2);
      else if (c.includes(q)) best = Math.max(best, 1);
    }
    if (best > 0) scored.push({ entry, score: best });
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .map((s) => s.entry);
}

// Case-study cards use shorter copy than SKILL_VOCAB names — map to canonical
// labels so intersection with fit `selected` (always canonical) works.
const PROJECT_PILL_NORMALIZATION: Record<string, string> = {
  "ai-assisted design": "AI-assisted design & critique",
  "ux design": "UX & product design",
  "ui design": "UI & visual design",
  "visual design": "UI & visual design",
  research: "User research",
  "stakeholder mgmt": "Stakeholder alignment",
  brand: "Brand identity",
  "front-end collab": "Front-end development",
  qa: "Design ops",
  photography: "Illustration",
  merchandising: "Ecommerce",
};

function normalizeProjectPillToCanonical(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const lower = t.toLowerCase();
  const mapped = PROJECT_PILL_NORMALIZATION[lower];
  if (mapped) return mapped;
  for (const entry of SKILL_VOCAB) {
    if (entry.name.toLowerCase() === lower) return entry.name;
    for (const a of entry.aliases ?? []) {
      if (a.toLowerCase() === lower) return entry.name;
    }
  }
  return null;
}

/** Intersects fit selection with a project’s pills; order follows selection order. */
function matchedSkillsForProject(
  selected: Set<string>,
  skills: string[],
  moreSkills: string[],
): string[] {
  if (selected.size === 0) return [];
  const proj = new Set<string>();
  for (const raw of [...skills, ...moreSkills]) {
    const c = normalizeProjectPillToCanonical(raw);
    if (c) proj.add(c);
  }
  const out: string[] = [];
  selected.forEach((s) => {
    if (proj.has(s)) out.push(s);
  });
  return out;
}

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
      "AI-assisted design",
      "UX design",
      "Research",
      "IA",
      "Design systems",
      "Stakeholder mgmt",
    ],
    moreSkills: [
      "Visual design",
      "Prototyping",
      "Front-end collab",
      "Content strategy",
      "Usability testing",
      "Accessibility",
      "Brand",
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
      "UX design",
      "Research",
      "Prototyping",
      "Design systems",
      "Accessibility",
    ],
    moreSkills: [
      "UI design",
      "Product strategy",
      "Stakeholder mgmt",
      "Usability testing",
      "IA",
      "Design ops",
      "Content strategy",
      "QA",
      "Analytics",
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
    subtitle: "Multi-revenue streams unified | End-to-end solo delivery",
    skills: [
      "AI-assisted design",
      "Visual design",
      "Brand",
      "Prototyping",
      "Front-end collab",
      "Content strategy",
    ],
    moreSkills: [
      "UX design",
      "Research",
      "IA",
      "Design systems",
      "Accessibility",
      "Copywriting",
      "Stakeholder mgmt",
      "Usability testing",
      "Photography",
      "Merchandising",
    ],
    challenge:
      "An independent creator with several revenue streams — a podcast, a newsletter, consulting, and a small merch shop — had no single place to send people. Each platform had its own logic and its own audience, and their existing “link in bio” page was a dead end.",
    approach:
      "I treated the site as a product, not a landing page. Mapped every audience path, prioritized the revenue streams against expected traffic, and built an information architecture that respected the creator’s personality without sacrificing clarity. Every choice was made to ladder up to a single goal: make it easy to move from curiosity to action.",
    solution:
      "A modular, multimedia-rich site that unified every channel behind a single brand — built end-to-end solo, from discovery through launch. The shop, podcast, and newsletter live together as equal citizens, and the design scales as new offers get added.",
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
  images: { hero: string; before: string; after: string };
};

const DESIGNER_PROJECTS: DesignerProject[] = [
  {
    title: "Cazador del Oso: multimedia web design",
    subtitle:
      "UX Designer & Developer · Arts & Culture Ecommerce · 2025–2026",
    skills: [
      "AI-assisted design",
      "Visual storytelling",
      "Brand identity",
      "Content strategy",
      "Client management",
      "CMS constraints",
    ],
    moreSkills: [
      "Front-end development",
      "End-to-end delivery",
      "Sole ownership",
      "Information architecture",
      "Typography",
      "Art direction",
      "Layout & grid systems",
      "Responsive design",
      "Micro-interactions",
      "Ecommerce",
    ],
    challenge:
      "ZFunk Productions poured a decade of work in Cazador Del Oso—a story of Montana’s history shown through original compositions and visual art—but the website did not stack up due to a lack of branding, paragraphs of content, and overall readability issues. We needed to tell the story clearly enough to sell gala tickets, products, and to get donations all while keeping the artist’s vision and passion at the heart. A blank canvas sounds like freedom. In practice it’s the hardest brief to execute.",
    solution:
      "A storytelling-driven ecommerce site that weaves art, music, and narrative into a single cohesive website experience. Delivered end-to-end as sole designer and developer, helping generate $10K of revenue.",
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
      "AI-assisted design",
      "Systems thinking",
      "Information architecture",
      "OEM compliance",
      "Style guide creation",
      "Brand identity",
    ],
    moreSkills: [
      "Workshop facilitation",
      "Omnichannel",
      "Stakeholder alignment",
      "User research",
      "Card sorting",
      "Design systems",
      "Content strategy",
      "Responsive design",
      "Cross-functional collaboration",
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
      "AI-assisted design",
      "Component design",
      "Information hierarchy",
      "A/B testing",
      "Responsive design",
      "Usability testing",
    ],
    moreSkills: [
      "Heuristic evaluation",
      "Design systems",
      "Analytics",
      "Hypothesis-driven design",
      "Cross-functional collaboration",
      "Design-to-dev handoff",
      "Automotive",
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
        illustration: publicPath("/projects/designer/srp-rampup.svg"),
      },
      {
        title: "A push forward",
        body: "A/B testing showed the new SRP outperformed the old across 90% of KPIs, but a drop in “Ask about this car” interactions paused rollout. We found the CTA on the car tile had been used as a workaround for missing location info. Once we solved that, the need disappeared. What looked like a loss proved the design worked — enabling full launch.",
        illustration: publicPath("/projects/designer/srp-pushforward.svg"),
      },
    ],
    images: {
      hero: publicPath("/projects/srp-hero.png"),
      before: publicPath("/projects/srp-before.png"),
      after: publicPath("/projects/srp-after.png"),
    },
  },
];

const EASE_OUT_CUBIC = [0.22, 1, 0.36, 1] as const;
const CURTAIN_EASE = [0.65, 0.05, 0.3, 1] as const;

// The ink curtain starts fully covering the area below the hero (top edge
// flush with the hero's 4px bottom border), holds briefly, then slides
// straight down off the viewport revealing the variant behind it.
const CURTAIN_HOLD_MS = 120;
const CURTAIN_SWEEP_MS = 720;
const CURTAIN_TOTAL_MS = CURTAIN_HOLD_MS + CURTAIN_SWEEP_MS;

type Phase = "idle" | "animating";

// ───────────────────────────────────────────────────────────────────────────
// Home
// ───────────────────────────────────────────────────────────────────────────

export default function Home() {
  const [lens, setLens] = useState<Lens | null>(null);
  /** Shared across fit band + case-study pills (recruiter/designer only). */
  const [fitSkillSelection, setFitSkillSelection] = useState<Set<string>>(
    () => new Set(),
  );
  // The view we're transitioning away from — used to render the sliding
  // "drawer" on top of the new view during the wipe.
  const [prevLens, setPrevLens] = useState<Lens | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const prefersReducedMotion = usePrefersReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  // Viewport Y (px) for the top of the fixed curtain drawer, captured at
  // the moment the user picks a lens. First pick from the landing page may
  // be mid-scroll; switching lenses scrolls to top first so this matches
  // the hero bottom at y=0.
  const [drawerTopPx, setDrawerTopPx] = useState<number | null>(null);

  // Lock scroll only while the wipe is in flight so nothing jumps under the
  // user mid-transition.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = phase !== "idle" ? "hidden" : "";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  function requestLens(next: Lens) {
    if (phase !== "idle" || next === lens) return;

    // First pick from the landing (Who are you?): keep scroll so the
    // curtain lines up with the hero where the user is. When already in a
    // lens and switching via the pill, go to the top so the transition
    // always reads from a consistent place.
    const switchingFromAnotherLens = lens !== null;
    if (switchingFromAnotherLens) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }

    if (prefersReducedMotion) {
      setLens(next);
      return;
    }

    // Anchor the curtain to the hero's on-screen bottom edge (viewport
    // coords) — after optional scrollTo(0) when switching lenses.
    const el = heroRef.current;
    const y = el
      ? el.getBoundingClientRect().bottom - 2
      : 0;
    setDrawerTopPx(y);

    // Swap the live view to the new lens up front. A snapshot of the old
    // view is held in the drawer above, which then slides down and off to
    // reveal the new view. The 2px line rides the top edge of the drawer.
    setPrevLens(lens);
    setLens(next);
    setPhase("animating");
    window.setTimeout(() => {
      setPhase("idle");
      setPrevLens(null);
      setDrawerTopPx(null);
    }, CURTAIN_TOTAL_MS + 40);
  }

  const locked = phase !== "idle";

  return (
    <main className="relative min-h-screen bg-hwite text-ink selection:bg-ink selection:text-hwite">
      <Hero
        ref={heroRef}
        hideBottomBorder={lens !== null}
      />

      {/* Fixed pill: render after Hero so tab order matches top-to-bottom layout. */}
      {lens !== null && (
        <LensPill current={lens} onPick={requestLens} disabled={locked} />
      )}

      <LensView
        lens={lens}
        onPick={requestLens}
        disabled={locked}
        fitSkillSelection={fitSkillSelection}
        setFitSkillSelection={setFitSkillSelection}
      />

      {/* Sliding drawer — a snapshot of the old view capped by a 2px ink
          line, translating straight down to reveal the new view beneath.
          The drawer's top sits exactly where the hero's (now-hidden)
          bottom border used to live so the single line reads as
          continuous, not stacked or split. */}
      <AnimatePresence>
        {phase === "animating" && drawerTopPx !== null && (
          <motion.div
            key="drawer"
            aria-hidden
            className="pointer-events-none fixed inset-x-0 bottom-0 z-[55] overflow-hidden bg-hwite border-t-2 border-ink"
            style={{ top: drawerTopPx }}
            initial={{ y: 0 }}
            animate={{ y: "calc(100% + 2px)" }}
            transition={{
              duration: CURTAIN_SWEEP_MS / 1000,
              delay: CURTAIN_HOLD_MS / 1000,
              ease: CURTAIN_EASE,
            }}
          >
            <div className="pointer-events-none">
              <LensView
                lens={prevLens}
                onPick={() => {}}
                disabled
                fitSkillSelection={fitSkillSelection}
                setFitSkillSelection={setFitSkillSelection}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// LensView — renders whatever lens is active (or the card picker if null)
// ───────────────────────────────────────────────────────────────────────────

function LensView({
  lens,
  onPick,
  disabled,
  fitSkillSelection,
  setFitSkillSelection,
}: {
  lens: Lens | null;
  onPick: (lens: Lens) => void;
  disabled: boolean;
  fitSkillSelection: Set<string>;
  setFitSkillSelection: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  if (lens === null) {
    return <WhoAreYouSection onPick={onPick} disabled={disabled} />;
  }
  if (lens === "recruiter")
    return (
      <RecruiterVariant
        fitSkillSelection={fitSkillSelection}
        setFitSkillSelection={setFitSkillSelection}
      />
    );
  if (lens === "designer")
    return (
      <DesignerVariant
        fitSkillSelection={fitSkillSelection}
        setFitSkillSelection={setFitSkillSelection}
      />
    );
  if (lens === "jane") return <JaneVariant />;
  // All three lens types are handled above; TS narrows `lens` to never here.
  return null;
}

// ───────────────────────────────────────────────────────────────────────────
// Hero — always mounted. The 2px bottom border is only for the pre-lens
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
        hideBottomBorder ? "" : "border-b-[3px] border-ink md:border-b-2"
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
          <p className="text-[24px] leading-tight text-ink md:text-[36px]">
            I&rsquo;m Chaela Watkins a
          </p>
          <h1 className="mt-2 text-[64px] font-normal uppercase leading-[55px] text-ink md:mt-6 md:text-[96px] md:leading-[0.85]">
            UX &amp; Product Designer
          </h1>
          <p className="mt-2 max-w-full text-[18px] leading-normal text-ink md:mt-10 md:leading-snug md:text-[24px]">
            I design experiences that reduce friction and move metrics across
            ecommerce, fintech, and enterprise SaaS.
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
    <div className="mx-auto w-full max-w-[1280px] border-t-4 border-ink bg-hwite pb-12 pt-6 md:border-t-0 md:px-20 md:pb-28 md:pt-20">
      <h2 className="px-6 text-center text-[32px] font-bold leading-tight text-ink md:px-0 md:text-[48px]">
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
                className="box-border flex h-[304px] w-full flex-col justify-end border-[3px] border-ink p-5 pb-6 text-ink md:border-2"
                style={{ backgroundColor: meta.bg }}
              >
                <span
                  id={titleId}
                  className="block text-left text-[40px] font-bold leading-none"
                >
                  {meta.label}
                </span>
                <span
                  id={descId}
                  className="mt-3 block text-left text-[16px] leading-snug"
                >
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
                  ? "h-2.5 w-2.5 rounded-full border-2 border-ink bg-ink p-0 outline-none transition-transform focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-hwite active:scale-90 disabled:opacity-50"
                  : "h-2.5 w-2.5 rounded-full border-2 border-ink bg-hwite p-0 outline-none transition-transform focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-hwite active:scale-90 disabled:opacity-50"
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
        className="flex items-center gap-2 rounded-full border-2 border-ink bg-hwite px-4 py-2 text-[14px] font-bold shadow-[3px_3px_0_0_#0f0000] outline-none transition-colors hover:bg-ink hover:text-hwite focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-hwite disabled:cursor-not-allowed disabled:opacity-60 md:text-[16px]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={meta.character.src}
          alt=""
          aria-hidden
          className="h-7 w-auto"
          draggable={false}
        />
        <span>{meta.label}</span>
        <motion.span
          aria-hidden
          className="ml-1 text-[14px]"
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
            className="absolute right-0 mt-3 min-w-[240px] origin-top-right overflow-hidden rounded-3xl border-2 border-ink bg-hwite shadow-[4px_4px_0_0_#0f0000]"
          >
            <div
              id={switchHeadingId}
              className="border-b-2 border-ink/30 px-4 py-2 text-[12px] font-bold uppercase tracking-wide text-ink/60"
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
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-[15px] font-semibold outline-none transition-colors hover:bg-ink hover:text-hwite focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink"
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

// Per-lens accent tokens used by the case-study and contact sections. The
// recruiter lens leans on the original pink palette; the designer lens
// swaps every pink surface for its tear/coldday blue equivalent.
type Accent = {
  pill: string;
  divider: string;
  buttonHoverBorder: string;
  buttonHoverBg: string;
  buttonHoverShadow: string;
};

const ACCENTS: Record<Lens, Accent> = {
  recruiter: {
    pill: "bg-millennial",
    divider: "bg-salmon",
    buttonHoverBorder: "hover:border-salmon",
    buttonHoverBg: "hover:bg-salmon",
    buttonHoverShadow: "hover:shadow-[inset_0_0_0_1px_theme(colors.salmon)]",
  },
  designer: {
    pill: "bg-tear",
    divider: "bg-coldday",
    buttonHoverBorder: "hover:border-coldday",
    buttonHoverBg: "hover:bg-coldday",
    buttonHoverShadow: "hover:shadow-[inset_0_0_0_1px_theme(colors.coldday)]",
  },
  jane: {
    pill: "bg-sunnies",
    divider: "bg-goldenhour",
    buttonHoverBorder: "hover:border-goldenhour",
    buttonHoverBg: "hover:bg-goldenhour",
    buttonHoverShadow: "hover:shadow-[inset_0_0_0_1px_theme(colors.goldenhour)]",
  },
};

function RecruiterVariant({
  fitSkillSelection,
  setFitSkillSelection,
}: {
  fitSkillSelection: Set<string>;
  setFitSkillSelection: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  return (
    <div>
      <FitSection
        lens="recruiter"
        selected={fitSkillSelection}
        setSelected={setFitSkillSelection}
      />

      {/* Case studies — espresso break after the 2nd portfolio block */}
      {PROJECTS.map((project, index) => (
        <React.Fragment key={project.title}>
          <ProjectSection
            project={project}
            fitSkillSelection={fitSkillSelection}
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
// Mirrors the recruiter structure (fit section → case studies → let's chat)
// but with designer-specific data, a `tear`-tinted "Am I the right fit?"
// band (wired via LENSES.designer.fitBg), and a per-case-study "Design &
// build" three-column section that only the designer lens surfaces.
// ───────────────────────────────────────────────────────────────────────────

function DesignerVariant({
  fitSkillSelection,
  setFitSkillSelection,
}: {
  fitSkillSelection: Set<string>;
  setFitSkillSelection: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  return (
    <div>
      <FitSection
        lens="designer"
        selected={fitSkillSelection}
        setSelected={setFitSkillSelection}
      />

      {DESIGNER_PROJECTS.map((project, index) => (
        <React.Fragment key={project.title}>
          <DesignerProjectSection
            project={project}
            fitSkillSelection={fitSkillSelection}
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
    <div>
      <div className="mx-auto max-w-[1280px] px-6 py-20 text-center md:px-20 md:py-28">
        <h2 className="text-[40px] font-bold md:text-[56px]">
          Let&rsquo;s chat IRL
        </h2>
        <p className="mx-auto mt-4 max-w-[520px] text-[18px] leading-snug md:text-[22px]">
          If you think I might be the right fit, I&rsquo;d love to hear from
          you.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-[23px]">
          <a
            href="mailto:designbeanies@gmail.com"
            className={`flex w-[199px] items-center justify-center border-2 border-ink bg-ink p-[10px] text-[20px] font-normal leading-none text-hwite outline-none transition-colors focus-visible:ring-2 focus-visible:ring-hwite focus-visible:ring-offset-2 focus-visible:ring-offset-ink ${accent.buttonHoverBorder} ${accent.buttonHoverBg} hover:text-ink`}
          >
            Email me
          </a>
          <a
            href="https://www.linkedin.com/in/chaelawatkins"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex w-[199px] items-center justify-center border-2 border-ink bg-transparent p-[10px] text-[20px] font-normal leading-none text-ink outline-none transition-[background-color,border-color,color,box-shadow] focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-hwite ${accent.buttonHoverBorder} ${accent.buttonHoverShadow}`}
          >
            Connect on LinkedIn
          </a>
        </div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={publicPath("/footer.svg")}
        alt=""
        aria-hidden
        className="block w-full select-none"
        draggable={false}
      />
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// FitSection — "Am I the right fit?" band. Lens-aware: default pills are the
// union of case-study tags for the active lens. Typing consults SKILL_VOCAB
// via findSkill so aliases ("IA", "React") also surface canonical pills.
// ───────────────────────────────────────────────────────────────────────────

const FIT_PILL_MAX = 7;

function FitSection({
  lens,
  selected,
  setSelected,
}: {
  lens: Exclude<Lens, "jane">;
  selected: Set<string>;
  setSelected: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  const [query, setQuery] = useState("");
  const [pillsExpanded, setPillsExpanded] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const pillExpandEase = EASE_OUT_CUBIC;
  const pillExpandDuration = prefersReducedMotion ? 0 : 0.2;

  const defaultTags = useMemo(() => defaultTagsForLens(lens), [lens]);

  // What pills to render. With no query we show the lens defaults plus any
  // user-selected tags outside that default set (so fuzzy-matched picks don't
  // vanish when the query clears). With a query we layer substring matches
  // over defaults first, then vocab fuzzy matches — deduped in that order.
  const visibleSkills = useMemo(() => {
    const base = defaultTags;
    const selectedArr: string[] = [];
    selected.forEach((s) => selectedArr.push(s));
    const extras = selectedArr.filter((s) => !base.includes(s));
    const q = query.trim().toLowerCase();

    if (!q) return [...extras, ...base];

    const inName = (s: string) => s.toLowerCase().includes(q);
    const extraMatches = extras.filter(inName);
    const baseMatches = base.filter(inName);
    const fuzzy = findSkill(query).map((e) => e.name);

    const out: string[] = [];
    const seen = new Set<string>();
    for (const s of [...extraMatches, ...baseMatches, ...fuzzy]) {
      if (seen.has(s)) continue;
      seen.add(s);
      out.push(s);
    }
    return out;
  }, [query, selected, defaultTags]);

  const hasMorePills = visibleSkills.length > FIT_PILL_MAX;
  const morePillCount = Math.max(0, visibleSkills.length - FIT_PILL_MAX);

  const skillsToShow = useMemo(() => {
    if (visibleSkills.length <= FIT_PILL_MAX || pillsExpanded) {
      return visibleSkills;
    }
    return visibleSkills.slice(0, FIT_PILL_MAX);
  }, [visibleSkills, pillsExpanded]);

  useEffect(() => {
    if (visibleSkills.length <= FIT_PILL_MAX) {
      setPillsExpanded(false);
    }
  }, [visibleSkills.length]);

  const matchPct = useMemo(() => {
    if (selected.size === 0) return 0;
    let sum = 0;
    selected.forEach((s) => {
      sum += weightOf(s);
    });
    return Math.round((sum / selected.size) * 100);
  }, [selected]);

  const matchCopy = useMemo(() => {
    if (selected.size === 0) return "";
    if (matchPct >= 95)
      return "Spot on — Chaela’s strongest in exactly these areas.";
    if (matchPct >= 85)
      return "Strong fit. A handful of areas are still growing, but the core is there.";
    if (matchPct >= 70)
      return "Most of what you need is there. A couple of gaps are worth a conversation.";
    return "Partial fit — some of these are growth areas rather than strengths.";
  }, [selected.size, matchPct]);

  // The banner in the Figma spec is a single consistent style (lighter pink on
  // pink, rounded, soft shadow). We only change the leading glyph to reflect
  // confidence — ✔ for strong matches, ! when it starts to slip.
  const matchIcon = matchPct >= 80 ? "✔️" : "⚠️";

  function toggleSkill(skill: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) next.delete(skill);
      else next.add(skill);
      return next;
    });
  }

  function clearSelection() {
    setSelected(() => new Set());
    setQuery("");
  }

  // Mobile designer fit band — Figma Homepage_Mobile (458:242641, tear #a9dac9)
  const isDesignerFit = lens === "designer";
  const skillPillBase = isDesignerFit
    ? "border-2 border-ink px-2.5 py-2.5 text-[20px] max-md:font-normal md:px-3 md:py-1.5 md:text-[14px] md:font-medium"
    : "border-2 border-ink px-3 py-1.5 text-[14px] font-medium";

  return (
    <section className={LENSES[lens].fitBg}>
      <div
        className={`mx-auto flex w-full max-w-[1280px] flex-col px-6 py-16 md:flex-row md:items-center md:px-20 md:py-24 ${
          isDesignerFit
            ? "max-md:gap-10 max-md:py-[60px] gap-10 md:gap-16"
            : "gap-12 md:gap-16"
        }`}
      >
        {/* LEFT: heading, subtitle, search, pills, clear — full width of band on mobile; px-6 = 24px side margin */}
        <div
          className={
            isDesignerFit
              ? "w-full min-w-0 flex-1 md:max-w-[620px]"
              : "w-full min-w-0 flex-1 md:max-w-[620px]"
          }
        >
          {isDesignerFit ? (
            <div className="max-md:flex max-md:flex-col max-md:gap-3.5 md:contents">
              <h2 className="text-[32px] font-bold leading-[1.05] md:text-[48px]">
                Am I the right fit?
              </h2>
              <p className="text-[24px] leading-snug max-md:mt-0 md:mt-3 md:text-[20px]">
                Select the skills below or type in something specific and see how
                Chaela stacks up.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-[36px] font-bold leading-[1.05] md:text-[48px]">
                Am I the right fit?
              </h2>
              <p className="mt-3 text-[18px] leading-snug md:text-[20px]">
                Select the skills below or type in something specific and see how
                Chaela stacks up.
              </p>
            </>
          )}

          <label
            className={
              isDesignerFit
                ? "mt-10 flex max-md:items-center max-md:gap-2.5 max-md:px-6 max-md:py-2.5 items-center gap-3 border-2 border-ink bg-hwite px-5 py-3 focus-within:shadow-[3px_3px_0_0_#0f0000] md:mt-8"
                : "mt-8 flex items-center gap-3 border-2 border-ink bg-hwite px-5 py-3 focus-within:shadow-[3px_3px_0_0_#0f0000]"
            }
            aria-label="Search skills"
          >
            <SearchIcon />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Does Chaela..."
              className={
                isDesignerFit
                  ? "flex-1 bg-transparent text-[20px] outline-none placeholder:text-ink/60 md:text-[18px]"
                  : "flex-1 bg-transparent text-[16px] outline-none placeholder:text-ink/60 md:text-[18px]"
              }
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="rounded-sm text-ink/50 outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-hwite"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </label>

          <div
            className="mt-8 flex flex-wrap content-start items-start gap-2"
            role="group"
            aria-label="Skills"
          >
            <AnimatePresence initial={false}>
              {skillsToShow.map((skill) => {
                const isOn = selected.has(skill);
                return (
                  <motion.button
                    key={skill}
                    type="button"
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{
                      duration: 0.15,
                      ease: EASE_OUT_CUBIC,
                    }}
                    onClick={() => toggleSkill(skill)}
                    aria-pressed={isOn}
                    className={`${skillPillBase} outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 ${
                      isOn
                        ? "bg-ink text-hwite focus-visible:ring-hwite focus-visible:ring-offset-ink"
                        : "bg-transparent text-ink hover:bg-ink hover:text-hwite focus-visible:ring-ink focus-visible:ring-offset-hwite"
                    }`}
                  >
                    {skill}
                  </motion.button>
                );
              })}
            </AnimatePresence>

            {hasMorePills && (
              <motion.button
                type="button"
                layout
                onClick={() => setPillsExpanded((e) => !e)}
                aria-expanded={pillsExpanded}
                aria-label={
                  pillsExpanded
                    ? "Show fewer skills"
                    : `Show ${morePillCount} additional skills`
                }
                className={`${skillPillBase} relative inline-flex shrink-0 items-center justify-center bg-transparent text-ink outline-none transition-colors hover:bg-ink hover:text-hwite focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-hwite`}
              >
                {/* Wider of "Show less" / "+N" — no inner padding (outer skillPillBase already pads) */}
                <span className="invisible block" aria-hidden>
                  <span className="inline-grid [grid-template-columns:minmax(0,max-content)] [grid-template-rows:1fr]">
                    <span className="col-start-1 row-start-1 whitespace-nowrap">
                      Show less
                    </span>
                    <span className="col-start-1 row-start-1 whitespace-nowrap">
                      {`+${morePillCount}`}
                    </span>
                  </span>
                </span>
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <AnimatePresence initial={false} mode="popLayout">
                    <motion.span
                      key={pillsExpanded ? "less" : "more"}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{
                        duration: pillExpandDuration,
                        ease: pillExpandEase,
                      }}
                      className="whitespace-nowrap"
                    >
                      {pillsExpanded
                        ? "Show less"
                        : `+${morePillCount}`}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </motion.button>
            )}

            {visibleSkills.length === 0 && (
              <p className="text-[14px] italic text-ink/70">
                Nothing quite like “{query}” in Chaela’s toolkit — try another
                term.
              </p>
            )}
          </div>

          {selected.size > 0 && (
            <button
              type="button"
              onClick={clearSelection}
              className="mt-5 rounded-sm text-[13px] font-semibold uppercase tracking-wide text-ink/60 underline-offset-4 outline-none hover:text-ink hover:underline focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-hwite"
            >
              Clear {selected.size} selected
            </button>
          )}
        </div>

        {/* RIGHT: match banner */}
        <div className="w-full min-w-0 md:flex-1">
          <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT_CUBIC }}
            className={
              isDesignerFit
                ? "mx-auto flex min-h-[260px] w-full max-w-full flex-col items-center justify-center rounded-lg bg-hwite/20 px-4 py-6 text-center text-ink shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] md:min-h-[310px] md:max-w-[495px] md:rounded-none md:px-12 md:py-12"
                : "mx-auto flex min-h-[260px] w-full max-w-full flex-col items-center justify-center bg-hwite/20 p-10 text-center text-ink shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] md:min-h-[310px] md:max-w-[495px] md:p-12"
            }
          >
            {selected.size === 0 ? (
              <p
                className={
                  isDesignerFit
                    ? "max-w-[320px] text-[24px] leading-[1.35] text-ink/85 md:text-[24px]"
                    : "max-w-[320px] text-[20px] leading-[1.35] text-ink/85 md:text-[24px]"
                }
              >
                Select skills to see how Chaela stacks up against what
                you&rsquo;re looking for.
              </p>
            ) : (
              <>
                <p
                  className={
                    isDesignerFit
                      ? "flex items-center justify-center gap-3 text-[32px] font-bold leading-none text-ink md:text-[48px]"
                      : "flex items-center justify-center gap-3 text-[36px] font-bold leading-none text-ink md:text-[48px]"
                  }
                >
                  <span aria-hidden>{matchIcon}</span>
                  <motion.span
                    key={matchPct}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: EASE_OUT_CUBIC }}
                  >
                    {matchPct}% Match
                  </motion.span>
                </p>
                <p
                  className={
                    isDesignerFit
                      ? "mt-4 max-w-[320px] text-[24px] leading-normal text-ink md:mt-4 md:text-[32px] md:leading-[1.15]"
                      : "mt-4 max-w-[320px] text-[22px] leading-[1.15] text-ink md:text-[32px]"
                  }
                >
                  {matchCopy}
                </p>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/** Case-study skill pills: intersection of fit selection with project tags (canonical). */
function CaseStudyFitPills({
  fitSkillSelection,
  skills,
  moreSkills,
  pillClassName,
  moreButtonClassName,
}: {
  fitSkillSelection: Set<string>;
  skills: string[];
  moreSkills: string[];
  pillClassName: string;
  moreButtonClassName: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const matched = useMemo(
    () => matchedSkillsForProject(fitSkillSelection, skills, moreSkills),
    [fitSkillSelection, skills, moreSkills],
  );

  const pillEase = [0.22, 1, 0.36, 1] as const;
  const pillDuration = prefersReducedMotion ? 0 : 0.28;
  const pillStagger = prefersReducedMotion ? 0 : 0.03;

  const head = matched.slice(0, FIT_PILL_MAX);
  const tail = matched.slice(FIT_PILL_MAX);
  const showExpandControl = tail.length > 0;

  useEffect(() => {
    if (matched.length <= FIT_PILL_MAX) setExpanded(false);
  }, [matched.length]);

  if (matched.length === 0) return null;

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

function ProjectSection({
  project,
  fitSkillSelection,
}: {
  project: Project;
  fitSkillSelection: Set<string>;
}) {
  return (
    <section>
      {/* Hero collage — full-bleed. Sources are 2560px-wide rasters baked from
          Figma SVG exports, so they stay crisp on Retina without upscaling. */}
      <figure className="w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.images.hero}
          alt={`${project.title} — screens overview`}
          className="block h-auto w-full select-none"
          draggable={false}
          loading="lazy"
        />
      </figure>

      <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-20 md:py-24">
        <h3 className="text-[40px] font-bold leading-none text-ink md:text-[64px]">
          {project.title}
        </h3>
        <p className="mt-2 text-[18px] font-normal leading-normal text-ink md:text-[24px]">
          {project.subtitle}
        </p>

        <CaseStudyFitPills
          fitSkillSelection={fitSkillSelection}
          skills={project.skills}
          moreSkills={project.moreSkills}
          pillClassName="bg-millennial p-2 text-[14px] font-normal leading-none text-ink"
          moreButtonClassName="relative overflow-hidden border border-ink p-2 text-[14px] font-normal leading-none text-ink transition-colors hover:bg-ink hover:text-hwite focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-hwite"
        />

        <div className="mt-12 space-y-14 md:mt-[76px] md:space-y-[110px]">
          <DetailRow label="The Challenge" body={project.challenge} />
          <DetailRow label="The Approach" body={project.approach} />
          <DetailRow label="The Solution" body={project.solution} />
        </div>
      </div>

      <div className="mt-16 w-full md:mt-[110px]">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-12">
          <figure className="flex min-w-0 w-full flex-col items-stretch">
            <figcaption className="mb-6 px-6 text-center text-[28px] font-normal leading-none text-ink md:px-20 md:text-[32px]">
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
          <figure className="flex min-w-0 w-full flex-col items-stretch">
            <figcaption className="mb-6 px-6 text-center text-[28px] font-normal leading-none text-ink md:px-20 md:text-[32px]">
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
  fitSkillSelection,
}: {
  project: DesignerProject;
  fitSkillSelection: Set<string>;
}) {
  const accent = ACCENTS.designer;

  return (
    <section>
      <figure className="w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.images.hero}
          alt={`${project.title} — screens overview`}
          className="block h-auto w-full select-none"
          draggable={false}
          loading="lazy"
        />
      </figure>

      <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-20 md:py-24">
        {/* Mobile case-study type — Figma 458:238149 */}
        <h3 className="text-[48px] font-bold leading-[56px] text-ink md:text-[64px] md:leading-none">
          {project.title}
        </h3>
        <p className="mt-2 text-[24px] font-normal leading-normal text-ink">
          {project.subtitle}
        </p>

        <CaseStudyFitPills
          fitSkillSelection={fitSkillSelection}
          skills={project.skills}
          moreSkills={project.moreSkills}
          pillClassName={`${accent.pill} p-2 text-[14px] font-normal leading-none text-ink`}
          moreButtonClassName="relative box-border overflow-hidden border border-ink p-2 text-[14px] font-normal leading-none text-ink transition-colors hover:bg-ink hover:text-hwite focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-hwite md:border-2"
        />

        <div className="mt-12 space-y-14 md:mt-[76px] md:space-y-[110px]">
          <DetailRow
            label="The Challenge"
            body={project.challenge}
            dividerClass={accent.divider}
          />
          <DetailRow
            label="The Solution"
            body={project.solution}
            dividerClass={accent.divider}
          />
        </div>
      </div>

      {/* Design & build — three-column grid of illustration + title + body.
          Wide container matches the Figma 1118px content width. */}
      <div className="mx-auto max-w-[1280px] px-6 pb-16 md:px-20 md:pb-24">
        <h4 className="text-[32px] font-bold leading-none text-ink md:text-[36px]">
          Design &amp; build
        </h4>
        <div className="mt-10 grid grid-cols-1 gap-10 md:mt-[76px] md:grid-cols-3 md:gap-[58px]">
          {project.designBuild.map((col) => (
            <div key={col.title} className="flex flex-col">
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
              <h5 className="mt-10 text-[24px] font-bold leading-none text-ink md:text-[28px]">
                {col.title}
              </h5>
              <p className="mt-4 text-[16px] font-normal leading-[1.6] text-ink md:text-[18px]">
                {col.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full pb-16 md:pb-24">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-12">
          <figure className="flex min-w-0 w-full flex-col items-stretch">
            <figcaption className="mb-6 px-6 text-center text-[28px] font-normal leading-none text-ink md:px-20 md:text-[32px]">
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
          <figure className="flex min-w-0 w-full flex-col items-stretch">
            <figcaption className="mb-6 px-6 text-center text-[28px] font-normal leading-none text-ink md:px-20 md:text-[32px]">
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
      src: publicPath("/projects/srp-hero.png"),
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

function JaneVariant() {
  return (
    <div>
      <WhatIDoSection />
      <ApproachSection />
      <ContactFooter lens="jane" />
    </div>
  );
}

function WhatIDoSection() {
  // Figma: desktop — label + short sunnies divider (JaneRow). Mobile (465:25440)
  // — 48/56 "What I do", 32px row titles, full-width 1px ink dividers, 16px/1.76
  // body, tools in 2×2 at 120px + 24px gap.
  return (
    <section className="bg-[#F3F3F3]">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-[60px] px-6 py-[60px] md:gap-[63px] md:px-20 md:py-20">
        <h2 className="text-[48px] font-normal leading-[56px] text-ink md:leading-[1.1]">
          What I do
        </h2>

        <div className="flex flex-col gap-[60px] md:gap-[110px]">
          {/* My experience */}
          <JaneRow label="My experience">
            <div className="space-y-5 text-[16px] font-normal leading-[1.76] text-ink">
              {JANE_EXPERIENCE.map((job) => (
                <p key={`${job.company}-${job.title}`}>
                  {job.title}, {job.company}
                  <br />
                  {job.dates}
                </p>
              ))}
            </div>
          </JaneRow>

          {/* Tools I use: 2×2 @ 120 + 24 gap (mobile, Figma 465:33605); 4 col @ 36px gap desktop */}
          <JaneRow label="Tools I use">
            <div className="grid grid-cols-2 content-start gap-6 text-[16px] font-normal leading-[1.76] text-ink md:grid-cols-4 md:gap-x-9 md:gap-y-6">
              {JANE_TOOLS.map((col, i) => (
                <ul key={i} className="w-[120px] md:w-auto">
                  {col.map((tool) => (
                    <li key={tool}>{tool}</li>
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
    <section className="bg-ink px-6 py-16 md:py-[120px] md:pb-[121px]">
      <div className="mx-auto flex w-full max-w-[828px] flex-col items-center gap-20 md:gap-[234px]">
        <div className="flex w-full max-w-[764px] flex-col items-center gap-3">
          <h2 className="text-center text-[28px] font-bold leading-[1.1] text-hwite md:text-[48px]">
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
        <div className="flex w-full flex-col items-center gap-10 md:gap-[62px]">
          <h2 className="w-full text-center text-[28px] font-bold leading-[1.1] text-hwite md:text-[48px]">
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
            <p className="mt-2 text-center text-[11px] leading-snug text-hwite/50">
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
      <h3 className="text-[32px] font-normal leading-[normal] text-ink max-md:leading-[normal] md:leading-[1.15]">
        {label}
      </h3>
      <div
        className="h-px w-full max-md:bg-ink md:hidden"
        aria-hidden
      />
      {/* Middle column holds the short divider — centered vertically on
          the label's cap height via a hair of top margin. */}
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
    <section>
      <div className="mx-auto max-w-[1280px] bg-[#F3F3F3] px-6 py-[60px] md:bg-hwite md:px-20 md:py-16">
        <h2 className="text-[48px] font-normal leading-[56px] text-ink md:leading-[1.1]">
          My approach to the craft
        </h2>
      </div>

      {JANE_PRINCIPLES.map((principle, i) => {
        const reversed = i % 2 === 1;
        // The icon panel alternates between goldenhour and sunnies row to
        // row — Figma does this so the glyph always sits on the opposite
        // of its own fill color (yellow bulb on orange, orange rocket on
        // yellow, etc.). The Flaticon SVGs already carry the correct
        // glyph color baked in.
        const iconPanelBg = reversed ? "bg-sunnies" : "bg-goldenhour";
        return (
          <React.Fragment key={principle.title}>
            {/* PrincipleRow is full viewport width on md+ so colored panels bleed edge-to-edge */}
            <PrincipleRow
              principle={principle}
              reversed={reversed}
              iconPanelBg={iconPanelBg}
            />
            {/* Full-bleed strip — outside max-width so raster spans viewport */}
            {/* The img's width/height attrs give the browser an implicit
                aspect-ratio so layout space is reserved before the PNG
                arrives (no CLS). h-auto lets the image derive its own
                height from that ratio + w-full parent — unlike h-full,
                which can fight aspect-ratio on the parent and produce a
                sub-viewport box. */}
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
          </React.Fragment>
        );
      })}
    </section>
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
  // Text panel sits on the page canvas (hwite) so only the icon panel is
  // a warm block — a single burst of color per row. `reversed` swaps
  // which side gets which; the Figma composition alternates
  // (text→icon, icon→text, text→icon, icon→text).
  const text = (
    <div
      className={[
        "flex min-h-[320px] items-center bg-hwite py-14 md:min-h-[598px]",
        // Match page gutters; inner copy stays max-w while column spans half the viewport
        reversed ? "px-6 md:pl-6 md:pr-20" : "px-6 md:pl-20 md:pr-6",
      ].join(" ")}
    >
      <div
        className={`flex w-full max-w-[549px] flex-col gap-6 md:gap-8 ${reversed ? "md:ml-auto" : ""}`}
      >
        <h3 className="text-[24px] font-normal leading-[1.15] text-ink md:text-[32px]">
          {principle.title}
        </h3>
        <p className="text-[18px] leading-[1.45] text-ink md:text-[24px]">
          {principle.body}
        </p>
      </div>
    </div>
  );
  const icon = (
    <div
      className={[
        "flex min-h-[320px] items-center justify-center py-14 md:min-h-[598px]",
        // Bleed colored panel to viewport edge; keep padding only on the gutter side
        reversed ? "md:pl-0 md:pr-6" : "md:pl-6 md:pr-0",
        iconPanelBg,
      ].join(" ")}
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
    </div>
  );

  // Mobile (e.g. 465:64353): stacked, #F3F3F3, 164px round icon, 32/24 type.
  const mobile = (
    <div className="w-full bg-[#F3F3F3] py-[60px] md:hidden">
      <div className="mx-auto max-w-[1280px] px-6">
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
      <div className="flex flex-col gap-8 pt-6">
        <h3 className="text-[32px] font-normal leading-[normal] text-ink">
          {principle.title}
        </h3>
        <p className="text-[24px] font-normal leading-[normal] text-ink">
          {principle.body}
        </p>
      </div>
      </div>
    </div>
  );

  return (
    <>
      {mobile}
      <div className="hidden w-full md:grid md:grid-cols-2">
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
    </>
  );
}

function DetailRow({
  label,
  body,
  dividerClass = "bg-salmon",
}: {
  label: string;
  body: string;
  dividerClass?: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[225px_303px_1fr] md:items-start md:gap-0">
      <h4 className="text-[24px] font-normal leading-none text-ink md:text-[32px]">
        {label}
      </h4>
      <div
        aria-hidden
        className={`mt-3 hidden h-[2px] w-full md:mt-[22px] md:block ${dividerClass}`}
      />
      <p className="text-[16px] font-normal leading-[1.76] text-ink md:ml-[41px] md:max-w-[530px]">
        {body}
      </p>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

