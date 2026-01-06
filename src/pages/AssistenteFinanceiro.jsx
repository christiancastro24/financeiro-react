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
    const jornada100k = JSON.parse(
      localStorage.getItem("jornada100k_data") || "null"
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

    return {
      income,
      expenses,
      lastMonthExpenses,
      balance,
      savingsRate,
      categories: sortedCategories,
      totalInvested,
      dreams,
      jornada100k,
    };
  };

  const generateInsights = () => {
    const insights = [];
    const data = analyzeFinancialData();

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

    if (data.lastMonthExpenses > 0) {
      const diff = data.expenses - data.lastMonthExpenses;
      const percentChange = (diff / data.lastMonthExpenses) * 100;

      if (percentChange > 15) {
        insights.push({
          title: "📈 Gastos aumentaram",
          message: `Seus gastos subiram ${percentChange.toFixed(
            0
          )}% (+R$ ${diff.toFixed(2)}).`,
        });
      } else if (percentChange < -10) {
        insights.push({
          title: "📉 Economia em alta!",
          message: `Economizou ${Math.abs(percentChange).toFixed(
            0
          )}% (-R$ ${Math.abs(diff).toFixed(2)})!`,
        });
      }
    }

    return insights;
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
        }/${targetYear}:\n\n• Total: R$ ${totalGasto.toFixed(
          2
        )}\n• Maior categoria: ${
          sortedCategories[0]
            ? sortedCategories[0][0] +
              " (R$ " +
              sortedCategories[0][1].toFixed(2) +
              ")"
            : "N/A"
        }\n\n📊 Top 5 categorias:\n${sortedCategories
          .slice(0, 5)
          .map(([cat, val], idx) => `${idx + 1}. ${cat}: R$ ${val.toFixed(2)}`)
          .join("\n")}`;
      }

      return `💰 Seus gastos este mês:\n\n• Total: R$ ${data.expenses.toFixed(
        2
      )}\n• Maior categoria: ${
        data.categories[0]
          ? data.categories[0][0] +
            " (R$ " +
            data.categories[0][1].toFixed(2) +
            ")"
          : "N/A"
      }\n\n📊 Top 5 categorias:\n${data.categories
        .slice(0, 5)
        .map(([cat, val], idx) => `${idx + 1}. ${cat}: R$ ${val.toFixed(2)}`)
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

      return `💚 Análise de Saúde Financeira:\n\nStatus: ${health}\n\n📊 Resumo:\n• Receitas: R$ ${data.income.toFixed(
        2
      )}\n• Despesas: R$ ${data.expenses.toFixed(
        2
      )}\n• Saldo: R$ ${data.balance.toFixed(
        2
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
          return `${idx + 1}. ${cat}: R$ ${val.toFixed(2)} (${percent.toFixed(
            0
          )}%)`;
        })
        .join("\n")}`;
    }

    if (q.includes("investimento") || q.includes("investir")) {
      return `💎 Análise de Investimentos:\n\n• Total investido: R$ ${data.totalInvested.toFixed(
        2
      )}\n• Disponível: R$ ${data.balance.toFixed(2)}\n\n💡 Sugestões:\n${
        data.balance > 500
          ? "✅ Você tem condições de investir!\n• Tesouro Direto\n• CDB\n• Fundos de investimento"
          : "⚠️ Foque em aumentar sua poupança."
      }`;
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
          )}% completo (R$ ${dream.current.toFixed(
            2
          )} de R$ ${dream.target.toFixed(2)})`;
        })
        .join("\n\n")}`;
    }

    if (q.includes("100k") || q.includes("jornada")) {
      if (!data.jornada100k) {
        return `🚀 Você ainda não iniciou a Jornada 100k!\n\nVá na aba "Jornada 100k" para configurar.`;
      }
      const progress = (data.jornada100k.currentAmount / 100000) * 100;
      const remaining = 100000 - data.jornada100k.currentAmount;
      return `🚀 Jornada 100k:\n\n• Progresso: ${progress.toFixed(
        1
      )}%\n• Acumulado: R$ ${data.jornada100k.currentAmount.toFixed(
        2
      )}\n• Falta: R$ ${remaining.toFixed(
        2
      )}\n\n💪 Continue depositando mensalmente!`;
    }

    return `🤔 Desculpe, não entendi.\n\nTente perguntar sobre:\n• "Quanto gastei este mês?"\n• "Quanto gastei em janeiro?"\n• "Como posso economizar?"\n• "Analise minha saúde financeira"\n• "Quais são meus sonhos?"\n• "Como está a Jornada 100k?"`;
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

  return (
    <>
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

      <div
        className={`fixed bottom-6 right-4 w-[380px] h-[600px] bg-[#1a1f2e] rounded-2xl shadow-2xl border border-[#2a2f3e] flex flex-col transition-all duration-300 z-50 ${
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      >
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
                  className={`max-w-[75%] rounded-2xl p-3 whitespace-pre-line ${
                    msg.role === "assistant"
                      ? "bg-[#252b3b] text-white"
                      : "bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white"
                  }`}
                >
                  {msg.content}
                </div>
              </div>

              {msg.showQuickActions && (
                <div className="flex flex-wrap gap-2 mt-3 ml-11">
                  <button
                    onClick={() => handleQuickAction("Quanto gastei este mês?")}
                    className="px-3 py-1.5 bg-[#252b3b] hover:bg-[#2d3548] text-white text-xs rounded-lg transition-colors border border-[#2a2f3e]"
                  >
                    💰 Gastos do mês
                  </button>
                  <button
                    onClick={() => handleQuickAction("Como posso economizar?")}
                    className="px-3 py-1.5 bg-[#252b3b] hover:bg-[#2d3548] text-white text-xs rounded-lg transition-colors border border-[#2a2f3e]"
                  >
                    💡 Dicas de economia
                  </button>
                  <button
                    onClick={() =>
                      handleQuickAction("Analise minha saúde financeira")
                    }
                    className="px-3 py-1.5 bg-[#252b3b] hover:bg-[#2d3548] text-white text-xs rounded-lg transition-colors border border-[#2a2f3e]"
                  >
                    📊 Saúde financeira
                  </button>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

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
