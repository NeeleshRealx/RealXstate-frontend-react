export interface TimeSlot {
  open: string; // Format: "HH:MM"
  close: string; // Format: "HH:MM"
  label?: string; // Optional label like "Lunch", "Dinner"
}

export interface DayHours {
  is_open: boolean;
  time_slots: TimeSlot[];
}

export interface OpeningHours {
  id: string;
  branch_id: string;
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
  created_at: string;
  updated_at: string;
}

export interface UpdateOpeningHoursData {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface RegularHours {
  branchId: string;
  timezone: string;
  weeklyHours: DayHours[];
  lastUpdated: string;
}

export interface SpecialHours {
  id: string;
  branchId: string;
  date: string; // ISO date string
  isOpen: boolean;
  timeSlots: TimeSlot[];
  notes?: string;
  createdAt: string;
}

export interface OpeningHoursFormData {
  branchId: string;
  regularHours: DayHours[];
  specialHours: SpecialHours[];
}

export interface BranchInfo {
  id: string;
  name: string;
  timezone: string;
  address?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}