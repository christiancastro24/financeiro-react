import React from "react";
import Navbar from "./Navbar";

const Layout = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="flex min-h-screen bg-[#0f1419]">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 bg-[#0f1419]">{children}</main>
    </div>
  );
};

export default Layout;
