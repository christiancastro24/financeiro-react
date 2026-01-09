export const processMercadoPago = async (
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
      const nextIndex = normalizedText.indexOf(nextCartao.fullMatch, startIdx);
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

export const processNubank = async (
  normalizedText,
  fileName,
  mesReferencia
) => {
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

    const total = transactions.reduce((sum, t) => sum + parseFloat(t.value), 0);

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

export const processSicredi = async (
  normalizedText,
  fileName,
  mesReferencia
) => {
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

    const total = transactions.reduce((sum, t) => sum + parseFloat(t.value), 0);

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

export const processGeneric = async (
  normalizedText,
  bankId,
  fileName,
  mesReferencia
) => {
  const bankOptions = [
    { id: "mercado_pago", name: "Mercado Pago", icon: "💳", color: "#00BFFF" },
    { id: "sicredi", name: "Sicredi", icon: "🏦", color: "#FF6B00" },
    { id: "nubank", name: "Nubank", icon: "🟣", color: "#8A05BE" },
    { id: "outros", name: "Outros", icon: "🏛️", color: "#666666" },
  ];

  const bankName = bankOptions.find((b) => b.id === bankId)?.name || bankId;
  const detectedBank = bankName;

  let brand = "Card";
  if (/visa/i.test(normalizedText)) brand = "Visa";
  else if (/mastercard|master card/i.test(normalizedText)) brand = "Mastercard";
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
    const total = transactions.reduce((sum, t) => sum + parseFloat(t.value), 0);

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
