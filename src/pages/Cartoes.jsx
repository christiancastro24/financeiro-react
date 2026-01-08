import React, { useState, useEffect } from "react";
import { 
  Upload, CreditCard, Trash2, ChevronLeft, 
  Search, Loader2, AlertCircle, X, FileText,
  Wallet, Landmark
} from "lucide-react";

const Cartoes = () => {
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
    setIsExtracting(true);
    setError(null);
    console.log("🚀 Iniciando processamento do arquivo:", file.name);

    try {
      if (!window.pdfjsLib) {
        console.log("📦 Carregando PDF.js...");
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        document.head.appendChild(script);
        await new Promise(r => script.onload = r);
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map(item => item.str).join(' ') + '\n';
      }

      const normalizedText = fullText.replace(/[\u00A0\s]+/g, " ");
      console.log("📄 Texto extraído com sucesso (Primeiros 500 caracteres):", normalizedText.substring(0, 500));

      // DETECÇÃO DE BANCO
      let detectedBank = "Banco Desconhecido";
      if (/mercado\s*pago/i.test(normalizedText)) detectedBank = "Mercado Pago";
      else if (/sicredi/i.test(normalizedText)) detectedBank = "Sicredi";
      else if (/nubank/i.test(normalizedText)) detectedBank = "Nubank";
      
      console.log("🏦 Banco Detectado:", detectedBank);

      // DIVISÃO POR BLOCOS (Suporta Mercado Pago e Sicredi)
      // Procura por "Cartão ... (final XXXX)" ou "Cartão ... [****XXXX]"
      const cardBlocks = normalizedText.split(/(Cartão\s+.*?(?:final|\[)\s*(\d{4}|[\*\d]{4,5}))/i);
      console.log("🧩 Total de fragmentos encontrados na divisão:", cardBlocks.length);
      
      let foundNewCards = [];

      // A lógica de split gera: [texto_antes, header, conteúdo, header, conteúdo...]
      for (let i = 1; i < cardBlocks.length; i += 3) {
        const headerText = cardBlocks[i];
        const lastDigitsMatch = cardBlocks[i + 1];
        const blockContent = cardBlocks[i + 2] || "";

        console.log(`💳 Processando bloco: "${headerText}"`);

        const brand = headerText.match(/(Visa|Mastercard|Elo)/i)?.[1] || "Card";
        const lastDigits = lastDigitsMatch.replace(/\D/g, "").slice(-4);
        const type = headerText.toLowerCase().includes("virtual") ? "Virtual" : "Físico";

        const transactions = [];
        // Regex aprimorada para pegar Datas (18/dez ou 18/12) e valores R$
        const transRegex = /(\d{2}\/(?:\d{2}|[a-z]{3}))\s+([\w\s*.-]{3,})\s+(?:R\$\s+)?([\d,.]+)/gi;
        
        let match;
        while ((match = transRegex.exec(blockContent)) !== null) {
          const desc = match[2].trim();
          const valueStr = match[3].replace(/\./g, "").replace(",", ".");
          const value = parseFloat(valueStr);

          // Ignora cabeçalhos de tabela e pagamentos
          if (value > 0 && !desc.toLowerCase().includes("pagamento") && desc.length > 3) {
            transactions.push({
              date: match[1],
              description: desc,
              value: value.toFixed(2)
            });
          }
        }

        console.log(`✅ Transações extraídas para o cartão ${lastDigits}:`, transactions.length);

        if (transactions.length > 0) {
          foundNewCards.push({
            id: `${lastDigits}-${Date.now()}-${i}`,
            bank: detectedBank,
            brand: brand,
            name: `Cartão ${type}`,
            lastDigits,
            color: type === "Físico" ? "#3b82f6" : "#a855f7",
            transactions
          });
        }
      }

      if (foundNewCards.length > 0) {
        setCards(prev => {
          const existingIds = prev.map(c => `${c.bank}-${c.lastDigits}`);
          const filteredNew = foundNewCards.filter(n => !existingIds.includes(`${n.bank}-${n.lastDigits}`));
          console.log("✨ Adicionando novos cartões únicos:", filteredNew.length);
          return [...prev, ...filteredNew];
        });
      } else {
        console.error("❌ Nenhum cartão ou transação válida foi identificada.");
        setError("Não conseguimos extrair transações deste PDF. Verifique o console (F12).");
      }
    } catch (err) {
      console.error("💥 Erro Fatal:", err);
      setError("Erro técnico ao ler o PDF.");
    } finally {
      setIsExtracting(false);
    }
  };

  const deleteCard = (e, id) => {
    e.stopPropagation();
    if (window.confirm("Remover este cartão?")) {
      setCards(prev => prev.filter(c => c.id !== id));
      if (activeCardId === id) setActiveCardId(null);
    }
  };

  const activeCard = cards.find(c => c.id === activeCardId);

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Wallet className="text-blue-500" size={24} /> Meus Cartões
            </h1>
            <p className="text-slate-500 text-xs mt-1">Controle financeiro automatizado.</p>
          </div>

          {!activeCardId && (
            <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-lg active:scale-95">
              {isExtracting ? <Loader2 className="animate-spin" size={18}/> : <Upload size={18}/>}
              IMPORTAR PDF
              <input type="file" className="hidden" accept="application/pdf" onChange={(e) => processPdf(e.target.files[0])} />
            </label>
          )}
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 flex justify-between items-center text-sm">
            <div className="flex items-center gap-2"><AlertCircle size={16}/> {error}</div>
            <X className="cursor-pointer" onClick={() => setError(null)} size={16}/>
          </div>
        )}

        {!activeCardId ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards.map(card => (
              <div key={card.id} onClick={() => setActiveCardId(card.id)} className="group relative bg-[#161B26] border border-white/5 rounded-3xl p-6 cursor-pointer transition-all hover:border-blue-500/30 hover:shadow-xl">
                <button onClick={(e) => deleteCard(e, card.id)} className="absolute top-4 right-4 p-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={18} />
                </button>

                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-blue-500 font-bold text-[9px] uppercase tracking-widest block mb-1">{card.bank}</span>
                    <h3 className="text-xl font-black text-white italic italic">{card.brand.toUpperCase()}</h3>
                  </div>
                  <CreditCard size={20} className="text-slate-500" />
                </div>

                <p className="text-slate-500 text-lg font-mono tracking-widest mb-6">•••• {card.lastDigits}</p>
                
                <div className="flex justify-between items-end border-t border-white/5 pt-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{card.name}</span>
                  <span className="text-xl font-black text-white">R$ {card.transactions.reduce((acc, t) => acc + parseFloat(t.value), 0).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            <button onClick={() => setActiveCardId(null)} className="flex items-center gap-2 text-slate-500 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-colors">
              <ChevronLeft size={16}/> Voltar
            </button>

            <div className="bg-[#161B26] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                  <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-blue-500/40" />
                </div>
                <p className="text-xl font-black text-red-500 tracking-tight">R$ {activeCard.transactions.reduce((acc, t) => acc + parseFloat(t.value), 0).toFixed(2)}</p>
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-600 text-[9px] uppercase tracking-widest font-black border-b border-white/5 bg-white/[0.02]">
                    <th className="px-6 py-3">Data</th>
                    <th className="px-3 py-3">Descrição</th>
                    <th className="px-6 py-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {activeCard.transactions.filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase())).map((t, i) => (
                    <tr key={i} className="hover:bg-white/[0.01]">
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">{t.date}</td>
                      <td className="px-3 py-4 text-xs font-bold text-slate-200 uppercase">{t.description}</td>
                      <td className="px-6 py-4 text-right text-sm font-black text-red-400">R$ {t.value}</td>
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