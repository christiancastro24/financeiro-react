import React from "react";
import { Trash2, ChevronDown, Upload, Layers } from "lucide-react";
import FaturasList from "./FaturasList";

const CardItem = ({
  card,
  index,
  colors,
  bankOptions,
  formatarReal,
  expandedCards,
  toggleCardExpansion,
  deleteCard,
  openBankModal,
  mesFiltro,
  selecionarFatura,
  deleteFatura,
}) => {
  const faturasDoCard = mesFiltro
    ? card.faturas?.filter((f) => f.mesReferencia === mesFiltro)
    : card.faturas;

  if (mesFiltro && (!faturasDoCard || faturasDoCard.length === 0)) {
    return null;
  }

  const isExpanded = expandedCards[card.id];
  const totalGastoCard =
    faturasDoCard?.reduce((sum, f) => sum + parseFloat(f.total || 0), 0) || 0;
  const totalFaturas = faturasDoCard?.length || 0;

  return (
    <div
      className="group relative overflow-hidden rounded-xl border-l-4 transition-all duration-300 hover:shadow-lg hover:translate-x-1"
      style={{
        backgroundColor: colors.secondary,
        borderColor: card.color,
        borderTop: `1px solid ${colors.border}`,
        borderRight: `1px solid ${colors.border}`,
        borderBottom: `1px solid ${colors.border}`,
        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
      }}
    >
      <div
        className="p-4 cursor-pointer"
        onClick={() => toggleCardExpansion(card.id)}
      >
        <div className="flex items-center gap-4">
          {/* Ícone */}
          <div
            className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-xl"
            style={{
              backgroundColor: colors.tertiary,
              border: `1px solid ${colors.border}`,
            }}
          >
            {(() => {
              const bankInfo = bankOptions.find((b) => b.name === card.bank);
              if (!bankInfo) return "💳";
              if (bankInfo.isImage) {
                return (
                  <img
                    src={bankInfo.icon}
                    alt={bankInfo.name}
                    className="w-8 h-8 object-contain"
                  />
                );
              }
              return bankInfo.icon;
            })()}
          </div>

          {/* Info Central */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className="text-base font-bold truncate"
                style={{ color: colors.textPrimary }}
              >
                {card.brand.toUpperCase()}
              </h3>
              <span
                className="flex-shrink-0 text-[9px] px-2 py-0.5 rounded font-bold uppercase"
                style={{
                  backgroundColor: `${card.color}20`,
                  color: card.color,
                }}
              >
                {card.bank}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span
                className="font-mono tracking-wider"
                style={{ color: colors.textSecondary }}
              >
                •••• {card.lastDigits}
              </span>
              <span className="opacity-30">•</span>
              <div className="flex items-center gap-1.5">
                <Layers size={12} style={{ color: card.color }} />
                <span style={{ color: colors.textSecondary }}>
                  {totalFaturas} {totalFaturas === 1 ? "fatura" : "faturas"}
                </span>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="flex-shrink-0 text-right mr-3">
            <p
              className="text-[10px] uppercase tracking-wider font-semibold mb-0.5 opacity-60"
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

          {/* Actions */}
          <div
            className="flex-shrink-0 flex items-center gap-2 pl-3 border-l"
            style={{ borderColor: colors.border }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                openBankModal(card.id);
              }}
              className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all duration-200 hover:scale-105"
              title="Importar fatura"
            >
              <Upload size={16} />
            </button>

            <button
              onClick={(e) => deleteCard(e, card.id)}
              className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 hover:scale-105"
              title="Deletar"
            >
              <Trash2 size={16} />
            </button>

            <button
              className="p-2 rounded-lg hover:bg-white/5 transition-all duration-200"
              style={{ color: colors.textSecondary }}
            >
              <ChevronDown
                size={18}
                className={`transition-transform duration-300 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Faturas */}
      {isExpanded && faturasDoCard && faturasDoCard.length > 0 && (
        <div
          className="border-t"
          style={{
            borderColor: `${card.color}20`,
            backgroundColor: `${card.color}03`,
          }}
        >
          <FaturasList
            faturas={faturasDoCard}
            cardId={card.id}
            colors={colors}
            selecionarFatura={selecionarFatura}
            deleteFatura={deleteFatura}
          />
        </div>
      )}
    </div>
  );
};

export default CardItem;
