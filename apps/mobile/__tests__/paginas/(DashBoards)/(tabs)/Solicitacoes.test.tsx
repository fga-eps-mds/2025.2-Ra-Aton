import {
  organizarSolicitacoes,
  Solicitacao
} from "@/__tests__/paginas/(DashBoards)/(tabs)/Solicitacoes.helpes";

describe("organizarSolicitacoes (Lógica de Filtro de Convites)", () => {

  const mockSolicitacoes: Solicitacao[] = [
    { id: "1", madeBy: "USER", status: "PENDING", group: { name: "Grupo A" } },
    { id: "2", madeBy: "USER", status: "APPROVED", group: { name: "Grupo B" } },
    { id: "3", madeBy: "USER", status: "REJECTED", group: { name: "Grupo C" } },
    { id: "4", madeBy: "GROUP", status: "PENDING", group: { name: "Grupo D" } },
    { id: "5", madeBy: "GROUP", status: "APPROVED", group: { name: "Grupo E" } },
  ];

  it("deve separar corretamente as solicitações enviadas pendentes", () => {
    const resultado = organizarSolicitacoes(mockSolicitacoes);

    expect(resultado.enviadasPendentes).toHaveLength(1);
    expect(resultado.enviadasPendentes[0].id).toBe("1");
  });

  it("deve agrupar APPROVED e REJECTED na lista de enviadas respondidas", () => {
    const resultado = organizarSolicitacoes(mockSolicitacoes);

    expect(resultado.enviadasRespondidas).toHaveLength(2);
    expect(resultado.enviadasRespondidas.map(s => s.id)).toEqual(expect.arrayContaining(["2", "3"]));
  });

  it("deve separar corretamente as solicitações recebidas pendentes", () => {
    const resultado = organizarSolicitacoes(mockSolicitacoes);

    expect(resultado.recebidasPendentes).toHaveLength(1);
    expect(resultado.recebidasPendentes[0].group.name).toBe("Grupo D");
  });

  it("deve garantir que solicitações 'Enviadas' não apareçam nas listas de 'Recebidas'", () => {
    const resultado = organizarSolicitacoes(mockSolicitacoes);

    const temItemErrado = resultado.recebidasPendentes.some(s => s.madeBy === "USER");
    expect(temItemErrado).toBe(false);
  });

  it("retorna arrays vazios se a lista de entrada for nula ou indefinida", () => {
    const resultadoNull = organizarSolicitacoes(null);
    const resultadoUndefined = organizarSolicitacoes(undefined);

    expect(resultadoNull.enviadasPendentes).toEqual([]);
    expect(resultadoUndefined.recebidasRespondidas).toEqual([]);
  });

  it("retorna arrays vazios se a lista de entrada estiver vazia", () => {
    const resultado = organizarSolicitacoes([]);

    expect(resultado).toEqual({
      enviadasPendentes: [],
      enviadasRespondidas: [],
      recebidasPendentes: [],
      recebidasRespondidas: [],
    });
  });
});