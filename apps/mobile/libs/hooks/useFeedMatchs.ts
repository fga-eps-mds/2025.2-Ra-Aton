import { useState } from 'react';
const initialState = false;

const [visibleConfirmCard, setVisibleConfirmCard] = useState(initialState);
const [visible, setVisible] = useState(initialState);
const [visibleDetailsHandle, setVisibleDetailsHandle] = useState(initialState);;
const [visibleInfosHandleMatch, setVisibleInfosHandleMatch] = useState(initialState);
const [visibleReportMatch, setVisibleReportMatch] = useState(initialState);;
    
const useModal = () => {
    setVisible(true);
    setVisible(false);    
};

const useDetailsHandleMatchModal = () => {
    setVisibleDetailsHandle(true);
    setVisibleDetailsHandle(false);
}

const useModalConfirmCard = () => {
    setVisibleConfirmCard(true);
    setVisibleConfirmCard(false);
    
}
const useModalMoreInfosHandleModal = () => {
    setVisibleInfosHandleMatch(true);
    setVisibleInfosHandleMatch(false);
}

const useReportMatchModal = (initalState : boolean = false) => {
    setVisibleReportMatch(true);
    setVisibleReportMatch(false);    
}

export const UseModalFeedMatchs = () =>{
  
    return {
        useModal,
        useDetailsHandleMatchModal,
        useModalConfirmCard,
        useModalMoreInfosHandleModal,
        useReportMatchModal
    }
}

