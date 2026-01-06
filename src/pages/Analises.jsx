import React, { useEffect, useRef, useState } from "react";

const Analises = () => {
  const patrimonialChartRef = useRef(null);
  const categoryPieChartRef = useRef(null);
  const incomeExpenseChartRef = useRef(null);

  const [patrimonialChart, setPatrimonialChart] = useState(null);
  const [categoryPieChart, setCategoryPieChart] = useState(null);
  const [incomeExpenseChart, setIncomeExpenseChart] = useState(null);

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

  const getMonthTransactions = () => {
    const transactions = getTransactions();
    const now = new Date();
    return transactions.filter((t) => {
      const tDate = new Date(t.date);
      return (
        tDate.getMonth() === now.getMonth() &&
        tDate.getFullYear() === now.getFullYear()
      );
    });
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
  }, []);

  useEffect(() => {
    if (!patrimonialChartRef.current) return;

    if (patrimonialChart) {
      patrimonialChart.destroy();
    }

    const transactions = getTransactions();
    const months = [];
    const investments = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      // Pegar TODOS os investimentos até este mês (acumulado)
      const investmentsUntilThisMonth = transactions.filter((t) => {
        const tDate = new Date(t.date);
        return (
          t.type === "expense" &&
          t.category === "Investimentos" &&
          t.paid &&
          tDate <= date
        );
      });

      const totalInvested = investmentsUntilThisMonth.reduce(
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
            label: "Investimentos Acumulados",
            data: investments,
            borderColor: "#667eea",
            backgroundColor: "rgba(102, 126, 234, 0.1)",
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: "#667eea",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(44, 62, 80, 0.95)",
            padding: 12,
            titleColor: "#fff",
            bodyColor: "#fff",
            callbacks: {
              label: function (context) {
                return (
                  "Total Investido: R$ " + formatCurrency(context.parsed.y)
                );
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return "R$ " + formatCurrency(value);
              },
              color: "#8b92a7",
              font: { size: 11 },
            },
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

    const colors = [
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
            backgroundColor: colors,
            borderWidth: 3,
            borderColor: "#1a1f2e",
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
            labels: {
              color: "#fff",
              font: { size: 12 },
              padding: 15,
              generateLabels: function (chart) {
                const data = chart.data;
                return data.labels.map((label, i) => {
                  const value = data.datasets[0].data[i];
                  const total = data.datasets[0].data.reduce(
                    (a, b) => a + b,
                    0
                  );
                  const percentage = ((value / total) * 100).toFixed(1);
                  return {
                    text: `${label} (${percentage}%)`,
                    fillStyle: data.datasets[0].backgroundColor[i],
                    hidden: false,
                    index: i,
                  };
                });
              },
            },
          },
          tooltip: {
            backgroundColor: "#fff",
            padding: 12,
            callbacks: {
              label: function (context) {
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `R$ ${formatCurrency(value)} (${percentage}%)`;
              },
            },
          },
        },
      },
    });

    setCategoryPieChart(newChart);

    return () => {
      if (newChart) newChart.destroy();
    };
  }, []);

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
            labels: {
              color: "#e4e6eb",
              font: { size: 13, weight: "600" },
              padding: 15,
              usePointStyle: true,
            },
          },
          tooltip: {
            backgroundColor: "rgba(44, 62, 80, 0.95)",
            padding: 12,
            callbacks: {
              label: function (context) {
                return (
                  context.dataset.label +
                  ": R$ " +
                  formatCurrency(context.parsed.y)
                );
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return "R$ " + formatCurrency(value);
              },
              color: "#8b92a7",
              font: { size: 11 },
            },
            grid: { color: "rgba(255, 255, 255, 0.05)" },
          },
          x: {
            ticks: { color: "#8b92a7", font: { size: 11 } },
            grid: { display: false },
          },
        },
      },
    });

    setIncomeExpenseChart(newChart);

    return () => {
      if (newChart) newChart.destroy();
    };
  }, []);

  return (
    <div className="ml-[260px] flex-1 bg-[#0f1419] p-10">
      <div className="flex justify-between items-center mb-9">
        <div>
          <h2 className="text-[28px] font-bold text-white mb-1.5">Análises</h2>
          <div className="text-[#8b92a7] text-sm">
            Gestão de receitas e despesas
          </div>
        </div>
      </div>

      <div className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] p-7 shadow-[0_4px_12px_rgba(0,0,0,0.3)] mb-8">
        <h3 className="text-lg font-bold text-white mb-6">
          💚 Saúde Financeira
        </h3>
        <div className="flex items-center gap-8 p-5">
          <div className="relative w-[150px] h-[150px]">
            <svg width="150" height="150" className="rotate-[-90deg]">
              <circle
                cx="75"
                cy="75"
                r="60"
                fill="none"
                stroke="#2a2f3e"
                strokeWidth="12"
              />
              <circle
                cx="75"
                cy="75"
                r="60"
                fill="none"
                stroke={healthScore.color}
                strokeWidth="12"
                strokeDasharray={`${(healthScore.score / 100) * 377} 377`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div
                className="text-[32px] font-bold"
                style={{ color: healthScore.color }}
              >
                {healthScore.score}
              </div>
              <div className="text-xs text-[#8b92a7]">pontos</div>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-lg font-semibold text-white mb-2.5">
              Taxa de Poupança: {healthScore.savingsRate.toFixed(1)}%
            </div>
            <div className="text-[#8b92a7] leading-relaxed">
              {healthScore.message}
            </div>
            <div className="mt-4 p-2.5 bg-[rgba(255,255,255,0.05)] rounded-lg text-[13px] text-[#b0b8c9]">
              <strong>Receita:</strong> R$ {formatCurrency(healthScore.income)}{" "}
              •<strong> Despesa:</strong> R${" "}
              {formatCurrency(healthScore.expense)}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] p-7 shadow-[0_4px_12px_rgba(0,0,0,0.3)] mb-8">
        <h3 className="text-lg font-bold text-white mb-6">
          📈 Evolução de Investimentos (Últimos 6 Meses)
        </h3>
        <div className="relative h-[300px]">
          <canvas ref={patrimonialChartRef}></canvas>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] p-7 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
          <h3 className="text-lg font-bold text-white mb-6">
            🍕 Gastos por Categoria
          </h3>
          <div className="relative h-[300px]">
            <canvas ref={categoryPieChartRef}></canvas>
          </div>
        </div>

        <div className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] p-7 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
          <h3 className="text-lg font-bold text-white mb-6">
            📊 Receitas vs Despesas
          </h3>
          <div className="relative h-[300px]">
            <canvas ref={incomeExpenseChartRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analises;
