import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Upload, Save, ImageIcon, Trash2, CheckCircle, AlertCircle, FileImage, Mail, Phone, MapPin, FileText } from 'lucide-react';
import { BusinessProfile as BusinessProfileType } from '@/types/settings';
import { businessProfileService } from '@/services';
import { toast } from 'sonner';

interface BusinessProfileProps {
  profile?: BusinessProfileType;
  onSave?: (profile: BusinessProfileType) => void;
}

const BusinessProfile: React.FC<BusinessProfileProps> = ({ profile, onSave }) => {
  const [formData, setFormData] = useState<Partial<BusinessProfileType>>({
    name: profile?.name || '',
    contact_email: profile?.contact_email || '',
    contact_phone: profile?.contact_phone || '',
    address: profile?.address || '',
    description: profile?.description || '',
    slug: profile?.slug || '',
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>(profile?.logo_url || '');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Australian phone number validation and formatting
  const validatePhoneNumber = (phone: string): { isValid: boolean; error: string; formatted: string } => {
    if (!phone.trim()) {
      return { isValid: true, error: '', formatted: '' };
    }

    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Australian phone number validation
    // Mobile: 04XX XXX XXX (10 digits starting with 04)
    // Landline: 0X XXXX XXXX (10 digits starting with 02, 03, 07, 08)
    // With country code: +61 4XX XXX XXX or +61 X XXXX XXXX
    
    let isValid = false;
    let formatted = phone;
    
    if (digitsOnly.length === 10) {
      // 10-digit Australian number
      if (digitsOnly.startsWith('04')) {
        // Mobile: 04XX XXX XXX
        formatted = `${digitsOnly.slice(0, 4)} ${digitsOnly.slice(4, 7)} ${digitsOnly.slice(7)}`;
        isValid = true;
      } else if (digitsOnly.startsWith('02') || digitsOnly.startsWith('03') || 
                 digitsOnly.startsWith('07') || digitsOnly.startsWith('08')) {
        // Landline: 0X XXXX XXXX
        formatted = `${digitsOnly.slice(0, 2)} ${digitsOnly.slice(2, 6)} ${digitsOnly.slice(6)}`;
        isValid = true;
      }
    } else if (digitsOnly.length === 11 && digitsOnly.startsWith('61')) {
      // 11-digit with country code
      const withoutCountryCode = digitsOnly.slice(2);
      if (withoutCountryCode.startsWith('4')) {
        // Mobile: +61 4XX XXX XXX
        formatted = `+61 ${withoutCountryCode.slice(0, 3)} ${withoutCountryCode.slice(3, 6)} ${withoutCountryCode.slice(6)}`;
        isValid = true;
      } else if (withoutCountryCode.startsWith('2') || withoutCountryCode.startsWith('3') || 
                 withoutCountryCode.startsWith('7') || withoutCountryCode.startsWith('8')) {
        // Landline: +61 X XXXX XXXX
        formatted = `+61 ${withoutCountryCode.slice(0, 1)} ${withoutCountryCode.slice(1, 5)} ${withoutCountryCode.slice(5)}`;
        isValid = true;
      }
    } else if (digitsOnly.length === 9 && (digitsOnly.startsWith('4') || 
               digitsOnly.startsWith('2') || digitsOnly.startsWith('3') || 
               digitsOnly.startsWith('7') || digitsOnly.startsWith('8'))) {
      // 9-digit without leading 0 (assume mobile or landline)
      if (digitsOnly.startsWith('4')) {
        // Mobile: 4XX XXX XXX
        formatted = `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6)}`;
        isValid = true;
      } else {
        // Landline: X XXXX XXXX
        formatted = `${digitsOnly.slice(0, 1)} ${digitsOnly.slice(1, 5)} ${digitsOnly.slice(5)}`;
        isValid = true;
      }
    }
    
    if (!isValid) {
      return { 
        isValid: false, 
        error: 'Please enter a valid Australian phone number (e.g., 0412 345 678 or 02 1234 5678)', 
        formatted: phone 
      };
    }

    return { isValid: true, error: '', formatted };
  };

  // Load business profile data on component mount
  useEffect(() => {
    const loadBusinessProfile = async () => {
      try {
        const response = await businessProfileService.getProfile();
        if (response.success && response.data) {
          const profileData = response.data;
          setFormData({
            name: profileData.name || '',
            contact_email: profileData.contact_email || '',
            contact_phone: profileData.contact_phone || '',
            address: profileData.address || '',
            description: profileData.description || '',
            slug: profileData.slug || '',
          });
          if (profileData.logo_url) {
            setLogoPreview(profileData.logo_url || '');
          }
        }
      } catch (error) {
        console.error('Error loading business profile:', error);
        toast.error('Failed to load business profile');
      }
    };

    loadBusinessProfile();
  }, []);

  const handleInputChange = (field: keyof BusinessProfileType, value: string) => {
    // Handle phone number validation and formatting
    if (field === 'contact_phone') {
      const validation = validatePhoneNumber(value);
      setPhoneError(validation.error);
      
      if (validation.isValid) {
        setFormData((prev: Partial<BusinessProfileType>) => ({ ...prev, [field]: validation.formatted }));
      } else {
        setFormData((prev: Partial<BusinessProfileType>) => ({ ...prev, [field]: value }));
      }
    } else {
      setFormData((prev: Partial<BusinessProfileType>) => ({ ...prev, [field]: value }));
    }
    
    // Auto-generate URL slug from business name
    if (field === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData((prev: Partial<BusinessProfileType>) => ({ ...prev, urlSlug: slug }));
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (5MB = 5 * 1024 * 1024 bytes)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      
      if (file.size > maxSize) {
        toast.error('Logo file size must be less than 5MB');
        // Reset the input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPG, PNG, or SVG)');
        // Reset the input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      setLogo(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      toast.success('Logo selected successfully');
    }
  };

  const removeLogo = () => {
    setLogo(null);
    setLogoPreview('');
    
    // Reset the file input to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number before submission
    if (formData.contact_phone) {
      const validation = validatePhoneNumber(formData.contact_phone);
      if (!validation.isValid) {
        setPhoneError(validation.error);
        toast.error(validation.error);
        return;
      }
    }
    
    setIsLoading(true);
    
    try {
      // First upload logo if there's a new one
      let logoUrl = logoPreview;
      if (logo) {
        try {
          const logoResponse = await businessProfileService.uploadLogo(logo);
          if (logoResponse.success && logoResponse.data) {
            logoUrl = logoResponse.data.logo_url;
          }
        } catch (error) {
          console.error('Error uploading logo:', error);
          toast.error('Failed to upload logo');
        }
      }

      // Update business profile
      const updateData = {
        name: formData.name || '',
        contact_email: formData.contact_email || '',
        contact_phone: formData.contact_phone || '',
        address: formData.address || '',
        description: formData.description || '',
        website: formData.website || '',
        city: formData.city || '',
        state: formData.state || '',
        country: formData.country || '',
        postal_code: formData.postal_code || '',
        business_hours: formData.business_hours || {},
        social_links: formData.social_links || {},
      };

      const response = await businessProfileService.updateProfile(updateData);
      
      if (response.success) {
        // Update local state with new data
        const updatedProfile: BusinessProfileType = {
          id: profile?.id || '1',
          name: formData.name || '',
          contact_email: formData.contact_email || '',
          contact_phone: formData.contact_phone || '',
          address: formData.address || '',
          description: formData.description || '',
          slug: formData.slug || '',
          logo_url: logoUrl,
        };
        
        // Let the parent component handle the success toast
        onSave?.(updatedProfile);
      } else {
        toast.error(response.message || 'Failed to update business profile');
      }
    } catch (error) {
      console.error('Error saving business profile:', error);
      toast.error('Failed to save business profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* <div>
        <h1 className="text-3xl font-bold tracking-tight">Business Profile</h1>
        <p className="text-muted-foreground">
          Manage your business information and branding
        </p>
      </div> */}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Business Information */}
          <Card className="border-2 border-gray-200 hover:border-gray-300 transition-colors">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
                Business Information
              </CardTitle>
              <CardDescription className="text-sm">
                Manage your business details and contact information for customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Business Name *
                </Label>
                <div className="relative">
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your business name"
                    className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              {/* Contact Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Contact Email *
                  </Label>
                  <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  placeholder="business@example.com"
                      className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
              </div>
              
                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Contact Phone
                  </Label>
                  <div className="relative">
                <Input
                  id="phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  placeholder="0412 345 678 or 02 1234 5678"
                      className={`pl-10 h-11 border-gray-300 focus:ring-blue-500 ${
                        phoneError 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : 'focus:border-blue-500'
                      }`}
                    />
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                {phoneError && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-700">{phoneError}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Australian format: mobile (04XX XXX XXX) or landline (0X XXXX XXXX)
                  </p>
                </div>
              </div>
              
              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">
                  Business Address
                </Label>
                <div className="relative">
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your complete business address"
                  rows={3}
                    className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                />
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              {/* Business Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Business Description
                </Label>
                <div className="relative">
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your business, services, and what makes you unique"
                    rows={4}
                    className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                />
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500">
                  Help customers understand your business better
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Logo Upload */}
          <Card className="border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ImageIcon className="h-5 w-5 text-blue-600" />
                Business Logo
              </CardTitle>
              <CardDescription className="text-sm">
                Upload your professional business logo to enhance your brand presence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Preview Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Logo Preview */}
                <div className="flex-shrink-0">
                {logoPreview ? (
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-xl border-2 border-gray-200 overflow-hidden bg-white shadow-sm">
                    <img
                      src={logoPreview}
                          alt="Business logo preview"
                          className="w-full h-full object-cover"
                    />
                      </div>
                      {/* Remove button */}
                    <button
                      type="button"
                      onClick={removeLogo}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                        title="Remove logo"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                      {/* Success indicator */}
                      <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                  </div>
                ) : (
                    <div 
                      className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                      title="Click to upload logo"
                    >
                      <FileImage className="w-8 h-8 mb-2" />
                      <span className="text-xs font-medium">No logo</span>
                  </div>
                )}
                </div>

                {/* Upload Section */}
                <div className="flex-1 space-y-4">
                  {/* Upload Button */}
                  <div className="space-y-2">
                    <Label 
                      htmlFor="logo" 
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
                    >
                      <Upload className="w-4 h-4" />
                      {logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </Label>
                  <Input
                    ref={fileInputRef}
                    id="logo"
                    type="file"
                      accept="image/jpeg,image/jpg,image/png,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                    />
                  </div>

                  {/* File Information */}
                  <div className="space-y-2">
                    {logo ? (
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-green-800 truncate">
                            {logo.name}
                          </p>
                          <p className="text-xs text-green-600">
                            {formatFileSize(logo.size)} • Ready to upload
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-600">
                          No file selected
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Requirements */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-gray-600">
                        <p className="font-medium mb-1">Requirements:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Maximum file size: 5MB</li>
                          <li>• Supported formats: JPG, PNG, SVG</li>
                          <li>• Recommended dimensions: 512×512px</li>
                          <li>• Square aspect ratio preferred</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drag and Drop Zone (Hidden but accessible) */}
              <div 
                className="hidden sm:block border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                  const files = e.dataTransfer.files;
                  if (files.length > 0) {
                    const file = files[0];
                    // Create a proper file input event
                    const mockEvent = {
                      target: { files: [file] },
                      preventDefault: () => {},
                      stopPropagation: () => {}
                    } as unknown as React.ChangeEvent<HTMLInputElement>;
                    handleLogoUpload(mockEvent);
                  }
                }}
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    Your logo will appear here once uploaded
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* URL Settings */}
          {/* <Card>
            <CardHeader>
              <CardTitle>URL Settings</CardTitle>
              <CardDescription>
                Customize your business URL slug
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="urlSlug">URL Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">weaver.com/</span>
                  <Input
                    id="urlSlug"
                    value={formData.urlSlug}
                    onChange={(e) => handleInputChange('urlSlug', e.target.value)}
                    placeholder="your-business-name"
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  This will be your unique business URL
                </p>
              </div>
            </CardContent>
          </Card> */}

          {/* Save Button */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <h3 className="font-medium text-gray-900">Ready to save your changes?</h3>
                  <p className="text-sm text-gray-600">
                    Your business profile will be updated with the new information
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="border-gray-300 hover:bg-gray-50"
                  >
              Cancel
            </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading || !!phoneError}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                  >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default BusinessProfile;
