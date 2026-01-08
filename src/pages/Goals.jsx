import React, { useState, useEffect } from "react";

const MetasSonhos = () => {
  // --- LÓGICA DE TEMA PADRONIZADA ---
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
    tertiary: theme === "dark" ? "#252b3b" : "#e9ecef",
    border: theme === "dark" ? "#2a2f3e" : "#dee2e6",
    textPrimary: theme === "dark" ? "#ffffff" : "#1a1f2e",
    textSecondary: theme === "dark" ? "#8b92a7" : "#6c757d",
    accent: "#667eea",
    success: "#27ae60",
    warning: "#f39c12",
    danger: "#e74c3c",
  };

  // --- LÓGICA ORIGINAL DO COMPONENTE ---
  const motivationalQuotes = [
    "Sonhos não morrem, apenas adormecem na alma da gente. 💫",
    "O sucesso é a soma de pequenos esforços repetidos dia após dia. 🌟",
    "Acredite em você mesmo e tudo será possível. ✨",
    "Seus sonhos estão esperando por você do outro lado do medo. 🚀",
    "Cada centavo economizado é um passo mais perto do seu sonho. 💰",
    "O futuro pertence àqueles que acreditam na beleza de seus sonhos. 🌈",
    "Não importa quão devagar você vá, desde que não pare. 🎯",
    "Grandes conquistas requerem grandes ambições. 🏆",
    "Você é mais forte do que imagina. Continue! 💪",
    "O melhor momento para começar foi ontem. O segundo melhor é agora. ⏰",
  ];

  const countryCoordinates = {
    BR: { name: "Brasil" },
    US: { name: "Estados Unidos" },
    FR: { name: "França" },
    IT: { name: "Itália" },
    ES: { name: "Espanha" },
    PT: { name: "Portugal" },
    GB: { name: "Reino Unido" },
    DE: { name: "Alemanha" },
    JP: { name: "Japão" },
    AU: { name: "Austrália" },
    CA: { name: "Canadá" },
    MX: { name: "México" },
    AR: { name: "Argentina" },
    CL: { name: "Chile" },
    GR: { name: "Grécia" },
    TH: { name: "Tailândia" },
    NZ: { name: "Nova Zelândia" },
  };

  const typeIcons = {
    travel: "🌍",
    purchase: "🛍️",
    savings: "💰",
    investment: "📈",
    education: "📚",
    other: "⭐",
  };

  const typeLabels = {
    travel: "Viagem",
    purchase: "Compra",
    savings: "Poupança",
    investment: "Investimento",
    education: "Educação",
    other: "Outro",
  };

  const [dreams, setDreams] = useState(() => {
    const saved = localStorage.getItem("dreams");
    return saved ? JSON.parse(saved) : [];
  });

  const [dailyQuote, setDailyQuote] = useState("");
  const [showDreamModal, setShowDreamModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddAmountModal, setShowAddAmountModal] = useState(false);
  const [editingDreamId, setEditingDreamId] = useState(null);
  const [selectedDream, setSelectedDream] = useState(null);

  const [formData, setFormData] = useState({
    type: "other",
    name: "",
    target: "",
    current: "",
    targetDate: "",
    description: "",
    imageUrl: "",
    country: "",
    city: "",
  });

  const [amountData, setAmountData] = useState({
    value: "",
    date: new Date().toISOString().split("T")[0],
  });

  const loadDailyQuote = () => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem("motivationDate");
    let quoteIndex = localStorage.getItem("motivationIndex");

    if (savedDate !== today || !quoteIndex) {
      quoteIndex = Math.floor(Math.random() * motivationalQuotes.length);
      localStorage.setItem("motivationDate", today);
      localStorage.setItem("motivationIndex", quoteIndex);
    }

    setDailyQuote(motivationalQuotes[quoteIndex]);
  };

  const saveDreams = (newDreams) => {
    localStorage.setItem("dreams", JSON.stringify(newDreams));
    setDreams(newDreams);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const openDreamModal = (dreamId = null) => {
    if (dreamId) {
      const dream = dreams.find((d) => d.id === dreamId);
      if (dream) {
        setEditingDreamId(dreamId);
        setFormData({
          type: dream.type,
          name: dream.name,
          target: dream.target,
          current: dream.current,
          targetDate: dream.targetDate || "",
          description: dream.description || "",
          imageUrl: dream.image || "",
          country: dream.country || "",
          city: dream.city || "",
        });
      }
    } else {
      setEditingDreamId(null);
      setFormData({
        type: "other",
        name: "",
        target: "",
        current: "",
        targetDate: "",
        description: "",
        imageUrl: "",
        country: "",
        city: "",
      });
    }
    setShowDreamModal(true);
  };

  const saveDream = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Por favor, digite um nome para o sonho.");
      return;
    }

    if (!formData.target || parseFloat(formData.target) <= 0) {
      alert("Por favor, digite um valor meta válido.");
      return;
    }

    const generateId = () => {
      const timestamp = new Date().getTime();
      const random = Math.floor(Math.random() * 10000);
      return `dream-${timestamp}-${random}`;
    };

    const dreamData = {
      id: editingDreamId || generateId(),
      type: formData.type,
      name: formData.name.trim(),
      target: parseFloat(formData.target),
      current: parseFloat(formData.current) || 0,
      targetDate: formData.targetDate || null,
      description: formData.description.trim(),
      image: formData.imageUrl || null,
      country: formData.country || null,
      city: formData.city || null,
      createdAt: new Date().toISOString(),
      history: [],
    };

    let newDreams;
    if (editingDreamId) {
      const index = dreams.findIndex((d) => d.id === editingDreamId);
      if (index !== -1) {
        dreamData.history = dreams[index].history || [];
        dreamData.createdAt = dreams[index].createdAt;
        newDreams = [...dreams];
        newDreams[index] = dreamData;
      } else {
        newDreams = [...dreams, dreamData];
      }
    } else {
      newDreams = [...dreams, dreamData];
    }

    saveDreams(newDreams);
    setShowDreamModal(false);
    showToast("Sonho salvo com sucesso! ✨");
  };

  const deleteDream = (dreamId) => {
    if (!window.confirm("Tem certeza que deseja excluir este sonho?")) return;

    const newDreams = dreams.filter((d) => d.id !== dreamId);
    saveDreams(newDreams);
    setShowDetailModal(false);
    showToast("Sonho excluído! 🗑️");
  };

  const openDetailModal = (dreamId) => {
    const dream = dreams.find((d) => d.id === dreamId);
    if (dream) {
      setSelectedDream(dream);
      setEditingDreamId(dreamId);
      setShowDetailModal(true);
    }
  };

  const openAddAmountModal = () => {
    setShowDetailModal(false);
    setAmountData({
      value: "",
      date: new Date().toISOString().split("T")[0],
    });
    setShowAddAmountModal(true);
  };

  const saveAmount = (e) => {
    e.preventDefault();

    if (!editingDreamId) return;

    const amount = parseFloat(amountData.value);
    if (!amount || amount <= 0) {
      alert("Digite um valor válido!");
      return;
    }

    const dreamIndex = dreams.findIndex((d) => d.id === editingDreamId);
    if (dreamIndex !== -1) {
      const newDreams = [...dreams];
      newDreams[dreamIndex].current += amount;
      newDreams[dreamIndex].history = newDreams[dreamIndex].history || [];
      newDreams[dreamIndex].history.push({
        amount,
        date: amountData.date,
        timestamp: new Date().toISOString(),
      });

      saveDreams(newDreams);
      setShowAddAmountModal(false);

      // Verificar se conquistou a meta
      const progress =
        (newDreams[dreamIndex].current / newDreams[dreamIndex].target) * 100;
      if (progress >= 100) {
        showToast(
          `🎉 PARABÉNS! Você conquistou seu sonho: ${newDreams[dreamIndex].name}! 🎉`
        );
      } else {
        showToast(`${formatCurrency(amount)} adicionado! 💰`);
      }
    }
  };

  const showToast = (message) => {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors.success};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = "slideOut 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  useEffect(() => {
    loadDailyQuote();
  }, []);

  return (
    <div
      className="ml-[260px] flex-1 min-h-screen transition-colors duration-300 p-8"
      style={{ backgroundColor: colors.primary }}
    >
      {/* Banner Motivacional */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] p-8 rounded-[20px] flex items-center gap-5 shadow-[0_8px_24px_rgba(102,126,234,0.3)] relative overflow-hidden">
          <div className="absolute -top-1/2 -right-1/5 w-[300px] h-[300px] bg-white/10 rounded-full" />
          <div className="text-5xl animate-[float_3s_ease-in-out_infinite]">
            💫
          </div>
          <div className="flex-1 relative z-10">
            <div className="text-sm text-white/90 mb-2 uppercase tracking-wider font-semibold">
              Frase do Dia
            </div>
            <p className="text-xl text-white font-medium leading-relaxed italic m-0">
              {dailyQuote}
            </p>
          </div>
        </div>
      </div>

      {/* Botão Adicionar */}
      <div className="flex justify-end mb-8">
        <button
          onClick={() => openDreamModal()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white text-[15px] font-semibold shadow-[0_4px_12px_rgba(102,126,234,0.3)] rounded-xl border-none cursor-pointer hover:scale-105 transition-transform"
        >
          <span>✨</span> Adicionar Novo Sonho
        </button>
      </div>

      {/* Grid de Sonhos */}
      {dreams.length === 0 ? (
        <div
          className="text-center py-20 px-5 rounded-2xl border-2 border-dashed"
          style={{
            backgroundColor: colors.secondary,
            borderColor: colors.border,
          }}
        >
          <div className="text-7xl mb-5 opacity-30 animate-[pulse_2s_ease-in-out_infinite]">
            🌟
          </div>
          <h3 className="mb-3 text-xl" style={{ color: colors.textPrimary }}>
            Nenhum sonho cadastrado ainda
          </h3>
          <p style={{ color: colors.textSecondary }} className="text-sm">
            Comece agora a planejar seus objetivos e conquistas!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6 mb-8">
          {dreams.map((dream) => {
            const progress = (dream.current / dream.target) * 100;
            const remaining = dream.target - dream.current;
            const isCompleted = progress >= 100;

            return (
              <div
                key={dream.id}
                onClick={() => openDetailModal(dream.id)}
                className={`rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.3)] border transition-all duration-300 cursor-pointer relative hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)] ${
                  isCompleted
                    ? "border-[#27ae60] shadow-[0_0_20px_rgba(39,174,96,0.3)]"
                    : "border-[#2a2f3e] hover:border-[#667eea]"
                }`}
                style={{
                  backgroundColor: colors.secondary,
                  borderColor: isCompleted ? "#27ae60" : colors.border,
                }}
              >
                {/* Imagem */}
                <div
                  className={`w-full h-[200px] ${
                    !dream.image
                      ? "bg-gradient-to-br from-[#667eea] to-[#764ba2]"
                      : ""
                  } flex items-center justify-center text-6xl relative`}
                >
                  {dream.image ? (
                    <img
                      src={dream.image}
                      alt={dream.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    typeIcons[dream.type]
                  )}

                  {isCompleted && (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#27ae60]/90 to-[#2ecc71]/90 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-7xl mb-2">🎉</div>
                        <div className="text-white text-2xl font-bold">
                          CONQUISTADO!
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    className={`absolute top-3 left-3 backdrop-blur-[10px] px-3 py-1.5 rounded-[20px] text-xs font-semibold text-white flex items-center gap-1 ${
                      isCompleted ? "bg-[#27ae60]/90" : "bg-black/70"
                    }`}
                  >
                    {isCompleted ? "✅" : typeIcons[dream.type]}{" "}
                    {isCompleted ? "Conquistado" : typeLabels[dream.type]}
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3
                      className="text-xl font-bold mb-2"
                      style={{ color: colors.textPrimary }}
                    >
                      {dream.name}
                    </h3>
                    {dream.country && (
                      <div
                        className="text-[13px] flex items-center gap-1.5"
                        style={{ color: colors.textSecondary }}
                      >
                        📍 {dream.city || ""}{" "}
                        {dream.city && dream.country ? "•" : ""}{" "}
                        {countryCoordinates[dream.country]?.name || ""}
                      </div>
                    )}
                  </div>

                  <div className="my-5">
                    <div className="flex justify-between mb-2 text-[13px]">
                      <span
                        className="font-bold"
                        style={{ color: colors.success }}
                      >
                        {formatCurrency(dream.current)}
                      </span>
                      <span style={{ color: colors.textSecondary }}>
                        {formatCurrency(dream.target)}
                      </span>
                    </div>

                    <div
                      className="h-3 rounded-[20px] overflow-hidden relative"
                      style={{ backgroundColor: colors.tertiary }}
                    >
                      <div
                        className="h-full bg-gradient-to-r from-[#27ae60] to-[#2ecc71] rounded-[20px] transition-[width] duration-1000 relative overflow-hidden"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
                      </div>
                    </div>

                    <div
                      className={`text-xs mt-2 text-center font-bold ${
                        isCompleted ? "text-[#27ae60]" : ""
                      }`}
                      style={{
                        color: isCompleted ? "#27ae60" : colors.textSecondary,
                      }}
                    >
                      {isCompleted
                        ? "🎉 100% conquistado!"
                        : `${progress.toFixed(1)}% conquistado`}
                    </div>
                  </div>

                  <div
                    className="flex justify-between items-center pt-4 border-t"
                    style={{ borderColor: colors.border }}
                  >
                    {isCompleted ? (
                      <div
                        className="text-[13px] font-bold w-full text-center"
                        style={{ color: colors.success }}
                      >
                        ✅ Meta Atingida!
                      </div>
                    ) : (
                      <>
                        <div
                          style={{ color: colors.textSecondary }}
                          className="text-[12px]"
                        >
                          Falta:{" "}
                          <strong
                            className="text-[12px]"
                            style={{ color: colors.warning }}
                          >
                            {formatCurrency(remaining)}
                          </strong>
                        </div>
                        {dream.targetDate && (
                          <div
                            className="text-xs flex items-center gap-1"
                            style={{ color: colors.textSecondary }}
                          >
                            📅{" "}
                            {new Date(dream.targetDate).toLocaleDateString(
                              "pt-BR"
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Novo/Editar Sonho */}
      {showDreamModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowDreamModal(false)}
        >
          <div
            className="rounded-2xl border p-8 w-full max-w-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.secondary,
              borderColor: colors.border,
            }}
          >
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: colors.textPrimary }}
            >
              {editingDreamId ? "✏️ Editar Sonho" : "✨ Novo Sonho"}
            </h2>

            <form onSubmit={saveDream}>
              <div className="mb-4">
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  Tipo de Sonho
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-4 py-3 border rounded-lg outline-none focus:border-[#667eea] transition-all"
                  style={{
                    backgroundColor: colors.tertiary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                >
                  <option value="travel">🌍 Viagem</option>
                  <option value="purchase">🛍️ Compra</option>
                  <option value="savings">💰 Poupança</option>
                  <option value="investment">📈 Investimento</option>
                  <option value="education">📚 Educação</option>
                  <option value="other">⭐ Outro</option>
                </select>
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  Nome do Sonho
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ex: Viagem para Paris"
                  required
                  className="w-full px-4 py-3 border rounded-lg outline-none focus:border-[#667eea] transition-all"
                  style={{
                    backgroundColor: colors.tertiary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: colors.textSecondary }}
                  >
                    Valor Meta (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.target}
                    onChange={(e) =>
                      setFormData({ ...formData, target: e.target.value })
                    }
                    placeholder="10000"
                    required
                    className="w-full px-4 py-3 border rounded-lg outline-none focus:border-[#667eea] transition-all"
                    style={{
                      backgroundColor: colors.tertiary,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: colors.textSecondary }}
                  >
                    Valor Atual (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.current}
                    onChange={(e) =>
                      setFormData({ ...formData, current: e.target.value })
                    }
                    placeholder="0"
                    className="w-full px-4 py-3 border rounded-lg outline-none focus:border-[#667eea] transition-all"
                    style={{
                      backgroundColor: colors.tertiary,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  Data Alvo (opcional)
                </label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) =>
                    setFormData({ ...formData, targetDate: e.target.value })
                  }
                  className="w-full px-4 py-3 border rounded-lg outline-none focus:border-[#667eea] transition-all"
                  style={{
                    backgroundColor: colors.tertiary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  Descrição (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descreva seu sonho..."
                  rows="3"
                  className="w-full px-4 py-3 border rounded-lg outline-none focus:border-[#667eea] transition-all resize-y"
                  style={{
                    backgroundColor: colors.tertiary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  URL da Imagem (opcional)
                </label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="w-full px-4 py-3 border rounded-lg outline-none focus:border-[#667eea] transition-all"
                  style={{
                    backgroundColor: colors.tertiary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                />
              </div>

              {formData.type === "travel" && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: colors.textSecondary }}
                    >
                      País
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                      className="w-full px-4 py-3 border rounded-lg outline-none focus:border-[#667eea] transition-all"
                      style={{
                        backgroundColor: colors.tertiary,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                      }}
                    >
                      <option value="">Selecione...</option>
                      {Object.entries(countryCoordinates).map(
                        ([code, data]) => (
                          <option key={code} value={code}>
                            {data.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: colors.textSecondary }}
                    >
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      placeholder="Ex: Paris"
                      className="w-full px-4 py-3 border rounded-lg outline-none focus:border-[#667eea] transition-all"
                      style={{
                        backgroundColor: colors.tertiary,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDreamModal(false)}
                  className="flex-1 px-6 py-3 text-white text-sm font-bold transition-all duration-200 rounded-xl border-none cursor-pointer"
                  style={{ backgroundColor: "#5a6c7d" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#667eea] hover:bg-[#5568d3] text-white text-sm font-bold shadow-[0_4px_12px_rgba(102,126,234,0.3)] transition-all duration-200 rounded-xl border-none cursor-pointer"
                >
                  Salvar Sonho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalhes */}
      {showDetailModal && selectedDream && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="rounded-2xl border w-full max-w-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.secondary,
              borderColor: colors.border,
            }}
          >
            <div
              className={`h-[250px] ${
                !selectedDream.image
                  ? "bg-gradient-to-br from-[#667eea] to-[#764ba2]"
                  : ""
              } relative flex items-center justify-center`}
            >
              {selectedDream.image ? (
                <img
                  src={selectedDream.image}
                  alt={selectedDream.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-8xl">🌟</div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <h2 className="text-[28px] font-bold text-white mb-2">
                  {selectedDream.name}
                </h2>
                {selectedDream.country && (
                  <div className="text-white/90 text-sm">
                    📍 {selectedDream.city || ""}{" "}
                    {countryCoordinates[selectedDream.country]?.name || ""}
                  </div>
                )}
              </div>
            </div>

            <div className="p-8">
              {selectedDream.description && (
                <p style={{ color: colors.textSecondary }} className="mb-6">
                  {selectedDream.description}
                </p>
              )}

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div
                  className="p-4 rounded-[10px] text-center border"
                  style={{
                    backgroundColor: colors.tertiary,
                    borderColor: colors.border,
                  }}
                >
                  <div
                    className="text-[13px] mb-2 uppercase tracking-wide"
                    style={{ color: colors.textSecondary }}
                  >
                    Meta
                  </div>
                  <div
                    className="text-[16px] font-bold"
                    style={{ color: colors.textPrimary }}
                  >
                    {formatCurrency(selectedDream.target)}
                  </div>
                </div>

                <div
                  className="p-4 rounded-[10px] text-center border"
                  style={{
                    backgroundColor: colors.tertiary,
                    borderColor: colors.border,
                  }}
                >
                  <div
                    className="text-[13px] mb-2 uppercase tracking-wide"
                    style={{ color: colors.textSecondary }}
                  >
                    Economizado
                  </div>
                  <div
                    className="text-[16px] font-bold"
                    style={{ color: colors.success }}
                  >
                    {formatCurrency(selectedDream.current)}
                  </div>
                </div>

                <div
                  className="p-4 rounded-[10px] text-center border"
                  style={{
                    backgroundColor: colors.tertiary,
                    borderColor: colors.border,
                  }}
                >
                  <div
                    className="text-[13px] mb-2 uppercase tracking-wide"
                    style={{ color: colors.textSecondary }}
                  >
                    Falta
                  </div>
                  <div
                    className="text-[16px] font-bold"
                    style={{ color: colors.warning }}
                  >
                    {formatCurrency(
                      Math.max(0, selectedDream.target - selectedDream.current)
                    )}
                  </div>
                </div>
              </div>

              <div className="my-6">
                <div className="flex justify-between mb-2">
                  <span style={{ color: colors.textSecondary }}>Progresso</span>
                  <span className="font-bold" style={{ color: colors.success }}>
                    {(
                      (selectedDream.current / selectedDream.target) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div
                  className="h-4 rounded-[20px] overflow-hidden"
                  style={{ backgroundColor: colors.tertiary }}
                >
                  <div
                    className="h-full bg-gradient-to-r from-[#27ae60] to-[#2ecc71] transition-[width] duration-1000"
                    style={{
                      width: `${Math.min(
                        (selectedDream.current / selectedDream.target) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {selectedDream.targetDate && (
                <div
                  className="text-center my-5 p-3 rounded-lg"
                  style={{ backgroundColor: colors.tertiary }}
                >
                  <span style={{ color: colors.textSecondary }}>
                    Data Alvo:{" "}
                  </span>
                  <strong style={{ color: colors.textPrimary }}>
                    {new Date(selectedDream.targetDate).toLocaleDateString(
                      "pt-BR"
                    )}
                  </strong>
                </div>
              )}

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openAddAmountModal();
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-br from-[#27ae60] to-[#2ecc71] text-white text-sm font-bold shadow-[0_4px_12px_rgba(39,174,96,0.3)] rounded-xl border-none cursor-pointer"
                >
                  💰 Adicionar Valor
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openDreamModal(selectedDream.id);
                  }}
                  className="flex-1 px-6 py-3 bg-[#5b8def] hover:bg-[#4a7dd9] text-white text-sm font-bold rounded-xl border-none cursor-pointer"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => deleteDream(selectedDream.id)}
                  className="flex-1 px-6 py-3 bg-[#e74c3c] hover:bg-[#c0392b] text-white text-sm font-bold rounded-xl border-none cursor-pointer"
                >
                  🗑️ Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Adicionar Valor */}
      {showAddAmountModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowAddAmountModal(false)}
        >
          <div
            className="rounded-2xl border p-8 w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.secondary,
              borderColor: colors.border,
            }}
          >
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: colors.textPrimary }}
            >
              💰 Adicionar Valor ao Sonho
            </h2>

            <form onSubmit={saveAmount}>
              <div className="mb-4">
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amountData.value}
                  onChange={(e) =>
                    setAmountData({ ...amountData, value: e.target.value })
                  }
                  placeholder="Ex: 500.00"
                  required
                  className="w-full px-4 py-3 border rounded-lg outline-none focus:border-[#667eea] transition-all"
                  style={{
                    backgroundColor: colors.tertiary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  Data
                </label>
                <input
                  type="date"
                  value={amountData.date}
                  onChange={(e) =>
                    setAmountData({ ...amountData, date: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border rounded-lg outline-none focus:border-[#667eea] transition-all"
                  style={{
                    backgroundColor: colors.tertiary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddAmountModal(false)}
                  className="flex-1 px-6 py-3 bg-[#5a6c7d] hover:bg-[#4a5c6d] text-white text-sm font-bold transition-all duration-200 rounded-xl border-none cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#27ae60] hover:bg-[#229954] text-white text-sm font-bold shadow-[0_4px_12px_rgba(39,174,96,0.3)] transition-all duration-200 rounded-xl border-none cursor-pointer"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetasSonhos;
