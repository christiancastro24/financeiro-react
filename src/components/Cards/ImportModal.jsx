import React from "react";
import {
  X,
  Zap,
  CreditCard,
  FileText,
  Upload,
  Loader2,
  Sparkles,
  AlertCircle,
  Check,
} from "lucide-react";

const ImportModal = ({
  showBankModal,
  setShowBankModal,
  colors,
  isExtracting,
  importandoParaCartaoId,
  setImportandoParaCartaoId,
  cards,
  bankOptions,
  selectedBank,
  setSelectedBank,
  selectedFile,
  fileName,
  handleFileSelect,
  handleImport,
  error,
}) => {
  if (!showBankModal) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
      onClick={() => !isExtracting && setShowBankModal(false)}
    >
      <div
        className="rounded-2xl border p-8 w-full max-w-xl shadow-xl animate-in slide-in-from-bottom-8 duration-400"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: colors.secondary,
          borderColor: colors.border,
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
              <Zap className="text-white" size={22} />
            </div>
            <div>
              <h2
                className="text-xl font-bold"
                style={{ color: colors.textPrimary }}
              >
                {importandoParaCartaoId
                  ? "Importar Fatura para Cartão"
                  : "Importar Nova Fatura"}
              </h2>
              <p
                className="text-xs mt-0.5"
                style={{ color: colors.textSecondary }}
              >
                {importandoParaCartaoId
                  ? "Adicione uma nova fatura ao cartão existente"
                  : "Extraia dados automaticamente do PDF"}
              </p>
            </div>
          </div>
          {!isExtracting && (
            <button
              className="p-2 hover:bg-red-500/20 rounded-lg transition-all hover:scale-110"
              onClick={() => {
                setShowBankModal(false);
                setImportandoParaCartaoId(null);
              }}
            >
              <X size={20} style={{ color: colors.textSecondary }} />
            </button>
          )}
        </div>

        {importandoParaCartaoId && (
          <div
            className="mb-6 p-4 rounded-xl border"
            style={{
              backgroundColor: colors.tertiary,
              borderColor: colors.border,
            }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <CreditCard size={18} className="text-blue-500" />
              </div>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: colors.textPrimary }}
                >
                  Importando para:
                </p>
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  {cards.find((c) => c.id === importandoParaCartaoId)?.brand}{" "}
                  ••••
                  {
                    cards.find((c) => c.id === importandoParaCartaoId)
                      ?.lastDigits
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {!importandoParaCartaoId && (
          <div className="mb-6">
            <label
              className="block text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: colors.textPrimary }}
            >
              1. Selecione o Banco
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {bankOptions.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => setSelectedBank(bank.id)}
                  disabled={isExtracting}
                  className={`relative group p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
                    selectedBank === bank.id ? "scale-105" : ""
                  }`}
                  style={{
                    borderColor:
                      selectedBank === bank.id ? bank.color : colors.border,
                    backgroundColor:
                      selectedBank === bank.id
                        ? `${bank.color}15`
                        : colors.tertiary,
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    {bank.isImage ? (
                      <img
                        src={bank.icon}
                        alt={bank.name}
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <span className="text-2xl">{bank.icon}</span>
                    )}
                    <span
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{
                        color:
                          selectedBank === bank.id
                            ? bank.color
                            : colors.textPrimary,
                      }}
                    >
                      {bank.name}
                    </span>
                    {selectedBank === bank.id && (
                      <div
                        className="absolute top-1.5 right-1.5 p-1 rounded-full"
                        style={{ backgroundColor: bank.color }}
                      >
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <label
            className="block text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: colors.textPrimary }}
          >
            {importandoParaCartaoId
              ? "Envie o PDF da Fatura"
              : "2. Envie o PDF da Fatura"}
          </label>
          <label
            className={`group block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
              selectedFile
                ? "border-green-500 bg-green-500/10"
                : "hover:border-blue-500 hover:bg-blue-500/5"
            }`}
            style={{
              borderColor: selectedFile ? "#10b981" : colors.border,
            }}
          >
            <div className="flex flex-col items-center gap-3">
              <div
                className={`p-4 rounded-xl transition-all duration-300 ${
                  selectedFile
                    ? "bg-green-500/20"
                    : "bg-blue-500/10 group-hover:bg-blue-500/20"
                }`}
              >
                {selectedFile ? (
                  <FileText size={32} className="text-green-500" />
                ) : (
                  <Upload
                    size={32}
                    className="text-blue-500 group-hover:scale-110 transition-transform"
                  />
                )}
              </div>
              <div>
                <span
                  className="text-base font-semibold block mb-1.5"
                  style={{ color: colors.textPrimary }}
                >
                  {selectedFile
                    ? "Arquivo Selecionado!"
                    : "Arraste ou Clique para Selecionar"}
                </span>
                <span
                  className="text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  {selectedFile ? fileName : "Arquivos PDF até 10MB"}
                </span>
              </div>
            </div>
            <input
              type="file"
              className="hidden"
              accept="application/pdf"
              onChange={handleFileSelect}
              disabled={isExtracting}
            />
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowBankModal(false);
              setImportandoParaCartaoId(null);
            }}
            disabled={isExtracting}
            className="flex-1 px-6 py-3 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: colors.tertiary,
              color: colors.textPrimary,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleImport}
            disabled={
              (!selectedBank && !importandoParaCartaoId) ||
              !selectedFile ||
              isExtracting
            }
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isExtracting ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Processando...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                {importandoParaCartaoId ? "Adicionar Fatura" : "Importar Agora"}
              </>
            )}
          </button>
        </div>

        {error && (
          <div
            className="mt-4 p-3 border rounded-lg flex items-center gap-2 text-xs animate-in slide-in-from-top-2 duration-300"
            style={{
              backgroundColor: "rgba(239,68,68,0.1)",
              borderColor: "rgba(239,68,68,0.3)",
              color: "#ef4444",
            }}
          >
            <AlertCircle size={16} />
            <span className="font-semibold">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportModal;
