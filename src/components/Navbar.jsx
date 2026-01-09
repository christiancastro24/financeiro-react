import React, { useState } from "react";
import { LogOut } from "lucide-react";

function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

const Navbar = ({ activeTab, setActiveTab, onLogout }) => {
  const [_userName] = useState(() => {
    return localStorage.getItem("financeapp_username") || "Admin";
  });

  const handleLogout = () => {
    deleteCookie("financeapp_auth");
    localStorage.removeItem("financeapp_username");
    localStorage.removeItem("financeapp_auth");

    if (typeof onLogout === "function") {
      onLogout();
    }

    window.location.href = "/";
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "analysis", label: "Análises", icon: "📈" },
    { id: "budget", label: "Orçamento Diário", icon: "📅" },
    { id: "cards", label: "Cartões", icon: "💳" },
    { id: "investments", label: "Investimentos", icon: "💎" },
    { id: "retirement", label: "Aposentadoria", icon: "🎯" },
    { id: "goals", label: "Metas & Sonhos", icon: "✨" },
    { id: "settings", label: "Configurações", icon: "⚙️" },
  ];

  return (
    <div className="w-[270px] h-screen fixed left-0 top-0 bg-[#1a1d29] border-r border-[#2a2d3a] flex flex-col">
      <div className="p-6 pb-5 border-b border-[#2a2d3a]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#2563eb] rounded-lg flex items-center justify-center text-lg">
            💰
          </div>
          <span className="text-lg font-semibold text-white">FinanceApp</span>
        </div>
        <p className="text-[#6b7280] text-xs pl-[52px]">Financial Control</p>
      </div>

      <div className="flex-1 px-3 py-4 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 py-2.5 px-3 mb-1 rounded-lg cursor-pointer transition-all font-medium text-sm ${
              activeTab === item.id
                ? "bg-[#2563eb] text-white"
                : "bg-transparent text-[#9ca3af] hover:bg-[#252833] hover:text-white"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-[#2a2d3a]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#252833] border border-[#2a2d3a] rounded-lg text-[#9ca3af] font-medium text-sm cursor-pointer transition-all hover:bg-[#dc2626] hover:text-white hover:border-[#dc2626]"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </div>
  );
};

export default Navbar;