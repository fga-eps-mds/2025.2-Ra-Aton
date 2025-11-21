import { useState } from 'react';

export const useModal = (initialState: boolean = false) => {
    const [visible, setVisible] = useState(initialState);
    const openModal = () => setVisible(true);
    const closeModal = () => setVisible(false);
    
    return { visible, openModal, closeModal };
};


