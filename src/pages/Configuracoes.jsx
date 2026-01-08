import React, { useState, useEffect } from "react";
import { Bell, Phone, CheckCircle, AlertCircle } from "lucide-react";

const Configuracoes = () => {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Carregar configurações salvas
    const savedNumber = localStorage.getItem("financeapp_whatsapp");
    const savedNotifications = localStorage.getItem("financeapp_notifications");

    if (savedNumber) setWhatsappNumber(savedNumber);
    if (savedNotifications)
      setNotificationsEnabled(savedNotifications === "true");
  }, []);

  const formatPhoneNumber = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // Aceita até 13 dígitos
    const limited = numbers.slice(0, 13);

    // Formata: 55 53 91651133 ou 55 53 991651133
    if (limited.length <= 2) return limited;
    if (limited.length <= 4)
      return `${limited.slice(0, 2)} ${limited.slice(2)}`;
    return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setWhatsappNumber(formatted);
  };

  const handleSave = () => {
    const cleanNumber = whatsappNumber.replace(/\D/g, "");

    // Salvar no localStorage (SEM validação)
    localStorage.setItem("financeapp_whatsapp", cleanNumber);
    localStorage.setItem(
      "financeapp_notifications",
      notificationsEnabled.toString()
    );

    setSaveMessage("Configurações salvas com sucesso!");
    setIsSuccess(true);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  return (
    <div className="ml-[260px] flex-1 bg-[#0f1419] p-10">
      <div className="mb-9">
        <h2 className="text-[28px] font-bold text-white mb-1.5">
          Configurações
        </h2>
        <div className="text-[#8b92a7] text-sm">
          Personalize sua experiência no FinanceApp
        </div>
      </div>

      {/* Card de Notificações WhatsApp */}
      <div className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] shadow-[0_4px_12px_rgba(0,0,0,0.3)] mb-6 overflow-hidden">
        {/* Header do Card */}
        <div className="bg-gradient-to-r from-[#5b8def]/10 to-[#0063f7]/5 border-b border-[#2a2f3e] p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#25D366] rounded-xl flex items-center justify-center">
              <Bell className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Notificações WhatsApp
              </h3>
              <p className="text-[#8b92a7] text-sm">
                Receba alertas sobre contas próximas do vencimento
              </p>
            </div>
          </div>
        </div>

        {/* Conteúdo do Card */}
        <div className="p-6 space-y-6">
          {/* Toggle de Notificações */}
          <div className="flex items-center justify-between bg-[#252b3b] rounded-lg p-5 border border-[#2a2f3e]">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  notificationsEnabled
                    ? "bg-[#25D366]/20 text-[#25D366]"
                    : "bg-[#5a6c7d]/20 text-[#8b92a7]"
                }`}
              >
                <Bell size={20} />
              </div>
              <div>
                <div className="text-white font-semibold text-[15px]">
                  Ativar alertas de contas a vencer
                </div>
                <div className="text-[#8b92a7] text-xs mt-0.5">
                  Receba lembretes 1 dia antes do vencimento
                </div>
              </div>
            </div>
            <button
              onClick={toggleNotifications}
              className={`relative w-14 h-7 rounded-full transition-all ${
                notificationsEnabled ? "bg-[#25D366]" : "bg-[#5a6c7d]"
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${
                  notificationsEnabled ? "left-8" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Campo de Número */}
          <div
            className={`transition-all ${
              notificationsEnabled
                ? "opacity-100"
                : "opacity-50 pointer-events-none"
            }`}
          >
            <label className="flex items-center gap-2 text-sm font-semibold text-[#8b92a7] mb-3">
              <Phone size={16} />
              Número do WhatsApp
            </label>
            <div className="relative">
              <input
                type="text"
                value={whatsappNumber}
                onChange={handlePhoneChange}
                placeholder="55 53 91651133"
                disabled={!notificationsEnabled}
                className="w-full px-4 py-4 bg-[#252b3b] border border-[#2a2f3e] rounded-lg text-white text-[15px] outline-none focus:border-[#5b8def] transition-all disabled:opacity-50"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b92a7]">
                <Phone size={18} />
              </div>
            </div>
            <p className="text-xs text-[#8b92a7] mt-2 flex items-center gap-1">
              <span className="text-[#5b8def]">💡</span>
              Formato: Código do país (55) + DDD + número (8 ou 9 dígitos) -
              Ex: 55 53 987654321
            </p>
          </div>

          {/* Mensagem de Feedback */}
          {saveMessage && (
            <div
              className={`flex items-center gap-3 p-4 rounded-lg border ${
                isSuccess
                  ? "bg-[#25D366]/10 border-[#25D366]/30 text-[#25D366]"
                  : "bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]"
              }`}
            >
              {isSuccess ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span className="text-sm font-medium">{saveMessage}</span>
            </div>
          )}

          {/* Botão Salvar */}
          <button
            onClick={handleSave}
            className="w-full px-6 py-4 bg-gradient-to-r from-[#5b8def] to-[#0063f7] text-white text-[15px] font-bold rounded-lg shadow-[0_4px_12px_rgba(91,141,239,0.4)] transition-all hover:shadow-[0_6px_20px_rgba(91,141,239,0.5)] hover:-translate-y-0.5 active:translate-y-0"
          >
            Salvar Configurações
          </button>
        </div>
      </div>

      {/* Preview Card - Mostra o que foi salvo */}
      {notificationsEnabled && whatsappNumber && (
        <div className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] shadow-[0_4px_12px_rgba(0,0,0,0.3)] p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <CheckCircle size={18} className="text-[#25D366]" />
            Configuração Ativa
          </h3>
          <div className="flex items-center gap-4 bg-[#252b3b] rounded-lg p-4 border border-[#2a2f3e]">
            <div className="w-10 h-10 bg-[#25D366]/20 rounded-lg flex items-center justify-center">
              <Phone size={20} className="text-[#25D366]" />
            </div>
            <div>
              <div className="text-[#8b92a7] text-xs">Número cadastrado</div>
              <div className="text-white font-semibold">
                +{whatsappNumber.replace(/\D/g, "")}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracoes;
