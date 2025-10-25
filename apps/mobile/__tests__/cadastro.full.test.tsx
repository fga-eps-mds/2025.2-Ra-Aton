import "../test/testMocks";
jest.mock("../assets/img/Logo_1_Atom.png", () => "LOGO");
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";

describe("Cadastro page - integração e unidade", () => {
  it("renderiza todos os elementos principais", () => {
    const Cadastro = require("../app/(Auth)/cadastro").default;
    const { getByTestId, getByText } = render(React.createElement(Cadastro));
    expect(getByTestId("Nome de Usuário")).toBeTruthy();
    expect(getByTestId("Apelido")).toBeTruthy();
    expect(getByTestId("E-mail")).toBeTruthy();
    expect(getByTestId("Senha")).toBeTruthy();
    expect(getByTestId("Confirme sua senha")).toBeTruthy();
    expect(getByText(/Criar conta/)).toBeTruthy();
    expect(getByText("Login")).toBeTruthy();
  });

  it("botão de cadastro inicia desabilitado", () => {
    const Cadastro = require("../app/(Auth)/cadastro").default;
    const { getByTestId } = render(React.createElement(Cadastro));
    const btn = getByTestId("btn-create");
    expect(btn.props.children.props.children).toContain("(disabled)");
  });

  it("habilita o botão após preencher email, senha e confirmação", async () => {
    const Cadastro = require("../app/(Auth)/cadastro").default;
    const { getByTestId } = render(React.createElement(Cadastro));
    const inputEmail = getByTestId("E-mail");
    const inputSenha = getByTestId("Senha");
    const inputConf = getByTestId("Confirme sua senha");
    fireEvent.changeText(inputEmail, "user@test.com");
    fireEvent.changeText(inputSenha, "exemplo123");
    fireEvent.changeText(inputConf, "exemplo123");
    await waitFor(() => {
      const btn = getByTestId("btn-create");
      expect(btn.props.children.props.children).not.toContain("(disabled)");
    });
  });

  it("submete os dados corretamente e navega ao sucesso", async () => {
    const pushMock = jest.fn();
    jest.doMock("expo-router", () => ({
      useRouter: () => ({ push: pushMock }),
    }));
    const fetchMock = jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({}) });
    (global as any).fetch = fetchMock;
    const Cadastro = require("../app/(Auth)/cadastro").default;
    const { getByTestId } = render(React.createElement(Cadastro));
    fireEvent.changeText(getByTestId("Nome de Usuário"), "Nome Sobrenome");
    fireEvent.changeText(getByTestId("Apelido"), "apelido123");
    fireEvent.changeText(getByTestId("E-mail"), "user@test.com");
    fireEvent.changeText(getByTestId("Senha"), "exemplo123");
    fireEvent.changeText(getByTestId("Confirme sua senha"), "exemplo123");
    await waitFor(() => {
      const btn = getByTestId("btn-create");
      fireEvent.press(btn);
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4000/users/",
      expect.any(Object),
    );
    fetchMock.mockRestore();
  });
});
