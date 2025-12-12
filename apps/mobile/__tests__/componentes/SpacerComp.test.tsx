import React from 'react';
import { render } from '@testing-library/react-native';
import Spacer from '@/components/SpacerComp';

describe('SpacerComp (Spacer)', () => {
    it('renders with default props', () => {
        const { UNSAFE_root } = render(
            <Spacer />
        );

        expect(UNSAFE_root).toBeTruthy();
    });

    it('renders with custom width and height', () => {
        const { UNSAFE_root } = render(
            <Spacer width="50%" height={50} />
        );

        expect(UNSAFE_root).toBeTruthy();
    });

    it('renders with custom background color', () => {
        const { UNSAFE_root } = render(
            <Spacer bgColor="#FF0000" />
        );

        expect(UNSAFE_root).toBeTruthy();
    });

    it('accepts passThrough prop (touches pass through)', () => {
        const { UNSAFE_root } = render(
            <Spacer passThrough={false} />
        );

        expect(UNSAFE_root).toBeTruthy();
    });
});
