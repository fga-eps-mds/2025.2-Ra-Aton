import React from 'react';
import { render } from '@testing-library/react-native';
import BackGroundComp from '@/components/BackGroundComp';
import { useTheme } from '@/constants/Theme';

jest.mock('@/constants/Theme', () => ({
    useTheme: jest.fn(),
}));

describe('BackGroundComp', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders successfully with dark mode', () => {
        (useTheme as jest.Mock).mockReturnValue({ isDarkMode: true });

        const { getByTestId } = render(
            <BackGroundComp testID="background-dark" />
        );

        expect(getByTestId('background-dark')).toBeTruthy();
    });

    it('renders successfully with light mode', () => {
        (useTheme as jest.Mock).mockReturnValue({ isDarkMode: false });

        const { getByTestId } = render(
            <BackGroundComp testID="background-light" />
        );

        expect(getByTestId('background-light')).toBeTruthy();
    });
});