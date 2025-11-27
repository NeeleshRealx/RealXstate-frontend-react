import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContextRealxstate';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';
import { LogoutConfirmation } from '@/components/auth/LogoutConfirmation';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showConfirmation?: boolean;
  confirmationMessage?: string;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  variant = 'outline', 
  size = 'default',
  className = '',
  showConfirmation = true
}) => {
  const { logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const handleLogoutClick = () => {
    if (showConfirmation) {
      setShowConfirmationModal(true);
    } else {
      handleLogout();
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setShowConfirmationModal(false);
      console.log('[LogoutButton] Starting logout process...');
      
      await logout();
      
      console.log('[LogoutButton] Logout completed successfully');
    } catch (error) {
      console.error('[LogoutButton] Logout failed:', error);
      
      // Show error message to user
      alert('Logout failed. Please try again or refresh the page.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCloseModal = () => {
    setShowConfirmationModal(false);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleLogoutClick}
        disabled={isLoggingOut}
        className={className}
      >
        {isLoggingOut ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <LogOut className="h-4 w-4 mr-2" />
        )}
        {isLoggingOut ? 'Signing out...' : 'Logout'}
      </Button>

      {showConfirmation && (
        <LogoutConfirmation
          isOpen={showConfirmationModal}
          onClose={handleCloseModal}
          onConfirm={handleLogout}
          isLoading={isLoggingOut}
          userName={user?.name}
        />
      )}
    </>
  );
};
