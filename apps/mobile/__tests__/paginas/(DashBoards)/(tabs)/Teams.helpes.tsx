export interface Group {
  id: string;
  name: string;
  type: "AMATEUR" | "ATHLETIC";
  isAccepting: boolean;
}


export function filterGroupsLogic(
  groups: Group[] | null | undefined,
  selectedType: "AMATEUR" | "ATHLETIC",
  acceptingOnly: boolean
): Group[] {
  if (!groups) {
    return [];
  }

  return groups.filter((group) => {
    const typeMatch = group.type === selectedType;
    const acceptingMatch = acceptingOnly ? group.isAccepting === true : true;

    return typeMatch && acceptingMatch;
  });
}

if (process.env.NODE_ENV === 'test') {
    describe("Teams helpers placeholder", () => {
        it("placeholder para evitar erro de 'no tests found'", () => {
            expect(true).toBe(true);
        });
    });
}