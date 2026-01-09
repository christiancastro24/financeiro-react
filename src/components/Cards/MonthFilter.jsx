import React from "react";
import { Filter } from "lucide-react";

const MonthFilter = ({ todosMeses, mesFiltro, setMesFiltro, colors }) => {
  if (todosMeses.length === 0) return null;

  return (
    <div className="mt-6 mb-6">
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
  );
};

export default MonthFilter;