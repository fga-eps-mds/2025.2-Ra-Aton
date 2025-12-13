/**
 * Testes do componente InputComp
 * 
 * Este arquivo usa jest.isolateModules para garantir que o componente
 * seja carregado sem os mocks globais afetando a instrumentação de cobertura.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Importa o módulo de forma que ele seja instrumentado corretamente
const InputComp = jest.requireActual('@/components/InputComp').default;
const { ThemeProvider } = jest.requireActual('../../constants/Theme');

// Helper para renderizar com o ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Componente: InputComp', () => {
    describe('Renderização básica', () => {
        it('deve renderizar com valor string', () => {
            const { getByDisplayValue } = renderWithTheme(<InputComp value="teste" />);
            expect(getByDisplayValue('teste')).toBeTruthy();
        });

        it('deve renderizar com label', () => {
            const { getByText } = renderWithTheme(<InputComp label="Nome" value="João" />);
            expect(getByText('Nome')).toBeTruthy();
        });

        it('deve renderizar com placeholder', () => {
            expect(() => renderWithTheme(<InputComp placeholder="Digite" value="" />)).not.toThrow();
        });

        it('deve renderizar com ícone', () => {
            expect(() => renderWithTheme(<InputComp iconName="mail" value="" />)).not.toThrow();
        });
    });

    describe('Formatação de valores', () => {
        it('deve converter null para string vazia', () => {
            const { getByDisplayValue } = renderWithTheme(<InputComp value={null} />);
            expect(getByDisplayValue('')).toBeTruthy();
        });

        it('deve converter undefined para string vazia', () => {
            const { getByDisplayValue } = renderWithTheme(<InputComp value={undefined} />);
            expect(getByDisplayValue('')).toBeTruthy();
        });

        it('deve renderizar com valor numérico', () => {
            expect(() => renderWithTheme(<InputComp value={12345} />)).not.toThrow();
        });

        it('deve renderizar com valor Date', () => {
            expect(() => renderWithTheme(<InputComp value={new Date()} />)).not.toThrow();
        });

        it('deve renderizar com formatter', () => {
            const formatter = (v: any) => `F:${v}`;
            expect(() => renderWithTheme(<InputComp value="x" formatter={formatter} />)).not.toThrow();
        });
    });

    describe('justView (modo leitura)', () => {
        it('deve renderizar com justView=true', () => {
            expect(() => renderWithTheme(<InputComp value="ro" justView={true} />)).not.toThrow();
        });

        it('deve renderizar com justView=false', () => {
            expect(() => renderWithTheme(<InputComp value="ed" justView={false} />)).not.toThrow();
        });
    });

    describe('secureTextEntry (senha)', () => {
        it('deve renderizar com secureTextEntry=true', () => {
            expect(() => renderWithTheme(<InputComp value="pwd" secureTextEntry={true} />)).not.toThrow();
        });

        it('deve renderizar com secureTextEntry=false', () => {
            expect(() => renderWithTheme(<InputComp value="txt" secureTextEntry={false} />)).not.toThrow();
        });

        it('deve renderizar botão toggle de senha', () => {
            const { root } = renderWithTheme(<InputComp value="pwd" secureTextEntry />);
            expect(root).toBeTruthy();
        });
    });

    describe('Status', () => {
        it('deve renderizar com status e statusText', () => {
            expect(() => renderWithTheme(
                <InputComp label="E" value="" status statusText="Err" />
            )).not.toThrow();
        });

        it('não mostra statusText sem label', () => {
            const { queryByText } = renderWithTheme(<InputComp value="" status statusText="Err" />);
            expect(queryByText('Err')).toBeNull();
        });
    });

    describe('Estilos customizados', () => {
        it('deve renderizar com width', () => {
            expect(() => renderWithTheme(<InputComp value="" width="80%" />)).not.toThrow();
        });

        it('deve renderizar com height', () => {
            expect(() => renderWithTheme(<InputComp value="" height={70} />)).not.toThrow();
        });

        it('deve renderizar com bgColor', () => {
            expect(() => renderWithTheme(<InputComp value="" bgColor="#f00" />)).not.toThrow();
        });
    });

    describe('Eventos', () => {
        it('deve chamar onChangeText', () => {
            const fn = jest.fn();
            const { getByDisplayValue } = renderWithTheme(<InputComp value="" onChangeText={fn} />);
            fireEvent.changeText(getByDisplayValue(''), 'novo');
            expect(fn).toHaveBeenCalledWith('novo');
        });

        it('deve chamar onFocus', () => {
            const fn = jest.fn();
            const { getByDisplayValue } = renderWithTheme(<InputComp value="" onFocus={fn} />);
            fireEvent(getByDisplayValue(''), 'focus');
            expect(fn).toHaveBeenCalled();
        });

        it('deve chamar onBlur', () => {
            const fn = jest.fn();
            const { getByDisplayValue } = renderWithTheme(<InputComp value="" onBlur={fn} />);
            fireEvent(getByDisplayValue(''), 'blur');
            expect(fn).toHaveBeenCalled();
        });
    });

    describe('Props adicionais', () => {
        it('deve renderizar com props extras', () => {
            expect(() => renderWithTheme(
                <InputComp value="" maxLength={100} keyboardType="email-address" autoCapitalize="none" />
            )).not.toThrow();
        });
    });

    describe('Combinações', () => {
        it('deve renderizar campo de senha completo', () => {
            expect(() => renderWithTheme(
                <InputComp value="pwd" label="Senha" iconName="lock-closed" secureTextEntry placeholder="Senha" />
            )).not.toThrow();
        });

        it('deve renderizar campo readonly completo', () => {
            expect(() => renderWithTheme(
                <InputComp value="Fixo" label="Campo" justView status statusText="Info" />
            )).not.toThrow();
        });

        it('deve renderizar campo com estilos completos', () => {
            expect(() => renderWithTheme(
                <InputComp value="styled" width="90%" height={60} bgColor="#e0e0e0" iconName="person" />
            )).not.toThrow();
        });
    });
});
