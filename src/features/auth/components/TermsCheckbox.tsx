import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TermsCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const TermsCheckbox = forwardRef<HTMLInputElement, TermsCheckboxProps>(
  ({ error, className, id, ...props }, ref) => {
    const checkboxId = id || `terms-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="space-y-2">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              ref={ref}
              id={checkboxId}
              type="checkbox"
              className={cn(
                'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded',
                error && 'border-red-300 focus:ring-red-500',
                className
              )}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? `${checkboxId}-error` : undefined}
              {...props}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor={checkboxId} className="text-gray-700">
              I agree to the{' '}
              <a 
                href="/terms" 
                className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a 
                href="/privacy" 
                className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
            </label>
          </div>
        </div>
        {error && (
          <p 
            id={`${checkboxId}-error`}
            className="text-sm text-red-600" 
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

TermsCheckbox.displayName = 'TermsCheckbox';
