import { useState } from "react";
import { Imatches } from "@/libs/interfaces/Imatches";

export const UseModalEditMatchs = () => {
  const initialState = false;
  const [visibleConfirmCard, setVisibleConfirmCard] = useState(initialState);
  const [visible, setVisible] = useState(initialState);
  const [visibleDetailsHandle, setVisibleDetailsHandle] = useState(initialState);
  const [visibleInfosHandleMatch, setVisibleInfosHandleMatch] = useState(initialState);
  const [visibleReportMatch, setVisibleReportMatch] = useState(initialState);
  const [visibleDescriptionMatch, setVisibleDescriptionMatch] = useState(initialState);
  const [detailsOrigin, setDetailsOrigin] = useState<"card" | "handle" | null>(null);

  const [selectedMatch, setSelectedMatch] = useState<Imatches | null>(null);

  const useModal = (match: Imatches) => {
    setSelectedMatch(match);
    setDetailsOrigin("card");
    setVisible(true);
  };

  const closeModal = () => {
    setVisible(false);

    if (detailsOrigin === "handle") {
      setVisibleConfirmCard(true);
    }

    setDetailsOrigin(null);
  };

  const openDetailsFromHandle = () => {
    setVisibleInfosHandleMatch(false);
    setVisibleConfirmCard(false);

    setDetailsOrigin("handle");
    setVisible(true);
  };

  const openDetailsHandleMatchModal = () => {
    setVisibleDetailsHandle(true);
  };

  const closeDetailsHandleMatchModal = () => {
    setVisibleDetailsHandle(false);
  };

  // abrir modal do handle (confirmação) vindo do CARD
  const openModalConfirmCard = (match: Imatches) => {
    setSelectedMatch(match);
    setVisibleConfirmCard(true);
  };

  const closeModalConfirmCard = () => {
    setVisibleConfirmCard(false);
  };

  const openModalMoreInfosHandleModal = () => {
    setVisibleInfosHandleMatch(true);
  };

  const closeModalMoreInfosHandleModal = () => {
    setVisibleInfosHandleMatch(false);
  };

  const openReportMatchModal = () => {
    setVisibleReportMatch(true);
  };

  const closeReportMatchModal = () => {
    setVisibleReportMatch(false);
  };


const openDescriptionMatchModal = () => {
  setVisibleDescriptionMatch(true);
};

const closeDescriptionMatchModal = () => {
  setVisibleDescriptionMatch(false);
};



  return {
    visibleConfirmCard,
    visible,
    visibleDetailsHandle,
    visibleInfosHandleMatch,
    visibleReportMatch,
    visibleDescriptionMatch,
    
    selectedMatch,

    useModal,
    closeModal,

    openDetailsHandleMatchModal,
    closeDetailsHandleMatchModal,

    openModalConfirmCard,
    closeModalConfirmCard,

    openModalMoreInfosHandleModal,
    closeModalMoreInfosHandleModal,

    openReportMatchModal,
    closeReportMatchModal,

    openDetailsFromHandle,

    openDescriptionMatchModal,
    closeDescriptionMatchModal,
  };
};
