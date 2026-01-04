import React, { useState, useEffect } from "react";

const MetasSonhos = () => {
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
  const [currentImage, setCurrentImage] = useState(null);

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
        setCurrentImage(dream.image);
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
      setCurrentImage(null);
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

    const dreamData = {
      id: editingDreamId || Date.now().toString(),
      type: formData.type,
      name: formData.name.trim(),
      target: parseFloat(formData.target),
      current: parseFloat(formData.current) || 0,
      targetDate: formData.targetDate || null,
      description: formData.description.trim(),
      image: formData.imageUrl || currentImage || null,
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
      showToast(`R$ ${formatCurrency(amount)} adicionado! 💰`);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCurrentImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const showToast = (message) => {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #27ae60;
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
      className="ml-[260px] min-h-screen bg-[#0f1419]"
      style={{ padding: "40px 50px" }}
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `}</style>

      {/* Header Motivacional */}
      <div style={{ marginBottom: "30px" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "30px",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              content: '""',
              position: "absolute",
              top: "-50%",
              right: "-20%",
              width: "300px",
              height: "300px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
            }}
          ></div>

          <div
            style={{
              fontSize: "48px",
              animation: "float 3s ease-in-out infinite",
            }}
          >
            💫
          </div>

          <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
            <div
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.9)",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontWeight: "600",
              }}
            >
              Frase do Dia
            </div>
            <p
              style={{
                fontSize: "20px",
                color: "white",
                fontWeight: "500",
                lineHeight: "1.6",
                fontStyle: "italic",
                margin: 0,
              }}
            >
              {dailyQuote}
            </p>
          </div>
        </div>
      </div>

      {/* Botão Adicionar */}
      <div
        className="flex"
        style={{ justifyContent: "flex-end", marginBottom: "30px" }}
      >
        <button
          onClick={() => openDreamModal()}
          className="border-none rounded-lg cursor-pointer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            fontSize: "15px",
            fontWeight: "600",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
            borderRadius: "12px",
          }}
        >
          <span>✨</span> Adicionar Novo Sonho
        </button>
      </div>

      {/* Grid de Sonhos */}
      {dreams.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 20px",
            background: "#1a1f2e",
            borderRadius: "16px",
            border: "2px dashed #2a2f3e",
          }}
        >
          <div
            style={{
              fontSize: "72px",
              marginBottom: "20px",
              opacity: 0.3,
              animation: "pulse 2s ease-in-out infinite",
            }}
          >
            🌟
          </div>
          <h3
            style={{ color: "#ffffff", marginBottom: "12px", fontSize: "20px" }}
          >
            Nenhum sonho cadastrado ainda
          </h3>
          <p style={{ color: "#8b92a7", fontSize: "14px" }}>
            Comece agora a planejar seus objetivos e conquistas!
          </p>
        </div>
      ) : (
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "24px",
            marginBottom: "30px",
          }}
        >
          {dreams.map((dream) => {
            const progress = (dream.current / dream.target) * 100;
            const remaining = dream.target - dream.current;

            return (
              <div
                key={dream.id}
                onClick={() => openDetailModal(dream.id)}
                style={{
                  background: "#1a1f2e",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  border: "1px solid #2a2f3e",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 32px rgba(0, 0, 0, 0.5)";
                  e.currentTarget.style.borderColor = "#667eea";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.3)";
                  e.currentTarget.style.borderColor = "#2a2f3e";
                }}
              >
                {/* Imagem */}
                <div
                  style={{
                    width: "100%",
                    height: "200px",
                    background: dream.image
                      ? "none"
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "64px",
                    position: "relative",
                  }}
                >
                  {dream.image ? (
                    <img
                      src={dream.image}
                      alt={dream.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    typeIcons[dream.type]
                  )}

                  <div
                    style={{
                      position: "absolute",
                      top: "12px",
                      left: "12px",
                      background: "rgba(0, 0, 0, 0.7)",
                      backdropFilter: "blur(10px)",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {typeIcons[dream.type]} {typeLabels[dream.type]}
                  </div>
                </div>

                {/* Conteúdo */}
                <div style={{ padding: "24px" }}>
                  <div style={{ marginBottom: "16px" }}>
                    <h3
                      style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        color: "#ffffff",
                        marginBottom: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {dream.name}
                    </h3>

                    {dream.country && (
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#8b92a7",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        📍 {dream.city || ""}{" "}
                        {dream.city && dream.country ? "•" : ""}{" "}
                        {countryCoordinates[dream.country]?.name || ""}
                      </div>
                    )}
                  </div>

                  {/* Progress */}
                  <div style={{ margin: "20px 0" }}>
                    <div
                      className="flex"
                      style={{
                        justifyContent: "space-between",
                        marginBottom: "8px",
                        fontSize: "13px",
                      }}
                    >
                      <span style={{ color: "#27ae60", fontWeight: "700" }}>
                        R$ {formatCurrency(dream.current)}
                      </span>
                      <span style={{ color: "#8b92a7" }}>
                        R$ {formatCurrency(dream.target)}
                      </span>
                    </div>

                    <div
                      style={{
                        height: "12px",
                        background: "#252b3b",
                        borderRadius: "20px",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          background:
                            "linear-gradient(90deg, #27ae60 0%, #2ecc71 100%)",
                          borderRadius: "20px",
                          width: `${Math.min(progress, 100)}%`,
                          transition: "width 1s ease",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background:
                              "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                            animation: "shimmer 2s infinite",
                          }}
                        ></div>
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "#8b92a7",
                        marginTop: "6px",
                        textAlign: "center",
                      }}
                    >
                      {progress.toFixed(1)}% conquistado
                    </div>
                  </div>

                  {/* Footer */}
                  <div
                    className="flex"
                    style={{
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "16px",
                      borderTop: "1px solid #2a2f3e",
                    }}
                  >
                    <div style={{ fontSize: "13px", color: "#8b92a7" }}>
                      Falta:{" "}
                      <strong style={{ color: "#f39c12", fontSize: "16px" }}>
                        R$ {formatCurrency(remaining)}
                      </strong>
                    </div>

                    {dream.targetDate && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#8b92a7",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        📅{" "}
                        {new Date(dream.targetDate).toLocaleDateString("pt-BR")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Criar/Editar Sonho */}
      {showDreamModal && (
        <div
          className={`modal ${showDreamModal ? "active" : ""}`}
          onClick={() => setShowDreamModal(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "600px" }}
          >
            <h2>{editingDreamId ? "✏️ Editar Sonho" : "✨ Novo Sonho"}</h2>

            <form onSubmit={saveDream}>
              <div className="form-group">
                <label>Tipo de Sonho</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="travel">🌍 Viagem</option>
                  <option value="purchase">🛍️ Compra</option>
                  <option value="savings">💰 Poupança</option>
                  <option value="investment">📈 Investimento</option>
                  <option value="education">📚 Educação</option>
                  <option value="other">⭐ Outro</option>
                </select>
              </div>

              <div className="form-group">
                <label>Nome do Sonho</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ex: Viagem para Paris"
                  required
                />
              </div>

              <div className="grid grid-cols-2" style={{ gap: "16px" }}>
                <div className="form-group">
                  <label>Valor Meta (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.target}
                    onChange={(e) =>
                      setFormData({ ...formData, target: e.target.value })
                    }
                    placeholder="10000"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Valor Atual (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.current}
                    onChange={(e) =>
                      setFormData({ ...formData, current: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Data Alvo (opcional)</label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) =>
                    setFormData({ ...formData, targetDate: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Descrição (opcional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descreva seu sonho..."
                  rows="3"
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#1e2738",
                    border: "2px solid #2a2f3e",
                    borderRadius: "8px",
                    color: "#e4e6eb",
                    fontSize: "14px",
                    resize: "vertical",
                  }}
                />
              </div>

              <div className="form-group">
                <label>URL da Imagem (opcional)</label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              {formData.type === "travel" && (
                <>
                  <div className="grid grid-cols-2" style={{ gap: "16px" }}>
                    <div className="form-group">
                      <label>País</label>
                      <select
                        value={formData.country}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value })
                        }
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

                    <div className="form-group">
                      <label>Cidade</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        placeholder="Ex: Paris"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowDreamModal(false)}
                  className="border-none rounded-lg cursor-pointer bg-[#5a6c7d] hover:bg-[#4a5c6d]"
                  style={{
                    padding: "12px 24px",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "bold",
                    transition: "all 0.2s ease",
                    borderRadius: "12px",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="border-none rounded-lg cursor-pointer bg-[#667eea] hover:bg-[#5568d3]"
                  style={{
                    padding: "12px 24px",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "bold",
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                    transition: "all 0.2s ease",
                    borderRadius: "12px",
                  }}
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
          className={`modal ${showDetailModal ? "active" : ""}`}
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "700px", padding: 0, overflow: "hidden" }}
          >
            {/* Header */}
            <div
              style={{
                height: "250px",
                background: selectedDream.image
                  ? "none"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {selectedDream.image ? (
                <img
                  src={selectedDream.image}
                  alt={selectedDream.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div style={{ fontSize: "80px" }}>🌟</div>
              )}

              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "24px",
                  background:
                    "linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)",
                }}
              >
                <h2
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "white",
                    marginBottom: "8px",
                  }}
                >
                  {selectedDream.name}
                </h2>
                {selectedDream.country && (
                  <div
                    style={{
                      color: "rgba(255, 255, 255, 0.9)",
                      fontSize: "14px",
                    }}
                  >
                    📍 {selectedDream.city || ""}{" "}
                    {countryCoordinates[selectedDream.country]?.name || ""}
                  </div>
                )}
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: "32px" }}>
              {selectedDream.description && (
                <p style={{ color: "#8b92a7", marginBottom: "24px" }}>
                  {selectedDream.description}
                </p>
              )}

              {/* Stats */}
              <div
                className="grid grid-cols-3"
                style={{ gap: "16px", marginBottom: "24px" }}
              >
                <div
                  style={{
                    background: "#1e2738",
                    padding: "16px",
                    borderRadius: "10px",
                    textAlign: "center",
                    border: "1px solid #2a2f3e",
                  }}
                >
                  <div
                    style={{
                      fontSize: "17px",
                      color: "#8b92a7",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Meta
                  </div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#ffffff",
                      position: "relative",
                    }}
                  >
                    {formatCurrency(selectedDream.target)}
                  </div>
                </div>

                <div
                  style={{
                    background: "#1e2738",
                    padding: "16px",
                    borderRadius: "10px",
                    textAlign: "center",
                    border: "1px solid #2a2f3e",
                  }}
                >
                  <div
                    style={{
                      fontSize: "17px",
                      color: "#8b92a7",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Economizado
                  </div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#27ae60",
                      position: "relative",
                    }}
                  >
                    {formatCurrency(selectedDream.current)}
                  </div>
                </div>

                <div
                  style={{
                    background: "#1e2738",
                    padding: "16px",
                    borderRadius: "10px",
                    textAlign: "center",
                    border: "1px solid #2a2f3e",
                  }}
                >
                  <div
                    style={{
                      fontSize: "17px",
                      color: "#8b92a7",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Falta
                  </div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#f39c12",
                      position: "relative",
                    }}
                  >
                  
                    {formatCurrency(
                      selectedDream.target - selectedDream.current
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ margin: "24px 0" }}>
                <div
                  className="flex"
                  style={{
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ color: "#8b92a7" }}>Progresso</span>
                  <span style={{ color: "#27ae60", fontWeight: "700" }}>
                    {(
                      (selectedDream.current / selectedDream.target) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div
                  style={{
                    height: "16px",
                    background: "#252b3b",
                    borderRadius: "20px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      background:
                        "linear-gradient(90deg, #27ae60 0%, #2ecc71 100%)",
                      width: `${Math.min(
                        (selectedDream.current / selectedDream.target) * 100,
                        100
                      )}%`,
                      transition: "width 1s ease",
                    }}
                  ></div>
                </div>
              </div>

              {selectedDream.targetDate && (
                <div
                  style={{
                    textAlign: "center",
                    margin: "20px 0",
                    padding: "12px",
                    background: "#1e2738",
                    borderRadius: "8px",
                  }}
                >
                  <span style={{ color: "#8b92a7" }}>Data Alvo: </span>
                  <strong style={{ color: "#ffffff" }}>
                    {new Date(selectedDream.targetDate).toLocaleDateString(
                      "pt-BR"
                    )}
                  </strong>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex" style={{ gap: "12px", marginTop: "20px" }}>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openAddAmountModal();
                  }}
                  className="border-none rounded-lg cursor-pointer"
                  style={{
                    flex: 1,
                    padding: "12px 24px",
                    background:
                      "linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "bold",
                    boxShadow: "0 4px 12px rgba(39, 174, 96, 0.3)",
                    borderRadius: "12px",
                  }}
                >
                  💰 Adicionar Valor
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openDreamModal(selectedDream.id);
                  }}
                  className="border-none rounded-lg cursor-pointer bg-[#5b8def] hover:bg-[#4a7dd9]"
                  style={{
                    flex: 1,
                    padding: "12px 24px",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "bold",
                    borderRadius: "12px",
                  }}
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => deleteDream(selectedDream.id)}
                  className="border-none rounded-lg cursor-pointer bg-[#e74c3c] hover:bg-[#c0392b]"
                  style={{
                    flex: 1,
                    padding: "12px 24px",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "bold",
                    borderRadius: "12px",
                  }}
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
          className={`modal ${showAddAmountModal ? "active" : ""}`}
          onClick={() => setShowAddAmountModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>💰 Adicionar Valor ao Sonho</h2>

            <form onSubmit={saveAmount}>
              <div className="form-group">
                <label>Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amountData.value}
                  onChange={(e) =>
                    setAmountData({ ...amountData, value: e.target.value })
                  }
                  placeholder="Ex: 500.00"
                  required
                />
              </div>

              <div className="form-group">
                <label>Data</label>
                <input
                  type="date"
                  value={amountData.date}
                  onChange={(e) =>
                    setAmountData({ ...amountData, date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowAddAmountModal(false)}
                  className="border-none rounded-lg cursor-pointer bg-[#5a6c7d] hover:bg-[#4a5c6d]"
                  style={{
                    padding: "12px 24px",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "bold",
                    transition: "all 0.2s ease",
                    borderRadius: "12px",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="border-none rounded-lg cursor-pointer bg-[#27ae60] hover:bg-[#229954]"
                  style={{
                    padding: "12px 24px",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "bold",
                    boxShadow: "0 4px 12px rgba(39, 174, 96, 0.3)",
                    transition: "all 0.2s ease",
                    borderRadius: "12px",
                  }}
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
