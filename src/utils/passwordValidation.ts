export interface PasswordRequirement {
  met: boolean;
  text: string;
}

export const validatePassword = (password: string): PasswordRequirement[] => {
  return [
    {
      met: password.length >= 8,
      text: 'At least 8 characters'
    },
    {
      met: /[a-z]/.test(password),
      text: 'One lowercase letter'
    },
    {
      met: /[A-Z]/.test(password),
      text: 'One uppercase letter'
    },
    {
      met: /\d/.test(password),
      text: 'One number'
    },
    {
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      text: 'One special character'
    }
  ];
};

export const getPasswordStrength = (password: string): number => {
  const requirements = validatePassword(password);
  return requirements.filter(req => req.met).length;
};

export const getPasswordStrengthLabel = (password: string): string => {
  const strength = getPasswordStrength(password);
  if (strength === 0) return 'Very Weak';
  if (strength <= 2) return 'Weak';
  if (strength <= 3) return 'Fair';
  if (strength <= 4) return 'Good';
  return 'Strong';
};

export const getPasswordStrengthColor = (password: string): string => {
  const strength = getPasswordStrength(password);
  if (strength === 0) return 'text-red-500';
  if (strength <= 2) return 'text-orange-500';
  if (strength <= 3) return 'text-yellow-500';
  if (strength <= 4) return 'text-blue-500';
  return 'text-green-500';
};
