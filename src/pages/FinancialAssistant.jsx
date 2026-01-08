import React, { useState, useEffect, useRef } from "react";

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      showWelcomeMessage();
    }
  }, [isOpen]);

  const analyzeFinancialData = () => {
    const transactions = JSON.parse(
      localStorage.getItem("financialData") || "[]"
    );
    const dreams = JSON.parse(localStorage.getItem("dreams") || "[]");
    const aposentadoria = JSON.parse(
      localStorage.getItem("aposentadoria_data") || "null"
    );

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return (
        tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear
      );
    });

    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastMonthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return (
        tDate.getMonth() === lastMonth && tDate.getFullYear() === lastMonthYear
      );
    });

    const income = monthTransactions
      .filter((t) => t.type === "income" && t.paid)
      .reduce((sum, t) => sum + t.value, 0);

    const expenses = monthTransactions
      .filter((t) => t.type === "expense" && t.paid)
      .reduce((sum, t) => sum + t.value, 0);

    const lastMonthExpenses = lastMonthTransactions
      .filter((t) => t.type === "expense" && t.paid)
      .reduce((sum, t) => sum + t.value, 0);

    const balance = income - expenses;
    const savingsRate = income > 0 ? (balance / income) * 100 : 0;

    const categories = {};
    monthTransactions
      .filter((t) => t.type === "expense" && t.paid)
      .forEach((t) => {
        categories[t.category] = (categories[t.category] || 0) + t.value;
      });

    const sortedCategories = Object.entries(categories).sort(
      (a, b) => b[1] - a[1]
    );

    const totalInvested = transactions
      .filter(
        (t) => t.type === "expense" && t.category === "Investimentos" && t.paid
      )
      .reduce((sum, t) => sum + t.value, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(today.getDate() + 2);

    const upcomingBills = transactions.filter((t) => {
      if (t.paid || t.type !== "expense") return false;
      const dueDate = new Date(t.date);
      dueDate.setHours(0, 0, 0, 0);
      const timeDiff = dueDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return daysDiff >= 0 && daysDiff <= 2;
    });

    return {
      income,
      expenses,
      lastMonthExpenses,
      balance,
      savingsRate,
      categories: sortedCategories,
      totalInvested,
      dreams,
      aposentadoria,
      upcomingBills,
    };
  };

  const generateInsights = () => {
    const insights = [];
    const data = analyzeFinancialData();

    if (data.upcomingBills.length > 0) {
      insights.push({
        title: "⚠️ Contas próximas do vencimento",
        message: `${data.upcomingBills.length} conta(s) vence(m) nos próximos 2 dias!`,
      });
    }

    if (data.savingsRate < 10) {
      insights.push({
        title: "⚠️ Taxa de poupança baixa",
        message: `Você está poupando apenas ${data.savingsRate.toFixed(
          1
        )}% (R$ ${data.balance.toFixed(2)}).`,
      });
    } else if (data.savingsRate >= 20) {
      insights.push({
        title: "🎉 Excelente taxa de poupança!",
        message: `Você está poupando ${data.savingsRate.toFixed(
          1
        )}% (R$ ${data.balance.toFixed(2)}).`,
      });
    }

    if (data.categories.length > 0) {
      const [topCategory, topValue] = data.categories[0];
      const percentage = (topValue / data.expenses) * 100;
      if (percentage > 40) {
        insights.push({
          title: `📊 ${topCategory} consome ${percentage.toFixed(
            0
          )}% do orçamento`,
          message: `Você gastou R$ ${topValue.toFixed(2)} em ${topCategory}.`,
        });
      }
    }

    return insights;
  };

  const formatCurrency = (value) => {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const showWelcomeMessage = () => {
    const insights = generateInsights();
    let welcomeText =
      "👋 Olá! Sou seu assistente financeiro inteligente.\n\n📊 Analisei seus dados e encontrei:\n\n";

    insights.slice(0, 3).forEach((insight, idx) => {
      welcomeText += `${idx + 1}. ${insight.title}\n`;
    });

    welcomeText += "\n💬 Pergunte-me qualquer coisa sobre suas finanças!";

    addMessage("assistant", welcomeText, true);
  };

  const processQuestion = (question) => {
    const q = question.toLowerCase().trim();
    const data = analyzeFinancialData();

    if (
      q.includes("investido") ||
      q.includes("investimento total") ||
      q.includes("quanto tenho investido")
    ) {
      const investimentosPorMes = {};
      const transactions = JSON.parse(
        localStorage.getItem("financialData") || "[]"
      );

      transactions
        .filter(
          (t) =>
            t.type === "expense" && t.category === "Investimentos" && t.paid
        )
        .forEach((t) => {
          const date = new Date(t.date);
          const mesAno = `${date.getMonth() + 1}/${date.getFullYear()}`;
          investimentosPorMes[mesAno] =
            (investimentosPorMes[mesAno] || 0) + t.value;
        });

      const top5Meses = Object.entries(investimentosPorMes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      return `💎 Análise de Investimentos:\n\n• Total investido: R$ ${formatCurrency(
        data.totalInvested
      )}\n• Saldo disponível: R$ ${formatCurrency(
        data.balance
      )}\n\n📊 Top 5 meses com mais investimentos:\n${
        top5Meses.length > 0
          ? top5Meses
              .map(
                ([mes, valor], idx) =>
                  `${idx + 1}. ${mes}: R$ ${formatCurrency(valor)}`
              )
              .join("\n")
          : "Nenhum investimento registrado ainda."
      }\n\n💡 ${
        data.balance > 500
          ? "Continue investindo regularmente!"
          : "Tente poupar mais para aumentar seus investimentos."
      }`;
    }

    if (
      q.includes("aposentadoria") ||
      q.includes("aposentar") ||
      q.includes("previdência")
    ) {
      if (!data.aposentadoria) {
        return `🎯 Você ainda não configurou seu plano de aposentadoria!\n\nVá na aba "Aposentadoria" para:\n• Definir sua meta de aposentadoria\n• Calcular quanto precisa investir\n• Acompanhar seu progresso`;
      }

      const progress =
        (data.aposentadoria.valorAtual / data.aposentadoria.metaTotal) * 100;
      const faltam =
        data.aposentadoria.metaTotal - data.aposentadoria.valorAtual;
      const anosRestantes = data.aposentadoria.anosParaAposentar || 0;

      return `🎯 Seu Plano de Aposentadoria:\n\n• Meta total: R$ ${formatCurrency(
        data.aposentadoria.metaTotal
      )}\n• Já acumulado: R$ ${formatCurrency(
        data.aposentadoria.valorAtual
      )}\n• Faltam: R$ ${formatCurrency(
        faltam
      )}\n• Progresso: ${progress.toFixed(
        1
      )}%\n• Anos restantes: ${anosRestantes}\n\n${
        progress >= 50
          ? "✅ Você está no caminho certo!"
          : progress >= 25
          ? "⚡ Continue investindo consistentemente!"
          : "⚠️ Considere aumentar seus aportes mensais."
      }`;
    }

    if (
      q.includes("vencer") ||
      q.includes("pendente") ||
      q.includes("conta") ||
      q.includes("pagar")
    ) {
      if (data.upcomingBills.length === 0) {
        return `✅ Parabéns! Você não tem contas pendentes para os próximos 2 dias.\n\n💡 Mantenha suas finanças em dia!`;
      }

      const billsByDay = {};
      data.upcomingBills.forEach((bill) => {
        const dueDate = new Date(bill.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const daysDiff = Math.ceil((dueDate - today) / (1000 * 3600 * 24));

        const label =
          daysDiff === 0
            ? "Hoje"
            : daysDiff === 1
            ? "Amanhã"
            : `Em ${daysDiff} dias`;

        if (!billsByDay[label]) billsByDay[label] = [];
        billsByDay[label].push(bill);
      });

      let response = `⚠️ Contas Próximas do Vencimento:\n\n`;

      Object.entries(billsByDay).forEach(([dia, contas]) => {
        response += `📅 ${dia}:\n`;
        contas.forEach((conta) => {
          response += `   • ${conta.title}: R$ ${formatCurrency(
            conta.value
          )}\n`;
        });
        response += "\n";
      });

      const totalPendente = data.upcomingBills.reduce(
        (sum, bill) => sum + bill.value,
        0
      );
      response += `💰 Total a pagar: R$ ${formatCurrency(
        totalPendente
      )}\n\n⚡ Não se esqueça de pagar em dia!`;

      return response;
    }

    const meses = {
      janeiro: 0,
      fevereiro: 1,
      março: 2,
      abril: 3,
      maio: 4,
      junho: 5,
      julho: 6,
      agosto: 7,
      setembro: 8,
      outubro: 9,
      novembro: 10,
      dezembro: 11,
    };

    if (q.includes("gastei") || q.includes("gasto") || q.includes("despesa")) {
      let targetMonth = null;
      let targetYear = new Date().getFullYear();

      for (const [mesNome, mesNum] of Object.entries(meses)) {
        if (q.includes(mesNome)) {
          targetMonth = mesNum;
          break;
        }
      }

      if (targetMonth !== null) {
        const transactions = JSON.parse(
          localStorage.getItem("financialData") || "[]"
        );
        const monthTransactions = transactions.filter((t) => {
          const tDate = new Date(t.date);
          return (
            tDate.getMonth() === targetMonth &&
            tDate.getFullYear() === targetYear &&
            t.type === "expense" &&
            t.paid
          );
        });

        const totalGasto = monthTransactions.reduce(
          (sum, t) => sum + t.value,
          0
        );
        const categories = {};
        monthTransactions.forEach((t) => {
          categories[t.category] = (categories[t.category] || 0) + t.value;
        });
        const sortedCategories = Object.entries(categories).sort(
          (a, b) => b[1] - a[1]
        );

        const mesNomeCapitalizado = Object.keys(meses).find(
          (key) => meses[key] === targetMonth
        );

        return `💰 Gastos em ${
          mesNomeCapitalizado.charAt(0).toUpperCase() +
          mesNomeCapitalizado.slice(1)
        }/${targetYear}:\n\n• Total: R$ ${formatCurrency(
          totalGasto
        )}\n• Maior categoria: ${
          sortedCategories[0]
            ? sortedCategories[0][0] +
              " (R$ " +
              formatCurrency(sortedCategories[0][1]) +
              ")"
            : "N/A"
        }\n\n📊 Top 5 categorias:\n${sortedCategories
          .slice(0, 5)
          .map(
            ([cat, val], idx) => `${idx + 1}. ${cat}: R$ ${formatCurrency(val)}`
          )
          .join("\n")}`;
      }

      return `💰 Seus gastos este mês:\n\n• Total: R$ ${formatCurrency(
        data.expenses
      )}\n• Maior categoria: ${
        data.categories[0]
          ? data.categories[0][0] +
            " (R$ " +
            formatCurrency(data.categories[0][1]) +
            ")"
          : "N/A"
      }\n\n📊 Top 5 categorias:\n${data.categories
        .slice(0, 5)
        .map(
          ([cat, val], idx) => `${idx + 1}. ${cat}: R$ ${formatCurrency(val)}`
        )
        .join("\n")}`;
    }

    if (
      q.includes("economia") ||
      q.includes("economizar") ||
      q.includes("poupar")
    ) {
      const insights = generateInsights();
      return `💡 Dicas de economia personalizadas:\n\n${insights
        .slice(0, 3)
        .map((tip, idx) => `${idx + 1}. ${tip.title}\n   ${tip.message}`)
        .join("\n\n")}`;
    }

    if (
      q.includes("saúde") ||
      q.includes("financeira") ||
      q.includes("situação")
    ) {
      let health = "🟢 Boa";
      if (data.savingsRate < 10) health = "🔴 Precisa melhorar";
      else if (data.savingsRate < 20) health = "🟡 Regular";

      return `💚 Análise de Saúde Financeira:\n\nStatus: ${health}\n\n📊 Resumo:\n• Receitas: R$ ${formatCurrency(
        data.income
      )}\n• Despesas: R$ ${formatCurrency(
        data.expenses
      )}\n• Saldo: R$ ${formatCurrency(
        data.balance
      )}\n• Taxa de poupança: ${data.savingsRate.toFixed(1)}%\n\n${
        data.savingsRate >= 20
          ? "✅ Parabéns! Você está no caminho certo!"
          : "⚠️ Tente reduzir gastos para poupar mais."
      }`;
    }

    if (q.includes("categoria") || (q.includes("onde") && q.includes("mais"))) {
      return `📊 Ranking de gastos por categoria:\n\n${data.categories
        .slice(0, 5)
        .map(([cat, val], idx) => {
          const percent = (val / data.expenses) * 100;
          return `${idx + 1}. ${cat}: R$ ${formatCurrency(
            val
          )} (${percent.toFixed(0)}%)`;
        })
        .join("\n")}`;
    }

    if (q.includes("sonho") || q.includes("meta") || q.includes("objetivo")) {
      if (data.dreams.length === 0) {
        return `✨ Você ainda não cadastrou nenhum sonho!\n\nVá na aba "Metas & Sonhos" para começar.`;
      }
      return `✨ Seus sonhos e metas:\n\n${data.dreams
        .map((dream, idx) => {
          const progress = (dream.current / dream.target) * 100;
          return `${idx + 1}. ${dream.name}\n   ${progress.toFixed(
            0
          )}% completo (R$ ${formatCurrency(
            dream.current
          )} de R$ ${formatCurrency(dream.target)})`;
        })
        .join("\n\n")}`;
    }

    return `🤔 Desculpe, não entendi.\n\nTente perguntar sobre:\n• "Quanto tenho investido?"\n• "Como está minha aposentadoria?"\n• "Tenho contas a vencer?"\n• "Quanto gastei este mês?"\n• "Como posso economizar?"\n• "Analise minha saúde financeira"\n• "Quais são meus sonhos?"`;
  };

  const addMessage = (role, content, showQuickActions = false) => {
    setMessages((prev) => [...prev, { role, content, showQuickActions }]);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    addMessage("user", inputValue);
    const userQuestion = inputValue;
    setInputValue("");

    setTimeout(() => {
      const response = processQuestion(userQuestion);
      addMessage("assistant", response);
    }, 500);
  };

  const handleQuickAction = (question) => {
    setInputValue(question);
    setTimeout(() => handleSend(), 100);
  };

  // COLOCAR ESTE JSX NO RETURN DO COMPONENTE

  return (
    <>
      {/* Botão Flutuante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-4 w-14 h-14 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 z-50 ${
          isOpen ? "scale-0" : "scale-100"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-4 w-[380px] h-[600px] bg-[#1a1f2e] rounded-2xl shadow-2xl border border-[#2a2f3e] flex flex-col transition-all duration-300 z-50 ${
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-2xl">
              🤖
            </div>
            <div>
              <div className="text-white font-bold text-sm">
                Assistente Financeiro IA
              </div>
              <div className="text-white/80 text-xs">
                Online • Pronto para ajudar
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx}>
              <div
                className={`flex gap-3 ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "assistant"
                      ? "bg-gradient-to-br from-[#667eea] to-[#764ba2]"
                      : "bg-[#252b3b]"
                  }`}
                >
                  {msg.role === "assistant" ? "🤖" : "👤"}
                </div>
                <div
                  className={`max-w-[75%] rounded-2xl p-3 whitespace-pre-line text-sm ${
                    msg.role === "assistant"
                      ? "bg-[#252b3b] text-white"
                      : "bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white"
                  }`}
                >
                  {msg.content}
                </div>
              </div>

              {/* Quick Actions */}
              {msg.showQuickActions && (
                <div className="flex flex-wrap gap-2 mt-3 ml-11">
                  <button
                    onClick={() => handleQuickAction("Quanto tenho investido?")}
                    className="px-3 py-1.5 bg-[#252b3b] hover:bg-[#2d3548] text-white text-xs rounded-lg transition-colors border border-[#2a2f3e]"
                  >
                    💎 Investimentos
                  </button>
                  <button
                    onClick={() =>
                      handleQuickAction("Como está minha aposentadoria?")
                    }
                    className="px-3 py-1.5 bg-[#252b3b] hover:bg-[#2d3548] text-white text-xs rounded-lg transition-colors border border-[#2a2f3e]"
                  >
                    🎯 Aposentadoria
                  </button>
                  <button
                    onClick={() => handleQuickAction("Tenho contas a vencer?")}
                    className="px-3 py-1.5 bg-[#252b3b] hover:bg-[#2d3548] text-white text-xs rounded-lg transition-colors border border-[#2a2f3e]"
                  >
                    ⚠️ Contas
                  </button>
                  <button
                    onClick={() => handleQuickAction("Quanto gastei este mês?")}
                    className="px-3 py-1.5 bg-[#252b3b] hover:bg-[#2d3548] text-white text-xs rounded-lg transition-colors border border-[#2a2f3e]"
                  >
                    💰 Gastos
                  </button>
                  <button
                    onClick={() =>
                      handleQuickAction("Analise minha saúde financeira")
                    }
                    className="px-3 py-1.5 bg-[#252b3b] hover:bg-[#2d3548] text-white text-xs rounded-lg transition-colors border border-[#2a2f3e]"
                  >
                    📊 Saúde
                  </button>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#2a2f3e]">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Digite sua pergunta sobre finanças..."
              className="flex-1 bg-[#252b3b] border border-[#2a2f3e] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#8b92a7] focus:outline-none focus:border-[#667eea]"
            />
            <button
              onClick={handleSend}
              className="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white rounded-lg px-4 py-2.5 hover:opacity-90 transition-opacity"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
