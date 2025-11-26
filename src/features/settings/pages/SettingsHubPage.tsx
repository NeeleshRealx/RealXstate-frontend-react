import React from 'react';
import SettingsHub from '@/features/settings/components/SettingsHub';

const SettingsHubPage: React.FC = () => {
  return (
    <div className="h-[calc(100vh-3rem)] bg-gray-50 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <SettingsHub />
      </div>
    </div>
  );
};

export default SettingsHubPage;
