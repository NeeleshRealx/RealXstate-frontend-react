import React, { useState } from 'react';
import { PasswordInput } from './PasswordInput';
import { PasswordRequirements } from './PasswordRequirements';
import { validatePassword } from '@/utils/passwordValidation';

export const PasswordValidationDemo: React.FC = () => {
  const [password, setPassword] = useState('');
  const passwordRequirements = validatePassword(password);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Password Validation Demo
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Type in the password field below to see real-time validation with green tick icons:
      </p>
      
      <div className="space-y-4">
        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onPasswordChange={setPassword}
        />
        
        <PasswordRequirements
          requirements={passwordRequirements}
          visible={true}
          password={password}
        />
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <h3 className="text-sm font-medium text-blue-900 mb-2">How it works:</h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Type any character to see requirements</li>
          <li>• Add uppercase letter (A-Z) → Green tick appears</li>
          <li>• Add lowercase letter (a-z) → Green tick appears</li>
          <li>• Add number (0-9) → Green tick appears</li>
          <li>• Add special character (!@#$%^&*) → Green tick appears</li>
          <li>• Reach 8+ characters → Green tick appears</li>
        </ul>
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Current Password:</h3>
        <p className="text-xs text-gray-600 font-mono">"{password}"</p>
        <p className="text-xs text-gray-600 mt-1">Length: {password.length}</p>
      </div>
    </div>
  );
};
