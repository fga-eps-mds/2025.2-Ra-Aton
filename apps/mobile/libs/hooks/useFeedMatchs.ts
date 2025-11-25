import { useState } from 'react';

export const UseModalFeedMatchs = () =>{
    const initialState = false;
    const [visibleConfirmCard, setVisibleConfirmCard] = useState(initialState);
    const [visible, setVisible] = useState(initialState);
    const [visibleDetailsHandle, setVisibleDetailsHandle] = useState(initialState);;
    const [visibleInfosHandleMatch, setVisibleInfosHandleMatch] = useState(initialState);
    const [visibleReportMatch, setVisibleReportMatch] = useState(initialState);
    const [statusVisibleInfos, setStatusVisibleInfos] = useState(initialState);

    const useModal = () => {
    setVisible(true);
};

const closeModal = () => {
    setVisible(false);
}

const closeDetailsAndBackToHandle = () => {
  setVisible(false);            // fecha o MatchDetailsModal
  setVisibleConfirmCard(true);  // reabre o HandleMatchComp
};

const openDetailsFromHandle = () => {
    setVisibleInfosHandleMatch(false);
    setVisibleConfirmCard(false);
    setVisible(true);
}

const openDetailsHandleMatchModal = () => {
    setVisibleDetailsHandle(true);
}

const closeDetailsHandleMatchModal = () => {
    setVisibleDetailsHandle(false);
}

const openModalConfirmCard = () => {
    setVisibleConfirmCard(true);
}

const closeModalConfirmCard = () => {
    setVisibleConfirmCard(false);
}

const openModalMoreInfosHandleModal = () => {
    setVisibleInfosHandleMatch(true);
}

const closeModalMoreInfosHandleModal = () => {
    setVisibleInfosHandleMatch(false);
}

const openReportMatchModal = () => {
    setVisibleReportMatch(true);
}

const closeReportMatchModal = () => {
    setVisibleReportMatch(false);
}





    return {    
    visibleConfirmCard,
    visible,
    visibleDetailsHandle,
    visibleInfosHandleMatch,
    visibleReportMatch,

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
    closeDetailsAndBackToHandle,

}
}

