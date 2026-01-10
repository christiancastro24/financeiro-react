import React, { useState, useEffect } from "react";
import { LogOut, ChevronRight, ChevronDown, HelpCircle } from "lucide-react";

function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

const Navbar = ({ activeTab, setActiveTab, onLogout }) => {
  const [_userName] = useState(() => {
    return localStorage.getItem("financeapp_username") || "Admin";
  });

  // Estado para controlar quais submenus estão abertos
  const [openSubmenus, setOpenSubmenus] = useState({
    openfinance: false,
    goals: false,
  });

  // Quando clicar em Open Finance, abre o submenu e seleciona a primeira opção
  useEffect(() => {
    if (activeTab === "openfinance" || activeTab === "openfinance-analysis") {
      setOpenSubmenus(prev => ({ ...prev, openfinance: true }));
    }
    
    if (activeTab === "retirement" || activeTab === "goals") {
      setOpenSubmenus(prev => ({ ...prev, goals: true }));
    }
  }, [activeTab]);

  const handleLogout = () => {
    deleteCookie("financeapp_auth");
    localStorage.removeItem("financeapp_username");
    localStorage.removeItem("financeapp_auth");

    if (typeof onLogout === "function") {
      onLogout();
    }

    window.location.href = "/";
  };

  const toggleSubmenu = (menuId) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "cards", label: "Cartões", icon: "💳" },
    { id: "investments", label: "Investimentos", icon: "💎" },
    {
      id: "openfinance",
      label: "Open Finance",
      icon: "🔗",
      hasSubmenu: true,
    },
    {
      id: "goals",
      label: "Metas",
      icon: "🎯",
      hasSubmenu: true,
    },
    { id: "support", label: "Suporte", icon: <HelpCircle size={18} />, isCustomIcon: true },
    { id: "settings", label: "Configurações", icon: "⚙️" },
  ];

  // Itens do submenu do Open Finance
  const openFinanceSubmenu = [
    { id: "openfinance", label: "Dashboard", icon: "📋" },
    { id: "openfinance-analysis", label: "Análises", icon: "📈" },
  ];

  // Itens do submenu de Metas
  const goalsSubmenu = [
    { id: "retirement", label: "Aposentadoria", icon: "👵" },
    { id: "goals", label: "Metas & Sonhos", icon: "✨" },
  ];

  return (
    <div className="w-[260px] h-screen fixed left-0 top-0 bg-[#1a1d29] border-r border-[#2a2d3a] flex flex-col">
      <div className="p-6 pb-5 border-b border-[#2a2d3a]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#2563eb] rounded-lg flex items-center justify-center text-lg">
            💰
          </div>
          <span className="text-lg font-semibold text-white">UpGrana</span>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 overflow-y-auto">
        {menuItems.map((item) => {
          if (item.hasSubmenu) {
            const isOpen = openSubmenus[item.id];
            const submenuItems = item.id === "openfinance" ? openFinanceSubmenu : goalsSubmenu;
            const isAnySubActive = submenuItems.some(sub => sub.id === activeTab);

            return (
              <div key={item.id} className="mb-1">
                {/* Botão principal com seta */}
                <button
                  onClick={() => toggleSubmenu(item.id)}
                  className={`w-full flex items-center justify-between py-3 px-3 rounded-lg cursor-pointer transition-all font-medium text-sm ${
                    isAnySubActive
                      ? "bg-[#2563eb20] text-blue-400"
                      : "bg-transparent text-[#9ca3af] hover:bg-[#252833] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {isOpen ? (
                    <ChevronDown size={16} className="text-current" />
                  ) : (
                    <ChevronRight size={16} className="text-current" />
                  )}
                </button>

                {/* Submenu - fonte menor */}
                {isOpen && (
                  <div className="mt-1 mb-2 ml-3 pl-6 border-l border-[#2a2d3a] space-y-1">
                    {submenuItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => setActiveTab(subItem.id)}
                        className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-md cursor-pointer transition-all font-medium text-xs ${
                          activeTab === subItem.id
                            ? "bg-[#2563eb] text-white"
                            : "text-gray-400 hover:bg-[#252833] hover:text-white"
                        }`}
                      >
                        {/* Ícone do subitem */}
                        <span className="text-sm">{subItem.icon}</span>
                        
                        {/* Texto do subitem - fonte menor */}
                        <span className="text-xs">{subItem.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 py-3 px-3 mb-2 rounded-lg cursor-pointer transition-all font-medium text-sm ${
                activeTab === item.id
                  ? "bg-[#2563eb] text-white"
                  : "bg-transparent text-[#9ca3af] hover:bg-[#252833] hover:text-white"
              }`}
            >
              {/* Ícone */}
              {item.isCustomIcon ? (
                <span className="text-base">{item.icon}</span>
              ) : (
                <span className="text-base">{item.icon}</span>
              )}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Apenas Sair no rodapé */}
      <div className="p-5 border-t border-[#2a2d3a]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#252833] border border-[#2a2d3a] rounded-lg text-[#9ca3af] font-medium text-sm cursor-pointer transition-all hover:bg-[#dc2626] hover:text-white hover:border-[#dc2626]"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </div>
  );
};

export default Navbar;