import React from 'react';
import { LogOut, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/common/Modal';

interface LogoutConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  userName?: string;
}

export const LogoutConfirmation: React.FC<LogoutConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  userName
}) => {

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
    >
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Confirm Logout</h2>
        </div>

        {/* Icon and Message */}
        <div className="flex items-start space-x-4 mb-6">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Are you sure you want to logout?
            </h3>
            <p className="text-sm text-gray-600">
              {userName 
                ? `You will be signed out of your account, ${userName}. You'll need to sign in again to access your account.`
                : "You will be signed out of your account. You'll need to sign in again to access your account."
              }
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-6"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4 mr-2" />
                Yes, Logout
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
