import React, { useState } from "react";

const OrcamentoDiario = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dailySpending, setDailySpending] = useState(() => {
    const saved = localStorage.getItem("dailySpending");
    return saved ? JSON.parse(saved) : {};
  });

  const [transactions, _setTransactions] = useState(() => {
    const saved = localStorage.getItem("financialData");
    return saved ? JSON.parse(saved) : [];
  });

  const formatCurrency = (value) => {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getMonthKey = () => {
    return `${currentMonth.getFullYear()}-${String(
      currentMonth.getMonth() + 1
    ).padStart(2, "0")}`;
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

  const getMonthlyBudgetFromTransactions = () => {
    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return (
        tDate.getMonth() === currentMonth.getMonth() &&
        tDate.getFullYear() === currentMonth.getFullYear() &&
        t.type === "expense" &&
        t.category === "GastosGerais"
      );
    });

    return monthTransactions.reduce((sum, t) => sum + t.value, 0);
  };

  const budget = getMonthlyBudgetFromTransactions();

  const changeMonth = (delta) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentMonth(newDate);
  };

  const updateDailySpending = (day, value) => {
    const monthKey = getMonthKey();
    const numValue = parseFloat(value) || 0;

    setDailySpending((prev) => {
      const updated = {
        ...prev,
        [monthKey]: {
          ...(prev[monthKey] || {}),
          [day]: numValue,
        },
      };
      localStorage.setItem("dailySpending", JSON.stringify(updated));
      return updated;
    });
  };

  const renderBudgetTable = () => {
    if (budget === 0) return null;

    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();

    const dailyBudget = budget / daysInMonth;
    const monthKey = getMonthKey();
    const monthSpending = dailySpending[monthKey] || {};

    let accumulated = 0;
    let totalSpent = 0;
    const rows = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const daySpent = monthSpending[day] || 0;
      totalSpent += daySpent;
      accumulated += dailyBudget - daySpent;

      const available = accumulated;
      const isNegative = available < 0;

      rows.push({
        day,
        daySpent,
        available,
        isNegative,
      });
    }

    const today = new Date().getDate();
    const isCurrentMonth =
      currentMonth.getMonth() === new Date().getMonth() &&
      currentMonth.getFullYear() === new Date().getFullYear();

    let availableToday = 0;
    if (isCurrentMonth) {
      for (let day = 1; day <= today; day++) {
        const daySpent = monthSpending[day] || 0;
        availableToday += dailyBudget - daySpent;
      }
    }

    return {
      rows,
      totalSpent,
      availableToday: isCurrentMonth ? availableToday : accumulated,
    };
  };

  const budgetData = renderBudgetTable();

  return (
    <div className="ml-[260px] flex-1 bg-[#0f1419] p-10">
      <div className="flex justify-between items-center mb-9">
        <div>
          <h2 className="text-[28px] font-bold text-white mb-1.5">
            Orçamento Diário
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
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">
              Orçamento Mensal - Gastos Gerais
            </h3>
            <p className="text-[#8b92a7] text-sm">
              Registre manualmente os gastos de cada dia. O saldo disponível
              acumula automaticamente.
            </p>
          </div>
          {budget > 0 && (
            <div className="bg-[#252b3b] rounded-lg border border-[#2a2f3e] p-4 px-6 min-w-[200px]">
              <div className="text-[#8b92a7] text-xs uppercase tracking-wider mb-1.5">
                Orçamento Mensal
              </div>
              <div className="text-2xl font-bold text-[#5b8def]">
                R$ {formatCurrency(budget)}
              </div>
            </div>
          )}
        </div>

        {budget === 0 ? (
          <div className="text-center bg-[#1e2738] rounded-lg border border-[#2a2f3e] py-[60px] px-5">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-lg font-bold text-white mb-2">
              Nenhum orçamento definido
            </h3>
            <p className="text-[#8b92a7] text-sm mb-5">
              Cadastre uma despesa com categoria "Gastos Gerais" no Dashboard
              para começar.
            </p>
            <button className="bg-[#5b8def] text-white rounded-lg cursor-pointer hover:bg-[#4a7dd9] px-6 py-3 text-sm font-bold border-none shadow-[0_4px_12px_rgba(91,141,239,0.3)] transition-all duration-200">
              Ir para Dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[#252b3b] rounded-lg border border-[#2a2f3e] p-4">
                <div className="text-[#8b92a7] text-xs uppercase mb-2 tracking-wider">
                  Orçamento Total
                </div>
                <div className="text-xl font-bold text-white">
                  R$ {formatCurrency(budget)}
                </div>
              </div>
              <div className="bg-[#252b3b] rounded-lg border border-[#2a2f3e] p-4">
                <div className="text-[#8b92a7] text-xs uppercase mb-2 tracking-wider">
                  Total Gasto
                </div>
                <div className="text-xl font-bold text-[#e74c3c]">
                  R$ {formatCurrency(budgetData?.totalSpent || 0)}
                </div>
              </div>
              <div className="bg-[#252b3b] rounded-lg border border-[#2a2f3e] p-4">
                <div className="text-[#8b92a7] text-xs uppercase mb-2 tracking-wider">
                  Disponível Hoje
                </div>
                <div className="text-xl font-bold text-[#27ae60]">
                  R${" "}
                  {formatCurrency(Math.max(0, budgetData?.availableToday || 0))}
                </div>
              </div>
            </div>

            <div className="bg-[#252b3b] rounded-lg border border-[#2a2f3e] max-h-[500px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-[#252b3b]">
                  <tr className="border-b border-[#2a2f3e]">
                    <th className="text-left text-[#8b92a7] text-xs uppercase font-bold p-4 tracking-wider w-[100px]">
                      Dia
                    </th>
                    <th className="text-center text-[#8b92a7] text-xs uppercase font-bold p-4 tracking-wider w-[200px]">
                      Gasto no Dia
                    </th>
                    <th className="text-right text-[#8b92a7] text-xs uppercase font-bold p-4 tracking-wider w-[180px]">
                      Disponível Acumulado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {budgetData?.rows.map(
                    ({ day, daySpent, available, isNegative }) => (
                      <tr
                        key={day}
                        className={`border-b border-[#2a2f3e] ${
                          daySpent > 0 ? "bg-[#1a1f2e]" : ""
                        }`}
                      >
                        <td className="font-bold text-white p-3 px-4">
                          Dia {day}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="inline-block relative w-[140px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#95a5a6] text-sm pointer-events-none">
                              R$
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={daySpent || ""}
                              placeholder="0,00"
                              onChange={(e) =>
                                updateDailySpending(day, e.target.value)
                              }
                              className="w-full py-2.5 px-3 pl-8 border border-[#2a2f3e] rounded-md text-sm text-right bg-[#1a1f2e] text-white transition-all duration-200"
                            />
                          </div>
                        </td>
                        <td
                          className={`text-right font-bold p-3 pr-5 pl-3 text-[15px] ${
                            isNegative ? "text-[#e74c3c]" : "text-[#27ae60]"
                          }`}
                        >
                          {isNegative ? "- " : ""}R${" "}
                          {formatCurrency(Math.abs(available))}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrcamentoDiario;
