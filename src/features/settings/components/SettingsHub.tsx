import React from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsHeader from '@/components/layout/SettingsHeader';
import SettingsGrid from './SettingsGrid';
import { SettingsCard } from '@/types/settings';

const settingsCards: SettingsCard[] = [
  {
    id: 'business-profile',
    title: 'Business Profile',
    description: 'Edit business name, contact info, and logo.',
    icon: 'Building2',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    path: '/settings/business-profile'
  },
  {
    id: 'branches',
    title: 'Branches',
    description: 'Create and manage locations.',
    icon: 'MapPin',
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    path: '/settings/branches'
  },
  {
    id: 'opening-hours',
    title: 'Opening Hours',
    description: 'Set hours per branch.',
    icon: 'Clock',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
    path: '/settings/opening-hours'
  },
  {
    id: 'qr-codes',
    title: 'QR Codes',
    description: 'Preview and download table QR codes.',
    icon: 'QrCode',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    path: '/settings/qr-codes'
  },
  {
    id: 'table-setup',
    title: 'Table Setup',
    description: 'Add and organize tables.',
    icon: 'Grid3x3',
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
    path: '/settings/table-setup'
  },
  {
    id: 'account-settings',
    title: 'Account Settings',
    description: 'Your user details and password.',
    icon: 'User',
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    path: '/settings/account'
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Email/SMS/Chat alerts.',
    icon: 'Bell',
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    path: '/settings/notifications'
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'POS, payments, chat agent.',
    icon: 'Puzzle',
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
    path: '/settings/integrations'
  }
];

const SettingsHub: React.FC = () => {
  const navigate = useNavigate();

  const handleCardClick = (card: SettingsCard) => {
    navigate(card.path);
  };

  const breadcrumbs = [
    // { label: 'Dashboard', href: '/dashboard' },
    // { label: 'Settings' }
    {}
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SettingsHeader
        title="Settings"
        subtitle="Manage your business, branches, tables, and account."
        // breadcrumbs={breadcrumbs}
      />
      <main className="p-8">
        <SettingsGrid
          cards={settingsCards}
          onCardClick={handleCardClick}
        />
      </main>
    </div>
  );
};

export default SettingsHub;
