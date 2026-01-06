import React, { useState } from "react";

const ResumoCategoria = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [transactions] = useState(() => {
    const saved = localStorage.getItem("financialData");
    return saved ? JSON.parse(saved) : [];
  });

  const formatCurrency = (value) => {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getMonthName = () => {
    const months = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
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
      .filter((t) => t.type === "expense" && t.paid)
      .forEach((t) => {
        categories[t.category] = (categories[t.category] || 0) + t.value;
      });

    return Object.entries(categories).sort((a, b) => b[1] - a[1]);
  };

  const categorySummary = getCategorySummary();

  return (
    <div className="ml-[260px] flex-1 bg-[#0f1419] p-10">
      <div className="flex justify-between items-center mb-9">
        <div>
          <h2 className="text-[28px] font-bold text-white mb-1.5">
            Resumo por Categoria
          </h2>
          <div className="text-[#8b92a7] text-sm">
            Gestão de receitas e despesas
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] mb-8 p-[18px_24px] shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
        <button
          onClick={() => changeMonth(-1)}
          className="bg-[#252b3b] text-white border border-[#2a2f3e] text-[#8b92a7] rounded-lg cursor-pointer hover:bg-[#2d3548] hover:border-[#5b8def] hover:text-[#5b8def] px-[18px] py-2.5 text-sm font-semibold transition-all duration-200"
        >
          ← Anterior
        </button>
        <span className="text-lg font-bold text-white">{getMonthName()}</span>
        <button
          onClick={() => changeMonth(1)}
          className="bg-[#252b3b] text-white border border-[#2a2f3e] text-[#8b92a7] rounded-lg cursor-pointer hover:bg-[#2d3548] hover:border-[#5b8def] hover:text-[#5b8def] px-[18px] py-2.5 text-sm font-semibold transition-all duration-200"
        >
          Próximo →
        </button>
      </div>

      <div className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] p-7 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
        {categorySummary.length === 0 ? (
          <div className="text-center bg-[#1e2738] rounded-lg border border-[#2a2f3e] py-[60px] px-5">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-lg font-bold text-white mb-2">
              Nenhum gasto registrado neste mês
            </h3>
            <p className="text-[#8b92a7] text-sm">
              As despesas pagas aparecerão aqui organizadas por categoria
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {categorySummary.map(([category, value]) => (
              <div
                key={category}
                className="bg-[#252b3b] rounded-lg border border-[#2a2f3e] hover:border-[#5b8def] hover:translate-x-1 p-5 px-6 flex justify-between items-center transition-all duration-200"
              >
                <span className="text-white text-base font-bold">
                  {category}
                </span>
                <span className="text-[#e74c3c] text-xl font-bold">
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
