import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CardHandlePostComp } from '../../components/CardHandlePostsComp'; // Ajuste o caminho se necessário
import { View } from 'react-native';

// --- MOCKS ---

jest.mock('@/constants/Colors', () => ({
  Colors: {
    dark: { input: '#333', orange: 'orange', text: 'white' },
    light: { input: '#fff', orange: 'orange', text: 'black' },
  },
}));

// Mock do AppText para garantir que texto apareça
jest.mock('../../components/AppText', () => {
  const { Text } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: (props: any) => <Text {...props}>{props.children}</Text>,
  };
});

// Mock do Ionicons
jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  return {
    Ionicons: (props: any) => <View testID={`icon-${props.name}`} {...props} />,
  };
});

describe('CardHandlePostComp', () => {
  const mockPostEvent = {
    id: '1',
    type: 'EVENT', // Importante para o teste do rodapé
    attendancesCount: 15,
  };

  const mockPostNormal = {
    id: '2',
    type: 'POST',
  };

  it('deve renderizar o título corretamente', () => {
    const { getByText } = render(
      <CardHandlePostComp 
        title="Festa na Piscina" 
        post={mockPostNormal as any} 
      />
    );
    expect(getByText('Festa na Piscina')).toBeTruthy();
  });

  it('deve usar "Sem título" como fallback', () => {
    const { getByText } = render(
      <CardHandlePostComp post={mockPostNormal as any} />
    );
    expect(getByText('Sem título')).toBeTruthy();
  });

  it('deve disparar onPressCard ao clicar no card', () => {
    const onCardPress = jest.fn();
    const { getByText } = render(
      <CardHandlePostComp 
        title="Card Clicavel" 
        onPressCard={onCardPress} 
        post={mockPostNormal as any} 
      />
    );

    // Clica no texto do título, que está dentro do card
    fireEvent.press(getByText('Card Clicavel'));
    expect(onCardPress).toHaveBeenCalled();
  });

  it('deve disparar onOpenMenu ao clicar no ícone de menu', () => {
    const onMenuPress = jest.fn();
    const title = "Menu Teste";
    
    // O seu componente define testID={`menu-btn-${title}`}
    const { getByTestId } = render(
      <CardHandlePostComp 
        title={title} 
        onOpenMenu={onMenuPress} 
        post={mockPostNormal as any} 
      />
    );

    fireEvent.press(getByTestId(`menu-btn-${title}`));
    expect(onMenuPress).toHaveBeenCalled();
  });

  it('deve mostrar contagem de confirmações APENAS se for evento', () => {
    // 1. Renderiza EVENTO
    const { getByText } = render(
      <CardHandlePostComp 
        title="Evento Top" 
        post={mockPostEvent as any} 
      />
    );
    // Regex para achar "15 confirmações" no meio do texto
    expect(getByText(/15 confirmações/i)).toBeTruthy();
  });

  it('NÃO deve mostrar rodapé se NÃO for evento', () => {
    // 2. Renderiza POST NORMAL
    const { queryByText } = render(
      <CardHandlePostComp 
        title="Post Normal" 
        post={mockPostNormal as any} 
      />
    );
    // queryByText retorna null se não achar
    expect(queryByText(/confirmações/i)).toBeNull();
  });
});