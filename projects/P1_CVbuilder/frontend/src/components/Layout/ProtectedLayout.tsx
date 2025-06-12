import React from 'react';
import { Outlet } from 'react-router-dom';
import ProfileHeader from './ProfileHeader';
import Footer from './Footer';

const ProtectedLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <ProfileHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default ProtectedLayout;
