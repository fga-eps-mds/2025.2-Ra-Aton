export interface StoredUser {
  userName: string;
  email: string;
  token: string;
  profileType?: string | null;
}


export function mergeStoredUser(
  currentUser: StoredUser | null,
  newData: Partial<StoredUser>
) {
  if (!currentUser) {
    return null;
  }
  return { ...currentUser, ...newData };
}

describe("formsCadastro helpers", () => {
  it("placeholder para manter suite ativa", () => {
    const x = 1 + 1;
    expect(x).toBe(2);
  });
});
