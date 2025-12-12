import React from 'react';
import { render } from '@testing-library/react-native';
import { ModalDescription } from '../../components/ModalDescription';
import { View, Text } from 'react-native';

// --- MOCKS ---

jest.mock('@/constants/Colors', () => ({
  Colors: {
    // Adicione cores se necessário, mas o componente usa hexadecimais hardcoded
  },
}));

jest.mock('@/constants/Fonts', () => ({
  Fonts: { mainFont: { dongleRegular: 'Arial' } },
}));

describe('ModalDescription', () => {
  it('deve renderizar título e descrição passados', () => {
    const { getByText } = render(
      <ModalDescription 
        visible={true} 
        onClose={() => {}} 
        title="Regras do Jogo" 
        description="Não vale mão." 
      />
    );

    expect(getByText('Regras do Jogo')).toBeTruthy();
    expect(getByText('Não vale mão.')).toBeTruthy();
  });

  it('deve renderizar fallback se título/descrição não forem passados', () => {
    const { getByText } = render(
      <ModalDescription 
        visible={true} 
        onClose={() => {}} 
        // title e description undefined
      />
    );

    expect(getByText('Descrição da partida')).toBeTruthy(); // Título padrão
    expect(getByText('Nenhuma descrição foi adicionada para esta partida.')).toBeTruthy(); // Msg padrão
  });

  it('deve renderizar mensagem vazia se descrição for string vazia ou espaços', () => {
    const { getByText } = render(
      <ModalDescription 
        visible={true} 
        onClose={() => {}} 
        description="   " 
      />
    );

    expect(getByText('Nenhuma descrição foi adicionada para esta partida.')).toBeTruthy();
  });
});