import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { User } from '../../../types/settings';

interface UserProfileProps {
  user: User;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
        <p className="text-xs text-gray-500 truncate">{user.role}</p>
      </div>
      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
        <MoreHorizontal className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );
};

export default UserProfile;