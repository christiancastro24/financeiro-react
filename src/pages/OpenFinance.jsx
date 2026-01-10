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
  Landmark,
  ChevronDown,
  ChevronRight,
  Building2,
  User,
  Calendar,
  Settings,
  X,
} from "lucide-react";

const OpenFinance = () => {
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
  const [accountFilter, setAccountFilter] = useState("all");

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [closingDay, setClosingDay] = useState(10);
  const [detectedBank, setDetectedBank] = useState(null);
  const [userConfig, setUserConfig] = useState(null);

  const PLUGGY_CLIENT_ID = import.meta.env.VITE_PLUGGY_CLIENT_ID;
  const PLUGGY_CLIENT_SECRET = import.meta.env.VITE_PLUGGY_CLIENT_SECRET;

  useEffect(() => {
    const savedConfig = localStorage.getItem("openfinance-config");
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setUserConfig(config);
        setClosingDay(config.closingDay || 10);
      } catch (err) {
        console.error("Erro ao carregar configuração:", err);
      }
    }
  }, []);

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

        if (session.accounts?.length > 0) {
          detectBankFromAccounts(session.accounts);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar sessão:", err);
    }
  };

  const detectBankFromAccounts = (accounts) => {
    const accountNames = accounts.map((a) => a.name?.toLowerCase() || "");

    for (const name of accountNames) {
      if (name.includes("sicredi") || name.includes("cooperativa")) {
        setDetectedBank("SICREDI");
        return;
      }
      if (name.includes("nubank") || name.includes("nu bank")) {
        setDetectedBank("NUBANK");
        return;
      }
      if (name.includes("itau") || name.includes("itaú")) {
        setDetectedBank("ITAU");
        return;
      }
      if (name.includes("bradesco")) {
        setDetectedBank("BRADESCO");
        return;
      }
      if (name.includes("santander")) {
        setDetectedBank("SANTANDER");
        return;
      }
    }

    setDetectedBank("OUTRO");
  };

  useEffect(() => {
    if (connected && accounts.length > 0) {
      const hasCreditAccounts = accounts.some((a) => a.type === "CREDIT");

      if (hasCreditAccounts && !userConfig) {
        const timer = setTimeout(() => {
          setShowConfigModal(true);
        }, 1500);

        return () => clearTimeout(timer);
      }
    }
  }, [connected, accounts, userConfig]);

  const saveSession = (data) => {
    try {
      localStorage.setItem("openfinance-session", JSON.stringify(data));
    } catch (err) {
      console.error("Erro ao salvar sessão:", err);
    }
  };

  const saveConfiguration = () => {
    const config = {
      closingDay: parseInt(closingDay),
      bank: detectedBank,
      configuredAt: new Date().toISOString(),
    };

    localStorage.setItem("openfinance-config", JSON.stringify(config));
    setUserConfig(config);
    setShowConfigModal(false);
  };

  const clearSession = () => {
    try {
      localStorage.removeItem("openfinance-session");
      localStorage.removeItem("openfinance-config");
      setUserConfig(null);
      setDetectedBank(null);
    } catch (err) {
      console.error("Erro ao limpar sessão:", err);
    }
  };

  const getPluggyApiKey = async () => {
    const response = await fetch("https://api.pluggy.ai/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: PLUGGY_CLIENT_ID,
        clientSecret: PLUGGY_CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na autenticação: ${response.status}`);
    }

    const data = await response.json();
    return data.apiKey;
  };

  const createConnectToken = async (apiKey) => {
    const response = await fetch("https://api.pluggy.ai/connect_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify({ clientUserId: "user_" + Date.now() }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar token: ${response.status}`);
    }

    const data = await response.json();
    return data.accessToken;
  };

  const loadFinanceData = async (apiKey, itemId) => {
    setSyncing(true);
    setError(null);
    try {
      const resAccounts = await fetch(
        `https://api.pluggy.ai/accounts?itemId=${itemId}`,
        {
          headers: {
            "X-API-KEY": apiKey,
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          cache: "no-store",
        }
      );

      if (!resAccounts.ok) {
        throw new Error(`Erro ao buscar contas: ${resAccounts.status}`);
      }

      const dataAccounts = await resAccounts.json();

      if (dataAccounts.results && dataAccounts.results.length > 0) {
        setAccounts(dataAccounts.results);
        detectBankFromAccounts(dataAccounts.results);

        const txPromises = dataAccounts.results.map(async (acc) => {
          try {
            const url = `https://api.pluggy.ai/transactions?accountId=${acc.id}`;
            const response = await fetch(url, {
              headers: {
                "X-API-KEY": apiKey,
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
                Pragma: "no-cache",
              },
              cache: "no-store",
            });

            if (!response.ok) {
              return [];
            }

            const data = await response.json();
            return (data.results || []).map((tx) => ({
              ...tx,
              accountType: acc.type,
              accountName: acc.name || acc.type,
              accountId: acc.id,
            }));
          } catch (err) {
            return [];
          }
        });

        const allResults = await Promise.all(txPromises);
        const allTx = allResults
          .flat()
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        console.log(`Banco: ${detectedBank}, Transações: ${allTx.length}`);

        setTransactions(allTx);
        const syncDate = new Date();
        setLastSync(syncDate);

        saveSession({
          connected: true,
          accounts: dataAccounts.results,
          transactions: allTx,
          lastSync: syncDate.toISOString(),
          itemId,
          apiKey,
        });
      }
    } catch (err) {
      setError(`Erro: ${err.message}`);
      console.error("Erro no loadFinanceData:", err);
    } finally {
      setSyncing(false);
    }
  };

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

          setTimeout(() => {
            loadFinanceData(apiKey, newItemId);
          }, 4000);

          setLoading(false);
        },
        onError: (err) => {
          setError(`Erro no widget: ${err.message || "Falha na conexão"}`);
          setLoading(false);
        },
        onClose: () => {
          setLoading(false);
        },
      });

      pluggyConnect.init();
    } catch (err) {
      setError(`Falha na conexão: ${err.message}`);
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    if (!apiKey || !itemId) {
      setError("API Key ou Item ID não encontrados. Reconecte sua conta.");
      return;
    }

    setSyncing(true);
    try {
      await fetch(`https://api.pluggy.ai/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json",
        },
      });

      setTimeout(() => loadFinanceData(apiKey, itemId), 3000);
    } catch (e) {
      setSyncing(false);
    }
  };

  const hasMultipleAccounts = accounts.length > 1;
  let pfAccounts = [];
  let pjAccounts = [];

  if (hasMultipleAccounts) {
    pjAccounts = accounts.filter((a) => {
      const name = a.name?.toLowerCase() || "";
      const tax = a.taxNumber?.replace(/\D/g, "") || "";
      return (
        name.includes("company") || name.includes("empresa") || tax.length > 11
      );
    });

    pfAccounts = accounts.filter((a) => {
      const name = a.name?.toLowerCase() || "";
      const tax = a.taxNumber?.replace(/\D/g, "") || "";
      return (
        !name.includes("company") &&
        !name.includes("empresa") &&
        tax.length <= 11
      );
    });
  } else {
    pfAccounts = accounts;
    pjAccounts = [];
  }

  const pfBankAccount = pfAccounts.find((a) => a.type === "BANK");
  const pjBankAccount = pjAccounts.find((a) => a.type === "BANK");
  const pfCreditAccount = pfAccounts.find((a) => a.type === "CREDIT");
  const pjCreditAccount = pjAccounts.find((a) => a.type === "CREDIT");

  const pfBankBalance = pfBankAccount?.balance || 0;
  const pjBankBalance = pjBankAccount?.balance || 0;
  const pfCreditBalance = pfCreditAccount?.balance || 0;
  const pjCreditBalance = pjCreditAccount?.balance || 0;
  const pfCreditLimit = pfCreditAccount?.creditData?.availableCreditLimit || 0;
  const pjCreditLimit = pjCreditAccount?.creditData?.availableCreditLimit || 0;

  const filteredByAccount = transactions.filter((t) => {
    if (accountFilter === "all") return true;
    if (accountFilter === "pf") {
      const pfAccountIds = pfAccounts.map((a) => a.id);
      return pfAccountIds.includes(t.accountId);
    }
    if (accountFilter === "pj") {
      const pjAccountIds = pjAccounts.map((a) => a.id);
      return pjAccountIds.includes(t.accountId);
    }
    return true;
  });

  const debitTransactions = filteredByAccount.filter(
    (t) => t.accountType === "BANK" && t.amount < 0
  );

  const creditTransactions = filteredByAccount.filter(
    (t) => t.accountType === "CREDIT" && t.amount > 0
  );

  const incomeTransactions = filteredByAccount.filter(
    (t) =>
      t.amount > 0 &&
      (t.category === "Income" ||
        t.description?.toLowerCase().includes("rendimento") ||
        (t.description?.toLowerCase().includes("transfer") && t.amount > 0) ||
        t.description?.toLowerCase().includes("depósito") ||
        t.description?.toLowerCase().includes("recebido"))
  );

  const creditExpensesOnly = creditTransactions.filter((t) => {
    const desc = t.description?.toLowerCase() || "";
    const isPagamento =
      desc.includes("pagamento") &&
      (desc.includes("fatura") || desc.includes("recebido"));
    return t.amount > 0 && !isPagamento;
  });

  // NOVA LÓGICA SIMPLIFICADA - SEM REPETIÇÃO DE MESES
  const groupCreditByInvoice = () => {
    if (!userConfig) return [];

    const creditTx = filteredByAccount.filter(
      (t) => t.accountType === "CREDIT" && t.amount > 0
    );
    if (creditTx.length === 0) return [];

    const grouped = {};
    const userClosingDay = closingDay || 10;

    // Agrupar por MÊS DA FATURA (não da compra)
    creditTx.forEach((transaction) => {
      const purchaseDate = new Date(transaction.date);

      // Determinar em qual fatura esta compra cai
      // Se fecha dia 10: compras de 11/mês-anterior a 10/mês-atual
      let invoiceMonth = purchaseDate.getMonth();
      let invoiceYear = purchaseDate.getFullYear();

      // Se a compra foi feita DEPOIS do dia de fechamento, vai para a próxima fatura
      if (purchaseDate.getDate() > userClosingDay) {
        invoiceMonth++;
        if (invoiceMonth > 11) {
          invoiceMonth = 0;
          invoiceYear++;
        }
      }

      const invoiceKey = `${invoiceYear}-${invoiceMonth}`;
      const invoiceDate = new Date(invoiceYear, invoiceMonth, userClosingDay);

      if (!grouped[invoiceKey]) {
        grouped[invoiceKey] = {
          month: invoiceDate.toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          }),
          total: 0,
          transactions: [],
          invoiceDate: invoiceDate,
          closingDate: invoiceDate.getTime(),
          periodStart: new Date(
            invoiceYear,
            invoiceMonth - 1,
            userClosingDay + 1
          ),
          periodEnd: new Date(invoiceYear, invoiceMonth, userClosingDay),
        };
      }

      grouped[invoiceKey].transactions.push(transaction);
      grouped[invoiceKey].total += transaction.amount;
    });

    // Calcular período para exibição
    Object.values(grouped).forEach((invoice) => {
      if (invoice.periodStart && invoice.periodEnd) {
        invoice.periodText = `${invoice.periodStart.getDate()}/${
          invoice.periodStart.getMonth() + 1
        } a ${invoice.periodEnd.getDate()}/${invoice.periodEnd.getMonth() + 1}`;
      }
    });

    console.log("Faturas agrupadas:", Object.keys(grouped).length);

    return Object.entries(grouped)
      .filter(([_, invoice]) => invoice.transactions.length > 0)
      .sort((a, b) => b[1].closingDate - a[1].closingDate);
  };

  const creditInvoices = groupCreditByInvoice();

  const toggleInvoice = (key) => {
    setExpandedInvoices((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const limitedCreditInvoices = creditInvoices.map(([key, invoice]) => [
    key,
    {
      ...invoice,
      transactions: invoice.transactions.slice(0, 15),
    },
  ]);

  const getFilteredTransactions = () => {
    switch (activeTab) {
      case "credit":
        return null;
      case "debit":
        return debitTransactions.slice(0, 15);
      default:
        return filteredByAccount.slice(0, 30);
    }
  };

  const filteredTransactions = getFilteredTransactions();

  const ConfigModal = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-2xl p-6 max-w-md w-full relative"
        style={{
          backgroundColor: colors.secondary,
          borderColor: colors.border,
          borderWidth: "1px",
        }}
      >
        <button
          onClick={() => setShowConfigModal(false)}
          className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          style={{ color: colors.textSecondary }}
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Settings size={24} className="text-blue-500" />
          </div>
          <div>
            <h3 className="font-bold" style={{ color: colors.textPrimary }}>
              Configurar Cartão
            </h3>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Para organizar suas faturas
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
            Informe o dia de fechamento da sua fatura:
          </p>

          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.textPrimary }}
            >
              Dia de fechamento
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="31"
                value={closingDay}
                onChange={(e) => setClosingDay(parseInt(e.target.value))}
                className="flex-1"
              />
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Calendar size={20} className="text-blue-500" />
                </div>
                <span
                  className="text-2xl font-bold"
                  style={{ color: colors.textPrimary }}
                >
                  {closingDay}
                </span>
              </div>
            </div>
          </div>

          <div
            className="text-xs p-3 rounded-lg mb-4"
            style={{ backgroundColor: colors.tertiary }}
          >
            <p style={{ color: colors.textSecondary }}>
              Exemplo: Se fecha dia {closingDay}, as compras de {closingDay + 1}{" "}
              a {closingDay} do mês seguinte formarão uma fatura.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowConfigModal(false)}
            className="flex-1 py-3 rounded-lg font-medium"
            style={{
              backgroundColor: colors.tertiary,
              color: colors.textSecondary,
            }}
          >
            Depois
          </button>
          <button
            onClick={saveConfiguration}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-white"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );

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
            Sincronize sua conta bancária para ver seus gastos em tempo real.
          </p>
          <button
            onClick={connectPluggy}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-white disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={20} />
            ) : (
              <Landmark size={20} />
            )}
            {loading ? "Autenticando..." : "Conectar agora"}
          </button>
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {showConfigModal && <ConfigModal />}

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
              Conexão ativa • {lastSync?.toLocaleTimeString()}
              {userConfig && (
                <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-[10px]">
                  Fatura: dia {closingDay}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfigModal(true)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-xs font-bold uppercase flex items-center gap-2 transition-all text-white"
            >
              <Settings size={14} />
              Configurar
            </button>
            <button
              onClick={handleManualRefresh}
              disabled={syncing}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold uppercase flex items-center gap-2 transition-all disabled:opacity-50 text-white"
            >
              <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Sincronizando..." : "Atualizar"}
            </button>
            <button
              onClick={() => {
                setConnected(false);
                setAccounts([]);
                setTransactions([]);
                setLastSync(null);
                setItemId(null);
                setApiKey(null);
                clearSession();
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-bold uppercase text-white"
            >
              Desconectar
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm font-mono">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-xs text-red-300 hover:text-red-100"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Cards PF */}
        {pfAccounts.length > 0 && (
          <>
            {hasMultipleAccounts && (
              <div className="flex items-center gap-2 mb-4">
                <User size={16} className="text-blue-400" />
                <h2
                  className="text-sm font-bold uppercase tracking-wide"
                  style={{ color: colors.textSecondary }}
                >
                  Pessoa Física
                </h2>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
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
                  }).format(pfBankBalance)}
                </h2>
              </div>

              {pfCreditAccount && (
                <div
                  className="rounded-2xl border p-6 shadow-lg"
                  style={{
                    backgroundColor: colors.secondary,
                    borderColor: colors.border,
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="p-2 bg-purple-500/10 rounded-lg">
                      <CreditCard size={20} className="text-purple-500" />
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
                    }).format(Math.abs(pfCreditBalance))}
                  </h2>
                  <p
                    className="text-[10px] mt-2 font-bold uppercase"
                    style={{ color: colors.textSecondary }}
                  >
                    Limite Livre:{" "}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(pfCreditLimit)}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Cards PJ */}
        {pjAccounts.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={16} className="text-purple-400" />
              <h2
                className="text-sm font-bold uppercase tracking-wide"
                style={{ color: colors.textSecondary }}
              >
                Empresa
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
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
                  }).format(pjBankBalance)}
                </h2>
              </div>

              {pjCreditAccount && (
                <div
                  className="rounded-2xl border p-6 shadow-lg"
                  style={{
                    backgroundColor: colors.secondary,
                    borderColor: colors.border,
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="p-2 bg-purple-500/10 rounded-lg">
                      <CreditCard size={20} className="text-purple-500" />
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
                    }).format(Math.abs(pjCreditBalance))}
                  </h2>
                  <p
                    className="text-[10px] mt-2 font-bold uppercase"
                    style={{ color: colors.textSecondary }}
                  >
                    Limite Livre:{" "}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(pjCreditLimit)}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Tabela de Extrato */}
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
              <div className="text-xs" style={{ color: colors.textSecondary }}>
                {filteredByAccount.length} transações
              </div>
            </div>

            {hasMultipleAccounts && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setAccountFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                    accountFilter === "all" ? "bg-gray-500 text-white" : ""
                  }`}
                  style={
                    accountFilter !== "all"
                      ? {
                          backgroundColor: colors.tertiary,
                          color: colors.textSecondary,
                        }
                      : {}
                  }
                >
                  Todas Contas
                </button>
                {pfAccounts.length > 0 && (
                  <button
                    onClick={() => setAccountFilter("pf")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1 ${
                      accountFilter === "pf" ? "bg-blue-500 text-white" : ""
                    }`}
                    style={
                      accountFilter !== "pf"
                        ? {
                            backgroundColor: colors.tertiary,
                            color: colors.textSecondary,
                          }
                        : {}
                    }
                  >
                    <User size={12} />
                    PF
                  </button>
                )}
                {pjAccounts.length > 0 && (
                  <button
                    onClick={() => setAccountFilter("pj")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1 ${
                      accountFilter === "pj" ? "bg-purple-500 text-white" : ""
                    }`}
                    style={
                      accountFilter !== "pj"
                        ? {
                            backgroundColor: colors.tertiary,
                            color: colors.textSecondary,
                          }
                        : {}
                    }
                  >
                    <Building2 size={12} />
                    PJ
                  </button>
                )}
              </div>
            )}

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
                Todas (
                {filteredByAccount.length > 30
                  ? "30"
                  : filteredByAccount.length}
                )
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
                Débito (
                {debitTransactions.length > 15
                  ? "15"
                  : debitTransactions.length}
                )
              </button>
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto transactions-list">
            {activeTab === "credit" ? (
              <div>
                {limitedCreditInvoices.length > 0 ? (
                  limitedCreditInvoices.map(([key, invoice]) => (
                    <div key={key}>
                      <button
                        onClick={() => toggleInvoice(key)}
                        className="w-full p-6 flex items-center justify-between border-b"
                        style={{
                          backgroundColor: colors.secondary,
                          borderColor: colors.border,
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-purple-500/10">
                            <CreditCard size={20} className="text-purple-500" />
                          </div>
                          <div className="text-left">
                            <p
                              className="text-sm font-bold uppercase tracking-tight"
                              style={{ color: colors.textPrimary }}
                            >
                              {invoice.month}
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
                          <div className="text-right">
                            <span className="text-lg font-bold text-purple-500 font-mono block">
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(invoice.total)}
                            </span>
                            {invoice.periodText && (
                              <span
                                className="text-xs"
                                style={{ color: colors.textSecondary }}
                              >
                                {invoice.periodText}
                              </span>
                            )}
                          </div>
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
                                  style={{
                                    borderColor: colors.border,
                                    backgroundColor: colors.cardItem,
                                  }}
                                >
                                  <td className="p-5">
                                    <div className="flex items-center gap-3">
                                      <div className="p-1 rounded-lg bg-red-500/10 text-red-400">
                                        <ArrowUpRight size={14} />
                                      </div>
                                      <div>
                                        <p
                                          className="text-xs font-bold uppercase tracking-tight"
                                          style={{ color: colors.textPrimary }}
                                        >
                                          {t.description}
                                        </p>
                                        <span
                                          className="text-[9px] font-bold uppercase"
                                          style={{
                                            color: colors.textSecondary,
                                          }}
                                        >
                                          {new Date(t.date).toLocaleDateString(
                                            "pt-BR"
                                          )}
                                        </span>
                                      </div>
                                    </div>
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
                  ))
                ) : (
                  <div
                    className="p-20 text-center text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    {userConfig
                      ? "Nenhuma fatura encontrada."
                      : "Configure o dia de fechamento."}
                  </div>
                )}
              </div>
            ) : (
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
                  {filteredTransactions && filteredTransactions.length > 0 ? (
                    filteredTransactions.map((t) => {
                      const isCreditTx = t.accountType === "CREDIT";
                      const isIncome = t.amount > 0;

                      return (
                        <tr
                          key={t.id}
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
                                  className="text-sm font-bold uppercase tracking-tight"
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
                              isIncome ? "text-green-500" : "text-red-400"
                            }`}
                          >
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(t.amount)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-20 text-center">
                        <p style={{ color: colors.textSecondary }}>
                          Nenhuma transação encontrada.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OpenFinance;
