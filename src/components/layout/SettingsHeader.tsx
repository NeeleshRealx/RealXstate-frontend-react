import React from 'react';
import SettingsBreadcrumbs from './SettingsBreadcrumbs';

interface SettingsHeaderProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

const SettingsHeader: React.FC<SettingsHeaderProps> = ({ title, subtitle, breadcrumbs = [] }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-6">
      {breadcrumbs.length > 0 && (
        <div className="mb-4">
          <SettingsBreadcrumbs items={breadcrumbs} />
        </div>
      )}
      <div>
        {title && (
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        )}
        {subtitle && (
          <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default SettingsHeader;
