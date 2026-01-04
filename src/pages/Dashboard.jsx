import React, { useState } from "react";

const Dashboard = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      id: editingId || Date.now().toString(),
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

  return (
    <div
      className="ml-[260px] flex-1 bg-[#0f1419]"
      style={{ padding: "40px 50px" }}
    >
      <div
        className="flex justify-between items-center"
        style={{ marginBottom: "35px" }}
      >
        <div>
          <h2
            className="text-[28px] font-bold text-white"
            style={{ marginBottom: "6px", fontWeight: "bold" }}
          >
            Dashboard
          </h2>
          <div className="text-[#8b92a7] text-[14px]">
            Gestão de receitas e despesas
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-between bg-[#1a1f2e] rounded-xl border border-[#2a2f3e]"
        style={{
          marginBottom: "30px",
          padding: "18px 24px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          borderRadius: "0.5rem",
        }}
      >
        <button
          onClick={() => changeMonth(-1)}
          className="bg-[#252b3b] border border-[#2a2f3e] text-[#8b92a7] rounded-lg cursor-pointer hover:bg-[#2d3548] hover:border-[#5b8def] hover:text-[#5b8def]"
          style={{
            padding: "10px 18px",
            fontSize: "14px",
            fontWeight: 600,
            transition: "all 0.2s ease",
            borderRadius: "0.5rem",
          }}
        >
          ← Anterior
        </button>
        <span
          className="text-[18px] font-bold text-white"
          style={{ fontWeight: "bold" }}
        >
          {getMonthName()}
        </span>
        <button
          onClick={() => changeMonth(1)}
          className="bg-[#252b3b] border border-[#2a2f3e] text-[#8b92a7] rounded-lg cursor-pointer hover:bg-[#2d3548] hover:border-[#5b8def] hover:text-[#5b8def]"
          style={{
            padding: "10px 18px",
            fontSize: "14px",
            fontWeight: 600,
            transition: "all 0.2s ease",
            borderRadius: "0.5rem",
          }}
        >
          Próximo →
        </button>
      </div>

      <div
        className="grid grid-cols-3 border border-[#2a2f3e]"
        style={{
          gap: "24px",
          marginBottom: "35px",
        }}
      >
        <div
          className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] hover:transform hover:-translate-y-1 border-l-4 border-l-[#27ae60]"
          style={{
            padding: "28px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            transition: "all 0.2s ease",
            borderRadius: "0.5rem",
          }}
        >
          <h3
            className="flex items-center text-[12px] font-bold text-[#8b92a7] uppercase"
            style={{
              letterSpacing: "0.5px",
              marginBottom: "14px",
              gap: "8px",
              fontWeight: "bold",
            }}
          >
            <div
              className="w-7 h-7 rounded flex items-center justify-center text-[14px]"
              style={{
                background: "rgba(39, 174, 96, 0.2)",
                color: "#27ae60",
                borderRadius: "0.5rem",
              }}
            >
              ↑
            </div>
            Entradas
          </h3>
          <div
            className="text-[32px] font-bold text-[#27ae60]"
            style={{ marginBottom: "8px", fontWeight: "bold" }}
          >
            R$ {formatCurrency(totalIncome)}
          </div>
        </div>

        <div
          className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] hover:transform hover:-translate-y-1 border-l-4 border-l-[#e74c3c]"
          style={{
            padding: "28px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            transition: "all 0.2s ease",
            borderRadius: "0.5rem",
          }}
        >
          <h3
            className="flex items-center text-[12px] font-bold text-[#8b92a7] uppercase"
            style={{
              letterSpacing: "0.5px",
              marginBottom: "14px",
              gap: "8px",
              fontWeight: "bold",
            }}
          >
            <div
              className="w-7 h-7 rounded flex items-center justify-center text-[14px]"
              style={{
                background: "rgba(231, 76, 60, 0.2)",
                color: "#e74c3c",
                borderRadius: "0.5rem",
              }}
            >
              ↓
            </div>
            Saídas
          </h3>
          <div
            className="text-[32px] font-bold text-[#e74c3c]"
            style={{ marginBottom: "8px", fontWeight: "bold" }}
          >
            R$ {formatCurrency(totalExpense)}
          </div>
        </div>

        <div
          className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] hover:transform hover:-translate-y-1 border-l-4 border-l-[#5b8def]"
          style={{
            padding: "28px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            transition: "all 0.2s ease",
          }}
        >
          <h3
            className="flex items-center text-[12px] font-bold text-[#8b92a7] uppercase"
            style={{
              letterSpacing: "0.5px",
              marginBottom: "14px",
              gap: "8px",
              fontWeight: "bold",
            }}
          >
            <div
              className="w-7 h-7 rounded flex items-center justify-center text-[14px] font-bold"
              style={{
                background: "rgba(91, 141, 239, 0.2)",
                color: "#5b8def",
                fontWeight: "bold",
                borderRadius: "0.5rem",
              }}
            >
              ≈
            </div>
            Saldo Previsto
          </h3>
          <div
            className="text-[32px] font-bold text-[#5b8def]"
            style={{ marginBottom: "8px", fontWeight: "bold" }}
          >
            R$ {formatCurrency(balance)}
          </div>
        </div>
      </div>

      <div
        className="flex justify-between items-center"
        style={{ marginBottom: "24px" }}
      >
        <h3
          className="text-[18px] font-bold text-white"
          style={{ fontWeight: "bold" }}
        >
          Transações do Mês
        </h3>
        <button
          onClick={openModal}
          className="border-none rounded-lg cursor-pointer bg-[#5b8def] text-white hover:bg-[#4a7dd9] hover:transform hover:-translate-y-0.5"
          style={{
            padding: "12px 24px",
            fontSize: "14px",

            boxShadow: "0 4px 12px rgba(91, 141, 239, 0.3)",
            transition: "all 0.2s ease",
            borderRadius: "0.5rem",
            color: "white",
            fontWeight: "bold",
          }}
        >
          + Nova Transação
        </button>
      </div>

      <div
        className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] max-h-[600px] overflow-y-auto"
        style={{
          padding: "24px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          borderRadius: "0.5rem",
        }}
      >
        {sortedTransactions.length === 0 ? (
          <div
            className="text-center text-[#8b92a7] bg-[#1e2738] rounded-lg border border-[#2a2f3e]"
            style={{
              padding: "60px 20px",
              fontSize: "15px",
              borderRadius: "0.5rem",
            }}
          >
            Nenhuma transação registrada neste mês
          </div>
        ) : (
          sortedTransactions.map((t) => (
            <div
              key={t.id}
              className={`flex justify-between items-center border rounded-lg hover:border-[#5b8def] hover:transform hover:translate-x-1 ${
                t.paid
                  ? "bg-[#1e2738] border-[#2a2f3e]"
                  : "bg-[rgba(243,156,18,0.1)] border-[#f39c12] border-l-[3px]"
              }`}
              style={{
                padding: "18px",
                marginBottom: "12px",
                boxShadow: t.paid ? "none" : undefined,
                transition: "all 0.2s ease",
                borderRadius: "0.5rem",
              }}
            >
              <div className="flex-1">
                <div
                  className="font-bold text-white text-[15px]"
                  style={{ marginBottom: "6px", fontWeight: "bold" }}
                >
                  {t.title}
                </div>
                <div className="text-[13px] text-[#8b92a7] flex items-center">
                  <span
                    className="inline-block rounded text-[12px] text-[#5b8def] font-bold"
                    style={{
                      padding: "4px 10px",
                      background: "rgba(91, 141, 239, 0.2)",
                      marginRight: "8px",
                      borderRadius: "0.5rem",
                      fontWeight: "bold",
                    }}
                  >
                    {t.category}
                  </span>
                  <span>{new Date(t.date).toLocaleDateString("pt-BR")}</span>
                  <span> • {t.paid ? "Pago" : "Pendente"}</span>
                </div>
              </div>

              <div
                className={`text-[18px] font-bold text-right ${
                  t.type === "income" ? "text-[#27ae60]" : "text-[#e74c3c]"
                }`}
                style={{
                  margin: "0 20px",
                  minWidth: "120px",
                  fontWeight: "bold",
                }}
              >
                {t.type === "income" ? "+" : "-"} R$ {formatCurrency(t.value)}
              </div>

              <div className="flex" style={{ gap: "6px" }}>
                {!t.paid ? (
                  <button
                    onClick={() => togglePaid(t.id)}
                    className="border-none rounded-lg cursor-pointer bg-[#27ae60] text-white text-[13px] hover:bg-[#229954] hover:transform hover:-translate-y-0.5"
                    style={{
                      padding: "8px 12px",
                      boxShadow: "0 2px 8px rgba(39, 174, 96, 0.3)",
                      transition: "all 0.2s ease",
                      borderRadius: "0.5rem",
                    }}
                    title="Marcar como pago"
                  >
                    ✓
                  </button>
                ) : (
                  <button
                    onClick={() => togglePaid(t.id)}
                    className="border-none cursor-pointer bg-[#f39c12] text-white text-[13px] hover:bg-[#e67e22] hover:transform hover:-translate-y-0.5"
                    style={{
                      padding: "8px 12px",
                      boxShadow: "0 2px 8px rgba(243, 156, 18, 0.3)",
                      transition: "all 0.2s ease",
                      borderRadius: "0.5rem",
                      color: "white",
                      fontWeight: "bold",
                    }}
                    title="Desmarcar como pago"
                  >
                    ↺
                  </button>
                )}
                <button
                  onClick={() => editTransaction(t.id)}
                  className="border-none rounded-lg cursor-pointer bg-[#5a6c7d] text-white text-[13px] hover:bg-[#4a5c6d] hover:transform hover:-translate-y-0.5"
                  style={{
                    padding: "8px 12px",
                    boxShadow: "0 2px 8px rgba(90, 108, 125, 0.3)",
                    transition: "all 0.2s ease",
                    borderRadius: "0.5rem",
                    color: "white",
                    fontWeight: "bold",
                  }}
                  title="Editar"
                >
                  ✎
                </button>
                <button
                  onClick={() => deleteTransaction(t.id)}
                  className="border-none rounded-lg cursor-pointer bg-[#e74c3c] text-white text-[13px] hover:bg-[#c0392b] hover:transform hover:-translate-y-0.5"
                  style={{
                    padding: "8px 12px",
                    boxShadow: "0 2px 8px rgba(231, 76, 60, 0.3)",
                    transition: "all 0.2s ease",
                    borderRadius: "0.5rem",
                    color: "white",
                    fontWeight: "bold",
                  }}
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
          className={`modal ${isModalOpen ? "active" : ""}`}
          onClick={closeModal}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? "Editar Transação" : "Nova Transação"}</h2>

            <div>
              <div className="form-group">
                <label>Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                </select>
              </div>

              <div className="form-group">
                <label>Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
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

              <div className="form-group">
                <label>Data</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>

              <div className="form-actions">
                <button
                  onClick={closeModal}
                  className="border-none rounded-lg cursor-pointer bg-[#5a6c7d] text-white text-[14px] font-bold hover:bg-[#4a5c6d]"
                  style={{
                    padding: "12px 24px",
                    transition: "all 0.2s ease",
                    borderRadius: "0.5rem",
                    fontWeight: "bold",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={saveTransaction}
                  className="border-none rounded-lg cursor-pointer bg-[#5b8def] text-white text-[14px] font-bold hover:bg-[#4a7dd9]"
                  style={{
                    padding: "12px 24px",
                    boxShadow: "0 4px 12px rgba(91, 141, 239, 0.3)",
                    transition: "all 0.2s ease",
                    borderRadius: "0.5rem",
                    fontWeight: "bold",
                  }}
                >
                  Salvar
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
