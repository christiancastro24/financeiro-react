import React, { useState, useEffect } from 'react';

const OrcamentoDiario = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dailySpending, setDailySpending] = useState(() => {
    const saved = localStorage.getItem('dailySpending');
    return saved ? JSON.parse(saved) : {};
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('financialData');
    return saved ? JSON.parse(saved) : [];
  });

  const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getMonthKey = () => {
    return `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
  };

  const getMonthName = () => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${months[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
  };

  const getMonthlyBudgetFromTransactions = () => {
    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return (
        tDate.getMonth() === currentMonth.getMonth() &&
        tDate.getFullYear() === currentMonth.getFullYear() &&
        t.type === 'expense' &&
        t.category === 'GastosGerais'
      );
    });

    return monthTransactions.reduce((sum, t) => sum + t.value, 0);
  };

  const budget = getMonthlyBudgetFromTransactions();

  const changeMonth = (delta) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentMonth(newDate);
  };

  const updateDailySpending = (day, value) => {
    const monthKey = getMonthKey();
    const numValue = parseFloat(value) || 0;

    setDailySpending(prev => {
      const updated = {
        ...prev,
        [monthKey]: {
          ...(prev[monthKey] || {}),
          [day]: numValue
        }
      };
      localStorage.setItem('dailySpending', JSON.stringify(updated));
      return updated;
    });
  };

  const renderBudgetTable = () => {
    if (budget === 0) return null;

    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();
    
    const dailyBudget = budget / daysInMonth;
    const monthKey = getMonthKey();
    const monthSpending = dailySpending[monthKey] || {};

    let accumulated = 0;
    let totalSpent = 0;
    const rows = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const daySpent = monthSpending[day] || 0;
      totalSpent += daySpent;
      accumulated += dailyBudget - daySpent;

      const available = accumulated;
      const isNegative = available < 0;

      rows.push({
        day,
        daySpent,
        available,
        isNegative
      });
    }

    const today = new Date().getDate();
    const isCurrentMonth =
      currentMonth.getMonth() === new Date().getMonth() &&
      currentMonth.getFullYear() === new Date().getFullYear();

    let availableToday = 0;
    if (isCurrentMonth) {
      for (let day = 1; day <= today; day++) {
        const daySpent = monthSpending[day] || 0;
        availableToday += dailyBudget - daySpent;
      }
    }

    return { rows, totalSpent, availableToday: isCurrentMonth ? availableToday : accumulated };
  };

  const budgetData = renderBudgetTable();

  return (
    <div className="ml-[260px] flex-1 bg-[#0f1419]" style={{ padding: '40px 50px' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '35px' }}>
        <div>
          <h2 className="text-[28px] font-bold text-white" style={{ marginBottom: '6px', fontWeight: 'bold' }}>
            Orçamento Diário
          </h2>
          <div className="text-[#8b92a7] text-[14px]">
            Gestão de receitas e despesas
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-between bg-[#1a1f2e] rounded-xl border border-[#2a2f3e]"
        style={{
          marginBottom: '30px',
          padding: '18px 24px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          borderRadius: '0.5rem',
        }}
      >
        <button
          onClick={() => changeMonth(-1)}
          className="bg-[#252b3b] border border-[#2a2f3e] text-[#8b92a7] rounded-lg cursor-pointer hover:bg-[#2d3548] hover:border-[#5b8def] hover:text-[#5b8def]"
          style={{
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'all 0.2s ease',
            borderRadius: '0.5rem',
          }}
        >
          ← Anterior
        </button>
        <span className="text-[18px] font-bold text-white" style={{ fontWeight: 'bold' }}>
          {getMonthName()}
        </span>
        <button
          onClick={() => changeMonth(1)}
          className="bg-[#252b3b] border border-[#2a2f3e] text-[#8b92a7] rounded-lg cursor-pointer hover:bg-[#2d3548] hover:border-[#5b8def] hover:text-[#5b8def]"
          style={{
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'all 0.2s ease',
            borderRadius: '0.5rem',
          }}
        >
          Próximo →
        </button>
      </div>

      <div className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e]" style={{ padding: '28px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)', borderRadius: '0.5rem' }}>
        <div className="flex justify-between items-start" style={{ marginBottom: '24px' }}>
          <div>
            <h3 className="text-[18px] font-bold text-white" style={{ marginBottom: '8px', fontWeight: 'bold' }}>
              Orçamento Mensal - Gastos Gerais
            </h3>
            <p className="text-[#8b92a7] text-[14px]">
              Registre manualmente os gastos de cada dia. O saldo disponível acumula automaticamente.
            </p>
          </div>
          {budget > 0 && (
            <div className="bg-[#252b3b] rounded-lg border border-[#2a2f3e]" style={{ padding: '16px 24px', minWidth: '200px' }}>
              <div className="text-[#8b92a7] text-[12px] uppercase" style={{ letterSpacing: '0.5px', marginBottom: '6px' }}>
                Orçamento Mensal
              </div>
              <div className="text-[24px] font-bold text-[#5b8def]" style={{ fontWeight: 'bold' }}>
                R$ {formatCurrency(budget)}
              </div>
            </div>
          )}
        </div>

        {budget === 0 ? (
          <div className="text-center bg-[#1e2738] rounded-lg border border-[#2a2f3e]" style={{ padding: '60px 20px' }}>
            <div className="text-[48px]" style={{ marginBottom: '16px' }}>💰</div>
            <h3 className="text-[18px] font-bold text-white" style={{ marginBottom: '8px', fontWeight: 'bold' }}>
              Nenhum orçamento definido
            </h3>
            <p className="text-[#8b92a7] text-[14px]" style={{ marginBottom: '20px' }}>
              Cadastre uma despesa com categoria "Gastos Gerais" no Dashboard para começar.
            </p>
            <button
              className="bg-[#5b8def] text-white rounded-lg cursor-pointer hover:bg-[#4a7dd9]"
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 'bold',
                border: 'none',
                boxShadow: '0 4px 12px rgba(91, 141, 239, 0.3)',
                transition: 'all 0.2s ease',
                borderRadius: '0.5rem',
              }}
            >
              Ir para Dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4" style={{ marginBottom: '24px' }}>
              <div className="bg-[#252b3b] rounded-lg border border-[#2a2f3e]" style={{ padding: '16px' }}>
                <div className="text-[#8b92a7] text-[12px] uppercase" style={{ marginBottom: '8px', letterSpacing: '0.5px' }}>
                  Orçamento Total
                </div>
                <div className="text-[20px] font-bold text-white" style={{ fontWeight: 'bold' }}>
                  R$ {formatCurrency(budget)}
                </div>
              </div>
              <div className="bg-[#252b3b] rounded-lg border border-[#2a2f3e]" style={{ padding: '16px' }}>
                <div className="text-[#8b92a7] text-[12px] uppercase" style={{ marginBottom: '8px', letterSpacing: '0.5px' }}>
                  Total Gasto
                </div>
                <div className="text-[20px] font-bold text-[#e74c3c]" style={{ fontWeight: 'bold' }}>
                  R$ {formatCurrency(budgetData?.totalSpent || 0)}
                </div>
              </div>
              <div className="bg-[#252b3b] rounded-lg border border-[#2a2f3e]" style={{ padding: '16px' }}>
                <div className="text-[#8b92a7] text-[12px] uppercase" style={{ marginBottom: '8px', letterSpacing: '0.5px' }}>
                  Disponível Hoje
                </div>
                <div className="text-[20px] font-bold text-[#27ae60]" style={{ fontWeight: 'bold' }}>
                  R$ {formatCurrency(Math.max(0, budgetData?.availableToday || 0))}
                </div>
              </div>
            </div>

            <div className="bg-[#252b3b] rounded-lg border border-[#2a2f3e] max-h-[500px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-[#252b3b]">
                  <tr className="border-b border-[#2a2f3e]">
                    <th className="text-left text-[#8b92a7] text-[12px] uppercase font-bold" style={{ padding: '16px', letterSpacing: '0.5px', width: '100px', fontWeight: 'bold' }}>
                      Dia
                    </th>
                    <th className="text-center text-[#8b92a7] text-[12px] uppercase font-bold" style={{ padding: '16px', letterSpacing: '0.5px', width: '200px', fontWeight: 'bold' }}>
                      Gasto no Dia
                    </th>
                    <th className="text-right text-[#8b92a7] text-[12px] uppercase font-bold" style={{ padding: '16px', letterSpacing: '0.5px', width: '180px', fontWeight: 'bold' }}>
                      Disponível Acumulado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {budgetData?.rows.map(({ day, daySpent, available, isNegative }) => (
                    <tr
                      key={day}
                      className={daySpent > 0 ? 'bg-[#1a1f2e]' : ''}
                      style={{ borderBottom: '1px solid #2a2f3e' }}
                    >
                      <td className="font-bold text-white" style={{ padding: '12px 16px', fontWeight: 'bold' }}>
                        Dia {day}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-block', position: 'relative', width: '140px' }}>
                          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#95a5a6', fontSize: '14px', pointerEvents: 'none' }}>
                            R$
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={daySpent || ''}
                            placeholder="0,00"
                            onChange={(e) => updateDailySpending(day, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 12px 10px 32px',
                              border: '1px solid #2a2f3e',
                              borderRadius: '6px',
                              fontSize: '14px',
                              textAlign: 'right',
                              background: '#1a1f2e',
                              color: '#fff',
                              transition: 'all 0.2s',
                            }}
                          />
                        </div>
                      </td>
                      <td
                        className="text-right font-bold"
                        style={{
                          padding: '12px 20px 12px 12px',
                          fontSize: '15px',
                          color: isNegative ? '#e74c3c' : '#27ae60',
                          fontWeight: 'bold'
                        }}
                      >
                        {isNegative ? '- ' : ''}R$ {formatCurrency(Math.abs(available))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrcamentoDiario;