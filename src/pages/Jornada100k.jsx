import React, { useState } from "react";

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
    <div className="ml-[260px] min-h-screen bg-[#0f1419] p-10">
      <div className="text-center mb-8">
        <h1 className="text-5xl text-[#667eea] mb-2.5 font-bold">
          🎯 Jornada para 100k
        </h1>
        <p className="text-[#8b92a7] text-lg">
          Acompanhamento mês a mês até sua liberdade financeira
        </p>
      </div>

      <div className="mb-10">
        <h3 className="text-white mb-5 text-xl">Progresso Atual</h3>
        <div className="bg-[#252b3b] h-10 rounded-[20px] overflow-hidden relative border border-[#2a2f3e]">
          <div
            className="h-full bg-gradient-to-r from-[#667eea] to-[#764ba2] flex items-center justify-end pr-4 min-w-[60px] transition-all duration-1000"
            style={{ width: `${Math.min(progress, 100)}%` }}
          >
            <span className="text-white font-bold text-sm whitespace-nowrap">
              {progress.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 my-8">
        {[
          {
            label: "Saldo Atual",
            value: formatCurrency(currentAmount),
            color: "#ffffff",
          },
          {
            label: "Meta Final",
            value: formatCurrency(TARGET_AMOUNT),
            color: "#ffffff",
          },
          {
            label: "Falta para Meta",
            value: formatCurrency(Math.max(0, remaining)),
            color: "#ffffff",
          },
          {
            label: "Meses Restantes",
            value: Math.max(0, monthsRemaining),
            color: "#ffffff",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-[#1a1f2e] to-[#252b3b] p-5 rounded-xl text-center border border-[#2a2f3e] shadow-[0_4px_12px_rgba(0,0,0,0.3)] min-h-[120px] flex flex-col justify-center"
          >
            <div className="text-xs opacity-90 mb-2 text-[#8b92a7] uppercase tracking-wide font-semibold">
              {stat.label}
            </div>
            <div
              className="text-[1.6em] font-bold leading-tight"
              style={{ color: stat.color }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 mt-2.5">
        <div className="bg-gradient-to-br from-[#1a3a2e] to-[#1e4a38] border-l-4 border-l-[#27ae60] p-5 rounded-xl text-center border border-[#2a2f3e] shadow-[0_4px_12px_rgba(0,0,0,0.3)] min-h-[100px] flex flex-col justify-center">
          <div className="text-sm text-[#a8e6cf] flex items-center justify-center gap-2 mb-3">
            💡 Aporte Recomendado
          </div>
          <div className="text-[1.8em] text-[#27ae60] mb-1 font-bold">
            {formatCurrency(Math.max(0, recommendedDeposit))}
          </div>
          <div className="text-[11px] text-[#8b92a7] mt-1 font-medium">
            Valor mensal para manter o prazo
          </div>
        </div>
      </div>

      <div className="text-center my-8">
        <button
          onClick={() => setShowConfigModal(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none text-base font-semibold shadow-[0_4px_12px_rgba(102,126,234,0.3)] rounded-lg cursor-pointer"
        >
          ⚙️ Configurar Planejamento
        </button>
      </div>

      {jornadaData.months.length > 0 && (
        <div className="mt-8">
          <h3 className="text-white text-xl mb-5">
            <span className="text-2xl mr-2.5">📅</span>
            Registro Mensal de Aportes
          </h3>
          <div className="flex flex-col gap-4">
            {jornadaData.months.map((month, index) => {
              const isCurrent = isCurrentMonth(month.date);
              const isCompleted =
                isCompletedMonth(month.date) && month.deposit > 0;
              const isEditing = editingMonth === index;

              return (
                <div
                  key={index}
                  className={`grid grid-cols-3 rounded-lg p-5 gap-5 items-center transition-all ${
                    isCompleted
                      ? "bg-[#1e3a38] border-2 border-[#27ae60] border-l-4"
                      : isCurrent
                      ? "bg-[#2e2738] border-[3px] border-[#f39c12] border-l-4"
                      : "bg-[#1e2738] border-2 border-[#2a2f3e]"
                  }`}
                >
                  <div className="font-bold text-[#5b8def] text-lg">
                    {formatDate(month.date)}
                  </div>

                  <div className="flex items-center gap-2.5">
                    {isEditing ? (
                      <>
                        <input
                          type="number"
                          defaultValue={month.deposit}
                          id={`deposit-${index}`}
                          placeholder="R$ 0,00"
                          min="0"
                          step="0.01"
                          className="flex-1 rounded-lg p-3 border-2 border-[#2a2f3e] text-base bg-[#1a1f2e] text-[#e4e6eb]"
                        />
                        <button
                          onClick={() => {
                            const input = document.getElementById(
                              `deposit-${index}`
                            );
                            updateMonthDeposit(index, input.value);
                          }}
                          className="rounded-lg px-4 py-2 text-sm bg-[#27ae60] text-white border-none cursor-pointer font-bold shadow-[0_2px_8px_rgba(39,174,96,0.3)]"
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
                          className="flex-1 rounded-lg p-3 border-2 border-[#2a2f3e] text-base bg-[#1a1f2e] text-[#e4e6eb] opacity-50"
                        />
                        <button
                          onClick={() => setEditingMonth(index)}
                          className="rounded-lg px-4 py-2 text-sm bg-[#5a6c7d] text-white border-none cursor-pointer font-bold shadow-[0_2px_8px_rgba(90,108,125,0.3)]"
                        >
                          Editar
                        </button>
                      </>
                    )}
                  </div>

                  <div className="text-right text-xl font-bold text-white">
                    {formatCurrency(month.balance)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showConfigModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowConfigModal(false)}
        >
          <div
            className="bg-[#1a1f2e] rounded-2xl border border-[#2a2f3e] p-8 w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 mb-8 pb-5 border-b border-[#2a2f3e]">
              <span className="text-2xl">⚙️</span>
              <h2 className="m-0 text-white text-2xl">
                Configurações Iniciais
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#8b92a7] mb-2">
                  Saldo Inicial (R$)
                </label>
                <input
                  type="number"
                  value={startingBalance}
                  onChange={(e) => setStartingBalance(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-[#252b3b] border border-[#2a2f3e] rounded-lg text-white outline-none focus:border-[#667eea] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#8b92a7] mb-2">
                  Prazo Desejado (meses)
                </label>
                <input
                  type="number"
                  value={targetMonths}
                  onChange={(e) => setTargetMonths(e.target.value)}
                  min="1"
                  className="w-full px-4 py-3 bg-[#252b3b] border border-[#2a2f3e] rounded-lg text-white outline-none focus:border-[#667eea] transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="flex-1 px-6 py-3 bg-[#5a6c7d] text-white text-sm font-bold rounded-lg transition-all hover:bg-[#4a5c6d]"
                >
                  Cancelar
                </button>
                <button
                  onClick={initializePlanning}
                  className="flex-1 px-6 py-3 bg-[#667eea] text-white text-sm font-bold rounded-lg shadow-[0_4px_12px_rgba(102,126,234,0.3)] transition-all hover:bg-[#5568d3]"
                >
                  Iniciar Planejamento
                </button>
              </div>

              <button
                onClick={resetAll}
                className="w-full mt-4 px-6 py-3 bg-gradient-to-br from-[#f39c12] to-[#e74c3c] text-white text-sm font-bold rounded-lg shadow-[0_4px_12px_rgba(243,156,18,0.3)] transition-all"
              >
                🔄 Resetar Tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jornada100k;
