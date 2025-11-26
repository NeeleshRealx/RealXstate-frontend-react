import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TimezoneSelect from '@/components/ui/TimezoneSelect';
import BranchOpeningHours from './BranchOpeningHours';
import { toast } from 'sonner';
import { 
  MapPin, 
  Clock,
  Phone,
  User,
  Building2,
  Calendar
} from 'lucide-react';
import { Branch, DayHours, OpeningHours } from '@/types/settings';

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch?: Branch | null;
  onSave: (branch: Branch) => Promise<void>;
  isSubmitting?: boolean;
}

const BranchModal: React.FC<BranchModalProps> = ({ 
  isOpen, 
  onClose, 
  branch, 
  onSave, 
  isSubmitting = false 
}) => {
  const [formData, setFormData] = useState<Partial<Omit<Branch, 'opening_hours'>>>({
    name: '',
    address: '',
    timezone: 'UTC',
    phone: '',
    manager: '',
    status: 'active',
  });

  const [openingHours, setOpeningHours] = useState<{ [key: string]: DayHours }>({});
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (branch) {
      setFormData(branch);
      // Convert OpeningHours type to dynamic object format
      if (branch.opening_hours) {
        const convertedHours: { [key: string]: DayHours } = {};
        Object.entries(branch.opening_hours).forEach(([key, value]) => {
          if (key !== 'id' && key !== 'branch_id' && key !== 'created_at' && key !== 'updated_at') {
            convertedHours[key] = value;
          }
        });
        setOpeningHours(convertedHours);
      } else {
        setOpeningHours({});
      }
    } else {
      // Reset form for new branch
      setFormData({
        name: '',
        address: '',
        timezone: 'UTC',
        phone: '',
        manager: '',
        status: 'active',
      });
      setOpeningHours({});
    }
  }, [branch, isOpen]);

  const handleInputChange = (field: keyof Branch, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateAustralianPhone = (phone: string): string | null => {
    if (!phone) return null; // Phone is optional
    
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Australian phone number patterns
    const patterns = [
      /^\+61[2-8]\d{8}$/, // +61 followed by area code (2-8) and 8 digits
      /^0[2-8]\d{8}$/,    // 0 followed by area code (2-8) and 8 digits
      /^61[2-8]\d{8}$/,   // 61 followed by area code (2-8) and 8 digits
    ];
    
    const isValid = patterns.some(pattern => pattern.test(cleaned));
    
    if (!isValid) {
      return 'Please enter a valid Australian phone number (e.g., +61 2 1234 5678 or 02 1234 5678)';
    }
    
    return null;
  };

  const handleOpeningHoursChange = (hours: { [key: string]: DayHours }) => {
    setOpeningHours(hours);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Frontend validation
    const validationErrors: string[] = [];
    
    if (!formData.name || formData.name.trim().length < 2) {
      validationErrors.push('Branch name must be at least 2 characters long');
    }
    
    if (!formData.address || formData.address.trim().length < 10) {
      validationErrors.push('Address must be at least 10 characters long');
    }
    
    if (!formData.timezone) {
      validationErrors.push('Timezone is required');
    }
    
    // Validate phone number
    const phoneError = validateAustralianPhone(formData.phone || '');
    if (phoneError) {
      setValidationErrors(prev => ({ ...prev, phone: phoneError }));
      validationErrors.push(phoneError);
    }
    
    // Validate opening hours - open days must have time slots
    const openDaysWithoutHours = Object.entries(openingHours).filter(([day, hours]) => {
      return hours.is_open && (!hours.time_slots || hours.time_slots.length === 0);
    });

    if (openDaysWithoutHours.length > 0) {
      const dayNames = openDaysWithoutHours.map(([day]) => day.charAt(0).toUpperCase() + day.slice(1));
      validationErrors.push(`Days marked as open must have time slots: ${dayNames.join(', ')}`);
    }
    
    if (validationErrors.length > 0) {
      // Don't show toast for phone validation errors - they're shown inline
      const nonPhoneErrors = validationErrors.filter(error => !error.includes('phone number'));
      if (nonPhoneErrors.length > 0) {
        toast.error(nonPhoneErrors.join('; '));
      }
      return;
    }
    
    try {
      // Convert dynamic openingHours back to OpeningHours type
      const convertedOpeningHours: OpeningHours = {
        // id: branch?.opening_hours?.id || '',
        // branch_id: branch?.opening_hours?.branch_id || branch?.id || '',
        monday: openingHours.monday || { is_open: false, time_slots: [] },
        tuesday: openingHours.tuesday || { is_open: false, time_slots: [] },
        wednesday: openingHours.wednesday || { is_open: false, time_slots: [] },
        thursday: openingHours.thursday || { is_open: false, time_slots: [] },
        friday: openingHours.friday || { is_open: false, time_slots: [] },
        saturday: openingHours.saturday || { is_open: false, time_slots: [] },
        sunday: openingHours.sunday || { is_open: false, time_slots: [] },

      };

      const branchData: Branch = {
        name: formData.name || '',
        address: formData.address || '',
        timezone: formData.timezone || 'UTC',
        phone: formData.phone || '',
        manager: formData.manager || '',
        status: formData.status || 'active',
        opening_hours: convertedOpeningHours,

      };

      await onSave(branchData);
      // Clear validation errors on successful save
      setValidationErrors({});
      // toast.success(branch ? 'Branch updated successfully!' : 'Branch added successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving branch:', error);
      toast.error('Failed to save branch. Please try again.');
    }
  };

  const getOpeningHoursSummary = () => {
    const openDays = Object.entries(openingHours).filter(([_, hours]) => hours.is_open).length;
    const totalDays = 7;
    
    if (openDays === 0) return 'No days open';
    if (openDays === totalDays) return 'Open all days';
    return `Open ${openDays} days`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {branch ? 'Edit Branch' : 'Add New Branch'}
          </DialogTitle>
          <DialogDescription>
            {branch ? 'Update branch information and opening hours' : 'Create a new business location with opening hours'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Branch Details
              </TabsTrigger>
              <TabsTrigger value="hours" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Opening Hours
                {Object.keys(openingHours).length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {getOpeningHoursSummary()}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Branch Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter branch name"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <TimezoneSelect
                    label="Timezone *"
                    value={formData.timezone}
                    onValueChange={(value) => handleInputChange('timezone', value)}
                    placeholder="Select timezone..."
                    showCurrentTime={true}
                    showPopularTimezones={false}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter full address"
                  rows={3}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Contact Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow numbers, spaces, parentheses, hyphens, and plus sign
                      const phoneRegex = /^[\d\s()\-+]*$/;
                      if (phoneRegex.test(value)) {
                        handleInputChange('phone', value);
                      }
                    }}
                    placeholder="+61 2 1234 5678 or 02 1234 5678"
                    className={validationErrors.phone ? 'border-red-500' : ''}
                  />
                  {validationErrors.phone && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.phone}</p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="manager">Manager</Label>
                  <Input
                    id="manager"
                    value={formData.manager}
                    onChange={(e) => handleInputChange('manager', e.target.value)}
                    placeholder="Branch manager name"
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive')}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </TabsContent>

            <TabsContent value="hours" className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Opening Hours Configuration</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Set the weekly schedule for this branch. Toggle days on/off and add time slots for each day.
                    </p>
                  </div>
                </div>
              </div>
              
              <BranchOpeningHours
                value={openingHours}
                onChange={handleOpeningHoursChange}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {branch ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                branch ? 'Update Branch' : 'Add Branch'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BranchModal;
