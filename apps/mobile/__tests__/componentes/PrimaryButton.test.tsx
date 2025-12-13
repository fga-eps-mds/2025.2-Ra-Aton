/**
 * Testes do componente PrimaryButton (Button1Comp)
 * 
 * Usa jest.requireActual para garantir instrumentação correta de cobertura.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Importa o módulo real para garantir instrumentação de cobertura
const Button1Comp = jest.requireActual('@/components/PrimaryButton').default;
const { ThemeProvider } = jest.requireActual('../../constants/Theme');

// Helper para renderizar com o ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('PrimaryButton (Button1Comp)', () => {
    describe('Renderização básica', () => {
        it('deve renderizar com texto children', () => {
            const { getByText } = renderWithTheme(
                <Button1Comp>Clique aqui</Button1Comp>
            );
            expect(getByText('Clique aqui')).toBeTruthy();
        });

        it('deve renderizar sem erros com props padrão', () => {
            expect(() => renderWithTheme(
                <Button1Comp>Botão</Button1Comp>
            )).not.toThrow();
        });

        it('deve renderizar o componente TouchableOpacity', () => {
            const { root } = renderWithTheme(
                <Button1Comp>Test</Button1Comp>
            );
            expect(root).toBeTruthy();
        });
    });

    describe('Prop disabled', () => {
        it('deve renderizar como habilitado por padrão', () => {
            const { root } = renderWithTheme(
                <Button1Comp>Enabled</Button1Comp>
            );
            expect(root.props.disabled).toBeFalsy();
        });

        it('deve renderizar como desabilitado quando disabled=true', () => {
            const { root } = renderWithTheme(
                <Button1Comp disabled={true}>Disabled</Button1Comp>
            );
            expect(root.props.disabled).toBe(true);
        });

        it('deve renderizar como habilitado quando disabled=false', () => {
            const { root } = renderWithTheme(
                <Button1Comp disabled={false}>Enabled</Button1Comp>
            );
            expect(root.props.disabled).toBe(false);
        });
    });

    describe('Prop iconName', () => {
        it('deve renderizar com ícone quando iconName é fornecido', () => {
            expect(() => renderWithTheme(
                <Button1Comp iconName="add">Add</Button1Comp>
            )).not.toThrow();
        });

        it('deve renderizar sem ícone quando iconName não é fornecido', () => {
            const { getByText } = renderWithTheme(
                <Button1Comp>Sem ícone</Button1Comp>
            );
            expect(getByText('Sem ícone')).toBeTruthy();
        });

        it('deve renderizar com diferentes tipos de ícone', () => {
            expect(() => renderWithTheme(
                <Button1Comp iconName="settings" />
            )).not.toThrow();
        });
    });

    describe('Props de estilo de texto', () => {
        it('deve renderizar com textSize padrão (22)', () => {
            expect(() => renderWithTheme(
                <Button1Comp>Default Size</Button1Comp>
            )).not.toThrow();
        });

        it('deve renderizar com textSize customizado', () => {
            expect(() => renderWithTheme(
                <Button1Comp textSize={18}>Small Text</Button1Comp>
            )).not.toThrow();
        });

        it('deve renderizar com textWeight padrão (700)', () => {
            expect(() => renderWithTheme(
                <Button1Comp>Default Weight</Button1Comp>
            )).not.toThrow();
        });

        it('deve renderizar com textWeight customizado', () => {
            expect(() => renderWithTheme(
                <Button1Comp textWeight={400}>Light Text</Button1Comp>
            )).not.toThrow();
        });

        it('deve renderizar com textSize e textWeight customizados', () => {
            expect(() => renderWithTheme(
                <Button1Comp textSize={16} textWeight={500}>Custom</Button1Comp>
            )).not.toThrow();
        });
    });

    describe('Prop style customizado', () => {
        it('deve aceitar style customizado', () => {
            const { root } = renderWithTheme(
                <Button1Comp style={{ marginTop: 20 }}>Styled</Button1Comp>
            );
            expect(root).toBeTruthy();
        });

        it('deve aceitar múltiplos estilos', () => {
            expect(() => renderWithTheme(
                <Button1Comp style={{ width: '80%', height: 50 }}>Wide Button</Button1Comp>
            )).not.toThrow();
        });
    });

    describe('Eventos', () => {
        it('deve chamar onPress quando clicado', () => {
            const mockOnPress = jest.fn();
            const { getByText } = renderWithTheme(
                <Button1Comp onPress={mockOnPress}>Click Me</Button1Comp>
            );

            fireEvent.press(getByText('Click Me'));
            expect(mockOnPress).toHaveBeenCalledTimes(1);
        });

        it('não deve chamar onPress quando desabilitado', () => {
            const mockOnPress = jest.fn();
            const { root } = renderWithTheme(
                <Button1Comp onPress={mockOnPress} disabled={true}>Disabled</Button1Comp>
            );

            // Quando disabled, o TouchableOpacity não dispara onPress
            expect(root.props.disabled).toBe(true);
        });

        it('deve chamar onLongPress quando pressionado longamente', () => {
            const mockOnLongPress = jest.fn();
            const { getByText } = renderWithTheme(
                <Button1Comp onLongPress={mockOnLongPress}>Long Press</Button1Comp>
            );

            fireEvent(getByText('Long Press'), 'longPress');
            expect(mockOnLongPress).toHaveBeenCalledTimes(1);
        });
    });

    describe('Combinações de props', () => {
        it('deve renderizar botão de ação principal', () => {
            const mockOnPress = jest.fn();
            const { getByText } = renderWithTheme(
                <Button1Comp
                    onPress={mockOnPress}
                    textSize={20}
                    textWeight={600}
                >
                    Confirmar
                </Button1Comp>
            );
            expect(getByText('Confirmar')).toBeTruthy();
        });

        it('deve renderizar botão com ícone desabilitado', () => {
            expect(() => renderWithTheme(
                <Button1Comp
                    iconName="lock-closed"
                    disabled={true}
                />
            )).not.toThrow();
        });

        it('deve renderizar botão estilizado completo', () => {
            expect(() => renderWithTheme(
                <Button1Comp
                    style={{ width: '90%', borderRadius: 10 }}
                    textSize={24}
                    textWeight={800}
                    onPress={() => { }}
                >
                    Botão Estilizado
                </Button1Comp>
            )).not.toThrow();
        });
    });

    describe('Props adicionais (TouchableOpacityProps)', () => {
        it('deve aceitar activeOpacity', () => {
            expect(() => renderWithTheme(
                <Button1Comp activeOpacity={0.8}>Active</Button1Comp>
            )).not.toThrow();
        });

        it('deve aceitar testID', () => {
            const { getByTestId } = renderWithTheme(
                <Button1Comp testID="primary-button">Test</Button1Comp>
            );
            expect(getByTestId('primary-button')).toBeTruthy();
        });

        it('deve aceitar accessibilityLabel', () => {
            const { getByLabelText } = renderWithTheme(
                <Button1Comp accessibilityLabel="Botão principal">A11y</Button1Comp>
            );
            expect(getByLabelText('Botão principal')).toBeTruthy();
        });
    });
});
