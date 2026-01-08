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
  Landmark,
} from "lucide-react";

const Cartoes = () => {
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
    secondary: theme === "dark" ? "#161B26" : "#ffffff",
    tertiary: theme === "dark" ? "#0B0E14" : "#f1f3f5",
    border: theme === "dark" ? "rgba(255,255,255,0.05)" : "#dee2e6",
    textPrimary: theme === "dark" ? "#ffffff" : "#1a1f2e",
    textSecondary: theme === "dark" ? "#8b92a7" : "#6c757d",
    cardHover:
      theme === "dark" ? "rgba(59,130,246,0.1)" : "rgba(59,130,246,0.05)",
  };

  // --- TODA SUA REGRA DE NEGÓCIO ORIGINAL (PDF E ESTADOS) ---
  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem("finance_premium_v4");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeCardId, setActiveCardId] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    localStorage.setItem("finance_premium_v4", JSON.stringify(cards));
  }, [cards]);

  const processPdf = async (file) => {
    if (!file) return;
    
    console.log("📄 Iniciando processamento do PDF:", file.name);
    console.log("📊 Tamanho do arquivo:", file.size, "bytes");
    
    setIsExtracting(true);
    setError(null);
    
    try {
      // Verificar se o PDF.js já está carregado
      if (!window.pdfjsLib) {
        console.log("📦 PDF.js não carregado. Carregando biblioteca...");
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        document.head.appendChild(script);
        await new Promise((r) => (script.onload = r));
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        console.log("✅ PDF.js carregado com sucesso");
      }

      // Ler o arquivo PDF
      console.log("🔍 Lendo arquivo PDF...");
      const arrayBuffer = await file.arrayBuffer();
      console.log("✅ Arquivo convertido para ArrayBuffer");

      // Carregar o PDF
      console.log("📖 Carregando documento PDF...");
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer })
        .promise;
      console.log(`✅ PDF carregado. Total de páginas: ${pdf.numPages}`);

      // Extrair texto de todas as páginas
      let fullText = "";
      console.log("🔤 Extraindo texto das páginas...");
      
      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`📄 Processando página ${i}/${pdf.numPages}...`);
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n";
        console.log(`✅ Página ${i} processada. Texto extraído: ${pageText.length} caracteres`);
      }

      console.log("📝 Texto completo extraído (primeiros 1000 chars):", fullText.substring(0, 1000) + "...");
      
      // Normalizar texto
      const normalizedText = fullText.replace(/[\u00A0\s]+/g, " ");
      console.log("📝 Texto normalizado (primeiros 1000 chars):", normalizedText.substring(0, 1000) + "...");

      // Detectar banco
      let detectedBank = "Banco Desconhecido";
      console.log("🏦 Detectando banco...");
      
      if (/mercado\s*pago/i.test(normalizedText)) {
        detectedBank = "Mercado Pago";
        console.log("✅ Banco detectado: Mercado Pago");
      } else if (/sicredi/i.test(normalizedText)) {
        detectedBank = "Sicredi";
        console.log("✅ Banco detectado: Sicredi");
      } else if (/nubank/i.test(normalizedText)) {
        detectedBank = "Nubank";
        console.log("✅ Banco detectado: Nubank");
      } else {
        console.log("⚠️ Banco não detectado automaticamente");
      }

      // USAR A REGRA ORIGINAL PARA ENCONTRAR CARTÕES
      console.log("💳 Procurando informações do cartão usando regex original...");
      
      // REGEX ORIGINAL QUE FUNCIONAVA
      const cardBlocks = normalizedText.split(
        /(Cartão\s+.*?(?:final|\[)\s*(\d{4}|[\*\d]{4,5}))/i
      );
      
      console.log(`🔢 ${cardBlocks.length} blocos de cartão encontrados`);
      console.log("📋 Detalhes dos blocos:", cardBlocks.slice(0, 5)); // Mostrar primeiros blocos
      
      let foundNewCards = [];
      
      // Processar apenas o PRIMEIRO cartão encontrado (índice 1, 2, 3)
      if (cardBlocks.length >= 4) {
        console.log("🎯 Processando primeiro cartão encontrado...");
        
        for (let i = 1; i < Math.min(4, cardBlocks.length); i += 3) {
          const headerText = cardBlocks[i];
          const lastDigitsMatch = cardBlocks[i + 1];
          const blockContent = cardBlocks[i + 2] || "";
          
          console.log(`📑 Bloco ${i}: Header: "${headerText?.substring(0, 50)}..."`);
          console.log(`🔢 Bloco ${i+1}: Dígitos: "${lastDigitsMatch}"`);
          console.log(`📄 Bloco ${i+2}: Conteúdo (primeiros 200 chars): "${blockContent.substring(0, 200)}..."`);
          
          const brand = headerText?.match(/(Visa|Mastercard|Elo)/i)?.[1] || "Card";
          const lastDigits = lastDigitsMatch?.replace(/\D/g, "").slice(-4) || "0000";
          const type = headerText?.toLowerCase().includes("virtual")
            ? "Virtual"
            : "Físico";
          
          console.log(`🏷️ Bandeira: ${brand}, Últimos dígitos: ${lastDigits}, Tipo: ${type}`);
          
          // Extrair transações - REGEX ORIGINAL
          console.log("💰 Extraindo transações...");
          const transactions = [];
          const transRegex =
            /(\d{2}\/(?:\d{2}|[a-z]{3}))\s+([\w\s*.-]{3,})\s+(?:R\$\s+)?([\d,.]+)/gi;
          
          let match;
          while ((match = transRegex.exec(blockContent)) !== null) {
            const desc = match[2].trim();
            const valueStr = match[3].replace(/\./g, "").replace(",", ".");
            const value = parseFloat(valueStr);
            
            if (
              value > 0 &&
              !desc.toLowerCase().includes("pagamento") &&
              desc.length > 3
            ) {
              transactions.push({
                date: match[1],
                description: desc,
                value: value.toFixed(2),
              });
              console.log(`✅ Transação: ${match[1]} - ${desc} - R$ ${value.toFixed(2)}`);
            }
          }
          
          console.log(`💰 Total de transações encontradas: ${transactions.length}`);
          
          // Se encontrou transações, criar o cartão
          if (transactions.length > 0) {
            const newCard = {
              id: `${lastDigits}-${Date.now()}-${i}`,
              bank: detectedBank,
              brand: brand,
              name: `Cartão ${type}`,
              lastDigits,
              color: type === "Físico" ? "#3b82f6" : "#a855f7",
              transactions,
            };
            
            foundNewCards.push(newCard);
            console.log("🎉 Cartão criado:", newCard);
            
            // PARAR APÓS ENCONTRAR O PRIMEIRO CARTÃO COM TRANSAÇÕES
            break;
          }
        }
      }

      // Se encontrou um cartão, adicionar à lista
      if (foundNewCards.length > 0) {
        console.log(`✅ ${foundNewCards.length} cartão(s) encontrado(s). Adicionando...`);
        
        setCards((prev) => {
          const existingIds = prev.map((c) => `${c.bank}-${c.lastDigits}`);
          const filteredNew = foundNewCards.filter(
            (n) => !existingIds.includes(`${n.bank}-${n.lastDigits}`)
          );
          
          console.log(`🔄 ${filteredNew.length} cartão(s) novo(s) serão adicionados`);
          
          const result = [...prev, ...filteredNew];
          console.log("📊 Total de cartões após adição:", result.length);
          
          return result;
        });
        
        // Selecionar automaticamente o primeiro cartão novo
        if (foundNewCards[0]) {
          setActiveCardId(foundNewCards[0].id);
          console.log("🎯 Cartão selecionado automaticamente:", foundNewCards[0].id);
        }
      } else {
        console.log("❌ Não conseguimos extrair transações deste PDF.");
        
        // Mostrar mais informações para debug
        console.log("🔍 Analisando o texto para entender o problema...");
        console.log("📊 Texto completo para análise:", normalizedText);
        
        // Procurar por padrões comuns em faturas
        const commonPatterns = [
          /cartão/i,
          /fatura/i,
          /lançamento/i,
          /compra/i,
          /débito/i,
          /crédito/i,
          /\d{2}\/\d{2}/, // datas
          /R\$\s*\d+/ // valores
        ];
        
        commonPatterns.forEach(pattern => {
          const matches = normalizedText.match(pattern);
          if (matches) {
            console.log(`🔍 Padrão "${pattern}": ENCONTRADO (${matches.length} vezes)`);
          } else {
            console.log(`🔍 Padrão "${pattern}": NÃO ENCONTRADO`);
          }
        });
        
        setError("Não conseguimos extrair transações deste PDF.");
      }
    } catch (err) {
      console.error("❌ Erro ao processar PDF:", err);
      console.error("Stack trace:", err.stack);
      setError(`Erro técnico ao ler o PDF: ${err.message}`);
    } finally {
      setIsExtracting(false);
      console.log("🏁 Processamento do PDF concluído");
    }
  };

  const deleteCard = (e, id) => {
    e.stopPropagation();
    console.log("🗑️ Tentando excluir cartão:", id);
    
    if (window.confirm("Remover este cartão?")) {
      setCards((prev) => prev.filter((c) => c.id !== id));
      if (activeCardId === id) setActiveCardId(null);
      console.log("✅ Cartão excluído:", id);
    }
  };

  const activeCard = cards.find((c) => c.id === activeCardId);

  return (
    <div
      className="ml-[260px] flex-1 min-h-screen transition-colors duration-300 p-8"
      style={{ backgroundColor: colors.primary }}
    >
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1
              className="text-2xl font-bold flex items-center gap-2"
              style={{ color: colors.textPrimary }}
            >
              <Wallet className="text-blue-500" size={24} /> Meus Cartões
            </h1>
            <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
              Controle financeiro automatizado via PDF.
            </p>
          </div>

          {!activeCardId && (
            <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-lg active:scale-95">
              {isExtracting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Upload size={18} />
              )}
              IMPORTAR FATURA
              <input
                type="file"
                className="hidden"
                accept="application/pdf"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    console.log("📁 Arquivo selecionado:", file.name);
                    processPdf(file);
                  }
                  // Resetar o input para permitir selecionar o mesmo arquivo novamente
                  e.target.value = null;
                }}
              />
            </label>
          )}
        </header>

        {error && (
          <div
            className="mb-6 p-4 border rounded-xl flex justify-between items-center text-sm"
            style={{
              backgroundColor: "rgba(239,68,68,0.1)",
              borderColor: "rgba(239,68,68,0.2)",
              color: "#ef4444",
            }}
          >
            <div className="flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
            <X
              className="cursor-pointer"
              onClick={() => setError(null)}
              size={16}
            />
          </div>
        )}

        {!activeCardId ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards.map((card) => (
              <div
                key={card.id}
                onClick={() => {
                  console.log("🎯 Selecionando cartão:", card.id);
                  setActiveCardId(card.id);
                }}
                className="group relative border rounded-3xl p-6 cursor-pointer transition-all hover:shadow-xl"
                style={{
                  backgroundColor: colors.secondary,
                  borderColor: colors.border,
                }}
              >
                <button
                  onClick={(e) => deleteCard(e, card.id)}
                  className="absolute top-4 right-4 p-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={18} />
                </button>

                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-blue-500 font-bold text-[9px] uppercase tracking-widest block mb-1">
                      {card.bank}
                    </span>
                    <h3
                      className="text-xl font-black italic"
                      style={{ color: colors.textPrimary }}
                    >
                      {card.brand.toUpperCase()}
                    </h3>
                  </div>
                  <CreditCard
                    size={20}
                    style={{ color: colors.textSecondary }}
                  />
                </div>

                <p
                  className="text-lg font-mono tracking-widest mb-6"
                  style={{ color: colors.textSecondary }}
                >
                  •••• {card.lastDigits}
                </p>

                <div
                  className="flex justify-between items-end border-t pt-4"
                  style={{ borderColor: colors.border }}
                >
                  <span
                    className="text-[10px] font-bold uppercase"
                    style={{ color: colors.textSecondary }}
                  >
                    {card.name}
                  </span>
                  <span
                    className="text-xl font-black"
                    style={{ color: colors.textPrimary }}
                  >
                    R${" "}
                    {card.transactions
                      .reduce((acc, t) => acc + parseFloat(t.value), 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            <button
              onClick={() => {
                console.log("🔙 Voltando para lista de cartões");
                setActiveCardId(null);
              }}
              className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-colors"
              style={{ color: colors.textSecondary }}
            >
              <ChevronLeft size={16} /> Voltar para a lista
            </button>

            <div
              className="border rounded-2xl overflow-hidden shadow-xl"
              style={{
                backgroundColor: colors.secondary,
                borderColor: colors.border,
              }}
            >
              <div
                className="p-6 border-b flex justify-between items-center"
                style={{
                  borderColor: colors.border,
                  backgroundColor: "rgba(255,255,255,0.01)",
                }}
              >
                <div className="relative w-64">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    size={14}
                    style={{ color: colors.textSecondary }}
                  />
                  <input
                    type="text"
                    placeholder="Buscar transação..."
                    value={searchTerm}
                    onChange={(e) => {
                      console.log("🔍 Buscando por:", e.target.value);
                      setSearchTerm(e.target.value);
                    }}
                    className="w-full border rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-blue-500/40"
                    style={{
                      backgroundColor: colors.tertiary,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    }}
                  />
                </div>
                <p className="text-xl font-black text-red-500 tracking-tight">
                  Total Fatura: R${" "}
                  {activeCard.transactions
                    .reduce((acc, t) => acc + parseFloat(t.value), 0)
                    .toFixed(2)}
                </p>
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr
                    className="text-[9px] uppercase tracking-widest font-black border-b"
                    style={{
                      borderColor: colors.border,
                      backgroundColor: "rgba(255,255,255,0.02)",
                      color: colors.textSecondary,
                    }}
                  >
                    <th className="px-6 py-3">Data</th>
                    <th className="px-3 py-3">Descrição</th>
                    <th className="px-6 py-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y"
                  style={{ borderColor: colors.border }}
                >
                  {activeCard.transactions
                    .filter((t) =>
                      t.description
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    )
                    .map((t, i) => (
                      <tr key={i} className="hover:bg-white/[0.01]">
                        <td
                          className="px-6 py-4 text-xs font-mono"
                          style={{ color: colors.textSecondary }}
                        >
                          {t.date}
                        </td>
                        <td
                          className="px-3 py-4 text-xs font-bold uppercase"
                          style={{ color: colors.textPrimary }}
                        >
                          {t.description}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-black text-red-400">
                          R$ {t.value}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cartoes;