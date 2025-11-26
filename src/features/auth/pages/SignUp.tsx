import React from 'react';
import { AuthHeader } from '@/components/layout/AuthHeader';
import { AuthFooter } from '@/components/layout/AuthFooter';
import { SignUpForm } from '@/features/auth/components/SignUpForm';

const SignUp: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AuthHeader />
      <SignUpForm />
      <AuthFooter />
    </div>
  );
};

export default SignUp;
