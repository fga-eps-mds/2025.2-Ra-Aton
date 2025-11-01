import "../test_mocks/testMocks";
import { render, screen } from "@testing-library/react-native";
import InputComp from "@/components/InputComp";

describe("Testando renderização do inputComp", () => {
  it("deve renderizar o input de preenchimento do campo de usuário", () => {
    render(<InputComp label="Nome de usuário"></InputComp>);

    const inputNome = screen.getByLabelText("Nome de usuário");
    expect(inputNome).toBeTruthy();
  });

  it("deve renderizar o input de preenchimento de apelido", () => {
    render(<InputComp label="Apelido"></InputComp>);

    const inputApelido = screen.getByLabelText("Apelido");
    expect(inputApelido).toBeTruthy();
  });
  it("deve renderizar o texto passado", () => {
    render(<InputComp label="E-mail"></InputComp>);

    const inputEmail = screen.getByLabelText("E-mail");
    expect(inputEmail).toBeTruthy();
  });
  it("deve renderizar o texto passado", () => {
    render(<InputComp label="Senha"></InputComp>);
    const inputSenha = screen.getByLabelText("Senha");
    expect(inputSenha).toBeTruthy();
  });

  it("deve renderizar o texto passado", () => {
    render(<InputComp label="Confirme sua senha"></InputComp>);
    const inputConfirmaSenha = screen.getByLabelText("Confirme sua senha");
    expect(inputConfirmaSenha).toBeTruthy();
  });
});
