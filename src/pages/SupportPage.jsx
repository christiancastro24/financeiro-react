import React, { useState } from "react";
import { 
  Mail, 
  MessageCircle, 
  Send, 
  HelpCircle, 
  Shield,
  Zap,
  CheckCircle,
  XCircle
} from "lucide-react";

const SupportPage = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("financeapp_theme") || "dark";
  });

  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("epelococastro1@gmail.com");
  const [selectedOption, setSelectedOption] = useState("whatsapp");
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null); // null, 'success', 'error'

  const colors = {
    primary: theme === "dark" ? "#0f1419" : "#f8f9fa",
    secondary: theme === "dark" ? "#1a1f2e" : "#ffffff",
    tertiary: theme === "dark" ? "#252b3b" : "#f1f3f5",
    border: theme === "dark" ? "#2a2f3e" : "#dee2e6",
    textPrimary: theme === "dark" ? "#ffffff" : "#1a1f2e",
    textSecondary: theme === "dark" ? "#8b92a7" : "#6c757d",
  };

  const whatsappNumber = "53991651133";
  const defaultEmail = "epelococastro1@gmail.com";

  const handleSend = () => {
    if (!message.trim()) {
      setSendStatus('error');
      setTimeout(() => setSendStatus(null), 3000);
      return;
    }

    setIsSending(true);

    if (selectedOption === "whatsapp") {
      // Formata a mensagem para WhatsApp
      const encodedMessage = encodeURIComponent(`UpGrana Suporte:\n\n${message}\n\nEmail para contato: ${email || defaultEmail}`);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      
      // Abre o WhatsApp
      window.open(whatsappUrl, '_blank');
      
      setSendStatus('success');
      setMessage("");
      setEmail(defaultEmail);
    } else {
      // Para email, usamos mailto com seu email padrão
      const subject = encodeURIComponent("Suporte UpGrana");
      const body = encodeURIComponent(`Mensagem do usuário:\n\n${message}\n\nEmail do usuário: ${email || defaultEmail}\n\n---\nMensagem enviada via UpGrana App`);
      const mailtoUrl = `mailto:${defaultEmail}?subject=${subject}&body=${body}`;
      
      // Abre o cliente de email
      window.open(mailtoUrl, '_blank');
      
      setSendStatus('success');
      setMessage("");
      setEmail(defaultEmail);
    }

    setTimeout(() => {
      setIsSending(false);
      setSendStatus(null);
    }, 3000);
  };

  return (
    <div
      className="ml-72 p-8 min-h-screen transition-colors duration-300"
      style={{ backgroundColor: colors.primary }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700">
              <HelpCircle size={24} className="text-white" />
            </div>
            <div>
              <h1
                className="text-2xl font-bold mb-1"
                style={{ color: colors.textPrimary }}
              >
                Central de Suporte
              </h1>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Estamos aqui para ajudar com qualquer dúvida ou problema
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Opções de Contato */}
          <div
            className="rounded-xl border p-6"
            style={{
              backgroundColor: colors.secondary,
              borderColor: colors.border,
            }}
          >
            <h2
              className="text-lg font-bold mb-6 pb-4 border-b"
              style={{ 
                color: colors.textPrimary,
                borderColor: colors.border 
              }}
            >
              Escolha como nos contatar
            </h2>

            <div className="space-y-4 mb-6">
              {/* WhatsApp Option */}
              <button
                onClick={() => setSelectedOption("whatsapp")}
                className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                  selectedOption === "whatsapp" 
                    ? "bg-green-500/10 border-green-500" 
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
                style={{
                  backgroundColor: selectedOption === "whatsapp" ? undefined : colors.secondary,
                  borderColor: selectedOption === "whatsapp" ? "#10b981" : colors.border,
                }}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-lg ${
                    selectedOption === "whatsapp" 
                      ? "bg-green-500" 
                      : "bg-green-500/10"
                  }`}>
                    <MessageCircle size={20} className={
                      selectedOption === "whatsapp" ? "text-white" : "text-green-500"
                    } />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium" style={{ color: colors.textPrimary }}>
                      WhatsApp
                    </h3>
                    <p className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
                      Resposta rápida • 24/7
                    </p>
                  </div>
                </div>
                {selectedOption === "whatsapp" && (
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                )}
              </button>

              {/* Email Option */}
              <button
                onClick={() => setSelectedOption("email")}
                className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                  selectedOption === "email" 
                    ? "bg-blue-500/10 border-blue-500" 
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
                style={{
                  backgroundColor: selectedOption === "email" ? undefined : colors.secondary,
                  borderColor: selectedOption === "email" ? "#3b82f6" : colors.border,
                }}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-lg ${
                    selectedOption === "email" 
                      ? "bg-blue-500" 
                      : "bg-blue-500/10"
                  }`}>
                    <Mail size={20} className={
                      selectedOption === "email" ? "text-white" : "text-blue-500"
                    } />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium" style={{ color: colors.textPrimary }}>
                      E-mail Direto
                    </h3>
                    <p className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
                      Envie para meu email pessoal
                    </p>
                  </div>
                </div>
                {selectedOption === "email" && (
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                )}
              </button>
            </div>

            {/* Informações de Contato */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: colors.tertiary }}>
              <h4 className="font-medium mb-2" style={{ color: colors.textPrimary }}>
                Informações de Contato
              </h4>
              <ul className="space-y-2 text-sm" style={{ color: colors.textSecondary }}>
                <li className="flex items-center gap-2">
                  <MessageCircle size={14} />
                  WhatsApp: (53) 99165-1133
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={14} />
                  Email: epelococastro1@gmail.com
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center">👤</span>
                  Contato pessoal: Gabriel Castro
                </li>
              </ul>
            </div>
          </div>

          {/* Formulário de Mensagem */}
          <div
            className="rounded-xl border p-6"
            style={{
              backgroundColor: colors.secondary,
              borderColor: colors.border,
            }}
          >
            <h2
              className="text-lg font-bold mb-6 pb-4 border-b"
              style={{ 
                color: colors.textPrimary,
                borderColor: colors.border 
              }}
            >
              Enviar mensagem
            </h2>

            <div className="space-y-6">
              {/* Campo Email - Agora mostra seu email por padrão */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.textPrimary }}
                >
                  Seu e-mail de contato
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  style={{
                    backgroundColor: colors.tertiary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                />
                <p className="text-xs mt-1.5" style={{ color: colors.textSecondary }}>
                  Este email será usado para responder você
                </p>
              </div>

              {/* Campo Mensagem */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.textPrimary }}
                >
                  Sua mensagem *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Descreva seu problema, dúvida ou sugestão..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all"
                  style={{
                    backgroundColor: colors.tertiary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                />
                <div className="flex justify-between items-center mt-1.5">
                  <p className="text-xs" style={{ color: colors.textSecondary }}>
                    {message.length}/500 caracteres
                  </p>
                  {message.length >= 500 && (
                    <p className="text-xs text-red-500">Limite atingido</p>
                  )}
                </div>
              </div>

              {/* Status de Envio */}
              {sendStatus && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${
                  sendStatus === 'success' 
                    ? 'bg-green-500/10 text-green-600' 
                    : 'bg-red-500/10 text-red-600'
                }`}>
                  {sendStatus === 'success' ? (
                    <>
                      <CheckCircle size={18} />
                      <span className="text-sm font-medium">
                        {selectedOption === "whatsapp" 
                          ? "Redirecionando para WhatsApp..." 
                          : "Abrindo cliente de e-mail..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle size={18} />
                      <span className="text-sm font-medium">Por favor, escreva uma mensagem</span>
                    </>
                  )}
                </div>
              )}

              {/* Botão de Envio */}
              <button
                onClick={handleSend}
                disabled={isSending || !message.trim()}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-lg font-medium text-white transition-all ${
                  isSending ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'
                } ${
                  selectedOption === "whatsapp" 
                    ? "bg-green-600" 
                    : "bg-blue-600"
                }`}
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    {selectedOption === "whatsapp" 
                      ? "Abrir WhatsApp" 
                      : "Abrir E-mail"}
                  </>
                )}
              </button>

              <div className="pt-4 border-t" style={{ borderColor: colors.border }}>
                <p className="text-xs text-center" style={{ color: colors.textSecondary }}>
                  {selectedOption === "whatsapp" 
                    ? `Você será redirecionado para o WhatsApp com sua mensagem preenchida`
                    : `Sua mensagem será enviada para epelococastro1@gmail.com`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Rápido */}
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-4" style={{ color: colors.textPrimary }}>
            Como funciona o suporte
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                q: "WhatsApp",
                a: "Envie sua mensagem diretamente pelo WhatsApp para resposta imediata"
              },
              {
                q: "E-mail Direto",
                a: "Mensagens são enviadas diretamente para meu email pessoal"
              },
              {
                q: "Tempo de Resposta",
                a: "WhatsApp: Imediato • E-mail: Até 24 horas úteis"
              },
              {
                q: "Informações Importantes",
                a: "Sempre inclua seu email para que eu possa responder você"
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: colors.secondary,
                  borderColor: colors.border,
                }}
              >
                <h4 className="font-medium mb-2" style={{ color: colors.textPrimary }}>
                  {item.q}
                </h4>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;