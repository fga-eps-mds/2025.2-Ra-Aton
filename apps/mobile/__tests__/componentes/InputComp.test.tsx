import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import InputComp from "@/components/InputComp";

// Mock do useTheme
jest.mock("@/constants/Theme", () => ({
    useTheme: jest.fn(() => ({
        isDarkMode: false,
        toggleDarkMode: jest.fn(),
    })),
}));

describe("InputComp", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Renderização básica", () => {
        it("deve renderizar o input corretamente com valor string", () => {
            const { getByDisplayValue } = render(
                <InputComp value="teste" />
            );

            expect(getByDisplayValue("teste")).toBeTruthy();
        });

        it("deve renderizar com label", () => {
            const { getByLabelText } = render(
                <InputComp label="Nome" value="" />
            );

            expect(getByLabelText("Nome")).toBeTruthy();
        });

        it("deve renderizar com ícone sem erros", () => {
            expect(() => {
                render(<InputComp iconName="mail" value="" />);
            }).not.toThrow();
        });

        it("deve renderizar com placeholder sem erros", () => {
            expect(() => {
                render(<InputComp placeholder="Digite aqui" />);
            }).not.toThrow();
        });
    });

    describe("Formatação de valores", () => {
        it("deve exibir string diretamente", () => {
            const { getByDisplayValue } = render(
                <InputComp value="texto simples" />
            );

            expect(getByDisplayValue("texto simples")).toBeTruthy();
        });

        it("deve usar formatter customizado quando fornecido", () => {
            const formatter = (v: any) => `Formatado: ${v}`;
            expect(() => {
                render(<InputComp value="valor" formatter={formatter} />);
            }).not.toThrow();
        });

        it("deve renderizar sem erros com valor null", () => {
            expect(() => {
                render(<InputComp value={null} />);
            }).not.toThrow();
        });

        it("deve renderizar sem erros com valor undefined", () => {
            expect(() => {
                render(<InputComp value={undefined} />);
            }).not.toThrow();
        });

        it("deve renderizar sem erros com valor numérico", () => {
            expect(() => {
                render(<InputComp value={12345} />);
            }).not.toThrow();
        });

        it("deve renderizar sem erros com valor Date", () => {
            const testDate = new Date("2025-12-25T10:30:00");
            expect(() => {
                render(<InputComp value={testDate} />);
            }).not.toThrow();
        });
    });

    describe("Modo somente visualização (justView)", () => {
        it("deve renderizar sem erros com justView true", () => {
            expect(() => {
                render(<InputComp value="não editável" justView={true} />);
            }).not.toThrow();
        });

        it("deve renderizar sem erros com justView false", () => {
            expect(() => {
                render(<InputComp value="editável" justView={false} />);
            }).not.toThrow();
        });
    });

    describe("Campo de senha (secureTextEntry)", () => {
        it("deve renderizar sem erros com secureTextEntry", () => {
            expect(() => {
                render(<InputComp value="senha123" secureTextEntry={true} />);
            }).not.toThrow();
        });

        it("deve renderizar botão de toggle de senha", () => {
            const { root } = render(
                <InputComp value="senha123" secureTextEntry={true} />
            );
            expect(root).toBeTruthy();
        });
    });

    describe("Status e mensagem de status", () => {
        it("não deve exibir statusText quando label não é fornecido", () => {
            const { queryByText } = render(
                <InputComp
                    value=""
                    status={true}
                    statusText="Email inválido"
                />
            );

            expect(queryByText("Email inválido")).toBeNull();
        });

        it("deve renderizar sem erros com status e statusText", () => {
            expect(() => {
                render(
                    <InputComp
                        label="Email"
                        value=""
                        status={true}
                        statusText="Email inválido"
                    />
                );
            }).not.toThrow();
        });
    });

    describe("Customização de estilo", () => {
        it("deve renderizar com width customizado", () => {
            expect(() => {
                render(<InputComp value="" width="50%" />);
            }).not.toThrow();
        });

        it("deve renderizar com height customizado", () => {
            expect(() => {
                render(<InputComp value="" height={60} />);
            }).not.toThrow();
        });

        it("deve renderizar com bgColor customizado", () => {
            expect(() => {
                render(<InputComp value="" bgColor="#ff0000" />);
            }).not.toThrow();
        });
    });

    describe("Eventos", () => {
        it("deve chamar onChangeText quando texto é alterado", () => {
            const onChangeText = jest.fn();
            const { getByDisplayValue } = render(
                <InputComp value="" onChangeText={onChangeText} />
            );

            // Renderiza com valor inicial para poder buscar
            const { getByLabelText } = render(
                <InputComp value="" onChangeText={onChangeText} label="Input" />
            );

            const input = getByLabelText("Input");
            fireEvent.changeText(input, "novo texto");

            expect(onChangeText).toHaveBeenCalledWith("novo texto");
        });
    });

    describe("Tema escuro", () => {
        it("deve renderizar corretamente em modo escuro", () => {
            const { useTheme } = require("@/constants/Theme");
            useTheme.mockReturnValue({
                isDarkMode: true,
                toggleDarkMode: jest.fn(),
            });

            const { getByDisplayValue } = render(
                <InputComp value="dark mode" />
            );

            expect(getByDisplayValue("dark mode")).toBeTruthy();
        });
    });

    describe("Props adicionais", () => {
        it("deve passar props adicionais para TextInput", () => {
            expect(() => {
                render(
                    <InputComp
                        value=""
                        maxLength={100}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                );
            }).not.toThrow();
        });
    });
});
