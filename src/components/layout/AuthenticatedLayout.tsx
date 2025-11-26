import React from 'react';
import { Outlet } from 'react-router-dom';
// import Header from './Header';
import Sidebar from './Sidebar';

const AuthenticatedLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {/* <Header /> */}
        
        {/* Page Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AuthenticatedLayout;
