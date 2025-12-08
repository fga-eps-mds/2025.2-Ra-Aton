jest.mock("@/constants/Colors", () => ({
  Colors: {
    cardGames: { backgroundCard: "#000", header: "#111" },
    input: { iconColor: "#fff" },
  },
}));
jest.mock("@/constants/Fonts", () => ({ Fonts: { mainFont: { dongleRegular: "System" } } }));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: (props: any) => {
    const React = require("react");
    const { Text } = require("react-native");
    return React.createElement(Text, { testID: `ionicon-${props.name}` }, props.name);
  },
}));

jest.mock("@/assets/img/vs-icon.svg", () => (props: any) => {
  const React = require("react");
  const { Text } = require("react-native");
  return React.createElement(Text, { testID: "vs-icon" }, "VS");
});

jest.mock("@/components/SpacerComp", () => (props: any) => {
  const React = require("react");
  const { View } = require("react-native");
  return React.createElement(View, { testID: "spacer" });
});

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { EditMatchesCard } from "@/components/EditMatchesCardComp";

describe("EditMatchesCard", () => {
  it("renders title, teams and calls onPressJoinMatch when Jogadores pressed", () => {
    const match = {
      id: "1",
      title: "Partida Teste",
      teamNameA: "Time A",
      teamAScore: 2,
      teamNameB: "Time B",
      teamBScore: 1,
    } as any;

    const onPressJoinMatch = jest.fn();
    const onPressInfos = jest.fn();
    const onPressDelete = jest.fn();

    const { getByText, getByTestId } = render(
      <EditMatchesCard
        match={match}
        onPressJoinMatch={onPressJoinMatch}
        onPressInfos={onPressInfos}
        onPressDelete={onPressDelete}
      />
    );

    expect(getByText("Partida Teste")).toBeTruthy();
    expect(getByText("Time A")).toBeTruthy();
    expect(getByText("2")).toBeTruthy();
    expect(getByText("Time B")).toBeTruthy();
    expect(getByText("1")).toBeTruthy();

    expect(getByTestId("vs-icon")).toBeTruthy();

    const btn = getByText("Jogadores");
    fireEvent.press(btn);
    expect(onPressJoinMatch).toHaveBeenCalled();
  });
});
