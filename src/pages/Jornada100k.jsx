import React, { useState, useEffect } from "react";

const Jornada100k = () => {
  const TARGET_AMOUNT = 100000;

  const [jornadaData, setJornadaData] = useState(() => {
    const saved = localStorage.getItem("jornada100k_data");
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        startingBalance: parseFloat(parsed.startingBalance) || 0,
        targetMonths: parseInt(parsed.targetMonths) || 48,
        months: parsed.months || [],
      };
    }
    return {
      startingBalance: 0,
      targetMonths: 48,
      months: [],
    };
  });

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [startingBalance, setStartingBalance] = useState(
    jornadaData.startingBalance
  );
  const [targetMonths, setTargetMonths] = useState(jornadaData.targetMonths);
  const [editingMonth, setEditingMonth] = useState(null);

  const saveData = (data) => {
    localStorage.setItem("jornada100k_data", JSON.stringify(data));
    setJornadaData(data);
  };

  const initializePlanning = () => {
    const months = [];
    const startDate = new Date();

    for (let i = 0; i < targetMonths; i++) {
      const monthDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + i,
        1
      );
      months.push({
        date: monthDate.toISOString(),
        deposit: 0,
        balance: 0,
      });
    }

    const newData = {
      startingBalance: parseFloat(startingBalance),
      targetMonths: parseInt(targetMonths),
      months,
    };

    saveData(newData);
    setShowConfigModal(false);
  };

  const updateMonthDeposit = (index, deposit) => {
    const newMonths = [...jornadaData.months];
    newMonths[index].deposit = parseFloat(deposit) || 0;

    // Recalcular saldos
    let runningBalance = jornadaData.startingBalance;
    newMonths.forEach((month) => {
      runningBalance += month.deposit;
      month.balance = runningBalance;
    });

    saveData({
      ...jornadaData,
      months: newMonths,
    });

    setEditingMonth(null);
  };

  const resetAll = () => {
    if (
      window.confirm(
        "⚠️ Tem certeza que deseja resetar todos os dados? Esta ação não pode ser desfeita!"
      )
    ) {
      localStorage.removeItem("jornada100k_data");
      setJornadaData({
        startingBalance: 0,
        targetMonths: 48,
        months: [],
      });
      setStartingBalance(0);
      setTargetMonths(48);
      alert("🗑️ Dados resetados!");
    }
  };

  // Cálculos
  const totalDeposits = jornadaData.months.reduce(
    (sum, m) => sum + m.deposit,
    0
  );
  const currentAmount = jornadaData.startingBalance + totalDeposits;
  const remaining = TARGET_AMOUNT - currentAmount;
  const progress = (currentAmount / TARGET_AMOUNT) * 100;

  const today = new Date();
  const completedMonths = jornadaData.months.filter((m) => {
    const monthDate = new Date(m.date);
    return monthDate < today && m.deposit > 0;
  }).length;

  const monthsRemaining = jornadaData.targetMonths - completedMonths;
  const recommendedDeposit =
    monthsRemaining > 0 ? remaining / monthsRemaining : 0;

  const formatCurrency = (value) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
  };

  const isCurrentMonth = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };

  const isCompletedMonth = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    return date < now;
  };

  return (
    <div
      className="ml-[260px] min-h-screen bg-[#0f1419]"
      style={{ padding: "40px 50px" }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1
          style={{
            fontSize: "2.5em",
            color: "#667eea",
            marginBottom: "10px",
            fontWeight: "bold",
          }}
        >
          🎯 Jornada para 100k
        </h1>
        <p style={{ color: "#8b92a7", fontSize: "1.1em" }}>
          Acompanhamento mês a mês até sua liberdade financeira
        </p>
      </div>

      {/* Progress Section */}
      <div style={{ marginBottom: "40px" }}>
        <h3
          style={{ color: "#ffffff", marginBottom: "20px", fontSize: "1.2em" }}
        >
          Progresso Atual
        </h3>
        <div
          style={{
            background: "#252b3b",
            height: "40px",
            borderRadius: "20px",
            overflow: "hidden",
            position: "relative",
            border: "1px solid #2a2f3e",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
              width: `${Math.min(progress, 100)}%`,
              transition: "width 1s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingRight: "15px",
              minWidth: "60px",
            }}
          >
            <span
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: "0.9em",
                whiteSpace: "nowrap",
              }}
            >
              {progress.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div
        className="grid grid-cols-4"
        style={{ gap: "16px", margin: "30px 0" }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #1a1f2e 0%, #252b3b 100%)",
            padding: "20px",
            borderRadius: "12px",
            textAlign: "center",
            border: "1px solid #2a2f3e",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            minHeight: "120px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              opacity: 0.9,
              marginBottom: "8px",
              color: "#8b92a7",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontWeight: "600",
            }}
          >
            Saldo Atual
          </div>
          <div
            style={{
              fontSize: "1.6em",
              fontWeight: "700",
              color: "#ffffff",
              lineHeight: "1.2",
            }}
          >
            {formatCurrency(currentAmount)}
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #1a1f2e 0%, #252b3b 100%)",
            padding: "20px",
            borderRadius: "12px",
            textAlign: "center",
            border: "1px solid #2a2f3e",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            minHeight: "120px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              opacity: 0.9,
              marginBottom: "8px",
              color: "#8b92a7",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontWeight: "600",
            }}
          >
            Meta Final
          </div>
          <div
            style={{
              fontSize: "1.6em",
              fontWeight: "700",
              color: "#ffffff",
              lineHeight: "1.2",
            }}
          >
            {formatCurrency(TARGET_AMOUNT)}
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #1a1f2e 0%, #252b3b 100%)",
            padding: "20px",
            borderRadius: "12px",
            textAlign: "center",
            border: "1px solid #2a2f3e",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            minHeight: "120px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              opacity: 0.9,
              marginBottom: "8px",
              color: "#8b92a7",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontWeight: "600",
            }}
          >
            Falta para Meta
          </div>
          <div
            style={{
              fontSize: "1.6em",
              fontWeight: "700",
              color: "#ffffff",
              lineHeight: "1.2",
            }}
          >
            {formatCurrency(Math.max(0, remaining))}
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #1a1f2e 0%, #252b3b 100%)",
            padding: "20px",
            borderRadius: "12px",
            textAlign: "center",
            border: "1px solid #2a2f3e",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            minHeight: "120px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              opacity: 0.9,
              marginBottom: "8px",
              color: "#8b92a7",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontWeight: "600",
            }}
          >
            Meses Restantes
          </div>
          <div
            style={{
              fontSize: "1.6em",
              fontWeight: "700",
              color: "#ffffff",
              lineHeight: "1.2",
            }}
          >
            {Math.max(0, monthsRemaining)}
          </div>
        </div>
      </div>

      {/* Recommendation Card */}
      <div className="grid grid-cols-1" style={{ marginTop: "10px" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #1a3a2e 0%, #1e4a38 100%)",
            borderLeft: "4px solid #27ae60",
            padding: "20px",
            borderRadius: "12px",
            textAlign: "center",
            border: "1px solid #2a2f3e",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            minHeight: "100px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: "#a8e6cf",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            💡 Aporte Recomendado
          </div>
          <div
            style={{
              fontSize: "1.8em",
              color: "#27ae60",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            {formatCurrency(Math.max(0, recommendedDeposit))}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "#8b92a7",
              marginTop: "4px",
              fontWeight: "500",
            }}
          >
            Valor mensal para manter o prazo
          </div>
        </div>
      </div>

      {/* Config Button */}
      <div style={{ textAlign: "center", margin: "30px 0" }}>
        <button
          onClick={() => setShowConfigModal(true)}
          className="rounded-lg cursor-pointer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            fontSize: "1em",
            fontWeight: "600",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
            borderRadius: "10px",
          }}
        >
          ⚙️ Configurar Planejamento
        </button>
      </div>

      {/* Months List */}
      {jornadaData.months.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h3
            style={{
              color: "#ffffff",
              fontSize: "1.2em",
              marginBottom: "20px",
            }}
          >
            <span style={{ fontSize: "1.5em", marginRight: "10px" }}>📅</span>
            Registro Mensal de Aportes
          </h3>
          <div className="flex flex-col" style={{ gap: "15px" }}>
            {jornadaData.months.map((month, index) => {
              const isCurrent = isCurrentMonth(month.date);
              const isCompleted =
                isCompletedMonth(month.date) && month.deposit > 0;
              const isEditing = editingMonth === index;

              return (
                <div
                  key={index}
                  className="grid grid-cols-3 rounded-lg"
                  style={{
                    background: isCompleted
                      ? "#1e3a38"
                      : isCurrent
                      ? "#2e2738"
                      : "#1e2738",
                    border: isCurrent
                      ? "3px solid #f39c12"
                      : isCompleted
                      ? "2px solid #27ae60"
                      : "2px solid #2a2f3e",
                    borderLeft: isCurrent
                      ? "4px solid #f39c12"
                      : isCompleted
                      ? "4px solid #27ae60"
                      : "2px solid #2a2f3e",
                    borderRadius: "10px",
                    padding: "20px",
                    gap: "20px",
                    alignItems: "center",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "bold",
                      color: "#5b8def",
                      fontSize: "1.1em",
                    }}
                  >
                    {formatDate(month.date)}
                  </div>

                  <div
                    className="flex"
                    style={{ alignItems: "center", gap: "10px" }}
                  >
                    {isEditing ? (
                      <>
                        <input
                          type="number"
                          defaultValue={month.deposit}
                          id={`deposit-${index}`}
                          placeholder="R$ 0,00"
                          min="0"
                          step="0.01"
                          className="flex-1 rounded-lg"
                          style={{
                            padding: "12px",
                            border: "2px solid #2a2f3e",
                            fontSize: "1em",
                            background: "#1a1f2e",
                            color: "#e4e6eb",
                            borderRadius: "10px",
                          }}
                        />
                        <button
                          onClick={() => {
                            const input = document.getElementById(
                              `deposit-${index}`
                            );
                            updateMonthDeposit(index, input.value);
                          }}
                          className="rounded-lg"
                          style={{
                            padding: "8px 15px",
                            fontSize: "0.9em",
                            background: "#27ae60",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: "bold",
                            boxShadow: "0 2px 8px rgba(39, 174, 96, 0.3)",
                            borderRadius: "10px",
                          }}
                        >
                          Salvar
                        </button>
                      </>
                    ) : (
                      <>
                        <input
                          type="number"
                          value={month.deposit}
                          disabled
                          className="flex-1 rounded-lg"
                          style={{
                            padding: "12px",
                            border: "2px solid #2a2f3e",
                            fontSize: "1em",
                            background: "#1a1f2e",
                            color: "#e4e6eb",
                            opacity: 0.5,
                            borderRadius: "10px",
                          }}
                        />
                        <button
                          onClick={() => setEditingMonth(index)}
                          className="rounded-lg"
                          style={{
                            padding: "8px 15px",
                            fontSize: "0.9em",
                            background: "#5a6c7d",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: "bold",
                            boxShadow: "0 2px 8px rgba(90, 108, 125, 0.3)",
                            borderRadius: "10px",
                          }}
                        >
                          Editar
                        </button>
                      </>
                    )}
                  </div>

                  <div
                    style={{
                      textAlign: "right",
                      fontSize: "1.2em",
                      fontWeight: "bold",
                      color: "#ffffff",
                    }}
                  >
                    {formatCurrency(month.balance)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Config Modal */}
      {showConfigModal && (
        <div
          className={`modal ${showConfigModal ? "active" : ""}`}
          onClick={() => setShowConfigModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "30px",
                paddingBottom: "20px",
                borderBottom: "1px solid #2a2f3e",
              }}
            >
              <span style={{ fontSize: "1.5em" }}>⚙️</span>
              <h2 style={{ margin: 0, color: "#ffffff", fontSize: "1.5em" }}>
                Configurações Iniciais
              </h2>
            </div>

            <div className="form-group">
              <label>Saldo Inicial (R$)</label>
              <input
                type="number"
                value={startingBalance}
                onChange={(e) => setStartingBalance(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Prazo Desejado (meses)</label>
              <input
                type="number"
                value={targetMonths}
                onChange={(e) => setTargetMonths(e.target.value)}
                min="1"
              />
            </div>

            <div className="form-actions">
              <button
                onClick={() => setShowConfigModal(false)}
                className="border-none rounded-lg cursor-pointer bg-[#5a6c7d] hover:bg-[#4a5c6d]"
                style={{
                  padding: "12px 24px",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "bold",
                  transition: "all 0.2s ease",
                  borderRadius: "0.5rem",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={initializePlanning}
                className="border-none rounded-lg cursor-pointer bg-[#667eea] hover:bg-[#5568d3]"
                style={{
                  padding: "12px 24px",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "bold",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                  transition: "all 0.2s ease",
                  borderRadius: "0.5rem",
                }}
              >
                Iniciar Planejamento
              </button>
            </div>

            <button
              onClick={resetAll}
              className="border-none rounded-lg cursor-pointer"
              style={{
                width: "100%",
                marginTop: "15px",
                padding: "12px 24px",
                background: "linear-gradient(135deg, #f39c12 0%, #e74c3c 100%)",
                color: "white",
                fontSize: "14px",
                fontWeight: "bold",
                boxShadow: "0 4px 12px rgba(243, 156, 18, 0.3)",
                transition: "all 0.2s ease",
                borderRadius: "0.5rem",
              }}
            >
              🔄 Resetar Tudo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jornada100k;
