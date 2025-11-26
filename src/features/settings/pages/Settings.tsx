import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Bell, 
  Shield, 
  Palette, 
  Database,
  Building2,
  MapPin,
  Clock,
  User
} from 'lucide-react';
import BusinessProfile from '@/features/settings/components/BusinessProfile';
import Branches from '@/features/settings/components/Branches';
import OpeningHours from '@/features/settings/components/OpeningHours';
import { BusinessProfile as BusinessProfileType, Branch, OpeningHours as OpeningHoursType } from '@/types/settings';
import { branchService } from '@/services/branchService';
import { openingHoursService } from '@/services/openingHoursService';
import { Branch as ApiBranch } from '@/types/branch';
import { OpeningHours as ApiOpeningHours } from '@/types/openingHours';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [businessProfile, setBusinessProfile] = useState<BusinessProfileType | undefined>();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [openingHours, setOpeningHours] = useState<OpeningHoursType>({
    id: '',
    branch_id: '',
    created_at: '',
    updated_at: '',
    monday: { is_open: false, time_slots: [] },
    tuesday: { is_open: false, time_slots: [] },
    wednesday: { is_open: false, time_slots: [] },
    thursday: { is_open: false, time_slots: [] },
    friday: { is_open: false, time_slots: [] },
    saturday: { is_open: false, time_slots: [] },
    sunday: { is_open: false, time_slots: [] }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert API Branch to Settings Branch
  const convertApiBranchToSettingsBranch = (apiBranch: ApiBranch): Branch => {
    return {
      name: apiBranch.name,
      address: apiBranch.address || '',
      timezone: apiBranch.timezone,
      phone: apiBranch.phone,
      manager: apiBranch.manager?.name || '',
      status: apiBranch.is_active ? 'active' : 'inactive',
      // business_id: apiBranch.id,
      // created_at: apiBranch.created_at,
      // updated_at: apiBranch.updated_at
    };
  };

  // Convert Settings Branch to API Branch data
  const convertSettingsBranchToApiData = (branch: Branch) => {
    return {
      name: branch.name,
      address: branch.address,
      timezone: branch.timezone,
      contact_phone: branch.phone,
      manager_id: undefined, // We'll need to implement manager handling
      is_active: branch.status === 'active'
    };
  };

  // Convert API Opening Hours to Settings Opening Hours
  const convertApiOpeningHoursToSettings = (apiHours: ApiOpeningHours): OpeningHoursType => {
    return {
      id: apiHours.id,
      branch_id: apiHours.branch_id,
      created_at: apiHours.created_at,
      updated_at: apiHours.updated_at,
      monday: { is_open: apiHours.monday.is_open, time_slots: apiHours.monday.time_slots.map(slot => ({ start: slot.open, end: slot.close, label: slot.label || '' })) },
      tuesday: { is_open: apiHours.tuesday.is_open, time_slots: apiHours.tuesday.time_slots.map(slot => ({ start: slot.open, end: slot.close, label: slot.label || '' })) },
      wednesday: { is_open: apiHours.wednesday.is_open, time_slots: apiHours.wednesday.time_slots.map(slot => ({ start: slot.open, end: slot.close, label: slot.label || '' })) },
      thursday: { is_open: apiHours.thursday.is_open, time_slots: apiHours.thursday.time_slots.map(slot => ({ start: slot.open, end: slot.close, label: slot.label || '' })) },
      friday: { is_open: apiHours.friday.is_open, time_slots: apiHours.friday.time_slots.map(slot => ({ start: slot.open, end: slot.close, label: slot.label || '' })) },
      saturday: { is_open: apiHours.saturday.is_open, time_slots: apiHours.saturday.time_slots.map(slot => ({ start: slot.open, end: slot.close, label: slot.label || '' })) },
      sunday: { is_open: apiHours.sunday.is_open, time_slots: apiHours.sunday.time_slots.map(slot => ({ start: slot.open, end: slot.close, label: slot.label || '' })) }
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const branchesResponse = await branchService.getBranches();
        if (branchesResponse.success && branchesResponse.data) {
          const convertedBranches = branchesResponse.data.branches.map(convertApiBranchToSettingsBranch);
          setBranches(convertedBranches);
          
          // Fetch opening hours for the first branch if available
          if (convertedBranches.length > 0 && convertedBranches[0].id) {
            try {
              const openingHoursResponse = await openingHoursService.getOpeningHours(convertedBranches[0].id);
              if (openingHoursResponse.success && openingHoursResponse.data) {
                const convertedHours = convertApiOpeningHoursToSettings(openingHoursResponse.data);
                setOpeningHours(convertedHours);
              }
            } catch (err) {
              console.warn('Failed to fetch opening hours:', err);
            }
          }
        }
      } catch (err) {
        setError('Failed to fetch branches');
        toast.error('Failed to fetch branches');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveBusinessProfile = async (profile: BusinessProfileType) => {
    try {
      setBusinessProfile(profile);
      toast.success('Business profile updated successfully');
    } catch (err) {
      setError('Failed to update business profile');
      toast.error('Failed to update business profile');
    }
  };

  const handleSaveBranch = async (branch: Branch) => {
    try {
      const existingBranch = branches.find(b => b.id === branch.id);
      
      if (existingBranch) {
        // Update existing branch
        const response = await branchService.saveBranch(branch, true, branch.id);
        if (response.success && response.data) {
          const updatedBranch = convertApiBranchToSettingsBranch(response.data);
          setBranches(prev => prev.map(b => b.id === branch.id ? updatedBranch : b));
          toast.success('Branch updated successfully');
        }
      } else {
        // Create new branch
        const response = await branchService.saveBranch(branch, false);
        if (response.success && response.data) {
          const newBranch = convertApiBranchToSettingsBranch(response.data);
          setBranches(prev => [...prev, newBranch]);
          toast.success('Branch created successfully');
        }
      }
    } catch (err) {
      setError('Failed to save branch');
      toast.error('Failed to save branch');
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    try {
      const response = await branchService.deleteBranch(branchId);
      if (response.success) {
        setBranches(prev => prev.filter(b => b.id !== branchId));
        toast.success('Branch deleted successfully');
      }
    } catch (err) {
      setError('Failed to delete branch');
      toast.error('Failed to delete branch');
    }
  };

  const handleSaveOpeningHours = async (hours: OpeningHoursType) => {
    try {
      // Convert settings opening hours to API format
      const apiHours = {
        monday: { is_open: hours.monday.is_open, time_slots: hours.monday.time_slots.map(slot => ({ open: slot.start, close: slot.end, label: slot.label })) },
        tuesday: { is_open: hours.tuesday.is_open, time_slots: hours.tuesday.time_slots.map(slot => ({ open: slot.start, close: slot.end, label: slot.label })) },
        wednesday: { is_open: hours.wednesday.is_open, time_slots: hours.wednesday.time_slots.map(slot => ({ open: slot.start, close: slot.end, label: slot.label })) },
        thursday: { is_open: hours.thursday.is_open, time_slots: hours.thursday.time_slots.map(slot => ({ open: slot.start, close: slot.end, label: slot.label })) },
        friday: { is_open: hours.friday.is_open, time_slots: hours.friday.time_slots.map(slot => ({ open: slot.start, close: slot.end, label: slot.label })) },
        saturday: { is_open: hours.saturday.is_open, time_slots: hours.saturday.time_slots.map(slot => ({ open: slot.start, close: slot.end, label: slot.label })) },
        sunday: { is_open: hours.sunday.is_open, time_slots: hours.sunday.time_slots.map(slot => ({ open: slot.start, close: slot.end, label: slot.label })) }
      };
      
      // Save to API if we have a branch selected
      if (branches.length > 0 && branches[0].id) {
        await openingHoursService.updateOpeningHours(branches[0].id, apiHours);
      }
      
      setOpeningHours(hours);
      toast.success('Opening hours updated successfully');
    } catch (err) {
      setError('Failed to update opening hours');
      toast.error('Failed to update opening hours');
    }
  };

  if (loading && !error) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and business configuration
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Business
          </TabsTrigger>
          <TabsTrigger value="branches" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Branches
          </TabsTrigger>
          <TabsTrigger value="hours" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Hours
          </TabsTrigger>
        </TabsList>

        {/* Account Settings Tab */}
        <TabsContent value="account" className="space-y-6">
          <div className="grid gap-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Profile Settings
                </CardTitle>
                <CardDescription>
                  Update your account information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter your full name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="0412 345 678 or 02 1234 5678" />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Configure your notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for important updates
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications in your browser
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Service Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about service status changes
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security
                </CardTitle>
                <CardDescription>
                  Manage your account security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Change Password</Label>
                    <p className="text-sm text-muted-foreground">
                      Update your account password
                    </p>
                  </div>
                  <Button variant="outline">Change</Button>
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize the appearance of your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark themes
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact Layout</Label>
                    <p className="text-sm text-muted-foreground">
                      Use a more compact layout for better space utilization
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Business Profile Tab */}
        <TabsContent value="business">
          <BusinessProfile 
            profile={businessProfile}
            onSave={handleSaveBusinessProfile}
          />
        </TabsContent>

        {/* Branches Tab */}
        <TabsContent value="branches">
          <Branches 
            branches={branches}
            onSave={handleSaveBranch}
            onDelete={handleDeleteBranch}
          />
        </TabsContent>

        {/* Opening Hours Tab */}
        <TabsContent value="hours">
          <OpeningHours 
            branches={branches}
            openingHours={openingHours}
            onSave={handleSaveOpeningHours}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
