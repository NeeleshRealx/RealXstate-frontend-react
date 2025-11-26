import React from 'react';
import { Trash2, GripVertical } from 'lucide-react';
import TimePicker from '@/components/common/TimePicker/TimePicker';
import { TimeSlot as TimeSlotType } from '@/types/openingHours';

interface TimeSlotProps {
  timeSlot: TimeSlotType;
  onUpdate: (timeSlot: TimeSlotType) => void;
  onRemove: () => void;
  disabled?: boolean;
  error?: string;
}

const TimeSlot: React.FC<TimeSlotProps> = ({
  timeSlot,
  onUpdate,
  onRemove,
  disabled = false,
  error
}) => {
  const handleStartTimeChange = (open: string) => {
    onUpdate({ ...timeSlot, open });
  };

  const handleEndTimeChange = (close: string) => {
    onUpdate({ ...timeSlot, close });
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...timeSlot, label: e.target.value });
  };

  return (
    <div className={`p-4 border rounded-lg bg-gray-50 ${error ? 'border-red-300' : 'border-gray-200'}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="cursor-move">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TimePicker
            value={timeSlot.open}
            onChange={handleStartTimeChange}
            placeholder="Start time"
            disabled={disabled}
          />
          <TimePicker
            value={timeSlot.close}
            onChange={handleEndTimeChange}
            placeholder="End time"
            disabled={disabled}
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="ml-7">
        <input
          type="text"
          value={timeSlot.label || ''}
          onChange={handleLabelChange}
          placeholder="Optional label (e.g., Lunch, Dinner)"
          disabled={disabled}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
      </div>
      
      {error && (
        <p className="mt-2 ml-7 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default TimeSlot;