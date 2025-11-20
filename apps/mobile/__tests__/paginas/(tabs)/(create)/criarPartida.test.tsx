import { prepareMatchPayload, PartidaFormData } from "/home/dom/2025.2-Ra-Aton/apps/mobile/__tests__/paginas/(tabs)/(create)/criarPartida.helpes";

describe("prepareMatchPayload (Lógica de criação de Partida)", () => {

  it("deve gerar o payload correto com status 'AGENDADA' para uma nova partida", () => {
    const input: PartidaFormData = {
      titulo: "Time A vs Time B",
      descricao: "Final do campeonato",
      data: "2024-12-10T14:00:00",
      local: "Quadra Poliesportiva",
    };

    const resultado = prepareMatchPayload(input);

    expect(resultado).toEqual({
      nomePartida: "Time A vs Time B",
      detalhes: "Final do campeonato",
      dataHorario: new Date("2024-12-10T14:00:00"),
      localPartida: "Quadra Poliesportiva",
      status: "AGENDADA",
      tipo: "PARTIDA",
    });
  });

  it("deve definir 'Local a definir' automaticamente se o local estiver vazio", () => {
    // Regra específica para partidas: às vezes cria-se o jogo antes de reservar a quadra
    const input: PartidaFormData = {
      titulo: "Amistoso de Domingo",
      descricao: "",
      data: "2024-12-12",
      local: "",
    };

    const resultado = prepareMatchPayload(input);

    expect(resultado?.localPartida).toBe("Local a definir");
  });

  it("deve preencher a descrição com 'Partida amistosa' se estiver vazia", () => {
    const input: PartidaFormData = {
      titulo: "Jogo Rápido",
      descricao: "", // Vazio
      data: "2024-12-12",
      local: "Rua 1",
    };

    const resultado = prepareMatchPayload(input);

    expect(resultado?.detalhes).toBe("Partida amistosa");
  });

  it("retorna null se o título (nome dos times) estiver ausente", () => {
    const input = {
      titulo: "",
      descricao: "Jogo",
      data: "2024-12-12",
      local: "Rua 1",
    };

    const resultado = prepareMatchPayload(input);
    expect(resultado).toBeNull();
  });

  it("retorna null se o objeto de formulário for inexistente", () => {
    expect(prepareMatchPayload(null)).toBeNull();
  });
});