import React, { useState, useEffect } from "react";
import {
  Upload,
  CreditCard,
  Trash2,
  ChevronLeft,
  Search,
  Loader2,
  AlertCircle,
  X,
  FileText,
  Wallet,
  TrendingUp,
  Calendar,
  DollarSign,
  Check,
  Sparkles, // <-- Já está aqui!
  ArrowUpRight,
  Zap,
  BarChart3,
  Star,
} from "lucide-react";

const Cartoes = () => {
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
    secondary: theme === "dark" ? "#161B26" : "#ffffff",
    tertiary: theme === "dark" ? "#0B0E14" : "#f1f3f5",
    border: theme === "dark" ? "rgba(255,255,255,0.05)" : "#dee2e6",
    textPrimary: theme === "dark" ? "#ffffff" : "#1a1f2e",
    textSecondary: theme === "dark" ? "#8b92a7" : "#6c757d",
    cardHover:
      theme === "dark" ? "rgba(59,130,246,0.1)" : "rgba(59,130,246,0.05)",
  };

  const bankOptions = [
    { id: "mercado_pago", name: "Mercado Pago", icon: "💳", color: "#00BFFF" },
    { id: "sicredi", name: "Sicredi", icon: "🏦", color: "#FF6B00" },
    { id: "nubank", name: "Nubank", icon: "🟣", color: "#8A05BE" },
  ];

  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem("finance_premium_v4");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeCardId, setActiveCardId] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [showBankModal, setShowBankModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    localStorage.setItem("finance_premium_v4", JSON.stringify(cards));
  }, [cards]);

  const openBankModal = () => {
    setShowBankModal(true);
    setSelectedBank("");
    setSelectedFile(null);
    setFileName("");
    setError(null);
  };

  const processPdf = async (file, bankId) => {
    if (!file || !bankId) {
      return;
    }

    setIsExtracting(true);
    setError(null);

    try {
      if (!window.pdfjsLib) {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        document.head.appendChild(script);
        await new Promise((r) => (script.onload = r));
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer })
        .promise;

      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      const normalizedText = fullText.replace(/[\u00A0\s]+/g, " ");
      let foundNewCard = null;

      if (bankId === "mercado_pago") {
        foundNewCard = await processMercadoPago(normalizedText, file.name);
      } else if (bankId === "sicredi") {
        foundNewCard = await processSicredi(normalizedText, file.name);
      } else if (bankId === "nubank") {
        foundNewCard = await processNubank(normalizedText, file.name);
      } else {
        foundNewCard = await processGeneric(normalizedText, bankId, file.name);
      }

      if (foundNewCard) {
        setCards((prev) => {
          const existingIds = prev.map((c) => `${c.bank}-${c.lastDigits}`);
          const isDuplicate = existingIds.includes(
            `${foundNewCard.bank}-${foundNewCard.lastDigits}`
          );

          if (isDuplicate) {
            return prev.map((card) =>
              card.id === `${foundNewCard.bank}-${foundNewCard.lastDigits}`
                ? { ...card, transactions: foundNewCard.transactions }
                : card
            );
          } else {
            return [...prev, foundNewCard];
          }
        });

        setShowBankModal(false);
        setActiveCardId(foundNewCard.id);
        setSelectedBank("");
        setSelectedFile(null);
        setFileName("");
      } else {
        setError(
          "Não conseguimos extrair informações do cartão deste PDF. Verifique se é uma fatura válida do banco selecionado."
        );
      }
    } catch (err) {
      setError(`Erro técnico ao ler o PDF: ${err.message}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const processMercadoPago = async (normalizedText, fileName) => {
    const detectedBank = "Mercado Pago";
    const mercadoPagoPattern = /Cartão\s+(\w+)\s+\[(\*+)(\d{4})\]/gi;
    const cartoesEncontrados = [];

    let match;
    while ((match = mercadoPagoPattern.exec(normalizedText)) !== null) {
      cartoesEncontrados.push({
        fullMatch: match[0],
        brand: match[1],
        asteriscos: match[2],
        lastDigits: match[3],
        startIndex: match.index,
        endIndex: mercadoPagoPattern.lastIndex,
      });
    }

    if (cartoesEncontrados.length > 0) {
      const primeiroCartao = cartoesEncontrados[0];
      const startIdx = primeiroCartao.endIndex;
      const endIdx = cartoesEncontrados[1]
        ? cartoesEncontrados[1].startIndex
        : normalizedText.length;
      const sectionText = normalizedText.substring(startIdx, endIdx);

      const transactions = [];
      const transRegex =
        /(\d{2}\/(?:\d{2}|[a-z]{3}))\s+([\w\s*.-]{3,})\s+(?:R\$\s+)?([\d,.]+)/gi;

      let transMatch;
      while ((transMatch = transRegex.exec(sectionText)) !== null) {
        const desc = transMatch[2].trim();
        const valueStr = transMatch[3].replace(/\./g, "").replace(",", ".");
        const value = parseFloat(valueStr);

        if (
          value > 0 &&
          !desc.toLowerCase().includes("pagamento") &&
          desc.length > 3
        ) {
          transactions.push({
            date: transMatch[1],
            description: desc,
            value: value.toFixed(2),
          });
        }
      }

      if (transactions.length > 0) {
        return {
          id: `${primeiroCartao.lastDigits}-${Date.now()}-mercado-pago`,
          bank: detectedBank,
          brand: primeiroCartao.brand,
          name: `Cartão ${primeiroCartao.brand} ${detectedBank}`,
          lastDigits: primeiroCartao.lastDigits,
          color: "#00BFFF",
          transactions,
        };
      }
    } else {
      const fallbackPattern = /\[(\*+)(\d{4})\]/g;
      const fallbackMatches = [];

      let fallbackMatch;
      while ((fallbackMatch = fallbackPattern.exec(normalizedText)) !== null) {
        fallbackMatches.push({
          fullMatch: fallbackMatch[0],
          asteriscos: fallbackMatch[1],
          lastDigits: fallbackMatch[2],
        });
      }

      if (fallbackMatches.length > 0) {
        const primeiroFallback = fallbackMatches[0];
        const transactions = [];
        const transRegex =
          /(\d{2}\/(?:\d{2}|[a-z]{3}))\s+([\w\s*.-]{3,})\s+(?:R\$\s+)?([\d,.]+)/gi;

        let transMatch;
        while ((transMatch = transRegex.exec(normalizedText)) !== null) {
          const desc = transMatch[2].trim();
          const valueStr = transMatch[3].replace(/\./g, "").replace(",", ".");
          const value = parseFloat(valueStr);

          if (
            value > 0 &&
            !desc.toLowerCase().includes("pagamento") &&
            desc.length > 3
          ) {
            transactions.push({
              date: transMatch[1],
              description: desc,
              value: value.toFixed(2),
            });
          }
        }

        if (transactions.length > 0) {
          let brand = "Card";
          if (/visa/i.test(normalizedText)) brand = "Visa";
          else if (/mastercard|master card/i.test(normalizedText))
            brand = "Mastercard";
          else if (/elo/i.test(normalizedText)) brand = "Elo";

          return {
            id: `${
              primeiroFallback.lastDigits
            }-${Date.now()}-mercado-pago-fallback`,
            bank: detectedBank,
            brand: brand,
            name: `Cartão ${detectedBank}`,
            lastDigits: primeiroFallback.lastDigits,
            color: "#00BFFF",
            transactions,
          };
        }
      }
    }

    return null;
  };

  const processNubank = async (normalizedText, fileName) => {
    const detectedBank = "Nubank";
    const limitePattern =
      /Limite total do cartão de crédito:\s*R\$\s*([\d.,]+)/i;
    const limiteMatch = normalizedText.match(limitePattern);
    const limite = limiteMatch ? limiteMatch[1] : "0,00";

    const brand = "Mastercard";

    const transactions = [];
    const nubankTransRegex =
      /(\d{1,2}\s+[A-Z]{3})\s+(?:•{4}|\.{4})\s+(\d{4})\s+([\w\s\*\.\-]{5,50})\s+R\$\s*([\d\.,]+)/gi;

    const transacoesSection = normalizedText.match(
      /TRANSAÇÕES[\s\S]+?(?=Pagamentos e Financiamentos|$)/i
    );

    let searchText = normalizedText;
    if (transacoesSection) {
      searchText = transacoesSection[0];
    } else {
      const nomeSection = normalizedText.match(
        /Christian S Castro[\s\S]+?(?=Pagamentos e Financiamentos|$)/i
      );
      if (nomeSection) {
        searchText = nomeSection[0];
      }
    }

    let matchCount = 0;
    let transMatch;

    while (
      (transMatch = nubankTransRegex.exec(searchText)) !== null &&
      matchCount < 100
    ) {
      const date = transMatch[1].trim();
      const lastDigits = transMatch[2].trim();
      let desc = transMatch[3].trim();
      const valueStr = transMatch[4].replace(/\./g, "").replace(",", ".");
      const value = parseFloat(valueStr);

      let formattedDate = date;
      const monthMap = {
        JAN: "01",
        FEV: "02",
        MAR: "03",
        ABR: "04",
        MAI: "05",
        JUN: "06",
        JUL: "07",
        AGO: "08",
        SET: "09",
        OUT: "10",
        NOV: "11",
        DEZ: "12",
      };

      const parts = date.split(/\s+/);
      if (parts.length === 2) {
        const day = parts[0].padStart(2, "0");
        const monthAbbr = parts[1].toUpperCase();
        const monthNum = monthMap[monthAbbr] || "00";
        formattedDate = `${day}/${monthNum}`;
      }

      desc = desc.replace(/\s+/g, " ").trim();

      transactions.push({
        date: formattedDate,
        description: `${desc} (••••${lastDigits})`,
        value: value.toFixed(2),
      });

      matchCount++;
    }

    if (transactions.length === 0) {
      const altRegex =
        /(\d{1,2}\s+[A-Z]{3})\s+([\w\s\*\.\-]{5,50})\s+R\$\s*([\d\.,]+)/gi;

      while (
        (transMatch = altRegex.exec(searchText)) !== null &&
        matchCount < 100
      ) {
        const date = transMatch[1].trim();
        let desc = transMatch[2].trim();
        const valueStr = transMatch[3].replace(/\./g, "").replace(",", ".");
        const value = parseFloat(valueStr);

        if (
          value > 0 &&
          !desc.match(/Christian|TRANSAÇÕES|DE \d+/i) &&
          desc.length > 3
        ) {
          let formattedDate = date;
          const parts = date.split(/\s+/);
          if (parts.length === 2) {
            const day = parts[0].padStart(2, "0");
            const monthAbbr = parts[1].toUpperCase();
            const monthMap = {
              JAN: "01",
              FEV: "02",
              MAR: "03",
              ABR: "04",
              MAI: "05",
              JUN: "06",
              JUL: "07",
              AGO: "08",
              SET: "09",
              OUT: "10",
              NOV: "11",
              DEZ: "12",
            };
            const monthNum = monthMap[monthAbbr] || "00";
            formattedDate = `${day}/${monthNum}`;
          }

          desc = desc.replace(/\s+/g, " ").trim();

          transactions.push({
            date: formattedDate,
            description: desc,
            value: value.toFixed(2),
          });

          matchCount++;
        }
      }
    }

    let lastDigits = "0000";
    if (transactions.length > 0) {
      const firstDesc = transactions[0].description;
      const digitMatch = firstDesc.match(/\(••••(\d{4})\)/);
      if (digitMatch) {
        lastDigits = digitMatch[1];
      }
    }

    if (transactions.length > 0) {
      return {
        id: `${lastDigits}-${Date.now()}-nubank`,
        bank: detectedBank,
        brand: brand,
        name: `Cartão Nubank`,
        lastDigits,
        color: "#8A05BE", // ROXO
        gradient: "from-purple-500 to-purple-700",
        transactions,
      };
    }

    return null;
  };

  const processSicredi = async (normalizedText, fileName) => {
    const detectedBank = "Sicredi";
    const cardPattern = /(?:final|Final)\s+(\d{4})/i;
    const cardMatch = normalizedText.match(cardPattern);

    let lastDigits = "0000";
    if (cardMatch && cardMatch[1]) {
      lastDigits = cardMatch[1];
    }

    let brand = "Card";
    if (/visa/i.test(normalizedText)) brand = "Visa";
    else if (/mastercard|master card/i.test(normalizedText))
      brand = "Mastercard";
    else if (/elo/i.test(normalizedText)) brand = "Elo";

    const transactions = [];
    const sicrediTransRegex =
      /(\d{1,2}\/\s*[a-z]{3})\s+(?:\d{1,2}:\d{2}\s+)?([\w\s\*\.\-]{5,50})\s+(?:R\$)?\s*([\d\.]+,\d{2})/gi;

    let match;
    while ((match = sicrediTransRegex.exec(normalizedText)) !== null) {
      const date = match[1].trim();
      let desc = match[2].trim();
      const valueStr = match[3].replace(/\./g, "").replace(",", ".");
      const value = parseFloat(valueStr);

      if (
        value > 0 &&
        !desc.toLowerCase().includes("pagamento") &&
        desc.length > 3
      ) {
        desc = desc.replace(/\s+/g, " ").trim();
        transactions.push({
          date: date,
          description: desc,
          value: value.toFixed(2),
        });
      }
    }

    if (transactions.length > 0) {
      return {
        id: `${lastDigits}-${Date.now()}-sicredi`,
        bank: detectedBank,
        brand: brand,
        name: `Cartão Sicredi - ${fileName.substring(0, 20)}`,
        lastDigits,
        color: "#00C853",
        gradient: "from-green-400 to-green-600",
        transactions,
      };
    }

    return null;
  };

  const processGeneric = async (normalizedText, bankId, fileName) => {
    const bankName = bankOptions.find((b) => b.id === bankId)?.name || bankId;
    const detectedBank = bankName;

    let brand = "Card";
    if (/visa/i.test(normalizedText)) brand = "Visa";
    else if (/mastercard|master card/i.test(normalizedText))
      brand = "Mastercard";
    else if (/elo/i.test(normalizedText)) brand = "Elo";

    let lastDigits = "0000";
    const digitPatterns = [
      /final\s+(\d{4})/i,
      /termina\s+em\s+(\d{4})/i,
      /(\d{4})(?:\s*\]|\s*fim)/i,
      /\[(?:\*+\s*)?(\d{4})\]/i,
    ];

    for (const pattern of digitPatterns) {
      const match = normalizedText.match(pattern);
      if (match && match[1]) {
        lastDigits = match[1];
        break;
      }
    }

    const transactions = [];
    const transRegex =
      /(\d{1,2}[\/\-\.]\d{1,2})\s+([\w\s\*\.\-]{5,50})\s+(?:R\$|RS|\$)?\s*([\d\.]+,\d{2})/gi;

    let match;
    while ((match = transRegex.exec(normalizedText)) !== null) {
      const date = match[1].trim();
      let desc = match[2].trim();
      const valueStr = match[3].replace(/\./g, "").replace(",", ".");
      const value = parseFloat(valueStr);

      if (
        value > 0 &&
        !desc.toLowerCase().includes("pagamento") &&
        desc.length > 3
      ) {
        desc = desc.replace(/\s+/g, " ").trim();
        transactions.push({
          date: date,
          description: desc,
          value: value.toFixed(2),
        });
      }
    }

    if (transactions.length > 0) {
      return {
        id: `${lastDigits}-${Date.now()}-${bankId}`,
        bank: detectedBank,
        brand: brand,
        name: `Cartão ${bankName} - ${fileName.substring(0, 20)}`,
        lastDigits,
        color: bankOptions.find((b) => b.id === bankId)?.color || "#3b82f6",
        transactions,
      };
    }

    return null;
  };

  const deleteCard = (e, id) => {
    e.stopPropagation();
    if (window.confirm("Remover este cartão?")) {
      setCards((prev) => prev.filter((c) => c.id !== id));
      if (activeCardId === id) setActiveCardId(null);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleImport = () => {
    if (!selectedBank) {
      setError("Por favor, selecione um banco.");
      return;
    }
    if (!selectedFile) {
      setError("Por favor, selecione um arquivo PDF.");
      return;
    }

    processPdf(selectedFile, selectedBank);
  };

  const activeCard = cards.find((c) => c.id === activeCardId);

  return (
    <div
      className="ml-[260px] flex-1 min-h-screen transition-colors duration-300 p-8"
      style={{ backgroundColor: colors.primary }}
    >
      <div className="max-w-7xl mx-auto">
        {/* HEADER COM GLASSMORPHISM */}
        <header className="relative mb-12 mt-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl -z-10" />

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 blur-lg opacity-50" />
                  <div className="relative p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl">
                    <Wallet className="text-white" size={22} />
                  </div>
                </div>
                <div>
                  <h1
                    className="text-2xl font-black tracking-tight"
                    style={{ color: colors.textPrimary }}
                  >
                    Meus Cartões
                  </h1>
                  <p
                    className="text-xs mt-0.5 flex items-center gap-1.5"
                    style={{ color: colors.textSecondary }}
                  >
                    <Sparkles size={12} className="text-yellow-400" />
                    Controle financeiro automatizado via PDF
                  </p>
                </div>
              </div>
            </div>

            {!activeCardId && (
              <button
                onClick={openBankModal}
                className="group relative overflow-hidden px-8 py-4 rounded-2xl font-black text-white transition-all duration-500 hover:scale-105 hover:shadow-2xl shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex items-center gap-3">
                  <Upload size={22} />
                  <span className="text-sm tracking-wider">
                    IMPORTAR FATURA
                  </span>
                  <ArrowUpRight
                    size={18}
                    className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300"
                  />
                </div>
                <div className="absolute inset-0 -z-10">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700" />
                </div>
              </button>
            )}
          </div>

          {/* STATS CARDS - Só aparece quando tem cartões */}
          {!activeCardId && cards.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {/* Total de Cartões */}
              <div
                className="relative group overflow-hidden p-5 rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                style={{
                  backgroundColor: colors.secondary,
                  borderColor: colors.border,
                }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-xl" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-[10px] uppercase tracking-widest font-bold"
                      style={{ color: colors.textSecondary }}
                    >
                      Total Cartões
                    </span>
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <CreditCard size={16} className="text-blue-500" />
                    </div>
                  </div>
                  <p
                    className="text-3xl font-black mb-1"
                    style={{ color: colors.textPrimary }}
                  >
                    {cards.length}
                  </p>
                  <p
                    className="text-[10px]"
                    style={{ color: colors.textSecondary }}
                  >
                    {cards.length === 1 ? "cartão ativo" : "cartões ativos"}
                  </p>
                </div>
              </div>

              {/* Total Gasto */}
              <div
                className="relative group overflow-hidden p-5 rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                style={{
                  backgroundColor: colors.secondary,
                  borderColor: colors.border,
                }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-500/10 to-transparent rounded-full blur-xl" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-[10px] uppercase tracking-widest font-bold"
                      style={{ color: colors.textSecondary }}
                    >
                      Total Gasto
                    </span>
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <TrendingUp size={16} className="text-red-500" />
                    </div>
                  </div>
                  <p className="text-3xl font-black mb-1 text-red-500">
                    R${" "}
                    {cards
                      .reduce((acc, card) => {
                        return (
                          acc +
                          card.transactions.reduce(
                            (sum, t) => sum + parseFloat(t.value),
                            0
                          )
                        );
                      }, 0)
                      .toFixed(2)}
                  </p>
                  <p
                    className="text-[10px]"
                    style={{ color: colors.textSecondary }}
                  >
                    soma de todas as faturas
                  </p>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* ERROR ALERT */}
        {error && (
          <div
            className="mb-8 p-5 border rounded-2xl flex justify-between items-center text-sm backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300"
            style={{
              backgroundColor: "rgba(239,68,68,0.1)",
              borderColor: "rgba(239,68,68,0.3)",
              color: "#ef4444",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertCircle size={18} />
              </div>
              <span className="font-semibold">{error}</span>
            </div>
            <button
              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
              onClick={() => setError(null)}
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* LISTA DE CARTÕES */}
        {!activeCardId ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cards.map((card, index) => (
              <div
                key={card.id}
                onClick={() => setActiveCardId(card.id)}
                className="group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${card.color}15 0%, ${card.color}05 100%)`,
                  border: `1px solid ${colors.border}`,
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                  minHeight: "200px",
                }}
              >
                {/* Efeito de brilho */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Botão de deletar */}
                <button
                  onClick={(e) => deleteCard(e, card.id)}
                  className="absolute top-3 right-3 z-20 p-2 rounded-lg bg-black/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:scale-110 transition-all duration-300"
                >
                  <Trash2 size={14} />
                </button>

                {/* Conteúdo do cartão */}
                <div className="relative p-5 h-full flex flex-col justify-between">
                  {/* Header do cartão */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {bankOptions.find((b) => b.name === card.bank)
                            ?.icon || "💳"}
                        </span>
                        <span
                          className="font-black text-[10px] uppercase tracking-widest"
                          style={{ color: card.color }}
                        >
                          {card.bank}
                        </span>
                      </div>
                      <h3
                        className="text-lg font-black leading-none"
                        style={{ color: colors.textPrimary }}
                      >
                        {card.brand.toUpperCase()}
                      </h3>
                    </div>
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${card.color}20` }}
                    >
                      <CreditCard size={16} style={{ color: card.color }} />
                    </div>
                  </div>

                  {/* Número do cartão */}
                  <div className="my-5">
                    <p
                      className="text-base font-mono tracking-[0.3em] font-bold"
                      style={{ color: colors.textSecondary }}
                    >
                      •••• {card.lastDigits}
                    </p>
                  </div>

                  {/* Footer do cartão */}
                  <div
                    className="flex justify-between items-end pt-4 border-t"
                    style={{ borderColor: colors.border }}
                  >
                    <div>
                      <p
                        className="text-[9px] font-bold uppercase tracking-wider mb-1"
                        style={{ color: colors.textSecondary }}
                      >
                        Total
                      </p>
                      <p
                        className="text-base font-black leading-none"
                        style={{ color: colors.textPrimary }}
                      >
                        R${" "}
                        {card.transactions
                          .reduce((acc, t) => acc + parseFloat(t.value), 0)
                          .toFixed(2)}
                      </p>
                    </div>
                    <div
                      className="flex items-center gap-1.5 text-[10px] font-bold uppercase"
                      style={{ color: colors.textSecondary }}
                    >
                      <span>{card.transactions.length}</span>
                      <ArrowUpRight
                        size={12}
                        className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* DETALHES DO CARTÃO */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => setActiveCardId(null)}
              className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider transition-all hover:gap-3 hover:text-blue-500"
              style={{ color: colors.textSecondary }}
            >
              <ChevronLeft size={20} /> Voltar para a lista
            </button>

            {/* Card Info Header */}
            <div
              className="p-6 rounded-2xl border backdrop-blur-xl"
              style={{
                backgroundColor: colors.secondary,
                borderColor: colors.border,
                background: `linear-gradient(135deg, ${activeCard.color}10 0%, ${colors.secondary} 50%)`,
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: `${activeCard.color}20` }}
                  >
                    <CreditCard size={28} style={{ color: activeCard.color }} />
                  </div>
                  <div>
                    <h2
                      className="text-2xl font-black mb-1"
                      style={{ color: colors.textPrimary }}
                    >
                      {activeCard.brand.toUpperCase()}
                    </h2>
                    <p
                      className="text-base font-mono tracking-widest"
                      style={{ color: colors.textSecondary }}
                    >
                      •••• {activeCard.lastDigits}
                    </p>
                    <p
                      className="text-[10px] uppercase tracking-wider font-bold mt-1"
                      style={{ color: activeCard.color }}
                    >
                      {activeCard.bank}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className="text-[10px] uppercase tracking-wider font-bold mb-1.5"
                    style={{ color: colors.textSecondary }}
                  >
                    Total da Fatura
                  </p>
                  <p className="text-3xl font-black text-red-500">
                    R${" "}
                    {activeCard.transactions
                      .reduce((acc, t) => acc + parseFloat(t.value), 0)
                      .toFixed(2)}
                  </p>
                  <p
                    className="text-xs mt-1.5"
                    style={{ color: colors.textSecondary }}
                  >
                    {activeCard.transactions.length} transações registradas
                  </p>
                </div>
              </div>
            </div>

            {/* Tabela de Transações */}
            <div
              className="border rounded-2xl overflow-hidden backdrop-blur-xl"
              style={{
                backgroundColor: colors.secondary,
                borderColor: colors.border,
              }}
            >
              {/* Header da tabela */}
              <div
                className="p-5 border-b backdrop-blur-sm"
                style={{
                  borderColor: colors.border,
                  backgroundColor: "rgba(255,255,255,0.02)",
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      size={16}
                      style={{ color: colors.textSecondary }}
                    />
                    <input
                      type="text"
                      placeholder="Buscar por descrição..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full border rounded-lg pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      style={{
                        backgroundColor: colors.tertiary,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                      }}
                    />
                  </div>
                  <div
                    className="flex items-center gap-2 text-xs font-bold"
                    style={{ color: colors.textSecondary }}
                  >
                    <BarChart3 size={16} />
                    <span>
                      {
                        activeCard.transactions.filter((t) =>
                          t.description
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                        ).length
                      }{" "}
                      resultados
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabela com Scroll */}
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr
                      className="text-[10px] uppercase tracking-wider font-black"
                      style={{
                        borderColor: "rgba(255,255,255,0.03)",
                        backgroundColor: colors.secondary,
                        color: colors.textSecondary,
                      }}
                    >
                      <th className="px-6 py-3 text-left">Data</th>
                      <th className="px-4 py-3 text-left">Descrição</th>
                      <th className="px-6 py-3 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody
                    className="divide-y"
                    style={{ borderColor: "rgba(255,255,255,0.03)" }}
                  >
                    {activeCard.transactions
                      .filter((t) =>
                        t.description
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                      )
                      .map((t, i) => (
                        <tr
                          key={i}
                          className="group hover:bg-white/[0.02] transition-colors"
                          style={{
                            animation: `fadeInUp 0.4s ease-out ${
                              i * 0.03
                            }s both`,
                          }}
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 rounded-lg bg-blue-500/10">
                                <Calendar size={14} className="text-blue-500" />
                              </div>
                              <span
                                className="text-sm font-mono font-bold"
                                style={{ color: colors.textSecondary }}
                              >
                                {t.date}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-5">
                            <span
                              className="text-sm font-semibold"
                              style={{ color: colors.textPrimary }}
                            >
                              {t.description}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10">
                              <DollarSign size={14} className="text-red-500" />
                              <span className="text-sm font-black text-red-500">
                                R$ {t.value}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE IMPORTAÇÃO */}
        {showBankModal && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
            onClick={() => !isExtracting && setShowBankModal(false)}
          >
            <div
              className="rounded-3xl border p-10 w-full max-w-2xl shadow-2xl animate-in slide-in-from-bottom-8 duration-500"
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: colors.secondary,
                borderColor: colors.border,
              }}
            >
              {/* Header do Modal */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600">
                    <Zap className="text-white" size={28} />
                  </div>
                  <div>
                    <h2
                      className="text-3xl font-black"
                      style={{ color: colors.textPrimary }}
                    >
                      Importar Fatura
                    </h2>
                    <p
                      className="text-sm mt-1"
                      style={{ color: colors.textSecondary }}
                    >
                      Extraia dados automaticamente do PDF
                    </p>
                  </div>
                </div>
                {!isExtracting && (
                  <button
                    className="p-3 hover:bg-red-500/20 rounded-xl transition-all hover:scale-110"
                    onClick={() => setShowBankModal(false)}
                  >
                    <X size={24} style={{ color: colors.textSecondary }} />
                  </button>
                )}
              </div>

              {/* Seleção de Banco */}
              <div className="mb-8">
                <label
                  className="block text-sm font-black uppercase tracking-wider mb-4"
                  style={{ color: colors.textPrimary }}
                >
                  1. Selecione o Banco
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {bankOptions.map((bank) => (
                    <button
                      key={bank.id}
                      onClick={() => setSelectedBank(bank.id)}
                      disabled={isExtracting}
                      className={`relative group p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                        selectedBank === bank.id ? "scale-105" : ""
                      }`}
                      style={{
                        borderColor:
                          selectedBank === bank.id ? bank.color : colors.border,
                        backgroundColor:
                          selectedBank === bank.id
                            ? `${bank.color}15`
                            : colors.tertiary,
                      }}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-4xl">{bank.icon}</span>
                        <span
                          className="text-xs font-black uppercase tracking-wider"
                          style={{
                            color:
                              selectedBank === bank.id
                                ? bank.color
                                : colors.textPrimary,
                          }}
                        >
                          {bank.name}
                        </span>
                        {selectedBank === bank.id && (
                          <div
                            className="absolute top-2 right-2 p-1.5 rounded-full"
                            style={{ backgroundColor: bank.color }}
                          >
                            <Check size={14} className="text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload de Arquivo */}
              <div className="mb-8">
                <label
                  className="block text-sm font-black uppercase tracking-wider mb-4"
                  style={{ color: colors.textPrimary }}
                >
                  2. Envie o PDF da Fatura
                </label>
                <label
                  className={`group block border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                    selectedFile
                      ? "border-green-500 bg-green-500/10"
                      : "hover:border-blue-500 hover:bg-blue-500/5"
                  }`}
                  style={{
                    borderColor: selectedFile ? "#10b981" : colors.border,
                  }}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div
                      className={`p-6 rounded-2xl transition-all duration-300 ${
                        selectedFile
                          ? "bg-green-500/20"
                          : "bg-blue-500/10 group-hover:bg-blue-500/20"
                      }`}
                    >
                      {selectedFile ? (
                        <FileText size={40} className="text-green-500" />
                      ) : (
                        <Upload
                          size={40}
                          className="text-blue-500 group-hover:scale-110 transition-transform"
                        />
                      )}
                    </div>
                    <div>
                      <span
                        className="text-lg font-black block mb-2"
                        style={{ color: colors.textPrimary }}
                      >
                        {selectedFile
                          ? "Arquivo Selecionado!"
                          : "Arraste ou Clique para Selecionar"}
                      </span>
                      <span
                        className="text-sm"
                        style={{ color: colors.textSecondary }}
                      >
                        {selectedFile ? fileName : "Arquivos PDF até 10MB"}
                      </span>
                    </div>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="application/pdf"
                    onChange={handleFileSelect}
                    disabled={isExtracting}
                  />
                </label>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-4">
                <button
                  onClick={() => setShowBankModal(false)}
                  disabled={isExtracting}
                  className="flex-1 px-8 py-4 text-sm font-black uppercase tracking-wider rounded-xl transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: colors.tertiary,
                    color: colors.textPrimary,
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleImport}
                  disabled={!selectedBank || !selectedFile || isExtracting}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-black uppercase tracking-wider shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Importar Agora
                    </>
                  )}
                </button>
              </div>

              {/* Error no Modal */}
              {error && (
                <div
                  className="mt-6 p-4 border rounded-xl flex items-center gap-3 text-sm animate-in slide-in-from-top-2 duration-300"
                  style={{
                    backgroundColor: "rgba(239,68,68,0.1)",
                    borderColor: "rgba(239,68,68,0.3)",
                    color: "#ef4444",
                  }}
                >
                  <AlertCircle size={18} />
                  <span className="font-semibold">{error}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CSS para animações */}
      <style>{`
  tr {
    border-color: ${theme === "dark" ? "rgb(35, 46, 58)" : "rgba(0,0,0,0.1)"} !important;
  }
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Custom Scrollbar */
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }

      .custom-scrollbar::-webkit-scrollbar-track {
        background: ${
          theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
        };
        border-radius: 10px;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 10px;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #5568d3 0%, #653a8b 100%);
      }
    `}</style>
    </div>
  );
};

export default Cartoes;
