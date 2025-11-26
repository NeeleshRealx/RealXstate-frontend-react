import React from 'react';
import { Plus, Copy } from 'lucide-react';
import { DayHours, TimeSlot as TimeSlotType } from '@/types/openingHours';
import { getDayName } from '@/utils/timeUtils';
import TimeSlot from '@/features/settings/components/TimeSlot/TimeSlot';
import Toggle from '@/components/common/Toggle/Toggle';

interface DayCardProps {
  dayHours: DayHours;
  onUpdate: (dayHours: DayHours) => void;
  onCopyFrom: (dayOfWeek: number) => void;
  disabled?: boolean;
}

const DayCard: React.FC<DayCardProps> = ({
  dayHours,
  onUpdate,
  onCopyFrom,
  disabled = false
}) => {
  const dayName = getDayName(dayHours.dayOfWeek);

  const handleToggleOpen = (isOpen: boolean) => {
    onUpdate({
      ...dayHours,
      isOpen,
      timeSlots: isOpen ? dayHours.timeSlots : []
    });
  };

  const handleAddTimeSlot = () => {
    const newTimeSlot: TimeSlotType = {
      id: Date.now().toString(),
      startTime: '9:00 AM',
      endTime: '5:00 PM',
      label: ''
    };
    
    onUpdate({
      ...dayHours,
      timeSlots: [...dayHours.timeSlots, newTimeSlot]
    });
  };

  const handleUpdateTimeSlot = (index: number, updatedSlot: TimeSlotType) => {
    const newTimeSlots = [...dayHours.timeSlots];
    newTimeSlots[index] = updatedSlot;
    onUpdate({
      ...dayHours,
      timeSlots: newTimeSlots
    });
  };

  const handleRemoveTimeSlot = (index: number) => {
    const newTimeSlots = dayHours.timeSlots.filter((_, i) => i !== index);
    onUpdate({
      ...dayHours,
      timeSlots: newTimeSlots
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Day Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{dayName}</h3>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onCopyFrom(dayHours.dayOfWeek)}
            disabled={disabled}
            className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <Copy className="w-4 h-4" />
            Copy from
          </button>
          <Toggle
            checked={dayHours.isOpen}
            onChange={handleToggleOpen}
            disabled={disabled}
            label="Open"
          />
        </div>
      </div>

      {/* Time Slots */}
      {dayHours.isOpen ? (
        <div className="space-y-3">
          {dayHours.timeSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-3">No time slots added yet</p>
              <button
                type="button"
                onClick={handleAddTimeSlot}
                disabled={disabled}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add Time Slot
              </button>
            </div>
          ) : (
            <>
              {dayHours.timeSlots.map((timeSlot, index) => (
                <TimeSlot
                  key={timeSlot.id}
                  timeSlot={timeSlot}
                  onUpdate={(updatedSlot) => handleUpdateTimeSlot(index, updatedSlot)}
                  onRemove={() => handleRemoveTimeSlot(index)}
                  disabled={disabled}
                />
              ))}
              <button
                type="button"
                onClick={handleAddTimeSlot}
                disabled={disabled}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add Another Time Slot
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Closed on {dayName}</p>
        </div>
      )}
    </div>
  );
};

export default DayCard;