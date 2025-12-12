import React from 'react';
import { render } from '@testing-library/react-native';
// Ajuste do caminho conforme sua solicitação
import NextGamesScreen from '../../../../app/(DashBoard)/(tabs)/NextGames';
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

describe('Screen: NextGames', () => {
  it('deve renderizar o texto da tela', () => {
    const { getByText } = render(<NextGamesScreen />);
    
    expect(getByText('TELA DE Próximos Jogos')).toBeTruthy();
  });

  it('deve renderizar sem erros (Snapshot/Smoke)', () => {
    const { toJSON } = render(<NextGamesScreen />);
    expect(toJSON()).toBeDefined();
  });
});