import React from 'react';
import { LucideIcon, AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorPlaceholderProps {
  icon?: LucideIcon;
  title?: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ErrorPlaceholder: React.FC<ErrorPlaceholderProps> = ({
  icon: Icon = AlertCircle,
  title = 'Something went wrong',
  subtitle,
  actionText = 'Try Again',
  onAction,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: {
      container: 'py-4',
      icon: 'h-8 w-8',
      title: 'text-lg',
      subtitle: 'text-sm',
      button: 'px-4 py-2 text-sm'
    },
    md: {
      container: 'py-8',
      icon: 'h-12 w-12',
      title: 'text-xl',
      subtitle: 'text-base',
      button: 'px-6 py-3 text-base'
    },
    lg: {
      container: 'py-12',
      icon: 'h-16 w-16',
      title: 'text-2xl',
      subtitle: 'text-lg',
      button: 'px-8 py-4 text-lg'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${className}`}>
      <div className="text-center max-w-md mx-auto px-4">
        {/* Icon */}
        <div className="mb-6">
          <Icon className={`${currentSize.icon} text-red-500 mx-auto`} />
        </div>

        {/* Title */}
        <h2 className={`${currentSize.title} font-semibold text-gray-900 mb-2`}>
          {title}
        </h2>

        {/* Subtitle */}
        {subtitle && (
          <p className={`${currentSize.subtitle} text-gray-600 mb-6`}>
            {subtitle}
          </p>
        )}

        {/* Action Button */}
        {onAction && (
          <button
            onClick={onAction}
            className={`inline-flex items-center ${currentSize.button} font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors`}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorPlaceholder;
