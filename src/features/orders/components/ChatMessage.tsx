import React from 'react';
import { MessageSquare, User } from 'lucide-react';

interface ChatMessageProps {
  id: string;
  type: 'customer' | 'system';
  content: string;
  timestamp: Date;
  isNotification?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  type,
  content,
  timestamp,
  isNotification
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isNotification) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${type === 'system' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md ${type === 'system' ? 'order-2' : 'order-1'}`}>
        <div className={`px-4 py-3 rounded-lg ${
          type === 'system' 
            ? 'bg-blue-500 text-white rounded-br-sm' 
            : 'bg-gray-200 text-gray-900 rounded-bl-sm'
        }`}>
          <p className="text-sm leading-relaxed">{content}</p>
        </div>
        <div className={`flex items-center mt-1 ${type === 'system' ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-500">
            {formatTime(timestamp)}
          </span>
          {type === 'system' && (
            <span className="ml-2 text-xs text-gray-500 flex items-center">
              <User className="w-3 h-3 mr-1" />
              You
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
