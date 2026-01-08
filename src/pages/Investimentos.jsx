import React, { useState, useEffect, useRef } from "react";

const Investimentos = () => {
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
  };

  const [activeView, setActiveView] = useState("my-investments");
  const myInvestmentChartRef = useRef(null);
  const simulatorChartRef = useRef(null);
  const myInvestmentChartInstance = useRef(null);
  const simulatorChartInstance = useRef(null);

  const [initialAmount, setInitialAmount] = useState(1000);
  const [monthlyAmount, setMonthlyAmount] = useState(500);
  const [investmentPeriod, setInvestmentPeriod] = useState(12);
  const [cdiPercentage, setCdiPercentage] = useState(100);

  const [transactions] = useState(() => {
    const saved = localStorage.getItem("financialData");
    return saved ? JSON.parse(saved) : [];
  });

  const CDI_RATE_ANNUAL = 0.1175;

  const formatCurrency = (value) => {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getInvestments = () => {
    return transactions.filter(
      (t) => t.type === "expense" && t.category === "Investimentos" && t.paid
    );
  };

  const investments = getInvestments();
  const totalInvested = investments.reduce((sum, inv) => sum + inv.value, 0);

  const calculateInvestmentProjection = (
    initial,
    monthly,
    months,
    cdiPercent
  ) => {
    const monthlyRate =
      Math.pow(1 + CDI_RATE_ANNUAL * (cdiPercent / 100), 1 / 12) - 1;
    let total = initial;

    for (let i = 0; i < months; i++) {
      total = total * (1 + monthlyRate) + monthly;
    }

    return total;
  };

  const projection12m = calculateInvestmentProjection(
    totalInvested,
    0,
    12,
    100
  );
  const gain12m = projection12m - totalInvested;

  const getMyInvestmentChartData = () => {
    const monthlyRate = Math.pow(1 + CDI_RATE_ANNUAL, 1 / 12) - 1;
    const labels = ["Hoje"];
    const investedData = [totalInvested];
    const projectionData = [totalInvested];
    let currentAmount = totalInvested;

    for (let i = 1; i <= 12; i++) {
      currentAmount = currentAmount * (1 + monthlyRate);
      labels.push(`${i}m`);
      investedData.push(totalInvested);
      projectionData.push(currentAmount);
    }

    return { labels, investedData, projectionData };
  };

  const getProjectionTable = () => {
    if (totalInvested === 0) return [];

    const monthlyRate = Math.pow(1 + CDI_RATE_ANNUAL, 1 / 12) - 1;
    const rows = [];
    let accumulated = totalInvested;
    let totalInterest = 0;

    for (let i = 1; i <= 12; i++) {
      const monthInterest = accumulated * monthlyRate;
      totalInterest += monthInterest;
      accumulated += monthInterest;

      rows.push({
        month: i,
        interest: monthInterest,
        totalInvested: totalInvested,
        totalInterest: totalInterest,
        accumulated: accumulated,
      });
    }

    return rows;
  };

  const getSimulatorChartData = () => {
    const monthlyRate =
      Math.pow(1 + CDI_RATE_ANNUAL * (cdiPercentage / 100), 1 / 12) - 1;
    const labels = ["Início"];
    const investedData = [initialAmount];
    const projectionData = [initialAmount];
    let totalInvestedSim = initialAmount;
    let totalWithYield = initialAmount;

    for (let i = 1; i <= investmentPeriod; i++) {
      totalInvestedSim += monthlyAmount;
      totalWithYield = totalWithYield * (1 + monthlyRate) + monthlyAmount;

      labels.push(`Mês ${i}`);
      investedData.push(totalInvestedSim);
      projectionData.push(totalWithYield);
    }

    return { labels, investedData, projectionData };
  };

  const simTotalInvested = initialAmount + monthlyAmount * investmentPeriod;
  const simFinalAmount = calculateInvestmentProjection(
    initialAmount,
    monthlyAmount,
    investmentPeriod,
    cdiPercentage
  );
  const simEarnings = simFinalAmount - simTotalInvested;

  const projectionTable = getProjectionTable();

  useEffect(() => {
    if (activeView === "my-investments" && myInvestmentChartRef.current) {
      const chartData = getMyInvestmentChartData();

      if (myInvestmentChartInstance.current) {
        myInvestmentChartInstance.current.destroy();
      }

      const ctx = myInvestmentChartRef.current.getContext("2d");
      myInvestmentChartInstance.current = new Chart.Chart(ctx, {
        type: "line",
        data: {
          labels: chartData.labels,
          datasets: [
            {
              label: "Investido",
              data: chartData.investedData,
              borderColor: "#95a5a6",
              backgroundColor: "rgba(149, 165, 166, 0.1)",
              borderWidth: 2,
              tension: 0.4,
              fill: true,
            },
            {
              label: "Projeção com CDI 100%",
              data: chartData.projectionData,
              borderColor: "#9b59b6",
              backgroundColor: "rgba(155, 89, 182, 0.1)",
              borderWidth: 3,
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: true,
              position: "top",
              labels: {
                color: colors.textPrimary, // AJUSTE DINÂMICO
                font: { size: 13, weight: "600" },
                padding: 15,
                usePointStyle: true,
              },
            },
            tooltip: {
              backgroundColor: colors.secondary, // AJUSTE DINÂMICO
              titleColor: colors.textPrimary,
              bodyColor: colors.textPrimary,
              padding: 12,
              callbacks: {
                label: function (context) {
                  return (
                    context.dataset.label +
                    ": R$ " +
                    formatCurrency(context.parsed.y)
                  );
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return "R$ " + formatCurrency(value);
                },
                color: colors.textSecondary, // AJUSTE DINÂMICO
                font: { size: 11 },
              },
              grid: {
                color:
                  theme === "dark"
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(0, 0, 0, 0.05)",
              },
            },
            x: {
              ticks: {
                color: colors.textSecondary, // AJUSTE DINÂMICO
                font: { size: 11 },
              },
              grid: {
                display: false,
              },
            },
          },
        },
      });
    }

    return () => {
      if (myInvestmentChartInstance.current) {
        myInvestmentChartInstance.current.destroy();
      }
    };
  }, [activeView, totalInvested, theme]);

  useEffect(() => {
    if (activeView === "simulator" && simulatorChartRef.current) {
      const chartData = getSimulatorChartData();

      if (simulatorChartInstance.current) {
        simulatorChartInstance.current.destroy();
      }

      const ctx = simulatorChartRef.current.getContext("2d");
      simulatorChartInstance.current = new Chart.Chart(ctx, {
        type: "line",
        data: {
          labels: chartData.labels,
          datasets: [
            {
              label: "Total Investido",
              data: chartData.investedData,
              borderColor: "#95a5a6",
              backgroundColor: "rgba(149, 165, 166, 0.1)",
              borderWidth: 2,
              tension: 0.4,
              fill: true,
            },
            {
              label: "Projeção com Rendimento",
              data: chartData.projectionData,
              borderColor: "#9b59b6",
              backgroundColor: "rgba(155, 89, 182, 0.1)",
              borderWidth: 3,
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: true,
              position: "top",
              labels: {
                color: colors.textPrimary, // AJUSTE DINÂMICO
                font: { size: 13, weight: "600" },
                padding: 15,
                usePointStyle: true,
              },
            },
            tooltip: {
              backgroundColor: colors.secondary, // AJUSTE DINÂMICO
              titleColor: colors.textPrimary,
              bodyColor: colors.textPrimary,
              padding: 12,
              callbacks: {
                label: function (context) {
                  return (
                    context.dataset.label +
                    ": R$ " +
                    formatCurrency(context.parsed.y)
                  );
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return "R$ " + formatCurrency(value);
                },
                color: colors.textSecondary, // AJUSTE DINÂMICO
                font: { size: 11 },
              },
              grid: {
                color:
                  theme === "dark"
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(0, 0, 0, 0.05)",
              },
            },
            x: {
              ticks: {
                color: colors.textSecondary, // AJUSTE DINÂMICO
                font: { size: 11 },
                maxRotation: 45,
                minRotation: 45,
              },
              grid: {
                display: false,
              },
            },
          },
        },
      });
    }

    return () => {
      if (simulatorChartInstance.current) {
        simulatorChartInstance.current.destroy();
      }
    };
  }, [
    activeView,
    initialAmount,
    monthlyAmount,
    investmentPeriod,
    cdiPercentage,
    theme,
  ]);

  return (
    <div
      className="ml-[260px] flex-1 p-10 transition-colors duration-300"
      style={{ backgroundColor: colors.primary }}
    >
      <div className="flex justify-between items-center mb-9">
        <div>
          <h2
            className="text-[28px] font-bold mb-1.5"
            style={{ color: colors.textPrimary }}
          >
            Investimentos
          </h2>
          <div className="text-sm" style={{ color: colors.textSecondary }}>
            Gestão de receitas e despesas
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-8">
        <button
          onClick={() => setActiveView("my-investments")}
          className={`flex-1 rounded-lg cursor-pointer transition-all py-3.5 px-5 text-[15px] font-bold ${
            activeView === "my-investments"
              ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white"
              : "border hover:border-[#5b8def]"
          }`}
          style={
            activeView !== "my-investments"
              ? {
                  backgroundColor: colors.secondary,
                  borderColor: colors.border,
                  color: colors.textSecondary,
                }
              : {}
          }
        >
          💎 Meus Investimentos
        </button>
        <button
          onClick={() => setActiveView("simulator")}
          className={`flex-1 rounded-lg cursor-pointer transition-all py-3.5 px-5 text-[15px] font-bold ${
            activeView === "simulator"
              ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white"
              : "border hover:border-[#5b8def]"
          }`}
          style={
            activeView !== "simulator"
              ? {
                  backgroundColor: colors.secondary,
                  borderColor: colors.border,
                  color: colors.textSecondary,
                }
              : {}
          }
        >
          🧮 Simulador
        </button>
      </div>

      {activeView === "my-investments" && (
        <div>
          <div className="grid grid-cols-3 gap-3 mb-9">
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                backgroundColor: colors.secondary,
                borderColor: colors.border,
              }}
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-[35px]">💰</div>
                  <div
                    className="text-[13px] uppercase font-bold tracking-wide pl-1"
                    style={{ color: colors.textSecondary }}
                  >
                    Total Investido
                  </div>
                </div>
                <div
                  className="text-[32px] font-bold tracking-tight"
                  style={{ color: colors.textPrimary }}
                >
                  R$ {formatCurrency(totalInvested)}
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                backgroundColor: colors.secondary,
                borderColor: colors.border,
              }}
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-[35px]">📊</div>
                  <div
                    className="text-[13px] uppercase font-bold tracking-wide pl-1"
                    style={{ color: colors.textSecondary }}
                  >
                    Projeção 12 meses
                  </div>
                </div>
                <div className="text-[32px] font-bold text-[#5b8def] tracking-tight">
                  R$ {formatCurrency(projection12m)}
                </div>
                <div className="text-[#27ae60] text-xs font-bold mt-2">
                  +R$ {formatCurrency(gain12m)} de rendimento
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                backgroundColor: colors.secondary,
                borderColor: colors.border,
              }}
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-[35px] pl-4">📈</div>
                  <div
                    className="text-[13px] uppercase font-bold tracking-wide pl-1"
                    style={{ color: colors.textSecondary }}
                  >
                    Rentabilidade (CDI)
                  </div>
                </div>
                <div className="text-[32px] font-bold text-[#9b59b6] tracking-tight pl-4">
                  100%
                </div>
              </div>
            </div>
          </div>

          <div
            className="rounded-xl border p-7 mb-8"
            style={{
              backgroundColor: colors.secondary,
              borderColor: colors.border,
            }}
          >
            <h3
              className="text-lg font-bold mb-5"
              style={{ color: colors.textPrimary }}
            >
              📈 Projeção de Crescimento - Meus Investimentos
            </h3>
            <canvas
              ref={myInvestmentChartRef}
              className="max-h-[300px]"
            ></canvas>
          </div>

          <div
            className="rounded-xl border p-7 mb-8"
            style={{
              backgroundColor: colors.secondary,
              borderColor: colors.border,
            }}
          >
            <h3
              className="text-lg font-bold mb-5"
              style={{ color: colors.textPrimary }}
            >
              📊 Tabela de Projeção Mensal
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className="border-b"
                    style={{ borderColor: colors.border }}
                  >
                    <th
                      className="text-left text-xs uppercase p-3 font-bold"
                      style={{ color: colors.textSecondary }}
                    >
                      Mês
                    </th>
                    <th
                      className="text-left text-xs uppercase p-3 font-bold"
                      style={{ color: colors.textSecondary }}
                    >
                      Juros
                    </th>
                    <th
                      className="text-left text-xs uppercase p-3 font-bold"
                      style={{ color: colors.textSecondary }}
                    >
                      Total Investido
                    </th>
                    <th
                      className="text-left text-xs uppercase p-3 font-bold"
                      style={{ color: colors.textSecondary }}
                    >
                      Total Juros
                    </th>
                    <th
                      className="text-left text-xs uppercase p-3 font-bold"
                      style={{ color: colors.textSecondary }}
                    >
                      Total Acumulado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {projectionTable.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-10"
                        style={{ color: colors.textSecondary }}
                      >
                        Nenhum investimento registrado ainda.
                      </td>
                    </tr>
                  ) : (
                    projectionTable.map((row) => (
                      <tr
                        key={row.month}
                        className="border-b"
                        style={{ borderColor: colors.border }}
                      >
                        <td
                          className="p-3"
                          style={{ color: colors.textPrimary }}
                        >
                          {row.month}
                        </td>
                        <td className="text-[#27ae60] p-3">
                          R$ {formatCurrency(row.interest)}
                        </td>
                        <td className="text-[#5b8def] p-3">
                          R$ {formatCurrency(row.totalInvested)}
                        </td>
                        <td className="text-[#27ae60] p-3">
                          R$ {formatCurrency(row.totalInterest)}
                        </td>
                        <td className="text-[#9b59b6] font-bold p-3">
                          R$ {formatCurrency(row.accumulated)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div
            className="rounded-xl border p-7"
            style={{
              backgroundColor: colors.secondary,
              borderColor: colors.border,
            }}
          >
            <h3
              className="text-lg font-bold mb-5"
              style={{ color: colors.textPrimary }}
            >
              💼 Histórico de Investimentos
            </h3>
            {investments.length === 0 ? (
              <div
                className="text-center rounded-lg py-15 px-5"
                style={{ backgroundColor: colors.tertiary }}
              >
                <div className="text-5xl mb-4">💎</div>
                <p style={{ color: colors.textSecondary }}>
                  Nenhum investimento registrado ainda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {investments
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((inv) => (
                    <div
                      key={inv.id}
                      className="rounded-lg border transition-all p-5"
                      style={{
                        backgroundColor: colors.tertiary,
                        borderColor: colors.border,
                      }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div
                          className="font-bold"
                          style={{ color: colors.textPrimary }}
                        >
                          {inv.title}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: colors.textSecondary }}
                        >
                          {new Date(inv.date).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                      <div className="text-[#27ae60] text-xl font-bold mb-2">
                        R$ {formatCurrency(inv.value)}
                      </div>
                      <div className="inline-block bg-[rgba(91,141,239,0.2)] text-[#5b8def] rounded text-xs py-1 px-2.5">
                        {inv.category}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeView === "simulator" && (
        <div>
          <div
            className="rounded-xl border p-7 mb-8"
            style={{
              backgroundColor: colors.secondary,
              borderColor: colors.border,
            }}
          >
            <h3
              className="text-lg font-bold mb-5"
              style={{ color: colors.textPrimary }}
            >
              💡 Simulador de Investimentos
            </h3>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div>
                <label
                  className="text-[13px] block mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  Aporte Inicial (R$)
                </label>
                <input
                  type="number"
                  value={initialAmount}
                  onChange={(e) =>
                    setInitialAmount(parseFloat(e.target.value) || 0)
                  }
                  className="w-full border rounded-lg py-2.5 px-3 text-sm"
                  style={{
                    backgroundColor: colors.tertiary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                  step="100"
                  min="0"
                />
              </div>
              <div>
                <label
                  className="text-[13px] block mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  Aporte Mensal (R$)
                </label>
                <input
                  type="number"
                  value={monthlyAmount}
                  onChange={(e) =>
                    setMonthlyAmount(parseFloat(e.target.value) || 0)
                  }
                  className="w-full border rounded-lg py-2.5 px-3 text-sm"
                  style={{
                    backgroundColor: colors.tertiary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                  step="50"
                  min="0"
                />
              </div>
              <div>
                <label
                  className="text-[13px] block mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  Período (meses)
                </label>
                <input
                  type="number"
                  value={investmentPeriod}
                  onChange={(e) =>
                    setInvestmentPeriod(parseInt(e.target.value) || 12)
                  }
                  className="w-full border rounded-lg py-2.5 px-3 text-sm"
                  style={{
                    backgroundColor: colors.tertiary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                  min="1"
                  max="360"
                />
              </div>
              <div>
                <label
                  className="text-[13px] block mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  % do CDI
                </label>
                <input
                  type="number"
                  value={cdiPercentage}
                  onChange={(e) =>
                    setCdiPercentage(parseInt(e.target.value) || 100)
                  }
                  className="w-full border rounded-lg py-2.5 px-3 text-sm"
                  style={{
                    backgroundColor: colors.tertiary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                  step="5"
                  min="0"
                  max="150"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div
                className="text-center rounded-2xl overflow-hidden p-6 border"
                style={{
                  backgroundColor: "rgba(91,141,239,0.05)",
                  borderColor: "rgba(91,141,239,0.2)",
                }}
              >
                <div
                  className="text-[11px] uppercase font-bold mb-3 tracking-wide"
                  style={{ color: colors.textSecondary }}
                >
                  Total Investido:
                </div>
                <div
                  className="text-[28px] font-bold tracking-tight"
                  style={{ color: colors.textPrimary }}
                >
                  R$ {formatCurrency(simTotalInvested)}
                </div>
              </div>
              <div
                className="text-center rounded-2xl overflow-hidden p-6 border"
                style={{
                  backgroundColor: "rgba(39,174,96,0.05)",
                  borderColor: "rgba(39,174,96,0.2)",
                }}
              >
                <div
                  className="text-[11px] uppercase font-bold mb-3 tracking-wide"
                  style={{ color: colors.textSecondary }}
                >
                  Rendimento:
                </div>
                <div className="text-[#27ae60] text-[28px] font-bold tracking-tight">
                  R$ {formatCurrency(simEarnings)}
                </div>
              </div>
              <div
                className="text-center rounded-2xl overflow-hidden p-6 border"
                style={{
                  backgroundColor: "rgba(155,89,182,0.08)",
                  borderColor: "rgba(155,89,182,0.3)",
                }}
              >
                <div
                  className="text-[11px] uppercase font-bold mb-3 tracking-wide"
                  style={{ color: colors.textSecondary }}
                >
                  Montante Final:
                </div>
                <div className="text-[#9b59b6] text-[28px] font-bold tracking-tight">
                  R$ {formatCurrency(simFinalAmount)}
                </div>
              </div>
            </div>
          </div>

          <div
            className="rounded-xl border p-7"
            style={{
              backgroundColor: colors.secondary,
              borderColor: colors.border,
            }}
          >
            <h3
              className="text-lg font-bold mb-5"
              style={{ color: colors.textPrimary }}
            >
              📈 Projeção de Crescimento - Simulador
            </h3>
            <canvas ref={simulatorChartRef} className="max-h-[400px]"></canvas>
          </div>
        </div>
      )}
    </div>
  );
};

export default Investimentos;
