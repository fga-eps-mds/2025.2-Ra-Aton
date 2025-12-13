import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CustomAlertModalComp } from '../../components/CustomAlertModalComp';
import { View, Text } from 'react-native';

// --- MOCKS ---

jest.mock('@/constants/Theme', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

jest.mock('@/constants/Colors', () => ({
  Colors: {
    light: { input: '#fff', orange: 'orange', text: 'black' },
    dark: { input: '#000', orange: 'orange', text: 'white' },
  },
}));

// Mock do AppText
jest.mock('../../components/AppText', () => {
  const { Text } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: (props: any) => <Text {...props}>{props.children}</Text>,
  };
});

describe('CustomAlertModalComp', () => {
  it('não deve renderizar nada se visible for false', () => {
    const { toJSON } = render(
      <CustomAlertModalComp 
        visible={false} 
        title="Teste" 
        message="Msg" 
        onClose={() => {}} 
      />
    );
    
    // Se visible=false, o componente retorna null. O JSON deve ser null.
    expect(toJSON()).toBeNull();
  });

  it('deve renderizar Título e Mensagem quando visível', () => {
    const { getByText } = render(
      <CustomAlertModalComp 
        visible={true} 
        title="Atenção Usuário" 
        message="Deseja continuar?" 
        onClose={() => {}} 
      />
    );

    expect(getByText('Atenção Usuário')).toBeTruthy();
    expect(getByText('Deseja continuar?')).toBeTruthy();
  });

  it('deve mostrar botão OK se onConfirm NÃO for passado', () => {
    const onCloseMock = jest.fn();
    const { getByText } = render(
      <CustomAlertModalComp 
        visible={true} 
        title="Info" 
        message="Apenas informativo" 
        onClose={onCloseMock} 
        // onConfirm undefined
      />
    );

    // Deve ter apenas o botão OK
    const btnOk = getByText('OK');
    expect(btnOk).toBeTruthy();

    fireEvent.press(btnOk);
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('deve mostrar Confirmar e Cancelar se onConfirm FOR passado', () => {
    const onConfirmMock = jest.fn();
    const onCloseMock = jest.fn();

    const { getByText } = render(
      <CustomAlertModalComp 
        visible={true} 
        title="Decisão" 
        message="Sim ou Não?" 
        onClose={onCloseMock}
        onConfirm={onConfirmMock}
        confirmText="Sim, aceito"
        cancelText="Não, sai"
      />
    );

    // Verifica se os textos customizados apareceram
    const btnConfirm = getByText('Sim, aceito');
    const btnCancel = getByText('Não, sai');
    
    expect(btnConfirm).toBeTruthy();
    expect(btnCancel).toBeTruthy();

    // Testa clique no Confirmar
    fireEvent.press(btnConfirm);
    // Seu código chama onConfirm() e depois onClose()
    expect(onConfirmMock).toHaveBeenCalled();
    expect(onCloseMock).toHaveBeenCalled();
  });
  
  it('deve renderizar estilo danger (Coverage)', () => {
      // Teste de fumaça para cobrir a linha "type === 'danger'"
      const { getByText } = render(
        <CustomAlertModalComp 
            visible={true} 
            title="Perigo" 
            message="Deletar?" 
            onClose={()=>{}}
            onConfirm={()=>{}}
            type="danger" 
        />
      );
      
      // Apenas garantimos que renderizou sem erro
      expect(getByText('Perigo')).toBeTruthy();
  });
});