import React from "react";
import { render, fireEvent } from "../test-utils";
import CommentButtonComp from "../../components/CommentButtonComp";

describe("Componente: CommentButtonComp", () => {
  it("1. Deve chamar onPress ao ser clicado", () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(<CommentButtonComp onPress={mockOnPress} />);
    // Adicione testID="comment-button" ao <TouchableOpacity> em CommentButtonComp.tsx

    fireEvent.press(getByTestId("comment-button"));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
