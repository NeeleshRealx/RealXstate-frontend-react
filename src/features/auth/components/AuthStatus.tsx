import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAuthToken, getUserData } from '@/lib/api';

export const AuthStatus: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Get raw cookie data for debugging
  const rawToken = getAuthToken();
  const rawUserData = getUserData();

  if (import.meta.env.DEV) {
    return (
      <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50 max-w-md">
        <h3 className="font-semibold text-sm text-gray-900 mb-2">🔐 Auth Status (Dev)</h3>
        
        <div className="space-y-2 text-xs">
          <div>
            <span className="font-medium">Loading:</span> {isLoading ? 'Yes' : 'No'}
          </div>
          
          <div>
            <span className="font-medium">Authenticated:</span> {isAuthenticated ? 'Yes' : 'No'}
          </div>
          
          <div>
            <span className="font-medium">Has Token:</span> {rawToken ? 'Yes' : 'No'}
          </div>
          
          <div>
            <span className="font-medium">Has User Data:</span> {rawUserData ? 'Yes' : 'No'}
          </div>
          
          {user && (
            <div className="border-t pt-2">
              <div className="font-medium text-gray-700">User Info:</div>
              <div>ID: {user.id}</div>
              <div>Name: {user.name}</div>
              <div>Email: {user.email}</div>
              <div>Role: {user.role}</div>
              <div>Business ID: {user.business_id}</div>
            </div>
          )}
          
          {rawToken && (
            <div className="border-t pt-2">
              <div className="font-medium text-gray-700">Token (first 20 chars):</div>
              <div className="font-mono text-xs break-all">
                {rawToken.substring(0, 20)}...
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null; // Don't show in production
};
