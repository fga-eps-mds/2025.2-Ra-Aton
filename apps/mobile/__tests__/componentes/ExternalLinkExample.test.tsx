import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ExternalLinkExample } from '../../components/ExternalLinkExample';
import * as WebBrowser from 'expo-web-browser';

// --- MOCKS BLINDADOS ---

// Mock do Expo Web Browser
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
}));

// Mock do Expo Router (Link)
// Transformamos o Link em um TouchableOpacity para podermos clicar nele no teste
jest.mock('expo-router', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return {
    Link: (props: any) => (
      <TouchableOpacity onPress={(e) => props.onPress(e)} testID="external-link">
        {props.children}
      </TouchableOpacity>
    ),
  };
});

describe('ExternalLinkExample', () => {
  it('deve renderizar o link corretamente', () => {
    const { getByTestId } = render(
      <ExternalLinkExample href="https://google.com">
        Clique Aqui
      </ExternalLinkExample>
    );
    
    expect(getByTestId('external-link')).toBeTruthy();
  });

  it('deve abrir o navegador interno ao clicar (Native Behavior)', () => {
    const { getByTestId } = render(
      <ExternalLinkExample href="https://google.com">
        Link Teste
      </ExternalLinkExample>
    );

    const link = getByTestId('external-link');

    // Precisamos simular o evento 'e' com preventDefault, pois o componente o utiliza
    const mockEvent = {
      preventDefault: jest.fn(),
    };

    // Dispara o clique passando o evento fake
    fireEvent.press(link, mockEvent);

    // Verifica se preveniu o comportamento padrão (navegação web)
    expect(mockEvent.preventDefault).toHaveBeenCalled();

    // Verifica se chamou a função do WebBrowser com a URL correta
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith('https://google.com');
  });
});