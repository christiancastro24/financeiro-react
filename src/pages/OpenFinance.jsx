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

  const PLUGGY_CLIENT_ID = import.meta.env.VITE_PLUGGY_CLIENT_ID;
  const PLUGGY_CLIENT_SECRET = import.meta.env.VITE_PLUGGY_CLIENT_SECRET;

  useEffect(() => {
    loadSavedSession();
  }, []);

  const loadSavedSession = () => {
    try {
      const savedData = localStorage.getItem("openfinance-session");
      if (savedData) {
        const session = JSON.parse(savedData);
        console.log("📂 Sessão carregada:", session);
        setConnected(session.connected);
        setAccounts(session.accounts || []);
        setTransactions(session.transactions || []);
        setLastSync(session.lastSync ? new Date(session.lastSync) : null);
        setItemId(session.itemId);
        setApiKey(session.apiKey);
      }
    } catch (err) {
      console.log("⚠️ Nenhuma sessão salva encontrada:", err);
    }
  };

  const saveSession = (data) => {
    try {
      localStorage.setItem("openfinance-session", JSON.stringify(data));
      console.log("💾 Sessão salva com sucesso");
    } catch (err) {
      console.error("❌ Erro ao salvar sessão:", err);
    }
  };

  const clearSession = () => {
    try {
      localStorage.removeItem("openfinance-session");
      console.log("🗑️ Sessão limpa");
    } catch (err) {
      console.error("❌ Erro ao limpar sessão:", err);
    }
  };

  const getPluggyApiKey = async () => {
    console.log("🔐 Obtendo API Key...");
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
    console.log("✅ API Key obtida com sucesso");
    return data.apiKey;
  };

  const createConnectToken = async (apiKey) => {
    console.log("🎫 Criando connect token...");
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
    console.log("✅ Connect token criado com sucesso");
    return data.accessToken;
  };

  const loadFinanceData = async (apiKey, itemId) => {
    setSyncing(true);
    setError(null);
    try {
      console.log(`🔄 Carregando dados para item: ${itemId}`);
      console.log("📊 Buscando contas...");

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
        const errorText = await resAccounts.text();
        console.error(
          `❌ Erro ao buscar contas: ${resAccounts.status}`,
          errorText
        );
        throw new Error(`Erro contas: ${resAccounts.status}`);
      }

      const dataAccounts = await resAccounts.json();
      console.log(`✅ Contas encontradas:`, dataAccounts.results?.length || 0);
      console.log("📋 Detalhes das contas:", dataAccounts.results);

      if (dataAccounts.results && dataAccounts.results.length > 0) {
        setAccounts(dataAccounts.results);

        console.log("💳 Iniciando busca de transações...");
        const txPromises = dataAccounts.results.map(async (acc, index) => {
          try {
            const url = `https://api.pluggy.ai/transactions?accountId=${acc.id}`;
            console.log(
              `  📥 [Conta ${index + 1}/${
                dataAccounts.results.length
              }] Buscando transações para: ${acc.name || acc.type} (ID: ${
                acc.id
              })`
            );

            const response = await fetch(url, {
              headers: {
                "X-API-KEY": apiKey,
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
                Pragma: "no-cache",
              },
              cache: "no-store",
            });

            console.log(`  📡 Status da resposta: ${response.status}`);

            if (!response.ok) {
              const errorText = await response.text();
              console.error(
                `  ❌ Erro na conta ${acc.id}: ${response.status}`,
                errorText
              );
              return [];
            }

            const data = await response.json();
            console.log(
              `  ✅ Transações recebidas: ${data.results?.length || 0}`
            );

            if (data.results && data.results.length > 0) {
              console.log(
                `  📝 Exemplo da primeira transação:`,
                data.results[0]
              );
            } else {
              console.log(`  ⚠️ Array vazio retornado para a conta ${acc.id}`);
            }

            return (data.results || []).map((tx) => ({
              ...tx,
              accountType: acc.type,
              accountName: acc.name || acc.type,
              accountId: acc.id,
            }));
          } catch (err) {
            console.error(
              `  ❌ Exceção ao buscar transações da conta ${acc.id}:`,
              err
            );
            return [];
          }
        });

        const allResults = await Promise.all(txPromises);
        const allTx = allResults
          .flat()
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        console.log(`🎯 Total de transações encontradas: ${allTx.length}`);

        if (allTx.length === 0) {
          console.warn("⚠️ ATENÇÃO: Nenhuma transação foi encontrada!");
        }

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
      } else {
        console.warn("⚠️ Nenhuma conta encontrada");
      }
    } catch (err) {
      console.error("❌ Erro na sincronização:", err);
      setError(`Erro: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const connectPluggy = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("🚀 Iniciando autenticação...");

      const apiKey = await getPluggyApiKey();
      const token = await createConnectToken(apiKey);

      const pluggyConnect = new window.PluggyConnect({
        connectToken: token,
        includeSandbox: true,
        onSuccess: (data) => {
          console.log("🎉 Conexão bem-sucedida:", data);
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
          console.error("❌ Erro no widget:", err);
          setError(`Erro no widget: ${err.message || "Falha na conexão"}`);
          setLoading(false);
        },
        onClose: () => {
          console.log("🚪 Widget fechado");
          setLoading(false);
        },
      });

      pluggyConnect.init();
    } catch (err) {
      console.error("❌ Erro na conexão:", err);
      setError(`Falha na conexão: ${err.message}`);
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    if (!apiKey || !itemId) {
      setError("API Key ou Item ID não encontrados. Reconecte sua conta.");
      return;
    }

    console.log("🔄 Solicitando atualização manual...");
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
      console.error("❌ Erro ao solicitar atualização:", e);
      setSyncing(false);
    }
  };

  // SEPARAÇÃO PF E PJ - baseado em subtype e quantidade
  const hasMultipleAccounts = accounts.length > 1;

  let pfAccounts = [];
  let pjAccounts = [];

  if (hasMultipleAccounts) {
    // PJ = contas com "company", "empresa" no nome OU CNPJ (taxNumber > 11)
    pjAccounts = accounts.filter((a) => {
      const name = a.name?.toLowerCase() || "";
      const tax = a.taxNumber?.replace(/\D/g, "") || "";
      return (
        name.includes("company") || name.includes("empresa") || tax.length > 11
      );
    });

    // PF = o que sobrou
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
    // Se houver apenas 1 conta, usa como PF
    pfAccounts = accounts;
    pjAccounts = [];
  }

  console.log(accounts, "ACCOUNTS");

  // --- AQUI ESTÁ O PULO DO GATO ---
  // Buscamos dentro dos grupos PF/PJ garantindo o TYPE para não inverter saldo com fatura

  // 1. Saldo (Somente BANK)
  const pfBankAccount = pfAccounts.find((a) => a.type === "BANK");
  const pjBankAccount = pjAccounts.find((a) => a.type === "BANK");

  // 2. Cartão (Somente CREDIT)
  const pfCreditAccount = pfAccounts.find((a) => a.type === "CREDIT");
  const pjCreditAccount = pjAccounts.find((a) => a.type === "CREDIT");

  // 3. Atribuição de valores
  const pfBankBalance = pfBankAccount?.balance || 0;
  const pjBankBalance = pjBankAccount?.balance || 0;

  const pfCreditBalance = pfCreditAccount?.balance || 0; // Valor da fatura
  const pjCreditBalance = pjCreditAccount?.balance || 0; // Valor da fatura

  const pfCreditLimit = pfCreditAccount?.creditData?.availableCreditLimit || 0;
  const pjCreditLimit = pjCreditAccount?.creditData?.availableCreditLimit || 0;

  // Filtrar transações por conta
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
    (t) => t.accountType === "CREDIT"
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

  const groupCreditByInvoice = () => {
    const grouped = {};

    const creditExpenses = creditTransactions.filter((t) => {
      const desc = t.description?.toLowerCase() || "";
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

  // Limitar faturas de crédito a 15 transações cada
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
              Total: {filteredByAccount.length} transações
            </div>
          </div>

          {/* Filtro de Conta - só aparece se tiver múltiplas contas */}
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

          {/* Abas de Tipo */}
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
              {filteredByAccount.length > 30 ? "30" : filteredByAccount.length})
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
              {debitTransactions.length > 15 ? "15" : debitTransactions.length})
            </button>
          </div>
        </div>

        <div className="max-h-[500px] overflow-y-auto transactions-list">
          {activeTab === "credit" ? (
            <div className="divide-y" style={{ border: colors.border }}>
              {limitedCreditInvoices.length > 0 ? (
                limitedCreditInvoices.map(([key, invoice]) => (
                  <div key={key} style={{ border: "none" }}>
                    <button
                      onClick={() => toggleInvoice(key)}
                      className="w-full p-6 flex items-center justify-between transition-colors group hover:bg-opacity-50 border"
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
                                  border: colors.border,
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
                ))
              ) : (
                <div
                  className="p-20 text-center text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Nenhuma fatura encontrada.
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
  );
};

export default OpenFinance;
