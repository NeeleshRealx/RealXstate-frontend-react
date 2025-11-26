import { z } from 'zod';

export const branchSchema = z.object({
  name: z
    .string()
    .min(2, 'Branch name must be at least 2 characters')
    .max(100, 'Branch name must not exceed 100 characters')
    .regex(/^[a-zA-Z0-9\s&'-]+$/, 'Branch name contains invalid characters'),
  
  address: z
    .string()
    .optional()
    .refine((address) => {
      if (!address || address.trim() === '') return true;
      return address.length >= 10;
    }, 'Address must be at least 10 characters if provided'),
  
  timezone: z
    .string()
    .min(1, 'Please select a timezone'),
  
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
  
  managerId: z
    .string()
    .optional(),
  
  isActive: z
    .boolean()
    .default(true),
});

export type BranchFormData = z.infer<typeof branchSchema>;

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