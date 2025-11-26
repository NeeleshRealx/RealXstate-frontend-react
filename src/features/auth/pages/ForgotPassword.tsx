import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticationService } from '@/services/authenticationService';
import { toast } from 'sonner';
import { MessageCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PasswordRequirements } from '@/features/auth/components/PasswordRequirements';
import { validatePassword } from '@/utils/passwordValidation';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState(validatePassword(''));

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authenticationService.forgotPassword(email);
      if (response.success) {
        toast.success(response.message);
        setShowOtpSection(true);
        setResendCountdown(60); // Start 60-second countdown for resend
      } else {
        console.log('[ForgotPassword] Password reset failed, showing error toast:', response.message);
        toast.error(response.message);
      }
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast.error(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }

    if (otp.length < 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error('Please enter both passwords');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate password requirements
    const requirements = validatePassword(newPassword);
    const unmetRequirements = requirements.filter(req => !req.met);
    
    if (unmetRequirements.length > 0) {
      toast.error('Please meet all password requirements');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authenticationService.forgotPasswordSubmit(email, otp, newPassword);
      if (response.success) {
        toast.success(response.message);
        navigate('/login');
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle countdown for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Resend OTP function
  const handleResendOTP = async () => {
    setIsResending(true);
    
    try {
      const response = await authenticationService.forgotPassword(email);
      if (response.success) {
        toast.success('Verification code sent to your email');
        setResendCountdown(60); // Start 60-second countdown
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      console.error('Error resending OTP:', error);
      toast.error(error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleBackToEmail = () => {
    setShowOtpSection(false);
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordRequirements(validatePassword(''));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">ServAI</h1>
              <p className="text-sm text-gray-500 mb-6">Merchant Portal</p>
              <h2 className="text-xl font-medium text-gray-900 mb-2">
                Forgot Password
              </h2>
              <p className="text-sm text-gray-600">
                {!showOtpSection 
                  ? "Enter your email address and we'll send you a verification code."
                  : "Enter the verification code and your new password."
                }
              </p>
            </div>

            <form onSubmit={showOtpSection ? handleResetPassword : handleSendOTP} className="space-y-6" noValidate>
              {/* Email Section - Always visible */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={showOtpSection}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="yourname@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* OTP Section - Visible after email is sent */}
              {showOtpSection && (
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    autoComplete="one-time-code"
                    required
                    maxLength={6}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm text-center text-lg tracking-widest"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                  
                  {/* Resend OTP Section */}
                  <div className="text-center mt-3">
                    <p className="text-sm text-gray-600 mb-2">
                      Didn't receive the code?
                    </p>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isResending || resendCountdown > 0}
                      className="text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {isResending ? (
                        <div className="flex items-center justify-center">
                          <LoadingSpinner size="sm" className="mr-2" />
                          Sending...
                        </div>
                      ) : resendCountdown > 0 ? (
                        <div className="flex items-center justify-center">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Resend in {resendCountdown}s
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Resend Code
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Password Section - Visible after OTP is sent */}
              {showOtpSection && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        className="appearance-none rounded-lg relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPasswordRequirements(validatePassword(e.target.value));
                        }}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <PasswordRequirements
                    requirements={passwordRequirements}
                    visible={newPassword.length > 0}
                    password={newPassword}
                  />

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        className="appearance-none rounded-lg relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  isLoading || 
                  !email ||
                  (showOtpSection && (
                    !otp || 
                    otp.length !== 6 ||
                    !newPassword || 
                    !confirmPassword || 
                    newPassword !== confirmPassword ||
                    passwordRequirements.some(req => !req.met)
                  ))
                }
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    {showOtpSection ? 'Resetting Password...' : 'Sending OTP...'}
                  </div>
                ) : (
                  showOtpSection ? 'Reset Password' : 'Send OTP'
                )}
              </button>

              {/* Back to Login */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1"
                >
                  Back to Login
                </button>
              </div>

              {/* Back to Email - Only show when OTP section is visible */}
              {showOtpSection && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleBackToEmail}
                    className="text-sm text-gray-600 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded px-1"
                  >
                    ← Back to Email
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
