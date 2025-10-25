import "../test/testMocks";
import React from "react";
import { render,screen } from "@testing-library/react-native";
import Button1Comp from "../components/Button1Comp";
import InputComp from "@/components/InputComp";

describe("Button1Comp", () => {
  it("deve renderizar o texto passado como children", () => {
    const { getByText } = render(<Button1Comp>Clique em mim</Button1Comp>);
    expect(getByText("Clique em mim")).toBeTruthy();
  });
});

describe("Testando renderização do inputComp", () => {
    describe("InputComp", () => {
        it("deve renderizar o input de preenchimento do campo de usuário", () => {
            const inputNome = screen.getByLabelText('Nome de usuário');
            expect(inputNome).toBeTruthy();
        });
    });
    describe("InputComp", () => {
        it("deve renderizar o input de preenchimento de apelido", () => {
            const inputNome = screen.getByLabelText('Apelido');
            expect(inputNome).toBeTruthy();
        });
    }) 
    describe("deve renderizar o input de preenchimento de e-mail", () => {
        it("deve renderizar o texto passado", () => {
            const inputNome = screen.getByLabelText('E-mail');
            expect(inputNome).toBeTruthy();
        });
    })
    describe("deve renderizar o input de preenchimento de senha", () => {
        it("deve renderizar o texto passado", () => {
            const inputNome = screen.getByLabelText('Senha');
            expect(inputNome).toBeTruthy();
        });
    })
    describe("deve renderizar o input de confirmação de senha", () => {
        it("deve renderizar o texto passado", () => {
            const inputNome = screen.getByLabelText('Confirme sua senha');
            expect(inputNome).toBeTruthy();
        });
    })
})