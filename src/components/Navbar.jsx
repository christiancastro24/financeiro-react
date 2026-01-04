import React from 'react';

const Navbar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'analises', label: 'Análises', icon: '📈' },
    { id: 'orcamento', label: 'Orçamento Diário', icon: '📅' },
    { id: 'resumo', label: 'Resumo por Categoria', icon: '🍕' },
    { id: 'investimentos', label: 'Investimentos', icon: '💎' },
    { id: 'aposentadoria', label: 'Aposentadoria', icon: '🎯' },
    { id: 'jornada', label: 'Jornada 100k', icon: '🚀' },
    { id: 'metas', label: 'Metas & Sonhos', icon: '✨' },
  ];

  return (
    <div 
      className="w-[260px] bg-[#1a1f2e] h-screen fixed left-0 top-0 flex flex-col border-r border-[#2a2f3e]"
      style={{ 
        padding: '30px 0',
        boxShadow: '2px 0 20px rgba(0, 0, 0, 0.5)' 
      }}
    >
      <div 
        className="border-b border-[#2a2f3e]"
        style={{ padding: '0 30px 30px' }}
      >
        <h1 className="text-[22px] font-bold text-white" style={{ marginBottom: '4px' }}>
          💰 FinanceApp
        </h1>
        <p className="text-[#8b92a7] text-[13px]">Controle Financeiro</p>
      </div>

      <div className="flex-1" style={{ padding: '30px 0' }}>
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center cursor-pointer border-l-[3px] ${
              activeTab === item.id
                ? 'bg-[#1e2738] text-[#5b8def] border-l-[#5b8def]'
                : 'text-[#8b92a7] hover:bg-[#252b3b] hover:text-[#e4e6eb] border-l-transparent'
            }`}
            style={{
              padding: '14px 30px',
              fontSize: '15px',
              fontWeight: 500,
              transition: 'all 0.3s ease',
              gap: '12px'
            }}
          >
            <span className="text-center" style={{ fontSize: '18px', width: '24px' }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Navbar;