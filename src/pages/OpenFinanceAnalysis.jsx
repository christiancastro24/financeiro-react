import React, { useState, useEffect } from "react";
import {
  Filter,
  PieChart,
  TrendingUp,
  TrendingDown,
  Receipt,
  ShoppingBag,
  Calendar,
  ChevronDown,
  ChevronUp,
  BarChart3,
  ListOrdered,
  DollarSign,
  X,
  Home,
  ShoppingCart,
  Utensils,
  Car,
  Heart,
  BookOpen,
  Film,
  Wifi,
  Zap,
  Coffee,
  Briefcase,
  Phone,
  Gift,
  GraduationCap,
  Plane,
  Music,
  Gamepad2,
  Dumbbell,
  Palette,
  Camera,
  Martini,
  Train,
  Bus,
  Bike,
  Cloud,
  CreditCard,
  Building,
  FileText,
} from "lucide-react";

const OpenFinanceAnalysis = () => {
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
    cardItem: theme === "dark" ? "#1e2738" : "#f8f9fa",
    progressBarBg: theme === "dark" ? "#252833" : "#e9ecef",
  };

  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState("30");
  const [activeFilter, setActiveFilter] = useState("categorias");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = () => {
    try {
      const savedData = localStorage.getItem("openfinance-session");
      if (savedData) {
        const session = JSON.parse(savedData);
        setAccounts(session.accounts || []);
        setTransactions(session.transactions || []);
      }
    } catch (err) {
      console.log("Nenhum dado encontrado");
    }
  };

  const bankAccount = accounts.find((a) => a.type === "BANK");
  const creditAccount = accounts.find((a) => a.type === "CREDIT");

  const getFilteredByPeriod = (txs) => {
    if (filterPeriod === "tudo") return txs;
    const now = new Date();
    const days = parseInt(filterPeriod);
    const cutoffDate = new Date(now.setDate(now.getDate() - days));
    return txs.filter((t) => new Date(t.date) >= cutoffDate);
  };

  const allFilteredTransactions = getFilteredByPeriod(transactions);

  const debitTransactions = allFilteredTransactions.filter(
    (t) => t.accountId === bankAccount?.id && t.amount < 0
  );

  const creditTransactions = allFilteredTransactions.filter(
    (t) => t.accountId === creditAccount?.id
  );

  const creditExpensesOnly = creditTransactions.filter((t) => {
    const desc = t.description?.toLowerCase() || "";
    const isPagamento =
      desc.includes("pagamento") &&
      (desc.includes("fatura") || desc.includes("recebido"));
    return t.amount > 0 && !isPagamento;
  });

  const incomeTransactions = allFilteredTransactions.filter(
    (t) =>
      t.amount > 0 &&
      (t.category === "Income" ||
        t.description?.toLowerCase().includes("rendimento") ||
        (t.description?.toLowerCase().includes("transfer") && t.amount > 0) ||
        t.description?.toLowerCase().includes("depósito") ||
        t.description?.toLowerCase().includes("recebido"))
  );

  const totalDebitSpent = Math.abs(
    debitTransactions.reduce((sum, t) => sum + t.amount, 0)
  );
  const totalCreditSpent = creditExpensesOnly.reduce(
    (sum, t) => sum + t.amount,
    0
  );
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = totalDebitSpent + totalCreditSpent;
  const balance = totalIncome - totalExpenses;

  const categoryIcons = {
    "Transferências": <CreditCard size={18} />,
    "Investimentos": <TrendingUp size={18} />,
    "Telecomunicações": <Phone size={18} />,
    "Serviços": <Wifi size={18} />,
    "Energia Elétrica": <Zap size={18} />,
    "Compras": <ShoppingCart size={18} />,
    "Alimentação": <Utensils size={18} />,
    "Supermercado": <ShoppingCart size={18} />,
    "Transporte": <Car size={18} />,
    "Saúde": <Heart size={18} />,
    "Educação": <BookOpen size={18} />,
    "Entretenimento": <Film size={18} />,
    "Rendimentos": <DollarSign size={18} />,
    "Pagamentos": <FileText size={18} />,
    "Outro": <Cloud size={18} />,
    "Restaurante": <Coffee size={18} />,
    "Trabalho": <Briefcase size={18} />,
    "Presentes": <Gift size={18} />,
    "Viagem": <Plane size={18} />,
    "Música": <Music size={18} />,
    "Games": <Gamepad2 size={18} />,
    "Academia": <Dumbbell size={18} />,
    "Arte": <Palette size={18} />,
    "Fotografia": <Camera size={18} />,
    "Bar": <Martini size={18} />,
    "Metrô": <Train size={18} />,
    "Ônibus": <Bus size={18} />,
    "Bicicleta": <Bike size={18} />,
    "Moradia": <Home size={18} />,
    "Outros": <Receipt size={18} />,
  };

  const categoryColors = {
    "Transferências": "#6366f1",
    "Investimentos": "#10b981",
    "Telecomunicações": "#8b5cf6",
    "Serviços": "#f59e0b",
    "Energia Elétrica": "#f97316",
    "Compras": "#ec4899",
    "Alimentação": "#ef4444",
    "Supermercado": "#84cc16",
    "Transporte": "#3b82f6",
    "Saúde": "#06b6d4",
    "Educação": "#14b8a6",
    "Entretenimento": "#a855f7",
    "Rendimentos": "#22c55e",
    "Pagamentos": "#64748b",
    "Serviços digitais": "#8b5cf6",
    "Restaurante": "#f43f5e",
    "Trabalho": "#0ea5e9",
    "Presentes": "#d946ef",
    "Viagem": "#f97316",
    "Outros": "#94a3b8",
  };

  const categoryMap = {
    Transfer: "Transferências",
    Transfers: "Transferências",
    Investments: "Investimentos",
    Telecommunications: "Telecomunicações",
    Services: "Serviços",
    Electricity: "Energia Elétrica",
    Shopping: "Compras",
    Food: "Alimentação",
    Groceries: "Supermercado",
    Transport: "Transporte",
    Health: "Saúde",
    Education: "Educação",
    Entertainment: "Entretenimento",
    Income: "Rendimentos",
    Payment: "Pagamentos",
    "Digital services": "Serviços digitais",
    Restaurant: "Restaurante",
    Work: "Trabalho",
    Gift: "Presentes",
    Travel: "Viagem",
    Other: "Outros",
  };

  const translateCategory = (cat) => {
    const translated = categoryMap[cat] || cat;
    return categoryIcons[translated] ? translated : "Outros";
  };

  const getCategoryIcon = (category) => {
    return categoryIcons[category] || <Receipt size={18} />;
  };

  const getCategoryColor = (category) => {
    return categoryColors[category] || (theme === "dark" ? "#94a3b8" : "#6b7280");
  };

  const groupByCategory = (txs) => {
    const grouped = {};
    txs.forEach((t) => {
      const cat = translateCategory(t.category || "Other");
      if (!grouped[cat]) {
        grouped[cat] = { total: 0, count: 0, transactions: [] };
      }
      grouped[cat].total += Math.abs(t.amount);
      grouped[cat].count += 1;
      grouped[cat].transactions.push(t);
    });
    return Object.entries(grouped).sort((a, b) => b[1].total - a[1].total);
  };

  const expensesByCategory = groupByCategory([
    ...debitTransactions,
    ...creditExpensesOnly,
  ]);

  const groupByMonth = (txs) => {
    const grouped = {};
    txs.forEach((t) => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      const monthName = date.toLocaleDateString("pt-BR", {
        month: "short",
        year: "numeric",
      });

      if (!grouped[key]) {
        grouped[key] = { month: monthName, income: 0, expenses: 0 };
      }

      if (t.amount > 0) {
        grouped[key].income += t.amount;
      } else {
        grouped[key].expenses += Math.abs(t.amount);
      }
    });
    return Object.entries(grouped)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([_, data]) => data);
  };

  const monthlyData = groupByMonth(allFilteredTransactions);

  const topExpenses = [...debitTransactions, ...creditExpensesOnly]
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, 10);

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const renderFilterContent = () => {
    switch (activeFilter) {
      case "resumo":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Receitas",
                value: totalIncome,
                icon: <TrendingUp size={18} />,
                color: "#22c55e",
                count: incomeTransactions.length,
              },
              {
                label: "Despesas",
                value: totalExpenses,
                icon: <TrendingDown size={18} />,
                color: "#ef4444",
                count: debitTransactions.length + creditExpensesOnly.length,
              },
              {
                label: "Débito",
                value: totalDebitSpent,
                icon: <CreditCard size={18} />,
                color: "#f97316",
                count: debitTransactions.length,
              },
              {
                label: "Crédito",
                value: totalCreditSpent,
                icon: <ShoppingBag size={18} />,
                color: "#8b5cf6",
                count: creditExpensesOnly.length,
              },
            ].map((card, idx) => (
              <div
                key={card.label}
                className="rounded-xl border p-5 transition-colors hover:border-gray-400"
                style={{
                  backgroundColor: colors.secondary,
                  borderColor: colors.border,
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${card.color}10` }}
                  >
                    <div style={{ color: card.color }}>{card.icon}</div>
                  </div>
                  <div className={`text-xs font-medium px-2 py-1 rounded ${
                    idx === 0 ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                  }`}>
                    {card.count}
                  </div>
                </div>
                <h2
                  className="text-xl font-bold mb-1"
                  style={{ color: card.color }}
                >
                  {formatCurrency(card.value)}
                </h2>
                <p
                  className="text-sm"
                  style={{ color: colors.textPrimary }}
                >
                  {card.label}
                </p>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      backgroundColor: card.color,
                      width: `${(card.value / Math.max(totalIncome, totalExpenses)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case "categorias":
        return (
          <div className="space-y-3">
            {expensesByCategory.map(([category, data], idx) => {
              const isExpanded = expandedCategories[category];
              const categoryColor = getCategoryColor(category);
              const percentage = (data.total / totalExpenses) * 100;
              
              return (
                <div
                  key={category}
                  className="rounded-xl border overflow-hidden"
                  style={{
                    backgroundColor: colors.secondary,
                    borderColor: colors.border,
                  }}
                >
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: `${categoryColor}10`,
                        }}
                      >
                        <div style={{ color: categoryColor }}>
                          {getCategoryIcon(category)}
                        </div>
                      </div>
                      <div className="text-left">
                        <h4
                          className="text-sm font-medium mb-0.5"
                          style={{ color: colors.textPrimary }}
                        >
                          {category}
                        </h4>
                        <p
                          className="text-xs"
                          style={{ color: colors.textSecondary }}
                        >
                          {data.count} transações
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <h3
                          className="text-base font-semibold"
                          style={{ color: colors.textPrimary }}
                        >
                          {formatCurrency(data.total)}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full"
                              style={{
                                backgroundColor: categoryColor,
                                width: `${percentage}%`,
                              }}
                            />
                          </div>
                          <span
                            className="text-xs font-medium min-w-[40px]"
                            style={{ color: colors.textSecondary }}
                          >
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div
                        style={{ color: colors.textSecondary }}
                      >
                        <ChevronDown size={18} className={isExpanded ? "rotate-180" : ""} />
                      </div>
                    </div>
                  </button>

                  <div
                    className={`overflow-hidden transition-all ${
                      isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div
                      className="border-t px-4 py-3 space-y-2"
                      style={{ borderColor: colors.border }}
                    >
                      {data.transactions.map((t, tIdx) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-2 rounded-lg"
                          style={{
                            backgroundColor: colors.tertiary,
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded flex items-center justify-center"
                              style={{ backgroundColor: `${categoryColor}10` }}
                            >
                              <div style={{ color: categoryColor }}>
                                {getCategoryIcon(category)}
                              </div>
                            </div>
                            <div>
                              <p
                                className="text-sm"
                                style={{ color: colors.textPrimary }}
                              >
                                {t.description}
                              </p>
                              <p
                                className="text-xs mt-0.5"
                                style={{ color: colors.textSecondary }}
                              >
                                {new Date(t.date).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-xs px-2 py-0.5 rounded font-medium"
                              style={{
                                backgroundColor: t.accountId === creditAccount?.id 
                                  ? "#6366f110"
                                  : "#f9731610",
                                color: t.accountId === creditAccount?.id 
                                  ? "#6366f1"
                                  : "#f97316",
                              }}
                            >
                              {t.accountId === creditAccount?.id ? "Crédito" : "Débito"}
                            </span>
                            <p
                              className="text-sm font-medium"
                              style={{ color: colors.textPrimary }}
                            >
                              {formatCurrency(Math.abs(t.amount))}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case "mensal":
        return (
          <div className="space-y-4">
            {monthlyData.slice(-6).map((data, idx) => {
              const total = data.income + data.expenses;
              const incomePercentage =
                total > 0 ? (data.income / total) * 100 : 0;
              const expensesPercentage =
                total > 0 ? (data.expenses / total) * 100 : 0;
              const balance = data.income - data.expenses;

              return (
                <div
                  key={idx}
                  className="rounded-xl border p-4"
                  style={{
                    backgroundColor: colors.secondary,
                    borderColor: colors.border,
                  }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4
                        className="text-base font-medium mb-1"
                        style={{ color: colors.textPrimary }}
                      >
                        {data.month}
                      </h4>
                      <p
                        className={`text-sm font-medium ${
                          balance >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {balance >= 0 ? "+" : "-"}
                        {formatCurrency(Math.abs(balance))}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm font-medium text-green-600">
                            +{formatCurrency(data.income)}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: colors.textSecondary }}
                          >
                            Receitas
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-red-600">
                            -{formatCurrency(data.expenses)}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: colors.textSecondary }}
                          >
                            Despesas
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-600" />
                          <span
                            className="text-sm"
                            style={{ color: colors.textPrimary }}
                          >
                            Receitas
                          </span>
                        </div>
                        <span
                          className="text-sm font-medium"
                          style={{ color: colors.textPrimary }}
                        >
                          {incomePercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div
                        className="w-full rounded-full h-2 overflow-hidden"
                        style={{ backgroundColor: colors.progressBarBg }}
                      >
                        <div
                          className="h-2 rounded-full bg-green-600"
                          style={{ width: `${incomePercentage}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-600" />
                          <span
                            className="text-sm"
                            style={{ color: colors.textPrimary }}
                          >
                            Despesas
                          </span>
                        </div>
                        <span
                          className="text-sm font-medium"
                          style={{ color: colors.textPrimary }}
                        >
                          {expensesPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div
                        className="w-full rounded-full h-2 overflow-hidden"
                        style={{ backgroundColor: colors.progressBarBg }}
                      >
                        <div
                          className="h-2 rounded-full bg-red-600"
                          style={{ width: `${expensesPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case "maiores":
        return (
          <div className="space-y-3">
            {topExpenses.map((t, idx) => {
              const category = translateCategory(t.category || "Other");
              const categoryColor = getCategoryColor(category);
              
              return (
                <div
                  key={t.id}
                  className="rounded-xl border p-4"
                  style={{
                    backgroundColor: colors.secondary,
                    borderColor: colors.border,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center font-medium text-sm"
                        style={{ 
                          backgroundColor: `${categoryColor}10`,
                          color: categoryColor
                        }}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <h4
                          className="text-sm font-medium mb-1"
                          style={{ color: colors.textPrimary }}
                        >
                          {t.description}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs px-2 py-0.5 rounded font-medium"
                            style={{
                              backgroundColor: `${categoryColor}10`,
                              color: categoryColor,
                            }}
                          >
                            {category}
                          </span>
                          <span
                            className="text-xs px-2 py-0.5 rounded"
                            style={{
                              backgroundColor: colors.tertiary,
                              color: colors.textSecondary,
                            }}
                          >
                            {new Date(t.date).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <h3 className="text-base font-semibold text-red-600 mb-1">
                        {formatCurrency(Math.abs(t.amount))}
                      </h3>
                      <p
                        className="text-xs px-2 py-0.5 rounded font-medium"
                        style={{
                          backgroundColor: t.accountId === creditAccount?.id 
                            ? "#6366f110"
                            : "#f9731610",
                          color: t.accountId === creditAccount?.id 
                            ? "#6366f1"
                            : "#f97316",
                        }}
                      >
                        {t.accountId === creditAccount?.id ? "Crédito" : "Débito"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case "rendimentos":
        return (
          <div className="space-y-3">
            {incomeTransactions.map((t, idx) => {
              const category = translateCategory(t.category || "Income");
              const categoryColor = getCategoryColor(category);
              
              return (
                <div
                  key={t.id}
                  className="rounded-xl border p-4"
                  style={{
                    backgroundColor: colors.secondary,
                    borderColor: colors.border,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${categoryColor}10` }}
                      >
                        <div style={{ color: categoryColor }}>
                          {getCategoryIcon(category)}
                        </div>
                      </div>
                      <div>
                        <h4
                          className="text-sm font-medium mb-1"
                          style={{ color: colors.textPrimary }}
                        >
                          {t.description}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs px-2 py-0.5 rounded font-medium"
                            style={{
                              backgroundColor: `${categoryColor}10`,
                              color: categoryColor,
                            }}
                          >
                            {category}
                          </span>
                          <span
                            className="text-xs px-2 py-0.5 rounded"
                            style={{
                              backgroundColor: colors.tertiary,
                              color: colors.textSecondary,
                            }}
                          >
                            {new Date(t.date).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <h3 className="text-base font-semibold text-green-600 mb-1">
                        +{formatCurrency(t.amount)}
                      </h3>
                      <p
                        className="text-xs"
                        style={{ color: colors.textSecondary }}
                      >
                        Entrada
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  const filterOptions = [
    {
      id: "resumo",
      label: "Resumo Financeiro",
      icon: <BarChart3 size={16} />,
      description: "Visão geral das receitas e despesas",
    },
    {
      id: "categorias",
      label: "Gastos por Categoria",
      icon: <PieChart size={16} />,
      description: "Distribuição dos gastos por categoria",
    },
    {
      id: "mensal",
      label: "Evolução Mensal",
      icon: <TrendingUp size={16} />,
      description: "Comparativo mês a mês",
    },
    {
      id: "maiores",
      label: "Maiores Gastos",
      icon: <ListOrdered size={16} />,
      description: "Top 10 transações mais caras",
    },
    {
      id: "rendimentos",
      label: "Histórico de Rendimentos",
      icon: <DollarSign size={16} />,
      description: "Todas as entradas de dinheiro",
    },
  ];

  return (
    <div
      className="ml-72 p-6 min-h-screen transition-colors duration-300"
      style={{ backgroundColor: colors.primary }}
    >
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-xl font-semibold mb-1"
              style={{ color: colors.textPrimary }}
            >
              Análises Financeiras
            </h1>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Visualize seus gastos e receitas de forma inteligente
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.secondary,
                  border: `1px solid ${colors.border}`,
                  color: colors.textPrimary,
                }}
              >
                {filterPeriod === "tudo" ? "Todo período" : `Últimos ${filterPeriod} dias`}
                {showFilterMenu ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
              </button>

              {showFilterMenu && (
                <div
                  className="absolute right-0 top-full mt-1 rounded-lg border shadow-lg z-50 min-w-[140px] overflow-hidden"
                  style={{
                    backgroundColor: colors.secondary,
                    borderColor: colors.border,
                  }}
                >
                  {["tudo", "7", "15", "30", "60", "90"].map((days) => (
                    <button
                      key={days}
                      onClick={() => {
                        setFilterPeriod(days);
                        setShowFilterMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                        filterPeriod === days 
                          ? "text-blue-600 font-medium bg-blue-50 dark:bg-blue-900/20" 
                          : ""
                      }`}
                      style={{ color: colors.textPrimary }}
                    >
                      {days === "tudo" ? "Todo período" : `${days} dias`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {filterOptions.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                activeFilter === filter.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              style={
                activeFilter !== filter.id
                  ? {
                      backgroundColor: colors.secondary,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    }
                  : {}
              }
            >
              {filter.icon}
              <span>{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeFilter === "resumo" && (
        <div
          className="rounded-xl border p-5 mb-6"
          style={{
            backgroundColor: colors.secondary,
            borderColor: colors.border,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <DollarSign size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: colors.textSecondary }}
                  >
                    Saldo do Período
                  </span>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: colors.textSecondary }}
                  >
                    {filterPeriod === "tudo" ? "Todo período" : `Últimos ${filterPeriod} dias`}
                  </p>
                </div>
              </div>
              <h2
                className={`text-2xl font-semibold mb-2 ${
                  balance >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(balance)}
              </h2>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded font-medium ${
                    balance >= 0 
                      ? "bg-green-500/10 text-green-600" 
                      : "bg-red-500/10 text-red-600"
                  }`}
                >
                  {balance >= 0 ? "Superávit" : "Déficit"}
                </span>
                <span
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: colors.tertiary,
                    color: colors.textSecondary,
                  }}
                >
                  {transactions.length} transações
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex flex-col items-end space-y-3">
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end mb-0.5">
                    <div className="w-2 h-2 rounded-full bg-green-600" />
                    <p className="text-sm font-medium text-green-600">
                      +{formatCurrency(totalIncome)}
                    </p>
                  </div>
                  <p
                    className="text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    Entradas
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end mb-0.5">
                    <div className="w-2 h-2 rounded-full bg-red-600" />
                    <p className="text-sm font-medium text-red-600">
                      -{formatCurrency(totalExpenses)}
                    </p>
                  </div>
                  <p
                    className="text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    Saídas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className="rounded-xl border p-5"
        style={{
          backgroundColor: colors.secondary,
          borderColor: colors.border,
          minHeight: "400px",
        }}
      >
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded bg-blue-100 dark:bg-blue-900/30">
              {filterOptions.find((f) => f.id === activeFilter)?.icon}
            </div>
            <div>
              <h3
                className="text-base font-medium"
                style={{ color: colors.textPrimary }}
              >
                {filterOptions.find((f) => f.id === activeFilter)?.label}
              </h3>
              <p className="text-xs" style={{ color: colors.textSecondary }}>
                {filterOptions.find((f) => f.id === activeFilter)?.description} • 
                <span className="ml-1">
                  {filterPeriod === "tudo" ? "Todo período" : `Últimos ${filterPeriod} dias`}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          {renderFilterContent()}
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs" style={{ color: colors.textSecondary }}>
          {transactions.length} transações sincronizadas • 
          Última atualização: {new Date().toLocaleDateString("pt-BR", {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
};

export default OpenFinanceAnalysis;