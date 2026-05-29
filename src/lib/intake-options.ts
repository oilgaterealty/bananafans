import type { BuildType, MainGoal } from '../types';

/**
 * Shared source of truth for the public intake form's structured
 * categories. Used by IntakeModal today and by any future analytics /
 * quote / project-tracking logic so the same value set is referenced
 * everywhere — no duplicate hard-coded option arrays.
 *
 * If you add a new option here, also add it to the matching union in
 * src/types.ts so the TypeScript checker keeps the two in sync.
 */

// ---------------------------------------------------------------------
// Build type
// ---------------------------------------------------------------------

export interface BuildTypeOption {
  value: BuildType;
  help: string;
}

export interface BuildTypeGroup {
  label: string;
  options: BuildTypeOption[];
}

export const BUILD_TYPE_GROUPS: BuildTypeGroup[] = [
  {
    label: 'Websites & Pages',
    options: [
      { value: 'Website', help: 'A full website for your business, brand, service, or idea.' },
      { value: 'Landing Page', help: 'A focused single page built to promote one offer, service, or campaign.' },
      { value: 'Booking / Lead Capture Page', help: 'A page that helps people book appointments, request quotes, or submit inquiries.' },
      { value: 'Real Estate or Rental Page', help: 'A page for a property, rental, listing, short-term rental, or real estate offer.' },
      { value: 'Portfolio / Personal Brand Page', help: 'A clean page to show your work, story, services, links, and personal brand.' },
      { value: 'Membership / Gated Content Page', help: 'A gated page or private area for members, customers, subscribers, or invited users.' },
    ],
  },
  {
    label: 'Apps & Systems',
    options: [
      { value: 'Web Application', help: 'A custom interactive web tool, dashboard, portal, or online system.' },
      { value: 'Mobile App', help: 'A mobile app concept or build plan for phones and tablets.' },
      { value: 'Client Portal', help: 'A private area where clients can log in, view updates, submit info, or access files.' },
      { value: 'Admin Dashboard', help: 'A backend control panel for managing data, content, customers, or business activity.' },
      { value: 'Ecommerce Store', help: 'A page or store for selling products, services, packages, or digital items.' },
      { value: 'Automation System', help: 'A behind-the-scenes system that runs tasks automatically across your tools and workflows.' },
      { value: 'AI-Powered Workflow', help: 'A workflow enhanced with AI for content, decisions, summaries, or smart routing.' },
      { value: 'Custom Product Build', help: 'A unique software product built around your specific idea, offer, or workflow.' },
    ],
  },
  {
    label: 'Marketing & Brand',
    options: [
      { value: 'Logo Concept', help: 'A new logo idea, direction, or visual concept for your brand.' },
      { value: 'Brand Concept', help: 'A broader creative direction including style, colors, logo ideas, visuals, and overall vibe.' },
      { value: 'Social Media Ad / Promo Graphic', help: 'A graphic or ad for Instagram, Facebook, TikTok, YouTube, X, or general business promo.' },
      { value: 'Short Promo Video', help: 'A short video to introduce, explain, or promote your brand, service, product, or event.' },
      { value: 'AI Video Ad', help: 'A video ad created or enhanced using AI tools, avatars, motion, or generated visuals.' },
      { value: 'Poster / Flyer', help: 'A printable or digital flyer/poster for a business, event, offer, or announcement.' },
    ],
  },
  {
    label: 'Other',
    options: [
      { value: 'Not Sure Yet', help: 'Choose this if you have an idea but need help figuring out what it should become.' },
    ],
  },
];

// Flat, ordered list of every supported build type value.
export const BUILD_TYPE_VALUES: BuildType[] = BUILD_TYPE_GROUPS.flatMap((g) =>
  g.options.map((o) => o.value),
);

// Quick lookup for the help text shown under the dropdown.
export const BUILD_TYPE_HELP: Record<BuildType, string> = BUILD_TYPE_GROUPS.reduce(
  (acc, group) => {
    group.options.forEach((opt) => {
      acc[opt.value] = opt.help;
    });
    return acc;
  },
  {} as Record<BuildType, string>,
);

/**
 * Legacy → current build type mapping.
 *
 * Used when restoring persisted form progress (and, in the future, when
 * normalising historical submissions for analytics/quoting). Any value
 * not in this map and not in BUILD_TYPE_VALUES is treated as cleared.
 */
export const BUILD_TYPE_LEGACY_MAP: Record<string, BuildType> = {
  // Casing / spacing updates
  'Landing page': 'Landing Page',
  'Web application': 'Web Application',
  'Mobile app': 'Mobile App',
  'Client portal': 'Client Portal',
  'Admin dashboard': 'Admin Dashboard',
  'Ecommerce store': 'Ecommerce Store',
  'Real estate or rental page': 'Real Estate or Rental Page',
  'Portfolio or personal brand page': 'Portfolio / Personal Brand Page',
  'Short promo video': 'Short Promo Video',
  'AI video ad': 'AI Video Ad',
  'Logo concept': 'Logo Concept',
  'Brand concept': 'Brand Concept',
  'Not sure yet': 'Not Sure Yet',

  // Renames
  'Membership or private access page': 'Membership / Gated Content Page',

  // Combinations
  'Booking page': 'Booking / Lead Capture Page',
  'Lead capture funnel': 'Booking / Lead Capture Page',
  'Marketing ad': 'Social Media Ad / Promo Graphic',
  'Social media ad': 'Social Media Ad / Promo Graphic',
  'Business promo graphic': 'Social Media Ad / Promo Graphic',
  'Product/service promo graphic': 'Social Media Ad / Promo Graphic',
  'Poster or flyer': 'Poster / Flyer',
  'Event flyer': 'Poster / Flyer',
};

// ---------------------------------------------------------------------
// Main project goal
// ---------------------------------------------------------------------

export const MAIN_GOAL_OPTIONS: MainGoal[] = [
  'Get More Leads',
  'Book More Appointments',
  'Sell Products or Services',
  'Improve Brand / Online Presence',
  'Create Marketing Assets',
  'Launch a New Idea',
  'Improve Customer Experience',
  'Automate a Workflow',
  'Organize Admin / Backend Operations',
];

/**
 * Legacy → current main goal mapping.
 *
 * Note: "Collect inquiries" is intentionally merged into
 * "Get More Leads" so analytics never has to distinguish between the
 * two phrasings.
 */
export const MAIN_GOAL_LEGACY_MAP: Record<string, MainGoal> = {
  'Get more leads': 'Get More Leads',
  'Book more appointments': 'Book More Appointments',
  'Sell products or services': 'Sell Products or Services',
  'Collect inquiries': 'Get More Leads',
  'Show off my brand better': 'Improve Brand / Online Presence',
  'Build a new idea from scratch': 'Launch a New Idea',
  'Create a better customer experience': 'Improve Customer Experience',
  'Organize my backend/admin workflow': 'Organize Admin / Backend Operations',
};

// ---------------------------------------------------------------------
// Normalisers
// ---------------------------------------------------------------------

/**
 * Coerce an unknown stored / submitted value into the current BuildType
 * union, applying legacy mapping. Returns '' for unknown / missing.
 */
export function normalizeBuildType(value: unknown): BuildType | '' {
  if (typeof value !== 'string' || value === '') return '';
  if ((BUILD_TYPE_VALUES as readonly string[]).includes(value)) {
    return value as BuildType;
  }
  return BUILD_TYPE_LEGACY_MAP[value] ?? '';
}

/**
 * Coerce an unknown stored / submitted value into the current MainGoal
 * union, applying legacy mapping. Returns '' for unknown / missing.
 */
export function normalizeMainGoal(value: unknown): MainGoal | '' {
  if (typeof value !== 'string' || value === '') return '';
  if ((MAIN_GOAL_OPTIONS as readonly string[]).includes(value)) {
    return value as MainGoal;
  }
  return MAIN_GOAL_LEGACY_MAP[value] ?? '';
}
