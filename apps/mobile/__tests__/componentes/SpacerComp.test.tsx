/**
 * Testes do componente SpacerComp
 * 
 * Usa jest.requireActual para garantir instrumentação correta de cobertura.
 */
import React from 'react';
import { render } from '@testing-library/react-native';

// Importa o módulo real para garantir instrumentação de cobertura
const Spacer = jest.requireActual('@/components/SpacerComp').default;

describe('SpacerComp (Spacer)', () => {
    describe('Renderização com props padrão', () => {
        it('deve renderizar com props padrão', () => {
            const { root } = render(<Spacer />);
            expect(root).toBeTruthy();
        });

        it('deve ter width padrão de 85%', () => {
            const { root } = render(<Spacer />);
            expect(root.props.style.width).toBe('85%');
        });

        it('deve ter height padrão de 40', () => {
            const { root } = render(<Spacer />);
            expect(root.props.style.height).toBe(40);
        });

        it('deve ter pointerEvents "none" por padrão (passThrough=true)', () => {
            const { root } = render(<Spacer />);
            expect(root.props.style.pointerEvents).toBe('none');
        });

        it('deve ter backgroundColor vazio por padrão', () => {
            const { root } = render(<Spacer />);
            expect(root.props.style.backgroundColor).toBe('');
        });
    });

    describe('Customização de dimensões', () => {
        it('deve renderizar com width customizado em porcentagem', () => {
            const { root } = render(<Spacer width="50%" />);
            expect(root.props.style.width).toBe('50%');
        });

        it('deve renderizar com width customizado em número', () => {
            const { root } = render(<Spacer width={100} />);
            expect(root.props.style.width).toBe(100);
        });

        it('deve renderizar com height customizado', () => {
            const { root } = render(<Spacer height={80} />);
            expect(root.props.style.height).toBe(80);
        });

        it('deve renderizar com width e height customizados juntos', () => {
            const { root } = render(<Spacer width="100%" height={120} />);
            expect(root.props.style.width).toBe('100%');
            expect(root.props.style.height).toBe(120);
        });
    });

    describe('Prop passThrough', () => {
        it('deve ter pointerEvents "none" quando passThrough é true', () => {
            const { root } = render(<Spacer passThrough={true} />);
            expect(root.props.style.pointerEvents).toBe('none');
        });

        it('deve ter pointerEvents "auto" quando passThrough é false', () => {
            const { root } = render(<Spacer passThrough={false} />);
            expect(root.props.style.pointerEvents).toBe('auto');
        });
    });

    describe('Prop bgColor', () => {
        it('deve renderizar com background color customizado (hex)', () => {
            const { root } = render(<Spacer bgColor="#FF0000" />);
            expect(root.props.style.backgroundColor).toBe('#FF0000');
        });

        it('deve renderizar com background color customizado (nome)', () => {
            const { root } = render(<Spacer bgColor="blue" />);
            expect(root.props.style.backgroundColor).toBe('blue');
        });

        it('deve renderizar com background color customizado (rgba)', () => {
            const { root } = render(<Spacer bgColor="rgba(0,0,0,0.5)" />);
            expect(root.props.style.backgroundColor).toBe('rgba(0,0,0,0.5)');
        });
    });

    describe('Combinações de props', () => {
        it('deve renderizar com todas as props customizadas', () => {
            const { root } = render(
                <Spacer
                    width="70%"
                    height={50}
                    passThrough={false}
                    bgColor="#CCCCCC"
                />
            );
            expect(root.props.style.width).toBe('70%');
            expect(root.props.style.height).toBe(50);
            expect(root.props.style.pointerEvents).toBe('auto');
            expect(root.props.style.backgroundColor).toBe('#CCCCCC');
        });

        it('deve renderizar como separador visual (passThrough=true com cor)', () => {
            const { root } = render(
                <Spacer
                    width="100%"
                    height={1}
                    bgColor="#E0E0E0"
                />
            );
            expect(root.props.style.width).toBe('100%');
            expect(root.props.style.height).toBe(1);
            expect(root.props.style.backgroundColor).toBe('#E0E0E0');
            expect(root.props.style.pointerEvents).toBe('none');
        });

        it('deve renderizar como área clicável (passThrough=false)', () => {
            const { root } = render(
                <Spacer
                    width="100%"
                    height={60}
                    passThrough={false}
                />
            );
            expect(root.props.style.pointerEvents).toBe('auto');
        });
    });
});
