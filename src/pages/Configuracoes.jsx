import React, { useState, useEffect } from "react";
import { Bell, Phone, CheckCircle, AlertCircle, Sun, Moon } from "lucide-react";

const Configuracoes = () => {
  // --- LÓGICA DE TEMA (Local) ---
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("financeapp_theme");
    return saved || "dark";
  });

  // Definição da paleta de cores (substituindo o Context)
  const colors = {
    primary: theme === "dark" ? "#0f1419" : "#f8f9fa",
    secondary: theme === "dark" ? "#1a1f2e" : "#ffffff",
    tertiary: theme === "dark" ? "#252b3b" : "#f1f3f5",
    border: theme === "dark" ? "#2a2f3e" : "#dee2e6",
    textPrimary: theme === "dark" ? "#ffffff" : "#1a1f2e",
    textSecondary: theme === "dark" ? "#8b92a7" : "#6c757d",
    accent: "#5b8def",
  };

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("financeapp_theme", newTheme);
  };

  // --- LÓGICA DE NOTIFICAÇÕES ---
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const savedNumber = localStorage.getItem("financeapp_whatsapp");
    const savedNotifications = localStorage.getItem("financeapp_notifications");
    if (savedNumber) setWhatsappNumber(savedNumber);
    if (savedNotifications) setNotificationsEnabled(savedNotifications === "true");
  }, []);

  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, "");
    const limited = numbers.slice(0, 13);
    if (limited.length <= 2) return limited;
    if (limited.length <= 4) return `${limited.slice(0, 2)} ${limited.slice(2)}`;
    return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4)}`;
  };

  const handleSave = () => {
    localStorage.setItem("financeapp_whatsapp", whatsappNumber.replace(/\D/g, ""));
    localStorage.setItem("financeapp_notifications", notificationsEnabled.toString());
    setSaveMessage("Configurações salvas com sucesso!");
    setIsSuccess(true);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  return (
    <div 
      className="ml-[260px] flex-1 p-10 transition-colors duration-300 min-h-screen"
      style={{ backgroundColor: colors.primary }}
    >
      <div className="mb-9">
        <h2 className="text-[28px] font-bold mb-1.5" style={{ color: colors.textPrimary }}>
          Configurações
        </h2>
        <div className="text-sm" style={{ color: colors.textSecondary }}>
          Personalize sua experiência no FinanceApp
        </div>
      </div>

      {/* Card de Tema */}
      <div 
        className="rounded-xl border shadow-lg mb-6 overflow-hidden transition-colors duration-300"
        style={{ backgroundColor: colors.secondary, borderColor: colors.border }}
      >
        <div 
          className="border-b p-6" 
          style={{ 
            backgroundColor: theme === 'dark' ? 'rgba(91, 141, 239, 0.1)' : 'rgba(91, 141, 239, 0.05)',
            borderColor: colors.border 
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: colors.accent }}>
              {theme === 'dark' ? <Moon className="text-white" size={24} /> : <Sun className="text-white" size={24} />}
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Aparência</h3>
              <p className="text-sm" style={{ color: colors.textSecondary }}>Escolha o tema do sistema</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Opção Dark */}
            <button
              onClick={() => toggleTheme('dark')}
              className="p-5 rounded-lg border-2 transition-all flex flex-col items-center gap-3"
              style={{ 
                backgroundColor: theme === 'dark' ? colors.tertiary : colors.secondary,
                borderColor: theme === 'dark' ? colors.accent : colors.border 
              }}
            >
              <div className="w-16 h-16 rounded-xl flex items-center justify-center" 
                   style={{ backgroundColor: theme === 'dark' ? colors.accent + '40' : colors.tertiary }}>
                <Moon size={28} style={{ color: theme === 'dark' ? colors.accent : colors.textSecondary }} />
              </div>
              <div className="text-center">
                <div className="font-semibold text-[15px]" style={{ color: colors.textPrimary }}>Modo Escuro</div>
                {theme === 'dark' && <CheckCircle size={20} className="mt-2" style={{ color: colors.accent, margin: '8px auto 0' }} />}
              </div>
            </button>

            {/* Opção Light */}
            <button
              onClick={() => toggleTheme('light')}
              className="p-5 rounded-lg border-2 transition-all flex flex-col items-center gap-3"
              style={{ 
                backgroundColor: theme === 'light' ? colors.tertiary : colors.secondary,
                borderColor: theme === 'light' ? colors.accent : colors.border 
              }}
            >
              <div className="w-16 h-16 rounded-xl flex items-center justify-center" 
                   style={{ backgroundColor: theme === 'light' ? colors.accent + '40' : colors.tertiary }}>
                <Sun size={28} style={{ color: theme === 'light' ? colors.accent : colors.textSecondary }} />
              </div>
              <div className="text-center">
                <div className="font-semibold text-[15px]" style={{ color: colors.textPrimary }}>Modo Claro</div>
                {theme === 'light' && <CheckCircle size={20} className="mt-2" style={{ color: colors.accent, margin: '8px auto 0' }} />}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Card de Notificações */}
      <div 
        className="rounded-xl border shadow-lg mb-6 overflow-hidden transition-colors duration-300"
        style={{ backgroundColor: colors.secondary, borderColor: colors.border }}
      >
        <div className="border-b p-6" style={{ borderColor: colors.border }}>
           <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-[#25D366] rounded-xl flex items-center justify-center">
               <Bell className="text-white" size={24} />
             </div>
             <div>
               <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Notificações WhatsApp</h3>
             </div>
           </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between rounded-lg p-5 border" 
               style={{ backgroundColor: colors.tertiary, borderColor: colors.border }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" 
                   style={{ backgroundColor: notificationsEnabled ? "#25D36633" : colors.border, color: notificationsEnabled ? "#25D366" : colors.textSecondary }}>
                <Bell size={20} />
              </div>
              <div className="text-white font-semibold" style={{ color: colors.textPrimary }}>Ativar alertas</div>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative w-14 h-7 rounded-full transition-all ${notificationsEnabled ? "bg-[#25D366]" : "bg-gray-500"}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${notificationsEnabled ? "left-8" : "left-1"}`} />
            </button>
          </div>

          <div className={notificationsEnabled ? "opacity-100" : "opacity-50 pointer-events-none"}>
            <label className="block text-sm font-semibold mb-2" style={{ color: colors.textSecondary }}>Número do WhatsApp</label>
            <input
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(formatPhoneNumber(e.target.value))}
              className="w-full px-4 py-4 border rounded-lg outline-none"
              style={{ backgroundColor: colors.tertiary, borderColor: colors.border, color: colors.textPrimary }}
            />
          </div>

          {saveMessage && (
            <div className={`p-4 rounded-lg flex items-center gap-2 ${isSuccess ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
              {isSuccess ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              {saveMessage}
            </div>
          )}

          <button
            onClick={handleSave}
            className="w-full py-4 bg-gradient-to-r from-[#5b8def] to-[#0063f7] text-white font-bold rounded-lg hover:opacity-90 transition-all"
          >
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;