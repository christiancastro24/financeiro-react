export const formatarReal = (valor) => {
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

export const extrairMesReferencia = (texto) => {
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

export const getCardTypeInfo = (cardLastDigits, cartaoInfo) => {
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

import iconNubank from "../assets/icon-nubank.png";
import iconSicredi from "../assets/icon-sicredi.png";
import iconMercadoPago from "../assets/icon-mp.png";

export const bankOptions = [
  {
    id: "mercado_pago",
    name: "Mercado Pago",
    icon: iconMercadoPago,
    color: "#00BFFF",
    isImage: true,
  },
  {
    id: "sicredi",
    name: "Sicredi",
    icon: iconSicredi,
    color: "#FF6B00",
    isImage: true,
  },
  {
    id: "nubank",
    name: "Nubank",
    icon: iconNubank,
    color: "#8A05BE",
    isImage: true,
  },
  {
    id: "outros",
    name: "Outros",
    icon: "🏛️",
    color: "#666666",
    isImage: false,
  },
];
