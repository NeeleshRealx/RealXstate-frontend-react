import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Eye, EyeOff, Save, X, Upload, Trash2, Clock, MapPin, Globe, Smartphone, Monitor, Tablet, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Breadcrumbs from '@/features/settings/components/Breadcrumbs';
import { useAuth } from '@/context/AuthContext';
import { userService, UserProfile, UpdateUserProfileData, PasswordChangeData, LoginHistoryEntry } from '@/services/userService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { validatePassword as validatePasswordRequirements, getPasswordStrength, getPasswordStrengthLabel, getPasswordStrengthColor } from '@/utils/passwordValidation';
import TimezoneSelect from '@/components/ui/TimezoneSelect';

const AccountSettingsPage = () => {
  const { user: authUser, updateUser } = useAuth();
  
  // State management
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // UI state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [phoneError, setPhoneError] = useState('');
  
  // Profile image state
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');

  const breadcrumbItems = [
    { label: 'Settings', path: '/settings' },
    { label: 'Account Settings' },
  ];

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Clear password fields on component mount to prevent browser autofill
  useEffect(() => {
    setPasswordData({
      current_password: '',
      new_password: '',
      new_password_confirmation: ''
    });
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const [profileResponse, loginHistoryResponse, twoFactorResponse] = await Promise.all([
        userService.getCurrentUser(),
        userService.getLoginHistory(),
        userService.getTwoFactorStatus()
      ]);

      if (profileResponse.success && profileResponse.data) {
        setProfile(profileResponse.data);
        setProfileImagePreview(profileResponse.data.profile_image_url || '');
      }

      if (loginHistoryResponse.success && loginHistoryResponse.data) {
        setLoginHistory(loginHistoryResponse.data.data);
      }

      if (twoFactorResponse.success && twoFactorResponse.data) {
        setTwoFactorEnabled(twoFactorResponse.data.enabled);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (field: keyof UpdateUserProfileData, value: string) => {
    if (!profile) return;
    
    setProfile(prev => prev ? { ...prev, [field]: value } : null);
    
    // Clear field-specific errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Validate phone number in real-time
    if (field === 'phone') {
      const validation = userService.validatePhoneNumber(value);
      setPhoneError(validation.error);
      if (validation.isValid) {
        setProfile(prev => prev ? { ...prev, phone: validation.formatted } : null);
      }
    }
  };

  const handlePasswordChange = (field: keyof PasswordChangeData, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateProfile = (): boolean => {
    if (!profile) return false;
    
    const newErrors: { [key: string]: string } = {};

    if (!profile.full_name?.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    if (!profile.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (profile.phone && phoneError) {
      newErrors.phone = phoneError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!passwordData.current_password) {
      newErrors.current_password = 'Current password is required';
    }
    
    if (!passwordData.new_password) {
      newErrors.new_password = 'New password is required';
    } else {
      // Use comprehensive password validation like business settings
      const passwordRequirements = validatePasswordRequirements(passwordData.new_password);
      const unmetRequirements = passwordRequirements.filter(req => !req.met);
      
      if (unmetRequirements.length > 0) {
        newErrors.new_password = 'Password must meet all requirements';
      } else if (passwordData.new_password.length < 8) {
        newErrors.new_password = 'Password must be at least 8 characters long';
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.new_password)) {
        newErrors.new_password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      }
    }
    
    if (!passwordData.new_password_confirmation) {
      newErrors.new_password_confirmation = 'Please confirm your new password';
    } else if (passwordData.new_password !== passwordData.new_password_confirmation) {
      newErrors.new_password_confirmation = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!profile || !validateProfile()) return;

    try {
      setIsSaving(true);
      const updateData: UpdateUserProfileData = {
        full_name: profile.full_name,
        phone: profile.phone,
        location: profile.location,
        timezone: profile.timezone
      };

      const response = await userService.updateProfile(updateData);
      
      if (response.success && response.data) {
        setProfile(response.data);
        updateUser({
          name: response.data.full_name,
          email: response.data.email
        });
        // setSuccessMessage('Profile updated successfully!');
        toast.success('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    try {
      setIsChangingPassword(true);
      const response = await userService.changePassword(passwordData);
      
      if (response.success) {
        setSuccessMessage('Password changed successfully!');
        setPasswordData({
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        });
        setErrors({}); // Clear any validation errors
        toast.success('Password updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('Failed to change password:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setIsUploadingImage(true);
      
      // Upload to S3
      const response = await userService.uploadProfileImage(file);
      
      if (response.success && response.data) {
        // Update profile with new image URL
        const updateData: UpdateUserProfileData = {
          profile_image_url: response.data.image_url
        };
        
        const updateResponse = await userService.updateProfile(updateData);
        
        if (updateResponse.success && updateResponse.data) {
          setProfile(updateResponse.data);
          setProfileImagePreview(updateResponse.data.profile_image_url || '');
          toast.success('Profile image updated successfully!');
        }
      } else {
        throw new Error(response.message || 'Failed to upload image');
      }
    } catch (error: any) {
      console.error('Failed to upload image:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!profile) return;

    try {
      setIsUploadingImage(true);
      const updateData: UpdateUserProfileData = {
        profile_image_url: ''
      };
      
      const response = await userService.updateProfile(updateData);
      
      if (response.success && response.data) {
        setProfile(response.data);
        setProfileImagePreview('');
        toast.success('Profile image removed successfully!');
      } else {
        throw new Error(response.message || 'Failed to remove image');
      }
    } catch (error: any) {
      console.error('Failed to remove image:', error);
      toast.error(error.message || 'Failed to remove image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleToggleTwoFactor = async () => {
    try {
      const response = await userService.toggleTwoFactor(!twoFactorEnabled);
      
      if (response.success) {
        setTwoFactorEnabled(!twoFactorEnabled);
        toast.success(`Two-factor authentication ${!twoFactorEnabled ? 'enabled' : 'disabled'} successfully!`);
      } else {
        throw new Error(response.message || 'Failed to toggle two-factor authentication');
      }
    } catch (error: any) {
      console.error('Failed to toggle two-factor authentication:', error);
      toast.error(error.message || 'Failed to toggle two-factor authentication');
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('Mobile')) return <Smartphone className="w-4 h-4" />;
    if (userAgent.includes('Tablet')) return <Tablet className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-3rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading account settings...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-[calc(100vh-3rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">Unable to load your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3rem)] bg-gray-50 flex flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600">Manage your profile information and account security.</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Profile Information
              </h2>
            </div>

            {/* Avatar Section */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {profileImagePreview ? (
                      <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 flex space-x-1">
                    <label className="bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploadingImage}
                      />
                      {isUploadingImage ? (
                        <LoadingSpinner size="sm" className="w-3 h-3" />
                      ) : (
                        <Upload className="w-3 h-3" />
                      )}
                    </label>
                    {profileImagePreview && (
                      <button
                        onClick={handleRemoveImage}
                        disabled={isUploadingImage}
                        className="bg-red-600 text-white p-1 rounded-full cursor-pointer hover:bg-red-700 disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Profile Photo</h3>
                  <p className="text-sm text-gray-500">Upload a new profile picture (max 5MB)</p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={profile.full_name || ''}
                  onChange={(e) => handleProfileChange('full_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.full_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={profile.email || ''}
                    disabled
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed. Contact support if needed.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="04XX XXX XXX"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
                {phoneError && (
                  <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={profile.location || ''}
                    onChange={(e) => handleProfileChange('location', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City, State"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone
                </label>
                <TimezoneSelect
                  value={profile.timezone || ''}
                  onValueChange={(value) => handleProfileChange('timezone', value)}
                  placeholder="Select your timezone..."
                  showCurrentTime={true}
                  showPopularTimezones={true}
                  className="w-full"
                />
                <p className="mt-1 text-xs text-gray-500">Select your local timezone for accurate time display</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  value={profile.role}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
                <p className="mt-1 text-xs text-gray-500">Contact your administrator to change your role</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="w-4 h-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Password Change */}
          <div className="bg-white rounded-lg shadow p-6" key="password-change-form">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-600" />
                Change Password
              </h2>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-2" />
                  <p className="text-sm text-green-800">{successMessage}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.current_password}
                    onChange={(e) => handlePasswordChange('current_password', e.target.value)}
                    className={`w-full pr-10 pl-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.current_password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                    autoFocus={false}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.current_password && (
                  <p className="mt-1 text-sm text-red-600">{errors.current_password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.new_password}
                    onChange={(e) => handlePasswordChange('new_password', e.target.value)}
                    className={`w-full pr-10 pl-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.new_password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    autoFocus={false}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {passwordData.new_password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Password Strength:</span>
                      <span className={`text-sm font-medium ${getPasswordStrengthColor(passwordData.new_password)}`}>
                        {getPasswordStrengthLabel(passwordData.new_password)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          getPasswordStrength(passwordData.new_password) <= 2 ? 'bg-red-500' :
                          getPasswordStrength(passwordData.new_password) <= 3 ? 'bg-yellow-500' :
                          getPasswordStrength(passwordData.new_password) <= 4 ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(getPasswordStrength(passwordData.new_password) / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Password Requirements */}
                {passwordData.new_password && (
                  <div className="mt-3">
                    <div className="text-sm text-gray-600 mb-2">Password Requirements:</div>
                    <div className="space-y-1">
                      {validatePasswordRequirements(passwordData.new_password).map((requirement, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          {requirement.met ? (
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          )}
                          <span className={requirement.met ? 'text-green-600' : 'text-gray-500'}>
                            {requirement.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {errors.new_password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.new_password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.new_password_confirmation}
                    onChange={(e) => handlePasswordChange('new_password_confirmation', e.target.value)}
                    className={`w-full pr-10 pl-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.new_password_confirmation ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    autoFocus={false}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.new_password_confirmation && (
                  <p className="mt-1 text-sm text-red-600">{errors.new_password_confirmation}</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isChangingPassword ? (
                  <>
                    <LoadingSpinner size="sm" className="w-4 h-4 mr-2" />
                    Changing...
                  </>
                ) : (
                  'Change Password'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Security</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500">
                  {twoFactorEnabled ? 'Enabled' : 'Add an extra layer of security to your account'}
                </p>
              </div>
              <button 
                onClick={handleToggleTwoFactor}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  twoFactorEnabled 
                    ? 'text-red-600 bg-red-50 border border-red-200 hover:bg-red-100' 
                    : 'text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100'
                }`}
              >
                {twoFactorEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Login History</h3>
                <p className="text-sm text-gray-500">View recent login activity</p>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100">
                View All
              </button>
            </div>
          </div>
        </div>

        {/* Login History */}
        {loginHistory.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Recent Login Activity
            </h2>
            <div className="space-y-3">
              {loginHistory.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getDeviceIcon(entry.user_agent)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {entry.browser || 'Unknown Browser'} on {entry.os || 'Unknown OS'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {entry.location || 'Unknown Location'} • {entry.ip_address}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">{formatDate(entry.login_at)}</p>
                    {entry.logout_at && (
                      <p className="text-xs text-gray-500">Logged out: {formatDate(entry.logout_at)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSettingsPage;
