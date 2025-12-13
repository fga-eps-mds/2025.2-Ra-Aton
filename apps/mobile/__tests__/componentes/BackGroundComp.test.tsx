// import React from 'react';
// import { render } from '@testing-library/react-native';
// import BackGroundComp from '@/components/BackGroundComp';
// import { useTheme } from '@/constants/Theme';

// // Mock do hook de tema
// jest.mock('@/constants/Theme', () => ({
//     useTheme: jest.fn(),
// }));

// // Mock das Cores
// jest.mock('@/constants/Colors', () => ({
//     Colors: {
//         dark: { background: '#000000' },
//         light: { background: '#ffffff' },
//     },
// }));

// // CORREÇÃO: Usamos require() dentro do mock para evitar erro de hoisting
// jest.mock('react-native-safe-area-context', () => {
//     const { View } = require('react-native');
//     return {
//         SafeAreaView: jest.fn(({ style, children, ...props }) => (
//             <View style={style} {...props}>
//                 {children}
//             </View>
//         )),
//     };
// });

// describe('BackGroundComp', () => {
//     beforeEach(() => {
//         jest.clearAllMocks();
//     });

//     it('deve renderizar com a cor de fundo do tema ESCURO', () => {
//         (useTheme as jest.Mock).mockReturnValue({ isDarkMode: true });

//         const { getByTestId } = render(
//             <BackGroundComp testID="background-comp" />
//         );

//         const component = getByTestId('background-comp');
//         const style = component.props.style;

//         // Verifica se o estilo contém a cor correta (#000000)
//         if (Array.isArray(style)) {
//             expect(style).toEqual(
//                 expect.arrayContaining([
//                     expect.objectContaining({ backgroundColor: '#000000' })
//                 ])
//             );
//         } else {
//             expect(style).toEqual(
//                 expect.objectContaining({ backgroundColor: '#000000' })
//             );
//         }
//     });

//     it('deve renderizar com a cor de fundo do tema CLARO', () => {
//         (useTheme as jest.Mock).mockReturnValue({ isDarkMode: false });

//         const { getByTestId } = render(
//             <BackGroundComp testID="background-comp" />
//         );

//         const component = getByTestId('background-comp');
//         const style = component.props.style;

//         // Verifica se o estilo contém a cor correta (#ffffff)
//         if (Array.isArray(style)) {
//             expect(style).toEqual(
//                 expect.arrayContaining([
//                     expect.objectContaining({ backgroundColor: '#ffffff' })
//                 ])
//             );
//         } else {
//             expect(style).toEqual(
//                 expect.objectContaining({ backgroundColor: '#ffffff' })
//             );
//         }
//     });

//     it('deve permitir adicionar estilos customizados (ex: padding)', () => {
//         (useTheme as jest.Mock).mockReturnValue({ isDarkMode: false });
//         const customStyle = { padding: 20 };

//         const { getByTestId } = render(
//             <BackGroundComp testID="background-comp" style={customStyle} />
//         );

//         const component = getByTestId('background-comp');
//         const style = component.props.style;

//         // Verifica se o estilo customizado foi aplicado
//         if (Array.isArray(style)) {
//             expect(style).toEqual(expect.arrayContaining([expect.objectContaining(customStyle)]));
//         } else {
//             expect(style).toEqual(expect.objectContaining(customStyle));
//         }
//     });
// });