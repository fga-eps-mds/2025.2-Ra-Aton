jest.mock("@/constants/Theme", () => ({ useTheme: () => ({ isDarkMode: false }) }));
jest.mock("@/constants/Colors", () => ({
  Colors: {
    light: { background: "#fff", input: "#fff", orange: "#fa0", text: "#000" },
    dark: { background: "#000", input: "#000", orange: "#fa0", text: "#fff" },
    warning: "#ff0",
    input: { iconColor: "#000" },
  },
}));
jest.mock("@/constants/Fonts", () => ({ Fonts: { mainFont: { dongleRegular: "System" } } }));

const { render, fireEvent } = require("@testing-library/react-native");
const InputDateComp = require("@/components/InputDateComp").default;

describe("InputDateComp", () => {
  it("exibe valor e placeholder corretamente", () => {
    const onPress = jest.fn();
    const { getByText } = render(<InputDateComp value={null} onPress={onPress} />);
    expect(getByText("Selecionar data")).toBeTruthy();
  });

  it("chama onPress ao clicar", () => {
    const onPress = jest.fn();
    const { getByText } = render(<InputDateComp value="01/01/2025" onPress={onPress} />);
    fireEvent.press(getByText("01/01/2025"));
    expect(onPress).toHaveBeenCalled();
  });
});
