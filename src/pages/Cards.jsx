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
  Sparkles,
  ArrowUpRight,
  Zap,
  BarChart3,
  Star,
  Filter,
  CalendarDays,
  Layers,
  FileStack,
  ChevronDown,
  ChevronUp,
  Plus,
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
    { id: "outros", name: "Outros", icon: "🏛️", color: "#666666" },
  ];

  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem("finance_premium_v5");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((card) => {
          if (!card.faturas && card.transactions) {
            const total = card.transactions.reduce(
              (sum, t) => sum + parseFloat(t.value),
              0
            );
            return {
              ...card,
              faturas: [
                {
                  id: `${card.id}-fatura-${Date.now()}`,
                  mesReferencia: "Sem mês",
                  dataImportacao: new Date().toISOString(),
                  total: total.toFixed(2),
                  transactions: card.transactions,
                  arquivo: "fatura_antiga.pdf",
                },
              ],
            };
          }
          return card;
        });
      } catch (error) {
        return [];
      }
    }
    return [];
  });

  const [activeCardId, setActiveCardId] = useState(null);
  const [activeFaturaId, setActiveFaturaId] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [mesFiltro, setMesFiltro] = useState("");
  const [expandedCards, setExpandedCards] = useState({});
  const [importandoParaCartaoId, setImportandoParaCartaoId] = useState(null);

  const [showBankModal, setShowBankModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    localStorage.setItem("finance_premium_v5", JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const extrairMesReferencia = (texto) => {
    const padraoMesAno =
      /(?:mês|mês\s+de\s+|referência|fatura\s+de)\s+(\w+)\/(\d{4})/i;
    const padraoMesExtenso =
      /(?:janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+(\d{4})/i;

    let match = texto.match(padraoMesAno);
    if (match) {
      const mesMap = {
        jan: "01",
        fev: "02",
        mar: "03",
        abr: "04",
        mai: "05",
        jun: "06",
        jul: "07",
        ago: "08",
        set: "09",
        out: "10",
        nov: "11",
        dez: "12",
      };
      const mes = mesMap[match[1].toLowerCase().substring(0, 3)] || "01";
      return `${mes}/${match[2]}`;
    }

    match = texto.match(padraoMesExtenso);
    if (match) {
      const meses = {
        janeiro: "01",
        fevereiro: "02",
        março: "03",
        abril: "04",
        maio: "05",
        junho: "06",
        julho: "07",
        agosto: "08",
        setembro: "09",
        outubro: "10",
        novembro: "11",
        dezembro: "12",
      };
      const mesNome = texto
        .match(
          /(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/i
        )?.[0]
        .toLowerCase();
      if (mesNome) {
        return `${meses[mesNome]}/${match[1] || new Date().getFullYear()}`;
      }
    }

    const hoje = new Date();
    return `${String(hoje.getMonth() + 1).padStart(
      2,
      "0"
    )}/${hoje.getFullYear()}`;
  };

  const openBankModal = (cardId = null) => {
    setImportandoParaCartaoId(cardId);

    if (cardId) {
      const card = cards.find((c) => c.id === cardId);
      if (card) {
        const bankId =
          bankOptions.find((b) => b.name === card.bank)?.id || "outros";
        setSelectedBank(bankId);
      }
    } else {
      setSelectedBank("");
    }

    setShowBankModal(true);
    setSelectedFile(null);
    setFileName("");
    setError(null);
  };

  const toggleCardExpansion = (cardId) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
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
      const mesReferencia = extrairMesReferencia(normalizedText);

      let faturaData = null;

      if (bankId === "mercado_pago") {
        faturaData = await processMercadoPago(
          normalizedText,
          file.name,
          mesReferencia
        );
      } else if (bankId === "sicredi") {
        faturaData = await processSicredi(
          normalizedText,
          file.name,
          mesReferencia
        );
      } else if (bankId === "nubank") {
        faturaData = await processNubank(
          normalizedText,
          file.name,
          mesReferencia
        );
      } else {
        faturaData = await processGeneric(
          normalizedText,
          bankId,
          file.name,
          mesReferencia
        );
      }

      if (faturaData) {
        const { cardInfo, fatura } = faturaData;

        setCards((prev) => {
          if (importandoParaCartaoId) {
            return prev.map((card) => {
              if (card.id === importandoParaCartaoId) {
                const faturaExistenteIndex = card.faturas?.findIndex(
                  (f) => f.mesReferencia === fatura.mesReferencia
                );

                if (faturaExistenteIndex >= 0) {
                  const novasFaturas = [...card.faturas];
                  novasFaturas[faturaExistenteIndex] = fatura;
                  return {
                    ...card,
                    faturas: novasFaturas,
                  };
                } else {
                  return {
                    ...card,
                    faturas: [...(card.faturas || []), fatura],
                  };
                }
              }
              return card;
            });
          }

          const existingCardIndex = prev.findIndex(
            (c) =>
              c.bank === cardInfo.bank && c.lastDigits === cardInfo.lastDigits
          );

          if (existingCardIndex >= 0) {
            const updatedCards = [...prev];
            const existingCard = updatedCards[existingCardIndex];

            const faturaExistenteIndex = existingCard.faturas?.findIndex(
              (f) => f.mesReferencia === fatura.mesReferencia
            );

            if (faturaExistenteIndex >= 0) {
              updatedCards[existingCardIndex].faturas[faturaExistenteIndex] =
                fatura;
            } else {
              updatedCards[existingCardIndex].faturas = [
                ...(existingCard.faturas || []),
                fatura,
              ];
            }

            return updatedCards;
          } else {
            const novoCartao = {
              ...cardInfo,
              faturas: [fatura],
            };
            return [...prev, novoCartao];
          }
        });

        setShowBankModal(false);
        setImportandoParaCartaoId(null);
        setSelectedBank("");
        setSelectedFile(null);
        setFileName("");

        setExpandedCards((prev) => ({
          ...prev,
          [cardInfo.id]: true,
        }));

        setSuccessMessage(`Fatura de ${mesReferencia} importada com sucesso!`);
      } else {
        setError(
          "Não conseguimos extrair informações do cartão deste PDF. Verifique se é uma fatura válida."
        );
      }
    } catch (err) {
      setError(`Erro técnico ao ler o PDF: ${err.message}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const processMercadoPago = async (
    normalizedText,
    fileName,
    mesReferencia
  ) => {
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

    const cartoesUnicosMap = new Map();
    cartoesEncontrados.forEach((cartao) => {
      if (!cartoesUnicosMap.has(cartao.lastDigits)) {
        cartoesUnicosMap.set(cartao.lastDigits, {
          ...cartao,
          tipo: cartao.asteriscos.length >= 8 ? "virtual" : "físico",
        });
      }
    });

    const cartoesUnicos = Array.from(cartoesUnicosMap.values());

    let brand = "Card";
    let todasTransacoes = [];

    for (let i = 0; i < cartoesUnicos.length; i++) {
      const cartao = cartoesUnicos[i];

      if (i === 0) {
        brand = cartao.brand;
      }

      const startIdx = cartao.endIndex;
      const nextCartao = cartoesUnicos[i + 1];
      let endIdx;

      if (nextCartao) {
        const nextIndex = normalizedText.indexOf(
          nextCartao.fullMatch,
          startIdx
        );
        endIdx = nextIndex >= 0 ? nextIndex : normalizedText.length;
      } else {
        endIdx = normalizedText.length;
      }

      const sectionText = normalizedText.substring(startIdx, endIdx);

      const transRegex =
        /(\d{2}\/\d{2})\s+([^\n\r]{10,100}?)\s+(?:R\$\s*)?([\d.,]+)/gi;

      let transMatch;
      const transacoesCartao = [];

      while ((transMatch = transRegex.exec(sectionText)) !== null) {
        const date = transMatch[1].trim();
        let desc = transMatch[2].trim();
        const valueStr = transMatch[3].replace(/\./g, "").replace(",", ".");
        const value = parseFloat(valueStr);

        if (
          value > 0 &&
          !desc.toLowerCase().includes("total") &&
          !desc.toLowerCase().includes("pagamento") &&
          !desc.toLowerCase().includes("fatura") &&
          !desc.toLowerCase().includes("resumo") &&
          desc.length > 5
        ) {
          const descComCartao = `${desc} (••••${cartao.lastDigits})`;

          transacoesCartao.push({
            date: date,
            description: descComCartao,
            value: value.toFixed(2),
            cardLastDigits: cartao.lastDigits,
            cardType: cartao.tipo,
            dataParaOrdenacao: new Date(
              2000 + parseInt(date.split("/")[1]),
              parseInt(date.split("/")[0]) - 1,
              1
            ),
          });
        }
      }

      todasTransacoes = [...todasTransacoes, ...transacoesCartao];
    }

    todasTransacoes.sort((a, b) => {
      const [diaA, mesA] = a.date.split("/").map(Number);
      const [diaB, mesB] = b.date.split("/").map(Number);
      const dataA = new Date(2000, mesA - 1, diaA);
      const dataB = new Date(2000, mesB - 1, diaB);
      return dataA - dataB;
    });

    if (todasTransacoes.length > 0) {
      const total = todasTransacoes.reduce(
        (sum, t) => sum + parseFloat(t.value),
        0
      );

      const cartoesUnicosTransacoes = [
        ...new Set(todasTransacoes.map((t) => t.cardLastDigits)),
      ];

      const tiposCartoes = {};
      cartoesUnicos.forEach((cartao) => {
        tiposCartoes[cartao.lastDigits] = cartao.tipo;
      });

      const cardIds = cartoesUnicosTransacoes.sort().join("-");
      const cardInfo = {
        id: `mercado-pago-${cardIds}-${Date.now()}`,
        bank: detectedBank,
        brand: brand,
        name: `Cartão ${brand} ${detectedBank}`,
        lastDigits:
          cartoesUnicosTransacoes.length > 1
            ? `${cartoesUnicosTransacoes[0]} & ${cartoesUnicosTransacoes[1]}`
            : cartoesUnicosTransacoes[0],
        color: "#00BFFF",
        tiposCartoes: tiposCartoes,
      };

      const transacoesOrdenadas = todasTransacoes.map((t) => ({
        date: t.date,
        description: t.description,
        value: t.value,
        cardType: t.cardType,
        cardLastDigits: t.cardLastDigits,
      }));

      const fatura = {
        id: `${cardInfo.id}-fatura-${Date.now()}`,
        mesReferencia: mesReferencia,
        dataImportacao: new Date().toISOString(),
        total: total.toFixed(2),
        transactions: transacoesOrdenadas,
        arquivo: fileName,
      };

      return { cardInfo, fatura };
    }

    return null;
  };

  const getCardTypeInfo = (cardLastDigits, cartaoInfo) => {
    if (!cartaoInfo || !cartaoInfo.tiposCartoes) {
      if (cardLastDigits === "0620")
        return { tipo: "físico", cor: "#3b82f6", label: "Físico" };
      if (cardLastDigits === "6417")
        return { tipo: "virtual", cor: "#8b5cf6", label: "Virtual" };
      return { tipo: "desconhecido", cor: "#6b7280", label: "Cartão" };
    }

    const tipo = cartaoInfo.tiposCartoes[cardLastDigits] || "desconhecido";
    const cores = {
      virtual: { bg: "#8b5cf6", text: "white" },
      físico: { bg: "#3b82f6", text: "white" },
      desconhecido: { bg: "#6b7280", text: "white" },
    };

    const labels = {
      virtual: "Virtual",
      físico: "Físico",
      desconhecido: "Cartão",
    };

    return {
      tipo: tipo,
      cor: cores[tipo]?.bg || "#6b7280",
      label: labels[tipo] || "Cartão",
    };
  };

  const formatarReal = (valor) => {
    if (typeof valor === "string") {
      valor = parseFloat(valor.replace(",", "."));
    }

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor || 0);
  };

  const processNubank = async (normalizedText, fileName, mesReferencia) => {
    const detectedBank = "Nubank";

    let cardType = "virtual";
    let brand = "Mastercard";
    let lastDigits = "0000";

    const textoLowerCase = normalizedText.toLowerCase();
    if (
      textoLowerCase.includes("cartão físico") ||
      textoLowerCase.includes("cartão adicional") ||
      textoLowerCase.includes("cartão tradicional")
    ) {
      cardType = "físico";
    }

    const cardPatterns = [
      /(?:final|últimos)\s+(\d{4})/i,
      /termina\s+em\s+(\d{4})/i,
      /Cartão\s+(?:final|últimos)\s+(\d{4})/i,
      /••••\s*(\d{4})/i,
    ];

    for (const pattern of cardPatterns) {
      const cardMatch = normalizedText.match(pattern);
      if (cardMatch && cardMatch[1]) {
        lastDigits = cardMatch[1];
        break;
      }
    }

    const transactions = [];
    let matchCount = 0;

    const nubankTransRegex =
      /(\d{1,2}\s+[A-Z]{3})\s+(?:•{4}|\.{4})\s+(\d{4})\s+([\w\s\*\.\-À-ÿ]{5,80})\s+R\$\s*([\d\.,]+)/gi;

    let transMatch;
    while (
      (transMatch = nubankTransRegex.exec(normalizedText)) !== null &&
      matchCount < 100
    ) {
      const date = transMatch[1].trim();
      const transLastDigits = transMatch[2].trim();
      let desc = transMatch[3].trim();
      const valueStr = transMatch[4].replace(/\./g, "").replace(",", ".");
      const value = parseFloat(valueStr);

      if (lastDigits === "0000") {
        lastDigits = transLastDigits;
      }

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

      const isDuplicate = transactions.some(
        (t) =>
          t.date === formattedDate &&
          t.description.includes(desc.substring(0, 20)) &&
          t.value === value.toFixed(2)
      );

      if (!isDuplicate) {
        transactions.push({
          date: formattedDate,
          description: `${desc} (••••${transLastDigits})`,
          value: value.toFixed(2),
          cardLastDigits: transLastDigits,
          cardType: cardType,
          dataParaOrdenacao: new Date(
            2000 + parseInt(formattedDate.split("/")[1]),
            parseInt(formattedDate.split("/")[0]) - 1,
            1
          ),
        });
        matchCount++;
      }
    }

    if (transactions.length === 0) {
      const altRegex =
        /(\d{1,2}\s+[A-Z]{3})\s+([\w\s\*\.\-À-ÿ]{5,80})\s+R\$\s*([\d\.,]+)/gi;

      while (
        (transMatch = altRegex.exec(normalizedText)) !== null &&
        matchCount < 100
      ) {
        const date = transMatch[1].trim();
        let desc = transMatch[2].trim();
        const valueStr = transMatch[3].replace(/\./g, "").replace(",", ".");
        const value = parseFloat(valueStr);

        if (
          value > 0 &&
          !desc.match(/Christian|TRANSAÇÕES|DE \d+|EXTRATO|FATURA|RESUMO/i) &&
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

          const isDuplicate = transactions.some(
            (t) =>
              t.date === formattedDate &&
              t.description.includes(desc.substring(0, 20)) &&
              t.value === value.toFixed(2)
          );

          if (!isDuplicate) {
            transactions.push({
              date: formattedDate,
              description: `${desc} (••••${lastDigits})`,
              value: value.toFixed(2),
              cardLastDigits: lastDigits,
              cardType: cardType,
              dataParaOrdenacao: new Date(
                2000 + parseInt(formattedDate.split("/")[1]),
                parseInt(formattedDate.split("/")[0]) - 1,
                1
              ),
            });
            matchCount++;
          }
        }
      }
    }

    if (transactions.length === 0) {
      const fallbackRegex =
        /(\d{1,2}\/\d{1,2})\s+([\w\s\*\.\-À-ÿ]{5,80})\s+(?:R\$)?\s*([\d\.,]+)/gi;

      while (
        (transMatch = fallbackRegex.exec(normalizedText)) !== null &&
        matchCount < 100
      ) {
        const date = transMatch[1].trim();
        let desc = transMatch[2].trim();
        const valueStr = transMatch[3].replace(/\./g, "").replace(",", ".");
        const value = parseFloat(valueStr);

        if (
          value > 0 &&
          !desc.match(/FATURA|RESUMO|EXTRATO|TOTAL|PAGAMENTO/i) &&
          desc.length > 5
        ) {
          desc = desc.replace(/\s+/g, " ").trim();

          const isDuplicate = transactions.some(
            (t) =>
              t.date === date &&
              t.description.includes(desc.substring(0, 20)) &&
              t.value === value.toFixed(2)
          );

          if (!isDuplicate) {
            transactions.push({
              date: date,
              description: `${desc} (••••${lastDigits})`,
              value: value.toFixed(2),
              cardLastDigits: lastDigits,
              cardType: cardType,
              dataParaOrdenacao: new Date(
                2000 + parseInt(date.split("/")[1]),
                parseInt(date.split("/")[0]) - 1,
                1
              ),
            });
            matchCount++;
          }
        }
      }
    }

    if (transactions.length > 0) {
      transactions.sort((a, b) => a.dataParaOrdenacao - b.dataParaOrdenacao);

      const total = transactions.reduce(
        (sum, t) => sum + parseFloat(t.value),
        0
      );

      const transacoesOrdenadas = transactions.map((t) => ({
        date: t.date,
        description: t.description,
        value: t.value,
        cardLastDigits: t.cardLastDigits,
        cardType: t.cardType,
      }));

      const cardInfo = {
        id: `nubank-${lastDigits}-${Date.now()}`,
        bank: detectedBank,
        brand: brand,
        name: `Cartão Nubank`,
        lastDigits: lastDigits,
        color: "#8A05BE",
        tiposCartoes: { [lastDigits]: cardType },
      };

      const fatura = {
        id: `${cardInfo.id}-fatura-${Date.now()}`,
        mesReferencia: mesReferencia,
        dataImportacao: new Date().toISOString(),
        total: total.toFixed(2),
        transactions: transacoesOrdenadas,
        arquivo: fileName,
      };

      return { cardInfo, fatura };
    }

    return null;
  };

  const processSicredi = async (normalizedText, fileName, mesReferencia) => {
    const detectedBank = "Sicredi";

    let cardType = "físico";
    let lastDigits = "0000";

    const cardPatterns = [
      /(?:final|Final)\s+(\d{4})/i,
      /termina\s+em\s+(\d{4})/i,
      /últimos\s+(\d{4})\s+dígitos/i,
      /Cartão\s+[^*]+\s+(\d{4})/i,
    ];

    for (const pattern of cardPatterns) {
      const cardMatch = normalizedText.match(pattern);
      if (cardMatch && cardMatch[1]) {
        lastDigits = cardMatch[1];
        break;
      }
    }

    const textoLowerCase = normalizedText.toLowerCase();
    if (
      textoLowerCase.includes("virtual") ||
      textoLowerCase.includes("digital") ||
      textoLowerCase.includes("cartão virtual") ||
      textoLowerCase.includes("cartão digital")
    ) {
      cardType = "virtual";
    } else if (
      textoLowerCase.includes("cartão físico") ||
      textoLowerCase.includes("cartão tradicional")
    ) {
      cardType = "físico";
    }

    let brand = "Card";
    if (/visa/i.test(normalizedText)) {
      brand = "Visa";
    } else if (/mastercard|master card/i.test(normalizedText)) {
      brand = "Mastercard";
    } else if (/elo/i.test(normalizedText)) {
      brand = "Elo";
    } else if (/hipercard/i.test(normalizedText)) {
      brand = "Hipercard";
    }

    const transactions = [];
    const sicrediTransRegex =
      /(\d{1,2}\/\s*[a-z]{3})\s+(?:\d{1,2}:\d{2}\s+)?([\w\s\*\.\-À-ÿ]{5,80})\s+(?:R\$)?\s*([\d\.]+,\d{2})/gi;

    let match;
    while ((match = sicrediTransRegex.exec(normalizedText)) !== null) {
      let date = match[1].trim();
      let desc = match[2].trim();
      const valueStr = match[3].replace(/\./g, "").replace(",", ".");
      const value = parseFloat(valueStr);

      if (
        value > 0 &&
        !desc.toLowerCase().includes("pagamento") &&
        !desc.toLowerCase().includes("fatura") &&
        !desc.toLowerCase().includes("total") &&
        !desc.toLowerCase().includes("saldo") &&
        desc.length > 3
      ) {
        const monthMap = {
          jan: "01",
          fev: "02",
          mar: "03",
          abr: "04",
          mai: "05",
          jun: "06",
          jul: "07",
          ago: "08",
          set: "09",
          out: "10",
          nov: "11",
          dez: "12",
        };

        const dateParts = date.split("/");
        if (dateParts.length === 2) {
          const day = dateParts[0].padStart(2, "0");
          const monthAbbr = dateParts[1].toLowerCase().substring(0, 3);
          const monthNum = monthMap[monthAbbr] || "00";
          date = `${day}/${monthNum}`;
        }

        desc = desc.replace(/\s+/g, " ").trim();

        transactions.push({
          date: date,
          description: `${desc} (••••${lastDigits})`,
          value: value.toFixed(2),
          cardLastDigits: lastDigits,
          cardType: cardType,
          dataParaOrdenacao: new Date(
            2000 + parseInt(date.split("/")[1]),
            parseInt(date.split("/")[0]) - 1,
            1
          ),
        });
      }
    }

    if (transactions.length === 0) {
      const altRegex =
        /(\d{1,2}\/\d{1,2})\s+([\w\s\*\.\-À-ÿ]{5,80})\s+(?:R\$)?\s*([\d\.]+,\d{2})/gi;

      while ((match = altRegex.exec(normalizedText)) !== null) {
        const date = match[1].trim();
        let desc = match[2].trim();
        const valueStr = match[3].replace(/\./g, "").replace(",", ".");
        const value = parseFloat(valueStr);

        if (
          value > 0 &&
          !desc.toLowerCase().includes("pagamento") &&
          !desc.toLowerCase().includes("fatura") &&
          !desc.toLowerCase().includes("total") &&
          desc.length > 5
        ) {
          desc = desc.replace(/\s+/g, " ").trim();

          transactions.push({
            date: date,
            description: `${desc} (••••${lastDigits})`,
            value: value.toFixed(2),
            cardLastDigits: lastDigits,
            cardType: cardType,
            dataParaOrdenacao: new Date(
              2000 + parseInt(date.split("/")[1]),
              parseInt(date.split("/")[0]) - 1,
              1
            ),
          });
        }
      }
    }

    if (transactions.length > 0) {
      transactions.sort((a, b) => a.dataParaOrdenacao - b.dataParaOrdenacao);

      const total = transactions.reduce(
        (sum, t) => sum + parseFloat(t.value),
        0
      );

      const transacoesOrdenadas = transactions.map((t) => ({
        date: t.date,
        description: t.description,
        value: t.value,
        cardLastDigits: t.cardLastDigits,
        cardType: t.cardType,
      }));

      const cardInfo = {
        id: `sicredi-${lastDigits}-${Date.now()}`,
        bank: detectedBank,
        brand: brand,
        name: `Cartão ${brand} ${detectedBank}`,
        lastDigits: lastDigits,
        color: "#FF6B00",
        tiposCartoes: { [lastDigits]: cardType },
      };

      const fatura = {
        id: `${cardInfo.id}-fatura-${Date.now()}`,
        mesReferencia: mesReferencia,
        dataImportacao: new Date().toISOString(),
        total: total.toFixed(2),
        transactions: transacoesOrdenadas,
        arquivo: fileName,
      };

      return { cardInfo, fatura };
    }

    return null;
  };

  const processGeneric = async (
    normalizedText,
    bankId,
    fileName,
    mesReferencia
  ) => {
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
      const total = transactions.reduce(
        (sum, t) => sum + parseFloat(t.value),
        0
      );

      const cardInfo = {
        id: `${bankId}-${lastDigits}-${Date.now()}`,
        bank: detectedBank,
        brand: brand,
        name: `Cartão ${bankName}`,
        lastDigits: lastDigits,
        color: bankOptions.find((b) => b.id === bankId)?.color || "#3b82f6",
      };

      const fatura = {
        id: `${cardInfo.id}-fatura-${Date.now()}`,
        mesReferencia: mesReferencia,
        dataImportacao: new Date().toISOString(),
        total: total.toFixed(2),
        transactions: transactions,
        arquivo: fileName,
      };

      return { cardInfo, fatura };
    }

    return null;
  };

  const deleteCard = (e, id) => {
    e.stopPropagation();
    if (window.confirm("Remover este cartão e todas as suas faturas?")) {
      setCards((prev) => prev.filter((c) => c.id !== id));
      if (activeCardId === id) {
        setActiveCardId(null);
        setActiveFaturaId(null);
      }
    }
  };

  const deleteFatura = (e, cardId, faturaId) => {
    e.stopPropagation();
    if (window.confirm("Remover esta fatura?")) {
      setCards((prev) =>
        prev.map((card) => {
          if (card.id === cardId) {
            const novasFaturas =
              card.faturas?.filter((f) => f.id !== faturaId) || [];
            return {
              ...card,
              faturas: novasFaturas,
            };
          }
          return card;
        })
      );

      if (activeFaturaId === faturaId) {
        setActiveFaturaId(null);
      }
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

  const selecionarFatura = (cardId, faturaId) => {
    setActiveCardId(cardId);
    setActiveFaturaId(faturaId);
  };

  const voltarParaLista = () => {
    setActiveCardId(null);
    setActiveFaturaId(null);
    setSearchTerm("");
  };

  const totalCartoes = cards.length;
  const totalFaturas = cards.reduce(
    (acc, card) => acc + (card.faturas?.length || 0),
    0
  );
  const totalGasto = cards.reduce((acc, card) => {
    return (
      acc +
      (card.faturas?.reduce(
        (sum, fatura) => sum + parseFloat(fatura.total || 0),
        0
      ) || 0)
    );
  }, 0);

  const todosMeses = Array.from(
    new Set(
      cards.flatMap((card) => card.faturas?.map((f) => f.mesReferencia) || [])
    )
  ).sort((a, b) => {
    const [mesA, anoA] = (a || "").split("/").map(Number);
    const [mesB, anoB] = (b || "").split("/").map(Number);
    return (anoB || 0) - (anoA || 0) || (mesB || 0) - (mesA || 0);
  });

  const activeCard = activeCardId
    ? cards.find((c) => c.id === activeCardId)
    : null;

  const activeFatura =
    activeCard && activeFaturaId
      ? (activeCard.faturas || []).find((f) => f.id === activeFaturaId)
      : null;

  const safeActiveCard = activeCard || {
    id: "",
    bank: "",
    brand: "Cartão",
    lastDigits: "0000",
    color: "#666666",
    faturas: [],
    name: "Cartão não encontrado",
  };

  const safeActiveFatura =
    activeFatura ||
    (safeActiveCard.faturas && safeActiveCard.faturas.length > 0
      ? safeActiveCard.faturas[0]
      : {
          id: "",
          mesReferencia: "Sem mês",
          total: "0.00",
          transactions: [],
          arquivo: "",
          dataImportacao: new Date().toISOString(),
        });

  useEffect(() => {
    if (
      activeCardId &&
      activeFaturaId &&
      !activeFatura &&
      safeActiveCard.faturas &&
      safeActiveCard.faturas.length > 0
    ) {
      setActiveFaturaId(safeActiveCard.faturas[0].id);
    }
  }, [activeCardId, activeFaturaId, activeFatura, safeActiveCard.faturas]);

  return (
    <div
      className="ml-[260px] flex-1 min-h-screen transition-colors duration-300 p-6"
      style={{ backgroundColor: colors.primary }}
    >
      <div className="max-w-6xl mx-auto">
        <header className="relative mb-8 mt-4">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-2xl -z-10" />

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 blur-md opacity-50" />
                  <div className="relative p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                    <Wallet className="text-white" size={18} />
                  </div>
                </div>
                <div>
                  <h1
                    className="text-xl font-bold tracking-tight"
                    style={{ color: colors.textPrimary }}
                  >
                    Meus Cartões
                  </h1>
                  <p
                    className="text-xs mt-0.5 flex items-center gap-1"
                    style={{ color: colors.textSecondary }}
                  >
                    <Sparkles size={10} className="text-yellow-400" />
                    Controle financeiro automatizado via PDF
                  </p>
                </div>
              </div>
            </div>

            {!activeCardId && cards.length > 0 && (
              <button
                onClick={() => openBankModal()}
                className="group relative overflow-hidden px-6 py-3 rounded-xl font-bold text-white transition-all duration-400 hover:scale-[1.02] hover:shadow-lg shadow-md text-sm"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                <div className="relative z-10 flex items-center gap-2">
                  <Upload size={18} />
                  <span className="text-xs tracking-wider">
                    IMPORTAR NOVA FATURA
                  </span>
                  <ArrowUpRight
                    size={14}
                    className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"
                  />
                </div>
              </button>
            )}
          </div>

          {!activeCardId && cards.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
              <div
                className="relative group overflow-hidden rounded-xl border backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer"
                style={{
                  backgroundColor: colors.secondary,
                  borderColor: colors.border,
                  padding: "1.5rem 1rem",
                }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-lg" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[9px] uppercase tracking-wider font-semibold"
                      style={{ color: colors.textSecondary }}
                    >
                      Total Cartões
                    </span>
                    <div className="p-1.5 rounded-md bg-blue-500/10">
                      <CreditCard size={14} className="text-blue-500" />
                    </div>
                  </div>
                  <p
                    className="text-2xl font-bold mb-1"
                    style={{ color: colors.textPrimary }}
                  >
                    {totalCartoes}
                  </p>
                </div>
              </div>

              <div
                className="relative group overflow-hidden p-4 rounded-xl border backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer"
                style={{
                  backgroundColor: colors.secondary,
                  borderColor: colors.border,
                }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-lg" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[9px] uppercase tracking-wider font-semibold"
                      style={{ color: colors.textSecondary }}
                    >
                      Total Faturas
                    </span>
                    <div className="p-1.5 rounded-md bg-purple-500/10">
                      <FileStack size={14} className="text-purple-500" />
                    </div>
                  </div>
                  <p
                    className="text-2xl font-bold mb-1"
                    style={{ color: colors.textPrimary }}
                  >
                    {totalFaturas}
                  </p>
                </div>
              </div>

              <div
                className="relative group overflow-hidden p-4 rounded-xl border backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer"
                style={{
                  backgroundColor: colors.secondary,
                  borderColor: colors.border,
                }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-500/10 to-transparent rounded-full blur-lg" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[9px] uppercase tracking-wider font-semibold"
                      style={{ color: colors.textSecondary }}
                    >
                      Total Gasto
                    </span>
                    <div className="p-1.5 rounded-md bg-red-500/10">
                      <TrendingUp size={14} className="text-red-500" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold mb-1 text-red-500">
                    {formatarReal(totalGasto)}
                  </p>
                  <p
                    className="text-[9px]"
                    style={{ color: colors.textSecondary }}
                  >
                    soma de todas as faturas
                  </p>
                </div>
              </div>
            </div>
          )}

          {!activeCardId && todosMeses.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Filter size={14} style={{ color: colors.textSecondary }} />
                  <span
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: colors.textSecondary }}
                  >
                    Filtrar por Mês
                  </span>
                </div>
                {mesFiltro && (
                  <button
                    onClick={() => setMesFiltro("")}
                    className="text-xs text-red-500 hover:text-red-400 transition-colors"
                  >
                    Limpar filtro
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setMesFiltro("")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    !mesFiltro
                      ? "bg-blue-500 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  Todos os meses
                </button>
                {todosMeses.map((mes) => (
                  <button
                    key={mes}
                    onClick={() => setMesFiltro(mes)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      mesFiltro === mes
                        ? "bg-purple-500 text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {mes}
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        {error && (
          <div
            className="mb-6 p-4 border rounded-xl flex justify-between items-center text-xs backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300"
            style={{
              backgroundColor: "rgba(239,68,68,0.1)",
              borderColor: "rgba(239,68,68,0.3)",
              color: "#ef4444",
            }}
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-red-500/20">
                <AlertCircle size={16} />
              </div>
              <span className="font-semibold">{error}</span>
            </div>
            <button
              className="p-1.5 hover:bg-red-500/20 rounded-md transition-colors"
              onClick={() => setError(null)}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {successMessage && (
          <div
            className="mb-6 p-4 border rounded-xl flex justify-between items-center text-xs backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300"
            style={{
              backgroundColor: "rgba(34,197,94,0.1)",
              borderColor: "rgba(34,197,94,0.3)",
              color: "#10b981",
            }}
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-green-500/20">
                <Check size={16} />
              </div>
              <span className="font-semibold">{successMessage}</span>
            </div>
            <button
              className="p-1.5 hover:bg-green-500/20 rounded-md transition-colors"
              onClick={() => setSuccessMessage(null)}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {!activeCardId ? (
          <div className="space-y-4">
            {cards.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex p-4 rounded-full bg-blue-500/10 mb-4">
                  <CreditCard size={32} className="text-blue-500" />
                </div>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: colors.textPrimary }}
                >
                  Nenhum cartão cadastrado
                </h3>
                <p
                  className="text-sm mb-6"
                  style={{ color: colors.textSecondary }}
                >
                  Importe sua primeira fatura para começar
                </p>
                <button
                  onClick={() => openBankModal()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  Importar Primeira Fatura
                </button>
              </div>
            ) : (
              cards.map((card, index) => {
                const faturasDoCard = mesFiltro
                  ? card.faturas?.filter((f) => f.mesReferencia === mesFiltro)
                  : card.faturas;

                if (
                  mesFiltro &&
                  (!faturasDoCard || faturasDoCard.length === 0)
                ) {
                  return null;
                }

                const isExpanded = expandedCards[card.id];
                const totalFaturasCard = faturasDoCard?.length || 0;
                const totalGastoCard =
                  faturasDoCard?.reduce(
                    (sum, f) => sum + parseFloat(f.total || 0),
                    0
                  ) || 0;

                return (
                  <div
                    key={card.id}
                    className="group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-lg"
                    style={{
                      backgroundColor: colors.secondary,
                      borderColor: colors.border,
                      animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => toggleCardExpansion(card.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2.5 rounded-lg"
                            style={{ backgroundColor: `${card.color}20` }}
                          >
                            <span className="text-lg">
                              {bankOptions.find((b) => b.name === card.bank)
                                ?.icon || "💳"}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3
                                className="text-base font-bold"
                                style={{ color: colors.textPrimary }}
                              >
                                {card.brand.toUpperCase()}
                              </h3>
                              <span
                                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                style={{
                                  backgroundColor: `${card.color}20`,
                                  color: card.color,
                                }}
                              >
                                {card.bank}
                              </span>
                            </div>
                            <p
                              className="text-sm font-mono tracking-widest mt-0.5"
                              style={{ color: colors.textSecondary }}
                            >
                              •••• {card.lastDigits}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p
                              className="text-xs font-semibold uppercase tracking-wider mb-0.5"
                              style={{ color: colors.textSecondary }}
                            >
                              Total
                            </p>
                            <p
                              className="text-lg font-bold"
                              style={{ color: colors.textPrimary }}
                            >
                              {formatarReal(totalGastoCard)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openBankModal(card.id);
                              }}
                              className="p-2 rounded-md bg-green-500/10 text-green-500 opacity-0 group-hover:opacity-100 hover:bg-green-500 hover:text-white transition-all duration-300"
                              title="Importar nova fatura para este cartão"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload" aria-hidden="true"><path d="M12 3v12"></path><path d="m17 8-5-5-5 5"></path><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path></svg>
                            </button>
                            <div className="p-1.5 rounded-md bg-gray-800">
                              <span className="text-xs font-bold">
                                {totalFaturasCard}
                              </span>
                            </div>
                            <button
                              onClick={(e) => deleteCard(e, card.id)}
                              className="p-1.5 rounded-md bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all duration-300"
                            >
                              <Trash2 size={14} />
                            </button>
                            <button className="p-1.5">
                              {isExpanded ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {isExpanded &&
                      faturasDoCard &&
                      faturasDoCard.length > 0 && (
                        <div
                          className="border-t px-4 pb-4 pt-2"
                          style={{ borderColor: colors.border }}
                        >
                          <div className="mb-2">
                            <div className="flex items-center gap-2 mb-3">
                              <Layers
                                size={14}
                                style={{ color: colors.textSecondary }}
                              />
                              <span
                                className="text-xs font-semibold uppercase tracking-wider"
                                style={{ color: colors.textSecondary }}
                              >
                                Faturas Importadas
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {faturasDoCard
                                .sort((a, b) =>
                                  (b.mesReferencia || "").localeCompare(
                                    a.mesReferencia || ""
                                  )
                                )
                                .map((fatura, faturaIndex) => (
                                  <div
                                    key={fatura.id}
                                    onClick={() =>
                                      selecionarFatura(card.id, fatura.id)
                                    }
                                    className="group relative p-3 rounded-lg border cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                                    style={{
                                      backgroundColor: colors.tertiary,
                                      borderColor: colors.border,
                                    }}
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <div className="flex items-center gap-1.5 mb-1">
                                          <CalendarDays
                                            size={12}
                                            style={{
                                              color: colors.textSecondary,
                                            }}
                                          />
                                          <span
                                            className="text-xs font-semibold"
                                            style={{
                                              color: colors.textPrimary,
                                            }}
                                          >
                                            {fatura.mesReferencia || "Sem mês"}
                                          </span>
                                        </div>
                                        <p className="text-[10px] text-gray-400">
                                          Importado em{" "}
                                          {new Date(
                                            fatura.dataImportacao || new Date()
                                          ).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <button
                                        onClick={(e) =>
                                          deleteFatura(e, card.id, fatura.id)
                                        }
                                        className="p-1 rounded-md bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all duration-300"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>

                                    <div className="flex justify-between items-center">
                                      <div>
                                        <p
                                          className="text-[10px] uppercase tracking-wider mb-0.5"
                                          style={{
                                            color: colors.textSecondary,
                                          }}
                                        >
                                          Total
                                        </p>
                                        <p
                                          className="text-sm font-bold"
                                          style={{ color: colors.textPrimary }}
                                        >
                                          R${" "}
                                          {parseFloat(
                                            fatura.total || 0
                                          ).toFixed(2)}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p
                                          className="text-[10px] uppercase tracking-wider mb-0.5"
                                          style={{
                                            color: colors.textSecondary,
                                          }}
                                        >
                                          Transações
                                        </p>
                                        <p
                                          className="text-sm font-bold"
                                          style={{ color: colors.textPrimary }}
                                        >
                                          {fatura.transactions?.length || 0}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
            <button
              onClick={voltarParaLista}
              className="flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider transition-all hover:gap-2 hover:text-blue-500"
              style={{ color: colors.textSecondary }}
            >
              <ChevronLeft size={16} /> Voltar para a lista
            </button>

            <div
              className="p-5 rounded-xl border backdrop-blur-xl"
              style={{
                backgroundColor: colors.secondary,
                borderColor: colors.border,
                background: `linear-gradient(135deg, ${safeActiveCard.color}10 0%, ${colors.secondary} 50%)`,
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${safeActiveCard.color}20` }}
                  >
                    <CreditCard
                      size={24}
                      style={{ color: safeActiveCard.color }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2
                        className="text-xl font-bold"
                        style={{ color: colors.textPrimary }}
                      >
                        {safeActiveCard.brand.toUpperCase()}
                      </h2>
                    </div>
                    <p
                      className="text-sm font-mono tracking-widest"
                      style={{ color: colors.textSecondary }}
                    >
                      •••• {safeActiveCard.lastDigits}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${safeActiveCard.color}20`,
                          color: safeActiveCard.color,
                        }}
                      >
                        {safeActiveCard.bank}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">
                        {safeActiveFatura.mesReferencia ||
                          "Mês não especificado"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p
                      className="text-[9px] uppercase tracking-wider font-semibold mb-1"
                      style={{ color: colors.textSecondary }}
                    >
                      Total da Fatura
                    </p>
                    <p className="text-2xl font-bold text-red-500">
                      R$ {safeActiveFatura.total || "0.00"}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: colors.textSecondary }}
                    >
                      {safeActiveFatura.transactions?.length || 0} transações
                    </p>
                  </div>
                  <button
                    onClick={() => openBankModal(safeActiveCard.id)}
                    className="p-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition-all duration-300"
                    title="Importar nova fatura"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>

            {safeActiveCard.faturas && safeActiveCard.faturas.length > 1 && (
              <div
                className="p-4 border rounded-xl"
                style={{
                  backgroundColor: colors.secondary,
                  borderColor: colors.border,
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Layers size={16} style={{ color: colors.textSecondary }} />
                  <span
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: colors.textPrimary }}
                  >
                    Outras Faturas deste Cartão
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {safeActiveCard.faturas
                    .sort((a, b) =>
                      (b.mesReferencia || "").localeCompare(
                        a.mesReferencia || ""
                      )
                    )
                    .map((fatura) => (
                      <button
                        key={fatura.id}
                        onClick={() => setActiveFaturaId(fatura.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          activeFaturaId === fatura.id
                            ? "bg-blue-500 text-white"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        {fatura.mesReferencia || "Sem mês"} (R${" "}
                        {parseFloat(fatura.total || 0).toFixed(2)})
                      </button>
                    ))}
                </div>
              </div>
            )}

            <div
              className="border rounded-xl overflow-hidden backdrop-blur-xl"
              style={{
                backgroundColor: colors.secondary,
                borderColor: colors.border,
              }}
            >
              <div
                className="p-4 border-b backdrop-blur-sm"
                style={{
                  borderColor: colors.border,
                  backgroundColor: "rgba(255,255,255,0.02)",
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search
                      className="absolute left-2.5 top-1/2 -translate-y-1/2"
                      size={14}
                      style={{ color: colors.textSecondary }}
                    />
                    <input
                      type="text"
                      placeholder="Buscar por descrição..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      style={{
                        backgroundColor: colors.tertiary,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                      }}
                    />
                  </div>
                  <div
                    className="flex items-center gap-1.5 text-xs font-semibold"
                    style={{ color: colors.textSecondary }}
                  >
                    <BarChart3 size={14} />
                    <span>
                      {safeActiveFatura.transactions?.filter((t) =>
                        (t.description || "")
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                      ).length || 0}{" "}
                      resultados
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr
                      className="text-[9px] uppercase tracking-wider font-semibold"
                      style={{
                        borderColor: "rgba(255,255,255,0.03)",
                        backgroundColor: colors.secondary,
                        color: colors.textSecondary,
                      }}
                    >
                      <th className="px-4 py-2.5 text-left">Data</th>
                      <th className="px-3 py-2.5 text-left">Descrição</th>
                      <th className="px-4 py-2.5 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody
                    className="divide-y"
                    style={{ borderColor: "rgba(255,255,255,0.03)" }}
                  >
                    {safeActiveFatura.transactions
                      ?.filter((t) =>
                        (t.description || "")
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                      )
                      .map((t, i) => {
                        const cardLastDigits =
                          t.cardLastDigits ||
                          t.description.match(/\(•{4}(\d{4})\)/)?.[1];
                        const tipoInfo = getCardTypeInfo(
                          cardLastDigits,
                          safeActiveCard
                        );
                        const descricaoSemCartao =
                          t.description?.replace(/\(•{4}\d{4}\)/, "")?.trim() ||
                          "Transação sem descrição";

                        return (
                          <tr
                            key={i}
                            className="group hover:bg-white/[0.02] transition-colors"
                            style={{
                              animation: `fadeInUp 0.3s ease-out ${
                                i * 0.02
                              }s both`,
                              borderLeft: `3px solid ${tipoInfo.cor}20`,
                            }}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className="p-1.5 rounded-md"
                                  style={{
                                    backgroundColor: `${tipoInfo.cor}10`,
                                  }}
                                >
                                  <Calendar
                                    size={12}
                                    style={{ color: tipoInfo.cor }}
                                  />
                                </div>
                                <span
                                  className="text-xs font-mono font-semibold"
                                  style={{ color: colors.textPrimary }}
                                >
                                  {t.date || "N/D"}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-start gap-2">
                                <span
                                  className="text-[10px] font-semibold px-2 py-1 rounded flex-shrink-0"
                                  style={{
                                    backgroundColor: tipoInfo.cor,
                                    color: "white",
                                  }}
                                >
                                  {tipoInfo.label}
                                </span>
                                <span
                                  className="text-sm font-medium flex-1"
                                  style={{ color: colors.textPrimary }}
                                >
                                  {descricaoSemCartao}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md"
                                style={{ backgroundColor: `${tipoInfo.cor}10` }}
                              >
                                <span
                                  className="text-xs font-bold"
                                  style={{ color: tipoInfo.cor }}
                                >
                                  R$ {t.value || "0.00"}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {showBankModal && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
            onClick={() => !isExtracting && setShowBankModal(false)}
          >
            <div
              className="rounded-2xl border p-8 w-full max-w-xl shadow-xl animate-in slide-in-from-bottom-8 duration-400"
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: colors.secondary,
                borderColor: colors.border,
              }}
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                    <Zap className="text-white" size={22} />
                  </div>
                  <div>
                    <h2
                      className="text-xl font-bold"
                      style={{ color: colors.textPrimary }}
                    >
                      {importandoParaCartaoId
                        ? "Importar Fatura para Cartão"
                        : "Importar Nova Fatura"}
                    </h2>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: colors.textSecondary }}
                    >
                      {importandoParaCartaoId
                        ? "Adicione uma nova fatura ao cartão existente"
                        : "Extraia dados automaticamente do PDF"}
                    </p>
                  </div>
                </div>
                {!isExtracting && (
                  <button
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-all hover:scale-110"
                    onClick={() => {
                      setShowBankModal(false);
                      setImportandoParaCartaoId(null);
                    }}
                  >
                    <X size={20} style={{ color: colors.textSecondary }} />
                  </button>
                )}
              </div>

              {importandoParaCartaoId && (
                <div
                  className="mb-6 p-4 rounded-xl border"
                  style={{
                    backgroundColor: colors.tertiary,
                    borderColor: colors.border,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <CreditCard size={18} className="text-blue-500" />
                    </div>
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: colors.textPrimary }}
                      >
                        Importando para:
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: colors.textSecondary }}
                      >
                        {
                          cards.find((c) => c.id === importandoParaCartaoId)
                            ?.brand
                        }{" "}
                        ••••
                        {
                          cards.find((c) => c.id === importandoParaCartaoId)
                            ?.lastDigits
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!importandoParaCartaoId && (
                <div className="mb-6">
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: colors.textPrimary }}
                  >
                    1. Selecione o Banco
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {bankOptions.map((bank) => (
                      <button
                        key={bank.id}
                        onClick={() => setSelectedBank(bank.id)}
                        disabled={isExtracting}
                        className={`relative group p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
                          selectedBank === bank.id ? "scale-105" : ""
                        }`}
                        style={{
                          borderColor:
                            selectedBank === bank.id
                              ? bank.color
                              : colors.border,
                          backgroundColor:
                            selectedBank === bank.id
                              ? `${bank.color}15`
                              : colors.tertiary,
                        }}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-2xl">{bank.icon}</span>
                          <span
                            className="text-xs font-semibold uppercase tracking-wider"
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
                              className="absolute top-1.5 right-1.5 p-1 rounded-full"
                              style={{ backgroundColor: bank.color }}
                            >
                              <Check size={12} className="text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: colors.textPrimary }}
                >
                  {importandoParaCartaoId
                    ? "Envie o PDF da Fatura"
                    : "2. Envie o PDF da Fatura"}
                </label>
                <label
                  className={`group block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
                    selectedFile
                      ? "border-green-500 bg-green-500/10"
                      : "hover:border-blue-500 hover:bg-blue-500/5"
                  }`}
                  style={{
                    borderColor: selectedFile ? "#10b981" : colors.border,
                  }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={`p-4 rounded-xl transition-all duration-300 ${
                        selectedFile
                          ? "bg-green-500/20"
                          : "bg-blue-500/10 group-hover:bg-blue-500/20"
                      }`}
                    >
                      {selectedFile ? (
                        <FileText size={32} className="text-green-500" />
                      ) : (
                        <Upload
                          size={32}
                          className="text-blue-500 group-hover:scale-110 transition-transform"
                        />
                      )}
                    </div>
                    <div>
                      <span
                        className="text-base font-semibold block mb-1.5"
                        style={{ color: colors.textPrimary }}
                      >
                        {selectedFile
                          ? "Arquivo Selecionado!"
                          : "Arraste ou Clique para Selecionar"}
                      </span>
                      <span
                        className="text-xs"
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

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBankModal(false);
                    setImportandoParaCartaoId(null);
                  }}
                  disabled={isExtracting}
                  className="flex-1 px-6 py-3 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: colors.tertiary,
                    color: colors.textPrimary,
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleImport}
                  disabled={
                    (!selectedBank && !importandoParaCartaoId) ||
                    !selectedFile ||
                    isExtracting
                  }
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      {importandoParaCartaoId
                        ? "Adicionar Fatura"
                        : "Importar Agora"}
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div
                  className="mt-4 p-3 border rounded-lg flex items-center gap-2 text-xs animate-in slide-in-from-top-2 duration-300"
                  style={{
                    backgroundColor: "rgba(239,68,68,0.1)",
                    borderColor: "rgba(239,68,68,0.3)",
                    color: "#ef4444",
                  }}
                >
                  <AlertCircle size={16} />
                  <span className="font-semibold">{error}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: ${
      theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
    };
    border-radius: 8px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #5568d3 0%, #653a8b 100%);
  }

  table tbody tr {
    border: 1px solid #0f1419 !important;
  }
`}</style>
    </div>
  );
};

export default Cartoes;
