import React, { useState } from "react";

const Aposentadoria = () => {
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
        currentAge: parseFloat(parsed.currentAge) || 28,
        retirementAge: parseFloat(parsed.retirementAge) || 50,
      };
    }
    return {
      contributions: [],
      interestRate: 6,
      targetIncome: 3000,
      currentAge: 28,
      retirementAge: 50,
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

  const getTargetAmount = () => {
    // Calcular patrimônio necessário baseado no RENDIMENTO mensal
    // Se quero R$ 3.000/mês e a taxa real é 6% ao ano
    // Preciso de: (3.000 × 12) / 0.06 = R$ 600.000
    // Porque R$ 600k rendendo 6%aa = R$ 36k/ano = R$ 3k/mês
    const annualIncome = retirementData.targetIncome * 12;
    const requiredCapital = annualIncome / (retirementData.interestRate / 100);
    return requiredCapital;
  };

  const getRemainingMonths = () => {
    const yearsRemaining =
      retirementData.retirementAge - retirementData.currentAge;
    return Math.max(0, yearsRemaining * 12);
  };

  const getRemainingYears = () => {
    return Math.max(
      0,
      retirementData.retirementAge - retirementData.currentAge
    );
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

    const targetAmount = getTargetAmount();
    const monthlyRate =
      Math.pow(1 + retirementData.interestRate / 100, 1 / 12) - 1;
    const currentBalance = calculateCurrentBalance();
    const futureBalance =
      currentBalance * Math.pow(1 + monthlyRate, remainingMonths);
    const stillNeeded = targetAmount - futureBalance;

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
  const remainingYears = getRemainingYears();
  const idealMonthly = calculateIdealMonthly();
  const targetAmount = getTargetAmount();

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
        currentAge: 28,
        retirementAge: 50,
      });
      alert("🗑️ Dados resetados!");
    }
  };

  const sortedContributions = [...retirementData.contributions].sort(
    (a, b) => b.date - a.date
  );

  return (
    <div className="ml-[260px] min-h-screen bg-[#0f1419] p-10">
      <div className="bg-[#1a1f2e] rounded-2xl border border-[#2a2f3e] p-8 mb-8">
        <h2 className="text-[28px] font-bold mb-3 text-[#667eea]">
          🎯 Minha Aposentadoria aos {retirementData.retirementAge} Anos
        </h2>
        <p className="text-[#8b92a7] text-sm">
          Idade Atual: {retirementData.currentAge} anos • Faltam{" "}
          {remainingYears} anos ({remainingMonths} meses)
        </p>
        <p className="text-[#8b92a7] text-sm mt-2">
          Meta: {formatCurrency(retirementData.targetIncome)}/mês em poder de
          compra
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-[#1a1f2e] rounded-2xl border border-[#2a2f3e] p-9">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2.5 text-[#667eea]">
            📊 Situação Atual
          </h3>
          <div className="mb-5">
            <div className="text-[#8b92a7] text-sm mb-2 mt-8">
              Patrimônio Acumulado
            </div>
            <div className="text-[32px] font-bold text-[#667eea]">
              {formatCurrency(currentBalance)}
            </div>
          </div>
          <div className="mb-5">
            <div className="text-[#8b92a7] text-sm mb-2 mt-5">
              Aportes Realizados
            </div>
            <div className="text-[32px] font-bold text-white">
              {formatCurrency(totalContributed)}
            </div>
          </div>
          <div>
            <div className="text-[#8b92a7] text-sm mb-2 mt-5">
              Rendimento até agora
            </div>
            <div className="text-[32px] font-bold text-[#27ae60]">
              {formatCurrency(earnings)}
            </div>
          </div>
        </div>

        <div className="bg-[#1a1f2e] rounded-2xl border border-[#2a2f3e] p-9">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2.5 text-[#667eea]">
            🎯 Meta e Projeção
          </h3>
          <div className="mb-5">
            <div className="text-[#8b92a7] text-sm mb-2 mt-2.5">
              Patrimônio Necessário
            </div>
            <div className="text-[32px] font-bold text-white">
              {formatCurrency(targetAmount)}
            </div>
            <div className="text-xs text-[#8b92a7] mt-1">
              (Rendimento de {retirementData.interestRate}% a.a. ={" "}
              {formatCurrency(retirementData.targetIncome)}/mês)
            </div>
          </div>
          <div className="mb-5">
            <div className="text-[#8b92a7] text-sm mb-2">Tempo restante</div>
            <div className="text-[32px] font-bold text-white">
              {remainingYears} anos
            </div>
            <div className="text-sm text-[#8b92a7]">
              ({remainingMonths} meses)
            </div>
          </div>
          <div className="mb-5">
            <div className="text-[#8b92a7] text-sm mb-2">
              Aporte Ideal por Mês
            </div>
            <div className="text-[32px] font-bold text-[#f39c12]">
              {formatCurrency(idealMonthly)}
            </div>
          </div>
          <div
            className={`rounded p-4 mt-5 text-sm ${
              idealMonthly === 0
                ? "bg-[#d1fae5] border-l-4 border-l-[#10b981] text-[#065f46]"
                : "bg-[rgba(59,130,246,0.1)] border-l-4 border-l-[#3b82f6] text-white"
            }`}
          >
            {idealMonthly === 0
              ? "🎉 Parabéns! Você já atingiu a meta!"
              : `Deposite ${formatCurrency(
                  idealMonthly
                )}/mês pelos próximos ${remainingMonths} meses para atingir ${formatCurrency(
                  targetAmount
                )}`}
          </div>
        </div>
      </div>

      {showContributionModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowContributionModal(false)}
        >
          <div
            className="bg-[#1a1f2e] rounded-2xl border border-[#2a2f3e] p-8 w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              💰 Novo Aporte
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#8b92a7] mb-2">
                Valor do aporte (R$)
              </label>
              <input
                type="number"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(e.target.value)}
                placeholder="Ex: 1500"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 bg-[#252b3b] border border-[#2a2f3e] rounded-lg text-white outline-none focus:border-[#667eea] transition-all"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowContributionModal(false)}
                className="flex-1 px-6 py-3 bg-[#5a6c7d] text-white text-sm font-bold rounded-lg transition-all hover:bg-[#4a5c6d]"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  addContribution();
                  setShowContributionModal(false);
                }}
                className="flex-1 px-6 py-3 bg-[#667eea] text-white text-sm font-bold rounded-lg shadow-[0_4px_12px_rgba(102,126,234,0.3)] transition-all hover:bg-[#5568d3]"
              >
                💾 Registrar Aporte
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowSettingsModal(false)}
        >
          <div
            className="bg-[#1a1f2e] rounded-2xl border border-[#2a2f3e] p-8 w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              ⚙️ Configurações
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#8b92a7] mb-2">
                  Idade Atual (anos)
                </label>
                <input
                  type="number"
                  value={retirementData.currentAge}
                  onChange={(e) =>
                    saveData({
                      ...retirementData,
                      currentAge: parseFloat(e.target.value),
                    })
                  }
                  min="18"
                  max="100"
                  step="1"
                  className="w-full px-4 py-3 bg-[#252b3b] border border-[#2a2f3e] rounded-lg text-white outline-none focus:border-[#667eea] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#8b92a7] mb-2">
                  Idade para Aposentar (anos)
                </label>
                <input
                  type="number"
                  value={retirementData.retirementAge}
                  onChange={(e) =>
                    saveData({
                      ...retirementData,
                      retirementAge: parseFloat(e.target.value),
                    })
                  }
                  min={retirementData.currentAge + 1}
                  max="100"
                  step="1"
                  className="w-full px-4 py-3 bg-[#252b3b] border border-[#2a2f3e] rounded-lg text-white outline-none focus:border-[#667eea] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#8b92a7] mb-2">
                  Renda mensal desejada (R$)
                </label>
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
                  className="w-full px-4 py-3 bg-[#252b3b] border border-[#2a2f3e] rounded-lg text-white outline-none focus:border-[#667eea] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#8b92a7] mb-2">
                  Taxa real anual (%)
                </label>
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
                  className="w-full px-4 py-3 bg-[#252b3b] border border-[#2a2f3e] rounded-lg text-white outline-none focus:border-[#667eea] transition-all"
                />
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={() => {
                    recalculate();
                    setShowSettingsModal(false);
                  }}
                  className="w-full px-6 py-3 bg-[#667eea] text-white text-sm font-bold rounded-lg shadow-[0_4px_12px_rgba(102,126,234,0.3)] transition-all hover:bg-[#5568d3]"
                >
                  🔄 Recalcular Tudo
                </button>
                <button
                  onClick={() => {
                    resetData();
                    setShowSettingsModal(false);
                  }}
                  className="w-full px-6 py-3 bg-[#ef4444] text-white text-sm font-bold rounded-lg transition-all hover:bg-[#dc2626]"
                >
                  🗑️ Resetar Dados
                </button>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="w-full px-6 py-3 bg-[#5a6c7d] text-white text-sm font-bold rounded-lg transition-all hover:bg-[#4a5c6d]"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#1a1f2e] rounded-2xl border border-[#2a2f3e] p-9">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[22px] font-bold text-[#667eea]">
            📈 Histórico de Aportes
          </h3>

          <div className="flex gap-3 mb-5">
            <button
              onClick={() => setShowContributionModal(true)}
              className="bg-[#667eea] text-white rounded-full hover:bg-[#5568d3] transition-all hover:scale-110 w-12 h-12 flex items-center justify-center text-xl shadow-[0_4px_12px_rgba(102,126,234,0.3)] border-none cursor-pointer"
              title="Registrar Novo Aporte"
            >
              💰
            </button>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="bg-[#2a2f3e] text-white rounded-full hover:bg-[#3a3f4e] transition-all hover:scale-110 w-12 h-12 flex items-center justify-center text-xl shadow-[0_4px_12px_rgba(42,47,62,0.3)] border-none cursor-pointer"
              title="Configurações"
            >
              ⚙️
            </button>
          </div>
        </div>
        {sortedContributions.length === 0 ? (
          <p className="text-center text-[#8b92a7] py-8">
            Nenhum aporte registrado ainda
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {sortedContributions.map((contribution, index) => {
              const originalIndex = retirementData.contributions.findIndex(
                (c) =>
                  c.date.getTime() === contribution.date.getTime() &&
                  c.amount === contribution.amount
              );
              return (
                <div
                  key={index}
                  className="bg-[#1e2738] rounded flex justify-between items-center p-4 border-l-4 border-l-[#667eea]"
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
                    <div className="text-xl font-bold text-white mt-1.5">
                      {formatCurrency(contribution.amount)}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => editContribution(originalIndex)}
                      className="bg-transparent text-[#8b92a7] hover:bg-[rgba(91,141,239,0.1)] hover:text-[#5b8def] rounded transition-all p-2.5 text-lg border-none cursor-pointer"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteContribution(originalIndex)}
                      className="bg-transparent text-[#8b92a7] hover:bg-[rgba(231,76,60,0.1)] hover:text-[#e74c3c] rounded transition-all p-2.5 text-lg border-none cursor-pointer"
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
