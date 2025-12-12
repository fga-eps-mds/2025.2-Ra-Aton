import { renderHook, act } from '@testing-library/react-native';

// --- AÇÃO CRUCIAL ---
// Dizemos ao Jest: "Para este teste, use o arquivo REAL, não o mock que criamos nos outros arquivos"
jest.unmock('@/constants/Theme');

import { ThemeProvider, useTheme } from '@/constants/Theme';

describe('Context: Theme', () => {

    it('deve fornecer o valor padrão (isDarkMode = true)', () => {
        const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });

        // No seu código original: const [isDarkMode, setIsDarkMode] = useState(true);
        // Portanto, deve ser true.
        expect(result.current.isDarkMode).toBe(true);
    });

    it('deve alternar o tema quando toggleDarkMode for chamado', () => {
        const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });

        expect(result.current.isDarkMode).toBe(true);

        // Alternar para False
        act(() => {
            result.current.toggleDarkMode();
        });
        expect(result.current.isDarkMode).toBe(false);

        // Alternar de volta para True
        act(() => {
            result.current.toggleDarkMode();
        });
        expect(result.current.isDarkMode).toBe(true);
    });

    it('deve lançar um erro se useTheme for usado fora do ThemeProvider', () => {
        // Silencia o console.error pois o React vai reclamar do erro (que é esperado)
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        try {
            // Como estamos usando o código real agora, ele VAI lançar o erro
            expect(() => renderHook(() => useTheme())).toThrow('useTheme must be used within a ThemeProvider');
        } finally {
            consoleSpy.mockRestore();
        }
    });
});