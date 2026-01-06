import React, { useState } from "react";
import { ArrowLeft, Mail, Lock, AlertCircle } from "lucide-react";

const LoginPage = ({ onLogin, onNavigate }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <button
        onClick={() => onNavigate("/")}
        className="fixed top-6 left-6 flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-500 text-[15px] font-medium cursor-pointer transition-all hover:bg-gray-50 hover:text-gray-900"
      >
        <ArrowLeft size={18} />
        Voltar
      </button>

      <div className="w-full max-w-[440px]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-800 rounded-2xl flex items-center justify-center text-[28px] shadow-[0_10px_30px_rgba(59,130,246,0.3)]">
              💰
            </div>
          </div>
          <h1 className="text-[28px] font-bold text-gray-900 mb-2">
            Bem-vindo de volta!
          </h1>
          <p className="text-base text-gray-500">
            Entre para acessar sua conta
          </p>
        </div>

        <div className="bg-white rounded-[20px] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-200">
          <div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Usuário
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={20} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu usuário"
                  className="w-full py-3.5 px-4 pl-12 text-base border-2 border-gray-200 rounded-xl outline-none transition-all bg-gray-50 focus:border-blue-500 focus:bg-white"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleSubmit(e);
                  }}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full py-3.5 px-4 pl-12 text-base border-2 border-gray-200 rounded-xl outline-none transition-all bg-gray-50 focus:border-blue-500 focus:bg-white"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleSubmit(e);
                  }}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 px-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                <AlertCircle size={18} color="#dc2626" />
                <span className="text-sm text-red-600 font-medium">
                  {error}
                </span>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full py-3.5 text-white border-none rounded-xl text-base font-semibold transition-all shadow-[0_4px_12px_rgba(59,130,246,0.3)] ${
                isLoading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-500 cursor-pointer hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)]"
              }`}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </div>

        <div className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-2xl text-center">
          <p className="text-sm text-blue-900 font-medium m-0">
            💡 <strong>Credenciais de teste:</strong> admin / 12345
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
