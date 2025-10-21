import { render } from "@testing-library/react-native";

import { MonoText } from "../StyledText";

describe("<MonoText />", () => {
  test("renders correctly with given children", () => {
    const { getByText } = render(<MonoText>Test MonoText</MonoText>);
    const monoTextElement = getByText("Test MonoText");
    expect(monoTextElement).toBeTruthy();
  });
});
