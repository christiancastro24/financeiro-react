import React, { useState, useEffect } from "react";
import { useTheme } from '../hooks/useTheme';
import { useCartoesData } from "../hooks/useCartoesData";
import { formatarReal, getCardTypeInfo, bankOptions } from "../utils/cardUtils";
import PageHeader from '../components/Cards/PageHeader';
import StatsCards from "../components/Cards/StatsCards";
import MonthFilter from "../components/Cards/MonthFilter";
import AlertMessage from "../components/Cards/AlertMessage";
import EmptyState from "../components/Cards/EmptyState";
import CardItem from "../components/Cards/CardItem";
import FaturaDetail from "../components/Cards/FaturaDetail";
import ImportModal from "../components/Cards/ImportModal";
import { usePdfProcessor } from "../hooks/usePdfProcessor";

const Cartoes = () => {
  const { theme, colors } = useTheme();
  const { cards, deleteCard, deleteFatura, addOrUpdateFatura } = useCartoesData();
  
  const [activeCardId, setActiveCardId] = useState(null);
  const [activeFaturaId, setActiveFaturaId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [mesFiltro, setMesFiltro] = useState("");
  const [expandedCards, setExpandedCards] = useState({});
  const [importandoParaCartaoId, setImportandoParaCartaoId] = useState(null);
  const [showBankModal, setShowBankModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");

  const {
    isExtracting,
    processPdf,
  } = usePdfProcessor({
    setError,
    setSuccessMessage,
    addOrUpdateFatura,
    setShowBankModal,
    setImportandoParaCartaoId,
    setSelectedBank,
    setSelectedFile,
    setFileName,
    setExpandedCards,
  });

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const openBankModal = (cardId = null) => {
    setImportandoParaCartaoId(cardId);

    if (cardId) {
      const card = cards.find((c) => c.id === cardId);
      if (card) {
        const bankId =
          bankOptions.find((b) => b.name === card.bank)?.id || "outros";
        setSelectedBank(bankId);
      }
    } else {
      setSelectedBank("");
    }

    setShowBankModal(true);
    setSelectedFile(null);
    setFileName("");
    setError(null);
  };

  const toggleCardExpansion = (cardId) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleImport = () => {
    if (!selectedBank && !importandoParaCartaoId) {
      setError("Por favor, selecione um banco.");
      return;
    }
    if (!selectedFile) {
      setError("Por favor, selecione um arquivo PDF.");
      return;
    }

    const bankId = importandoParaCartaoId
      ? bankOptions.find((b) => b.name === cards.find((c) => c.id === importandoParaCartaoId)?.bank)?.id
      : selectedBank;

    processPdf(selectedFile, bankId, importandoParaCartaoId);
  };

  const selecionarFatura = (cardId, faturaId) => {
    setActiveCardId(cardId);
    setActiveFaturaId(faturaId);
  };

  const voltarParaLista = () => {
    setActiveCardId(null);
    setActiveFaturaId(null);
  };

  const handleDeleteCard = (e, id) => {
    e.stopPropagation();
    const deleted = deleteCard(id);
    if (deleted && activeCardId === id) {
      setActiveCardId(null);
      setActiveFaturaId(null);
    }
  };

  const handleDeleteFatura = (e, cardId, faturaId) => {
    e.stopPropagation();
    const deleted = deleteFatura(cardId, faturaId);
    if (deleted && activeFaturaId === faturaId) {
      setActiveFaturaId(null);
    }
  };

  const totalCartoes = cards.length;
  const totalFaturas = cards.reduce(
    (acc, card) => acc + (card.faturas?.length || 0),
    0
  );
  const totalGasto = cards.reduce((acc, card) => {
    return (
      acc +
      (card.faturas?.reduce(
        (sum, fatura) => sum + parseFloat(fatura.total || 0),
        0
      ) || 0)
    );
  }, 0);

  const todosMeses = Array.from(
    new Set(
      cards.flatMap((card) => card.faturas?.map((f) => f.mesReferencia) || [])
    )
  ).sort((a, b) => {
    const [mesA, anoA] = (a || "").split("/").map(Number);
    const [mesB, anoB] = (b || "").split("/").map(Number);
    return (anoB || 0) - (anoA || 0) || (mesB || 0) - (mesA || 0);
  });

  const activeCard = activeCardId
    ? cards.find((c) => c.id === activeCardId)
    : null;

  const activeFatura =
    activeCard && activeFaturaId
      ? (activeCard.faturas || []).find((f) => f.id === activeFaturaId)
      : null;

  const safeActiveCard = activeCard || {
    id: "",
    bank: "",
    brand: "Cartão",
    lastDigits: "0000",
    color: "#666666",
    faturas: [],
    name: "Cartão não encontrado",
  };

  const safeActiveFatura =
    activeFatura ||
    (safeActiveCard.faturas && safeActiveCard.faturas.length > 0
      ? safeActiveCard.faturas[0]
      : {
          id: "",
          mesReferencia: "Sem mês",
          total: "0.00",
          transactions: [],
          arquivo: "",
          dataImportacao: new Date().toISOString(),
        });

  useEffect(() => {
    if (
      activeCardId &&
      activeFaturaId &&
      !activeFatura &&
      safeActiveCard.faturas &&
      safeActiveCard.faturas.length > 0
    ) {
      setActiveFaturaId(safeActiveCard.faturas[0].id);
    }
  }, [activeCardId, activeFaturaId, activeFatura, safeActiveCard.faturas]);

  return (
    <div
      className="ml-[260px] flex-1 min-h-screen transition-colors duration-300 p-6"
      style={{ backgroundColor: colors.primary }}
    >
      <div className="max-w-6xl mx-auto">
        <PageHeader
          colors={colors}
          cards={cards}
          activeCardId={activeCardId}
          openBankModal={openBankModal}
        />

        {!activeCardId && cards.length > 0 && (
          <>
            <StatsCards
              totalCartoes={totalCartoes}
              totalFaturas={totalFaturas}
              totalGasto={totalGasto}
              colors={colors}
              formatarReal={formatarReal}
            />
            <MonthFilter
              todosMeses={todosMeses}
              mesFiltro={mesFiltro}
              setMesFiltro={setMesFiltro}
              colors={colors}
            />
          </>
        )}

        <AlertMessage
          type="error"
          message={error}
          onClose={() => setError(null)}
        />

        <AlertMessage
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />

        {!activeCardId ? (
          <div className="space-y-4">
            {cards.length === 0 ? (
              <EmptyState colors={colors} openBankModal={openBankModal} />
            ) : (
              cards.map((card, index) => (
                <CardItem
                  key={card.id}
                  card={card}
                  index={index}
                  colors={colors}
                  bankOptions={bankOptions}
                  formatarReal={formatarReal}
                  expandedCards={expandedCards}
                  toggleCardExpansion={toggleCardExpansion}
                  deleteCard={handleDeleteCard}
                  openBankModal={openBankModal}
                  mesFiltro={mesFiltro}
                  selecionarFatura={selecionarFatura}
                  deleteFatura={handleDeleteFatura}
                />
              ))
            )}
          </div>
        ) : (
          <FaturaDetail
            safeActiveCard={safeActiveCard}
            safeActiveFatura={safeActiveFatura}
            colors={colors}
            voltarParaLista={voltarParaLista}
            openBankModal={openBankModal}
            setActiveFaturaId={setActiveFaturaId}
            activeFaturaId={activeFaturaId}
            getCardTypeInfo={getCardTypeInfo}
          />
        )}

        <ImportModal
          showBankModal={showBankModal}
          setShowBankModal={setShowBankModal}
          colors={colors}
          isExtracting={isExtracting}
          importandoParaCartaoId={importandoParaCartaoId}
          setImportandoParaCartaoId={setImportandoParaCartaoId}
          cards={cards}
          bankOptions={bankOptions}
          selectedBank={selectedBank}
          setSelectedBank={setSelectedBank}
          selectedFile={selectedFile}
          fileName={fileName}
          handleFileSelect={handleFileSelect}
          handleImport={handleImport}
          error={error}
        />
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${
            theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
          };
          border-radius: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #5568d3 0%, #653a8b 100%);
        }

        tr {
          border: none;
        }

      `}</style>
    </div>
  );
};

export default Cartoes;