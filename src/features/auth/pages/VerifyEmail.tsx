import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { EmailVerificationStatus } from '@/features/auth/components/EmailVerificationStatus';
import { useAuth } from '@/context/AuthContext';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { confirmSignUp } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isCustomFlow, setIsCustomFlow] = useState(false);

  useEffect(() => {
    const username = searchParams.get('username');
    const code = searchParams.get('code');
    const emailParam = searchParams.get('email');
    const customParam = searchParams.get('custom');

    if (emailParam) {
      setEmail(emailParam);
    }

    if (customParam === 'true') {
      setIsCustomFlow(true);
      setStatus('pending');
      setMessage('Please check your email for the verification link. Click the link in your email to complete your account setup.');
    } else if (username && code) {
      handleVerification(username, code);
    } else {
      setStatus('pending');
      setMessage('Please check your email for the verification link.');
    }
  }, [searchParams]);

  const handleVerification = async (username: string, code: string) => {
    try {
      setStatus('loading');
      setMessage('Verifying your email address...');
      
      // Confirm signup with Cognito (existing flow)
      await confirmSignUp(username, code);
      
      setStatus('success');
      setMessage('Email verified successfully! You can now log in to your account.');
      
      // Redirect to login after successful verification
      setTimeout(() => {
        navigate('login');
      }, 2000);
      
    } catch (error: any) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('Verification failed. Please check your verification code and try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <EmailVerificationStatus
            status={status}
            message={message}
            email={email}
          />
          
          {isCustomFlow && status === 'pending' && (
            <div className="mt-6 space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-700">
                  <strong>Custom Verification Flow:</strong> When you click the verification link in your email, 
                  it will automatically set up your account in our database and redirect you to the success page.
                </p>
              </div>
              <button
                onClick={() => navigate('/auth/signup')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Resend verification email
              </button>
              <button
                onClick={() => navigate('login')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to login
              </button>
            </div>
          )}
          
          {!isCustomFlow && status === 'error' && (
            <div className="mt-6">
              <button
                onClick={() => navigate('/auth/signup')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Sign Up
              </button>
            </div>
          )}
          
          {!isCustomFlow && status === 'pending' && (
            <div className="mt-6 space-y-3">
              <button
                onClick={() => navigate('/auth/signup')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Resend verification email
              </button>
              <button
                onClick={() => navigate('login')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
