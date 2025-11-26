// RealXstate frontend/src/features/auth/components/SignUpForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema } from '@/utils/validation';
import { validatePassword } from '@/utils/passwordValidation';

import { SignUpFormData } from '@/types/auth';
import { FormInput } from './FormInput';
import { PasswordInput } from './PasswordInput';
import { PasswordRequirements } from './PasswordRequirements';
import { TermsCheckbox } from './TermsCheckbox';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api'


export const SignUpForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [signupStep, setSignupStep] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('user'); // Define selectedCategory
 
  // Define roles as categories
  const roles = [
    { id: 'user', name: 'User' },
    { id: 'lawyer', name: 'Lawyer' },
  ];
 
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    setError,
    clearErrors,
    trigger
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange'
  });

  const watchedPassword = watch('password', '');
  const passwordRequirements = validatePassword(watchedPassword);
  

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError('');
      setSignupStep('');
      clearErrors();
      
      const finalData = {
      ...data,
      role: selectedCategory, // Include the selected role
    };
      console.log(finalData,"finalData")
      console.log(selectedCategory,"selectedCategory")


      try {
      const response = await api.post('/signup', finalData);
      toast.success('Signup successful!');
      setTimeout(()=>{
      navigate('/login');
      },3000)

    } catch (error: unknown) {
      console.log(error)
    }
      
      // console.log('Starting signup process for:', data);
      
      // // Step 1: Sign up with Amplify Cognito
      // setSignupStep('Creating account...');
      // console.log('Step 1: Creating Cognito user account...');
      // const cognitoResult = await signUp(data.businessEmail, data.password, {
      //   name: data.businessName,
      //   email: data.businessEmail,
      //   given_name: data.businessName.split(' ')[0] || data.businessName,
      //   family_name: data.businessName.split(' ').slice(1).join(' ') || ''
      // });
      
      // console.log('Cognito signup successful:', cognitoResult);
      
      // // Step 2: Store signup data for backend API call after email verification
      // setSignupStep('Preparing for email verification...');
      // console.log('Step 2: Storing signup data for later backend setup...');
      
      // const signupData = {
      //   businessName: data.businessName,
      //   email: data.businessEmail,
      //   password: data.password,
      //   password_confirmation: data.confirmPassword,
      //   contactPhone: '',
      //   acceptTos: data.agreeToTerms,
      //   timestamp: Date.now()
      // };

      // localStorage.setItem('pendingSignupData', JSON.stringify(signupData));

      // toast.success('Account created successfully! Please check your email for verification.');

      // // Redirect to OTP verification page
      // navigate(`/auth/verify-otp?email=${encodeURIComponent(data.businessEmail)}`);
      
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle Amplify Cognito errors
      if (error.name === 'UsernameExistsException') {
        setError('email', {
          type: 'server',
          message: 'An account with this email already exists. Please login instead.'
        });
        toast.error('Account already exists! Please login to continue.');
        
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else if (error.name === 'InvalidPasswordException') {
        setError('password', {
          type: 'server',
          message: 'Password does not meet Cognito requirements'
        });
      } else if (error.name === 'InvalidParameterException') {
        setSubmitError('Please check your input and try again.');
      } else if (error.name === 'CodeDeliveryFailureException') {
        setSubmitError('Failed to send verification code. Please try again.');
      } else if (error.name === 'LimitExceededException') {
        setSubmitError('Too many signup attempts. Please try again later.');
      } else if (error.name === 'NotAuthorizedException') {
        setSubmitError('Not authorized to perform this action.');
      } else if (error.name === 'ResourceNotFoundException') {
        setSubmitError('Cognito user pool not found. Please contact support.');
      } else if (error.name === 'TooManyRequestsException') {
        setSubmitError('Too many requests. Please try again later.');
      } else if (error.name === 'UserLambdaValidationException') {
        setSubmitError('Custom validation failed. Please check your input.');
      } else if (error.name === 'UserNotConfirmedException') {
        setSubmitError('User account is not confirmed. Please check your email.');
      } else if (error.name === 'UserNotFoundException') {
        setSubmitError('User not found. Please try signing up again.');
      } else if (error.name === 'ValidationException') {
        setSubmitError('Validation error. Please check your input.');
      } else if (error.response?.status === 401) {
        setSubmitError('Authentication failed. Please try again.');
      } else if (error.response?.status === 409) {
        if (error.response.data?.message?.includes('email')) {
          setError('email', {
            type: 'server',
            message: 'An account with this email already exists in our system'
          });
        } else {
          setSubmitError(error.response.data?.message || 'Account already exists in our system');
        }
      } else if (error.response?.status === 422) {
        // Validation errors from backend
        const errors = error.response.data?.errors;
        if (errors) {
          Object.keys(errors).forEach(field => {
            if (field === 'businessName') {
              setError('name', {
                type: 'server',
                message: errors[field][0]
              });
            } else if (field === 'email') {
              setError('email', {
                type: 'server',
                message: errors[field][0]
              });
            } else if (field === 'password') {
              setError('password', {
                type: 'server',
                message: errors[field][0]
              });
            }
          });
        } else {
          setSubmitError('Please check your input and try again.');
        }
      } else if (error.message?.includes('already exists')) {
        setError('email', {
          type: 'server',
          message: 'An account with this email already exists'
        });
      } else if (error.message?.includes('password')) {
        setError('password', {
          type: 'server',
          message: 'Password does not meet requirements'
        });
      } else if (error.message?.includes('validation')) {
        setSubmitError('Please check your input and try again.');
      } else {
        setSubmitError(error.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
      setSignupStep('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Create Your Account
              </h2>
              <p className="text-gray-600">
                Join our platform and start managing your AI services
              </p>
              {/* <p className="text-xs text-gray-500 mt-2">
                This will create your account. Backend setup will happen after email verification.
              </p> */}
            </div>

            <form 
              onSubmit={(e) => {
                handleSubmit(onSubmit)(e);
              }} 
              className="space-y-6" 
              noValidate
            >
              <FormInput
                {...register('name')}
                label="Name"
                type="text"
                placeholder="Enter your name"
                error={errors.name?.message}
                autoComplete="organization"
              />

              <FormInput
                {...register('email')}
                label="Email"
                type="email"
                placeholder="you@email.com"
                error={errors.email?.message}
                autoComplete="email"
              />
              <select
                {...register('role')}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {/* <option value="">All Categories</option> */}
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <div>
                  {selectedCategory==="lawyer" && (
                    <div>
               <FormInput
                {...register('experienceYears')}
                label="Expierence Years"
                type="number"
                placeholder="Enter your Expierence Years"
                error={errors.experienceYears?.message}
                autoComplete="organization"
              />

              <FormInput
                {...register('barCouncilId')}
                label="Bar council Id"
                type="number"
                placeholder="Enter your Bar council Id"
                error={errors.email?.message}
                autoComplete="email"
              />
              </div>
              )}
                </div>

              <div>
                <PasswordInput
                  {...register('password')}
                  label="Password"
                  placeholder="Create a secure password"
                  error={errors.password?.message}
                  onPasswordChange={(value) => {}}
                  autoComplete="new-password"
                />
                <PasswordRequirements
                  requirements={passwordRequirements}
                  visible={true}
                  password={watchedPassword}
                />
              </div>

              <PasswordInput
                {...register('confirmPassword')}
                label="Confirm Password"
                placeholder="Confirm your password"
                error={errors.confirmPassword?.message}
                autoComplete="new-password"
              />

              <TermsCheckbox
                {...register('agreeToTerms')}
                error={errors.agreeToTerms?.message}
                id="agreeToTerms"
              />

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
                onClick={async () => {
                  const isFormValid = await trigger();
                }}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    {signupStep || 'Creating Account...'}
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a 
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  Log in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
