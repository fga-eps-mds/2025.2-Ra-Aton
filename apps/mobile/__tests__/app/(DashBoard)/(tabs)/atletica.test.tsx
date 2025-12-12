import React from 'react';
import { render } from '@testing-library/react-native';
// AJUSTE O CAMINHO ABAIXO CONFORME SUA PASTA (ex: ../../app/(DashBoard)/(tabs)/atletica)
import AtleticaScreen from '../../../../app/(DashBoard)/(tabs)/Atletica'; 
import { View, Text } from 'react-native';

// --- MOCKS BLINDADOS ---

jest.mock('@/constants/Theme', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

jest.mock('@/constants/Colors', () => ({
  Colors: {
    light: { background: '#ffffff', text: '#000000' },
    dark: { background: '#000000', text: '#ffffff' },
  },
}));

describe('Screen: Atletica', () => {
  it('deve renderizar o texto da lista de atléticas', () => {
    const { getByText } = render(<AtleticaScreen />);
    
    expect(getByText('TELA DE Lista de Atléticas')).toBeTruthy();
  });

  it('deve aplicar estilos de tema (Smoke Test)', () => {
    // Apenas garantimos que o componente monta sem erro de estilo undefined
    const { toJSON } = render(<AtleticaScreen />);
    expect(toJSON()).toBeDefined();
  });
});