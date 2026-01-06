import React, { useState } from "react";

const Dashboard = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
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

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("financialData");
    return saved ? JSON.parse(saved) : [];
  });

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

      // Não incluir o mês atual
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

    return Array.from(monthsMap.values()).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  };

  const openImportModal = () => {
    const availableMonths = getAvailableMonths();
    if (availableMonths.length > 0) {
      setSelectedImportMonth(availableMonths[0].key);
    }
    setIsImportModalOpen(true);
  };

  const importTransactions = () => {
    if (!selectedImportMonth) return;

    const [year, month] = selectedImportMonth.split("-").map(Number);

    const transactionsToImport = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === month && tDate.getFullYear() === year;
    });

    if (transactionsToImport.length === 0) {
      alert("Nenhuma transação encontrada no mês selecionado.");
      return;
    }

    const importedTransactions = transactionsToImport.map((t) => {
      const newDate = new Date(currentMonth);
      newDate.setDate(new Date(t.date).getDate());

      return {
        ...t,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: newDate.toISOString(),
        paid: false,
      };
    });

    const newTransactions = [...transactions, ...importedTransactions];
    saveData(newTransactions);
    setIsImportModalOpen(false);
    alert(`${importedTransactions.length} transações importadas com sucesso!`);
  };

  const openModal = () => {
    setEditingId(null);
    setFormData({
      type: "expense",
      title: "",
      value: "",
      category: "Alimentação",
      date: new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
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
    e.preventDefault();

    const transaction = {
      id:
        editingId || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: formData.type,
      title: formData.title,
      value: parseFloat(formData.value),
      category: formData.category,
      date: new Date(formData.date + "T12:00:00").toISOString(),
      paid: formData.type === "income",
    };

    let newTransactions;
    if (editingId) {
      newTransactions = transactions.map((t) =>
        t.id === editingId ? transaction : t
      );
    } else {
      newTransactions = [...transactions, transaction];
    }

    saveData(newTransactions);
    setIsModalOpen(false);
  };

  const deleteTransaction = (id) => {
    if (window.confirm("Deseja realmente excluir esta transação?")) {
      const newTransactions = transactions.filter((t) => t.id !== id);
      saveData(newTransactions);
    }
  };

  const togglePaid = (id) => {
    const newTransactions = transactions.map((t) =>
      t.id === id ? { ...t, paid: !t.paid } : t
    );
    saveData(newTransactions);
  };

  const sortedTransactions = [...monthTransactions].sort((a, b) => {
    if (a.category === "Salário" && b.category !== "Salário") return -1;
    if (a.category !== "Salário" && b.category === "Salário") return 1;
    if (a.type === "income" && b.type === "expense") return -1;
    if (a.type === "expense" && b.type === "income") return 1;
    return 0;
  });

  const availableMonths = getAvailableMonths();

  return (
    <div className="ml-[260px] flex-1 bg-[#0f1419] p-10">
      <div className="flex justify-between items-center mb-9">
        <div>
          <h2 className="text-[28px] font-bold text-white mb-1.5">Dashboard</h2>
          <div className="text-[#8b92a7] text-sm">
            Gestão de receitas e despesas
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] mb-8 py-4 px-6 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
        <button
          onClick={() => changeMonth(-1)}
          className="bg-[#252b3b] text-white border border-[#2a2f3e] text-[#8b92a7] rounded-lg cursor-pointer px-4 py-2.5 text-sm font-semibold transition-all hover:bg-[#2d3548] hover:border-[#5b8def] hover:text-[#5b8def]"
        >
          ← Anterior
        </button>
        <span className="text-lg font-bold text-white">{getMonthName()}</span>
        <button
          onClick={() => changeMonth(1)}
          className="bg-[#252b3b] text-white border border-[#2a2f3e] text-[#8b92a7] rounded-lg cursor-pointer px-4 py-2.5 text-sm font-semibold transition-all hover:bg-[#2d3548] hover:border-[#5b8def] hover:text-[#5b8def]"
        >
          Próximo →
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-9">
        <div className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] border-l-4 border-l-[#27ae60] p-7 shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-1">
          <h3 className="flex items-center gap-2 text-xs font-bold text-[#8b92a7] uppercase tracking-wide mb-3.5">
            <div className="w-7 h-7 rounded bg-[rgba(39,174,96,0.2)] text-[#27ae60] flex items-center justify-center text-sm">
              ↑
            </div>
            Entradas
          </h3>
          <div className="text-[32px] font-bold text-[#27ae60] mb-2">
            R$ {formatCurrency(totalIncome)}
          </div>
        </div>

        <div className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] border-l-4 border-l-[#e74c3c] p-7 shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-1">
          <h3 className="flex items-center gap-2 text-xs font-bold text-[#8b92a7] uppercase tracking-wide mb-3.5">
            <div className="w-7 h-7 rounded bg-[rgba(231,76,60,0.2)] text-[#e74c3c] flex items-center justify-center text-sm">
              ↓
            </div>
            Saídas
          </h3>
          <div className="text-[32px] font-bold text-[#e74c3c] mb-2">
            R$ {formatCurrency(totalExpense)}
          </div>
        </div>

        <div className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] border-l-4 border-l-[#5b8def] p-7 shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-1">
          <h3 className="flex items-center gap-2 text-xs font-bold text-[#8b92a7] uppercase tracking-wide mb-3.5">
            <div className="w-7 h-7 rounded bg-[rgba(91,141,239,0.2)] text-[#5b8def] flex items-center justify-center text-sm font-bold">
              ≈
            </div>
            Saldo Previsto
          </h3>
          <div className="text-[32px] font-bold text-[#5b8def] mb-2">
            R$ {formatCurrency(balance)}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white">Transações do Mês</h3>
        <div className="flex gap-3">
          {availableMonths.length > 0 && (
            <button
              onClick={openImportModal}
              className="px-6 py-3 bg-[#f39c12] text-white text-sm font-bold rounded-lg shadow-[0_4px_12px_rgba(243,156,18,0.3)] transition-all hover:bg-[#e67e22] hover:-translate-y-0.5"
            >
              📋 Importar Transações
            </button>
          )}
          <button
            onClick={openModal}
            className="px-6 py-3 bg-[#5b8def] text-white text-sm font-bold rounded-lg shadow-[0_4px_12px_rgba(91,141,239,0.3)] transition-all hover:bg-[#4a7dd9] hover:-translate-y-0.5"
          >
            + Nova Transação
          </button>
        </div>
      </div>

      <div className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.3)] max-h-[600px] overflow-y-auto transactions-list">
        {sortedTransactions.length === 0 ? (
          <div className="text-center text-[#8b92a7] rounded-lg py-15 px-5 text-[16px]">
            Nenhuma transação registrada neste mês
          </div>
        ) : (
          sortedTransactions.map((t) => (
            <div
              key={t.id}
              className={`flex transactions-list justify-between items-center rounded-lg p-4 mb-3 transition-all hover:border-[#5b8def] hover:translate-x-1 ${
                t.paid
                  ? "bg-[#1e2738] border border-[#2a2f3e]"
                  : "bg-[rgba(243,156,18,0.1)] border border-[#f39c12] border-l-[3px]"
              }`}
            >
              <div className="flex-1">
                <div className="font-bold text-white text-[15px] mb-1.5">
                  {t.title}
                </div>
                <div className="text-[13px] text-[#8b92a7] flex items-center">
                  <span className="inline-block rounded px-2.5 py-1 text-xs text-[#5b8def] font-bold bg-[rgba(91,141,239,0.2)] mr-2">
                    {t.category}
                  </span>
                  <span>{new Date(t.date).toLocaleDateString("pt-BR")}</span>
                  <span> • {t.paid ? "Pago" : "Pendente"}</span>
                </div>
              </div>

              <div
                className={`text-lg font-bold text-right mx-5 min-w-[120px] ${
                  t.type === "income" ? "text-[#27ae60]" : "text-[#e74c3c]"
                }`}
              >
                {t.type === "income" ? "+" : "-"} R$ {formatCurrency(t.value)}
              </div>

              <div className="flex gap-1.5">
                {!t.paid ? (
                  <button
                    onClick={() => togglePaid(t.id)}
                    className="px-3 py-2 bg-[#27ae60] text-white text-[13px] rounded-lg shadow-[0_2px_8px_rgba(39,174,96,0.3)] transition-all hover:bg-[#229954] hover:-translate-y-0.5"
                    title="Marcar como pago"
                  >
                    ✓
                  </button>
                ) : (
                  <button
                    onClick={() => togglePaid(t.id)}
                    className="px-3 py-2 bg-[#f39c12] text-white text-[13px] font-bold rounded-lg shadow-[0_2px_8px_rgba(243,156,18,0.3)] transition-all hover:bg-[#e67e22] hover:-translate-y-0.5"
                    title="Desmarcar como pago"
                  >
                    ↺
                  </button>
                )}
                <button
                  onClick={() => editTransaction(t.id)}
                  className="px-3 py-2 bg-[#5a6c7d] text-white text-[13px] font-bold rounded-lg shadow-[0_2px_8px_rgba(90,108,125,0.3)] transition-all hover:bg-[#4a5c6d] hover:-translate-y-0.5"
                  title="Editar"
                >
                  ✎
                </button>
                <button
                  onClick={() => deleteTransaction(t.id)}
                  className="px-3 py-2 bg-[#e74c3c] text-white text-[13px] font-bold rounded-lg shadow-[0_2px_8px_rgba(231,76,60,0.3)] transition-all hover:bg-[#c0392b] hover:-translate-y-0.5"
                  title="Excluir"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-[#1a1f2e] rounded-2xl border border-[#2a2f3e] p-8 w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingId ? "Editar Transação" : "Nova Transação"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#8b92a7] mb-2">
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#252b3b] border border-[#2a2f3e] rounded-lg text-white outline-none focus:border-[#5b8def] transition-all"
                >
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#8b92a7] mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#252b3b] border border-[#2a2f3e] rounded-lg text-white outline-none focus:border-[#5b8def] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#8b92a7] mb-2">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#252b3b] border border-[#2a2f3e] rounded-lg text-white outline-none focus:border-[#5b8def] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#8b92a7] mb-2">
                  Categoria
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#252b3b] border border-[#2a2f3e] rounded-lg text-white outline-none focus:border-[#5b8def] transition-all"
                >
                  <option value="Alimentação">Alimentação</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Moradia">Moradia</option>
                  <option value="Saúde">Saúde</option>
                  <option value="Educação">Educação</option>
                  <option value="Lazer">Lazer</option>
                  <option value="Compras">Compras</option>
                  <option value="GastosGerais">Gastos Gerais</option>
                  <option value="Salário">Salário</option>
                  <option value="Investimentos">Investimentos</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#8b92a7] mb-2">
                  Data
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#252b3b] border border-[#2a2f3e] rounded-lg text-white outline-none focus:border-[#5b8def] transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-[#5a6c7d] text-white text-sm font-bold rounded-lg transition-all hover:bg-[#4a5c6d]"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveTransaction}
                  className="flex-1 px-6 py-3 bg-[#5b8def] text-white text-sm font-bold rounded-lg shadow-[0_4px_12px_rgba(91,141,239,0.3)] transition-all hover:bg-[#4a7dd9]"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isImportModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setIsImportModalOpen(false)}
        >
          <div
            className="bg-[#1a1f2e] rounded-2xl border border-[#2a2f3e] p-8 w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              📋 Importar Transações
            </h2>
            <p className="text-[#8b92a7] text-sm mb-6">
              Selecione um mês para copiar todas as transações para{" "}
              <strong className="text-white">{getMonthName()}</strong>
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#8b92a7] mb-2">
                Importar de:
              </label>
              <select
                value={selectedImportMonth}
                onChange={(e) => setSelectedImportMonth(e.target.value)}
                className="w-full px-4 py-3 bg-[#252b3b] border border-[#2a2f3e] rounded-lg text-white outline-none focus:border-[#5b8def] transition-all"
              >
                {availableMonths.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-[#252b3b] border border-[#2a2f3e] rounded-lg p-4 mb-6">
              <p className="text-[#8b92a7] text-xs">
                ℹ️ <strong className="text-white">Importante:</strong> As
                transações serão copiadas com as mesmas datas (dia), mas no mês
                atual. Todas serão marcadas como{" "}
                <strong className="text-[#f39c12]">não pagas</strong>.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="flex-1 px-6 py-3 bg-[#5a6c7d] text-white text-sm font-bold rounded-lg transition-all hover:bg-[#4a5c6d]"
              >
                Cancelar
              </button>
              <button
                onClick={importTransactions}
                className="flex-1 px-6 py-3 bg-[#f39c12] text-white text-sm font-bold rounded-lg shadow-[0_4px_12px_rgba(243,156,18,0.3)] transition-all hover:bg-[#e67e22]"
              >
                Importar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
