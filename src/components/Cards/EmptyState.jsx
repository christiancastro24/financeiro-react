import React from "react";
import { CreditCard } from "lucide-react";

const EmptyState = ({ colors, openBankModal }) => {
  return (
    <div className="text-center py-12">
      <div className="inline-flex p-4 rounded-full bg-blue-500/10 mb-4">
        <CreditCard size={32} className="text-blue-500" />
      </div>
      <h3
        className="text-lg font-bold mb-2"
        style={{ color: colors.textPrimary }}
      >
        Nenhum cartão cadastrado
      </h3>
      <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>
        Importe sua primeira fatura para começar
      </p>
      <button
        onClick={() => openBankModal()}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
      >
        Importar Primeira Fatura
      </button>
    </div>
  );
};

export default EmptyState;