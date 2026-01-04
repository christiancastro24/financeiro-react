import React, { useState, useEffect, useRef } from "react";

const Investimentos = () => {
  const [activeView, setActiveView] = useState("my-investments");
  const myInvestmentChartRef = useRef(null);
  const simulatorChartRef = useRef(null);
  const myInvestmentChartInstance = useRef(null);
  const simulatorChartInstance = useRef(null);

  // Simulador
  const [initialAmount, setInitialAmount] = useState(1000);
  const [monthlyAmount, setMonthlyAmount] = useState(500);
  const [investmentPeriod, setInvestmentPeriod] = useState(12);
  const [cdiPercentage, setCdiPercentage] = useState(100);

  const [transactions] = useState(() => {
    const saved = localStorage.getItem("financialData");
    return saved ? JSON.parse(saved) : [];
  });

  const CDI_RATE_ANNUAL = 0.1175; // 11.75% ao ano

  const formatCurrency = (value) => {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Calcular investimentos
  const getInvestments = () => {
    return transactions.filter(
      (t) => t.type === "expense" && t.category === "Investimentos" && t.paid
    );
  };

  const investments = getInvestments();
  const totalInvested = investments.reduce((sum, inv) => sum + inv.value, 0);

  // Calcular projeção
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

  // Projeção 12 meses dos investimentos
  const projection12m = calculateInvestmentProjection(
    totalInvested,
    0,
    12,
    100
  );
  const gain12m = projection12m - totalInvested;

  // Dados para gráfico dos meus investimentos
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

  // Dados para tabela de projeção
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

  // Dados para gráfico do simulador
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

  // Cálculos do simulador
  const simTotalInvested = initialAmount + monthlyAmount * investmentPeriod;
  const simFinalAmount = calculateInvestmentProjection(
    initialAmount,
    monthlyAmount,
    investmentPeriod,
    cdiPercentage
  );
  const simEarnings = simFinalAmount - simTotalInvested;

  const projectionTable = getProjectionTable();

  // Criar gráfico dos meus investimentos
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
                color: "#e4e6eb",
                font: { size: 13, weight: "600" },
                padding: 15,
                usePointStyle: true,
              },
            },
            tooltip: {
              backgroundColor: "rgba(44, 62, 80, 0.95)",
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
                color: "#8b92a7",
                font: { size: 11 },
              },
              grid: {
                color: "rgba(255, 255, 255, 0.05)",
              },
            },
            x: {
              ticks: {
                color: "#8b92a7",
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
  }, [activeView, totalInvested]);

  // Criar gráfico do simulador
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
                color: "#e4e6eb",
                font: { size: 13, weight: "600" },
                padding: 15,
                usePointStyle: true,
              },
            },
            tooltip: {
              backgroundColor: "rgba(44, 62, 80, 0.95)",
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
                color: "#8b92a7",
                font: { size: 11 },
              },
              grid: {
                color: "rgba(255, 255, 255, 0.05)",
              },
            },
            x: {
              ticks: {
                color: "#8b92a7",
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
  ]);

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
            Investimentos
          </h2>
          <div className="text-[#8b92a7] text-[14px]">
            Gestão de receitas e despesas
          </div>
        </div>
      </div>

      {/* Toggle Abas */}
      <div className="flex gap-3" style={{ marginBottom: "30px" }}>
        <button
          onClick={() => setActiveView("my-investments")}
          className={`flex-1 rounded-lg cursor-pointer transition-all ${
            activeView === "my-investments"
              ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white"
              : "bg-[#1a1f2e] border border-[#2a2f3e] text-[#8b92a7] hover:border-[#5b8def]"
          }`}
          style={{
            padding: "14px 20px",
            fontSize: "15px",
            fontWeight: "bold",
            borderRadius: "0.5rem",
            color: "white",
          }}
        >
          💎 Meus Investimentos
        </button>
        <button
          onClick={() => setActiveView("simulator")}
          className={`flex-1 rounded-lg cursor-pointer transition-all ${
            activeView === "simulator"
              ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white"
              : "bg-[#1a1f2e] border border-[#2a2f3e] text-[#8b92a7] hover:border-[#5b8def]"
          }`}
          style={{
            padding: "14px 20px",
            fontSize: "15px",
            fontWeight: "bold",
            borderRadius: "0.5rem",
            color: "white",
          }}
        >
          🧮 Simulador
        </button>
      </div>

      {/* MEUS INVESTIMENTOS */}
      {activeView === "my-investments" && (
        <div>
          {/* Cards de resumo */}
          <div
            className="grid grid-cols-3 gap-12"
            style={{ marginBottom: "35px", gap: "12px" }}
          >
            <div
              className="rounded-xl border border-[#2a2f3e] overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #1a1f2e 0%, #252b3b 100%)",
                borderRadius: "1rem",
              }}
            >
              <div style={{ padding: "24px" }}>
                <div
                  className="flex items-center gap-2"
                  style={{ marginBottom: "16px" }}
                >
                  <div className="text-[35px]">💰</div>
                  <div
                    className="text-[#8b92a7] text-[13px] uppercase font-bold"
                    style={{
                      letterSpacing: "1px",
                      fontWeight: "bold",
                      paddingLeft: "5px",
                    }}
                  >
                    Total Investido
                  </div>
                </div>
                <div
                  className="text-[32px] font-bold text-white"
                  style={{ fontWeight: "bold", letterSpacing: "-0.5px" }}
                >
                  R$ {formatCurrency(totalInvested)}
                </div>
              </div>
            </div>

            <div
              className="rounded-xl border border-[#2a2f3e] overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #1a1f2e 0%, #252b3b 100%)",
                borderRadius: "1rem",
              }}
            >
              <div style={{ padding: "24px" }}>
                <div
                  className="flex items-center gap-2"
                  style={{ marginBottom: "16px" }}
                >
                  <div className="text-[35px]">📊</div>
                  <div
                    className="text-[#8b92a7] text-[13px] uppercase font-bold"
                    style={{
                      letterSpacing: "1px",
                      fontWeight: "bold",
                      paddingLeft: "5px",
                    }}
                  >
                    Projeção 12 meses
                  </div>
                </div>
                <div
                  className="text-[32px] font-bold text-[#5b8def]"
                  style={{ fontWeight: "bold", letterSpacing: "-0.5px" }}
                >
                  R$ {formatCurrency(projection12m)}
                </div>
                <div
                  className="text-[#27ae60] text-[12px] font-bold"
                  style={{ marginTop: "8px", fontWeight: "bold" }}
                >
                  +R$ {formatCurrency(gain12m)} de rendimento
                </div>
              </div>
            </div>

            <div
              className="rounded-xl border border-[#2a2f3e] overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #1a1f2e 0%, #252b3b 100%)",
                borderRadius: "1rem",
              }}
            >
              <div style={{ padding: "24px" }}>
                <div
                  className="flex items-center gap-2"
                  style={{ marginBottom: "16px" }}
                >
                  <div className="text-[35px] pl-4">📈</div>
                  <div
                    className="text-[#8b92a7] text-[13px] uppercase font-bold"
                    style={{
                      letterSpacing: "1px",
                      fontWeight: "bold",
                      paddingLeft: "5px",
                    }}
                  >
                    Rentabilidade (CDI)
                  </div>
                </div>
                <div
                  className="text-[32px] font-bold text-[#9b59b6] relative left-4"
                  style={{ fontWeight: "bold", letterSpacing: "-0.5px" }}
                >
                  100%
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico */}
          <div
            className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e]"
            style={{
              padding: "28px",
              marginBottom: "30px",
              borderRadius: "0.5rem",
            }}
          >
            <h3
              className="text-[18px] font-bold text-white"
              style={{
                marginBottom: "20px",
                fontWeight: "bold",
                color: "white",
              }}
            >
              📈 Projeção de Crescimento - Meus Investimentos
            </h3>
            <canvas
              ref={myInvestmentChartRef}
              style={{ maxHeight: "300px" }}
            ></canvas>
          </div>

          {/* Tabela de Projeção */}
          <div
            className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e]"
            style={{
              padding: "28px",
              marginBottom: "30px",
              borderRadius: "0.5rem",
            }}
          >
            <h3
              className="text-[18px] font-bold text-white"
              style={{ marginBottom: "20px", fontWeight: "bold" }}
            >
              📊 Tabela de Projeção Mensal
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2f3e]">
                    <th
                      className="text-left text-[#8b92a7] text-[12px] uppercase"
                      style={{ padding: "12px", fontWeight: "bold" }}
                    >
                      Mês
                    </th>
                    <th
                      className="text-left text-[#8b92a7] text-[12px] uppercase"
                      style={{ padding: "12px", fontWeight: "bold" }}
                    >
                      Juros
                    </th>
                    <th
                      className="text-left text-[#8b92a7] text-[12px] uppercase"
                      style={{ padding: "12px", fontWeight: "bold" }}
                    >
                      Total Investido
                    </th>
                    <th
                      className="text-left text-[#8b92a7] text-[12px] uppercase"
                      style={{ padding: "12px", fontWeight: "bold" }}
                    >
                      Total Juros
                    </th>
                    <th
                      className="text-left text-[#8b92a7] text-[12px] uppercase"
                      style={{ padding: "12px", fontWeight: "bold" }}
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
                        className="text-center text-[#8b92a7]"
                        style={{ padding: "40px" }}
                      >
                        Nenhum investimento registrado ainda.
                      </td>
                    </tr>
                  ) : (
                    projectionTable.map((row) => (
                      <tr key={row.month} className="border-b border-[#2a2f3e]">
                        <td className="text-white" style={{ padding: "12px" }}>
                          {row.month}
                        </td>
                        <td
                          className="text-[#27ae60]"
                          style={{ padding: "12px" }}
                        >
                          R$ {formatCurrency(row.interest)}
                        </td>
                        <td
                          className="text-[#5b8def]"
                          style={{ padding: "12px" }}
                        >
                          R$ {formatCurrency(row.totalInvested)}
                        </td>
                        <td
                          className="text-[#27ae60]"
                          style={{ padding: "12px" }}
                        >
                          R$ {formatCurrency(row.totalInterest)}
                        </td>
                        <td
                          className="text-[#9b59b6] font-bold"
                          style={{ padding: "12px", fontWeight: "bold" }}
                        >
                          R$ {formatCurrency(row.accumulated)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Histórico de Investimentos */}
          <div
            className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e]"
            style={{ padding: "28px", borderRadius: "0.5rem" }}
          >
            <h3
              className="text-[18px] font-bold text-white"
              style={{ marginBottom: "20px", fontWeight: "bold" }}
            >
              💼 Histórico de Investimentos
            </h3>
            {investments.length === 0 ? (
              <div
                className="text-center bg-[#252b3b] rounded-lg"
                style={{ padding: "60px 20px" }}
              >
                <div className="text-[48px]" style={{ marginBottom: "16px" }}>
                  💎
                </div>
                <p className="text-[#8b92a7]">
                  Nenhum investimento registrado ainda.
                  <br />
                  Cadastre investimentos na categoria "Investimentos" no
                  Dashboard.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {investments
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((inv) => (
                    <div
                      key={inv.id}
                      className="bg-[#252b3b] rounded-lg border border-[#2a2f3e] hover:border-[#5b8def] transition-all"
                      style={{ padding: "20px", borderRadius: "0.5rem" }}
                    >
                      <div
                        className="flex justify-between items-start"
                        style={{ marginBottom: "12px" }}
                      >
                        <div
                          className="text-white font-bold"
                          style={{ fontWeight: "bold" }}
                        >
                          {inv.title}
                        </div>
                        <div className="text-[#8b92a7] text-[12px]">
                          {new Date(inv.date).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                      <div
                        className="text-[#27ae60] text-[20px] font-bold"
                        style={{ marginBottom: "8px", fontWeight: "bold" }}
                      >
                        R$ {formatCurrency(inv.value)}
                      </div>
                      <div
                        className="inline-block bg-[rgba(91,141,239,0.2)] text-[#5b8def] rounded text-[12px]"
                        style={{ padding: "4px 10px", borderRadius: "0.5rem" }}
                      >
                        {inv.category}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SIMULADOR */}
      {activeView === "simulator" && (
        <div>
          {/* Controles do Simulador */}
          <div
            className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e]"
            style={{
              padding: "28px",
              marginBottom: "30px",
              borderRadius: "0.5rem",
            }}
          >
            <h3
              className="text-[18px] font-bold text-white"
              style={{ marginBottom: "20px", fontWeight: "bold" }}
            >
              💡 Simulador de Investimentos
            </h3>
            <div
              className="grid grid-cols-4 gap-4"
              style={{ marginBottom: "24px", gap: "16px", color: "white" }}
            >
              <div>
                <label
                  className="text-[#8b92a7] text-[13px] block"
                  style={{ marginBottom: "8px", color: "white" }}
                >
                  Aporte Inicial (R$)
                </label>
                <input
                  type="number"
                  value={initialAmount}
                  onChange={(e) =>
                    setInitialAmount(parseFloat(e.target.value) || 0)
                  }
                  className="w-full bg-[#252b3b] border border-[#2a2f3e] text-white rounded-lg"
                  style={{
                    padding: "10px 12px",
                    fontSize: "14px",
                    borderRadius: "0.5rem",
                    color: "white",
                  }}
                  step="100"
                  min="0"
                />
              </div>
              <div>
                <label
                  className="text-[#8b92a7] text-[13px] block"
                  style={{ marginBottom: "8px", color: "white" }}
                >
                  Aporte Mensal (R$)
                </label>
                <input
                  type="number"
                  value={monthlyAmount}
                  onChange={(e) =>
                    setMonthlyAmount(parseFloat(e.target.value) || 0)
                  }
                  className="w-full bg-[#252b3b] border border-[#2a2f3e] text-white rounded-lg"
                  style={{
                    padding: "10px 12px",
                    fontSize: "14px",
                    borderRadius: "0.5rem",
                    color: "white",
                  }}
                  step="50"
                  min="0"
                />
              </div>
              <div>
                <label
                  className="text-[#8b92a7] text-[13px] block"
                  style={{ marginBottom: "8px", color: "white" }}
                >
                  Período (meses)
                </label>
                <input
                  type="number"
                  value={investmentPeriod}
                  onChange={(e) =>
                    setInvestmentPeriod(parseInt(e.target.value) || 12)
                  }
                  className="w-full bg-[#252b3b] border border-[#2a2f3e] text-white rounded-lg"
                  style={{
                    padding: "10px 12px",
                    fontSize: "14px",
                    borderRadius: "0.5rem",
                    color: "white",
                  }}
                  min="1"
                  max="360"
                />
              </div>
              <div>
                <label
                  className="text-[#8b92a7] text-[13px] block"
                  style={{ marginBottom: "8px", color: "white" }}
                >
                  % do CDI
                </label>
                <input
                  type="number"
                  value={cdiPercentage}
                  onChange={(e) =>
                    setCdiPercentage(parseInt(e.target.value) || 100)
                  }
                  className="w-full bg-[#252b3b] border border-[#2a2f3e] text-white rounded-lg"
                  style={{
                    padding: "10px 12px",
                    fontSize: "14px",
                    borderRadius: "0.5rem",
                    color: "white",
                  }}
                  step="5"
                  min="0"
                  max="150"
                />
              </div>
            </div>

            {/* Resultados */}
            <div
              className="grid grid-cols-3 gap-4"
              style={{ marginBottom: "0" }}
            >
              <div
                className="text-center rounded-xl overflow-hidden"
                style={{
                  padding: "24px",
                  background:
                    "linear-gradient(135deg, rgba(91, 141, 239, 0.15) 0%, rgba(91, 141, 239, 0.05) 100%)",
                  border: "1px solid rgba(91, 141, 239, 0.2)",
                  borderRadius: "1rem",
                }}
              >
                <div
                  className="text-[#8b92a7] text-[11px] uppercase font-bold"
                  style={{
                    marginBottom: "12px",
                    letterSpacing: "1px",
                    fontWeight: "bold",
                  }}
                >
                  Total Investido:
                </div>
                <div
                  className="text-white text-[28px] font-bold"
                  style={{ fontWeight: "bold", letterSpacing: "-0.5px" }}
                >
                  R$ {formatCurrency(simTotalInvested)}
                </div>
              </div>
              <div
                className="text-center rounded-xl overflow-hidden"
                style={{
                  padding: "24px",
                  background:
                    "linear-gradient(135deg, rgba(39, 174, 96, 0.15) 0%, rgba(39, 174, 96, 0.05) 100%)",
                  border: "1px solid rgba(39, 174, 96, 0.2)",
                  borderRadius: "1rem",
                }}
              >
                <div
                  className="text-[#8b92a7] text-[11px] uppercase font-bold"
                  style={{
                    marginBottom: "12px",
                    letterSpacing: "1px",
                    fontWeight: "bold",
                  }}
                >
                  Rendimento:
                </div>
                <div
                  className="text-[#27ae60] text-[28px] font-bold"
                  style={{ fontWeight: "bold", letterSpacing: "-0.5px" }}
                >
                  R$ {formatCurrency(simEarnings)}
                </div>
              </div>
              <div
                className="text-center rounded-xl overflow-hidden"
                style={{
                  padding: "24px",
                  background:
                    "linear-gradient(135deg, rgba(155, 89, 182, 0.2) 0%, rgba(155, 89, 182, 0.08) 100%)",
                  border: "1px solid rgba(155, 89, 182, 0.3)",
                  borderRadius: "1rem",
                }}
              >
                <div
                  className="text-[#8b92a7] text-[11px] uppercase font-bold"
                  style={{
                    marginBottom: "12px",
                    letterSpacing: "1px",
                    fontWeight: "bold",
                  }}
                >
                  Montante Final:
                </div>
                <div
                  className="text-[#9b59b6] text-[28px] font-bold"
                  style={{ fontWeight: "bold", letterSpacing: "-0.5px" }}
                >
                  R$ {formatCurrency(simFinalAmount)}
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico do Simulador */}
          <div
            className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e]"
            style={{ padding: "28px", borderRadius: "0.5rem" }}
          >
            <h3
              className="text-[18px] font-bold text-white"
              style={{ marginBottom: "20px", fontWeight: "bold" }}
            >
              📈 Projeção de Crescimento - Simulador
            </h3>
            <canvas
              ref={simulatorChartRef}
              style={{ maxHeight: "400px" }}
            ></canvas>
          </div>
        </div>
      )}
    </div>
  );
};

export default Investimentos;
