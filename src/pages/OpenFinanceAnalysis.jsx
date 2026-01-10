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
  const [hoveredCard, setHoveredCard] = useState(null);

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
    "Transferências": <CreditCard size={20} />,
    "Investimentos": <TrendingUp size={20} />,
    "Telecomunicações": <Phone size={20} />,
    "Serviços": <Wifi size={20} />,
    "Energia Elétrica": <Zap size={20} />,
    "Compras": <ShoppingCart size={20} />,
    "Alimentação": <Utensils size={20} />,
    "Supermercado": <ShoppingCart size={20} />,
    "Transporte": <Car size={20} />,
    "Saúde": <Heart size={20} />,
    "Educação": <BookOpen size={20} />,
    "Entretenimento": <Film size={20} />,
    "Rendimentos": <DollarSign size={20} />,
    "Pagamentos": <FileText size={20} />,
    "Outro": <Cloud size={20} />,
    "Restaurante": <Coffee size={20} />,
    "Trabalho": <Briefcase size={20} />,
    "Presentes": <Gift size={20} />,
    "Viagem": <Plane size={20} />,
    "Música": <Music size={20} />,
    "Games": <Gamepad2 size={20} />,
    "Academia": <Dumbbell size={20} />,
    "Arte": <Palette size={20} />,
    "Fotografia": <Camera size={20} />,
    "Bar": <Martini size={20} />,
    "Metrô": <Train size={20} />,
    "Ônibus": <Bus size={20} />,
    "Bicicleta": <Bike size={20} />,
    "Moradia": <Home size={20} />,
    "Outros": <Receipt size={20} />,
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
    return categoryIcons[category] || <Receipt size={20} />;
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
                icon: <TrendingUp size={20} />,
                color: "#22c55e",
                count: incomeTransactions.length,
                trend: "up",
              },
              {
                label: "Despesas",
                value: totalExpenses,
                icon: <TrendingDown size={20} />,
                color: "#ef4444",
                count: debitTransactions.length + creditExpensesOnly.length,
                trend: "down",
              },
              {
                label: "Débito",
                value: totalDebitSpent,
                icon: <CreditCard size={20} />,
                color: "#f97316",
                count: debitTransactions.length,
                trend: "down",
              },
              {
                label: "Crédito",
                value: totalCreditSpent,
                icon: <ShoppingBag size={20} />,
                color: "#8b5cf6",
                count: creditExpensesOnly.length,
                trend: "down",
              },
            ].map((card, idx) => (
              <div
                key={card.label}
                className={`rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                  hoveredCard === idx ? "scale-[1.02] shadow-lg" : ""
                }`}
                style={{
                  backgroundColor: colors.secondary,
                  borderColor: colors.border,
                  background: `linear-gradient(145deg, ${colors.secondary} 0%, ${
                    theme === "dark" ? "#1e2230" : "#f1f3f5"
                  } 100%)`,
                }}
                onMouseEnter={() => setHoveredCard(idx)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: `${card.color}10` }}
                  >
                    <div style={{ color: card.color }}>{card.icon}</div>
                  </div>
                  <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                    card.trend === "up" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  }`}>
                    {card.count} transações
                  </div>
                </div>
                <h2
                  className="text-2xl font-black mb-1"
                  style={{ color: card.color }}
                >
                  {formatCurrency(card.value)}
                </h2>
                <p
                  className="text-sm font-medium"
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
          <div className="space-y-4">
            {expensesByCategory.map(([category, data], idx) => {
              const isExpanded = expandedCategories[category];
              const categoryColor = getCategoryColor(category);
              const percentage = (data.total / totalExpenses) * 100;
              
              return (
                <div
                  key={category}
                  className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                    isExpanded ? "shadow-lg" : "hover:shadow-md"
                  }`}
                  style={{
                    backgroundColor: colors.secondary,
                    borderColor: colors.border,
                  }}
                >
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full p-5 flex items-center justify-between hover:bg-opacity-80 transition-all duration-300"
                    style={{
                      backgroundColor: isExpanded ? `${categoryColor}08` : colors.secondary,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
                        style={{
                          backgroundColor: `${categoryColor}15`,
                          transform: isExpanded ? "rotate(12deg)" : "rotate(0deg)",
                        }}
                      >
                        <div style={{ color: categoryColor }}>
                          {getCategoryIcon(category)}
                        </div>
                      </div>
                      <div className="text-left">
                        <h4
                          className="text-sm font-bold mb-1"
                          style={{ color: colors.textPrimary }}
                        >
                          {category}
                        </h4>
                        <p
                          className="text-xs"
                          style={{ color: colors.textSecondary }}
                        >
                          {data.count} {data.count === 1 ? "transação" : "transações"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <h3
                          className="text-lg font-black"
                          style={{ color: colors.textPrimary }}
                        >
                          {formatCurrency(data.total)}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full transition-all duration-1000"
                              style={{
                                backgroundColor: categoryColor,
                                width: `${percentage}%`,
                              }}
                            />
                          </div>
                          <span
                            className="text-xs font-bold min-w-[40px]"
                            style={{ color: colors.textSecondary }}
                          >
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div
                        className={`transition-all duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        style={{ color: colors.textSecondary }}
                      >
                        <ChevronDown size={20} />
                      </div>
                    </div>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div
                      className="border-t px-5 py-4 space-y-2"
                      style={{ borderColor: colors.border }}
                    >
                      {data.transactions.map((t, tIdx) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-3 rounded-xl hover:scale-[1.01] transition-all duration-200"
                          style={{
                            backgroundColor: colors.tertiary,
                            transform: `translateY(${tIdx * 5}px)`,
                            opacity: isExpanded ? 1 : 0,
                            transitionDelay: `${tIdx * 50}ms`,
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${categoryColor}15` }}
                            >
                              <div style={{ color: categoryColor }}>
                                {getCategoryIcon(category)}
                              </div>
                            </div>
                            <div>
                              <p
                                className="text-sm font-medium"
                                style={{ color: colors.textPrimary }}
                              >
                                {t.description}
                              </p>
                              <p
                                className="text-xs mt-0.5"
                                style={{ color: colors.textSecondary }}
                              >
                                {new Date(t.date).toLocaleDateString("pt-BR", {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-xs px-2 py-1 rounded-full font-bold"
                              style={{
                                backgroundColor: t.accountId === creditAccount?.id 
                                  ? `${getCategoryColor("Transferências")}15`
                                  : `${getCategoryColor("Compras")}15`,
                                color: t.accountId === creditAccount?.id 
                                  ? getCategoryColor("Transferências")
                                  : getCategoryColor("Compras"),
                              }}
                            >
                              {t.accountId === creditAccount?.id ? "Crédito" : "Débito"}
                            </span>
                            <p
                              className="text-sm font-bold"
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
          <div className="space-y-5">
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
                  className="rounded-2xl border p-5 hover:shadow-lg transition-all duration-300"
                  style={{
                    backgroundColor: colors.secondary,
                    borderColor: colors.border,
                  }}
                >
                  <div className="flex justify-between items-center mb-5">
                    <div>
                      <h4
                        className="text-base font-bold mb-1"
                        style={{ color: colors.textPrimary }}
                      >
                        {data.month}
                      </h4>
                      <p
                        className={`text-sm font-bold ${
                          balance >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {balance >= 0 ? "+" : "-"}
                        {formatCurrency(Math.abs(balance))}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm font-bold text-green-500">
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
                          <p className="text-sm font-bold text-red-500">
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

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span
                            className="text-sm font-medium"
                            style={{ color: colors.textPrimary }}
                          >
                            Receitas
                          </span>
                        </div>
                        <span
                          className="text-sm font-bold"
                          style={{ color: colors.textPrimary }}
                        >
                          {incomePercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div
                        className="w-full rounded-full h-3 overflow-hidden"
                        style={{ backgroundColor: colors.progressBarBg }}
                      >
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                          style={{ width: `${incomePercentage}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <span
                            className="text-sm font-medium"
                            style={{ color: colors.textPrimary }}
                          >
                            Despesas
                          </span>
                        </div>
                        <span
                          className="text-sm font-bold"
                          style={{ color: colors.textPrimary }}
                        >
                          {expensesPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div
                        className="w-full rounded-full h-3 overflow-hidden"
                        style={{ backgroundColor: colors.progressBarBg }}
                      >
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-red-500 to-orange-400"
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
                  className="rounded-2xl border p-4 hover:scale-[1.01] hover:shadow-lg transition-all duration-300"
                  style={{
                    backgroundColor: colors.secondary,
                    borderColor: colors.border,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          idx < 3 ? "bg-gradient-to-br from-red-500 to-orange-500" 
                                 : "bg-gradient-to-br from-orange-400 to-amber-400"
                        }`}
                      >
                        <span className="text-white font-bold text-sm">
                          #{idx + 1}
                        </span>
                      </div>
                      <div>
                        <h4
                          className="text-sm font-bold mb-2"
                          style={{ color: colors.textPrimary }}
                        >
                          {t.description}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs px-2 py-1 rounded-full font-bold"
                            style={{
                              backgroundColor: `${categoryColor}15`,
                              color: categoryColor,
                            }}
                          >
                            {category}
                          </span>
                          <span
                            className="text-xs px-2 py-1 rounded-full"
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
                      <h3 className="text-xl font-black text-red-500 mb-1">
                        {formatCurrency(Math.abs(t.amount))}
                      </h3>
                      <p
                        className="text-xs px-2 py-1 rounded-full font-bold inline-block"
                        style={{
                          backgroundColor: t.accountId === creditAccount?.id 
                            ? `${getCategoryColor("Transferências")}15`
                            : `${getCategoryColor("Compras")}15`,
                          color: t.accountId === creditAccount?.id 
                            ? getCategoryColor("Transferências")
                            : getCategoryColor("Compras"),
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
                  className="rounded-2xl border p-4 hover:scale-[1.01] hover:shadow-lg transition-all duration-300"
                  style={{
                    backgroundColor: colors.secondary,
                    borderColor: colors.border,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${categoryColor}15` }}
                      >
                        <div style={{ color: categoryColor }}>
                          {getCategoryIcon(category)}
                        </div>
                      </div>
                      <div>
                        <h4
                          className="text-sm font-bold mb-2"
                          style={{ color: colors.textPrimary }}
                        >
                          {t.description}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs px-2 py-1 rounded-full font-bold"
                            style={{
                              backgroundColor: `${categoryColor}15`,
                              color: categoryColor,
                            }}
                          >
                            {category}
                          </span>
                          <span
                            className="text-xs px-2 py-1 rounded-full"
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
                      <h3 className="text-xl font-black text-green-500 mb-1">
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
      icon: <BarChart3 size={18} />,
      description: "Visão geral das receitas e despesas",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: "categorias",
      label: "Gastos por Categoria",
      icon: <PieChart size={18} />,
      description: "Distribuição dos gastos por categoria",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      id: "mensal",
      label: "Evolução Mensal",
      icon: <TrendingUp size={18} />,
      description: "Comparativo mês a mês",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      id: "maiores",
      label: "Maiores Gastos",
      icon: <ListOrdered size={18} />,
      description: "Top 10 transações mais caras",
      gradient: "from-red-500 to-orange-500",
    },
    {
      id: "rendimentos",
      label: "Histórico de Rendimentos",
      icon: <DollarSign size={18} />,
      description: "Todas as entradas de dinheiro",
      gradient: "from-yellow-500 to-amber-500",
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
              className="text-2xl font-bold mb-2"
              style={{ color: colors.textPrimary }}
            >
              Análises Financeiras
            </h1>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Visualize seus gastos e receitas de forma inteligente e interativa
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{
                backgroundColor: colors.secondary,
                border: `1px solid ${colors.border}`,
              }}
            >
              <Calendar size={16} className="text-blue-500" />
              <span className="text-sm" style={{ color: colors.textPrimary }}>
                Período
              </span>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-[1.02]"
                style={{
                  backgroundColor: colors.secondary,
                  border: `1px solid ${colors.border}`,
                  color: colors.textPrimary,
                }}
              >
                {filterPeriod === "tudo" ? "Todo período" : `Últimos ${filterPeriod} dias`}
                {showFilterMenu ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>

              {showFilterMenu && (
                <div
                  className="absolute right-0 top-full mt-2 rounded-xl border shadow-2xl z-50 min-w-[160px] overflow-hidden animate-slideDown"
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
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-blue-500/10 transition-colors ${
                        filterPeriod === days 
                          ? "text-blue-500 font-bold bg-blue-500/10" 
                          : ""
                      }`}
                      style={{ color: colors.textPrimary }}
                    >
                      <div className="flex items-center justify-between">
                        <span>{days === "tudo" ? "Todo período" : `${days} dias`}</span>
                        {filterPeriod === days && (
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {filterOptions.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`group relative overflow-hidden flex items-center gap-3 px-5 py-3 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                activeFilter === filter.id
                  ? `bg-gradient-to-r ${filter.gradient} text-white border-transparent`
                  : "hover:bg-blue-500/10 hover:border-blue-500/30"
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
              <div className="relative z-10">
                {filter.icon}
              </div>
              <span className="font-medium text-sm relative z-10">
                {filter.label}
              </span>
              {activeFilter === filter.id && (
                <div className="absolute inset-0 bg-gradient-to-r opacity-20 from-white to-transparent" />
              )}
            </button>
          ))}
        </div>
      </div>

      {activeFilter === "resumo" && (
        <div
          className="rounded-2xl border p-6 mb-8 hover:shadow-xl transition-all duration-300"
          style={{
            backgroundColor: colors.secondary,
            borderColor: colors.border,
            background: `linear-gradient(135deg, ${colors.secondary} 0%, ${
              theme === "dark" ? "#1e2230" : "#f8f9fa"
            } 100%)`,
            boxShadow: balance >= 0 
              ? "0 20px 40px rgba(34, 197, 94, 0.1)"
              : "0 20px 40px rgba(239, 68, 68, 0.1)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
                  <DollarSign size={20} className="text-white" />
                </div>
                <div>
                  <span
                    className="text-sm font-bold uppercase tracking-wider"
                    style={{ color: colors.textSecondary }}
                  >
                    Saldo do Período
                  </span>
                  <p
                    className="text-xs mt-1"
                    style={{ color: colors.textSecondary }}
                  >
                    {filterPeriod === "tudo" ? "Todo período" : `Últimos ${filterPeriod} dias`}
                  </p>
                </div>
              </div>
              <h2
                className={`text-4xl font-black mb-2 ${
                  balance >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {formatCurrency(balance)}
                <span className="text-lg ml-2">{balance >= 0 ? "😊" : "😔"}</span>
              </h2>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-3 py-1.5 rounded-full font-bold ${
                    balance >= 0 
                      ? "bg-green-500/10 text-green-500" 
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {balance >= 0 ? "✅ Superávit" : "⚠️ Déficit"}
                </span>
                <span
                  className="text-xs px-3 py-1.5 rounded-full"
                  style={{
                    backgroundColor: colors.tertiary,
                    color: colors.textSecondary,
                  }}
                >
                  📊 {transactions.length} transações
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex flex-col items-end space-y-4">
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <p className="text-sm font-bold text-green-500">
                      +{formatCurrency(totalIncome)}
                    </p>
                  </div>
                  <p
                    className="text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    🟢 Entradas
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <p className="text-sm font-bold text-red-500">
                      -{formatCurrency(totalExpenses)}
                    </p>
                  </div>
                  <p
                    className="text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    🔴 Saídas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className="rounded-2xl border p-6 hover:shadow-lg transition-all duration-300"
        style={{
          backgroundColor: colors.secondary,
          borderColor: colors.border,
          minHeight: "500px",
        }}
      >
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${
              filterOptions.find((f) => f.id === activeFilter)?.gradient
            }`}>
              {filterOptions.find((f) => f.id === activeFilter)?.icon}
            </div>
            <div>
              <h3
                className="text-lg font-bold"
                style={{ color: colors.textPrimary }}
              >
                {filterOptions.find((f) => f.id === activeFilter)?.label}
              </h3>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
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
          <span className="inline-flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            {transactions.length} transações sincronizadas • 
            <span className="mx-2">🔄</span>
            Última atualização: {new Date().toLocaleDateString("pt-BR", {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </p>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
        
        .rotate-180 {
          transform: rotate(180deg);
        }
      `}</style>
    </div>
  );
};

export default OpenFinanceAnalysis;