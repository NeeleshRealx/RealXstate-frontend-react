import React from 'react';
import { CheckCircle, XCircle, Mail } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface EmailVerificationStatusProps {
  status: 'loading' | 'success' | 'error' | 'pending';
  message: string;
  email?: string;
}

export const EmailVerificationStatus: React.FC<EmailVerificationStatusProps> = ({
  status,
  message,
  email
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <LoadingSpinner size="lg" className="text-blue-600" />;
      case 'success':
        return (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        );
      case 'error':
        return (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        );
      case 'pending':
      default:
        return (
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
        );
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      case 'loading':
        return 'text-blue-700';
      case 'pending':
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        {getStatusIcon()}
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">
          {status === 'loading' && 'Verifying your email...'}
          {status === 'success' && 'Email verified!'}
          {status === 'error' && 'Verification failed'}
          {status === 'pending' && 'Verify your email'}
        </h2>
        
        <div className={`text-sm ${getStatusColor()}`}>
          {status === 'pending' && email && (
            <p>
              We've sent a confirmation link to{' '}
              <span className="font-medium text-gray-900">{email}</span>.{' '}
              Please check your inbox to activate your account.
            </p>
          )}
          {status !== 'pending' && (
            <p role="status" aria-live="polite">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
