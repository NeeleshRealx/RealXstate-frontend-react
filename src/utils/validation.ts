import { z } from 'zod';

export const loginSchema = z.object({
  businessEmail: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(1, 'Password is required'),
  rememberMe: z
    .boolean()
    .optional()
    .default(false),
});

export const signUpSchema = z.object({
  name: z
    .string()
    .min(2, 'name must be at least 2 characters')
    .max(100, 'Business name must not exceed 100 characters'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, 'You must accept the terms and conditions'),
    role: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const businessProfileSchema = z.object({
  businessName: z
    .string()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name must not exceed 100 characters')
    .max(100, 'Business name must not exceed 100 characters')
    .regex(/^[a-zA-Z0-9\s&'.,()-]+$/, 'Business name contains invalid characters'),
  
  businessSlug: z
    .string()
    .min(2, 'Business slug must be at least 2 characters')
    .max(50, 'Business slug must not exceed 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .refine((slug) => !slug.startsWith('-') && !slug.endsWith('-'), {
      message: 'Slug cannot start or end with a hyphen'
    }),
  
  contactEmail: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Contact email is required'),
  
  contactPhone: z
    .string()
    .optional()
    .transform((phone) => {
      if (!phone || phone.trim() === '') return phone;
      return cleanPhoneNumber(phone);
    })
    .refine((phone) => {
      if (!phone || phone.trim() === '') return true;
      // Validate cleaned phone number format
      const phoneRegex = /^\+61\d{9}$/; // Australian format: +61 + 9 digits
      return phoneRegex.test(phone);
    }, 'Please enter a valid Australian phone number (e.g., 0412 345 678 or +61 412 345 678)'),
});

export type BusinessProfileFormData = z.infer<typeof businessProfileSchema>;

/**
 * Clean and format phone number for Australian format.
 */
function cleanPhoneNumber(phone: string): string {
  // Remove all non-digit characters except + (for country code)
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Handle Australian phone numbers
  if (cleaned.startsWith('61')) {
    // Convert 61 to +61
    cleaned = '+' + cleaned;
  } else if (cleaned.startsWith('0') && !cleaned.startsWith('+')) {
    // Convert 0 to +61 for Australian numbers
    cleaned = '+61' + cleaned.substring(1);
  } else if (!cleaned.startsWith('+')) {
    // If no country code, assume Australian and add +61
    cleaned = '+61' + cleaned;
  }
  
  return cleaned;
}