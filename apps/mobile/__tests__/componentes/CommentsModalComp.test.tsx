import React from "react";
import { render, fireEvent } from "../test-utils";
import CommentsModalComp from "../../components/CommentsModalComp";
import { Icomment } from "@/libs/interfaces/Icomments";

describe("Componente: CommentsModalComp", () => {
  const mockOnClose = jest.fn();

  // Dados simulados para o teste
  const mockComments: Icomment[] = [
    {
      id: "1",
      content: "Que legal!",
      authorId: "user-1",
      postId: "post-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: {
        id: "user-1",
        userName: "Usuário A",
      },
    },
  ];

  it("1. Não deve renderizar nada se isVisible for false", () => {
    const { queryByText } = render(
      <CommentsModalComp isVisible={false} onClose={mockOnClose} postId="1" />,
    );

    expect(queryByText("Comentários")).toBeNull();
  });

  it("2. Deve renderizar o conteúdo se isVisible for true e mostrar os comentários passados", () => {
    const { getByText, getByPlaceholderText } = render(
      <CommentsModalComp 
        isVisible={true} 
        onClose={mockOnClose} 
        postId="1" 
        comments={mockComments} 
      />,
    );

    expect(getByText("Comentários")).toBeTruthy();
    expect(getByPlaceholderText("Escreva um comentário...")).toBeTruthy();

    expect(getByText("Usuário A")).toBeTruthy();
    expect(getByText("Que legal!")).toBeTruthy();
  });

  it("3. Deve permitir digitação no input de comentário", () => {
    const { getByPlaceholderText } = render(
      <CommentsModalComp isVisible={true} onClose={mockOnClose} postId="1" />,
    );

    const input = getByPlaceholderText("Escreva um comentário...");
    fireEvent.changeText(input, "Meu novo comentário");
    expect(input.props.value).toBe("Meu novo comentário");
  });
});