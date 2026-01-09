import React, { useEffect, useRef, useState } from "react";

const Analises = () => {
  const patrimonialChartRef = useRef(null);
  const categoryPieChartRef = useRef(null);
  const incomeExpenseChartRef = useRef(null);

  const [patrimonialChart, setPatrimonialChart] = useState(null);
  const [categoryPieChart, setCategoryPieChart] = useState(null);
  const [incomeExpenseChart, setIncomeExpenseChart] = useState(null);

  const [currentMonth, setCurrentMonth] = useState(new Date());

  // --- APENAS ADICIONEI A LEITURA DO TEMA PARA O LAYOUT ---
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
  };

  // --- TODA A SUA REGRA DE NEGÓCIO ORIGINAL ABAIXO (INTOCADA) ---
  const [healthScore, setHealthScore] = useState({
    score: 0,
    message: "",
    color: "",
    savingsRate: 0,
    income: 0,
    expense: 0,
  });

  const getTransactions = () => {
    const saved = localStorage.getItem("financialData");
    return saved ? JSON.parse(saved) : [];
  };

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
    const transactions = getTransactions();
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

  useEffect(() => {
    const monthTransactions = getMonthTransactions();
    const income = monthTransactions
      .filter((t) => t.type === "income" && t.paid)
      .reduce((sum, t) => sum + t.value, 0);
    const expense = monthTransactions
      .filter((t) => t.type === "expense" && t.paid)
      .reduce((sum, t) => sum + t.value, 0);
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
    let score = 0;
    let message = "";
    let color = "";
    if (savingsRate >= 30) {
      score = 100;
      message = "Excelente! Você está poupando mais de 30% da sua renda.";
      color = "#27ae60";
    } else if (savingsRate >= 20) {
      score = 80;
      message = "Muito bom! Continue mantendo essa taxa de poupança.";
      color = "#2ecc71";
    } else if (savingsRate >= 10) {
      score = 60;
      message = "Bom! Tente aumentar sua taxa de poupança gradualmente.";
      color = "#f39c12";
    } else if (savingsRate >= 0) {
      score = 40;
      message = "Atenção! Tente poupar pelo menos 10% da sua renda.";
      color = "#e67e22";
    } else {
      score = 20;
      message = "Alerta! Suas despesas estão maiores que sua renda.";
      color = "#e74c3c";
    }
    setHealthScore({ score, message, color, savingsRate, income, expense });
  }, [currentMonth]);

  // --- OS EFEITOS DO CHART.JS ABAIXO SÃO OS SEUS ORIGINAIS (MANTIDOS) ---
  useEffect(() => {
    if (!patrimonialChartRef.current) return;
    if (patrimonialChart) {
      patrimonialChart.destroy();
    }
    const transactions = getTransactions();
    const months = [];
    const investments = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(2026, i, 1);
      const monthInvestments = transactions.filter((t) => {
        const tDate = new Date(t.date);
        return (
          t.type === "expense" &&
          t.category === "Investimentos" &&
          t.paid === true &&
          tDate.getMonth() === date.getMonth() &&
          tDate.getFullYear() === date.getFullYear()
        );
      });
      const totalInvested = monthInvestments.reduce(
        (sum, t) => sum + t.value,
        0
      );
      const monthNames = [
        "Jan",
        "Fev",
        "Mar",
        "Abr",
        "Mai",
        "Jun",
        "Jul",
        "Ago",
        "Set",
        "Out",
        "Nov",
        "Dez",
      ];
      months.push(
        `${monthNames[date.getMonth()]}/${date
          .getFullYear()
          .toString()
          .slice(-2)}`
      );
      investments.push(totalInvested);
    }
    const newChart = new Chart(patrimonialChartRef.current, {
      type: "line",
      data: {
        labels: months,
        datasets: [
          {
            label: "Investimentos do Mês",
            data: investments,
            borderColor: "#667eea",
            backgroundColor: "rgba(102, 126, 234, 0.1)",
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointRadius: 5,
            pointBackgroundColor: "#667eea",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: "#8b92a7", font: { size: 11 } },
            grid: { color: "rgba(255, 255, 255, 0.05)" },
          },
          x: {
            ticks: { color: "#8b92a7", font: { size: 11 } },
            grid: { display: false },
          },
        },
      },
    });
    setPatrimonialChart(newChart);
    return () => {
      if (newChart) newChart.destroy();
    };
  }, []);

  useEffect(() => {
    if (!categoryPieChartRef.current) return;
    if (categoryPieChart) {
      categoryPieChart.destroy();
    }
    const monthTransactions = getMonthTransactions();
    const categories = {};
    monthTransactions
      .filter((t) => t.type === "expense" && t.paid)
      .forEach((t) => {
        categories[t.category] = (categories[t.category] || 0) + t.value;
      });
    const labels = Object.keys(categories);
    const data = Object.values(categories);
    const chartColors = [
      "#667eea",
      "#764ba2",
      "#f093fb",
      "#4facfe",
      "#43e97b",
      "#fa709a",
      "#fee140",
      "#30cfd0",
    ];
    if (labels.length === 0) return;
    const newChart = new Chart(categoryPieChartRef.current, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: chartColors,
            borderWidth: 3,
            borderColor: colors.secondary,
            hoverOffset: 10,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: "right",
            labels: { color: colors.textPrimary, font: { size: 12 } },
          },
        },
      },
    });
    setCategoryPieChart(newChart);
    return () => {
      if (newChart) newChart.destroy();
    };
  }, [currentMonth, theme]);

  useEffect(() => {
    if (!incomeExpenseChartRef.current) return;
    if (incomeExpenseChart) {
      incomeExpenseChart.destroy();
    }
    const transactions = getTransactions();
    const months = [];
    const incomes = [];
    const expenses = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date);
        return (
          tDate.getMonth() === date.getMonth() &&
          tDate.getFullYear() === date.getFullYear()
        );
      });
      const income = monthTransactions
        .filter((t) => t.type === "income" && t.paid)
        .reduce((sum, t) => sum + t.value, 0);
      const expense = monthTransactions
        .filter((t) => t.type === "expense" && t.paid)
        .reduce((sum, t) => sum + t.value, 0);
      const monthNames = [
        "Jan",
        "Fev",
        "Mar",
        "Abr",
        "Mai",
        "Jun",
        "Jul",
        "Ago",
        "Set",
        "Out",
        "Nov",
        "Dez",
      ];
      months.push(
        `${monthNames[date.getMonth()]}/${date
          .getFullYear()
          .toString()
          .slice(-2)}`
      );
      incomes.push(income);
      expenses.push(expense);
    }
    const newChart = new Chart(incomeExpenseChartRef.current, {
      type: "bar",
      data: {
        labels: months,
        datasets: [
          {
            label: "Receitas",
            data: incomes,
            backgroundColor: "rgba(39, 174, 96, 0.8)",
            borderColor: "#27ae60",
            borderWidth: 2,
            borderRadius: 8,
          },
          {
            label: "Despesas",
            data: expenses,
            backgroundColor: "rgba(231, 76, 60, 0.8)",
            borderColor: "#e74c3c",
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: { color: colors.textPrimary },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: "#8b92a7" },
            grid: { color: "rgba(255, 255, 255, 0.05)" },
          },
          x: { ticks: { color: "#8b92a7" }, grid: { display: false } },
        },
      },
    });
    setIncomeExpenseChart(newChart);
    return () => {
      if (newChart) newChart.destroy();
    };
  }, [theme]);

  const categorySummary = getCategorySummary();

  return (
    <div
      className="ml-[260px] flex-1 p-10 min-h-screen transition-colors duration-300"
      style={{ backgroundColor: colors.primary }}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2
            className="text-xl font-bold mb-1"
            style={{ color: colors.textPrimary }}
          >
            Análises
          </h2>
          <div className="text-xs" style={{ color: colors.textSecondary }}>
            Gestão de receitas e despesas
          </div>
        </div>
      </div>

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

      <div
        className="rounded-lg border p-5 shadow mb-6"
        style={{
          backgroundColor: colors.secondary,
          borderColor: colors.border,
        }}
      >
        <h3
          className="text-base font-bold mb-4"
          style={{ color: colors.textPrimary }}
        >
          💚 Saúde Financeira - {getMonthName()}
        </h3>
        <div className="flex items-center gap-6 p-4">
          <div className="relative w-[120px] h-[120px]">
            <svg width="120" height="120" className="rotate-[-90deg]">
              <circle
                cx="60"
                cy="60"
                r="48"
                fill="none"
                stroke={colors.border}
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r="48"
                fill="none"
                stroke={healthScore.color}
                strokeWidth="10"
                strokeDasharray={`${(healthScore.score / 100) * 301.6} 301.6`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div
                className="text-2xl font-bold"
                style={{ color: healthScore.color }}
              >
                {healthScore.score}
              </div>
              <div
                className="text-[10px]"
                style={{ color: colors.textSecondary }}
              >
                pontos
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div
              className="text-base font-semibold mb-2"
              style={{ color: colors.textPrimary }}
            >
              Taxa de Poupança: {healthScore.savingsRate.toFixed(1)}%
            </div>
            <div
              className="text-sm leading-relaxed"
              style={{ color: colors.textSecondary }}
            >
              {healthScore.message}
            </div>
          </div>
        </div>
      </div>

      <div
        className="rounded-lg border p-5 shadow mb-6"
        style={{
          backgroundColor: colors.secondary,
          borderColor: colors.border,
        }}
      >
        <h3
          className="text-base font-bold mb-4"
          style={{ color: colors.textPrimary }}
        >
          📋 Resumo de Gastos por Categoria
        </h3>
        <div className="space-y-2.5">
          {categorySummary.map(([category, value]) => (
            <div
              key={category}
              className="rounded-lg border p-3.5 px-4 flex justify-between items-center transition-all"
              style={{
                backgroundColor: colors.tertiary,
                borderColor: colors.border,
              }}
            >
              <span
                className="text-sm font-bold"
                style={{ color: colors.textPrimary }}
              >
                {category}
              </span>
              <span className="text-[#e74c3c] text-base font-bold">
                R$ {formatCurrency(value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="rounded-lg border p-5 shadow mb-6"
        style={{
          backgroundColor: colors.secondary,
          borderColor: colors.border,
        }}
      >
        <h3
          className="text-base font-bold mb-4"
          style={{ color: colors.textPrimary }}
        >
          📈 Evolução de Investimentos (2026)
        </h3>
        <div className="relative h-[250px]">
          <canvas ref={patrimonialChartRef}></canvas>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div
          className="rounded-lg border p-5 shadow"
          style={{
            backgroundColor: colors.secondary,
            borderColor: colors.border,
          }}
        >
          <h3
            className="text-base font-bold mb-4"
            style={{ color: colors.textPrimary }}
          >
            🍕 Gastos por Categoria
          </h3>
          <div className="relative h-[250px]">
            <canvas ref={categoryPieChartRef}></canvas>
          </div>
        </div>
        <div
          className="rounded-lg border p-5 shadow"
          style={{
            backgroundColor: colors.secondary,
            borderColor: colors.border,
          }}
        >
          <h3
            className="text-base font-bold mb-4"
            style={{ color: colors.textPrimary }}
          >
            📊 Receitas vs Despesas
          </h3>
          <div className="relative h-[250px]">
            <canvas ref={incomeExpenseChartRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analises;
