import "@/test/testMocks";
import { render } from "@testing-library/react-native";
import Button1Comp from "@/components/Button1Comp";

describe("Button1Comp", () => {
  it("deve renderizar o texto passado como children", () => {
    const { getByText } = render(<Button1Comp>Clique em mim</Button1Comp>);
    expect(getByText("Clique em mim")).toBeTruthy();
  });
});

