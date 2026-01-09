import React, { useState } from "react";
import { ChevronLeft, CreditCard, Plus, Layers, Search, BarChart3, Calendar } from "lucide-react";
import TransactionsTable from "./TransactionsTable";

const FaturaDetail = ({
  safeActiveCard,
  safeActiveFatura,
  colors,
  voltarParaLista,
  openBankModal,
  setActiveFaturaId,
  activeFaturaId,
  getCardTypeInfo,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
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
              <CreditCard size={24} style={{ color: safeActiveCard.color }} />
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
                  {safeActiveFatura.mesReferencia || "Mês não especificado"}
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
              <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
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
                (b.mesReferencia || "").localeCompare(a.mesReferencia || "")
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

        <TransactionsTable
          transactions={safeActiveFatura.transactions || []}
          searchTerm={searchTerm}
          colors={colors}
          safeActiveCard={safeActiveCard}
          getCardTypeInfo={getCardTypeInfo}
        />
      </div>
    </div>
  );
};

export default FaturaDetail;