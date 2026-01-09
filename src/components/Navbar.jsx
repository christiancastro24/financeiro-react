import React, { useState, useEffect } from "react";
import { LogOut, ChevronRight, ChevronDown } from "lucide-react";

function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

const Navbar = ({ activeTab, setActiveTab, onLogout }) => {
  const [_userName] = useState(() => {
    return localStorage.getItem("financeapp_username") || "Admin";
  });

  // Estado para controlar se o submenu está aberto
  const [openSubmenu, setOpenSubmenu] = useState(false);

  // Verificar se está em ambiente de produção (Vercel)
  const isProduction = window.location.hostname.includes("vercel.app") || 
                       window.location.hostname.includes("financeiro-react");

  // Quando clicar em Open Finance, abre o submenu e seleciona a primeira opção
  useEffect(() => {
    if (activeTab === "openfinance" || activeTab === "openfinance-analysis") {
      setOpenSubmenu(true);
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

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "analysis", label: "Análises", icon: "📈" },
    { id: "budget", label: "Orçamento Diário", icon: "📅" },
    { id: "cards", label: "Cartões", icon: "💳" },
    { 
      id: "openfinance", 
      label: "Open Finance", 
      icon: "🔗",
      hasSubmenu: true,
      hidden: isProduction // Flag para esconder em produção
    },
    { id: "investments", label: "Investimentos", icon: "💎" },
    { id: "retirement", label: "Aposentadoria", icon: "🎯" },
    { id: "goals", label: "Metas & Sonhos", icon: "✨" },
    { id: "settings", label: "Configurações", icon: "⚙️" },
  ];

  // Itens do submenu do Open Finance
  const openFinanceSubmenu = [
    { id: "openfinance", label: "Dashboard", icon: "📋" },
    { id: "openfinance-analysis", label: "Análises Financeiras", icon: "📈" },
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
        {menuItems.map((item) => {
          // ESCODER ITEM SE hidden = true
          if (item.hidden) {
            return null; // Não renderiza nada
          }

          if (item.id === "openfinance") {
            return (
              <div key={item.id} className="mb-1">
                {/* Botão principal do Open Finance */}
                <button
                  onClick={() => {
                    setOpenSubmenu(!openSubmenu);
                    if (!openSubmenu) {
                      setActiveTab("openfinance");
                    }
                  }}
                  className={`w-full flex items-center justify-between py-2.5 px-3 rounded-lg cursor-pointer transition-all font-medium text-sm ${
                    activeTab === "openfinance" ||
                    activeTab === "openfinance-analysis"
                      ? "bg-[#2563eb] text-white"
                      : "bg-transparent text-[#9ca3af] hover:bg-[#252833] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {openSubmenu ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>

                {/* Submenu - Estilo modificado */}
                {openSubmenu && (
                  <div className="ml-8 mt-1 mb-2 space-y-0.5">
                    {openFinanceSubmenu.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => setActiveTab(subItem.id)}
                        className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-md cursor-pointer transition-all font-medium text-sm relative group ${
                          activeTab === subItem.id
                            ? "text-blue-400"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        {/* Ícone */}
                        <span className="text-base">{subItem.icon}</span>

                        {/* Texto */}
                        <span>{subItem.label}</span>

                        {/* Indicador ativo - traço na esquerda */}
                        {activeTab === subItem.id && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full" />
                        )}

                        {/* Efeito de hover - traço na parte inferior */}
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
              onClick={() => {
                setActiveTab(item.id);
                setOpenSubmenu(false);
              }}
              className={`w-full flex items-center gap-3 py-2.5 px-3 mb-1 rounded-lg cursor-pointer transition-all font-medium text-sm ${
                activeTab === item.id
                  ? "bg-[#2563eb] text-white"
                  : "bg-transparent text-[#9ca3af] hover:bg-[#252833] hover:text-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
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