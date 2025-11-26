import React from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { ToggleSwitch } from '@/components/common/ToggleSwitch';

interface TimeInterval {
  id: string;
  start: string;
  end: string;
}

interface DayAvailability {
  day: string;
  available: boolean;
  periods: ('breakfast' | 'lunch' | 'dinner')[];
  customTimes: TimeInterval[];
}

interface AvailabilityTabProps {
  availability: DayAvailability[];
  onChange: (availability: DayAvailability[]) => void;
}

const days = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const periods = [
  { id: 'breakfast', label: 'Breakfast', time: '6:00 AM - 11:00 AM' },
  { id: 'lunch', label: 'Lunch', time: '11:00 AM - 4:00 PM' },
  { id: 'dinner', label: 'Dinner', time: '4:00 PM - 10:00 PM' },
];

export const AvailabilityTab: React.FC<AvailabilityTabProps> = ({ availability, onChange }) => {
  const updateDayAvailability = (dayIndex: number, field: keyof DayAvailability, value: any) => {
    const updatedAvailability = [...availability];
    updatedAvailability[dayIndex] = { ...updatedAvailability[dayIndex], [field]: value };
    onChange(updatedAvailability);
  };

  const togglePeriod = (dayIndex: number, period: 'breakfast' | 'lunch' | 'dinner') => {
    const updatedAvailability = [...availability];
    const day = updatedAvailability[dayIndex];
    const periods = day.periods.includes(period)
      ? day.periods.filter(p => p !== period)
      : [...day.periods, period];
    
    // Check for conflicts with custom times
    const hasCustomTimes = day.customTimes.length > 0;
    if (hasCustomTimes && periods.length > 0) {
      // Show warning about conflicts
      console.warn('Custom times will override service periods. Consider removing custom times or service periods to avoid conflicts.');
    }
    
    updatedAvailability[dayIndex] = { ...day, periods };
    onChange(updatedAvailability);
  };

  const addCustomTime = (dayIndex: number) => {
    const newInterval: TimeInterval = {
      id: Date.now().toString(),
      start: '09:00',
      end: '17:00',
    };
    updateDayAvailability(dayIndex, 'customTimes', [
      ...availability[dayIndex].customTimes,
      newInterval,
    ]);
  };

  const updateCustomTime = (dayIndex: number, intervalId: string, field: 'start' | 'end', value: string) => {
    const updatedTimes = availability[dayIndex].customTimes.map(time => {
      if (time.id === intervalId) {
        const updatedTime = { ...time, [field]: value };
        
        // Validate that start time is before end time
        if (field === 'start' && updatedTime.end && value >= updatedTime.end) {
          // If start time is after or equal to end time, adjust end time
          const startTime = new Date(`2000-01-01T${value}`);
          const newEndTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Add 1 hour
          updatedTime.end = newEndTime.toTimeString().slice(0, 5);
        } else if (field === 'end' && updatedTime.start && value <= updatedTime.start) {
          // If end time is before or equal to start time, adjust start time
          const endTime = new Date(`2000-01-01T${value}`);
          const newStartTime = new Date(endTime.getTime() - 60 * 60 * 1000); // Subtract 1 hour
          updatedTime.start = newStartTime.toTimeString().slice(0, 5);
        }
        
        return updatedTime;
      }
      return time;
    });
    updateDayAvailability(dayIndex, 'customTimes', updatedTimes);
  };

  const removeCustomTime = (dayIndex: number, intervalId: string) => {
    const updatedTimes = availability[dayIndex].customTimes.filter(time => time.id !== intervalId);
    updateDayAvailability(dayIndex, 'customTimes', updatedTimes);
  };

  const applyToAllDays = (field: keyof DayAvailability, value: any) => {
    const updatedAvailability = availability.map(day => ({ ...day, [field]: value }));
    onChange(updatedAvailability);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Availability</h3>
        <p className="text-sm text-gray-500">
          Set when this menu item is available to customers. You can use service periods or custom times.
        </p>
      </div>

      {/* Global Controls */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Apply to all days</h4>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyToAllDays('available', true)}
            className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 border border-green-200 rounded-full hover:bg-green-200"
          >
            Enable All
          </button>
          <button
            type="button"
            onClick={() => applyToAllDays('available', false)}
            className="px-3 py-1 text-xs font-medium text-red-800 bg-red-100 border border-red-200 rounded-full hover:bg-red-200"
          >
            Disable All
          </button>
          <button
            type="button"
            onClick={() => applyToAllDays('periods', ['breakfast', 'lunch', 'dinner'])}
            className="px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 border border-blue-200 rounded-full hover:bg-blue-200"
          >
            All Day
          </button>
          <button
            type="button"
            onClick={() => applyToAllDays('periods', [])}
            className="px-3 py-1 text-xs font-medium text-gray-800 bg-gray-100 border border-gray-200 rounded-full hover:bg-gray-200"
          >
            Clear Periods
          </button>
        </div>
      </div>

      {/* Daily Availability */}
      <div className="space-y-4">
        {availability.map((dayAvail, dayIndex) => (
          <div key={dayAvail.day} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-900">{dayAvail.day}</h4>
              <ToggleSwitch
                checked={dayAvail.available}
                onChange={(checked) => updateDayAvailability(dayIndex, 'available', checked)}
                label="Available"
              />
            </div>

            {dayAvail.available && (
              <div className="space-y-4">
                {/* Service Periods */}
                <div>
                  <h5 className="text-xs font-medium text-gray-700 mb-2">Service Periods</h5>
                  <div className="flex flex-wrap gap-2">
                    {periods.map((period) => (
                      <button
                        key={period.id}
                        type="button"
                        onClick={() => togglePeriod(dayIndex, period.id as any)}
                        className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                          dayAvail.periods.includes(period.id as any)
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div>{period.label}</div>
                        <div className="text-xs text-gray-500">{period.time}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Times */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-medium text-gray-700">Custom Times</h5>
                    <button
                      type="button"
                      onClick={() => addCustomTime(dayIndex)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      + Add Interval
                    </button>
                  </div>
                  
                  {dayAvail.customTimes.length > 0 && (
                    <div className="space-y-2">
                      {dayAvail.customTimes.map((interval) => (
                        <div key={interval.id} className="flex items-center space-x-2">
                          <input
                            type="time"
                            value={interval.start}
                            onChange={(e) => updateCustomTime(dayIndex, interval.id, 'start', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={interval.end}
                            onChange={(e) => updateCustomTime(dayIndex, interval.id, 'end', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeCustomTime(dayIndex, interval.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Availability Settings
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              Custom times will override service periods. Make sure there are no conflicts in your time settings.
              <br />
              <strong>Service Period Times:</strong> Breakfast (6:00-11:00), Lunch (11:00-16:00), Dinner (16:00-22:00)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 
