import React from 'react';
import { LucideIcon } from 'lucide-react';

interface LoadingPlaceholderProps {
  icon?: LucideIcon;
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingPlaceholder: React.FC<LoadingPlaceholderProps> = ({
  icon: Icon,
  title = 'Loading...',
  subtitle,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: {
      container: 'py-4',
      spinner: 'h-6 w-6',
      icon: 'h-8 w-8',
      title: 'text-lg',
      subtitle: 'text-sm'
    },
    md: {
      container: 'py-8',
      spinner: 'h-8 w-8',
      icon: 'h-12 w-12',
      title: 'text-xl',
      subtitle: 'text-base'
    },
    lg: {
      container: 'py-12',
      spinner: 'h-12 w-12',
      icon: 'h-16 w-16',
      title: 'text-2xl',
      subtitle: 'text-lg'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${className}`}>
      <div className="text-center max-w-md mx-auto px-4">
        {/* Icon or Spinner */}
        <div className="mb-6">
          {Icon ? (
            <div className="relative">
              <Icon className={`${currentSize.icon} text-blue-600 mx-auto mb-4 animate-pulse`} />
              {/* <div className={`absolute ${currentSize.spinner} border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto`}></div> */}
            </div>
          ) : (
            <div className={`${currentSize.spinner} border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4`}></div>
          )}
        </div>

        {/* Title */}
        <h2 className={`${currentSize.title} font-semibold text-gray-900 mb-2`}>
          {title}
        </h2>

        {/* Subtitle */}
        {subtitle && (
          <p className={`${currentSize.subtitle} text-gray-600`}>
            {subtitle}
          </p>
        )}

        {/* Loading dots animation */}
        <div className="flex justify-center mt-4 space-x-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPlaceholder;
