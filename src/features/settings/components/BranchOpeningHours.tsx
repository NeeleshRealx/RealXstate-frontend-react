import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { DayHours, TimeSlot } from '@/types/settings';

interface BranchOpeningHoursProps {
  value?: { [key: string]: DayHours };
  onChange: (value: { [key: string]: DayHours }) => void;
}

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

const TIME_OPTIONS = [
  '00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30',
  '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30',
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
];

const BranchOpeningHours: React.FC<BranchOpeningHoursProps> = ({ value = {}, onChange }) => {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  // Ensure all days are present when component initializes
  useEffect(() => {
    if (Object.keys(value).length > 0) {
      const completeHours = ensureAllDaysPresent(value);
      if (JSON.stringify(completeHours) !== JSON.stringify(value)) {
        onChange(completeHours);
      }
    }
  }, [value, onChange]);

  const getDefaultDayHours = (): DayHours => ({
    is_open: false,
    time_slots: []
  });

  const ensureAllDaysPresent = (hours: { [key: string]: DayHours }) => {
    const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const updatedHours = { ...hours };
    
    allDays.forEach(dayKey => {
      if (!updatedHours[dayKey]) {
        updatedHours[dayKey] = getDefaultDayHours();
      } else {
        // Ensure time_slots is always an array
        if (!updatedHours[dayKey].time_slots) {
          updatedHours[dayKey].time_slots = [];
        }
        // Ensure is_open is always a boolean
        if (typeof updatedHours[dayKey].is_open !== 'boolean') {
          updatedHours[dayKey].is_open = false;
        }
      }
    });
    
    return updatedHours;
  };

  const handleDayToggle = (day: string, isOpen: boolean) => {
    const updatedHours = ensureAllDaysPresent(value);
    updatedHours[day].is_open = isOpen;
    
    onChange(updatedHours);
  };

  const addTimeSlot = (day: string) => {
    const updatedHours = ensureAllDaysPresent(value);
    
    const newSlot: TimeSlot = {
      open: '09:00',
      close: '17:00',
      label: ''
    };
    
    // Ensure the day has time_slots array
    if (!updatedHours[day].time_slots) {
      updatedHours[day].time_slots = [];
    }
    
    updatedHours[day].time_slots.push(newSlot);
    onChange(updatedHours);
  };

  const updateTimeSlot = (day: string, index: number, field: keyof TimeSlot, newValue: string) => {
    const updatedHours = ensureAllDaysPresent(value);
    
    // Ensure the day and time_slots exist
    if (!updatedHours[day] || !updatedHours[day].time_slots) {
      return;
    }
    
    if (updatedHours[day].time_slots[index]) {
      updatedHours[day].time_slots[index][field] = newValue;
      onChange(updatedHours);
    }
  };

  const removeTimeSlot = (day: string, index: number) => {
    const updatedHours = ensureAllDaysPresent(value);
    
    // Ensure the day and time_slots exist
    if (!updatedHours[day] || !updatedHours[day].time_slots) {
      return;
    }
    
    updatedHours[day].time_slots.splice(index, 1);
    onChange(updatedHours);
  };

  const getDayStatus = (day: string) => {
    const dayHours = value[day];
    if (!dayHours || !dayHours.is_open) return 'closed';
    if (!dayHours.time_slots || dayHours.time_slots.length === 0) return 'no-hours';
    return 'open';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'default';
      case 'closed': return 'secondary';
      case 'no-hours': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Open';
      case 'closed': return 'Closed';
      case 'no-hours': return 'No Hours Set';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Opening Hours</Label>
        <Badge variant="outline" className="text-xs">
          <Clock className="w-3 h-3 mr-1" />
          Weekly Schedule
        </Badge>
      </div>

      <div className="space-y-3">
        {DAYS.map(({ key, label }) => {
          const dayHours = value[key] || getDefaultDayHours();
          const status = getDayStatus(key);
          const isExpanded = expandedDay === key;

          return (
            <Card key={key} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={dayHours.is_open}
                      onCheckedChange={(checked) => handleDayToggle(key, checked)}
                    />
                    <span className="font-medium">{label}</span>
                    <Badge variant={getStatusColor(status) as any}>
                      {getStatusText(status)}
                    </Badge>
                  </div>
                  
                  {dayHours.is_open && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setExpandedDay(isExpanded ? null : key);
                      }}
                    >
                      {isExpanded ? 'Hide' : 'Show'} Hours
                    </Button>
                  )}
                </div>

                {dayHours.is_open && isExpanded && (
                  <div className="mt-4 space-y-3">
                    {!dayHours.time_slots || dayHours.time_slots.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>No time slots set</p>
                        <p className="text-sm">Add time slots to define opening hours</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {dayHours.time_slots.map((slot, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1 grid grid-cols-3 gap-3">
                              <div>
                                <Label className="text-xs text-gray-600">Open</Label>
                                <select
                                  value={slot.open}
                                  onChange={(e) => updateTimeSlot(key, index, 'open', e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                                >
                                  {TIME_OPTIONS.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                  ))}
                                </select>
                              </div>
                              
                              <div>
                                <Label className="text-xs text-gray-600">Close</Label>
                                <select
                                  value={slot.close}
                                  onChange={(e) => updateTimeSlot(key, index, 'close', e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                                >
                                  {TIME_OPTIONS.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                  ))}
                                </select>
                              </div>
                              
                              <div>
                                <Label className="text-xs text-gray-600">Label (Optional)</Label>
                                <input
                                  type="text"
                                  value={slot.label ?? ''}
                                  onChange={(e) => updateTimeSlot(key, index, 'label', e.target.value)}
                                  placeholder="e.g., Lunch, Dinner"
                                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                                />
                              </div>
                            </div>
                            
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removeTimeSlot(key, index);
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addTimeSlot(key);
                      }}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Time Slot
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default BranchOpeningHours;
