import React from 'react';
import { render } from '@testing-library/react-native';
// Ajuste o caminho
import MenuScreenPlaceholder from '../../../../app/(DashBoard)/(tabs)/menu';
import { View } from 'react-native';

describe('Screen: Menu Placeholder', () => {
  it('deve renderizar sem quebrar', () => {
    const { toJSON } = render(<MenuScreenPlaceholder />);
    // Deve ser apenas uma View vazia
    expect(toJSON()).toBeDefined();
  });
});