import React, { useState, useEffect } from "react";

const Aposentadoria = () => {
  const TARGET_AMOUNT = 600000;
  const END_DATE = new Date(2047, 2, 1); // março/2047

  const [retirementData, setRetirementData] = useState(() => {
    const saved = localStorage.getItem("retirementData2");
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        contributions: parsed.contributions.map((c) => ({
          amount: parseFloat(c.amount),
          date: new Date(c.date),
        })),
        interestRate: parseFloat(parsed.interestRate) || 6,
        targetIncome: parseFloat(parsed.targetIncome) || 3000,
      };
    }
    return {
      contributions: [],
      interestRate: 6,
      targetIncome: 3000,
    };
  });

  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const formatCurrency = (value) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const saveData = (data) => {
    localStorage.setItem("retirementData2", JSON.stringify(data));
    setRetirementData(data);
  };

  const getRemainingMonths = () => {
    const now = new Date();
    const years = END_DATE.getFullYear() - now.getFullYear();
    const months = END_DATE.getMonth() - now.getMonth();
    const total = years * 12 + months;
    return Math.max(0, total);
  };

  const calculateCurrentBalance = () => {
    const now = new Date();
    const monthlyRate =
      Math.pow(1 + retirementData.interestRate / 100, 1 / 12) - 1;
    let balance = 0;

    retirementData.contributions.forEach((contribution) => {
      const ageInDays = (now - contribution.date) / (1000 * 60 * 60 * 24);
      const ageInMonths = ageInDays / 30.44;
      balance += contribution.amount * Math.pow(1 + monthlyRate, ageInMonths);
    });

    return balance;
  };

  const calculateIdealMonthly = () => {
    const remainingMonths = getRemainingMonths();
    if (remainingMonths === 0) return 0;

    const monthlyRate =
      Math.pow(1 + retirementData.interestRate / 100, 1 / 12) - 1;
    const currentBalance = calculateCurrentBalance();
    const futureBalance =
      currentBalance * Math.pow(1 + monthlyRate, remainingMonths);
    const stillNeeded = TARGET_AMOUNT - futureBalance;

    if (stillNeeded <= 0) return 0;

    const idealPayment =
      (stillNeeded * monthlyRate) /
      (Math.pow(1 + monthlyRate, remainingMonths) - 1);
    return Math.max(0, idealPayment);
  };

  const currentBalance = calculateCurrentBalance();
  const totalContributed = retirementData.contributions.reduce(
    (sum, c) => sum + c.amount,
    0
  );
  const earnings = currentBalance - totalContributed;
  const remainingMonths = getRemainingMonths();
  const idealMonthly = calculateIdealMonthly();

  const addContribution = () => {
    const amount = parseFloat(monthlyAmount);

    if (!amount || amount <= 0) {
      alert("Digite um valor válido!");
      return;
    }

    const newData = {
      ...retirementData,
      contributions: [
        ...retirementData.contributions,
        {
          amount: amount,
          date: new Date(),
        },
      ],
    };

    saveData(newData);
    setMonthlyAmount("");
    alert("✅ Aporte registrado com sucesso!");
  };

  const editContribution = (index) => {
    const contribution = retirementData.contributions[index];
    const newAmount = prompt(
      "Digite o novo valor do aporte:",
      contribution.amount.toFixed(2)
    );

    if (newAmount === null) return;

    const amount = parseFloat(newAmount);

    if (!amount || amount <= 0) {
      alert("❌ Valor inválido!");
      return;
    }

    const newContributions = [...retirementData.contributions];
    newContributions[index].amount = amount;

    saveData({
      ...retirementData,
      contributions: newContributions,
    });

    alert("✅ Aporte editado com sucesso!");
  };

  const deleteContribution = (index) => {
    const contribution = retirementData.contributions[index];
    const confirmDelete = window.confirm(
      `⚠️ Deseja realmente remover o aporte de ${formatCurrency(
        contribution.amount
      )}?\n\nData: ${contribution.date.toLocaleDateString("pt-BR")}`
    );

    if (!confirmDelete) return;

    const newContributions = retirementData.contributions.filter(
      (_, i) => i !== index
    );

    saveData({
      ...retirementData,
      contributions: newContributions,
    });

    alert("🗑️ Aporte removido com sucesso!");
  };

  const recalculate = () => {
    alert("✅ Recálculo realizado com sucesso!");
  };

  const resetData = () => {
    if (
      window.confirm(
        "⚠️ Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita!"
      )
    ) {
      localStorage.removeItem("retirementData2");
      setRetirementData({
        contributions: [],
        interestRate: 6,
        targetIncome: 3000,
      });
      alert("🗑️ Dados resetados!");
    }
  };

  const sortedContributions = [...retirementData.contributions].sort(
    (a, b) => b.date - a.date
  );

  return (
    <div
      className="ml-[260px] in-h-screen bg-[#0f1419]"
      style={{ padding: "40px 50px" }}
    >
      {/* Header */}
      <div
        className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e]"
        style={{ padding: "30px", marginBottom: "30px", borderRadius: "15px" }}
      >
        <h2
          className="text-[28px] font-bold mb-3"
          style={{ color: "#667eea", fontWeight: "bold" }}
        >
          🎯 Minha Aposentadoria aos 50 Anos
        </h2>
        <p className="text-[#8b92a7] text-[14px]">
          Meta: R$ 3.000/mês em poder de compra • Início: Março/2025
        </p>
      </div>

      {/* Cards Principais */}
      <div
        className="grid grid-cols-2 gap-8"
        style={{ marginBottom: "30px", gap: "10px" }}
      >
        {/* Situação Atual */}
        <div
          className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e]"
          style={{ padding: "35px", borderRadius: "15px" }}
        >
          <h3
            className="text-[20px] font-bold mb-6 flex items-center gap-2"
            style={{ color: "#667eea", fontWeight: "bold", gap: "10px" }}
          >
            📊 Situação Atual
          </h3>
          <div style={{ marginBottom: "20px" }}>
            <div className="text-[#8b92a7] text-[14px] mb-2" style={{marginTop: "30px"}}>
              Patrimônio Acumulado
            </div>
            <div
              className="text-[32px] font-bold"
              style={{ color: "#667eea", fontWeight: "bold" }}
            >
              {formatCurrency(currentBalance)}
            </div>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <div className="text-[#8b92a7] text-[14px] mb-2" style={{marginTop: "20px"}}>
              Aportes Realizados
            </div>
            <div
              className="text-[32px] font-bold text-white"
              style={{ fontWeight: "bold" }}
            >
              {formatCurrency(totalContributed)}
            </div>
          </div>
          <div>
            <div className="text-[#8b92a7] text-[14px] mb-2" style={{marginTop: "20px"}}>
              Rendimento até agora
            </div>
            <div
              className="text-[32px] font-bold text-[#27ae60]"
              style={{ fontWeight: "bold" }}
            >
              {formatCurrency(earnings)}
            </div>
          </div>
        </div>

        {/* Meta e Projeção */}
        <div
          className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e]"
          style={{ padding: "35px", borderRadius: "15px" }}
        >
          <h3
            className="text-[20px] font-bold mb-6 flex items-center gap-2"
            style={{ color: "#667eea", fontWeight: "bold", gap: "10px" }}
          >
            🎯 Meta e Projeção
          </h3>
          <div style={{ marginBottom: "20px" }}>
            <div className="text-[#8b92a7] text-[14px] mb-2" style={{marginTop: "10px"}}>
              Patrimônio Necessário
            </div>
            <div
              className="text-[32px] font-bold text-white"
              style={{ fontWeight: "bold" }}
            >
              {formatCurrency(TARGET_AMOUNT)}
            </div>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <div className="text-[#8b92a7] text-[14px] mb-2">
              Meses até março/2047
            </div>
            <div
              className="text-[32px] font-bold text-white"
              style={{ fontWeight: "bold" }}
            >
              {remainingMonths}
            </div>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <div className="text-[#8b92a7] text-[14px] mb-2">
              Parcela Ideal por Mês
            </div>
            <div
              className="text-[32px] font-bold text-[#f39c12]"
              style={{ fontWeight: "bold" }}
            >
              {formatCurrency(idealMonthly)}
            </div>
          </div>
          <div
            className="rounded"
            style={{
              padding: "16px",
              background:
                idealMonthly === 0 ? "#d1fae5" : "rgba(59, 130, 246, 0.1)",
              borderLeft:
                idealMonthly === 0 ? "4px solid #10b981" : "4px solid #3b82f6",
              fontSize: "14px",
              color: idealMonthly === 0 ? "#065f46" : "#ffffff",
              marginTop: "20px",
            }}
          >
            {idealMonthly === 0
              ? "🎉 Parabéns! Você já atingiu a meta!"
              : `Deposite ${formatCurrency(
                  idealMonthly
                )}/mês pelos próximos ${remainingMonths} meses para atingir R$ 600.000`}
          </div>
        </div>
      </div>

      {/* Modal de Novo Aporte */}
      {showContributionModal && (
        <div
          className={`modal ${showContributionModal ? "active" : ""}`}
          onClick={() => setShowContributionModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>💰 Novo Aporte</h2>

            <div className="form-group">
              <label>Valor do aporte (R$)</label>
              <input
                type="number"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(e.target.value)}
                placeholder="Ex: 1500"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-actions">
              <button
                onClick={() => setShowContributionModal(false)}
                className="border-none rounded-lg cursor-pointer bg-[#5a6c7d] text-white text-[14px] font-bold hover:bg-[#4a5c6d]"
                style={{
                  padding: "12px 24px",
                  transition: "all 0.2s ease",
                  borderRadius: "0.5rem",
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  addContribution();
                  setShowContributionModal(false);
                }}
                className="border-none rounded-lg cursor-pointer bg-[#667eea] text-white text-[14px] font-bold hover:bg-[#5568d3]"
                style={{
                  padding: "12px 24px",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                  transition: "all 0.2s ease",
                  borderRadius: "0.5rem",
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                💾 Registrar Aporte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configurações */}
      {showSettingsModal && (
        <div
          className={`modal ${showSettingsModal ? "active" : ""}`}
          onClick={() => setShowSettingsModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>⚙️ Configurações</h2>

            <div className="form-group">
              <label>Taxa real anual (%)</label>
              <input
                type="number"
                value={retirementData.interestRate}
                onChange={(e) =>
                  saveData({
                    ...retirementData,
                    interestRate: parseFloat(e.target.value),
                  })
                }
                min="0"
                max="20"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>Renda mensal desejada (R$)</label>
              <input
                type="number"
                value={retirementData.targetIncome}
                onChange={(e) =>
                  saveData({
                    ...retirementData,
                    targetIncome: parseFloat(e.target.value),
                  })
                }
                min="0"
                step="100"
              />
            </div>

            <div
              className="form-actions"
              style={{ flexDirection: "column", gap: "12px" }}
            >
              <button
                onClick={() => {
                  recalculate();
                  setShowSettingsModal(false);
                }}
                className="border-none rounded-lg cursor-pointer bg-[#667eea] text-white text-[14px] font-bold hover:bg-[#5568d3]"
                style={{
                  padding: "12px 24px",
                  width: "100%",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                  transition: "all 0.2s ease",
                  borderRadius: "0.5rem",
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                🔄 Recalcular Tudo
              </button>
              <button
                onClick={() => {
                  resetData();
                  setShowSettingsModal(false);
                }}
                className="border-none rounded-lg cursor-pointer bg-[#ef4444] text-white text-[14px] font-bold hover:bg-[#dc2626]"
                style={{
                  padding: "12px 24px",
                  width: "100%",
                  transition: "all 0.2s ease",
                  borderRadius: "0.5rem",
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                🗑️ Resetar Dados
              </button>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="border-none rounded-lg cursor-pointer bg-[#5a6c7d] text-white text-[14px] font-bold hover:bg-[#4a5c6d]"
                style={{
                  padding: "12px 24px",
                  width: "100%",
                  transition: "all 0.2s ease",
                  borderRadius: "0.5rem",
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Histórico de Aportes */}
      <div
        className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e]"
        style={{ padding: "35px", borderRadius: "15px" }}
      >
        <div className="flex justify-between items-center mb-6">
          <h3
            className="text-[22px] font-bold"
            style={{ color: "#667eea", fontWeight: "bold" }}
          >
            📈 Histórico de Aportes
          </h3>

          {/* Botões Flutuantes */}
          <div
            className="flex gap-3"
            style={{ gap: "12px", marginBottom: "20px" }}
          >
            <button
              onClick={() => setShowContributionModal(true)}
              className="bg-[#667eea] text-white rounded-full hover:bg-[#5568d3] transition-all hover:scale-110"
              style={{
                padding: "12px",
                border: "none",
                cursor: "pointer",
                width: "48px",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
              }}
              title="Registrar Novo Aporte"
            >
              💰
            </button>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="bg-[#2a2f3e] text-white rounded-full hover:bg-[#3a3f4e] transition-all hover:scale-110"
              style={{
                padding: "12px",
                border: "none",
                cursor: "pointer",
                width: "48px",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                boxShadow: "0 4px 12px rgba(42, 47, 62, 0.3)",
              }}
              title="Configurações"
            >
              ⚙️
            </button>
          </div>
        </div>
        {sortedContributions.length === 0 ? (
          <p
            className="text-center text-[#8b92a7]"
            style={{ padding: "30px 0" }}
          >
            Nenhum aporte registrado ainda
          </p>
        ) : (
          <div className="flex flex-col gap-4" style={{ gap: "16px" }}>
            {sortedContributions.map((contribution, index) => {
              const originalIndex = retirementData.contributions.findIndex(
                (c) =>
                  c.date.getTime() === contribution.date.getTime() &&
                  c.amount === contribution.amount
              );
              return (
                <div
                  key={index}
                  className="bg-[#1e2738] rounded flex justify-between items-center"
                  style={{ padding: "18px", borderLeft: "4px solid #667eea" }}
                >
                  <div className="flex-1">
                    <div className="text-[13px] text-[#8b92a7]">
                      {contribution.date.toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div
                      className="text-[20px] font-bold text-white"
                      style={{ marginTop: "6px", fontWeight: "bold" }}
                    >
                      {formatCurrency(contribution.amount)}
                    </div>
                  </div>
                  <div className="flex gap-3" style={{ gap: "12px" }}>
                    <button
                      onClick={() => editContribution(originalIndex)}
                      className="bg-transparent text-[#8b92a7] hover:bg-[rgba(91,141,239,0.1)] hover:text-[#5b8def] rounded transition-all"
                      style={{
                        padding: "10px",
                        fontSize: "18px",
                        border: "none",
                        cursor: "pointer",
                      }}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteContribution(originalIndex)}
                      className="bg-transparent text-[#8b92a7] hover:bg-[rgba(231,76,60,0.1)] hover:text-[#e74c3c] rounded transition-all"
                      style={{
                        padding: "10px",
                        fontSize: "18px",
                        border: "none",
                        cursor: "pointer",
                      }}
                      title="Remover"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Aposentadoria;
