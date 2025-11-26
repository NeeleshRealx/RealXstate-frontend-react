import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  height?: string;
  width?: string;
  rounded?: boolean;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  height = 'h-4',
  width = 'w-full',
  rounded = true
}) => {
  return (
    <div
      className={`bg-gray-200 animate-pulse ${height} ${width} ${
        rounded ? 'rounded' : ''
      } ${className}`}
    />
  );
};

interface SkeletonCardProps {
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = '' }) => {
  return (
    <div className={`bg-white p-4 border border-gray-200 rounded-lg ${className}`}>
      <SkeletonLoader height="h-6" width="w-3/4" className="mb-2" />
      <SkeletonLoader height="h-4" width="w-1/2" className="mb-2" />
      <SkeletonLoader height="h-4" width="w-2/3" />
    </div>
  );
};

interface SkeletonListProps {
  count?: number;
  className?: string;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({ 
  count = 3, 
  className = '' 
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({ 
  rows = 5, 
  columns = 4,
  className = '' 
}) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Table header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, index) => (
            <SkeletonLoader key={index} height="h-4" width="w-20" />
          ))}
        </div>
      </div>
      
      {/* Table rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-4 py-3">
            <div className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <SkeletonLoader key={colIndex} height="h-4" width="w-16" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonLoader;
