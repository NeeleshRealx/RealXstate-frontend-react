import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Building2 } from 'lucide-react';
import SettingsHeader from '@/components/layout/SettingsHeader';
import Branches from '@/features/settings/components/Branches';
import LoadingPlaceholder from '@/components/ui/LoadingPlaceholder';
import ErrorPlaceholder from '@/components/ui/ErrorPlaceholder';
import { branchService } from '@/services/branchService';
import { Branch as ApiBranch } from '@/types/branch';
import { Branch, OpeningHours } from '@/types/settings';
import { useBranchContext } from '@/contexts/BranchContext';

const BranchesPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get BranchContext methods
  const { updateBranchInContext, refreshBranches, removeBranchFromContext } = useBranchContext();

  const breadcrumbs = [
    { label: 'Settings', href: '/settings' },
    { label: 'Branches' }
  ];

  // Convert API Branch to Settings Branch
  const convertApiBranchToSettingsBranch = (apiBranch: ApiBranch): Branch => {
    return {
      id: apiBranch.id.toString(),
      name: apiBranch.name,
      address: apiBranch.address || '',
      timezone: apiBranch.timezone,
      phone: (apiBranch as any).contact_phone || apiBranch.phone, // Map contact_phone from API to phone
      manager: apiBranch.manager?.name || '',
      status: apiBranch.is_active ? 'active' : 'inactive',
      opening_hours: (apiBranch as any).opening_hours || undefined,
      business_id: apiBranch.id.toString(),
      created_at: apiBranch.created_at,
      updated_at: apiBranch.updated_at
    };
  };

  // Convert API Branch to Context Branch type
  const convertApiBranchToContextBranch = (apiBranch: ApiBranch): import('@/types/branch').Branch => {
    return {
      id: apiBranch.id,
      name: apiBranch.name,
      address: apiBranch.address,
      phone: (apiBranch as any).contact_phone || apiBranch.phone, // Map contact_phone from API to phone
      timezone: apiBranch.timezone,
      is_active: apiBranch.is_active,
      created_at: apiBranch.created_at,
      updated_at: apiBranch.updated_at,
      manager: apiBranch.manager ? {
        id: apiBranch.manager.id,
        name: apiBranch.manager.name,
        email: apiBranch.manager.email || ''
      } : undefined
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
      is_active: branch.status === 'active',
      opening_hours: branch.opening_hours as OpeningHours,
      // created_at: branch.created_at as string,
      // updated_at: branch.updated_at
    };
  };

  // Load branches on component mount
  useEffect(() => {
    const loadBranches = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await branchService.getBranches();
        console.log('branches response', response);
        if (response.success && response.data && response.data.branches) {
          const branchesData = response.data.branches;
          if (Array.isArray(branchesData)) {
            const convertedBranches = branchesData.map(convertApiBranchToSettingsBranch);
            setBranches(convertedBranches);
          } else {
            console.error('Unexpected branches data structure:', response.data);
            setError('Invalid branches data structure received from API');
          }
        } else {
          setError('Failed to load branches: ' + (response.message || 'Unknown error'));
        }
      } catch (err) {
        setError('Failed to load branches');
        toast.error('Failed to load branches');
      } finally {
        setIsLoading(false);
      }
    };

    loadBranches();
  }, []);

  const handleSaveBranch = async (branch: Branch) => {
    try {
      const existingBranch = branches.find(b => b.name === branch.name);
      
      if (existingBranch) {
        // Update existing branch
        const response = await branchService.saveBranch(branch, true, existingBranch.id);
        if (response.success && response.data) {
          const updatedBranch = convertApiBranchToSettingsBranch(response.data);
          setBranches(prev => prev.map(b => b.name === branch.name ? updatedBranch : b));
          
          // Also update the branch in BranchContext so it reflects throughout the app
          const contextBranch = convertApiBranchToContextBranch(response.data);
          updateBranchInContext(contextBranch);
          
          toast.success('Branch updated successfully');
        }
      } else {  
        // Create new branch
        const response = await branchService.saveBranch(branch, false);
        if (response.success && response.data) {
          const newBranch = convertApiBranchToSettingsBranch(response.data);
          setBranches(prev => [...prev, newBranch]);
          
          // Also update the branch in BranchContext so it reflects throughout the app
          const contextBranch = convertApiBranchToContextBranch(response.data);
          updateBranchInContext(contextBranch);
          
          // Refresh the entire branch list in context to ensure consistency
          await refreshBranches();
          
          toast.success('Branch created successfully');
        }
      }
    } catch (err) {
      toast.error('Failed to save branch');
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    try {
      const response = await branchService.deleteBranch(branchId);
      if (response.success) {
        setBranches(prev => prev.filter(b => b.id !== branchId));
        
        // Remove the branch from context and handle selected branch logic
        removeBranchFromContext(branchId);
        
        toast.success('Branch deleted successfully');
      }
    } catch (err) {
      toast.error('Failed to delete branch');
    }
  };

  if (isLoading) {
    return (
      <LoadingPlaceholder
        icon={Building2}
        title="Loading Branches"
        subtitle="Please wait while we fetch your branch information"
        size="lg"
      />
    );
  }

  if (error) {
    return (
      <ErrorPlaceholder
        title="Error Loading Branches"
        subtitle={error}
        actionText="Try Again"
        onAction={() => window.location.reload()}
        size="lg"
      />
    );
  }

  return (
    <div className="h-[calc(100vh-3rem)] bg-gray-50 flex flex-col">
      <SettingsHeader
        // title="Branches"
        breadcrumbs={breadcrumbs}
      />
      <main className="flex-1 overflow-y-auto p-8">
        <Branches 
          branches={branches}
          onSave={handleSaveBranch}
          onDelete={handleDeleteBranch}
        />
      </main>
    </div>
  );
};

export default BranchesPage;