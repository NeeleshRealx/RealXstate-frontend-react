import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';

const HelpChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Help Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Help Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">ServAI Help</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Welcome to ServAI! How can we help you today?
              </p>
              
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Getting Started Guide
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Feature Documentation
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpChat;
