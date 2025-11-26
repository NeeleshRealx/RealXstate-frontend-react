import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit, 
  Save, 
  X,
  Camera,
  Loader2
} from 'lucide-react';
import TimezoneSelect from '@/components/ui/TimezoneSelect';
import Breadcrumbs from '@/features/settings/components/Breadcrumbs';
import { userProfileService, type UserProfile, type UpdateUserProfileData } from '@/services/userProfileService';
import { toast } from 'react-toastify';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load profile data on component mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const profileData = await userProfileService.getProfile();
      console.log("Business profile data loaded:", profileData);
      setProfile(profileData);
      setEditData(profileData);
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load business profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (profile) {
      setEditData(profile);
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setEditData(profile);
    }
  };

  const handleSave = async () => {
    if (!editData) return;
    
    try {
      setIsSaving(true);
      const updateData: UpdateUserProfileData = {
        fullName: editData.fullName,
        phone: editData.phone,
        location: editData.location,
        timezone: editData.timezone,
      };
      
      const updatedProfile = await userProfileService.updateProfile(updateData);
      setProfile(updatedProfile);
      setIsEditing(false);
      toast.success('Account updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update account');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    if (editData) {
      setEditData(prev => prev ? {
        ...prev,
        [field]: value,
      } : null);
    }
  };

  const breadcrumbItems = [
    { label: 'Business Profile' },
  ];

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-[calc(100vh-3rem)] bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading business profile...</span>
        </div>
      </div>
    );
  }

  // Show error state if no profile data
  if (!profile) {
    return (
      <div className="h-[calc(100vh-3rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Failed to load business profile data</p>
          <button
            onClick={loadProfile}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
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
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Business Profile</h1>
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    <X className="w-4 h-4 mr-2 inline" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4 mr-2 inline" />
                  Edit Account
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-4xl">
          {/* Avatar Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                  {profile.profilePicture ? (
                    <img 
                      src={profile.profilePicture} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile.business?.name || profile.fullName}
                </h2>
                <p className="text-gray-600">{profile.role}</p>
                <p className="text-sm text-gray-500">
                  Member since {profile.joinDate ? new Date(profile.joinDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="flex items-center space-x-2 text-gray-900">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{profile.email}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  {isEditing && editData ? (
                    <input
                      type="tel"
                      value={editData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0412 345 678 or 02 1234 5678"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-900">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{profile.phone || 'Not provided'}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  {isEditing && editData ? (
                    <input
                      type="text"
                      value={editData.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter location"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-900">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{profile.location || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  {isEditing && editData ? (
                    <TimezoneSelect
                      value={editData.timezone || 'America/New_York'}
                      onValueChange={(value) => handleInputChange('timezone', value)}
                      placeholder="Select timezone..."
                      showCurrentTime={true}
                      showPopularTimezones={false}
                    />
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-900">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>
                        {profile.timezone 
                          ? profile.timezone.replace('America/', '').replace('_', ' ')
                          : 'Not set'
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Business Information */}
          {profile.business && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                    <div className="flex items-center space-x-2 text-gray-900">
                      <span className="font-medium">{profile.business.name}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Email</label>
                    <div className="flex items-center space-x-2 text-gray-900">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{profile.business.contactEmail}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Phone</label>
                    <div className="flex items-center space-x-2 text-gray-900">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{profile.business.contactPhone || 'Not provided'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Slug</label>
                    <div className="flex items-center space-x-2 text-gray-900">
                      <span className="text-sm text-gray-600">{profile.business.slug}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
