import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { RegisterForm } from "@/components/RegisterForm";

// MOCK DO INPUTCOMP
// Isso simplifica o teste: ao invés de testar a complexidade do InputComp (que já tem seu próprio teste),
// renderizamos uma versão simplificada que expõe o que precisamos (onChangeText, value, erros).
jest.mock("@/components/InputComp", () => {
  const { View, Text, TextInput } = require("react-native");
  return (props: any) => (
    <View testID="input-container">
      <Text>{props.label}</Text>
      <TextInput
        testID={`input-${props.label}`} // Identificador único baseado no label
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.label}
      />
      {/* Renderiza o erro apenas se status for true */}
      {props.status && <Text testID={`error-${props.label}`}>{props.statusText}</Text>}
    </View>
  );
});

describe("RegisterForm", () => {
  const mockSetFormData = jest.fn();
  
  const initialFormData = {
    name: "",
    email: "",
    userName: "",
    password: "",
    confirmPassword: "",
  };

  const emptyErrors = {
    name: "",
    email: "",
    nickname: "",
    password: "",
    confirmPassword: "",
    backendEmail: "",
    backendNickname: "",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar todos os 5 campos corretamente", () => {
    const { getByTestId } = render(
      <RegisterForm
        formData={initialFormData}
        errors={emptyErrors}
        setFormData={mockSetFormData}
      />
    );

    expect(getByTestId("input-Nome completo")).toBeTruthy();
    expect(getByTestId("input-Nome de usuário")).toBeTruthy();
    expect(getByTestId("input-E-mail")).toBeTruthy();
    expect(getByTestId("input-Senha")).toBeTruthy();
    expect(getByTestId("input-Confirme sua senha")).toBeTruthy();
  });

  it("deve atualizar o estado ao digitar no campo Nome", () => {
    const { getByTestId } = render(
      <RegisterForm formData={initialFormData} errors={emptyErrors} setFormData={mockSetFormData} />
    );

    fireEvent.changeText(getByTestId("input-Nome completo"), "João Silva");

    // Verifica se a função foi chamada
    expect(mockSetFormData).toHaveBeenCalledTimes(1);

    // Pega a função de atualização passada para o setFormData: (prev) => ({...prev, name: text})
    const updateFunction = mockSetFormData.mock.calls[0][0];
    
    // Executa essa função simulando o estado anterior
    const newState = updateFunction(initialFormData);

    // Verifica se o resultado é o esperado
    expect(newState).toEqual({ ...initialFormData, name: "João Silva" });
  });

  it("deve atualizar o estado ao digitar no campo Usuário", () => {
    const { getByTestId } = render(
      <RegisterForm formData={initialFormData} errors={emptyErrors} setFormData={mockSetFormData} />
    );

    fireEvent.changeText(getByTestId("input-Nome de usuário"), "joaosilva");
    
    const updateFunction = mockSetFormData.mock.calls[0][0];
    const newState = updateFunction(initialFormData);
    expect(newState.userName).toBe("joaosilva");
  });

  it("deve atualizar o estado ao digitar no campo E-mail", () => {
    const { getByTestId } = render(
      <RegisterForm formData={initialFormData} errors={emptyErrors} setFormData={mockSetFormData} />
    );

    fireEvent.changeText(getByTestId("input-E-mail"), "joao@email.com");
    
    const updateFunction = mockSetFormData.mock.calls[0][0];
    const newState = updateFunction(initialFormData);
    expect(newState.email).toBe("joao@email.com");
  });

  it("deve atualizar o estado ao digitar nos campos de Senha", () => {
    const { getByTestId } = render(
      <RegisterForm formData={initialFormData} errors={emptyErrors} setFormData={mockSetFormData} />
    );

    // Senha
    fireEvent.changeText(getByTestId("input-Senha"), "123456");
    let updateFn = mockSetFormData.mock.calls[0][0];
    expect(updateFn(initialFormData).password).toBe("123456");

    // Confirmação
    fireEvent.changeText(getByTestId("input-Confirme sua senha"), "123456");
    updateFn = mockSetFormData.mock.calls[1][0];
    expect(updateFn(initialFormData).confirmPassword).toBe("123456");
  });

  it("deve exibir mensagens de erro locais (frontend)", () => {
    const errors = {
      ...emptyErrors,
      name: "Nome é obrigatório",
      password: "Senha muito curta",
    };

    const { getByText, getByTestId } = render(
      <RegisterForm formData={initialFormData} errors={errors} setFormData={mockSetFormData} />
    );

    expect(getByTestId("error-Nome completo")).toBeTruthy();
    expect(getByText("Nome é obrigatório")).toBeTruthy();

    expect(getByTestId("error-Senha")).toBeTruthy();
    expect(getByText("Senha muito curta")).toBeTruthy();
  });

  it("deve priorizar erros de backend se existirem (Lógica OR)", () => {
    // Testa a lógica: errors.nickname || errors.backendNickname
    const errors = {
      ...emptyErrors,
      backendNickname: "Este usuário já existe",
      backendEmail: "Email já cadastrado",
    };

    const { getByText, getByTestId } = render(
      <RegisterForm formData={initialFormData} errors={errors} setFormData={mockSetFormData} />
    );

    expect(getByTestId("error-Nome de usuário")).toBeTruthy();
    expect(getByText("Este usuário já existe")).toBeTruthy();

    expect(getByTestId("error-E-mail")).toBeTruthy();
    expect(getByText("Email já cadastrado")).toBeTruthy();
  });

  it("deve exibir erro local de nickname se backend não existir", () => {
    const errors = {
      ...emptyErrors,
      nickname: "Apelido inválido",
    };

    const { getByText } = render(
      <RegisterForm formData={initialFormData} errors={errors} setFormData={mockSetFormData} />
    );

    expect(getByText("Apelido inválido")).toBeTruthy();
  });
});