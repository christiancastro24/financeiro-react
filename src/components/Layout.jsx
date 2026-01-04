import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="flex min-h-screen bg-[#0f1419]">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="ml-64 flex-1 p-12 bg-[#0f1419]">
        {children}
      </main>
    </div>
  );
};

export default Layout;