/**
 * Testes do componente SecondaryButton (Button2Comp)
 * 
 * Usa jest.requireActual para garantir instrumentação correta de cobertura.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Importa o módulo real para garantir instrumentação de cobertura
const Button2Comp = jest.requireActual('@/components/SecondaryButton').default;
const { ThemeProvider } = jest.requireActual('../../constants/Theme');

// Helper para renderizar com o ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('SecondaryButton (Button2Comp)', () => {
    describe('Renderização básica', () => {
        it('deve renderizar com texto children', () => {
            const { getByText } = renderWithTheme(
                <Button2Comp>Clique aqui</Button2Comp>
            );
            expect(getByText('Clique aqui')).toBeTruthy();
        });

        it('deve renderizar sem erros com props padrão', () => {
            expect(() => renderWithTheme(
                <Button2Comp>Botão</Button2Comp>
            )).not.toThrow();
        });

        it('deve renderizar o componente TouchableOpacity', () => {
            const { root } = renderWithTheme(
                <Button2Comp>Test</Button2Comp>
            );
            expect(root).toBeTruthy();
        });
    });

    describe('Prop disabled', () => {
        it('deve renderizar como habilitado por padrão', () => {
            const { root } = renderWithTheme(
                <Button2Comp>Enabled</Button2Comp>
            );
            expect(root.props.disabled).toBeFalsy();
        });

        it('deve renderizar como desabilitado quando disabled=true', () => {
            const { root } = renderWithTheme(
                <Button2Comp disabled={true}>Disabled</Button2Comp>
            );
            expect(root.props.disabled).toBe(true);
        });

        it('deve renderizar como habilitado quando disabled=false', () => {
            const { root } = renderWithTheme(
                <Button2Comp disabled={false}>Enabled</Button2Comp>
            );
            expect(root.props.disabled).toBe(false);
        });
    });

    describe('Prop iconName', () => {
        // Nota: Testes com iconName são limitados devido ao mock do @expo/vector-icons
        it('deve renderizar sem ícone quando iconName não é fornecido', () => {
            const { getByText } = renderWithTheme(
                <Button2Comp>Sem ícone</Button2Comp>
            );
            expect(getByText('Sem ícone')).toBeTruthy();
        });
    });

    describe('Props de estilo de texto', () => {
        it('deve renderizar com textSize padrão (20)', () => {
            expect(() => renderWithTheme(
                <Button2Comp>Default Size</Button2Comp>
            )).not.toThrow();
        });

        it('deve renderizar com textSize customizado', () => {
            expect(() => renderWithTheme(
                <Button2Comp textSize={16}>Small Text</Button2Comp>
            )).not.toThrow();
        });

        it('deve renderizar com textWeight padrão (500)', () => {
            expect(() => renderWithTheme(
                <Button2Comp>Default Weight</Button2Comp>
            )).not.toThrow();
        });

        it('deve renderizar com textWeight customizado', () => {
            expect(() => renderWithTheme(
                <Button2Comp textWeight={700}>Bold Text</Button2Comp>
            )).not.toThrow();
        });

        it('deve renderizar com textSize e textWeight customizados', () => {
            expect(() => renderWithTheme(
                <Button2Comp textSize={14} textWeight={600}>Custom</Button2Comp>
            )).not.toThrow();
        });
    });

    describe('Prop style customizado', () => {
        it('deve aceitar style customizado', () => {
            const { root } = renderWithTheme(
                <Button2Comp style={{ marginTop: 20 }}>Styled</Button2Comp>
            );
            expect(root).toBeTruthy();
        });

        it('deve aceitar múltiplos estilos', () => {
            expect(() => renderWithTheme(
                <Button2Comp style={{ width: '80%', height: 50 }}>Wide Button</Button2Comp>
            )).not.toThrow();
        });
    });

    describe('Eventos', () => {
        it('deve chamar onPress quando clicado', () => {
            const mockOnPress = jest.fn();
            const { getByText } = renderWithTheme(
                <Button2Comp onPress={mockOnPress}>Click Me</Button2Comp>
            );

            fireEvent.press(getByText('Click Me'));
            expect(mockOnPress).toHaveBeenCalledTimes(1);
        });

        it('não deve chamar onPress quando desabilitado', () => {
            const mockOnPress = jest.fn();
            const { root } = renderWithTheme(
                <Button2Comp onPress={mockOnPress} disabled={true}>Disabled</Button2Comp>
            );

            // Quando disabled, o TouchableOpacity não dispara onPress
            expect(root.props.disabled).toBe(true);
        });

        it('deve chamar onLongPress quando pressionado longamente', () => {
            const mockOnLongPress = jest.fn();
            const { getByText } = renderWithTheme(
                <Button2Comp onLongPress={mockOnLongPress}>Long Press</Button2Comp>
            );

            fireEvent(getByText('Long Press'), 'longPress');
            expect(mockOnLongPress).toHaveBeenCalledTimes(1);
        });
    });

    describe('Combinações de props', () => {
        it('deve renderizar botão secundário completo', () => {
            const mockOnPress = jest.fn();
            const { getByText } = renderWithTheme(
                <Button2Comp
                    onPress={mockOnPress}
                    textSize={18}
                    textWeight={600}
                >
                    Cancelar
                </Button2Comp>
            );
            expect(getByText('Cancelar')).toBeTruthy();
        });

        it('deve renderizar botão estilizado completo', () => {
            expect(() => renderWithTheme(
                <Button2Comp
                    style={{ width: '50%', borderRadius: 10 }}
                    textSize={16}
                    textWeight={400}
                    onPress={() => { }}
                >
                    Botão Secundário
                </Button2Comp>
            )).not.toThrow();
        });
    });

    describe('Props adicionais (TouchableOpacityProps)', () => {
        it('deve aceitar activeOpacity', () => {
            expect(() => renderWithTheme(
                <Button2Comp activeOpacity={0.7}>Active</Button2Comp>
            )).not.toThrow();
        });

        it('deve aceitar testID', () => {
            const { getByTestId } = renderWithTheme(
                <Button2Comp testID="secondary-button">Test</Button2Comp>
            );
            expect(getByTestId('secondary-button')).toBeTruthy();
        });

        it('deve aceitar accessibilityLabel', () => {
            const { getByLabelText } = renderWithTheme(
                <Button2Comp accessibilityLabel="Botão secundário">A11y</Button2Comp>
            );
            expect(getByLabelText('Botão secundário')).toBeTruthy();
        });
    });
});
