import { prepareEventPayload, EventoFormData } from "@/__tests__/paginas/(DashBoards)/(tabs)/(create)/criarEvento.helpes";

describe("prepareEventPayload (Lógica de criação de evento)", () => {

  it("deve preparar o payload do evento corretamente com dados válidos", () => {
    const inputData: EventoFormData = {
      titulo: " Campeonato de Futsal ", // Com espaços para testar o trim()
      descricao: "Evento beneficente",
      data: "2024-10-15",
      local: "Ginásio Central",
    };

    const resultado = prepareEventPayload(inputData);

    expect(resultado).toEqual({
      titulo: "Campeonato de Futsal",
      descricao: "Evento beneficente",
      dataISO: new Date("2024-10-15"), // Verifica se converteu para Date
      local: "Ginásio Central",
      ativo: true, // Verifica se adicionou o campo padrão
    });
  });

  it("deve adicionar uma descrição padrão se o campo estiver vazio", () => {
    const inputData: EventoFormData = {
      titulo: "Treino Aberto",
      descricao: "", // Vazio
      data: "2024-11-20",
      local: "Quadra 2",
    };

    const resultado = prepareEventPayload(inputData);

    expect(resultado?.descricao).toBe("Sem descrição");
  });

  it("retorna null se os dados do formulário (formData) forem null", () => {
    const resultado = prepareEventPayload(null);
    expect(resultado).toBeNull();
  });

  it("retorna null se o título do evento for obrigatório e estiver ausente", () => {
    const inputData = {
      titulo: "", // Título vazio
      descricao: "Teste",
      data: "2024-10-10",
      local: "Casa",
    };

    const resultado = prepareEventPayload(inputData);
    expect(resultado).toBeNull();
  });

  it("retorna null se a data for obrigatória e estiver ausente", () => {
    const inputData = {
      titulo: "Festa",
      descricao: "Teste",
      data: "", // Data vazia
      local: "Casa",
    };

    const resultado = prepareEventPayload(inputData);
    expect(resultado).toBeNull();
  });
});