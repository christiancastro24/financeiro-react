import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  Wallet,
  CreditCard,
  Link2,
  ArrowUpRight,
  ArrowDownLeft,
  ShoppingBag,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Landmark,
  Receipt,
  ChevronDown,
  ChevronRight,
  BarChart3,
} from "lucide-react";

const OpenFinance = () => {
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
  };

  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [itemId, setItemId] = useState(null);
  const [apiKey, setApiKey] = useState(null);
  const [expandedInvoices, setExpandedInvoices] = useState({});
  const [activeView, setActiveView] = useState("main");

  const PLUGGY_CLIENT_ID = import.meta.env.VITE_PLUGGY_CLIENT_ID;
  const PLUGGY_CLIENT_SECRET = import.meta.env.VITE_PLUGGY_CLIENT_SECRET;

  // Carregar dados salvos ao iniciar
  useEffect(() => {
    loadSavedSession();
  }, []);

  const loadSavedSession = () => {
    try {
      const savedData = localStorage.getItem("openfinance-session");
      if (savedData) {
        const session = JSON.parse(savedData);
        setConnected(session.connected);
        setAccounts(session.accounts || []);
        setTransactions(session.transactions || []);
        setLastSync(session.lastSync ? new Date(session.lastSync) : null);
        setItemId(session.itemId);
        setApiKey(session.apiKey);
      }
    } catch (err) {
      console.log("Nenhuma sessão salva encontrada");
    }
  };

  const saveSession = (data) => {
    try {
      localStorage.setItem("openfinance-session", JSON.stringify(data));
    } catch (err) {
      console.error("Erro ao salvar sessão:", err);
    }
  };

  const clearSession = () => {
    try {
      localStorage.removeItem("openfinance-session");
    } catch (err) {
      console.error("Erro ao limpar sessão:", err);
    }
  };

  // 1. Autenticação
  const getPluggyApiKey = async () => {
    const response = await fetch("https://api.pluggy.ai/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: PLUGGY_CLIENT_ID,
        clientSecret: PLUGGY_CLIENT_SECRET,
      }),
    });
    const data = await response.json();
    return data.apiKey;
  };

  // 2. Token do Widget
  const createConnectToken = async (apiKey) => {
    const response = await fetch("https://api.pluggy.ai/connect_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-KEY": apiKey },
      body: JSON.stringify({ clientUserId: "user_" + Date.now() }),
    });
    const data = await response.json();
    return data.accessToken;
  };

  // 3. Busca de Dados
  const loadFinanceData = async (apiKey, itemId) => {
    setSyncing(true);
    try {
      const resAccounts = await fetch(
        `https://api.pluggy.ai/accounts?itemId=${itemId}`,
        {
          headers: { "X-API-KEY": apiKey },
        }
      );
      const dataAccounts = await resAccounts.json();

      if (dataAccounts.results) {
        setAccounts(dataAccounts.results);

        const txPromises = dataAccounts.results.map(async (acc) => {
          const r = await fetch(
            `https://api.pluggy.ai/transactions?accountId=${acc.id}&pageSize=50`,
            {
              headers: { "X-API-KEY": apiKey },
            }
          );
          const d = await r.json();
          return d.results || [];
        });

        const allResults = await Promise.all(txPromises);
        const allTx = allResults
          .flat()
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        setTransactions(allTx);
        const now = new Date();
        setLastSync(now);

        saveSession({
          connected: true,
          accounts: dataAccounts.results,
          transactions: allTx,
          lastSync: now.toISOString(),
          itemId,
          apiKey,
        });
      }
    } catch (err) {
      console.error("Erro na sincronização:", err);
      setError("Não foi possível carregar os dados.");
    } finally {
      setSyncing(false);
    }
  };

  // 4. Fluxo de Conexão
  const connectPluggy = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiKey = await getPluggyApiKey();
      const token = await createConnectToken(apiKey);

      const pluggyConnect = new window.PluggyConnect({
        connectToken: token,
        includeSandbox: true,
        onSuccess: (data) => {
          const newItemId = data.item.id;
          setItemId(newItemId);
          setApiKey(apiKey);
          setConnected(true);
          setTimeout(() => loadFinanceData(apiKey, newItemId), 3000);
          setLoading(false);
        },
        onError: (err) => setLoading(false),
        onClose: () => setLoading(false),
      });

      pluggyConnect.init();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Cálculos e Separação de Dados
  const bankAccount = accounts.find((a) => a.type === "BANK");
  const creditAccount = accounts.find((a) => a.type === "CREDIT");

  const bankBalance = bankAccount?.balance || 0;
  const creditBalance = creditAccount?.balance || 0;
  const creditLimit = creditAccount?.creditData?.availableCreditLimit || 0;

  // Separar transações por tipo
  const debitTransactions = transactions.filter(
    (t) => t.accountId === bankAccount?.id && t.amount < 0
  );

  const creditTransactions = transactions.filter(
    (t) => t.accountId === creditAccount?.id
  );

  const incomeTransactions = transactions.filter(
    (t) =>
      t.amount > 0 &&
      (t.category === "Income" ||
        t.description.toLowerCase().includes("rendimento") ||
        (t.description.toLowerCase().includes("transfer") && t.amount > 0))
  );

  const creditExpensesOnly = creditTransactions.filter((t) => {
    const desc = t.description.toLowerCase();
    const isPagamento =
      desc.includes("pagamento") &&
      (desc.includes("fatura") || desc.includes("recebido"));
    return t.amount > 0 && !isPagamento;
  });

  // Agrupar transações de crédito por mês/ano (fatura)
  const groupCreditByInvoice = () => {
    const grouped = {};

    const creditExpenses = creditTransactions.filter((t) => {
      const desc = t.description.toLowerCase();
      const isPagamento =
        desc.includes("pagamento") &&
        (desc.includes("fatura") || desc.includes("recebido"));
      return t.amount > 0 && !isPagamento;
    });

    creditExpenses.forEach((t) => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;

      if (!grouped[key]) {
        grouped[key] = {
          month: date.toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          }),
          total: 0,
          transactions: [],
        };
      }
      grouped[key].total += t.amount;
      grouped[key].transactions.push(t);
    });

    return Object.entries(grouped)
      .filter(([_, invoice]) => invoice.transactions.length > 0)
      .sort((a, b) => b[0].localeCompare(a[0]));
  };

  const creditInvoices = groupCreditByInvoice();

  const toggleInvoice = (key) => {
    setExpandedInvoices((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Filtrar transações pela aba ativa
  const getFilteredTransactions = () => {
    switch (activeTab) {
      case "credit":
        return null; // Renderização especial para crédito
      case "debit":
        return debitTransactions;
      case "income":
        return incomeTransactions;
      default:
        return transactions;
    }
  };

  const filteredTransactions = getFilteredTransactions();

  // VIEW: ESTADO DESCONECTADO
  if (!connected) {
    return (
      <div
        className="ml-72 min-h-screen flex items-center justify-center transition-colors duration-300 p-6"
        style={{ backgroundColor: colors.primary }}
      >
        <div
          className="rounded-3xl border p-10 text-center max-w-md shadow-2xl"
          style={{
            backgroundColor: colors.secondary,
            borderColor: colors.border,
          }}
        >
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Link2 size={32} className="text-blue-500" />
          </div>
          <h2
            className="text-xl font-bold mb-3"
            style={{ color: colors.textPrimary }}
          >
            Conectar Banco
          </h2>
          <p className="text-sm mb-8" style={{ color: colors.textSecondary }}>
            Sincronize sua conta do Mercado Pago para ver seus gastos em tempo
            real.
          </p>
          <button
            onClick={connectPluggy}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-white"
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={20} />
            ) : (
              <Landmark size={20} />
            )}
            {loading ? "Autenticando..." : "Conectar agora"}
          </button>
        </div>
      </div>
    );
  }

  // VIEW: DASHBOARD COMPLETO
  return (
    <div
      className="ml-72 min-h-screen transition-colors duration-300 p-6"
      style={{ backgroundColor: colors.primary }}
    >
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: colors.textPrimary }}
          >
            Open Finance
          </h1>
          <p
            className="text-xs flex items-center gap-1 mt-1"
            style={{ color: colors.textSecondary }}
          >
            <CheckCircle2 size={12} className="text-green-500" />
            Conexão ativa • Atualizado às {lastSync?.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => apiKey && itemId && loadFinanceData(apiKey, itemId)}
            disabled={syncing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold uppercase flex items-center gap-2 transition-all disabled:opacity-50 text-white"
          >
            <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Sincronizando..." : "Atualizar"}
          </button>
          <button
            onClick={() => {
              clearSession();
              setConnected(false);
              setAccounts([]);
              setTransactions([]);
              setLastSync(null);
              setItemId(null);
              setApiKey(null);
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-bold uppercase text-white"
          >
            Desconectar
          </button>
        </div>
      </div>

      {/* Grid de Cards Financeiros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Saldo Disponível */}
        <div
          className="rounded-2xl border p-6 shadow-lg"
          style={{
            backgroundColor: colors.secondary,
            borderColor: colors.border,
          }}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 bg-green-500/10 rounded-lg">
              <Wallet size={20} className="text-green-500" />
            </span>
            <span
              className="text-[10px] px-2 py-1 rounded font-bold uppercase tracking-widest"
              style={{
                backgroundColor: colors.cardItem,
                color: colors.textSecondary,
              }}
            >
              Conta
            </span>
          </div>
          <p
            className="text-xs font-medium uppercase mb-1"
            style={{ color: colors.textSecondary }}
          >
            Saldo Disponível
          </p>
          <h2
            className="text-3xl font-black"
            style={{ color: colors.textPrimary }}
          >
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(bankBalance)}
          </h2>
        </div>

        {/* Fatura do Cartão */}
        <div
          className="rounded-2xl border p-6 shadow-lg"
          style={{
            backgroundColor: colors.secondary,
            borderColor: colors.border,
          }}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 bg-red-500/10 rounded-lg">
              <CreditCard size={20} className="text-red-500" />
            </span>
            <span
              className="text-[10px] px-2 py-1 rounded font-bold uppercase tracking-widest"
              style={{
                backgroundColor: colors.cardItem,
                color: colors.textSecondary,
              }}
            >
              Cartão
            </span>
          </div>
          <p
            className="text-xs font-medium uppercase mb-1"
            style={{ color: colors.textSecondary }}
          >
            Fatura Atual
          </p>
          <h2 className="text-3xl font-black text-red-400">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(Math.abs(creditBalance))}
          </h2>
          <p
            className="text-[10px] mt-2 font-bold uppercase"
            style={{ color: colors.textSecondary }}
          >
            Limite Livre:{" "}
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(creditLimit)}
          </p>
        </div>
      </div>

      {/* Tabela de Extrato com Abas */}
      <div
        className="rounded-3xl border overflow-hidden shadow-2xl"
        style={{
          backgroundColor: colors.secondary,
          borderColor: colors.border,
        }}
      >
        <div className="p-6 border-b" style={{ borderColor: colors.border }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ShoppingBag size={20} className="text-blue-500" />
              <h3 className="font-bold" style={{ color: colors.textPrimary }}>
                Extrato Financeiro
              </h3>
              {syncing && (
                <RefreshCw
                  size={14}
                  className="animate-spin"
                  style={{ color: colors.textSecondary }}
                />
              )}
            </div>
          </div>

          {/* Abas de Filtro */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                activeTab === "all" ? "bg-blue-500 text-white" : ""
              }`}
              style={
                activeTab !== "all"
                  ? {
                      backgroundColor: colors.tertiary,
                      color: colors.textSecondary,
                    }
                  : {}
              }
            >
              Todas ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTab("credit")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                activeTab === "credit" ? "bg-purple-500 text-white" : ""
              }`}
              style={
                activeTab !== "credit"
                  ? {
                      backgroundColor: colors.tertiary,
                      color: colors.textSecondary,
                    }
                  : {}
              }
            >
              Crédito ({creditExpensesOnly.length})
            </button>
            <button
              onClick={() => setActiveTab("debit")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                activeTab === "debit" ? "bg-orange-500 text-white" : ""
              }`}
              style={
                activeTab !== "debit"
                  ? {
                      backgroundColor: colors.tertiary,
                      color: colors.textSecondary,
                    }
                  : {}
              }
            >
              Débito ({debitTransactions.length})
            </button>
          </div>
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          {activeTab === "credit" ? (
            // Visualização especial para Crédito com Faturas
            <div className="divide-y" style={{ borderColor: colors.border }}>
              {creditInvoices.map(([key, invoice]) => (
                <div key={key}>
                  {/* Cabeçalho da Fatura */}
                  <button
                    onClick={() => toggleInvoice(key)}
                    className="w-full p-6 flex items-center justify-between transition-colors group"
                    style={{
                      backgroundColor: colors.secondary,
                      borderColor: colors.border,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <CreditCard size={20} className="text-purple-400" />
                      </div>
                      <div className="text-left">
                        <p
                          className="text-sm font-bold uppercase tracking-tight"
                          style={{ color: colors.textPrimary }}
                        >
                          Fatura de {invoice.month}
                        </p>
                        <span
                          className="text-[10px] font-bold uppercase"
                          style={{ color: colors.textSecondary }}
                        >
                          {invoice.transactions.length} transações
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-purple-400 font-mono">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(invoice.total)}
                      </span>
                      {expandedInvoices[key] ? (
                        <ChevronDown
                          size={20}
                          style={{ color: colors.textSecondary }}
                        />
                      ) : (
                        <ChevronRight
                          size={20}
                          style={{ color: colors.textSecondary }}
                        />
                      )}
                    </div>
                  </button>

                  {/* Transações da Fatura (Expandível) */}
                  {expandedInvoices[key] && (
                    <div
                      style={{
                        backgroundColor: colors.cardItem,
                        borderColor: colors.border,
                      }}
                    >
                      <table className="w-full text-left">
                        <tbody
                          className="divide-y"
                          style={{ borderColor: colors.border }}
                        >
                          {invoice.transactions.map((t) => (
                            <tr
                              key={t.id}
                              className="transition-colors group"
                              style={{
                                borderColor: colors.border,
                                backgroundColor: colors.cardItem,
                              }}
                            >
                              <td className="p-5 pl-16">
                                <div className="flex items-center gap-4">
                                  <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                                    <ArrowUpRight size={16} />
                                  </div>
                                  <div>
                                    <p
                                      className="text-sm font-bold uppercase tracking-tight transition-colors"
                                      style={{ color: colors.textPrimary }}
                                    >
                                      {t.description}
                                    </p>
                                    <span
                                      className="text-[10px] font-bold uppercase"
                                      style={{ color: colors.textSecondary }}
                                    >
                                      {t.category || "Geral"}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td
                                className="p-5 text-xs font-mono"
                                style={{ color: colors.textSecondary }}
                              >
                                {new Date(t.date).toLocaleDateString("pt-BR")}
                              </td>
                              <td
                                className="p-5 text-right font-bold font-mono"
                                style={{ color: colors.textPrimary }}
                              >
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                }).format(t.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
              {creditInvoices.length === 0 && (
                <div
                  className="p-20 text-center text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Nenhuma fatura encontrada.
                </div>
              )}
            </div>
          ) : (
            // Visualização padrão para outras abas
            <table className="w-full text-left">
              <thead
                className="text-[10px] uppercase font-bold tracking-widest sticky top-0"
                style={{
                  backgroundColor: colors.cardItem,
                  color: colors.textSecondary,
                }}
              >
                <tr>
                  <th className="p-5">Descrição</th>
                  <th className="p-5">Tipo</th>
                  <th className="p-5">Data</th>
                  <th className="p-5 text-right">Valor</th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: colors.border }}
              >
                {filteredTransactions &&
                  filteredTransactions.map((t) => {
                    const isCreditTx = t.accountId === creditAccount?.id;
                    const isIncome = t.amount > 0;

                    return (
                      <tr
                        key={t.id}
                        className="transition-colors group"
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.secondary,
                        }}
                      >
                        <td className="p-5">
                          <div className="flex items-center gap-4">
                            <div
                              className={`p-2 rounded-lg ${
                                isIncome
                                  ? "bg-green-500/10 text-green-400"
                                  : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              {isIncome ? (
                                <ArrowDownLeft size={16} />
                              ) : (
                                <ArrowUpRight size={16} />
                              )}
                            </div>
                            <div>
                              <p
                                className="text-sm font-bold uppercase tracking-tight transition-colors"
                                style={{ color: colors.textPrimary }}
                              >
                                {t.description}
                              </p>
                              <span
                                className="text-[10px] font-bold uppercase"
                                style={{ color: colors.textSecondary }}
                              >
                                {t.category || "Geral"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-5">
                          <span
                            className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${
                              isCreditTx
                                ? "bg-purple-500/10 text-purple-400"
                                : "bg-orange-500/10 text-orange-400"
                            }`}
                          >
                            {isCreditTx ? "Crédito" : "Débito"}
                          </span>
                        </td>
                        <td
                          className="p-5 text-xs font-mono"
                          style={{ color: colors.textSecondary }}
                        >
                          {new Date(t.date).toLocaleDateString("pt-BR")}
                        </td>
                        <td
                          className={`p-5 text-right font-bold font-mono ${
                            isIncome ? "text-green-500" : ""
                          }`}
                          style={!isIncome ? { color: colors.textPrimary } : {}}
                        >
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(t.amount)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}
          {filteredTransactions &&
            filteredTransactions.length === 0 &&
            activeTab !== "credit" && (
              <div
                className="p-20 text-center text-sm"
                style={{ color: colors.textSecondary }}
              >
                Nenhuma transação nesta categoria.
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default OpenFinance;
