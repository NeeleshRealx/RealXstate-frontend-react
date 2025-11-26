import React from 'react';
import SettingsCard from './SettingsCard';
import { SettingsCard as SettingsCardType } from '@/types/settings';

interface SettingsGridProps {
  cards: SettingsCardType[];
  onCardClick: (card: SettingsCardType) => void;
}

const SettingsGrid: React.FC<SettingsGridProps> = ({ cards, onCardClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <SettingsCard
          key={card.id}
          card={card}
          onClick={() => onCardClick(card)}
        />
      ))}
    </div>
  );
};

export default SettingsGrid;
