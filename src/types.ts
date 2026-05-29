// Public intake category types.
// Source of truth for option values / help text / legacy mapping lives in
// src/lib/intake-options.ts — keep these unions aligned with that file.

export type BuildType =
  // Websites & Pages
  | 'Website'
  | 'Landing Page'
  | 'Booking / Lead Capture Page'
  | 'Real Estate or Rental Page'
  | 'Portfolio / Personal Brand Page'
  | 'Membership / Gated Content Page'
  // Apps & Systems
  | 'Web Application'
  | 'Mobile App'
  | 'Client Portal'
  | 'Admin Dashboard'
  | 'Ecommerce Store'
  | 'Automation System'
  | 'AI-Powered Workflow'
  | 'Custom Product Build'
  // Marketing & Brand
  | 'Logo Concept'
  | 'Brand Concept'
  | 'Social Media Ad / Promo Graphic'
  | 'Short Promo Video'
  | 'AI Video Ad'
  | 'Poster / Flyer'
  // Other
  | 'Not Sure Yet';

export type MainGoal =
  | 'Get More Leads'
  | 'Book More Appointments'
  | 'Sell Products or Services'
  | 'Improve Brand / Online Presence'
  | 'Create Marketing Assets'
  | 'Launch a New Idea'
  | 'Improve Customer Experience'
  | 'Automate a Workflow'
  | 'Organize Admin / Backend Operations';

export type BudgetRange =
  | 'Under $500'
  | '$500 - $1,500'
  | '$1,500 - $5,000'
  | '$5,000+'
  | 'Not sure yet';

export type TimelineOption = 'ASAP' | 'This month' | '1-3 months' | 'Just exploring';

export interface IntakeFormData {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  buildType: BuildType | '';
  projectDescription: string;
  files: Array<{ name: string; size: number; previewUrl?: string }>;
  mainGoal: MainGoal | '';
  budget: BudgetRange | '';
  timeline: TimelineOption | '';
}
