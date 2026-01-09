import React, { useState, useEffect } from "react";
import {
  Bell,
  Phone,
  CheckCircle,
  AlertCircle,
  Sun,
  Moon,
  Save,
  Tag,
  Plus,
  X,
  Edit,
  Trash2,
} from "lucide-react";

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

  // --- LÓGICA DE CATEGORIAS ---
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");

  // Categorias padrão
  const defaultCategories = [
    "Alimentação",
    "Transporte",
    "Moradia",
    "Saúde",
    "Educação",
    "Lazer",
    "Compras",
    "Gastos Gerais",
    "Salário",
    "Investimentos",
    "Outros",
  ];

  useEffect(() => {
    // Carregar número WhatsApp
    const savedNumber = localStorage.getItem("financeapp_whatsapp");
    const savedNotifications = localStorage.getItem("financeapp_notifications");
    if (savedNumber) setWhatsappNumber(savedNumber);
    if (savedNotifications)
      setNotificationsEnabled(savedNotifications === "true");

    // Carregar categorias personalizadas
    const savedCategories = localStorage.getItem("financeapp_categories");
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  }, []);

  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, "");
    const limited = numbers.slice(0, 13);
    if (limited.length <= 2) return limited;
    if (limited.length <= 4)
      return `${limited.slice(0, 2)} ${limited.slice(2)}`;
    return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4)}`;
  };

  const handleSaveWhatsapp = () => {
    if (!notificationsEnabled) {
      setSaveMessage("Ative as notificações primeiro!");
      setIsSuccess(false);
      setTimeout(() => setSaveMessage(""), 3000);
      return;
    }

    const cleanNumber = whatsappNumber.replace(/\D/g, "");

    if (cleanNumber.length < 11) {
      setSaveMessage("Número WhatsApp inválido!");
      setIsSuccess(false);
      setTimeout(() => setSaveMessage(""), 3000);
      return;
    }

    localStorage.setItem("financeapp_whatsapp", cleanNumber);
    localStorage.setItem(
      "financeapp_notifications",
      notificationsEnabled.toString()
    );

    setSaveMessage("Número WhatsApp salvo com sucesso!");
    setIsSuccess(true);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const toggleNotifications = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);

    if (!newValue) {
      // Se está desativando, já salva imediatamente
      localStorage.setItem("financeapp_notifications", "false");
      setSaveMessage("Notificações desativadas!");
      setIsSuccess(true);
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  // --- FUNÇÕES PARA CATEGORIAS ---
  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      setSaveMessage("Digite um nome para a categoria!");
      setIsSuccess(false);
      setTimeout(() => setSaveMessage(""), 3000);
      return;
    }

    // Verificar se já existe (incluindo categorias padrão)
    const allCategories = [
      ...defaultCategories,
      ...categories.map((cat) => cat.name),
    ];

    if (
      allCategories.some(
        (cat) => cat.toLowerCase() === newCategory.trim().toLowerCase()
      )
    ) {
      setSaveMessage("Já existe uma categoria com este nome!");
      setIsSuccess(false);
      setTimeout(() => setSaveMessage(""), 3000);
      return;
    }

    const newCat = {
      id: `custom-${Date.now()}`,
      name: newCategory.trim(),
      custom: true,
    };

    const updatedCategories = [...categories, newCat];
    setCategories(updatedCategories);
    localStorage.setItem(
      "financeapp_categories",
      JSON.stringify(updatedCategories)
    );
    setNewCategory("");
    setSaveMessage("Categoria adicionada com sucesso!");
    setIsSuccess(true);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleEditCategory = (id, name) => {
    setEditingCategoryId(id);
    setEditingCategoryName(name);
  };

  const handleSaveEdit = () => {
    if (!editingCategoryName.trim()) {
      setSaveMessage("O nome da categoria não pode ser vazio!");
      setIsSuccess(false);
      setTimeout(() => setSaveMessage(""), 3000);
      return;
    }

    const categoryToEdit = categories.find(
      (cat) => cat.id === editingCategoryId
    );
    if (!categoryToEdit) return;

    // Verificar se o novo nome já existe (exceto a própria categoria sendo editada)
    const allCategories = [
      ...defaultCategories,
      ...categories
        .filter((cat) => cat.id !== editingCategoryId)
        .map((cat) => cat.name),
    ];

    if (
      allCategories.some(
        (cat) => cat.toLowerCase() === editingCategoryName.trim().toLowerCase()
      )
    ) {
      setSaveMessage("Já existe uma categoria com este nome!");
      setIsSuccess(false);
      setTimeout(() => setSaveMessage(""), 3000);
      return;
    }

    const updatedCategories = categories.map((cat) =>
      cat.id === editingCategoryId
        ? { ...cat, name: editingCategoryName.trim() }
        : cat
    );

    setCategories(updatedCategories);
    localStorage.setItem(
      "financeapp_categories",
      JSON.stringify(updatedCategories)
    );
    setEditingCategoryId(null);
    setEditingCategoryName("");
    setSaveMessage("Categoria atualizada com sucesso!");
    setIsSuccess(true);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleDeleteCategory = (id) => {
    const categoryToDelete = categories.find((cat) => cat.id === id);
    if (!categoryToDelete) return;

    // Verificar se a categoria está sendo usada em transações
    const savedTransactions = localStorage.getItem("financialData");
    if (savedTransactions) {
      const transactions = JSON.parse(savedTransactions);
      const isCategoryInUse = transactions.some(
        (t) => t.category === categoryToDelete.name
      );

      if (isCategoryInUse) {
        setSaveMessage(
          `Não é possível deletar: "${categoryToDelete.name}" está em uso em transações!`
        );
        setIsSuccess(false);
        setTimeout(() => setSaveMessage(""), 3000);
        return;
      }
    }

    if (
      window.confirm(
        `Tem certeza que deseja deletar a categoria "${categoryToDelete.name}"?`
      )
    ) {
      const updatedCategories = categories.filter((cat) => cat.id !== id);
      setCategories(updatedCategories);
      localStorage.setItem(
        "financeapp_categories",
        JSON.stringify(updatedCategories)
      );
      setSaveMessage("Categoria removida com sucesso!");
      setIsSuccess(true);
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const handleResetCategories = () => {
    if (
      window.confirm(
        "Tem certeza que deseja restaurar as categorias padrão? Suas categorias personalizadas serão perdidas."
      )
    ) {
      setCategories([]);
      localStorage.removeItem("financeapp_categories");
      setSaveMessage("Categorias restauradas para o padrão!");
      setIsSuccess(true);
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  // Categorias completas (padrão + personalizadas)
  const allCategories = [
    ...defaultCategories.map((name) => ({
      id: `default-${name}`,
      name,
      custom: false,
    })),
    ...categories,
  ];

  return (
    <div
      className="ml-[260px] flex-1 p-6 transition-colors duration-300 min-h-screen"
      style={{ backgroundColor: colors.primary }}
    >
      <div className="mb-5">
        <h2
          className="text-xl font-bold mb-1"
          style={{ color: colors.textPrimary }}
        >
          Configurações
        </h2>
        <div className="text-xs" style={{ color: colors.textSecondary }}>
          Personalize sua experiência no FinanceApp
        </div>
      </div>

      {/* Card de Tema */}
      <div
        className="rounded-lg border shadow-sm mb-3 overflow-hidden transition-colors duration-300"
        style={{
          backgroundColor: colors.secondary,
          borderColor: colors.border,
        }}
      >
        <div className="p-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center"
                style={{ backgroundColor: colors.accent }}
              >
                {theme === "dark" ? (
                  <Moon className="text-white" size={16} />
                ) : (
                  <Sun className="text-white" size={16} />
                )}
              </div>
              <div>
                <h3
                  className="text-sm font-semibold"
                  style={{ color: colors.textPrimary }}
                >
                  Aparência
                </h3>
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  Tema do sistema
                </p>
              </div>
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={() => toggleTheme("dark")}
                className="px-3 py-1.5 rounded-md border transition-all flex items-center gap-1.5 text-xs"
                style={{
                  backgroundColor:
                    theme === "dark" ? colors.tertiary : colors.secondary,
                  borderColor: theme === "dark" ? colors.accent : colors.border,
                }}
              >
                <Moon
                  size={14}
                  style={{
                    color:
                      theme === "dark" ? colors.accent : colors.textSecondary,
                  }}
                />
                <span
                  className="font-medium"
                  style={{ color: colors.textPrimary }}
                >
                  Escuro
                </span>
                {theme === "dark" && (
                  <CheckCircle size={14} style={{ color: colors.accent }} />
                )}
              </button>

              <button
                onClick={() => toggleTheme("light")}
                className="px-3 py-1.5 rounded-md border transition-all flex items-center gap-1.5 text-xs"
                style={{
                  backgroundColor:
                    theme === "light" ? colors.tertiary : colors.secondary,
                  borderColor:
                    theme === "light" ? colors.accent : colors.border,
                }}
              >
                <Sun
                  size={14}
                  style={{
                    color:
                      theme === "light" ? colors.accent : colors.textSecondary,
                  }}
                />
                <span
                  className="font-medium"
                  style={{ color: colors.textPrimary }}
                >
                  Claro
                </span>
                {theme === "light" && (
                  <CheckCircle size={14} style={{ color: colors.accent }} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card de Categorias */}
      <div
        className="rounded-lg border shadow-sm mb-3 overflow-hidden transition-colors duration-300"
        style={{
          backgroundColor: colors.secondary,
          borderColor: colors.border,
        }}
      >
        <div className="p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-[#9b59b6] rounded-md flex items-center justify-center">
              <Tag className="text-white" size={16} />
            </div>
            <div>
              <h3
                className="text-sm font-semibold"
                style={{ color: colors.textPrimary }}
              >
                Categorias Personalizadas
              </h3>
              <p className="text-xs" style={{ color: colors.textSecondary }}>
                Adicione suas próprias categorias
              </p>
            </div>
          </div>

          {/* Lista de Categorias */}
          <div className="mb-3">
            <div
              className="text-xs font-medium mb-2"
              style={{ color: colors.textSecondary }}
            >
              Suas categorias ({allCategories.length})
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {allCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border"
                  style={{
                    backgroundColor: colors.tertiary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                >
                  {cat.custom ? (
                    <>
                      {editingCategoryId === cat.id ? (
                        <input
                          type="text"
                          value={editingCategoryName}
                          onChange={(e) =>
                            setEditingCategoryName(e.target.value)
                          }
                          onBlur={handleSaveEdit}
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleSaveEdit()
                          }
                          className="bg-transparent border-none outline-none text-xs w-20"
                          style={{ color: colors.textPrimary }}
                          autoFocus
                        />
                      ) : (
                        <span>{cat.name}</span>
                      )}
                      <div className="flex gap-0.5 ml-1">
                        <button
                          onClick={() =>
                            editingCategoryId === cat.id
                              ? handleSaveEdit()
                              : handleEditCategory(cat.id, cat.name)
                          }
                          className="p-0.5 hover:bg-[#9b59b620] rounded transition-colors"
                          style={{ color: colors.textSecondary }}
                        >
                          <Edit size={10} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-0.5 hover:bg-[#e74c3c20] rounded transition-colors"
                          style={{ color: colors.textSecondary }}
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <span className="text-xs opacity-70">{cat.name}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Adicionar Nova Categoria */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Digite uma nova categoria..."
                onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
                className="flex-1 px-2.5 py-1.5 border rounded-md outline-none text-xs"
                style={{
                  backgroundColor: colors.tertiary,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
              />
              <button
                onClick={handleAddCategory}
                disabled={!newCategory.trim()}
                className="px-2.5 py-1.5 bg-[#9b59b6] hover:bg-[#8e44ad] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-md transition-all flex items-center gap-1"
              >
                <Plus size={12} />
                Adicionar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card de Notificações */}
      <div
        className="rounded-lg border shadow-sm mb-3 overflow-hidden transition-colors duration-300"
        style={{
          backgroundColor: colors.secondary,
          borderColor: colors.border,
        }}
      >
        <div className="p-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#25D366] rounded-md flex items-center justify-center">
                <Bell className="text-white" size={16} />
              </div>
              <div>
                <h3
                  className="text-sm font-semibold"
                  style={{ color: colors.textPrimary }}
                >
                  Notificações WhatsApp
                </h3>
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  Receba alertas no WhatsApp
                </p>
              </div>
            </div>
            <div className="self-start sm:self-center">
              <button
                onClick={toggleNotifications}
                className={`relative w-10 h-5 rounded-full transition-all ${
                  notificationsEnabled ? "bg-[#25D366]" : "bg-gray-500"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                    notificationsEnabled ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          {notificationsEnabled && (
            <div
              className="mt-2 pt-2 border-t"
              style={{ borderColor: colors.border }}
            >
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label
                    className="text-xs block mb-1 font-medium"
                    style={{ color: colors.textSecondary }}
                  >
                    Número WhatsApp
                  </label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) =>
                      setWhatsappNumber(formatPhoneNumber(e.target.value))
                    }
                    placeholder="55 11 99999-9999"
                    className="w-full px-2.5 py-1.5 border rounded-md outline-none text-xs"
                    style={{
                      backgroundColor: colors.tertiary,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    }}
                  />
                </div>
                <button
                  onClick={handleSaveWhatsapp}
                  className="px-3 py-1.5 bg-[#25D366] hover:bg-[#1da851] text-white text-xs font-semibold rounded-md transition-all flex items-center gap-1.5"
                >
                  <Save size={14} />
                  Salvar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {saveMessage && (
        <div
          className={`mb-3 p-2 rounded-md flex items-center gap-1.5 text-xs ${
            isSuccess
              ? "bg-green-500/20 text-green-500"
              : "bg-red-500/20 text-red-500"
          }`}
        >
          {isSuccess ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{saveMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Configuracoes;
