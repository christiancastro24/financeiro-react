import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

const LoginPage = ({ onLogin, onNavigate }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Criar partículas flutuantes
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      if (username === "admin" && password === "12345") {
        onLogin();
      } else {
        setError("Usuário ou senha incorretos");
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-[#667eea] rounded-full opacity-30"
          style={{
            left: `${particle.left}%`,
            animation: `floatUp ${particle.duration}s ease-in infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#667eea]/5 rounded-full blur-[150px] animate-pulse" />
      <div
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#764ba2]/5 rounded-full blur-[150px] animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <button
        onClick={() => onNavigate("/")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-5 py-2.5 bg-[#1a1f2e]/80 backdrop-blur-md border border-[#2a2f3e] rounded-lg text-[#8b92a7] text-[15px] font-medium cursor-pointer transition-all hover:bg-[#252b3b] hover:text-white hover:border-[#667eea]"
      >
        <ArrowLeft size={18} />
        Voltar
      </button>

      <div className="w-full max-w-[520px] relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-3xl blur-2xl opacity-50 animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-3xl flex items-center justify-center text-[42px] shadow-[0_20px_60px_rgba(102,126,234,0.4)]">
              💰
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-[#667eea] to-[#764ba2] leading-tight">
              Sua Jornada
            </h1>
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#764ba2] via-[#667eea] to-white">
              Começa Aqui
            </h2>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6 text-[#8b92a7]">
            <Sparkles size={16} className="text-[#667eea]" />
            <p className="text-base">
              Acesse sua conta e transforme suas finanças
            </p>
            <Sparkles size={16} className="text-[#764ba2]" />
          </div>
        </div>

        {/* Login Form */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/10 rounded-3xl blur-xl" />
          <div className="relative bg-[#1a1f2e]/80 backdrop-blur-xl rounded-3xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-[#2a2f3e]/50">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div>
                <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2]" />
                  Usuário
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b92a7] group-focus-within:text-[#667eea] transition-colors z-10">
                    <Mail size={20} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#667eea]/20 to-[#764ba2]/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Digite seu usuário"
                    className="relative w-full py-4 px-4 pl-12 text-base border-2 border-[#2a2f3e] rounded-xl outline-none transition-all bg-[#252b3b]/50 backdrop-blur-sm text-white placeholder:text-[#5a6c7d] focus:border-[#667eea] focus:bg-[#1e2738]/80 focus:shadow-[0_0_0_4px_rgba(102,126,234,0.1)]"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleSubmit(e);
                    }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2]" />
                  Senha
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b92a7] group-focus-within:text-[#667eea] transition-colors z-10">
                    <Lock size={20} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#667eea]/20 to-[#764ba2]/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="relative w-full py-4 px-4 pl-12 pr-12 text-base border-2 border-[#2a2f3e] rounded-xl outline-none transition-all bg-[#252b3b]/50 backdrop-blur-sm text-white placeholder:text-[#5a6c7d] focus:border-[#667eea] focus:bg-[#1e2738]/80 focus:shadow-[0_0_0_4px_rgba(102,126,234,0.1)]"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleSubmit(e);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-[#8b92a7] hover:text-[#667eea] transition-colors border-none bg-transparent cursor-pointer p-0"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-3 p-4 bg-[#e74c3c]/10 border border-[#e74c3c]/30 rounded-xl animate-[shake_0.4s_ease-in-out] backdrop-blur-sm">
                  <AlertCircle size={20} color="#e74c3c" />
                  <span className="text-sm text-[#e74c3c] font-medium">
                    {error}
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`relative w-full py-4 text-white border-none rounded-xl text-base font-bold transition-all overflow-hidden group ${
                  isLoading
                    ? "bg-[#667eea]/50 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#667eea] to-[#764ba2] cursor-pointer hover:-translate-y-1 shadow-[0_8px_24px_rgba(102,126,234,0.4)] hover:shadow-[0_12px_32px_rgba(102,126,234,0.5)]"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#764ba2] to-[#667eea] opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10">
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Entrando...
                    </span>
                  ) : (
                    "Entrar →"
                  )}
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* Test Credentials Info */}
        {/* <div className="mt-8 p-5 bg-[#667eea]/5 border border-[#667eea]/10 rounded-2xl text-center backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-[#8b92a7]">💡 Acesso de teste:</span>
            <code className="px-3 py-1 bg-[#252b3b] text-[#667eea] rounded-lg font-mono text-xs border border-[#2a2f3e]">
              admin
            </code>
            <span className="text-[#8b92a7]">/</span>
            <code className="px-3 py-1 bg-[#252b3b] text-[#764ba2] rounded-lg font-mono text-xs border border-[#2a2f3e]">
              12345
            </code>
          </div>
        </div> */}
      </div>

      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(100vh);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100vh);
            opacity: 0;
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
