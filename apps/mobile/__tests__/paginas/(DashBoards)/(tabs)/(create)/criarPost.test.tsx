import { preparePostPayload, PostFormData } from "@/__tests__/paginas/(DashBoards)/(tabs)/(create)/criarPost.helpes";
describe("preparePostPayload (Lógica de Publicação)", () => {

  it("deve criar um payload válido extraindo hashtags do conteúdo", () => {
    const input: PostFormData = {
      titulo: "Meu Dia",
      conteudo: "Hoje foi um dia incrível aprendendo #React e #ReactNative com testes.",
    };

    const resultado = preparePostPayload(input);

    expect(resultado).toEqual(expect.objectContaining({
      title: "Meu Dia",
      body: "Hoje foi um dia incrível aprendendo #React e #ReactNative com testes.",
      tags: ["#React", "#ReactNative"], // Verifica a extração automática
      status: "PUBLISHED"
    }));
    // Verifica se criou a data
    expect(resultado?.createdAt).toBeInstanceOf(Date);
  });

  it("deve gerar um título automático baseado no conteúdo se o título for vazio", () => {
    const textLong = "Este é um texto muito longo para testar se o título será cortado corretamente no limite estabelecido.";

    const input: PostFormData = {
      titulo: "", // Título vazio
      conteudo: textLong,
    };

    const resultado = preparePostPayload(input);

    // Espera que o título sejam os primeiros 30 chars + "..."
    expect(resultado?.title).toContain("Este é um texto muito longo pa...");
  });

  it("deve retornar null se o conteúdo for muito curto (menos de 10 caracteres)", () => {
    const input: PostFormData = {
      titulo: "Teste",
      conteudo: "Oi", // Muito curto
    };

    const resultado = preparePostPayload(input);
    expect(resultado).toBeNull();
  });

  it("deve retornar um array de tags vazio se não houver hashtags no texto", () => {
    const input: PostFormData = {
      titulo: "Simples",
      conteudo: "Um texto simples sem nenhuma marcação especial.",
    };

    const resultado = preparePostPayload(input);
    expect(resultado?.tags).toEqual([]);
  });

  it("retorna null se o input for nulo", () => {
    expect(preparePostPayload(null)).toBeNull();
  });
});