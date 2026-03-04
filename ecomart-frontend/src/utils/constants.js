export const PRIMARY_CATEGORIES = [
  'Packaging & Wrapping',
  'Office & Stationery',
  'Food & Beverage',
  'Personal Care & Hygiene',
  'Cleaning & Household',
  'Apparel & Accessories',
  'Electronics & Gadgets',
  'Events & Gifting',
  'Agriculture & Garden',
  'Travel & Outdoors',
];

export const SUSTAINABILITY_FILTERS = [
  'plastic-free', 'compostable', 'recycled-content', 'biodegradable',
  'vegan', 'organic', 'fair-trade', 'carbon-neutral', 'zero-waste',
  'renewable-materials', 'upcycled', 'water-saving', 'energy-efficient',
  'locally-sourced', 'cruelty-free',
];

export const CLIENT_TYPES = [
  'corporate', 'startup', 'ngo', 'government', 'hospitality', 'retail', 'education',
];

export const EVENT_TYPES = [
  'conference', 'product-launch', 'team-offsite', 'trade-show', 'client-gifting',
  'onboarding-kit', 'festival-celebration', 'award-ceremony', 'workshop', 'annual-day',
];

export const SUSTAINABILITY_LEVELS = [
  { value: 'low',     label: 'Low',     desc: 'Basic eco-friendly options',         color: '#84CC16' },
  { value: 'medium',  label: 'Medium',  desc: 'Good sustainability balance',         color: '#22C55E' },
  { value: 'high',    label: 'High',    desc: 'Certified sustainable products',      color: '#16A34A' },
  { value: 'premium', label: 'Premium', desc: 'Maximum environmental impact',        color: '#15803D' },
];

export const STATUS_COLORS = {
  success: 'badge-success',
  failed:  'badge-red',
  partial: 'badge-gold',
  validated: 'badge-green',
  draft:   'badge-ivory',
  sent:    'badge-sky',
  accepted:'badge-success',
  rejected:'badge-red',
};
