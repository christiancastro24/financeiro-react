import { useState } from "react";
import { extrairMesReferencia } from "../utils/cardUtils";
import {
  processMercadoPago,
  processNubank,
  processSicredi,
  processGeneric,
} from "../utils/pdfProcessors";

export const usePdfProcessor = ({
  setError,
  setSuccessMessage,
  addOrUpdateFatura,
  setShowBankModal,
  setImportandoParaCartaoId,
  setSelectedBank,
  setSelectedFile,
  setFileName,
  setExpandedCards,
}) => {
  const [isExtracting, setIsExtracting] = useState(false);

  const processPdf = async (file, bankId, importandoParaCartaoId = null) => {
    if (!file || !bankId) {
      return;
    }

    setIsExtracting(true);
    setError(null);

    try {
      if (!window.pdfjsLib) {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        document.head.appendChild(script);
        await new Promise((r) => (script.onload = r));
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer })
        .promise;

      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      const normalizedText = fullText.replace(/[\u00A0\s]+/g, " ");
      const mesReferencia = extrairMesReferencia(normalizedText);

      let faturaData = null;

      if (bankId === "mercado_pago") {
        faturaData = await processMercadoPago(
          normalizedText,
          file.name,
          mesReferencia
        );
      } else if (bankId === "sicredi") {
        faturaData = await processSicredi(
          normalizedText,
          file.name,
          mesReferencia
        );
      } else if (bankId === "nubank") {
        faturaData = await processNubank(
          normalizedText,
          file.name,
          mesReferencia
        );
      } else {
        faturaData = await processGeneric(
          normalizedText,
          bankId,
          file.name,
          mesReferencia
        );
      }

      if (faturaData) {
        const { cardInfo } = faturaData;
        addOrUpdateFatura(faturaData, importandoParaCartaoId);

        setShowBankModal(false);
        setImportandoParaCartaoId(null);
        setSelectedBank("");
        setSelectedFile(null);
        setFileName("");

        setExpandedCards((prev) => ({
          ...prev,
          [cardInfo.id]: true,
        }));

        setSuccessMessage(`Fatura de ${mesReferencia} importada com sucesso!`);
      } else {
        setError(
          "Não conseguimos extrair informações do cartão deste PDF. Verifique se é uma fatura válida."
        );
      }
    } catch (err) {
      setError(`Erro técnico ao ler o PDF: ${err.message}`);
    } finally {
      setIsExtracting(false);
    }
  };

  return {
    isExtracting,
    processPdf,
  };
};
