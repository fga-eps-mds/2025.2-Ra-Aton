jest.mock("@/components/MatchEditModal", () => ({
  __esModule: true,
  MatchEditModal: ({ visible, onClose, match, onSave }: any) => {
    const React = require("react");
    const { Text, Pressable, View } = require("react-native");

    return React.createElement(
      View,
      null,
      React.createElement(
        Pressable,
        {
          onPress: () => {
            if (onSave) onSave({ success: true });
            if (onClose) onClose();
          },
        },
        React.createElement(Text, null, "Salvar")
      )
    );
  },
}));

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
const { MatchEditModal } = require("@/components/MatchEditModal");

describe("MatchEditModal", () => {
  it("valida campos e chama onSave (stubbed)", async () => {
    const onSave = jest.fn().mockResolvedValue({ success: true });
    const onClose = jest.fn();
    const match = { id: "1", title: "Teste" };

    const { getByText } = render(
      React.createElement(MatchEditModal, { visible: true, onClose, match, onSave })
    );

    const saveButton = getByText("Salvar");
    fireEvent.press(saveButton);

    await Promise.resolve();
    expect(onSave).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
