import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import CardNotificationComp from "@/components/CardNotificationComp";
import { useTheme } from "@/constants/Theme";
import { aceitarSolicitacao } from "@/libs/solicitacoes/aceitarSolicitacao";
import { rejeitarSolicitacao } from "@/libs/solicitacoes/rejeitarSolicitacao";

// --- MOCKS ---

// Mock das funções de API
// Definimos o mock diretamente no factory para evitar problemas de hoisting
jest.mock("@/libs/solicitacoes/aceitarSolicitacao", () => ({
  aceitarSolicitacao: jest.fn(),
}));

jest.mock("@/libs/solicitacoes/rejeitarSolicitacao", () => ({
  rejeitarSolicitacao: jest.fn(),
}));

// Mock do Router
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock do Theme
jest.mock("@/constants/Theme", () => ({
  useTheme: jest.fn(),
}));

// Mock dos Botões customizados
jest.mock("@/components/PrimaryButton", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return (props: any) => (
    <TouchableOpacity onPress={props.onPress} testID="primary-button">
      <Text>{props.children}</Text>
    </TouchableOpacity>
  );
});

jest.mock("@/components/SecondaryButton", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return (props: any) => (
    <TouchableOpacity onPress={props.onPress} testID="secondary-button">
      <Text>{props.children}</Text>
    </TouchableOpacity>
  );
});

describe("CardNotificationComp", () => {
  const mockOnMarkAsRead = jest.fn();

  const defaultProps = {
    title: "Notificação Geral",
    type: "INFO",
    description: "Uma descrição qualquer",
    isRead: false,
    inviteId: "123",
    onMarkAsRead: mockOnMarkAsRead,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: Modo Escuro
    (useTheme as jest.Mock).mockReturnValue({ isDarkMode: true });
  });

  // --- TESTES DE RENDERIZAÇÃO E BRANCHES DE TEMA ---

  it("deve renderizar corretamente no Modo Escuro (Default)", () => {
    const { getByText } = render(<CardNotificationComp {...defaultProps} />);
    expect(getByText("Notificação Geral")).toBeTruthy();
  });

  it("deve renderizar corretamente no Modo Claro (Branch Coverage)", () => {
    // Cobre o branch: const theme = isDarkMode ? Colors.dark : Colors.light;
    (useTheme as jest.Mock).mockReturnValue({ isDarkMode: false });
    const { getByText } = render(<CardNotificationComp {...defaultProps} />);
    expect(getByText("Notificação Geral")).toBeTruthy();
  });

  // --- TESTES DE VISUALIZAÇÃO DE BOTÕES ---

  it("deve mostrar o botão 'Marcar como lida' se não for lida e não for solicitação", () => {
    const { getByText } = render(<CardNotificationComp {...defaultProps} isRead={false} />);
    const btn = getByText("Marcar como lida");
    fireEvent.press(btn);
    expect(mockOnMarkAsRead).toHaveBeenCalledTimes(1);
  });

  it("NÃO deve mostrar o botão 'Marcar como lida' se já estiver lida", () => {
    const { queryByText } = render(<CardNotificationComp {...defaultProps} isRead={true} />);
    expect(queryByText("Marcar como lida")).toBeNull();
  });

  // --- TESTES DE SOLICITAÇÃO DE ENTRADA (REGEX E NAVEGAÇÃO) ---

  it("deve extrair o nome do usuário e navegar para o perfil ao clicar em 'Perfil'", () => {
    const props = {
      ...defaultProps,
      title: "Solicitação de Entrada",
      description: "Samuel solicitou entrada no grupo",
      type: "GROUP_JOIN_REQUEST",
    };

    const { getByText } = render(<CardNotificationComp {...props} />);

    // Verifica se o botão Perfil apareceu (devido ao título)
    const btnPerfil = getByText("Perfil");
    expect(btnPerfil).toBeTruthy();

    fireEvent.press(btnPerfil);

    // Verifica se extraiu "Samuel" corretamente via regex e chamou o router
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(DashBoard)/(tabs)/Perfil",
      params: { identifier: "Samuel", type: "user" },
    });
  });

  it("deve navegar com identificador nulo se o regex não der match na descrição", () => {
    const props = {
      ...defaultProps,
      title: "Solicitação de Entrada",
      description: "Descrição fora do padrão", // Regex não vai pegar nada
      type: "GROUP_JOIN_REQUEST",
    };

    const { getByText } = render(<CardNotificationComp {...props} />);
    fireEvent.press(getByText("Perfil"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(DashBoard)/(tabs)/Perfil",
      params: { identifier: null, type: "user" },
    });
  });

  // --- TESTES DE AÇÕES DE GRUPO (ACEITAR / RECUSAR) ---

  it("deve renderizar botões Aceitar/Recusar quando type é GROUP_JOIN_REQUEST", () => {
    const props = {
      ...defaultProps,
      type: "GROUP_JOIN_REQUEST",
    };
    const { getByText } = render(<CardNotificationComp {...props} />);
    expect(getByText("Aceitar")).toBeTruthy();
    expect(getByText("Recusar")).toBeTruthy();
  });

  it("deve chamar aceitarSolicitacao e onMarkAsRead ao clicar em Aceitar", async () => {
    const props = {
      ...defaultProps,
      type: "GROUP_JOIN_REQUEST",
      inviteId: "invite-abc",
    };
    const { getByText } = render(<CardNotificationComp {...props} />);

    fireEvent.press(getByText("Aceitar"));

    await waitFor(() => {
      expect(aceitarSolicitacao).toHaveBeenCalledWith("invite-abc");
      expect(mockOnMarkAsRead).toHaveBeenCalled();
    });
  });

  it("deve chamar rejeitarSolicitacao e onMarkAsRead ao clicar em Recusar", async () => {
    const props = {
      ...defaultProps,
      type: "GROUP_JOIN_REQUEST",
      inviteId: "invite-xyz",
    };
    const { getByText } = render(<CardNotificationComp {...props} />);

    fireEvent.press(getByText("Recusar"));

    await waitFor(() => {
      expect(rejeitarSolicitacao).toHaveBeenCalledWith("invite-xyz");
      expect(mockOnMarkAsRead).toHaveBeenCalled();
    });
  });

  // --- TESTES DE ESTADOS FINAIS (APROVADO / REJEITADO) ---

  it("deve mostrar botão 'Aceito' quando type é GROUP_JOIN_APPROVED", () => {
    const props = { ...defaultProps, type: "GROUP_JOIN_APPROVED" };
    const { getByText } = render(<CardNotificationComp {...props} />);
    expect(getByText("Aceito")).toBeTruthy();
  });

  it("deve mostrar botão 'Recusado' quando type é GROUP_JOIN_REJECTED", () => {
    const props = { ...defaultProps, type: "GROUP_JOIN_REJECTED" };
    const { getByText } = render(<CardNotificationComp {...props} />);
    expect(getByText("Recusado")).toBeTruthy();
  });
});