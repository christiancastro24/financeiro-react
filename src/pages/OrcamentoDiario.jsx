import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Target,
  AlertCircle,
} from "lucide-react";

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
        dailyBudget,
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

    const percentSpent = (totalSpent / budget) * 100;

    return {
      rows,
      totalSpent,
      availableToday: isCurrentMonth ? availableToday : accumulated,
      percentSpent,
      dailyBudget,
    };
  };

  const budgetData = renderBudgetTable();

  return (
    <div className="ml-[260px] flex-1 bg-[#0f1419] p-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-9">
        <div>
          <h2 className="text-[28px] font-bold text-white mb-1.5 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#f39c12] to-[#e67e22] rounded-xl flex items-center justify-center">
              <Calendar className="text-white" size={22} />
            </div>
            Orçamento Diário
          </h2>
          <div className="text-[#8b92a7] text-sm">
            Controle seus gastos dia a dia e acumule saldo disponível
          </div>
        </div>
      </div>

      {/* Navegação de Mês */}
      <div className="flex items-center justify-between bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] mb-8 py-4 px-6 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
        <button
          onClick={() => changeMonth(-1)}
          className="bg-[#252b3b] text-white border border-[#2a2f3e] text-[#8b92a7] rounded-lg cursor-pointer px-4 py-2.5 text-sm font-semibold transition-all hover:bg-[#2d3548] hover:border-[#5b8def] hover:text-[#5b8def]"
        >
          ← Anterior
        </button>
        <span className="text-lg font-bold text-white">{getMonthName()}</span>
        <button
          onClick={() => changeMonth(1)}
          className="bg-[#252b3b] text-white border border-[#2a2f3e] text-[#8b92a7] rounded-lg cursor-pointer px-4 py-2.5 text-sm font-semibold transition-all hover:bg-[#2d3548] hover:border-[#5b8def] hover:text-[#5b8def]"
        >
          Próximo →
        </button>
      </div>

      {budget === 0 ? (
        // Estado Vazio
        <div className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] p-12 shadow-[0_4px_12px_rgba(0,0,0,0.3)] text-center">
          <div className="w-20 h-20 bg-[#f39c12]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Target className="text-[#f39c12]" size={40} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">
            Configure seu orçamento mensal
          </h3>
          <p className="text-[#8b92a7] text-base mb-8 max-w-md mx-auto">
            Cadastre uma despesa com categoria "Gastos Gerais" no Dashboard para
            definir seu orçamento mensal e começar a controlar seus gastos
            diários.
          </p>
          <button className="bg-gradient-to-r from-[#5b8def] to-[#0063f7] text-white rounded-lg px-8 py-4 text-sm font-bold shadow-[0_4px_12px_rgba(91,141,239,0.4)] transition-all hover:shadow-[0_6px_20px_rgba(91,141,239,0.5)] hover:-translate-y-0.5">
            Ir para Dashboard
          </button>
        </div>
      ) : (
        <>
          {/* Cards de Resumo */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {/* Orçamento Mensal */}
            <div className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] border-l-4 border-l-[#5b8def] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-[#5b8def]/20 rounded-lg flex items-center justify-center">
                  <Target size={20} className="text-[#5b8def]" />
                </div>
                <div className="text-xs font-bold text-[#8b92a7] uppercase tracking-wide">
                  Orçamento
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                R$ {formatCurrency(budget)}
              </div>
              <div className="text-xs text-[#8b92a7]">
                R$ {formatCurrency(budgetData?.dailyBudget || 0)}/dia
              </div>
            </div>

            {/* Total Gasto */}
            <div className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] border-l-4 border-l-[#e74c3c] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-[#e74c3c]/20 rounded-lg flex items-center justify-center">
                  <TrendingDown size={20} className="text-[#e74c3c]" />
                </div>
                <div className="text-xs font-bold text-[#8b92a7] uppercase tracking-wide">
                  Gasto
                </div>
              </div>
              <div className="text-2xl font-bold text-[#e74c3c] mb-1">
                R$ {formatCurrency(budgetData?.totalSpent || 0)}
              </div>
              <div className="text-xs text-[#8b92a7]">
                {budgetData?.percentSpent.toFixed(1)}% do orçamento
              </div>
            </div>

            {/* Disponível Hoje */}
            <div className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] border-l-4 border-l-[#27ae60] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-[#27ae60]/20 rounded-lg flex items-center justify-center">
                  <TrendingUp size={20} className="text-[#27ae60]" />
                </div>
                <div className="text-xs font-bold text-[#8b92a7] uppercase tracking-wide">
                  Disponível
                </div>
              </div>
              <div className="text-2xl font-bold text-[#27ae60] mb-1">
                R${" "}
                {formatCurrency(Math.max(0, budgetData?.availableToday || 0))}
              </div>
              <div className="text-xs text-[#8b92a7]">Saldo acumulado</div>
            </div>

            {/* Economia */}
            <div className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] border-l-4 border-l-[#f39c12] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-[#f39c12]/20 rounded-lg flex items-center justify-center">
                  <DollarSign size={20} className="text-[#f39c12]" />
                </div>
                <div className="text-xs font-bold text-[#8b92a7] uppercase tracking-wide">
                  Economia
                </div>
              </div>
              <div className="text-2xl font-bold text-[#f39c12] mb-1">
                R${" "}
                {formatCurrency(
                  Math.max(0, budget - (budgetData?.totalSpent || 0))
                )}
              </div>
              <div className="text-xs text-[#8b92a7]">Restante do mês</div>
            </div>
          </div>

          {/* Barra de Progresso */}
          <div className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] p-6 mb-8 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-white">
                Uso do Orçamento
              </span>
              <span className="text-sm font-bold text-[#5b8def]">
                {budgetData?.percentSpent.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-3 bg-[#252b3b] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetData?.percentSpent > 90
                    ? "bg-gradient-to-r from-[#e74c3c] to-[#c0392b]"
                    : budgetData?.percentSpent > 70
                    ? "bg-gradient-to-r from-[#f39c12] to-[#e67e22]"
                    : "bg-gradient-to-r from-[#27ae60] to-[#229954]"
                }`}
                style={{
                  width: `${Math.min(budgetData?.percentSpent || 0, 100)}%`,
                }}
              />
            </div>
            {budgetData?.percentSpent > 90 && (
              <div className="flex items-center gap-2 mt-3 text-xs text-[#e74c3c]">
                <AlertCircle size={14} />
                <span>
                  Atenção: Você já utilizou mais de 90% do orçamento mensal!
                </span>
              </div>
            )}
          </div>

          {/* Tabela de Dias */}
          <div className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
            <div className="p-6 border-b border-[#2a2f3e]">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar size={20} className="text-[#5b8def]" />
                Controle Diário
              </h3>
              <p className="text-sm text-[#8b92a7] mt-1">
                Registre seus gastos diários e acompanhe o saldo acumulado
              </p>
            </div>

            <div className="max-h-[500px] overflow-y-auto transactions-list">
              <table className="w-full">
                <thead className="sticky top-0 bg-[#252b3b] z-10">
                  <tr className="border-b border-[#2a2f3e]">
                    <th className="text-left text-[#8b92a7] text-xs uppercase font-bold p-4 tracking-wider">
                      Dia
                    </th>
                    <th className="text-center text-[#8b92a7] text-xs uppercase font-bold p-4 tracking-wider">
                      Orçamento do Dia
                    </th>
                    <th className="text-center text-[#8b92a7] text-xs uppercase font-bold p-4 tracking-wider">
                      Gasto Realizado
                    </th>
                    <th className="text-right text-[#8b92a7] text-xs uppercase font-bold p-4 tracking-wider">
                      Saldo Acumulado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {budgetData?.rows.map(
                    ({ day, daySpent, available, isNegative, dailyBudget }) => {
                      const today = new Date().getDate();
                      const isCurrentMonth =
                        currentMonth.getMonth() === new Date().getMonth() &&
                        currentMonth.getFullYear() === new Date().getFullYear();
                      const isToday = isCurrentMonth && day === today;

                      return (
                        <tr
                          key={day}
                          className={`border-b border-[#2a2f3e] transition-all hover:bg-[#252b3b]/50 ${
                            isToday
                              ? "bg-[#5b8def]/10"
                              : daySpent > 0
                              ? "bg-[#1e2738]"
                              : ""
                          }`}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {isToday && (
                                <div className="w-2 h-2 bg-[#5b8def] rounded-full animate-pulse" />
                              )}
                              <span className="font-bold text-white">
                                Dia {day}
                                {isToday && (
                                  <span className="text-[#5b8def] text-xs ml-2">
                                    (Hoje)
                                  </span>
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className="text-[#8b92a7] text-sm">
                              R$ {formatCurrency(dailyBudget)}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="inline-flex items-center justify-center">
                              <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b92a7] text-sm font-medium pointer-events-none">
                                  R$
                                </div>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={daySpent || ""}
                                  placeholder="0,00"
                                  onChange={(e) =>
                                    updateDailySpending(day, e.target.value)
                                  }
                                  className="w-44 py-3 pl-12 pr-4 border border-[#2a2f3e] rounded-lg text-sm text-right bg-[#1e2738] text-white focus:border-[#5b8def] focus:bg-[#252b3b] focus:outline-none focus:ring-2 focus:ring-[#5b8def]/20 transition-all placeholder:text-[#5a6c7d] group-hover:border-[#5b8def]/50"
                                />
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isNegative ? (
                                <TrendingDown
                                  size={16}
                                  className="text-[#e74c3c]"
                                />
                              ) : (
                                <TrendingUp
                                  size={16}
                                  className="text-[#27ae60]"
                                />
                              )}
                              <span
                                className={`font-bold text-base ${
                                  isNegative
                                    ? "text-[#e74c3c]"
                                    : "text-[#27ae60]"
                                }`}
                              >
                                {isNegative ? "- " : ""}R${" "}
                                {formatCurrency(Math.abs(available))}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrcamentoDiario;
