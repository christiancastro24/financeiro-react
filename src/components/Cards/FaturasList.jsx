import React from "react";
import { Layers, CalendarDays, Trash2 } from "lucide-react";

const FaturasList = ({ faturas, cardId, colors, selecionarFatura, deleteFatura }) => {
  return (
    <div
      className="border-t px-4 pb-4 pt-2"
      style={{ borderColor: colors.border }}
    >
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-3">
          <Layers size={14} style={{ color: colors.textSecondary }} />
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: colors.textSecondary }}
          >
            Faturas Importadas
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {faturas
            .sort((a, b) =>
              (b.mesReferencia || "").localeCompare(a.mesReferencia || "")
            )
            .map((fatura) => (
              <div
                key={fatura.id}
                onClick={() => selecionarFatura(cardId, fatura.id)}
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
                        style={{ color: colors.textSecondary }}
                      />
                      <span
                        className="text-xs font-semibold"
                        style={{ color: colors.textPrimary }}
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
                    onClick={(e) => deleteFatura(e, cardId, fatura.id)}
                    className="p-1 rounded-md bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all duration-300"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p
                      className="text-[10px] uppercase tracking-wider mb-0.5"
                      style={{ color: colors.textSecondary }}
                    >
                      Total
                    </p>
                    <p
                      className="text-sm font-bold"
                      style={{ color: colors.textPrimary }}
                    >
                      R$ {parseFloat(fatura.total || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-[10px] uppercase tracking-wider mb-0.5"
                      style={{ color: colors.textSecondary }}
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
  );
};

export default FaturasList;