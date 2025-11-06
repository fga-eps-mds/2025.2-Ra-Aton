import React from "react";
import { render, fireEvent } from "../test-utils";
import OptionsButtonComp from "../../components/OptionsButtonComp";

describe("Componente: OptionsButtonComp", () => {
  it("1. Deve chamar onPress ao ser clicado", () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(<OptionsButtonComp onPress={mockOnPress} />);
    // Adicione testID="options-button" ao <TouchableOpacity> em OptionsButtonComp.tsx

    fireEvent.press(getByTestId("options-button"));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
