import { z } from 'zod';

const timeSlotSchema = z.object({
  id: z.string(),
  startTime: z.string().regex(/^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/, 'Invalid time format'),
  endTime: z.string().regex(/^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/, 'Invalid time format'),
  label: z.string().optional(),
}).refine((data) => {
  // Validate that end time is after start time
  const start24 = formatTime24Hour(data.startTime);
  const end24 = formatTime24Hour(data.endTime);
  return start24 < end24;
}, {
  message: 'End time must be after start time',
  path: ['endTime']
});

const dayHoursSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  isOpen: z.boolean(),
  timeSlots: z.array(timeSlotSchema).refine((slots) => {
    if (slots.length === 0) return true;
    
    // Check for overlapping time slots
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const slot1Start = formatTime24Hour(slots[i].startTime);
        const slot1End = formatTime24Hour(slots[i].endTime);
        const slot2Start = formatTime24Hour(slots[j].startTime);
        const slot2End = formatTime24Hour(slots[j].endTime);
        
        if (slot1Start < slot2End && slot2Start < slot1End) {
          return false;
        }
      }
    }
    return true;
  }, {
    message: 'Time slots cannot overlap'
  })
});

export const openingHoursSchema = z.object({
  branchId: z.string().min(1, 'Please select a branch'),
  regularHours: z.array(dayHoursSchema),
  specialHours: z.array(z.object({
    id: z.string(),
    branchId: z.string(),
    date: z.string(),
    isOpen: z.boolean(),
    timeSlots: z.array(timeSlotSchema),
    notes: z.string().optional(),
    createdAt: z.string()
  }))
});

export type OpeningHoursFormData = z.infer<typeof openingHoursSchema>;

function formatTime24Hour(time12: string): string {
  const [time, period] = time12.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  
  let hour24 = hours;
  if (period === 'PM' && hours !== 12) {
    hour24 = hours + 12;
  } else if (period === 'AM' && hours === 12) {
    hour24 = 0;
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}