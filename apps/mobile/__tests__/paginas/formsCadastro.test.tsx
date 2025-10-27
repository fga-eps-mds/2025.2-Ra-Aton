import { render, screen } from "@testing-library/react-native";
// import SecondaryButton from "@/components/SecondaryButton";
import FormsCadastro from "../../app/(Auth)/formsCadastro";

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/constants/Theme', () => ({
  useTheme: () => ({
    isDarkMode: false,
    toggleDarkMode: jest.fn(),
  }),
}));

describe("Teste de renderização dos elementos da segunda tela de cadastro", () => {
  it("deve rederizar o texto", () => {
    render(<FormsCadastro />);

    // const logoAton = screen.getByAccessibilityLabel("LogoAton");   
    const infoText = screen.getByText(/Para finalizar o seu cadastro/i);
    const selectText = screen.getByText("Selecione seu perfil");
    const textBtnAtletica = screen.getByText("Atlética");
    const textBtnJogador = screen.getByText("Jogador");
    const textBtnTorcedor = screen.getByText("Torcedor");

    // expect(logoAton).toBeTruthy();
    expect(infoText).toBeTruthy();
    expect(selectText).toBeTruthy();
    expect(textBtnAtletica).toBeTruthy();
    expect(textBtnJogador).toBeTruthy();
    expect(textBtnTorcedor).toBeTruthy();
  });
});
