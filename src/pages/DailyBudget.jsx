import React, { useState, useEffect } from "react";
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

  // --- LÓGICA DE TEMA (IGUAL AO DASHBOARD) ---
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("financeapp_theme") || "dark";
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const savedTheme = localStorage.getItem("financeapp_theme") || "dark";
      setTheme(savedTheme);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const colors = {
    primary: theme === "dark" ? "#0f1419" : "#f8f9fa",
    secondary: theme === "dark" ? "#1a1f2e" : "#ffffff",
    tertiary: theme === "dark" ? "#252b3b" : "#f1f3f5",
    border: theme === "dark" ? "#2a2f3e" : "#dee2e6",
    textPrimary: theme === "dark" ? "#ffffff" : "#1a1f2e",
    textSecondary: theme === "dark" ? "#8b92a7" : "#6c757d",
    inputBg: theme === "dark" ? "#1e2738" : "#ffffff",
  };

  // --- TODA SUA REGRA DE NEGÓCIO ORIGINAL ABAIXO ---
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
        [monthKey]: { ...(prev[monthKey] || {}), [day]: numValue },
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
      rows.push({
        day,
        daySpent,
        available: accumulated,
        isNegative: accumulated < 0,
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
        availableToday += dailyBudget - (monthSpending[day] || 0);
      }
    }
    return {
      rows,
      totalSpent,
      availableToday: isCurrentMonth ? availableToday : accumulated,
      percentSpent: (totalSpent / budget) * 100,
      dailyBudget,
    };
  };

  const budgetData = renderBudgetTable();

  return (
    <div
      className="ml-[260px] flex-1 p-10 min-h-screen transition-colors duration-300"
      style={{ backgroundColor: colors.primary }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2
            className="text-xl font-bold mb-1 flex items-center gap-2.5"
            style={{ color: colors.textPrimary }}
          >
            Orçamento Diário
          </h2>
          <div style={{ color: colors.textSecondary }} className="text-xs">
            Controle seus gastos dia a dia e acumule saldo disponível
          </div>
        </div>
      </div>

      {/* Navegação de Mês */}
      <div
        className="flex items-center justify-between rounded-lg border mb-5 py-2.5 px-4 shadow"
        style={{
          backgroundColor: colors.secondary,
          borderColor: colors.border,
        }}
      >
        <button
          onClick={() => changeMonth(-1)}
          className="rounded-lg cursor-pointer px-3 py-1.5 text-xs font-semibold transition-all border"
          style={{
            backgroundColor: colors.tertiary,
            borderColor: colors.border,
            color: colors.textSecondary,
          }}
        >
          ← Anterior
        </button>
        <span
          className="text-base font-bold"
          style={{ color: colors.textPrimary }}
        >
          {getMonthName()}
        </span>
        <button
          onClick={() => changeMonth(1)}
          className="rounded-lg cursor-pointer px-3 py-1.5 text-xs font-semibold transition-all border"
          style={{
            backgroundColor: colors.tertiary,
            borderColor: colors.border,
            color: colors.textSecondary,
          }}
        >
          Próximo →
        </button>
      </div>

      {budget === 0 ? (
        <div
          className="rounded-lg border p-10 shadow text-center"
          style={{
            backgroundColor: colors.secondary,
            borderColor: colors.border,
          }}
        >
          <div className="w-16 h-16 bg-[#f39c12]/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <Target className="text-[#f39c12]" size={32} />
          </div>
          <h3
            className="text-xl font-bold mb-2.5"
            style={{ color: colors.textPrimary }}
          >
            Configure seu orçamento mensal
          </h3>
          <p
            className="text-sm mb-6 max-w-md mx-auto"
            style={{ color: colors.textSecondary }}
          >
            Cadastre uma despesa com categoria "Gastos Gerais" no Dashboard para
            definir seu orçamento mensal.
          </p>
        </div>
      ) : (
        <>
          {/* Cards de Resumo */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              {
                label: "Orçamento",
                value: `R$ ${formatCurrency(budget)}`,
                sub: `R$ ${formatCurrency(budgetData?.dailyBudget || 0)}/dia`,
                icon: Target,
                color: "#5b8def",
              },
              {
                label: "Gasto",
                value: `R$ ${formatCurrency(budgetData?.totalSpent || 0)}`,
                sub: `${budgetData?.percentSpent.toFixed(1)}% do total`,
                icon: TrendingDown,
                color: "#e74c3c",
              },
              {
                label: "Disponível",
                value: `R$ ${formatCurrency(
                  Math.max(0, budgetData?.availableToday || 0)
                )}`,
                sub: "Saldo acumulado",
                icon: TrendingUp,
                color: "#27ae60",
              },
              {
                label: "Economia",
                value: `R$ ${formatCurrency(
                  Math.max(0, budget - (budgetData?.totalSpent || 0))
                )}`,
                sub: "Restante do mês",
                icon: DollarSign,
                color: "#f39c12",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="rounded-lg border border-l-4 p-4 shadow transition-all hover:-translate-y-1"
                style={{
                  backgroundColor: colors.secondary,
                  borderColor: colors.border,
                  borderLeftColor: card.color,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${card.color}20` }}
                  >
                    <card.icon size={16} style={{ color: card.color }} />
                  </div>
                  <div
                    className="text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: colors.textSecondary }}
                  >
                    {card.label}
                  </div>
                </div>
                <div
                  className="text-lg font-bold mb-1"
                  style={{
                    color:
                      i === 1
                        ? "#e74c3c"
                        : i === 2
                        ? "#27ae60"
                        : i === 3
                        ? "#f39c12"
                        : colors.textPrimary,
                  }}
                >
                  {card.value}
                </div>
                <div
                  className="text-[10px]"
                  style={{ color: colors.textSecondary }}
                >
                  {card.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Barra de Progresso */}
          <div
            className="rounded-lg border p-4 mb-6 shadow"
            style={{
              backgroundColor: colors.secondary,
              borderColor: colors.border,
            }}
          >
            <div className="flex items-center justify-between mb-2.5">
              <span
                className="text-xs font-semibold"
                style={{ color: colors.textPrimary }}
              >
                Uso do Orçamento
              </span>
              <span className="text-xs font-bold text-[#5b8def]">
                {budgetData?.percentSpent.toFixed(1)}%
              </span>
            </div>
            <div
              className="w-full h-2.5 rounded-full overflow-hidden"
              style={{ backgroundColor: colors.tertiary }}
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetData?.percentSpent > 90
                    ? "bg-[#e74c3c]"
                    : budgetData?.percentSpent > 70
                    ? "bg-[#f39c12]"
                    : "bg-[#27ae60]"
                }`}
                style={{
                  width: `${Math.min(budgetData?.percentSpent || 0, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Tabela de Dias */}
          <div
            className="rounded-lg border overflow-hidden shadow"
            style={{
              backgroundColor: colors.secondary,
              borderColor: colors.border,
            }}
          >
            <div
              className="p-4 border-b"
              style={{ borderColor: colors.border }}
            >
              <h3
                className="text-base font-bold flex items-center gap-2"
                style={{ color: colors.textPrimary }}
              >
                <Calendar size={16} className="text-[#5b8def]" /> Controle
                Diário
              </h3>
            </div>

            <div className="max-h-[450px] overflow-y-auto transactions-list">
              <table className="w-full border-collapse">
                <thead
                  className="sticky top-0 z-10"
                  style={{ backgroundColor: colors.tertiary }}
                >
                  <tr>
                    {[
                      "Dia",
                      "Orçamento do Dia",
                      "Gasto Realizado",
                      "Saldo Acumulado",
                    ].map((h, i) => (
                      <th
                        key={h}
                        className={`text-[#8b92a7] text-[10px] uppercase font-bold p-3 tracking-wider ${
                          i === 0
                            ? "text-left"
                            : i === 3
                            ? "text-right"
                            : "text-center"
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {budgetData?.rows.map(
                    ({ day, daySpent, available, isNegative, dailyBudget }) => {
                      const isToday =
                        currentMonth.getMonth() === new Date().getMonth() &&
                        currentMonth.getFullYear() ===
                          new Date().getFullYear() &&
                        day === new Date().getDate();
                      return (
                        <tr
                          key={day}
                          className="border-b transition-all"
                          style={{
                            borderColor: colors.border,
                            backgroundColor: isToday
                              ? `${colors.tertiary}80`
                              : "transparent",
                          }}
                        >
                          <td
                            className="p-3 font-bold text-sm"
                            style={{ color: colors.textPrimary }}
                          >
                            Dia {day}{" "}
                            {isToday && (
                              <span className="text-[#5b8def] text-[10px] ml-2">
                                (Hoje)
                              </span>
                            )}
                          </td>
                          <td
                            className="p-3 text-center text-xs"
                            style={{ color: colors.textSecondary }}
                          >
                            R$ {formatCurrency(dailyBudget)}
                          </td>
                          <td className="p-3 text-center">
                            <div className="relative inline-block">
                              <span
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px]"
                                style={{ color: colors.textSecondary }}
                              >
                                R$
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                value={daySpent || ""}
                                onChange={(e) =>
                                  updateDailySpending(day, e.target.value)
                                }
                                className="w-28 py-1.5 pl-7 pr-2 border rounded-lg text-xs text-right focus:outline-none focus:ring-2 focus:ring-[#5b8def]/20 transition-all"
                                style={{
                                  backgroundColor: colors.inputBg,
                                  borderColor: colors.border,
                                  color: colors.textPrimary,
                                }}
                              />
                            </div>
                          </td>
                          <td
                            className="p-3 text-right font-bold text-sm"
                            style={{
                              color: isNegative ? "#e74c3c" : "#27ae60",
                            }}
                          >
                            {isNegative ? "- " : ""}R${" "}
                            {formatCurrency(Math.abs(available))}
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
