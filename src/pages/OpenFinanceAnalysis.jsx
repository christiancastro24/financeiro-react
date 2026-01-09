import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Receipt,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Filter,
  PieChart,
  BarChart3,
} from "lucide-react";

const OpenFinanceAnalysis = () => {
  // --- LÓGICA DE TEMA ---
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
    tableHeader: theme === "dark" ? "#252833" : "#e9ecef",
    tableRow: theme === "dark" ? "#1e2230" : "#ffffff",
    progressBarBg: theme === "dark" ? "#252833" : "#e9ecef",
  };

  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState("tudo"); // tudo, 7, 15, 30, 60, 90
  const [filterType, setFilterType] = useState("tudo"); // tudo, credito, debito, rendimento

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

  // Separar contas
  const bankAccount = accounts.find((a) => a.type === "BANK");
  const creditAccount = accounts.find((a) => a.type === "CREDIT");

  // Filtrar por período
  const getFilteredByPeriod = (txs) => {
    if (filterPeriod === "tudo") return txs;

    const now = new Date();
    const days = parseInt(filterPeriod);
    const cutoffDate = new Date(now.setDate(now.getDate() - days));

    return txs.filter((t) => new Date(t.date) >= cutoffDate);
  };

  // Separar transações
  const allFilteredTransactions = getFilteredByPeriod(transactions);

  const debitTransactions = allFilteredTransactions.filter(
    (t) => t.accountId === bankAccount?.id && t.amount < 0
  );

  const creditTransactions = allFilteredTransactions.filter(
    (t) => t.accountId === creditAccount?.id
  );

  const creditExpensesOnly = creditTransactions.filter((t) => {
    const desc = t.description.toLowerCase();
    const isPagamento =
      desc.includes("pagamento") &&
      (desc.includes("fatura") || desc.includes("recebido"));
    return t.amount > 0 && !isPagamento;
  });

  const incomeTransactions = allFilteredTransactions.filter(
    (t) =>
      t.amount > 0 &&
      (t.category === "Income" ||
        t.description.toLowerCase().includes("rendimento") ||
        (t.description.toLowerCase().includes("transfer") && t.amount > 0))
  );

  // Cálculos
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

  // Agrupar por categoria
  const groupByCategory = (txs) => {
    const grouped = {};
    txs.forEach((t) => {
      const cat = t.category || "Outros";
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

  // Agrupar por mês
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

  // Maiores gastos
  const topExpenses = [...debitTransactions, ...creditExpensesOnly]
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, 10);

  // Cores para categorias (mantidas para progress bars)
  const categoryColors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-indigo-500",
    "bg-cyan-500",
    "bg-teal-500",
  ];

  return (
    <div
      className="ml-72 p-8 min-h-screen transition-colors duration-300"
      style={{ backgroundColor: colors.primary }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: colors.textPrimary }}
        >
          Análises Financeiras
        </h1>
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          Visualize seus gastos e receitas de forma detalhada
        </p>
      </div>

      {/* Filtros */}
      <div
        className="rounded-2xl border p-6 mb-8"
        style={{
          backgroundColor: colors.secondary,
          borderColor: colors.border,
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Filter size={20} className="text-blue-500" />
          <h3 className="font-bold" style={{ color: colors.textPrimary }}>
            Filtros
          </h3>
        </div>
        <div className="flex gap-4">
          <div>
            <label
              className="text-xs uppercase font-bold mb-2 block"
              style={{ color: colors.textSecondary }}
            >
              Período
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "tudo", label: "Tudo" },
                { value: "7", label: "7 dias" },
                { value: "15", label: "15 dias" },
                { value: "30", label: "30 dias" },
                { value: "60", label: "60 dias" },
                { value: "90", label: "90 dias" },
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => setFilterPeriod(period.value)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${
                    filterPeriod === period.value
                      ? "bg-blue-500 text-white"
                      : ""
                  }`}
                  style={
                    filterPeriod !== period.value
                      ? {
                          backgroundColor: colors.tertiary,
                          color: colors.textSecondary,
                        }
                      : {}
                  }
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total de Receitas */}
        <div
          className="rounded-2xl border p-6"
          style={{
            backgroundColor: colors.secondary,
            borderColor: colors.border,
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp size={20} className="text-green-500" />
            </div>
            <span
              className="text-[10px] font-bold uppercase"
              style={{ color: colors.textSecondary }}
            >
              Receitas
            </span>
          </div>
          <h2 className="text-2xl font-black text-green-500">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(totalIncome)}
          </h2>
          <p
            className="text-[10px] mt-1"
            style={{ color: colors.textSecondary }}
          >
            {incomeTransactions.length} transações
          </p>
        </div>

        {/* Total de Despesas */}
        <div
          className="rounded-2xl border p-6"
          style={{
            backgroundColor: colors.secondary,
            borderColor: colors.border,
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <TrendingDown size={20} className="text-red-500" />
            </div>
            <span
              className="text-[10px] font-bold uppercase"
              style={{ color: colors.textSecondary }}
            >
              Despesas
            </span>
          </div>
          <h2 className="text-2xl font-black text-red-500">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(totalExpenses)}
          </h2>
          <p
            className="text-[10px] mt-1"
            style={{ color: colors.textSecondary }}
          >
            {debitTransactions.length + creditExpensesOnly.length} transações
          </p>
        </div>

        {/* Gastos no Débito */}
        <div
          className="rounded-2xl border p-6"
          style={{
            backgroundColor: colors.secondary,
            borderColor: colors.border,
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Receipt size={20} className="text-orange-500" />
            </div>
            <span
              className="text-[10px] font-bold uppercase"
              style={{ color: colors.textSecondary }}
            >
              Débito
            </span>
          </div>
          <h2 className="text-2xl font-black text-orange-400">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(totalDebitSpent)}
          </h2>
          <p
            className="text-[10px] mt-1"
            style={{ color: colors.textSecondary }}
          >
            {debitTransactions.length} transações
          </p>
        </div>

        {/* Gastos no Crédito */}
        <div
          className="rounded-2xl border p-6"
          style={{
            backgroundColor: colors.secondary,
            borderColor: colors.border,
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <ShoppingBag size={20} className="text-purple-500" />
            </div>
            <span
              className="text-[10px] font-bold uppercase"
              style={{ color: colors.textSecondary }}
            >
              Crédito
            </span>
          </div>
          <h2 className="text-2xl font-black text-purple-400">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(totalCreditSpent)}
          </h2>
          <p
            className="text-[10px] mt-1"
            style={{ color: colors.textSecondary }}
          >
            {creditExpensesOnly.length} transações
          </p>
        </div>
      </div>

      {/* Saldo Líquido */}
      <div
        className="rounded-2xl border p-6 mb-8"
        style={{
          backgroundColor: colors.secondary,
          borderColor: colors.border,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-sm uppercase font-bold mb-2"
              style={{ color: colors.textSecondary }}
            >
              Saldo do Período
            </p>
            <h2
              className={`text-4xl font-black ${
                balance >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(balance)}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              Receitas - Despesas
            </p>
            <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
              {totalIncome > 0
                ? `${((totalExpenses / totalIncome) * 100).toFixed(1)}% gasto`
                : "0% gasto"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Gastos por Categoria */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{
            backgroundColor: colors.secondary,
            borderColor: colors.border,
          }}
        >
          <div className="p-6 border-b" style={{ borderColor: colors.border }}>
            <div className="flex items-center gap-3">
              <PieChart size={20} className="text-blue-500" />
              <h3 className="font-bold" style={{ color: colors.textPrimary }}>
                Gastos por Categoria
              </h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {expensesByCategory.slice(0, 8).map(([category, data], idx) => {
                const percentage =
                  totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0;
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            categoryColors[idx % categoryColors.length]
                          }`}
                        />
                        <span
                          className="text-sm font-medium"
                          style={{ color: colors.textPrimary }}
                        >
                          {category}
                        </span>
                      </div>
                      <div className="text-right">
                        <p
                          className="text-sm font-bold"
                          style={{ color: colors.textPrimary }}
                        >
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(data.total)}
                        </p>
                        <p
                          className="text-[10px]"
                          style={{ color: colors.textSecondary }}
                        >
                          {data.count} transações
                        </p>
                      </div>
                    </div>
                    <div
                      className="w-full rounded-full h-2"
                      style={{ backgroundColor: colors.progressBarBg }}
                    >
                      <div
                        className={`h-2 rounded-full ${
                          categoryColors[idx % categoryColors.length]
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Evolução Mensal */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{
            backgroundColor: colors.secondary,
            borderColor: colors.border,
          }}
        >
          <div className="p-6 border-b" style={{ borderColor: colors.border }}>
            <div className="flex items-center gap-3">
              <BarChart3 size={20} className="text-blue-500" />
              <h3 className="font-bold" style={{ color: colors.textPrimary }}>
                Evolução Mensal
              </h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {monthlyData.slice(-6).map((data, idx) => {
                const maxValue = Math.max(
                  ...monthlyData.map((d) => Math.max(d.income, d.expenses))
                );
                const incomeWidth = (data.income / maxValue) * 100;
                const expensesWidth = (data.expenses / maxValue) * 100;

                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-xs font-bold uppercase"
                        style={{ color: colors.textSecondary }}
                      >
                        {data.month}
                      </span>
                      <div className="flex gap-4 text-xs">
                        <span className="text-green-500 font-mono">
                          +
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            minimumFractionDigits: 0,
                          }).format(data.income)}
                        </span>
                        <span className="text-red-500 font-mono">
                          -
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            minimumFractionDigits: 0,
                          }).format(data.expenses)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div
                        className="w-full rounded-full h-1.5"
                        style={{ backgroundColor: colors.progressBarBg }}
                      >
                        <div
                          className="h-1.5 rounded-full bg-green-500"
                          style={{ width: `${incomeWidth}%` }}
                        />
                      </div>
                      <div
                        className="w-full rounded-full h-1.5"
                        style={{ backgroundColor: colors.progressBarBg }}
                      >
                        <div
                          className="h-1.5 rounded-full bg-red-500"
                          style={{ width: `${expensesWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Top 10 Maiores Gastos */}
      <div
        className="rounded-2xl border overflow-hidden mb-8"
        style={{
          backgroundColor: colors.secondary,
          borderColor: colors.border,
        }}
      >
        <div className="p-6 border-b" style={{ borderColor: colors.border }}>
          <div className="flex items-center gap-3">
            <TrendingDown size={20} className="text-red-500" />
            <h3 className="font-bold" style={{ color: colors.textPrimary }}>
              Top 10 Maiores Gastos
            </h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead
              className="text-[10px] uppercase font-bold tracking-widest"
              style={{
                backgroundColor: colors.tableHeader,
                color: colors.textSecondary,
              }}
            >
              <tr>
                <th className="p-5">#</th>
                <th className="p-5">Descrição</th>
                <th className="p-5">Categoria</th>
                <th className="p-5">Data</th>
                <th className="p-5 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: colors.border }}>
              {topExpenses.map((t, idx) => (
                <tr
                  key={t.id}
                  className="transition-colors"
                  style={{
                    backgroundColor: colors.tableRow,
                    borderColor: colors.border,
                  }}
                >
                  <td className="p-5">
                    <span
                      className="font-bold"
                      style={{ color: colors.textSecondary }}
                    >
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                        <ArrowUpRight size={16} />
                      </div>
                      <span
                        className="text-sm font-bold"
                        style={{ color: colors.textPrimary }}
                      >
                        {t.description}
                      </span>
                    </div>
                  </td>
                  <td className="p-5">
                    <span
                      className="text-xs uppercase"
                      style={{ color: colors.textSecondary }}
                    >
                      {t.category || "Outros"}
                    </span>
                  </td>
                  <td className="p-5">
                    <span
                      className="text-xs font-mono"
                      style={{ color: colors.textSecondary }}
                    >
                      {new Date(t.date).toLocaleDateString("pt-BR")}
                    </span>
                  </td>
                  <td
                    className="p-5 text-right font-bold font-mono"
                    style={{ color: colors.textPrimary }}
                  >
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(Math.abs(t.amount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Histórico de Rendimentos */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          backgroundColor: colors.secondary,
          borderColor: colors.border,
        }}
      >
        <div className="p-6 border-b" style={{ borderColor: colors.border }}>
          <div className="flex items-center gap-3">
            <TrendingUp size={20} className="text-green-500" />
            <h3 className="font-bold" style={{ color: colors.textPrimary }}>
              Histórico de Rendimentos
            </h3>
          </div>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          <table className="w-full text-left">
            <thead
              className="text-[10px] uppercase font-bold tracking-widest sticky top-0"
              style={{
                backgroundColor: colors.tableHeader,
                color: colors.textSecondary,
              }}
            >
              <tr>
                <th className="p-5">Descrição</th>
                <th className="p-5">Categoria</th>
                <th className="p-5">Data</th>
                <th className="p-5 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: colors.border }}>
              {incomeTransactions.map((t) => (
                <tr
                  key={t.id}
                  className="transition-colors"
                  style={{
                    backgroundColor: colors.tableRow,
                    borderColor: colors.border,
                  }}
                >
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                        <ArrowDownLeft size={16} />
                      </div>
                      <span
                        className="text-sm font-bold"
                        style={{ color: colors.textPrimary }}
                      >
                        {t.description}
                      </span>
                    </div>
                  </td>
                  <td className="p-5">
                    <span
                      className="text-xs uppercase"
                      style={{ color: colors.textSecondary }}
                    >
                      {t.category || "Geral"}
                    </span>
                  </td>
                  <td className="p-5">
                    <span
                      className="text-xs font-mono"
                      style={{ color: colors.textSecondary }}
                    >
                      {new Date(t.date).toLocaleDateString("pt-BR")}
                    </span>
                  </td>
                  <td className="p-5 text-right font-bold font-mono text-green-500">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {incomeTransactions.length === 0 && (
            <div
              className="p-20 text-center text-sm"
              style={{ color: colors.textSecondary }}
            >
              Nenhum rendimento encontrado no período.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpenFinanceAnalysis;
