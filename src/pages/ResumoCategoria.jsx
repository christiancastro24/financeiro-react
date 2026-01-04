import React, { useState } from 'react';

const ResumoCategoria = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [transactions] = useState(() => {
    const saved = localStorage.getItem('financialData');
    return saved ? JSON.parse(saved) : [];
  });

  const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getMonthName = () => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${months[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
  };

  const changeMonth = (delta) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentMonth(newDate);
  };

  const getMonthTransactions = () => {
    return transactions.filter((t) => {
      const tDate = new Date(t.date);
      return (
        tDate.getMonth() === currentMonth.getMonth() &&
        tDate.getFullYear() === currentMonth.getFullYear()
      );
    });
  };

  const getCategorySummary = () => {
    const monthTransactions = getMonthTransactions();
    const categories = {};

    monthTransactions
      .filter((t) => t.type === 'expense' && t.paid)
      .forEach((t) => {
        categories[t.category] = (categories[t.category] || 0) + t.value;
      });

    return Object.entries(categories).sort((a, b) => b[1] - a[1]);
  };

  const categorySummary = getCategorySummary();

  return (
    <div className="ml-[260px] flex-1 bg-[#0f1419]" style={{ padding: '40px 50px' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '35px' }}>
        <div>
          <h2 className="text-[28px] font-bold text-white" style={{ marginBottom: '6px', fontWeight: 'bold' }}>
            Resumo por Categoria
          </h2>
          <div className="text-[#8b92a7] text-[14px]">
            Gestão de receitas e despesas
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-between bg-[#1a1f2e] rounded-xl border border-[#2a2f3e]"
        style={{
          marginBottom: '30px',
          padding: '18px 24px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          borderRadius: '0.5rem',
        }}
      >
        <button
          onClick={() => changeMonth(-1)}
          className="bg-[#252b3b] border border-[#2a2f3e] text-[#8b92a7] rounded-lg cursor-pointer hover:bg-[#2d3548] hover:border-[#5b8def] hover:text-[#5b8def]"
          style={{
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'all 0.2s ease',
            borderRadius: '0.5rem',
          }}
        >
          ← Anterior
        </button>
        <span className="text-[18px] font-bold text-white" style={{ fontWeight: 'bold' }}>
          {getMonthName()}
        </span>
        <button
          onClick={() => changeMonth(1)}
          className="bg-[#252b3b] border border-[#2a2f3e] text-[#8b92a7] rounded-lg cursor-pointer hover:bg-[#2d3548] hover:border-[#5b8def] hover:text-[#5b8def]"
          style={{
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'all 0.2s ease',
            borderRadius: '0.5rem',
          }}
        >
          Próximo →
        </button>
      </div>

      <div className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e]" style={{ padding: '28px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)', borderRadius: '0.5rem' }}>
        {categorySummary.length === 0 ? (
          <div className="text-center bg-[#1e2738] rounded-lg border border-[#2a2f3e]" style={{ padding: '60px 20px' }}>
            <div className="text-[48px]" style={{ marginBottom: '16px' }}>📊</div>
            <h3 className="text-[18px] font-bold text-white" style={{ marginBottom: '8px', fontWeight: 'bold' }}>
              Nenhum gasto registrado neste mês
            </h3>
            <p className="text-[#8b92a7] text-[14px]">
              As despesas pagas aparecerão aqui organizadas por categoria
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {categorySummary.map(([category, value]) => (
              <div
                key={category}
                className="bg-[#252b3b] rounded-lg border border-[#2a2f3e] hover:border-[#5b8def] hover:transform hover:translate-x-1"
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  borderRadius: '0.5rem',
                }}
              >
                <span className="text-white text-[16px] font-bold" style={{ fontWeight: 'bold' }}>
                  {category}
                </span>
                <span className="text-[#e74c3c] text-[20px] font-bold" style={{ fontWeight: 'bold' }}>
                  R$ {formatCurrency(value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumoCategoria;