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
    if (savedNotifications)
      setNotificationsEnabled(savedNotifications === "true");
  }, []);

  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, "");
    const limited = numbers.slice(0, 13);
    if (limited.length <= 2) return limited;
    if (limited.length <= 4)
      return `${limited.slice(0, 2)} ${limited.slice(2)}`;
    return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4)}`;
  };

  const handleSave = () => {
    localStorage.setItem(
      "financeapp_whatsapp",
      whatsappNumber.replace(/\D/g, "")
    );
    localStorage.setItem(
      "financeapp_notifications",
      notificationsEnabled.toString()
    );
    setSaveMessage("Configurações salvas com sucesso!");
    setIsSuccess(true);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  return (
    <div
      className="ml-[260px] flex-1 p-10 transition-colors duration-300 min-h-screen"
      style={{ backgroundColor: colors.primary }}
    >
      <div className="mb-6">
        <h2
          className="text-2xl font-bold mb-1"
          style={{ color: colors.textPrimary }}
        >
          Configurações
        </h2>
        <div className="text-sm" style={{ color: colors.textSecondary }}>
          Personalize sua experiência no FinanceApp
        </div>
      </div>

      {/* Card de Tema */}
      <div
        className="rounded-xl border shadow-sm mb-4 overflow-hidden transition-colors duration-300"
        style={{
          backgroundColor: colors.secondary,
          borderColor: colors.border,
        }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: colors.accent }}
              >
                {theme === "dark" ? (
                  <Moon className="text-white" size={20} />
                ) : (
                  <Sun className="text-white" size={20} />
                )}
              </div>
              <div>
                <h3
                  className="text-base font-semibold"
                  style={{ color: colors.textPrimary }}
                >
                  Aparência
                </h3>
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  Tema do sistema
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => toggleTheme("dark")}
                className="px-4 py-2 rounded-lg border transition-all flex items-center gap-2"
                style={{
                  backgroundColor:
                    theme === "dark" ? colors.tertiary : colors.secondary,
                  borderColor: theme === "dark" ? colors.accent : colors.border,
                }}
              >
                <Moon
                  size={16}
                  style={{
                    color:
                      theme === "dark" ? colors.accent : colors.textSecondary,
                  }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: colors.textPrimary }}
                >
                  Escuro
                </span>
                {theme === "dark" && (
                  <CheckCircle size={16} style={{ color: colors.accent }} />
                )}
              </button>

              <button
                onClick={() => toggleTheme("light")}
                className="px-4 py-2 rounded-lg border transition-all flex items-center gap-2"
                style={{
                  backgroundColor:
                    theme === "light" ? colors.tertiary : colors.secondary,
                  borderColor:
                    theme === "light" ? colors.accent : colors.border,
                }}
              >
                <Sun
                  size={16}
                  style={{
                    color:
                      theme === "light" ? colors.accent : colors.textSecondary,
                  }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: colors.textPrimary }}
                >
                  Claro
                </span>
                {theme === "light" && (
                  <CheckCircle size={16} style={{ color: colors.accent }} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card de Notificações */}
      <div
        className="rounded-xl border shadow-sm mb-4 overflow-hidden transition-colors duration-300"
        style={{
          backgroundColor: colors.secondary,
          borderColor: colors.border,
        }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#25D366] rounded-lg flex items-center justify-center">
                <Bell className="text-white" size={20} />
              </div>
              <div>
                <h3
                  className="text-base font-semibold"
                  style={{ color: colors.textPrimary }}
                >
                  Notificações WhatsApp
                </h3>
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  Receba alertas no WhatsApp
                </p>
              </div>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative w-12 h-6 rounded-full transition-all ${
                notificationsEnabled ? "bg-[#25D366]" : "bg-gray-500"
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                  notificationsEnabled ? "left-6" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {notificationsEnabled && (
            <div
              className="mt-3 pt-3 border-t"
              style={{ borderColor: colors.border }}
            >
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) =>
                  setWhatsappNumber(formatPhoneNumber(e.target.value))
                }
                placeholder="55 11 99999-9999"
                className="w-full px-3 py-2 border rounded-lg outline-none text-sm"
                style={{
                  backgroundColor: colors.tertiary,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
              />
            </div>
          )}
        </div>
      </div>

      {saveMessage && (
        <div
          className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
            isSuccess
              ? "bg-green-500/20 text-green-500"
              : "bg-red-500/20 text-red-500"
          }`}
        >
          {isSuccess ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {saveMessage}
        </div>
      )}

      <button
        onClick={handleSave}
        className="w-full py-3 bg-gradient-to-r from-[#5b8def] to-[#0063f7] text-white font-semibold rounded-lg hover:opacity-90 transition-all text-sm"
      >
        Salvar Configurações
      </button>
    </div>
  );
};

export default Configuracoes;
