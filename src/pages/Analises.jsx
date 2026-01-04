import React, { useEffect, useRef, useState } from 'react';

const Analises = () => {
  const patrimonialChartRef = useRef(null);
  const categoryPieChartRef = useRef(null);
  const incomeExpenseChartRef = useRef(null);
  
  const [patrimonialChart, setPatrimonialChart] = useState(null);
  const [categoryPieChart, setCategoryPieChart] = useState(null);
  const [incomeExpenseChart, setIncomeExpenseChart] = useState(null);
  
  const [healthScore, setHealthScore] = useState({
    score: 0,
    message: '',
    color: '',
    savingsRate: 0,
    income: 0,
    expense: 0
  });

  // Carregar transações do localStorage
  const getTransactions = () => {
    const saved = localStorage.getItem('financialData');
    return saved ? JSON.parse(saved) : [];
  };

  // Formatar moeda
  const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Obter transações do mês atual
  const getMonthTransactions = () => {
    const transactions = getTransactions();
    const now = new Date();
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      return (
        tDate.getMonth() === now.getMonth() &&
        tDate.getFullYear() === now.getFullYear()
      );
    });
  };

  // Calcular score de saúde financeira
  useEffect(() => {
    const monthTransactions = getMonthTransactions();

    const income = monthTransactions
      .filter((t) => t.type === 'income' && t.paid)
      .reduce((sum, t) => sum + t.value, 0);

    const expense = monthTransactions
      .filter((t) => t.type === 'expense' && t.paid)
      .reduce((sum, t) => sum + t.value, 0);

    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

    let score = 0;
    let message = '';
    let color = '';

    if (savingsRate >= 30) {
      score = 100;
      message = 'Excelente! Você está poupando mais de 30% da sua renda.';
      color = '#27ae60';
    } else if (savingsRate >= 20) {
      score = 80;
      message = 'Muito bom! Continue mantendo essa taxa de poupança.';
      color = '#2ecc71';
    } else if (savingsRate >= 10) {
      score = 60;
      message = 'Bom! Tente aumentar sua taxa de poupança gradualmente.';
      color = '#f39c12';
    } else if (savingsRate >= 0) {
      score = 40;
      message = 'Atenção! Tente poupar pelo menos 10% da sua renda.';
      color = '#e67e22';
    } else {
      score = 20;
      message = 'Alerta! Suas despesas estão maiores que sua renda.';
      color = '#e74c3c';
    }

    setHealthScore({ score, message, color, savingsRate, income, expense });
  }, []);

  // Gráfico de Evolução Patrimonial
  useEffect(() => {
    if (!patrimonialChartRef.current) return;

    if (patrimonialChart) {
      patrimonialChart.destroy();
    }

    const transactions = getTransactions();
    const months = [];
    const balances = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      const monthTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date);
        return (
          tDate.getMonth() === date.getMonth() &&
          tDate.getFullYear() === date.getFullYear()
        );
      });

      const income = monthTransactions
        .filter((t) => t.type === 'income' && t.paid)
        .reduce((sum, t) => sum + t.value, 0);

      const expense = monthTransactions
        .filter((t) => t.type === 'expense' && t.paid)
        .reduce((sum, t) => sum + t.value, 0);

      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      months.push(`${monthNames[date.getMonth()]}/${date.getFullYear().toString().slice(-2)}`);

      const previousBalance = balances.length > 0 ? balances[balances.length - 1] : 0;
      balances.push(previousBalance + (income - expense));
    }

    const newChart = new Chart(patrimonialChartRef.current, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Patrimônio',
          data: balances,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#667eea',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(44, 62, 80, 0.95)',
            padding: 12,
            titleColor: '#fff',
            bodyColor: '#fff',
            callbacks: {
              label: function (context) {
                return 'Saldo: R$ ' + formatCurrency(context.parsed.y);
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return 'R$ ' + formatCurrency(value);
              },
              color: '#8b92a7',
              font: { size: 11 },
            },
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
          },
          x: {
            ticks: { color: '#8b92a7', font: { size: 11 } },
            grid: { display: false },
          },
        },
      },
    });

    setPatrimonialChart(newChart);

    return () => {
      if (newChart) newChart.destroy();
    };
  }, []);

  // Gráfico de Gastos por Categoria
  useEffect(() => {
    if (!categoryPieChartRef.current) return;

    if (categoryPieChart) {
      categoryPieChart.destroy();
    }

    const monthTransactions = getMonthTransactions();
    const categories = {};

    monthTransactions
      .filter((t) => t.type === 'expense' && t.paid)
      .forEach((t) => {
        categories[t.category] = (categories[t.category] || 0) + t.value;
      });

    const labels = Object.keys(categories);
    const data = Object.values(categories);

    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30cfd0'];

    if (labels.length === 0) return;

    const newChart = new Chart(categoryPieChartRef.current, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 3,
          borderColor: '#1a1f2e',
          hoverOffset: 10,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#e4e6eb',
              font: { size: 12 },
              padding: 15,
              generateLabels: function (chart) {
                const data = chart.data;
                return data.labels.map((label, i) => {
                  const value = data.datasets[0].data[i];
                  const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return {
                    text: `${label} (${percentage}%)`,
                    fillStyle: data.datasets[0].backgroundColor[i],
                    hidden: false,
                    index: i,
                  };
                });
              },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(44, 62, 80, 0.95)',
            padding: 12,
            callbacks: {
              label: function (context) {
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `R$ ${formatCurrency(value)} (${percentage}%)`;
              },
            },
          },
        },
      },
    });

    setCategoryPieChart(newChart);

    return () => {
      if (newChart) newChart.destroy();
    };
  }, []);

  // Gráfico de Receitas vs Despesas
  useEffect(() => {
    if (!incomeExpenseChartRef.current) return;

    if (incomeExpenseChart) {
      incomeExpenseChart.destroy();
    }

    const transactions = getTransactions();
    const months = [];
    const incomes = [];
    const expenses = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      const monthTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date);
        return (
          tDate.getMonth() === date.getMonth() &&
          tDate.getFullYear() === date.getFullYear()
        );
      });

      const income = monthTransactions
        .filter((t) => t.type === 'income' && t.paid)
        .reduce((sum, t) => sum + t.value, 0);

      const expense = monthTransactions
        .filter((t) => t.type === 'expense' && t.paid)
        .reduce((sum, t) => sum + t.value, 0);

      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      months.push(`${monthNames[date.getMonth()]}/${date.getFullYear().toString().slice(-2)}`);
      incomes.push(income);
      expenses.push(expense);
    }

    const newChart = new Chart(incomeExpenseChartRef.current, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Receitas',
            data: incomes,
            backgroundColor: 'rgba(39, 174, 96, 0.8)',
            borderColor: '#27ae60',
            borderWidth: 2,
            borderRadius: 8,
          },
          {
            label: 'Despesas',
            data: expenses,
            backgroundColor: 'rgba(231, 76, 60, 0.8)',
            borderColor: '#e74c3c',
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#e4e6eb',
              font: { size: 13, weight: '600' },
              padding: 15,
              usePointStyle: true,
            },
          },
          tooltip: {
            backgroundColor: 'rgba(44, 62, 80, 0.95)',
            padding: 12,
            callbacks: {
              label: function (context) {
                return context.dataset.label + ': R$ ' + formatCurrency(context.parsed.y);
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return 'R$ ' + formatCurrency(value);
              },
              color: '#8b92a7',
              font: { size: 11 },
            },
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
          },
          x: {
            ticks: { color: '#8b92a7', font: { size: 11 } },
            grid: { display: false },
          },
        },
      },
    });

    setIncomeExpenseChart(newChart);

    return () => {
      if (newChart) newChart.destroy();
    };
  }, []);

  return (
    <div className="ml-[260px] flex-1 bg-[#0f1419]" style={{ padding: '40px 50px' }}>
      {/* Header */}
      <div className="flex justify-between items-center" style={{ marginBottom: '35px' }}>
        <div>
          <h2 className="text-[28px] font-bold text-white" style={{ marginBottom: '6px' }}>
            Análises
          </h2>
          <div className="text-[#8b92a7] text-[14px]">Gestão de receitas e despesas</div>
        </div>
      </div>

      {/* Saúde Financeira */}
      <div className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e]" 
           style={{ 
             padding: '28px',
             boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
             marginBottom: '30px'
           }}>
        <h3 className="text-[18px] font-bold text-white" style={{ marginBottom: '24px' }}>
          💚 Saúde Financeira
        </h3>
        <div className="flex items-center" style={{ gap: '30px', padding: '20px' }}>
          <div style={{ position: 'relative', width: '150px', height: '150px' }}>
            <svg width="150" height="150" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="75" cy="75" r="60" fill="none" stroke="#2a2f3e" strokeWidth="12"/>
              <circle 
                cx="75" 
                cy="75" 
                r="60" 
                fill="none" 
                stroke={healthScore.color} 
                strokeWidth="12"
                strokeDasharray={`${(healthScore.score / 100) * 377} 377`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
            </svg>
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)', 
              textAlign: 'center' 
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: healthScore.color }}>
                {healthScore.score}
              </div>
              <div style={{ fontSize: '12px', color: '#8b92a7' }}>pontos</div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '18px', fontWeight: 600, color: 'white', marginBottom: '10px' }}>
              Taxa de Poupança: {healthScore.savingsRate.toFixed(1)}%
            </div>
            <div style={{ color: '#8b92a7', lineHeight: 1.6 }}>
              {healthScore.message}
            </div>
            <div style={{ 
              marginTop: '15px', 
              padding: '10px', 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: '8px', 
              fontSize: '13px', 
              color: '#b0b8c9' 
            }}>
              <strong>Receita:</strong> R$ {formatCurrency(healthScore.income)} • 
              <strong> Despesa:</strong> R$ {formatCurrency(healthScore.expense)}
            </div>
          </div>
        </div>
      </div>

      {/* Evolução Patrimonial */}
      <div className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e]" 
           style={{ 
             padding: '28px',
             boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
             marginBottom: '30px'
           }}>
        <h3 className="text-[18px] font-bold text-white" style={{ marginBottom: '24px' }}>
          📈 Evolução Patrimonial (Últimos 6 Meses)
        </h3>
        <div style={{ position: 'relative', height: '300px' }}>
          <canvas ref={patrimonialChartRef}></canvas>
        </div>
      </div>

      {/* Gastos por Categoria e Receitas vs Despesas */}
      <div className="grid grid-cols-2" style={{ gap: '24px' }}>
        {/* Gastos por Categoria */}
        <div className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e]" 
             style={{ 
               padding: '28px',
               boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
             }}>
          <h3 className="text-[18px] font-bold text-white" style={{ marginBottom: '24px' }}>
            🍕 Gastos por Categoria
          </h3>
          <div style={{ position: 'relative', height: '300px' }}>
            <canvas ref={categoryPieChartRef}></canvas>
          </div>
        </div>

        {/* Receitas vs Despesas */}
        <div className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e]" 
             style={{ 
               padding: '28px',
               boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
             }}>
          <h3 className="text-[18px] font-bold text-white" style={{ marginBottom: '24px' }}>
            📊 Receitas vs Despesas
          </h3>
          <div style={{ position: 'relative', height: '300px' }}>
            <canvas ref={incomeExpenseChartRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analises;