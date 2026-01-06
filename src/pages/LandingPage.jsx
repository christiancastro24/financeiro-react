import React from "react";
import {
  TrendingUp,
  Shield,
  Zap,
  Target,
  ArrowRight,
  Check,
} from "lucide-react";

const LandingPage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-[10px] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-800 rounded-xl flex items-center justify-center text-2xl shadow-[0_4px_12px_rgba(59,130,246,0.3)]">
              💰
            </div>
            <span className="text-2xl font-bold bg-gradient-to-br from-blue-900 to-blue-500 bg-clip-text text-transparent">
              FinanceApp
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => onNavigate("/login")}
              className="px-7 py-2.5 bg-blue-500 text-white rounded-lg font-semibold text-[15px] border-none cursor-pointer transition-all shadow-[0_4px_12px_rgba(59,130,246,0.3)] hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)]"
            >
              Entrar
            </button>
          </div>
        </div>
      </header>

      <section className="pt-[100px] pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 gap-15 items-center">
          <div>
            <div className="inline-block py-2 px-5 bg-blue-50 rounded-[50px] mb-6">
              <span className="text-blue-900 text-sm font-semibold">
                ✨ Controle Financeiro Inteligente
              </span>
            </div>
            <h1 className="text-[56px] font-extrabold text-gray-900 leading-tight mb-6">
              Transforme sua{" "}
              <span className="bg-gradient-to-br from-blue-500 to-blue-800 bg-clip-text text-transparent">
                Vida Financeira
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-10">
              Gerencie suas finanças de forma inteligente, planeje seu futuro e
              alcance seus sonhos com o FinanceApp.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => onNavigate("/login")}
                className="px-9 py-4 bg-blue-500 text-white rounded-xl font-semibold text-base border-none cursor-pointer flex items-center gap-2 shadow-[0_10px_30px_rgba(59,130,246,0.3)] transition-all hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-[0_15px_40px_rgba(59,130,246,0.4)]"
              >
                Começar Agora
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-3xl p-10 border border-gray-200 shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600 text-sm font-semibold">
                  SALDO TOTAL
                </span>
                <span className="text-2xl">💰</span>
              </div>
              <p className="text-4xl font-bold text-green-500 m-0">
                R$ 12.450,00
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="text-gray-600 text-[13px] mb-2">Receitas</div>
                <div className="text-green-500 text-xl font-bold">
                  +R$ 8.000
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="text-gray-600 text-[13px] mb-2">Despesas</div>
                <div className="text-red-500 text-xl font-bold">-R$ 3.500</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-15">
            <h2 className="text-[42px] font-extrabold text-gray-900 mb-4">
              Recursos Poderosos
            </h2>
            <p className="text-lg text-gray-600">
              Tudo que você precisa para gerenciar suas finanças
            </p>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8">
            {[
              {
                icon: <TrendingUp size={32} />,
                title: "Análises Detalhadas",
                desc: "Visualize seus gastos e receitas com gráficos interativos",
                color: "#3b82f6",
              },
              {
                icon: <Shield size={32} />,
                title: "Seguro & Privado",
                desc: "Seus dados protegidos com criptografia de ponta",
                color: "#10b981",
              },
              {
                icon: <Zap size={32} />,
                title: "Rápido & Intuitivo",
                desc: "Interface moderna e fácil de usar",
                color: "#f59e0b",
              },
              {
                icon: <Target size={32} />,
                title: "Metas & Objetivos",
                desc: "Planeje e alcance seus sonhos financeiros",
                color: "#8b5cf6",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-[20px] border border-gray-200 transition-all cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)]"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                  style={{
                    backgroundColor: `${feature.color}15`,
                    color: feature.color,
                  }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed m-0">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-[42px] font-extrabold text-gray-900 mb-6 leading-tight">
              Por que escolher o FinanceApp?
            </h2>
            <div className="flex flex-col gap-5">
              {[
                "Controle total das suas finanças em um só lugar",
                "Relatórios detalhados e insights inteligentes",
                "Planejamento de metas e objetivos",
                "Interface moderna e intuitiva",
                "Sincronização em tempo real",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={16} color="#3b82f6" strokeWidth={3} />
                  </div>
                  <span className="text-lg text-gray-700 font-medium">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-500 rounded-3xl p-12 text-white shadow-[0_20px_60px_rgba(59,130,246,0.3)]">
            <h3 className="text-[32px] font-bold mb-4">Comece Gratuitamente</h3>
            <p className="text-lg mb-8 opacity-90">
              Junte-se a milhares de usuários que já transformaram suas vidas
              financeiras
            </p>
            <button
              onClick={() => onNavigate("/login")}
              className="w-full py-4 bg-white text-blue-500 rounded-xl font-bold text-base border-none cursor-pointer transition-all shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.15)]"
            >
              Criar Conta Agora
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-10 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-800 rounded-lg flex items-center justify-center text-xl">
              💰
            </div>
            <span className="text-xl font-bold text-gray-900">FinanceApp</span>
          </div>
          <p className="text-gray-600 text-sm m-0">
            © 2026 FinanceApp. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
