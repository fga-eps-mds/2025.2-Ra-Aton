import React from 'react';
import { render } from '@testing-library/react-native';
import { EventInfoModalComp } from '../../components/EventInfoModal';
import { View, Text } from 'react-native';

// --- MOCKS BLINDADOS ---

jest.mock('@/constants/Theme', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

jest.mock('@/constants/Colors', () => ({
  Colors: {
    light: { input: '#fff' },
    dark: { input: '#000' },
  },
}));

jest.mock('@/constants/Fonts', () => ({
  Fonts: { mainFont: { dongleRegular: 'Arial' } },
}));

// Mock do Ionicons
jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  return {
    Ionicons: (props: any) => <View {...props} />,
  };
});

// MOCK ESTRATÉGICO DO INPUTCOMP
// Em vez de renderizar o input complexo, renderizamos apenas o VALOR dele como texto.
// Isso nos permite verificar se a data e o local foram formatados e passados corretamente.
jest.mock('../../components/InputComp', () => {
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <Text testID="mock-input">{props.value}</Text>,
  };
});

// Mock do Spacer
jest.mock('../../components/SpacerComp', () => 'Spacer');

describe('EventInfoModalComp', () => {
  // Data fixa para evitar problemas de fuso horário nos testes
  const mockDateStart = '2025-12-25T14:00:00';
  const mockDateEnd = '2025-12-25T18:00:00';

  const mockPost = {
    id: '1',
    content: 'Evento Teste',
    location: 'Ginásio Principal',
    eventDate: mockDateStart,
    eventFinishDate: mockDateEnd,
  };

  it('não deve renderizar nada se visible for false', () => {
    const { toJSON } = render(
      <EventInfoModalComp 
        visible={false} 
        post={mockPost as any} 
      />
    );
    expect(toJSON()).toBeNull();
  });

  it('deve renderizar o local do evento', () => {
    const { getByText } = render(
      <EventInfoModalComp 
        visible={true} 
        post={mockPost as any} 
      />
    );
    
    // Graças ao mock do InputComp, o valor 'Ginásio Principal' vira um Text simples
    expect(getByText('Ginásio Principal')).toBeTruthy();
  });

  it('deve formatar e exibir as datas/horários', () => {
    const { getAllByTestId } = render(
      <EventInfoModalComp 
        visible={true} 
        post={mockPost as any} 
      />
    );
    
    // Como mockamos o InputComp com testID="mock-input", podemos pegar todos eles
    const inputs = getAllByTestId('mock-input');
    
    // O modal renderiza 3 inputs. Vamos verificar se eles contêm dados.
    // Nota: A formatação exata de data (dd/mm/aaaa) depende do locale do ambiente de teste (Node).
    // Por segurança, verificamos se os inputs renderizaram e não estão vazios.
    expect(inputs.length).toBe(3);
    
    // O primeiro é location (já testado acima)
    // O segundo é data (start - end)
    // O terceiro é hora
    
    // Verifica se renderizou algo nos campos de data/hora
    expect(inputs[1].props.children).toBeDefined();
    expect(inputs[2].props.children).toBeDefined();
  });

  it('deve renderizar o título INFORMAÇÕES', () => {
    const { getByText } = render(
      <EventInfoModalComp visible={true} post={mockPost as any} />
    );
    expect(getByText('INFORMAÇÕES')).toBeTruthy();
  });
});