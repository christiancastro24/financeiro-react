import React from "react";
import { Calendar } from "lucide-react";

const TransactionsTable = ({
  transactions,
  searchTerm,
  colors,
  safeActiveCard,
  getCardTypeInfo,
}) => {
  const filteredTransactions = transactions.filter((t) =>
    (t.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
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
          {filteredTransactions.map((t, i) => {
            const cardLastDigits =
              t.cardLastDigits ||
              t.description.match(/\(•{4}(\d{4})\)/)?.[1];
            const tipoInfo = getCardTypeInfo(cardLastDigits, safeActiveCard);
            const descricaoSemCartao =
              t.description?.replace(/\(•{4}\d{4}\)/, "")?.trim() ||
              "Transação sem descrição";

            return (
              <tr
                key={i}
                className="group hover:bg-white/[0.02] transition-colors"
                style={{
                  animation: `fadeInUp 0.3s ease-out ${i * 0.02}s both`,
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
                      <Calendar size={12} style={{ color: tipoInfo.cor }} />
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
  );
};

export default TransactionsTable;