import React from "react";
import Navbar from "./Navbar";

const Layout = ({ children, activeTab, setActiveTab, onLogout, navigate }) => {
  return (
    <div className="flex min-h-screen bg-[#0f1419]">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout}
        navigate={navigate} 
      />
      <main className="flex-1 bg-[#0f1419] overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;