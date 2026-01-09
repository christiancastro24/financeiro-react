import { useState, useEffect } from "react";

export const useCartoesData = () => {
  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem("finance_premium_v5");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((card) => {
          if (!card.faturas && card.transactions) {
            const total = card.transactions.reduce(
              (sum, t) => sum + parseFloat(t.value),
              0
            );
            return {
              ...card,
              faturas: [
                {
                  id: `${card.id}-fatura-${Date.now()}`,
                  mesReferencia: "Sem mês",
                  dataImportacao: new Date().toISOString(),
                  total: total.toFixed(2),
                  transactions: card.transactions,
                  arquivo: "fatura_antiga.pdf",
                },
              ],
            };
          }
          return card;
        });
      } catch (error) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("finance_premium_v5", JSON.stringify(cards));
  }, [cards]);

  const deleteCard = (id) => {
    if (window.confirm("Remover este cartão e todas as suas faturas?")) {
      setCards((prev) => prev.filter((c) => c.id !== id));
      return true;
    }
    return false;
  };

  const deleteFatura = (cardId, faturaId) => {
    if (window.confirm("Remover esta fatura?")) {
      setCards((prev) =>
        prev.map((card) => {
          if (card.id === cardId) {
            const novasFaturas =
              card.faturas?.filter((f) => f.id !== faturaId) || [];
            return {
              ...card,
              faturas: novasFaturas,
            };
          }
          return card;
        })
      );
      return true;
    }
    return false;
  };

  const addOrUpdateFatura = (faturaData, importandoParaCartaoId = null) => {
    const { cardInfo, fatura } = faturaData;

    setCards((prev) => {
      if (importandoParaCartaoId) {
        return prev.map((card) => {
          if (card.id === importandoParaCartaoId) {
            const faturaExistenteIndex = card.faturas?.findIndex(
              (f) => f.mesReferencia === fatura.mesReferencia
            );

            if (faturaExistenteIndex >= 0) {
              const novasFaturas = [...card.faturas];
              novasFaturas[faturaExistenteIndex] = fatura;
              return {
                ...card,
                faturas: novasFaturas,
              };
            } else {
              return {
                ...card,
                faturas: [...(card.faturas || []), fatura],
              };
            }
          }
          return card;
        });
      }

      const existingCardIndex = prev.findIndex(
        (c) => c.bank === cardInfo.bank && c.lastDigits === cardInfo.lastDigits
      );

      if (existingCardIndex >= 0) {
        const updatedCards = [...prev];
        const existingCard = updatedCards[existingCardIndex];

        const faturaExistenteIndex = existingCard.faturas?.findIndex(
          (f) => f.mesReferencia === fatura.mesReferencia
        );

        if (faturaExistenteIndex >= 0) {
          updatedCards[existingCardIndex].faturas[faturaExistenteIndex] =
            fatura;
        } else {
          updatedCards[existingCardIndex].faturas = [
            ...(existingCard.faturas || []),
            fatura,
          ];
        }

        return updatedCards;
      } else {
        const novoCartao = {
          ...cardInfo,
          faturas: [fatura],
        };
        return [...prev, novoCartao];
      }
    });
  };

  return {
    cards,
    deleteCard,
    deleteFatura,
    addOrUpdateFatura,
  };
};
