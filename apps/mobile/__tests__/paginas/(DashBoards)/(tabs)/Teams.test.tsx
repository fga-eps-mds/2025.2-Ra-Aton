import { filterGroupsLogic, Group } from "@/__tests__/paginas/(DashBoards)/(tabs)/Teams.helpes"; // Ajuste o caminho

describe("filterGroupsLogic (Filtros da tela de Times)", () => {
  
  const mockGroups: Group[] = [
    { id: "1", name: "Time Amador 1", type: "AMATEUR", isAccepting: true },
    { id: "2", name: "Time Amador 2 (Fechado)", type: "AMATEUR", isAccepting: false },
    { id: "3", name: "Atlética A", type: "ATHLETIC", isAccepting: true },
    { id: "4", name: "Atlética B (Fechada)", type: "ATHLETIC", isAccepting: false },
  ];

  it("deve filtrar apenas times AMADORES", () => {
    const resultado = filterGroupsLogic(mockGroups, "AMATEUR", false);

    expect(resultado).toHaveLength(2);
    expect(resultado.every(g => g.type === "AMATEUR")).toBe(true);
  });

  it("deve filtrar apenas ATLÉTICAS", () => {
    const resultado = filterGroupsLogic(mockGroups, "ATHLETIC", false);

    expect(resultado).toHaveLength(2);
    expect(resultado.every(g => g.type === "ATHLETIC")).toBe(true);
  });

  it("deve filtrar times AMADORES que estão ACEITANDO membros", () => {
    const resultado = filterGroupsLogic(mockGroups, "AMATEUR", true);

    expect(resultado).toHaveLength(1);
    expect(resultado[0].name).toBe("Time Amador 1");
  });

  it("deve filtrar ATLÉTICAS que estão ACEITANDO membros", () => {
    const resultado = filterGroupsLogic(mockGroups, "ATHLETIC", true);

    expect(resultado).toHaveLength(1);
    expect(resultado[0].name).toBe("Atlética A");
  });

  it("deve retornar array vazio se nenhum grupo corresponder aos critérios", () => {
    const emptyMock: Group[] = [];
    const resultado = filterGroupsLogic(emptyMock, "AMATEUR", true);

    expect(resultado).toEqual([]);
  });

  it("deve lidar com input nulo ou indefinido sem quebrar", () => {
    expect(filterGroupsLogic(null, "AMATEUR", false)).toEqual([]);
    expect(filterGroupsLogic(undefined, "ATHLETIC", true)).toEqual([]);
  });
});