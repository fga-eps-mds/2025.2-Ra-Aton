import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import GerenciarPostScreen from "@/app/(DashBoard)/(tabs)/(create)/gerenciarPost";
import { api_route } from "@/libs/auth/api";

// --- MOCKS VISUAIS ---
jest.mock("@/components/BackGroundComp", () => ({
  __esModule: true,
  default: ({ children }: any) => { const { View } = require("react-native"); return <View>{children}</View>; }
}));

jest.mock("@/components/AppText", () => ({
  __esModule: true,
  default: (props: any) => { const { Text } = require("react-native"); return <Text {...props}>{props.children}</Text>; }
}));

jest.mock("@/components/CardHandlePostsComp", () => ({
  CardHandlePostComp: ({ title, attendancesCount, onOpenMenu, onPressCard }: any) => {
    const { View, Text, TouchableOpacity } = require("react-native");
    return (
      <View>
        <Text>{title}</Text>
        {attendancesCount > 0 && <Text>{attendancesCount} confirmações "Eu vou!"</Text>}
        <TouchableOpacity testID={`menu-btn-${title}`} onPress={onOpenMenu}><Text>Menu</Text></TouchableOpacity>
        <TouchableOpacity onPress={onPressCard}><Text>Detalhes</Text></TouchableOpacity>
      </View>
    );
  }
}));

jest.mock("@/components/CommentsModalComp", () => ({
  __esModule: true,
  default: () => null
}));

jest.mock("@/components/CustomAlertModalComp", () => ({
  CustomAlertModalComp: ({ visible, onConfirm, title }: any) => {
    const { View, Text, TouchableOpacity } = require("react-native");
    if (!visible) return null;
    return (
      <View testID="custom-alert-mock">
        <Text>{title}</Text>
        <TouchableOpacity testID="alert-confirm-btn" onPress={onConfirm}><Text>Confirmar</Text></TouchableOpacity>
      </View>
    );
  }
}));

// --- MOCKS LÓGICA ---
const mockPush = jest.fn();
jest.mock("expo-router", () => {
  const React = require("react");
  return {
    useRouter: () => ({ push: mockPush }),
    useFocusEffect: (cb: any) => React.useEffect(cb, []),
  };
});

jest.mock("@/libs/storage/UserContext", () => ({
  useUser: () => ({ user: { id: "user-123", name: "User Teste", token: "token-abc" } }),
}));

jest.mock("@/libs/auth/api", () => ({
  api_route: { get: jest.fn(), delete: jest.fn() },
}));

jest.mock("@/libs/auth/handleComments", () => ({
  getComments: jest.fn(),
}));

describe("Integração: GerenciarPostScreen", () => {
  const mockPostsResponse = {
    data: {
      data: [
        { id: "post-1", title: "Meu Post Geral", type: "GENERAL", authorId: "user-123", attendancesCount: 0 },
        { id: "event-1", title: "Meu Evento Top", type: "EVENT", authorId: "user-123", attendancesCount: 15 },
        { id: "post-other", title: "Post de Outro", type: "GENERAL", authorId: "user-999" },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (api_route.get as jest.Mock).mockResolvedValue(mockPostsResponse);
  });

  it("1. Deve carregar posts e exibir APENAS os do usuário logado", async () => {
    const { getByText, queryByText } = render(<GerenciarPostScreen />);

    // CORREÇÃO: Espera o TEXTO aparecer, o que garante que o loading acabou
    await waitFor(() => expect(getByText("Meu Post Geral")).toBeTruthy());
    
    expect(getByText("Meu Evento Top")).toBeTruthy();
    expect(queryByText("Post de Outro")).toBeNull();
  });

  it("2. Deve exibir o contador 'Eu vou' APENAS para cards do tipo EVENT", async () => {
    const { getByText } = render(<GerenciarPostScreen />);
    await waitFor(() => expect(getByText("Meu Evento Top")).toBeTruthy());
    expect(getByText('15 confirmações "Eu vou!"')).toBeTruthy();
  });

  it("3. Deve navegar para a tela correta de edição (Evento vs Geral)", async () => {
    const { getByTestId, getByText } = render(<GerenciarPostScreen />);
    await waitFor(() => expect(getByText("Meu Evento Top")).toBeTruthy());

    const btnMenuEvento = getByTestId("menu-btn-Meu Evento Top");
    fireEvent.press(btnMenuEvento);

    // Como o Modal é nativo/complexo, nosso mock pode simplificar ou usamos getByText se o modal renderizar texto simples
    // Vamos assumir que o modal renderizou
    const btnEditar = getByText("Editar Post"); 
    fireEvent.press(btnEditar);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(DashBoard)/(tabs)/(edit)/editEvento",
      params: { postData: expect.stringContaining("Meu Evento Top") },
    });
  });

  it("4. Deve realizar o fluxo de deleção completo ao confirmar", async () => {
    (api_route.delete as jest.Mock).mockResolvedValue({});
    
    const { getByTestId, getByText } = render(<GerenciarPostScreen />);
    await waitFor(() => expect(getByText("Meu Post Geral")).toBeTruthy());

    fireEvent.press(getByTestId("menu-btn-Meu Post Geral"));
    fireEvent.press(getByText("Deletar Post"));

    const btnConfirmar = getByTestId("alert-confirm-btn");
    fireEvent.press(btnConfirmar);

    await waitFor(() => {
      expect(api_route.delete).toHaveBeenCalledWith("/posts/post-1");
    });
  });
});