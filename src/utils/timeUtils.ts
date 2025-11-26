export const formatTime12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const formatTime24Hour = (time12: string): string => {
  const [time, period] = time12.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  
  let hour24 = hours;
  if (period === 'PM' && hours !== 12) {
    hour24 = hours + 12;
  } else if (period === 'AM' && hours === 12) {
    hour24 = 0;
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const validateTimeRange = (startTime: string, endTime: string): boolean => {
  const start24 = formatTime24Hour(startTime);
  const end24 = formatTime24Hour(endTime);
  return start24 < end24;
};

export const checkTimeSlotOverlap = (slots: Array<{ startTime: string; endTime: string }>): boolean => {
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const slot1Start = formatTime24Hour(slots[i].startTime);
      const slot1End = formatTime24Hour(slots[i].endTime);
      const slot2Start = formatTime24Hour(slots[j].startTime);
      const slot2End = formatTime24Hour(slots[j].endTime);
      
      // Check for overlap
      if (slot1Start < slot2End && slot2Start < slot1End) {
        return true;
      }
    }
  }
  return false;
};

export const generateTimeOptions = (): string[] => {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      times.push(formatTime12Hour(time24));
    }
  }
  return times;
};

export const getDayName = (dayOfWeek: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
};

export const getDayAbbreviation = (dayOfWeek: number): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayOfWeek];
};

export const formatTimeSlot = (startTime: string, endTime: string): string => {
  return `${startTime} - ${endTime}`;
};

export const isValidTimeFormat = (time: string): boolean => {
  const timeRegex = /^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/;
  return timeRegex.test(time);
};