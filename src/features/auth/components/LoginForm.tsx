import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/utils/validation';
import { LoginFormData } from '@/types/auth';
import { FormInput } from './FormInput';
import { PasswordInput } from './PasswordInput';
import { RememberMeCheckbox } from './RememberMeCheckbox';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { MessageCircle,House } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContextRealxstate';
import api from '@/lib/api'


export const LoginForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    setFocus
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      rememberMe: false
    }
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log('[LoginForm] User is already authenticated, redirecting to /settings');
      navigate('/settings', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Auto-focus on email field when component mounts
  useEffect(() => {
    if (!isAuthenticated) {
      setFocus('businessEmail');
    }
  }, [setFocus, isAuthenticated]);


  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError('');
      clearErrors();
      console.log(data,"data")
      const finalData={
        email:data.businessEmail,
        password:data.password
      }
      try {
        const response = await api.post('/login', finalData,{withCredentials:true});
        console.log(response,"response")
        if (response.status === 200) {
          login(response.data, finalData);
          toast.success(response.data)
           navigate('/dashboard');
        }
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          setSubmitError('The requested resource was not found. Please check the URL and try again.');
          toast.error(error.response.data);
        }
        console.log(error)
      }
      // For development, use the development token
      // if (import.meta.env.DEV && data.businessEmail === 'dev@serv-ai.com') {
      //   console.log('[LoginForm] Development mode - using dev token');
        
      //   // Create development user data
      //   const devUser = {
      //     id: 'dev-user-id',
      //     name: 'Development User',
      //     email: data.businessEmail || 'dev@serv-ai.com',
      //     role: 'owner',
      //     business_id: 'dev-business-id'
      //   };

      //   const devToken = 'gRlb521USWkIsnLU8sFF0uYrwk70jQn6EY0mp0WNW0vuoOm3PNbTk9A2g0wsthiIRu0wf73H4XbH3IBu';
        
      //   // Login with development token
      //   login(devToken, devUser);
        
      //   toast.success('Development login successful!');
      //   return;
      // }

      
      // Use the Amplify-based login flow
      // await loginWithEmail(data.businessEmail, data.password);
      
      
      // Add a small delay to ensure authentication state is properly set
      setTimeout(() => {
        console.log('[LoginForm] Redirecting to dashboard...');
        navigate('/settings');
      }, 100);
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle Amplify Cognito errors
      if (error.name === 'UserNotConfirmedException') {
        setSubmitError('Please verify your email address before logging in.');
      } else if (error.name === 'NotAuthorizedException') {
        setSubmitError('Invalid email or password. Please check your credentials and try again.');
      } else if (error.name === 'UserNotFoundException') {
        setSubmitError('No account found with this email address.');
      } else if (error.name === 'TooManyRequestsException') {
        setSubmitError('Too many failed attempts. Please try again later.');
      } else if (error.name === 'LimitExceededException') {
        setSubmitError('Too many login attempts. Please try again later.');
      } else if (error.name === 'PasswordResetRequiredException') {
        setSubmitError('Password reset required. Please reset your password.');
      } else if (error.name === 'UserLambdaValidationException') {
        setSubmitError('Login validation failed. Please try again.');
      } else if (error.message?.includes('Invalid credentials')) {
        setSubmitError('Invalid email or password. Please check your credentials and try again.');
      } else if (error.message?.includes('User not found')) {
        setSubmitError('No account found with this email address.');
      } else if (error.message?.includes('Too many requests')) {
        setSubmitError('Too many failed attempts. Please try again later.');
      } else if (error.message?.includes('Server error')) {
        setSubmitError('Server error. Please try again later.');
      } else {
        setSubmitError(error.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };



  // Demo account login
  const handleDemoLogin = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError('');
      
      // Use demo credentials for testing
      await loginWithEmail('demo@serv-ai.com', 'demo123456');
      
      toast.success('Welcome to Harbour View Bistro demo!');
      
      // Add a small delay to ensure authentication state is properly set
      setTimeout(() => {
        console.log('[LoginForm] Redirecting to dashboard for demo...');
        navigate('/settings');
      }, 100);
    } catch (error: any) {
      console.error('Demo login error:', error);
      setSubmitError('Failed to access demo account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading spinner while checking authentication status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p className="text-gray-600">Checking authentication status...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <House className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">RealXstate</h1>
              {/* <p className="text-sm text-gray-500 mb-6">Merchant Portal</p> */}
              <h2 className="text-xl font-medium text-gray-900">
                Log in to your account
              </h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <FormInput
                {...register('businessEmail')}
                label="Email"
                type="email"
                placeholder="yourname@business.com"
                error={errors.businessEmail?.message}
                autoComplete="email"
                autoFocus
              />

              <PasswordInput
                {...register('password')}
                label="Password"
                placeholder="Enter your password"
                error={errors.password?.message}
                autoComplete="current-password"
              />

              <div className="flex items-center justify-between">
                <RememberMeCheckbox
                  {...register('rememberMe')}
                  id="rememberMe"
                />
                <button 
                  type="button"
                  onClick={() => navigate('/auth/forgot-password')}
                  className="text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1"
                >
                  Forgot your password?
                </button>
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600" role="alert">
                    {submitError}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Logging in...
                  </div>
                ) : (
                  'Login'
                )}
              </button>



              {/* Demo account login button */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              {/* <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-3 px-4 border border-blue-300 rounded-lg shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Loading demo...
                  </div>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Try Demo - Harbour View Bistro
                  </>
                )}
              </button> */}

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button 
                    type="button"
                    onClick={() => navigate('/auth/signup')}
                    className="font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
