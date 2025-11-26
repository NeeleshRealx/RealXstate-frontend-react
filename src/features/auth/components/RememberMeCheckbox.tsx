import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface RememberMeCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
}

export const RememberMeCheckbox = forwardRef<HTMLInputElement, RememberMeCheckboxProps>(
  ({ className, id, ...props }, ref) => {
    return (
      <div className="flex items-center">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          className={cn(
            'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded',
            className
          )}
          {...props}
        />
        <label htmlFor={id} className="ml-2 block text-sm text-gray-700">
          Remember me
        </label>
      </div>
    );
  }
);

RememberMeCheckbox.displayName = 'RememberMeCheckbox';
