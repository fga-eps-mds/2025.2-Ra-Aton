import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CommentsModalComp from "@/components/CommentsModalComp";
import { useTheme } from "@/constants/Theme";
import { Icomment } from "@/libs/interfaces/Icomments";

// 1. MOCKS
jest.mock("@/constants/Theme", () => ({
  useTheme: jest.fn(),
}));

// Mock do PrimaryButton
jest.mock("@/components/PrimaryButton", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return ({ onPress, children, style }: any) => (
    <TouchableOpacity onPress={onPress} style={style} testID="send-button">
      <Text>{children}</Text>
    </TouchableOpacity>
  );
});

// Mock do Spacer
jest.mock("@/components/SpacerComp", () => "SpacerComp");

// MOCK ROBUSTO DE ÍCONES
// Agora renderiza um Text com testID igual ao nome do ícone.
jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  return {
    Ionicons: ({ name, onPress, style }: any) => (
      <Text testID={name} onPress={onPress} style={style}>
        {name}
      </Text>
    ),
  };
});

describe("CommentsModalComp", () => {
  const mockOnClose = jest.fn();
  const mockOnSendComment = jest.fn();
  const mockOnDeleteComment = jest.fn();

  const mockComments: Icomment[] = [
    {
      id: "1",
      content: "Comentário teste 1",
      authorId: "user1",
      createdAt: new Date(),
      author: { userName: "User Um" },
    },
    {
      id: "2",
      content: "Comentário teste 2",
      authorId: "user2",
      createdAt: new Date(),
      author: { userName: "User Dois" },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ isDarkMode: false });
  });

  it("não deve renderizar nada se isVisible for false", () => {
    const { toJSON } = render(
      <CommentsModalComp isVisible={false} onClose={mockOnClose} />
    );
    expect(toJSON()).toBeNull();
  });

  it("deve mostrar mensagem de lista vazia", () => {
    const { getByText } = render(
      <CommentsModalComp isVisible={true} onClose={mockOnClose} comments={[]} />
    );
    expect(getByText("Seja o primeiro a comentar!")).toBeTruthy();
  });

  it("deve renderizar a lista de comentários corretamente", () => {
    const { getByText } = render(
      <CommentsModalComp
        isVisible={true}
        onClose={mockOnClose}
        comments={mockComments}
      />
    );

    expect(getByText("User Um")).toBeTruthy();
    expect(getByText("Comentário teste 1")).toBeTruthy();
  });

  it("deve permitir escrever e enviar um comentário", () => {
    const { getByPlaceholderText, getByTestId } = render(
      <CommentsModalComp
        isVisible={true}
        onClose={mockOnClose}
        onSendComment={mockOnSendComment}
      />
    );

    const input = getByPlaceholderText("Escreva um comentário...");
    fireEvent.changeText(input, "Meu novo comentário");
    fireEvent.press(getByTestId("send-button"));

    expect(mockOnSendComment).toHaveBeenCalledWith("Meu novo comentário");
    expect(input.props.value).toBe("");
  });

  it("deve fechar o modal ao clicar no botão fechar (ícone close)", () => {
    const { getByTestId } = render(
      <CommentsModalComp isVisible={true} onClose={mockOnClose} />
    );

    // Graças ao nosso mock, podemos pegar pelo testID "close"
    fireEvent.press(getByTestId("close"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("deve permitir deletar se for autor (clicando na lixeira)", () => {
    const { getAllByTestId } = render(
      <CommentsModalComp
        isVisible={true}
        onClose={mockOnClose}
        comments={mockComments}
        isAuthor={true}
        onDeleteComment={mockOnDeleteComment}
      />
    );

    // Busca todos os ícones de lixeira
    const trashIcons = getAllByTestId("trash-outline");
    expect(trashIcons.length).toBeGreaterThan(0);

    // Clica no primeiro
    fireEvent.press(trashIcons[0]);
    expect(mockOnDeleteComment).toHaveBeenCalledWith("1"); // ID do primeiro mockComment
  });

  it("NÃO deve mostrar lixeira se não for autor", () => {
    const { queryByTestId } = render(
      <CommentsModalComp
        isVisible={true}
        onClose={mockOnClose}
        comments={mockComments}
        isAuthor={false}
        onDeleteComment={mockOnDeleteComment}
      />
    );

    expect(queryByTestId("trash-outline")).toBeNull();
  });
});