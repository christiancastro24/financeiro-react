import React from "react";
import { AlertCircle, Check, X } from "lucide-react";

const AlertMessage = ({ type, message, onClose }) => {
  if (!message) return null;

  const config = {
    error: {
      bg: "rgba(239,68,68,0.1)",
      border: "rgba(239,68,68,0.3)",
      color: "#ef4444",
      icon: AlertCircle,
    },
    success: {
      bg: "rgba(34,197,94,0.1)",
      border: "rgba(34,197,94,0.3)",
      color: "#10b981",
      icon: Check,
    },
  };

  const { bg, border, color, icon: Icon } = config[type];

  return (
    <div
      className="mb-6 p-4 border rounded-xl flex justify-between items-center text-xs backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300"
      style={{
        backgroundColor: bg,
        borderColor: border,
        color: color,
      }}
    >
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-md bg-${type === 'error' ? 'red' : 'green'}-500/20`}>
          <Icon size={16} />
        </div>
        <span className="font-semibold">{message}</span>
      </div>
      <button
        className={`p-1.5 hover:bg-${type === 'error' ? 'red' : 'green'}-500/20 rounded-md transition-colors`}
        onClick={onClose}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default AlertMessage;