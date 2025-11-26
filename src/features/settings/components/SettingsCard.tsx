import React from 'react';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Grid3x3, 
  QrCode, 
  User, 
  Bell, 
  Puzzle 
} from 'lucide-react';
import { SettingsCard as SettingsCardType } from '@/types/settings';

const iconComponents = {
  Building2,
  MapPin,
  Clock,
  Grid3x3,
  QrCode,
  User,
  Bell,
  Puzzle,
};

interface SettingsCardProps {
  card: SettingsCardType;
  onClick?: () => void;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ card, onClick }) => {
  const IconComponent = iconComponents[card.icon as keyof typeof iconComponents];

  return (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
    >
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0 mb-4">
          <div 
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.iconBg} group-hover:scale-110 transition-transform duration-200`}
          >
            <IconComponent className={`w-6 h-6 ${card.iconColor}`} />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
            {card.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {card.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsCard;
