import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, ArrowLeft, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { authenticationService } from '@/services/authenticationService';
import { useAuth } from '@/context/AuthContext';
import { getStoredAuthData } from '@/utils/authUtils';

const OtpVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, login } = useAuth();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // Redirect to signup if no email provided
      navigate('/auth/signup');
    }
  }, [searchParams, navigate]);

  // Monitor authentication state changes and navigate to settings when authenticated
  useEffect(() => {
    if (isAuthenticated && user && success) {
      console.log('[OtpVerification] User became authenticated after verification, navigating to settings...')
      navigate('/settings');
    }
  }, [isAuthenticated, user, success, navigate]);

  // Listen for authentication events from the authentication service
  useEffect(() => {
    const handleAuthEvent = (event: CustomEvent) => {
      console.log('[OtpVerification] Auth event received:', event.detail);
      if (event.detail && event.detail.user) {
        console.log('[OtpVerification] User logged in event received, navigating to settings...');
        navigate('/settings');
      }
    };

    window.addEventListener('userLoggedIn', handleAuthEvent as EventListener);
    
    return () => {
      window.removeEventListener('userLoggedIn', handleAuthEvent as EventListener);
    };
  }, [navigate]);



  // Handle countdown for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Handle OTP input changes
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '');
    if (pastedData.length === 6) {
      const otpArray = pastedData.split('').slice(0, 6);
      setOtp(otpArray);
    }
  };

  // Verify OTP using authenticationService
  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP code');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Get signup data from localStorage
      const pendingSignupData = localStorage.getItem('pendingSignupData');
      let signupData: any = null;
      
      if (pendingSignupData) {
        try {
          signupData = JSON.parse(pendingSignupData);
          console.log('[OtpVerification] Retrieved signup data:', signupData);
        } catch (parseError) {
          console.error('[OtpVerification] Failed to parse signup data:', parseError);
        }
      }

      // Use authenticationService to verify email and complete signup
      if (signupData) {
        // Complete signup flow with backend signup
        const result = await authenticationService.verifyEmail(email, otpString, signupData);
        
        console.log('Email verification and signup result:', result);
        
        // Clear pending signup data from localStorage
        localStorage.removeItem('pendingSignupData');
        
        if (result.success) {
          // User is now signed in with complete account
          console.log('Account created and verified successfully! Welcome!')
          setSuccess(true);
          toast.success('Account created and verified successfully! Welcome!')
          
          // The authentication service has already stored the auth data
          // Let's check if we can get it from cookies and update AuthContext
          console.log('[OtpVerification] Checking for stored auth data...');
          
          // Try to get auth data from cookies and update AuthContext
          const { token, user: userData } = getStoredAuthData();
          
          console.log('[OtpVerification] Token:', token);
          console.log('[OtpVerification] User data:', userData);
          console.log('[OtpVerification] Retrieved auth data:', { 
            hasToken: !!token, 
            hasUser: !!userData, 
            userId: userData?.id, 
            userEmail: userData?.email 
          });
          
          if (token && userData && userData.id && userData.email) {
            console.log('[OtpVerification] Found auth data in cookies, updating AuthContext...');
            login(token, userData);
            
            // Navigate to settings immediately
            console.log('[OtpVerification] Navigating to settings...');
            navigate('/settings');
          } else {
            console.log('[OtpVerification] No auth data found in cookies, waiting for AuthContext to update...');
            
            // Wait a bit for the AuthContext to pick up the changes
            setTimeout(() => {
              console.log('[OtpVerification] Checking authentication state after delay...')
              console.log('[OtpVerification] isAuthenticated:', isAuthenticated, 'user:', user)
              
              if (isAuthenticated && user) {
                console.log('[OtpVerification] User is authenticated, navigating to /settings...')
                navigate('/settings');
              } else {
                console.log('[OtpVerification] User not authenticated, navigating anyway...')
                navigate('/settings');
              }
            }, 1000);
          }
        } else {
          throw new Error(result.message || 'Signup completion failed');
        }
      } else {
        // Just email verification (backward compatibility)
        // Note: This will fail because we now require signupData for the new flow
        // But we keep it for backward compatibility
        console.warn('[OtpVerification] No signup data found, using legacy flow');
        
        // For backward compatibility, we need to handle this differently
        // Since the new verifyEmail requires signupData, we'll redirect to settings
        setSuccess(true);
        toast.success('Email verified successfully! Redirecting you to complete your account setup.');
        
        // Try to check auth from cookies immediately
        console.log('[OtpVerification] Backward compatibility - Checking auth from cookies...');
        const { token, user: userData } = getStoredAuthData();
        
        if (token && userData && userData.id && userData.email) {
          console.log('[OtpVerification] Backward compatibility - Found auth data, updating AuthContext...');
          login(token, userData);
          navigate('/settings');
        } else {
          console.log('[OtpVerification] Backward compatibility - No auth data found, navigating anyway...');
          navigate('/settings');
        }
      }
      
    } catch (error: any) {
      console.error('Email verification failed:', error);
      setError(error.message || 'Email verification failed. Please try again.');
      toast.error(error.message || 'Email verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP using authenticationService
  const handleResendOtp = async () => {
    setIsResending(true);
    setError('');

    try {
      // Use authenticationService to resend verification code
      await authenticationService.resendVerification(email);
      
      console.log('Verification code resent successfully');
      setResendCountdown(60); // Start 60-second countdown
      toast.success('Verification code sent to your email');
      
    } catch (error: any) {
      console.error('Failed to resend verification code:', error);
      setError(error.message || 'Failed to resend verification code');
      toast.error(error.message || 'Failed to resend verification code');
    } finally {
      setIsResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Account Created Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Your email has been verified and your account is now ready to use.
                <br />
                <span className="text-sm text-gray-500">
                  Redirecting you to complete your account setup...
                </span>
              </p>
              <div className="flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm text-gray-500">
                  Redirecting to settings...
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a 6-digit verification code to{' '}
            <span className="font-medium text-gray-900">{email}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* OTP Input Fields */}
          <div className="space-y-4">
            <Label htmlFor="otp-0" className="text-sm font-medium">
              
            </Label>
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 text-center text-lg font-semibold border-2 focus:border-blue-500 focus:ring-blue-500"
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center">
                <XCircle className="h-4 w-4 text-red-500 mr-2" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Verify Button */}
          <Button
            onClick={handleVerifyOtp}
            disabled={isSubmitting || otp.join('').length !== 6}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </Button>

          {/* Resend OTP */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Didn't receive the code?
            </p>
            <Button
              variant="ghost"
              onClick={handleResendOtp}
              disabled={isResending || resendCountdown > 0}
              className="text-blue-600 hover:text-blue-700"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : resendCountdown > 0 ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend in {resendCountdown}s
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend Code
                </>
              )}
            </Button>
          </div>

          {/* Back to Signup */}
          <div className="text-center pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => navigate('/auth/signup')}
              className="text-gray-600 hover:text-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Signup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OtpVerification;
