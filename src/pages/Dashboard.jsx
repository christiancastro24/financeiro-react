import { useState, useEffect } from "react";

const Dashboard = () => {
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
    accent: "#5b8def",
  };

  // --- ESTADOS EXISTENTES ---
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedImportMonth, setSelectedImportMonth] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Estado para categorias (agora dinâmico)
  const [availableCategories, setAvailableCategories] = useState([]);

  const [formData, setFormData] = useState({
    type: "expense",
    title: "",
    value: "",
    category: "Alimentação",
    date: new Date().toISOString().split("T")[0],
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("financialData");
    return saved ? JSON.parse(saved) : [];
  });

  // Carregar categorias do localStorage
  useEffect(() => {
    const loadCategories = () => {
      const savedCategories = localStorage.getItem("financeapp_categories");
      const defaultCategories = [
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
      ];

      if (savedCategories) {
        const customCategories = JSON.parse(savedCategories);
        const customNames = customCategories.map((cat) => cat.name);
        setAvailableCategories([...defaultCategories, ...customNames]);
      } else {
        setAvailableCategories(defaultCategories);
      }
    };

    loadCategories();

    // Listen for changes in categories
    const handleStorageChange = (e) => {
      if (e.key === "financeapp_categories") {
        loadCategories();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Atualizar categoria inicial quando as categorias são carregadas
  useEffect(() => {
    if (
      availableCategories.length > 0 &&
      !availableCategories.includes(formData.category)
    ) {
      setFormData((prev) => ({
        ...prev,
        category: availableCategories[0],
      }));
    }
  }, [availableCategories]);

  const saveData = (newTransactions) => {
    localStorage.setItem("financialData", JSON.stringify(newTransactions));
    setTransactions(newTransactions);
  };

  const formatCurrency = (value) => {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // --- LÓGICA DE NOTIFICAÇÕES (MANTIDA) ---
  const sendWhatsAppNotification = async (dueTransactions) => {
    const TWILIO_ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
    const TWILIO_WHATSAPP_NUMBER = import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return;

    let message =
      "🔔 Lembrete de Contas 🔔\n\nAs seguintes contas vencem amanhã:\n\n";
    dueTransactions.forEach((t, index) => {
      message += `${index + 1}. ${t.title}\n💰 R$ ${formatCurrency(
        t.value
      )}\n📅 ${new Date(t.date).toLocaleDateString("pt-BR")}\n\n`;
    });

    const whatsappNumber = localStorage.getItem("financeapp_whatsapp");
    try {
      await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization:
              "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
          },
          body: new URLSearchParams({
            From: TWILIO_WHATSAPP_NUMBER,
            To: "whatsapp:+" + whatsappNumber,
            Body: message,
          }),
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const notificationsEnabled =
      localStorage.getItem("financeapp_notifications") === "true";
    const whatsappNumber = localStorage.getItem("financeapp_whatsapp");
    if (!notificationsEnabled || !whatsappNumber) return;

    const checkDueTransactions = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dueSoon = transactions.filter((t) => {
        if (t.paid || t.type !== "expense") return false;
        const dueDate = new Date(t.date);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === tomorrow.getTime();
      });

      if (dueSoon.length > 0) {
        const lastCheck = localStorage.getItem(
          "financeapp_last_notification_check"
        );
        if (lastCheck !== today.toDateString()) {
          sendWhatsAppNotification(dueSoon);
          localStorage.setItem(
            "financeapp_last_notification_check",
            today.toDateString()
          );
        }
      }
    };
    checkDueTransactions();
  }, [transactions]);

  // --- LÓGICA DE TRANSAÇÕES ---
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
    .reduce((sum, t) => sum + t.value, 0);
  const totalExpense = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.value, 0);
  const balance = totalIncome - totalExpense;

  const changeMonth = (delta) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentMonth(newDate);
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

  const openModal = () => {
    setEditingId(null);
    setFormData({
      type: "expense",
      title: "",
      value: "",
      category:
        availableCategories.length > 0 ? availableCategories[0] : "Alimentação",
      date: new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
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

  const saveTransaction = (e) => {
    if (e && e.preventDefault) e.preventDefault();
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
    saveData(newTransactions);
    setIsModalOpen(false);
  };

  const togglePaid = (id) => {
    saveData(
      transactions.map((t) => (t.id === id ? { ...t, paid: !t.paid } : t))
    );
  };

  const sortedTransactions = [...monthTransactions].sort((a, b) => {
    if (a.category === "Salário") return -1;
    if (b.category === "Salário") return 1;
    return a.type === "income" ? -1 : 1;
  });

  const availableMonths = getAvailableMonths();
  const notificationsEnabled =
    localStorage.getItem("financeapp_notifications") === "true";

  return (
    <div
      className="ml-[260px] flex-1 p-10 transition-colors duration-300 min-h-screen"
      style={{ backgroundColor: colors.primary }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2
            className="text-xl font-bold mb-1"
            style={{ color: colors.textPrimary }}
          >
            Dashboard
          </h2>
          <div
            className="text-xs flex items-center gap-2"
            style={{ color: colors.textSecondary }}
          >
            Gestão de receitas e despesas
            {notificationsEnabled && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#25D366]/20 text-[#25D366] text-[10px] rounded-full font-bold">
                <span>🔔</span> Alertas ativos
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navegação de Mês */}
      <div
        className="flex items-center justify-between rounded-lg border mb-5 py-2.5 px-4 shadow transition-colors duration-300"
        style={{
          backgroundColor: colors.secondary,
          borderColor: colors.border,
        }}
      >
        <button
          onClick={() => changeMonth(-1)}
          className="rounded-lg cursor-pointer px-3 py-1.5 text-xs font-semibold transition-all hover:border-[#5b8def] hover:text-[#5b8def] border"
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
          className="rounded-lg cursor-pointer px-3 py-1.5 text-xs font-semibold transition-all hover:border-[#5b8def] hover:text-[#5b8def] border"
          style={{
            backgroundColor: colors.tertiary,
            borderColor: colors.border,
            color: colors.textSecondary,
          }}
        >
          Próximo →
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div
          className="rounded-lg border border-l-4 border-l-[#27ae60] p-4 shadow transition-all hover:-translate-y-1"
          style={{
            backgroundColor: colors.secondary,
            borderColor: colors.border,
          }}
        >
          <h3
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide mb-2"
            style={{ color: colors.textSecondary }}
          >
            <div className="w-5 h-5 rounded bg-[#27ae6020] text-[#27ae60] flex items-center justify-center text-xs">
              ↑
            </div>
            Entradas
          </h3>
          <div className="text-2xl font-bold text-[#27ae60] mb-1">
            R$ {formatCurrency(totalIncome)}
          </div>
        </div>

        <div
          className="rounded-lg border border-l-4 border-l-[#e74c3c] p-4 shadow transition-all hover:-translate-y-1"
          style={{
            backgroundColor: colors.secondary,
            borderColor: colors.border,
          }}
        >
          <h3
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide mb-2"
            style={{ color: colors.textSecondary }}
          >
            <div className="w-5 h-5 rounded bg-[#e74c3c20] text-[#e74c3c] flex items-center justify-center text-xs">
              ↓
            </div>
            Saídas
          </h3>
          <div className="text-2xl font-bold text-[#e74c3c] mb-1">
            R$ {formatCurrency(totalExpense)}
          </div>
        </div>

        <div
          className="rounded-lg border border-l-4 border-l-[#5b8def] p-4 shadow transition-all hover:-translate-y-1"
          style={{
            backgroundColor: colors.secondary,
            borderColor: colors.border,
          }}
        >
          <h3
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide mb-2"
            style={{ color: colors.textSecondary }}
          >
            <div className="w-5 h-5 rounded bg-[#5b8def20] text-[#5b8def] flex items-center justify-center text-xs">
              ≈
            </div>
            Saldo Previsto
          </h3>
          <div className="text-2xl font-bold text-[#5b8def] mb-1">
            R$ {formatCurrency(balance)}
          </div>
        </div>
      </div>

      {/* Header da Lista */}
      <div className="flex justify-between items-center mb-4">
        <h3
          className="text-base font-bold"
          style={{ color: colors.textPrimary }}
        >
          Transações do Mês
        </h3>
        <div className="flex gap-2">
          {availableMonths.length > 0 && (
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2 bg-[#f39c12] text-white text-xs font-bold rounded-lg shadow transition-all hover:opacity-90"
            >
              📋 Importar
            </button>
          )}
          <button
            onClick={openModal}
            className="px-4 py-2 bg-[#5b8def] text-white text-xs font-bold rounded-lg shadow transition-all hover:bg-[#4a7dd9]"
          >
            + Nova Transação
          </button>
        </div>
      </div>

      {/* Lista de Transações */}
      <div
        className="rounded-lg border p-4 shadow max-h-[600px] overflow-y-auto transactions-list"
        style={{
          backgroundColor: colors.secondary,
          borderColor: colors.border,
        }}
      >
        {sortedTransactions.length === 0 ? (
          <div
            className="text-center py-10 px-5 text-sm"
            style={{ color: colors.textSecondary }}
          >
            Nenhuma transação registrada neste mês
          </div>
        ) : (
          sortedTransactions.map((t) => (
            <div
              key={t.id}
              className={`flex transactions-list justify-between items-center rounded-lg p-3 mb-2 transition-all border ${
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
                  <span className="inline-block rounded px-2 py-0.5 text-[10px] font-bold bg-[#5b8def20] text-[#5b8def] mr-2">
                    {t.category}
                  </span>
                  <span>{new Date(t.date).toLocaleDateString("pt-BR")}</span>
                  <span> • {t.paid ? "Pago" : "Pendente"}</span>
                </div>
              </div>

              <div
                className={`text-base font-bold text-right mx-4 min-w-[100px] ${
                  t.type === "income" ? "text-[#27ae60]" : "text-[#e74c3c]"
                }`}
              >
                {t.type === "income" ? "+" : "-"} R$ {formatCurrency(t.value)}
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => togglePaid(t.id)}
                  className={`px-2.5 py-1.5 text-white text-xs rounded-lg shadow transition-all ${
                    t.paid ? "bg-[#f39c12]" : "bg-[#27ae60]"
                  }`}
                >
                  {t.paid ? "↺" : "✓"}
                </button>
                <button
                  onClick={() => editTransaction(t.id)}
                  className="px-2.5 py-1.5 bg-[#5a6c7d] text-white text-xs rounded-lg shadow transition-all"
                >
                  ✎
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Excluir?"))
                      saveData(transactions.filter((i) => i.id !== t.id));
                  }}
                  className="px-2.5 py-1.5 bg-[#e74c3c] text-white text-xs rounded-lg shadow transition-all"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Genérico */}
      {(isModalOpen || isImportModalOpen) && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => {
            setIsModalOpen(false);
            setIsImportModalOpen(false);
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
            {isModalOpen ? (
              <>
                <h2
                  className="text-xl font-bold mb-4"
                  style={{ color: colors.textPrimary }}
                >
                  {editingId ? "Editar" : "Nova Transação"}
                </h2>
                <form onSubmit={saveTransaction} className="space-y-4">
                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: colors.textSecondary }}
                    >
                      Tipo
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg outline-none border transition-all text-sm"
                      style={{
                        backgroundColor: colors.tertiary,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                      }}
                    >
                      <option value="expense">Despesa</option>
                      <option value="income">Receita</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: colors.textSecondary }}
                    >
                      Título
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Almoço fora"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg outline-none border transition-all text-sm"
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
                      className="block text-xs font-semibold mb-1.5"
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
                      className="w-full px-3 py-2 rounded-lg outline-none border transition-all text-sm"
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
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: colors.textSecondary }}
                    >
                      Categoria
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg outline-none border transition-all text-sm"
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
                      className="block text-xs font-semibold mb-1.5"
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
                      className="w-full px-3 py-2 rounded-lg outline-none border transition-all text-sm"
                      style={{
                        backgroundColor: colors.tertiary,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                      }}
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-4 py-2 bg-[#5a6c7d] text-white rounded-lg font-bold text-sm hover:bg-[#4a5c6d] transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-[#5b8def] text-white rounded-lg font-bold shadow hover:bg-[#4a7dd9] transition-all text-sm"
                    >
                      Salvar
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2
                  className="text-xl font-bold mb-4"
                  style={{ color: colors.textPrimary }}
                >
                  📋 Importar
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
                        const [y, m] = selectedImportMonth
                          .split("-")
                          .map(Number);
                        const toImport = transactions.filter((t) => {
                          const d = new Date(t.date);
                          return d.getMonth() === m && d.getFullYear() === y;
                        });

                        if (toImport.length === 0) {
                          alert(
                            "Nenhuma transação encontrada no mês selecionado!"
                          );
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
                        saveData([...transactions, ...imported]);
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
