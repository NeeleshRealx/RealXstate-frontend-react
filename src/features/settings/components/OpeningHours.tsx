import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Plus, 
  X, 
  Calendar,
  Copy,
  Save
} from 'lucide-react';
import { OpeningHours as OpeningHoursType, TimeSlot, Branch } from '@/types/settings';

interface OpeningHoursProps {
  branches?: Branch[];
  openingHours?: OpeningHoursType;
  onSave?: (hours: OpeningHoursType) => void;
}

const OpeningHours: React.FC<OpeningHoursProps> = ({ 
  branches = [], 
  openingHours = {}, 
  onSave 
}) => {
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [hours, setHours] = useState<{ [key: string]: { isOpen: boolean; slots: TimeSlot[] } }>(openingHours as any);
  const [copyFromDay, setCopyFromDay] = useState<string>('');

  // Sync internal state with prop changes
  useEffect(() => {
    if (openingHours && Object.keys(openingHours).length > 0) {
      console.log('OpeningHours component received new data:', openingHours);
      setHours(openingHours as any);
    }
  }, [openingHours]);

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  const timeSlots = [
    '12:00 AM', '12:30 AM', '1:00 AM', '1:30 AM', '2:00 AM', '2:30 AM',
    '3:00 AM', '3:30 AM', '4:00 AM', '4:30 AM', '5:00 AM', '5:30 AM',
    '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM',
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
    '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM',
    '9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM',
  ];

  const getDayHours = (dayKey: string) => {
    return hours[dayKey] || { isOpen: false, slots: [] };
  };

  const updateDayHours = (dayKey: string, updates: Partial<{ isOpen: boolean; slots: TimeSlot[] }>) => {
    setHours(prev => ({
      ...prev,
      [dayKey]: { ...getDayHours(dayKey), ...updates }
    }));
  };

  const addTimeSlot = (dayKey: string) => {
    const currentSlots = getDayHours(dayKey).slots;
    const newSlot: TimeSlot = {
      start: '9:00 AM',
      end: '5:00 PM',
      label: ''
    };
    updateDayHours(dayKey, { slots: [...currentSlots, newSlot] });
  };

  const updateTimeSlot = (dayKey: string, slotIndex: number, updates: Partial<TimeSlot>) => {
    const currentSlots = getDayHours(dayKey).slots;
    const updatedSlots = currentSlots.map((slot, index) => 
      index === slotIndex ? { ...slot, ...updates } : slot
    );
    updateDayHours(dayKey, { slots: updatedSlots });
  };

  const removeTimeSlot = (dayKey: string, slotIndex: number) => {
    const currentSlots = getDayHours(dayKey).slots;
    const updatedSlots = currentSlots.filter((_, index) => index !== slotIndex);
    updateDayHours(dayKey, { slots: updatedSlots });
  };

  const copyHours = (fromDay: string, toDay: string) => {
    const sourceHours = getDayHours(fromDay);
    updateDayHours(toDay, sourceHours);
  };

  const copyToAllDays = (fromDay: string) => {
    const sourceHours = getDayHours(fromDay);
    const updatedHours = { ...hours };
    daysOfWeek.forEach(day => {
      if (day.key !== fromDay) {
        updatedHours[day.key] = sourceHours;
      }
    });
    setHours(updatedHours);
  };

  const handleSave = () => {
    // Convert back to OpeningHours type for the onSave callback
    const convertedHours = hours as any as OpeningHoursType;
    onSave?.(convertedHours);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Opening Hours</h1>
        <p className="text-muted-foreground">
          Set regular weekly hours for your business locations
        </p>
      </div>

      {/* Branch Selector */}
      {branches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Branch</CardTitle>
            <CardDescription>
              Choose a branch to manage its opening hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Select a branch...</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
      )}

      {/* Weekly Schedule */}
      <div className="grid gap-6">
        {daysOfWeek.map((day) => {
          const dayHours = getDayHours(day.key);
          
          return (
            <Card key={day.key}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CardTitle className="text-lg">{day.label}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={dayHours.isOpen}
                        onCheckedChange={(checked) => 
                          updateDayHours(day.key, { isOpen: checked })
                        }
                      />
                      <Label>
                        {dayHours.isOpen ? 'Open' : 'Closed'}
                      </Label>
                    </div>
                  </div>
                  
                  {dayHours.isOpen && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCopyFromDay(day.key)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                      {copyFromDay && copyFromDay !== day.key && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            copyHours(copyFromDay, day.key);
                            setCopyFromDay('');
                          }}
                        >
                          Paste
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              
              {dayHours.isOpen && (
                <CardContent className="space-y-4">
                  {dayHours.slots.map((slot, slotIndex) => (
                    <div key={slotIndex} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="grid grid-cols-2 gap-4 flex-1">
                        <div>
                          <Label>Start Time</Label>
                          <select
                            value={slot.start}
                            onChange={(e) => updateTimeSlot(day.key, slotIndex, { start: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                          >
                            {timeSlots.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <Label>End Time</Label>
                          <select
                            value={slot.end}
                            onChange={(e) => updateTimeSlot(day.key, slotIndex, { end: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                          >
                            {timeSlots.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <Label>Label (Optional)</Label>
                        <Input
                          value={slot.label}
                          onChange={(e) => updateTimeSlot(day.key, slotIndex, { label: e.target.value })}
                          placeholder="e.g., Lunch, Dinner"
                          className="mt-1"
                        />
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeTimeSlot(day.key, slotIndex)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={() => addTimeSlot(day.key)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Time Slot
                  </Button>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Actions</CardTitle>
          <CardDescription>
            Apply the same hours to multiple days
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <select
              value={copyFromDay}
              onChange={(e) => setCopyFromDay(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Select source day...</option>
              {daysOfWeek.map(day => (
                <option key={day.key} value={day.key}>{day.label}</option>
              ))}
            </select>
            
            <Button
              variant="outline"
              onClick={() => copyToAllDays(copyFromDay)}
              disabled={!copyFromDay}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy to All Days
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="px-8">
          <Save className="w-4 h-4 mr-2" />
          Save Opening Hours
        </Button>
      </div>
    </div>
  );
};

export default OpeningHours;
