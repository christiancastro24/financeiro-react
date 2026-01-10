import { useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

const Dashboard = ({ setActiveTab }) => {
  const categoryChartRef = useRef(null);
  const investmentChartRef = useRef(null);
  const [categoryChart, setCategoryChart] = useState(null);
  const [investmentChart, setInvestmentChart] = useState(null);

  // Theme
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

  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Dados
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("financialData");
    return saved ? JSON.parse(saved) : [];
  });

  // Modal de Nova Transação
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedImportMonth, setSelectedImportMonth] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: "expense",
    title: "",
    value: "",
    category: "Alimentação",
    date: new Date().toISOString().split("T")[0],
  });

  const [availableCategories] = useState([
    "Alimentação",
    "Transporte",
    "Moradia",
    "Saúde",
    "Educação",
    "Lazer",
    "Compras",
    "Gastos Gerais",
    "Salário",
    "Investimentos",
    "Outros",
  ]);

  const formatCurrency = (value) => {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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

  const monthTransactions = getMonthTransactions();

  const totalIncome = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.value), 0);

  const totalExpense = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.value), 0);
  const balance = totalIncome - totalExpense;

  const saveTransaction = (e) => {
    e.preventDefault();
    const transaction = {
      id:
        editingId || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: formData.type,
      title: formData.title,
      value: parseFloat(formData.value),
      category: formData.category,
      date: new Date(formData.date + "T12:00:00").toISOString(),
      paid:
        formData.type === "income" ||
        (editingId ? transactions.find((t) => t.id === editingId).paid : false),
    };

    const newTransactions = editingId
      ? transactions.map((t) => (t.id === editingId ? transaction : t))
      : [...transactions, transaction];
    localStorage.setItem("financialData", JSON.stringify(newTransactions));
    setTransactions(newTransactions);

    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      type: "expense",
      title: "",
      value: "",
      category: "Alimentação",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const editTransaction = (id) => {
    const transaction = transactions.find((t) => t.id === id);
    if (transaction) {
      setEditingId(id);
      setFormData({
        type: transaction.type,
        title: transaction.title,
        value: transaction.value,
        category: transaction.category,
        date: new Date(transaction.date).toISOString().split("T")[0],
      });
      setIsModalOpen(true);
    }
  };

  const togglePaid = (id) => {
    const newTransactions = transactions.map((t) =>
      t.id === id ? { ...t, paid: !t.paid } : t
    );
    localStorage.setItem("financialData", JSON.stringify(newTransactions));
    setTransactions(newTransactions);
  };

  const deleteTransaction = (id) => {
    if (window.confirm("Excluir transação?")) {
      const newTransactions = transactions.filter((t) => t.id !== id);
      localStorage.setItem("financialData", JSON.stringify(newTransactions));
      setTransactions(newTransactions);
    }
  };

  const getAvailableMonths = () => {
    const monthsMap = new Map();
    transactions.forEach((t) => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const label = `${
        [
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
        ][date.getMonth()]
      } ${date.getFullYear()}`;
      if (
        !(
          date.getMonth() === currentMonth.getMonth() &&
          date.getFullYear() === currentMonth.getFullYear()
        )
      ) {
        monthsMap.set(key, {
          key,
          label,
          month: date.getMonth(),
          year: date.getFullYear(),
        });
      }
    });
    return Array.from(monthsMap.values()).sort((a, b) =>
      b.year !== a.year ? b.year - a.year : b.month - a.month
    );
  };

  const availableMonths = getAvailableMonths();

  // Gastos por Categoria
  const getCategorySummary = () => {
    const categories = {};
    monthTransactions
      .filter((t) => t.type === "expense" && t.paid)
      .forEach((t) => {
        categories[t.category] = (categories[t.category] || 0) + t.value;
      });
    return Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const categorySummary = getCategorySummary();
  const totalCategoryExpense = categorySummary.reduce(
    (sum, [_, val]) => sum + val,
    0
  );

  // Chart - Gastos por Categoria
  useEffect(() => {
    if (!categoryChartRef.current || categorySummary.length === 0) return;
    if (categoryChart) categoryChart.destroy();

    const labels = categorySummary.map(([cat]) => cat);
    const data = categorySummary.map(([_, val]) => val);

    const chartColors = ["#667eea", "#764ba2", "#f093fb", "#4facfe", "#43e97b"];

    const newChart = new Chart(categoryChartRef.current, {
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
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });

    setCategoryChart(newChart);
    return () => {
      if (newChart) newChart.destroy();
    };
  }, [currentMonth, theme, categorySummary.length]);

  // Chart - Evolução de Investimentos
  useEffect(() => {
    if (!investmentChartRef.current) return;
    if (investmentChart) investmentChart.destroy();

    const months = [];
    const investments = [];

    // Get investments for last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

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
      months.push(monthNames[date.getMonth()]);
      investments.push(totalInvested);
    }

    const newChart = new Chart(investmentChartRef.current, {
      type: "line",
      data: {
        labels: months,
        datasets: [
          {
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
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `R$ ${context.parsed.y.toFixed(2)}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: colors.textSecondary,
              font: { size: 10 },
              callback: (value) => "R$ " + value.toFixed(2),
            },
            grid: { color: colors.border },
          },
          x: {
            ticks: { color: colors.textSecondary, font: { size: 10 } },
            grid: { display: false },
          },
        },
      },
    });

    setInvestmentChart(newChart);
    return () => {
      if (newChart) newChart.destroy();
    };
  }, [theme, transactions]);

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
    return months[currentMonth.getMonth()];
  };

  const sortedTransactions = [...monthTransactions].sort((a, b) => {
    if (a.category === "Salário") return -1;
    if (b.category === "Salário") return 1;
    return a.type === "income" ? -1 : 1;
  });

  // Calculate total invested and returns
  const calculateInvestmentStats = () => {
    const allInvestments = transactions.filter(
      (t) =>
        t.type === "expense" &&
        t.category === "Investimentos" &&
        t.paid === true
    );

    const totalInvested = allInvestments.reduce((sum, t) => sum + t.value, 0);

    // Simple mock return calculation (5% of total)
    const mockReturn = totalInvested * 0.05;

    return {
      totalInvested,
      mockReturn,
    };
  };

  const investmentStats = calculateInvestmentStats();

return (
  <div
    className="ml-[260px] flex-1 p-8 min-h-screen transition-colors duration-300"
    style={{ backgroundColor: colors.primary }}
  >
    {/* Header */}
    <div className="mb-6">
      <h1
        className="text-2xl font-bold mb-1"
        style={{ color: colors.textPrimary }}
      >
        Dashboard
      </h1>
      <p className="text-sm" style={{ color: colors.textSecondary }}>
        Aqui está uma visão geral das suas finanças
      </p>
    </div>

    {/* Month Selector */}
    <div
      className="flex items-center justify-between rounded-xl border mb-6 py-3 px-5 shadow-sm"
      style={{
        backgroundColor: colors.secondary,
        borderColor: colors.border,
      }}
    >
      <button
        onClick={() => changeMonth(-1)}
        className="p-2 rounded-lg transition-all hover:bg-[#667eea]/10 border"
        style={{
          borderColor: colors.border,
          color: colors.textSecondary,
        }}
      >
        <ChevronLeft size={18} />
      </button>

      <div className="text-center">
        <div
          className="text-[16px] font-bold"
          style={{ color: colors.textPrimary }}
        >
          {getMonthName()} {currentMonth.getFullYear()}
        </div>
      </div>

      <button
        onClick={() => changeMonth(1)}
        className="p-2 rounded-lg transition-all hover:bg-[#667eea]/10 border"
        style={{
          borderColor: colors.border,
          color: colors.textSecondary,
        }}
      >
        <ChevronRight size={18} />
      </button>
    </div>

    {/* Cards de Resumo em linha única acima do grid */}
    <div className="grid grid-cols-3 gap-3 mb-5">
      <div
        className="rounded-lg border border-l-4 border-l-[#27ae60] p-3.5 shadow-sm transition-all hover:-translate-y-0.5"
        style={{
          backgroundColor: colors.secondary,
          borderColor: colors.border,
        }}
      >
        <h3
          className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wide mb-2"
          style={{ color: colors.textSecondary }}
        >
          <div className="w-5 h-5 rounded bg-[#27ae6020] text-[#27ae60] flex items-center justify-center text-xs">
            <TrendingUp size={12} />
          </div>
          Entradas
        </h3>
        <div className="text-xl font-bold text-[#27ae60]">
          R$ {formatCurrency(totalIncome)}
        </div>
      </div>

      <div
        className="rounded-lg border border-l-4 border-l-[#e74c3c] p-3.5 shadow-sm transition-all hover:-translate-y-0.5"
        style={{
          backgroundColor: colors.secondary,
          borderColor: colors.border,
        }}
      >
        <h3
          className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wide mb-2"
          style={{ color: colors.textSecondary }}
        >
          <div className="w-5 h-5 rounded bg-[#e74c3c20] text-[#e74c3c] flex items-center justify-center text-xs">
            <TrendingDown size={12} />
          </div>
          Saídas
        </h3>
        <div className="text-xl font-bold text-[#e74c3c]">
          R$ {formatCurrency(totalExpense)}
        </div>
      </div>

      <div
        className="rounded-lg border border-l-4 border-l-[#667eea] p-3.5 shadow-sm transition-all hover:-translate-y-0.5"
        style={{
          backgroundColor: colors.secondary,
          borderColor: colors.border,
        }}
      >
        <h3
          className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wide mb-2"
          style={{ color: colors.textSecondary }}
        >
          <div className="w-5 h-5 rounded bg-[#667eea20] text-[#667eea] flex items-center justify-center text-xs">
            <DollarSign size={12} />
          </div>
          Saldo Previsto
        </h3>
        <div className="text-xl font-bold text-[#667eea]">
          R$ {formatCurrency(balance)}
        </div>
      </div>
    </div>

    {/* LAYOUT GRID DE 3 COLUNAS - ALTURAS AJUSTADAS */}
    <div className="grid grid-cols-3 gap-5">
      {/* COLUNA ESQUERDA - DASHBOARD PRINCIPAL */}
      <div className="col-span-2 flex flex-col">
        <div
          className="rounded-xl border p-5 shadow-sm flex-1 flex flex-col"
          style={{
            backgroundColor: colors.secondary,
            borderColor: colors.border,
          }}
        >
          {/* Header da Lista */}
          <div className="flex justify-between items-center mb-3">
            <h3
              className="text-sm font-bold"
              style={{ color: colors.textPrimary }}
            >
              Transações do Mês
            </h3>
            <div className="flex gap-2">
              {availableMonths.length > 0 && (
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-3 py-1.5 bg-[#f39c12] text-white text-xs font-bold rounded-lg shadow transition-all hover:opacity-90"
                >
                  📋 Importar
                </button>
              )}
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-1.5 bg-[#667eea] text-white text-xs font-bold rounded-lg shadow transition-all hover:bg-[#5568d3]"
              >
                + Nova Transação
              </button>
            </div>
          </div>

          {/* Lista de Transações com SCROLL quando necessário */}
          <div className="flex-1 overflow-y-auto transactions-list max-h-[calc(100vh-300px)]">
            {sortedTransactions.length === 0 ? (
              <div
                className="text-center py-8 text-sm"
                style={{ color: colors.textSecondary }}
              >
                Nenhuma transação registrada neste mês
              </div>
            ) : (
              <div className="space-y-2 pr-2">
                {sortedTransactions.map((t) => (
                  <div
                    key={t.id}
                    className={`flex justify-between items-center rounded-lg p-3 transition-all border ${
                      t.paid ? "" : "border-l-[3px] border-[#f39c12]"
                    }`}
                    style={{
                      backgroundColor: t.paid
                        ? colors.tertiary
                        : theme === "dark"
                        ? "rgba(243,156,18,0.1)"
                        : "#fff9f0",
                      borderColor: t.paid ? colors.border : "#f39c12",
                    }}
                  >
                    <div className="flex-1">
                      <div
                        className="font-bold text-sm mb-1"
                        style={{ color: colors.textPrimary }}
                      >
                        {t.title}
                      </div>
                      <div
                        className="text-xs flex items-center"
                        style={{ color: colors.textSecondary }}
                      >
                        <span className="inline-block rounded px-2 py-0.5 text-[10px] font-bold bg-[#667eea20] text-[#667eea] mr-2">
                          {t.category}
                        </span>
                        <span>
                          {new Date(t.date).toLocaleDateString("pt-BR")}
                        </span>
                        <span> • {t.paid ? "Pago" : "Pendente"}</span>
                      </div>
                    </div>

                    <div
                      className={`text-base font-bold text-right mx-4 min-w-[100px] ${
                        t.type === "income" ? "text-[#27ae60]" : "text-[#e74c3c]"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"} R${" "}
                      {formatCurrency(t.value)}
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => togglePaid(t.id)}
                        className={`px-2 py-1.5 text-white text-xs rounded-lg shadow transition-all ${
                          t.paid ? "bg-[#f39c12]" : "bg-[#27ae60]"
                        }`}
                      >
                        {t.paid ? "↺" : "✓"}
                      </button>
                      <button
                        onClick={() => editTransaction(t.id)}
                        className="px-2 py-1.5 bg-[#5a6c7d] text-white text-xs rounded-lg shadow transition-all"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => deleteTransaction(t.id)}
                        className="px-2 py-1.5 bg-[#e74c3c] text-white text-xs rounded-lg shadow transition-all"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* COLUNA DIREITA - GRÁFICOS EMPILHADOS COM ALTURAS IGUAIS */}
      <div className="col-span-1 flex flex-col h-full">
        {/* Container pai para altura total fixa */}
        <div className="flex flex-col h-full space-y-5">
          {/* GASTOS POR CATEGORIA - Altura fixa */}
          <div
            className="rounded-xl border p-5 shadow-sm flex-1 flex flex-col"
            style={{
              backgroundColor: colors.secondary,
              borderColor: colors.border,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-sm font-bold uppercase tracking-wide"
                style={{ color: colors.textSecondary }}
              >
                Gastos por Categoria
              </h3>
            </div>

            {categorySummary.length === 0 ? (
              <div
                className="text-center py-10 flex-1 flex items-center justify-center"
                style={{ color: colors.textSecondary }}
              >
                Nenhum gasto registrado este mês
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                {/* Gráfico */}
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-full h-32">
                    <canvas ref={categoryChartRef}></canvas>
                  </div>
                </div>

                {/* Lista com scroll se necessário */}
                <div className="flex-1 overflow-y-auto pr-1">
                  <div className="space-y-2">
                    {categorySummary.map(([category, value], i) => {
                      const percent = (value / totalCategoryExpense) * 100;
                      const chartColors = [
                        "#667eea",
                        "#764ba2",
                        "#f093fb",
                        "#4facfe",
                        "#43e97b",
                      ];

                      return (
                        <div key={category} className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: chartColors[i] }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span
                                className="text-xs font-semibold truncate"
                                style={{ color: colors.textPrimary }}
                              >
                                {category}
                              </span>
                              <span
                                className="text-xs font-bold ml-2 flex-shrink-0"
                                style={{ color: colors.textPrimary }}
                              >
                                R$ {formatCurrency(value)}
                              </span>
                            </div>
                            <div
                              className="w-full h-1 rounded-full overflow-hidden"
                              style={{ backgroundColor: colors.tertiary }}
                            >
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${percent}%`,
                                  backgroundColor: chartColors[i],
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* EVOLUÇÃO DE INVESTIMENTOS - Altura igual ao de cima */}
          <div
            className="rounded-xl border p-5 shadow-sm flex-1 flex flex-col"
            style={{
              backgroundColor: colors.secondary,
              borderColor: colors.border,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-sm font-bold uppercase tracking-wide"
                style={{ color: colors.textSecondary }}
              >
                Evolução de Investimentos
              </h3>
            </div>

            <div className="flex-1 flex flex-col">
              <div className="h-32 mb-4">
                <canvas ref={investmentChartRef}></canvas>
              </div>

              <div className="grid grid-cols-1 gap-2 text-center">
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: colors.tertiary }}
                >
                  <p
                    className="text-[9px] uppercase tracking-wide mb-1"
                    style={{ color: colors.textSecondary }}
                  >
                    Total Investido
                  </p>
                  <p className="text-sm font-bold text-[#667eea]">
                    R$ {formatCurrency(investmentStats.totalInvested)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Modal de Nova/Editar Transação */}
    {isModalOpen && (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
      >
        <div
          className="rounded-xl border p-6 w-full max-w-md shadow-2xl"
          style={{
            backgroundColor: colors.secondary,
            borderColor: colors.border,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2
            className="text-xl font-bold mb-5"
            style={{ color: colors.textPrimary }}
          >
            {editingId ? "Editar Transação" : "Nova Transação"}
          </h2>

          <form onSubmit={saveTransaction} className="space-y-4">
            <div>
              <label
                className="block text-xs font-semibold mb-2"
                style={{ color: colors.textSecondary }}
              >
                Tipo
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-3 py-2.5 rounded-lg outline-none border transition-all text-sm"
                style={{
                  backgroundColor: colors.tertiary,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
              >
                <option value="expense">💸 Despesa</option>
                <option value="income">💰 Receita</option>
              </select>
            </div>

            <div>
              <label
                className="block text-xs font-semibold mb-2"
                style={{ color: colors.textSecondary }}
              >
                Título
              </label>
              <input
                type="text"
                placeholder="Ex: Almoço no restaurante"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2.5 rounded-lg outline-none border transition-all text-sm"
                style={{
                  backgroundColor: colors.tertiary,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
                required
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold mb-2"
                style={{ color: colors.textSecondary }}
              >
                Valor (R$)
              </label>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                className="w-full px-3 py-2.5 rounded-lg outline-none border transition-all text-sm"
                style={{
                  backgroundColor: colors.tertiary,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
                required
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold mb-2"
                style={{ color: colors.textSecondary }}
              >
                Categoria
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2.5 rounded-lg outline-none border transition-all text-sm"
                style={{
                  backgroundColor: colors.tertiary,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
              >
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block text-xs font-semibold mb-2"
                style={{ color: colors.textSecondary }}
              >
                Data
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-3 py-2.5 rounded-lg outline-none border transition-all text-sm"
                style={{
                  backgroundColor: colors.tertiary,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
                required
              />
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingId(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all border"
                style={{
                  backgroundColor: colors.tertiary,
                  borderColor: colors.border,
                  color: colors.textSecondary,
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-[#667eea] text-white rounded-lg font-semibold shadow-lg hover:bg-[#5568d3] transition-all text-sm"
              >
                {editingId ? "Salvar" : "Adicionar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Modal de Importar */}
    {isImportModalOpen && (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={() => setIsImportModalOpen(false)}
      >
        <div
          className="rounded-xl border p-6 w-full max-w-md shadow-2xl"
          style={{
            backgroundColor: colors.secondary,
            borderColor: colors.border,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2
            className="text-xl font-bold mb-4"
            style={{ color: colors.textPrimary }}
          >
            📋 Importar Transações
          </h2>
          <div className="space-y-4">
            <div>
              <label
                className="block text-xs font-semibold mb-1.5"
                style={{ color: colors.textSecondary }}
              >
                Selecione o mês
              </label>
              <select
                value={selectedImportMonth}
                onChange={(e) => setSelectedImportMonth(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{
                  backgroundColor: colors.tertiary,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
              >
                <option value="">Selecione...</option>
                {availableMonths.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="flex-1 px-4 py-2 bg-[#5a6c7d] text-white rounded-lg font-bold text-sm hover:bg-[#4a5c6d] transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!selectedImportMonth) {
                    alert("Selecione um mês para importar!");
                    return;
                  }
                  const [y, m] = selectedImportMonth.split("-").map(Number);
                  const toImport = transactions.filter((t) => {
                    const d = new Date(t.date);
                    return d.getMonth() === m && d.getFullYear() === y;
                  });

                  if (toImport.length === 0) {
                    alert("Nenhuma transação encontrada no mês selecionado!");
                    return;
                  }

                  const imported = toImport.map((t) => ({
                    ...t,
                    id: `${Date.now()}-${Math.random()
                      .toString(36)
                      .substr(2, 9)}`,
                    date: new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth(),
                      new Date(t.date).getDate()
                    ).toISOString(),
                    paid: false,
                  }));
                  const newTransactions = [...transactions, ...imported];
                  localStorage.setItem(
                    "financialData",
                    JSON.stringify(newTransactions)
                  );
                  setTransactions(newTransactions);
                  setIsImportModalOpen(false);
                  setSelectedImportMonth("");
                  alert(
                    `${imported.length} transação(ões) importada(s) com sucesso!`
                  );
                }}
                className="flex-1 px-4 py-2 bg-[#f39c12] text-white rounded-lg font-bold text-sm hover:bg-[#e68a00] transition-all"
              >
                Importar
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default Dashboard;
