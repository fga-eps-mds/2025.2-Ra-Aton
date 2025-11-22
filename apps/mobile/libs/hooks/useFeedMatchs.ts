import { useState } from 'react';

export const useModal = (initialState: boolean = false) => {
    const [visible, setVisible] = useState(initialState);
    const openModal = () => setVisible(true);
    const closeModal = () => setVisible(false);
    
    return { visible, openModal, closeModal };
};

export const useModalConfirmCard = (initialState : boolean = false) => {
    const [visibleConfirmCard, setVisibleConfirmCard] = useState(initialState);
    const openConfirmCard = () => setVisibleConfirmCard(true);
    const closeConfirmCard = () => setVisibleConfirmCard(false);
    
    return {visibleConfirmCard, openConfirmCard, closeConfirmCard};
}
