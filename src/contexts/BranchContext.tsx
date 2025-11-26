import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Branch } from '../types/branch';
import { branchService } from '../services/branchService';
import { useAuth } from '../context/AuthContext';
import { getAuthToken } from '../lib/api';

interface BranchContextType {
  selectedBranch: Branch | null;
  branches: Branch[];
  isLoadingBranches: boolean;
  setSelectedBranch: (branch: Branch | null) => void;
  handleBranchChange: (branchId: string | Branch) => void;
  refreshBranches: () => Promise<void>;
  refreshSelectedBranch: () => Promise<void>;
  updateBranchInContext: (updatedBranch: Branch) => void;
  clearBranches: () => void;
  forceLoadBranches: () => Promise<void>;
  removeBranchFromContext: (branchId: string | number) => void;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const useBranchContext = () => {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error('useBranchContext must be used within a BranchProvider');
  }
  return context;
};

interface BranchProviderProps {
  children: ReactNode;
}

export const BranchProvider: React.FC<BranchProviderProps> = ({ children }) => {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  
  // Cache for branches and tables data
  const [cache, setCache] = useState<{
    branches: Branch[];
    tables: Record<string, any[]>;
    lastFetch: number;
  }>({ branches: [], tables: {}, lastFetch: 0 });
  
  // Get auth context to listen for user changes
  const { user, isAuthenticated } = useAuth();
  
  // Cache duration: 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000;

  // Load branches on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('[BranchContext] User authenticated, loading branches for business:', user.business_id);
      
      // Check if we have a valid token before loading branches
      const token = getAuthToken();
      if (!token) {
        console.log('[BranchContext] No valid token found, skipping branch loading');
        return;
      }
      
      // Check cache first
      const now = Date.now();
      if (cache.branches.length > 0 && (now - cache.lastFetch) < CACHE_DURATION) {
        console.log('[BranchContext] Using cached branches data');
        setBranches(cache.branches);
        setIsLoadingBranches(false);
        return;
      }
      
      // Clear existing branches when business changes
      setBranches([]);
      setSelectedBranch(null);
      loadBranches();
    } else {
      console.log('[BranchContext] User not authenticated, clearing branches');
      setBranches([]);
      setSelectedBranch(null);
      setCache({ branches: [], tables: {}, lastFetch: 0 });
    }
  }, [isAuthenticated, user?.business_id]);

  // Listen for authentication events from other contexts
  useEffect(() => {
    const handleUserLogin = (event: CustomEvent) => {
      console.log('[BranchContext] User login event received:', event.detail);
      
      // Check if we have a valid token before loading branches
      const token = getAuthToken();
      if (!token) {
        console.log('[BranchContext] No valid token found in login event, skipping branch loading');
        return;
      }
      
      // Clear existing branches and reload for new business
      setBranches([]);
      setSelectedBranch(null);
      setCache({ branches: [], tables: {}, lastFetch: 0 });
      loadBranches();
    };

    const handleUserLogout = () => {
      console.log('[BranchContext] User logout event received');
      clearBranches();
    };

    // Add event listeners
    window.addEventListener('userLoggedIn', handleUserLogin as EventListener);
    window.addEventListener('userLoggedOut', handleUserLogout);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('userLoggedIn', handleUserLogin as EventListener);
      window.removeEventListener('userLoggedOut', handleUserLogout);
    };
  }, []);

  // Auto-select first branch when branches are loaded or when selected branch is deleted
  useEffect(() => {
    if (branches.length > 0) {
      // Check if current selected branch still exists in the branches array
      const selectedBranchExists = selectedBranch && branches.some(branch => branch.id === selectedBranch.id);
      
      if (!selectedBranch || !selectedBranchExists) {
        console.log('[BranchContext] Auto-selecting first branch:', branches[0]);
        setSelectedBranch(branches[0]);
      }
    } else if (branches.length === 0 && selectedBranch) {
      // If no branches available, clear selected branch
      console.log('[BranchContext] No branches available, clearing selected branch');
      setSelectedBranch(null);
    }
  }, [branches, selectedBranch]);

  const loadBranches = async () => {
    try {
      setIsLoadingBranches(true);
      console.log('[BranchContext] Loading branches...');
      
      const response = await branchService.getBranches();
      if (response.success && response.data) {
        console.log('[BranchContext] Raw branches data:', response.data.branches);
        
        // Map API response to Branch type
        const mappedBranches: Branch[] = response.data.branches.map((apiBranch: any) => ({
          id: apiBranch.id,
          name: apiBranch.name,
          address: apiBranch.address,
          phone: apiBranch.contact_phone, // Map contact_phone to phone
          timezone: apiBranch.timezone,
          is_active: apiBranch.is_active,
          created_at: apiBranch.created_at,
          updated_at: apiBranch.updated_at,
          // Map manager data if available
          manager: apiBranch.manager_id && apiBranch.manager_name ? {
            id: apiBranch.manager_id,
            name: apiBranch.manager_name,
            email: '' // API doesn't provide manager email
          } : undefined
        }));
        
        console.log('[BranchContext] Mapped branches:', mappedBranches);
        setBranches(mappedBranches);
        
        // Update cache
        setCache(prevCache => ({
          ...prevCache,
          branches: mappedBranches,
          lastFetch: Date.now()
        }));
      } else {
        console.warn('[BranchContext] Failed to load branches:', response);
        setBranches([]);
      }
    } catch (error) {
      console.error('[BranchContext] Error loading branches:', error);
      // Don't let branch loading errors affect authentication state
      setBranches([]);
    } finally {
      setIsLoadingBranches(false);
    }
  };

  const handleBranchChange = (branchId: string | Branch) => {
    console.log('Branch change triggered with:', branchId, 'Type:', typeof branchId);
    console.log('Available branches:', branches);
    
    let branch: Branch | undefined;
    
    if (typeof branchId === 'string') {
      // Convert branchId to number for comparison since database IDs are numbers
      const numericBranchId = parseInt(branchId, 10);
      console.log('Converted to numeric ID:', numericBranchId);
      
      branch = branches.find(b => b.id === numericBranchId);
    } else {
      // branchId is already a Branch object
      branch = branchId;
    }
    
    console.log('Found branch:', branch);
    
    if (branch) {
      console.log('Setting selected branch to:', branch);
      setSelectedBranch(branch);
      console.log('Branch selection successful!');
    } else {
      console.log('No branch found');
      console.log('Available branch IDs:', branches.map(b => ({ id: b.id, type: typeof b.id, name: b.name })));
    }
  };

  const refreshBranches = async () => {
    console.log('[BranchContext] Manual refresh requested');
    await loadBranches();
  };

  const refreshSelectedBranch = async () => {
    if (!selectedBranch) {
      console.log('[BranchContext] No selected branch to refresh');
      return;
    }
    
    console.log('[BranchContext] Refreshing selected branch data...');
    await loadBranches();
    
    // After refreshing, find and set the updated branch
    const updatedBranch = branches.find(b => b.id === selectedBranch.id);
    if (updatedBranch) {
      console.log('[BranchContext] Updated selected branch with fresh data:', updatedBranch);
      setSelectedBranch(updatedBranch);
    }
  };

  const updateBranchInContext = (updatedBranch: Branch) => {
    console.log('[BranchContext] Updating branch in context:', updatedBranch);
    
    // Update or add the branch in the branches array
    setBranches(prevBranches => {
      const existingIndex = prevBranches.findIndex(branch => branch.id === updatedBranch.id);
      
      if (existingIndex !== -1) {
        // Update existing branch
        return prevBranches.map(branch => 
          branch.id === updatedBranch.id ? updatedBranch : branch
        );
      } else {
        // Add new branch
        console.log('[BranchContext] Adding new branch to context:', updatedBranch);
        return [...prevBranches, updatedBranch];
      }
    });
    
    // If this is the currently selected branch, update it too
    if (selectedBranch && selectedBranch.id === updatedBranch.id) {
      console.log('[BranchContext] Updating selected branch with new data:', updatedBranch);
      setSelectedBranch(updatedBranch);
    }
  };

  const clearBranches = () => {
    console.log('[BranchContext] Clearing branches');
    setBranches([]);
    setSelectedBranch(null);
    setCache({ branches: [], tables: {}, lastFetch: 0 });
  };

  const forceLoadBranches = async () => {
    console.log('[BranchContext] Force loading branches');
    await loadBranches();
  };

  const removeBranchFromContext = (branchId: string | number) => {
    console.log('[BranchContext] Removing branch from context:', branchId);
    
    // Remove the branch from the branches array
    setBranches(prevBranches => {
      const filteredBranches = prevBranches.filter(branch => branch.id !== branchId);
      
      // If the removed branch was the selected one, clear selection
      if (selectedBranch && selectedBranch.id === branchId) {
        console.log('[BranchContext] Removed branch was selected, clearing selection');
        setSelectedBranch(null);
      }
      
      return filteredBranches;
    });
  };

  const value: BranchContextType = {
    selectedBranch,
    branches,
    isLoadingBranches,
    setSelectedBranch,
    handleBranchChange,
    refreshBranches,
    refreshSelectedBranch,
    updateBranchInContext,
    clearBranches,
    forceLoadBranches,
    removeBranchFromContext,
  };

  return (
    <BranchContext.Provider value={value}>
      {children}
    </BranchContext.Provider>
  );
};
