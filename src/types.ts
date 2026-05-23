export type BuildType =
  | 'Website'
  | 'Landing page'
  | 'Booking page'
  | 'Web application'
  | 'Mobile app'
  | 'Client portal'
  | 'Admin dashboard'
  | 'Ecommerce store'
  | 'Lead capture funnel'
  | 'Real estate or rental page'
  | 'Portfolio or personal brand page'
  | 'Membership or private access page'
  | 'Marketing ad'
  | 'Social media ad'
  | 'Short promo video'
  | 'AI video ad'
  | 'Poster or flyer'
  | 'Event flyer'
  | 'Business promo graphic'
  | 'Product/service promo graphic'
  | 'Logo concept'
  | 'Brand concept'
  | 'Not sure yet';

export type MainGoal =
  | 'Get more leads'
  | 'Book more appointments'
  | 'Sell products or services'
  | 'Collect inquiries'
  | 'Show off my brand better'
  | 'Build a new idea from scratch'
  | 'Create a better customer experience'
  | 'Organize my backend/admin workflow';

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
