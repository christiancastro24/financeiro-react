import React from "react";
import { CreditCard, FileStack, TrendingUp } from "lucide-react";

const StatsCards = ({ totalCartoes, totalFaturas, totalGasto, colors, formatarReal }) => {
  const stats = [
    {
      label: "Total Cartões",
      value: totalCartoes,
      icon: CreditCard,
      color: "blue",
    },
    {
      label: "Total Faturas",
      value: totalFaturas,
      icon: FileStack,
      color: "purple",
    },
    {
      label: "Total Gasto",
      value: formatarReal(totalGasto),
      icon: TrendingUp,
      color: "red",
      isAmount: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="relative group overflow-hidden rounded-xl border backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer"
          style={{
            backgroundColor: colors.secondary,
            borderColor: colors.border,
            padding: "1.5rem 1rem",
          }}
        >
          <div
            className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-${stat.color}-500/10 to-transparent rounded-full blur-lg`}
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-[9px] uppercase tracking-wider font-semibold"
                style={{ color: colors.textSecondary }}
              >
                {stat.label}
              </span>
              <div className={`p-1.5 rounded-md bg-${stat.color}-500/10`}>
                <stat.icon size={14} className={`text-${stat.color}-500`} />
              </div>
            </div>
            <p
              className={`text-2xl font-bold mb-1 ${
                stat.isAmount ? "text-red-500" : ""
              }`}
              style={!stat.isAmount ? { color: colors.textPrimary } : {}}
            >
              {stat.value}
            </p>
            {stat.isAmount && (
              <p
                className="text-[9px]"
                style={{ color: colors.textSecondary }}
              >
                soma de todas as faturas
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;