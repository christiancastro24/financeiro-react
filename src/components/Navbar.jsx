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
    { id: "analises", label: "Análises", icon: "📈" },
    { id: "orcamento", label: "Orçamento Diário", icon: "📅" },
    { id: "resumo", label: "Resumo por Categoria", icon: "🍕" },
    { id: "investimentos", label: "Investimentos", icon: "💎" },
    { id: "aposentadoria", label: "Aposentadoria", icon: "🎯" },
    { id: "jornada", label: "Jornada 100k", icon: "🚀" },
    { id: "metas", label: "Metas & Sonhos", icon: "✨" },
  ];

  return (
    <div className="w-[260px] h-screen fixed left-0 top-0 bg-[#1a1f2e] border-r border-[#2a2f3e] flex flex-col shadow-[2px_0_20px_rgba(0,0,0,0.5)]">
      <div className="py-[30px] px-6 border-b border-[#2a2f3e]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[#5b8def] to-[#0063f7] rounded-[10px] flex items-center justify-center text-xl">
            💰
          </div>
          <span className="text-[22px] font-bold text-white">FinanceApp</span>
        </div>
        <p className="text-[#8b92a7] text-[13px] m-0">Controle Financeiro</p>
      </div>

      <div className="flex-1 p-0 overflow-y-auto">
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 py-3.5 px-[30px] cursor-pointer transition-all font-medium text-[15px] border-l-[3px] ${
              activeTab === item.id
                ? "bg-[#1e2738] text-[#5b8def] border-l-[#5b8def]"
                : "bg-transparent text-[#8b92a7] border-l-transparent hover:bg-[#252b3b] hover:text-[#e4e6eb]"
            }`}
          >
            <span className="text-lg w-6 text-center">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="py-5 px-6 border-t border-[#2a2f3e]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-[#252b3b] border border-[#2a2f3e] rounded-[10px] text-[#ef4444] font-semibold text-[15px] cursor-pointer transition-all hover:bg-[#2a2f3e] hover:border-[#ef4444]"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </div>
  );
};

export default Navbar;
