import React, { useRef, useEffect } from 'react';
import { Send, Plus, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSubmit,
  onKeyDown,
  maxLength = 500,
  placeholder = "Type a message... or type /add to add items",
  disabled = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <form onSubmit={onSubmit} className="flex items-end space-x-2">
      <div className="flex-1 relative">
        {/* Attachment buttons */}
        <div className="flex items-center space-x-1 mb-1">
          <button 
            type="button" 
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={disabled}
            aria-label="Add attachment"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button 
            type="button" 
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={disabled}
            aria-label="Mention"
          >
            <AtSign className="w-3 h-3" />
          </button>
        </div>
        
        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="min-h-[40px] max-h-24 resize-none border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
          maxLength={maxLength}
          disabled={disabled}
        />
        
        {/* Instructions and character count */}
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">
            Press Enter to send, Shift+Enter for new line
          </span>
          <span className={`text-xs ${value.length > maxLength * 0.9 ? 'text-red-500' : 'text-gray-500'}`}>
            {value.length}/{maxLength}
          </span>
        </div>
      </div>
      
      {/* Send button */}
      <Button 
        type="submit" 
        className="bg-blue-600 hover:bg-blue-700 text-white h-8 w-8 p-0"
        disabled={disabled || !value.trim()}
        aria-label="Send message"
      >
        <Send className="w-3 h-3" />
      </Button>
    </form>
  );
};

export default MessageInput;
