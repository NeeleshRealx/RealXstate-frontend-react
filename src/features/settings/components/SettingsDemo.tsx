import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Clock, CheckCircle } from 'lucide-react';

const SettingsDemo: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🎉 Business Management Features Added!
        </h2>
        <p className="text-gray-600 mb-6">
          The Settings page now includes comprehensive business management tools
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Business Profile */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Building2 className="h-5 w-5" />
              Business Profile
            </CardTitle>
            <CardDescription className="text-blue-700">
              Manage your business information and branding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Business name and contact details</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Logo upload with preview</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>URL slug customization</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Auto-generated slugs from business name</span>
            </div>
          </CardContent>
        </Card>

        {/* Branches */}
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <MapPin className="h-5 w-5" />
              Branch Management
            </CardTitle>
            <CardDescription className="text-green-700">
              Create and manage multiple business locations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Add, edit, and delete branches</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Search and filter branches</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Timezone selection</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Branch manager assignment</span>
            </div>
          </CardContent>
        </Card>

        {/* Opening Hours */}
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Clock className="h-5 w-5" />
              Opening Hours
            </CardTitle>
            <CardDescription className="text-purple-700">
              Set weekly schedules for each branch
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Weekly schedule management</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Multiple time slots per day</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Copy hours between days</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Optional time slot labels</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300">
        <CardHeader>
          <CardTitle className="text-center text-gray-900">
            How to Use the New Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">1. Navigate to Settings</h4>
              <p className="text-sm text-gray-600">
                Go to the Settings page in your dashboard
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">2. Use the Tab Interface</h4>
              <p className="text-sm text-gray-600">
                Click on the Business, Branches, or Hours tabs to access different features
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">3. Business Profile</h4>
              <p className="text-sm text-gray-600">
                Update your business information, upload a logo, and customize your URL
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">4. Manage Branches</h4>
              <p className="text-sm text-gray-600">
                Add multiple locations, set timezones, and assign managers
              </p>
            </div>
          </div>
          
          <div className="text-center pt-4">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Explore Settings Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsDemo;
