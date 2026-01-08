import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Shield,
  Zap,
  Target,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Star,
  Users,
  DollarSign,
  PieChart,
} from "lucide-react";

const LandingPage = ({ onNavigate }) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [hoveredStat, setHoveredStat] = useState(null);

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Empresária",
      text: "O FinanceApp transformou completamente minha relação com dinheiro. Consegui economizar 30% a mais!",
      avatar: "👩‍💼",
    },
    {
      name: "João Santos",
      role: "Desenvolvedor",
      text: "Interface incrível e recursos poderosos. Finalmente tenho controle total das minhas finanças.",
      avatar: "👨‍💻",
    },
    {
      name: "Ana Costa",
      role: "Designer",
      text: "Planejei minha viagem dos sonhos em 6 meses usando as metas do app. Simplesmente perfeito!",
      avatar: "👩‍🎨",
    },
  ];

  const stats = [
    { icon: <Users size={32} />, value: "50K+", label: "Usuários Ativos" },
    { icon: <DollarSign size={32} />, value: "R$ 100M+", label: "Economizado" },
    { icon: <Star size={32} />, value: "4.9/5", label: "Avaliação" },
    { icon: <PieChart size={32} />, value: "1M+", label: "Transações" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1419] overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f1419]/95 backdrop-blur-[10px] border-b border-[#2a2f3e]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center text-2xl shadow-[0_4px_12px_rgba(102,126,234,0.3)] animate-[float_3s_ease-in-out_infinite]">
              💰
            </div>
            <span className="text-2xl font-bold bg-gradient-to-br from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
              FinanceApp
            </span>
          </div>
          <button
            onClick={() => onNavigate("/login")}
            className="px-7 py-2.5 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-lg font-semibold text-[15px] border-none cursor-pointer transition-all shadow-[0_4px_12px_rgba(102,126,234,0.3)] hover:shadow-[0_6px_20px_rgba(102,126,234,0.4)] hover:scale-105"
          >
            Entrar
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-6 max-w-7xl mx-auto relative">
        {/* Background gradient blur */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#667eea]/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-[#764ba2]/10 rounded-full blur-[120px]" />

        <div className="grid grid-cols-2 gap-20 items-center relative z-10">
          <div className="space-y-8">
            <div className="inline-block py-2 px-5 bg-[#667eea]/10 rounded-[50px] border border-[#667eea]/20 backdrop-blur-sm">
              <span className="text-[#667eea] text-sm font-semibold">
                ✨ Controle Financeiro Inteligente
              </span>
            </div>

            <h1 className="text-6xl font-extrabold text-white leading-tight">
              Transforme sua{" "}
              <span className="bg-gradient-to-br from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
                Vida Financeira
              </span>
            </h1>

            <p className="text-xl text-[#8b92a7] leading-relaxed">
              Gerencie suas finanças de forma inteligente, planeje seu futuro e
              alcance seus sonhos com o FinanceApp.
            </p>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => onNavigate("/login")}
                className="group px-9 py-4 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl font-semibold text-base border-none cursor-pointer flex items-center gap-2 shadow-[0_10px_30px_rgba(102,126,234,0.3)] transition-all hover:shadow-[0_15px_40px_rgba(102,126,234,0.4)] hover:-translate-y-1"
              >
                Começar Agora
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>
          </div>

          {/* 3D Dashboard Preview */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#667eea]/20 to-[#764ba2]/20 rounded-3xl blur-3xl" />
            <div className="relative bg-[#1a1f2e] rounded-3xl p-8 border border-[#2a2f3e] shadow-[0_20px_60px_rgba(0,0,0,0.4)] transform hover:scale-105 transition-all duration-500 hover:rotate-1">
              <div className="bg-[#252b3b] rounded-2xl p-6 border border-[#2a2f3e] mb-4 transform hover:translate-y-[-4px] transition-all">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[#8b92a7] text-sm font-semibold">
                    SALDO TOTAL
                  </span>
                  <span className="text-2xl animate-[bounce_2s_ease-in-out_infinite]">
                    💰
                  </span>
                </div>
                <p className="text-4xl font-bold text-[#27ae60] m-0">
                  R$ 12.450,00
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#252b3b] rounded-xl p-5 border border-[#2a2f3e] hover:border-[#27ae60] transition-all hover:translate-y-[-2px]">
                  <div className="text-[#8b92a7] text-[13px] mb-2">
                    Receitas
                  </div>
                  <div className="text-[#27ae60] text-xl font-bold">
                    +R$ 8.000
                  </div>
                </div>
                <div className="bg-[#252b3b] rounded-xl p-5 border border-[#2a2f3e] hover:border-[#e74c3c] transition-all hover:translate-y-[-2px]">
                  <div className="text-[#8b92a7] text-[13px] mb-2">
                    Despesas
                  </div>
                  <div className="text-[#e74c3c] text-xl font-bold">
                    -R$ 3.500
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-[#1a1f2e]/50 border-y border-[#2a2f3e]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredStat(i)}
                onMouseLeave={() => setHoveredStat(null)}
                className="text-center transform transition-all duration-300 hover:scale-110 cursor-pointer"
              >
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all ${
                    hoveredStat === i
                      ? "bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white shadow-[0_8px_20px_rgba(102,126,234,0.4)]"
                      : "bg-[#252b3b] text-[#667eea]"
                  }`}
                >
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-[#8b92a7]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-extrabold text-white mb-4">
              Recursos Poderosos
            </h2>
            <p className="text-lg text-[#8b92a7]">
              Tudo que você precisa para gerenciar suas finanças
            </p>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {[
              {
                icon: <TrendingUp size={32} />,
                title: "Análises Detalhadas",
                desc: "Gráficos interativos",
                gradient: "from-blue-500 to-blue-700",
              },
              {
                icon: <Shield size={32} />,
                title: "Seguro & Privado",
                desc: "Criptografia de ponta",
                gradient: "from-green-500 to-green-700",
              },
              {
                icon: <Zap size={32} />,
                title: "Rápido & Intuitivo",
                desc: "Interface moderna",
                gradient: "from-yellow-500 to-orange-600",
              },
              {
                icon: <Target size={32} />,
                title: "Metas & Objetivos",
                desc: "Planeje seus sonhos",
                gradient: "from-purple-500 to-purple-700",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group bg-[#1a1f2e] p-8 rounded-2xl border border-[#2a2f3e] transition-all cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:border-[#667eea] relative overflow-hidden"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}
                />
                <div
                  className={`relative w-16 h-16 rounded-2xl flex items-center justify-center mb-5 bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 relative">
                  {feature.title}
                </h3>
                <p className="text-[#8b92a7] relative">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-24 px-6 bg-[#1a1f2e]/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-extrabold text-white mb-4">
              O que dizem nossos usuários
            </h2>
          </div>

          <div className="relative">
            <div className="bg-[#252b3b] rounded-3xl p-12 border border-[#2a2f3e] min-h-[280px] flex flex-col justify-center">
              <div className="text-6xl mb-6 text-center animate-[float_3s_ease-in-out_infinite]">
                {testimonials[currentTestimonial].avatar}
              </div>
              <p className="text-xl text-white text-center mb-6 leading-relaxed">
                "{testimonials[currentTestimonial].text}"
              </p>
              <div className="text-center">
                <div className="text-lg font-bold text-white">
                  {testimonials[currentTestimonial].name}
                </div>
                <div className="text-sm text-[#8b92a7]">
                  {testimonials[currentTestimonial].role}
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                setCurrentTestimonial(
                  (prev) =>
                    (prev - 1 + testimonials.length) % testimonials.length
                )
              }
              className="absolute left-[-60px] top-1/2 -translate-y-1/2 w-12 h-12 bg-[#252b3b] border border-[#2a2f3e] rounded-full flex items-center justify-center text-white hover:bg-[#667eea] transition-all cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() =>
                setCurrentTestimonial(
                  (prev) => (prev + 1) % testimonials.length
                )
              }
              className="absolute right-[-60px] top-1/2 -translate-y-1/2 w-12 h-12 bg-[#252b3b] border border-[#2a2f3e] rounded-full flex items-center justify-center text-white hover:bg-[#667eea] transition-all cursor-pointer"
            >
              <ChevronRight size={24} />
            </button>

            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTestimonial(i)}
                  className={`w-2 h-2 rounded-full transition-all border-none cursor-pointer ${
                    i === currentTestimonial
                      ? "bg-[#667eea] w-8"
                      : "bg-[#2a2f3e]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="bg-[#1a1f2e] border-2 border-[#667eea]/30 rounded-3xl p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/10" />
          <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-[#667eea]/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-[#764ba2]/20 rounded-full blur-[100px]" />

          <div className="relative z-10">
            <h2 className="text-5xl font-extrabold text-white mb-6">
              Comece sua jornada financeira hoje
            </h2>
            <p className="text-xl text-[#8b92a7] mb-10 max-w-2xl mx-auto">
              Junte-se a milhares de usuários que já transformaram suas vidas
              financeiras
            </p>
            <button
              onClick={() => onNavigate("/login")}
              className="px-12 py-5 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl font-bold text-lg border-none cursor-pointer transition-all shadow-[0_8px_20px_rgba(102,126,234,0.3)] hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(102,126,234,0.4)] hover:scale-105"
            >
              Criar Conta Grátis
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2a2f3e] py-12 px-6 bg-[#1a1f2e]">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-lg flex items-center justify-center text-xl">
              💰
            </div>
            <span className="text-xl font-bold text-white">FinanceApp</span>
          </div>
          <p className="text-[#8b92a7] text-sm">
            © 2026 FinanceApp. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
