export interface SettingsCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  path: string;
}

export interface User {
  name: string;
  role: string;
  avatar?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  active?: boolean;
}

export interface BusinessProfile {
  id: string;
  name: string;
  slug: string;
  contact_email: string;
  contact_phone?: string;
  logo_url?: string;
  description?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  business_hours?: any;
  social_links?: any;
  // created_at: string;
  // updated_at: string;
}

export interface UpdateBusinessProfileData {
  name?: string;
  contact_email?: string;
  contact_phone?: string;
  slug?: string;
  description?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  business_hours?: any;
  social_links?: any;
}

export interface Branch {
  id?: string; // Optional for new branches, required for updates
  name: string;
  address: string;
  timezone: string;
  phone?: string;
  manager?: string;
  status: 'active' | 'inactive';
  business_id?: string;
  opening_hours?: OpeningHours;
  created_at?: string;
  updated_at?: string;
}

export interface TimeSlot {
  start: string; // Format: "HH:MM AM/PM"
  end: string; // Format: "HH:MM AM/PM"
  label?: string; // Optional label like "Lunch", "Dinner"
}

export interface DayHours {
  is_open: boolean;
  time_slots: TimeSlot[];
}

export interface OpeningHours {
  id?: string;
  branch_id?: string;
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
  created_at?: string;
  updated_at?: string;
}