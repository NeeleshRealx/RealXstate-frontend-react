import React from 'react';
import { Check, Circle } from 'lucide-react';
import { PasswordRequirement } from '@/types/auth';
import { getPasswordStrength, getPasswordStrengthLabel, getPasswordStrengthColor } from '@/utils/passwordValidation';

interface PasswordRequirementsProps {
  requirements: PasswordRequirement[];
  visible: boolean;
  password?: string;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  requirements,
  visible,
  password = ''
}) => {
  if (!visible) return null;

  const strength = getPasswordStrength(password);
  const strengthLabel = getPasswordStrengthLabel(password);
  const strengthColor = getPasswordStrengthColor(password);

  return (
    <div className="mt-2 p-3 bg-gray-50 rounded-md space-y-3">
      {/* Password Strength Indicator - Only show when user has typed something */}
      {password.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Password Strength:</span>
            <span className={`text-sm font-medium ${strengthColor}`}>
              {strengthLabel}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                strength === 0 ? 'bg-red-500 w-0' :
                strength <= 2 ? 'bg-orange-500 w-1/5' :
                strength <= 3 ? 'bg-yellow-500 w-2/5' :
                strength <= 4 ? 'bg-blue-500 w-3/5' :
                'bg-green-500 w-full'
              }`}
            />
          </div>
        </div>
      )}

      {/* Requirements List - Always show when visible */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Password requirements:</p>
        <ul className="space-y-1">
          {requirements.map((requirement, index) => (
            <li key={index} className="flex items-center text-sm">
              {requirement.met ? (
                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
              )}
              <span className={requirement.met ? 'text-green-700 font-medium' : 'text-gray-500'}>
                {requirement.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
