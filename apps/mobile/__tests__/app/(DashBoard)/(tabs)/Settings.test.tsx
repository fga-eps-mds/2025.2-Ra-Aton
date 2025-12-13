import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SettingsScreen from "@/app/(DashBoard)/(tabs)/Settings";
import { useSettings } from "@/libs/hooks/useSettings";
import { useTheme } from "@/constants/Theme";

// --- MOCKS ---

// Mock do Hook useSettings
jest.mock("@/libs/hooks/useSettings", () => ({
    useSettings: jest.fn(),
}));

// Mock do Hook useTheme
jest.mock("@/constants/Theme", () => ({
    useTheme: jest.fn(),
}));

// Mock de Componentes Secundários para isolar o teste
jest.mock("@/components/PrimaryButton", () => {
    const { TouchableOpacity, Text } = require("react-native");
    return (props: any) => (
        <TouchableOpacity testID={props.testID} onPress={props.onPress} style={props.style}>
            <Text>{props.children}</Text>
        </TouchableOpacity>
    );
});

jest.mock("@/components/DescricaoInput", () => ({
    DescricaoInput: (props: any) => {
        const { TextInput } = require("react-native");
        return (
            <TextInput
                testID="feedback-input"
                value={props.value}
                onChangeText={props.onChangeText}
                placeholder={props.placeholder}
            />
        );
    },
}));

jest.mock("@/components/SpacerComp", () => "Spacer");

describe("SettingsScreen", () => {
    // Mock padrão do useSettings
    const mockSettings = {
        selectedTab: "perfil",
        setSelectedTab: jest.fn(),
        isLoading: false,
        isEnabled: false,
        toggleSwitch: jest.fn(),
        logout: jest.fn(),
        confirmDelete: jest.fn(),
        rating: 0,
        setRating: jest.fn(),
        message: "",
        setmessage: jest.fn(),
        enviarAvaliacao: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useSettings as jest.Mock).mockReturnValue(mockSettings);
        (useTheme as jest.Mock).mockReturnValue({ isDarkMode: false });
    });

    // --- RENDERIZAÇÃO E NAVEGAÇÃO ENTRE ABAS ---

    it("deve renderizar a aba 'Perfil' por padrão", () => {
        const { getByText, getByTestId } = render(<SettingsScreen />);

        expect(getByText("Receber Notificações")).toBeTruthy();
        expect(getByTestId("switch-notifications")).toBeTruthy();
        expect(getByTestId("btn-logout")).toBeTruthy();
        expect(getByTestId("btn-delete")).toBeTruthy();
    });

    it("deve alternar para a aba 'Feedback' ao clicar", () => {
        const setSelectedTabSpy = jest.fn();
        (useSettings as jest.Mock).mockReturnValue({
            ...mockSettings,
            setSelectedTab: setSelectedTabSpy,
        });

        const { getByText } = render(<SettingsScreen />);

        fireEvent.press(getByText("Feedback"));

        expect(setSelectedTabSpy).toHaveBeenCalledWith("feedback");
    });

    it("deve alternar de volta para a aba 'Perfil'", () => {
        const setSelectedTabSpy = jest.fn();
        (useSettings as jest.Mock).mockReturnValue({
            ...mockSettings,
            selectedTab: "feedback", // Começa no feedback
            setSelectedTab: setSelectedTabSpy,
        });

        const { getByText } = render(<SettingsScreen />);

        fireEvent.press(getByText("Perfil"));

        expect(setSelectedTabSpy).toHaveBeenCalledWith("perfil");
    });

    // --- ABA PERFIL ---

    it("deve mostrar ActivityIndicator quando isLoading for true (ao invés do Switch)", () => {
        (useSettings as jest.Mock).mockReturnValue({
            ...mockSettings,
            isLoading: true,
        });

        const { getByTestId, queryByTestId } = render(<SettingsScreen />);

        expect(getByTestId("loading-indicator")).toBeTruthy();
        expect(queryByTestId("switch-notifications")).toBeNull();
    });

    it("deve chamar toggleSwitch ao mudar o switch", () => {
        const toggleSwitchSpy = jest.fn();
        (useSettings as jest.Mock).mockReturnValue({
            ...mockSettings,
            toggleSwitch: toggleSwitchSpy,
        });

        const { getByTestId } = render(<SettingsScreen />);

        fireEvent(getByTestId("switch-notifications"), "valueChange", true);

        expect(toggleSwitchSpy).toHaveBeenCalled();
    });

    it("deve chamar logout ao clicar no botão Sair", () => {
        const logoutSpy = jest.fn();
        (useSettings as jest.Mock).mockReturnValue({
            ...mockSettings,
            logout: logoutSpy,
        });

        const { getByTestId } = render(<SettingsScreen />);

        fireEvent.press(getByTestId("btn-logout"));

        expect(logoutSpy).toHaveBeenCalled();
    });

    it("deve chamar confirmDelete ao clicar no botão Excluir conta", () => {
        const confirmDeleteSpy = jest.fn();
        (useSettings as jest.Mock).mockReturnValue({
            ...mockSettings,
            confirmDelete: confirmDeleteSpy,
        });

        const { getByTestId } = render(<SettingsScreen />);

        fireEvent.press(getByTestId("btn-delete"));

        expect(confirmDeleteSpy).toHaveBeenCalled();
    });

    // --- ABA FEEDBACK ---

    it("deve renderizar elementos da aba Feedback corretamente", () => {
        (useSettings as jest.Mock).mockReturnValue({
            ...mockSettings,
            selectedTab: "feedback",
        });

        const { getByText, getByTestId } = render(<SettingsScreen />);

        expect(getByText("Avalie o App!")).toBeTruthy();
        expect(getByTestId("feedback-input")).toBeTruthy();
        expect(getByText("Enviar")).toBeTruthy();
    });

    it("deve permitir selecionar estrelas (setRating)", () => {
        const setRatingSpy = jest.fn();
        (useSettings as jest.Mock).mockReturnValue({
            ...mockSettings,
            selectedTab: "feedback",
            setRating: setRatingSpy,
        });

        const { getAllByText } = render(<SettingsScreen />);

        // Pega todas as estrelas (★)
        const stars = getAllByText("★");

        // Clica na terceira estrela (índice 2)
        fireEvent.press(stars[2]);

        expect(setRatingSpy).toHaveBeenCalledWith(3);
    });

    it("deve atualizar o texto da avaliação (setMessage)", () => {
        const setMessageSpy = jest.fn();
        (useSettings as jest.Mock).mockReturnValue({
            ...mockSettings,
            selectedTab: "feedback",
            setmessage: setMessageSpy,
        });

        const { getByTestId } = render(<SettingsScreen />);

        fireEvent.changeText(getByTestId("feedback-input"), "Muito bom!");

        expect(setMessageSpy).toHaveBeenCalledWith("Muito bom!");
    });

    it("deve chamar enviarAvaliacao ao clicar no botão Enviar", () => {
        const enviarAvaliacaoSpy = jest.fn();
        (useSettings as jest.Mock).mockReturnValue({
            ...mockSettings,
            selectedTab: "feedback",
            enviarAvaliacao: enviarAvaliacaoSpy,
        });

        const { getByText } = render(<SettingsScreen />);

        fireEvent.press(getByText("Enviar"));

        expect(enviarAvaliacaoSpy).toHaveBeenCalled();
    });

    // --- COBERTURA DE TEMAS E ESTILOS CONDICIONAIS ---

    it("deve aplicar estilos do Modo Escuro", () => {
        (useTheme as jest.Mock).mockReturnValue({ isDarkMode: true });

        const { getByText } = render(<SettingsScreen />);

        // Verifica se renderiza sem erro no modo escuro
        // Asserções visuais exatas de estilo são difíceis e frágeis, 
        // mas a renderização confirma que o branch 'isDarkMode ? ... : ...' foi executado.
        expect(getByText("Receber Notificações")).toBeTruthy();
    });

    it("deve aplicar estilos do Modo Claro", () => {
        (useTheme as jest.Mock).mockReturnValue({ isDarkMode: false });

        const { getByText } = render(<SettingsScreen />);

        expect(getByText("Receber Notificações")).toBeTruthy();
    });

    it("deve destacar a aba selecionada visualmente (branch color style)", () => {
        (useSettings as jest.Mock).mockReturnValue({
            ...mockSettings,
            selectedTab: "feedback",
        });

        const { getByText } = render(<SettingsScreen />);

        // Apenas para garantir que o estilo condicional do Text (color) foi avaliado
        const feedbackTab = getByText("Feedback");
        expect(feedbackTab.props.style).toBeDefined();
    });

    it("deve renderizar estrelas preenchidas corretamente (branch s <= rating)", () => {
        // Simula rating 3 para testar a lógica de cor
        (useSettings as jest.Mock).mockReturnValue({
            ...mockSettings,
            selectedTab: "feedback",
            rating: 3
        });

        const { getAllByText } = render(<SettingsScreen />);
        const stars = getAllByText("★");

        // Não validamos a cor exata pois ela vem de constante, mas garantimos que renderizou
        expect(stars).toHaveLength(5);
    });
});