import React from "react";
import { Wallet, Sparkles, Upload, ArrowUpRight } from "lucide-react";

const PageHeader = ({ colors, cards, activeCardId, openBankModal }) => {
  return (
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
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
    </header>
  );
};

export default PageHeader;