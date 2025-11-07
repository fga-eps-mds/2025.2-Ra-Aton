import { mergeStoredUser } from "./formsCadastro.helpes";

describe("mergeStoredUser (lógica pura do cadastro)", () => {
  it("mescla os dados do usuário corretamente", () => {
    const original = {
      userName: "fulano",
      email: "fulano@exemplo.com",
      token: "fulaninho123",
      profileType: "JOGADOR",
    };

    const atualizacao = {
      profileType: "ATLETICA",
    };

    const resultado = mergeStoredUser(original, atualizacao);

    expect(resultado).toEqual({
      userName: "fulano",
      email: "fulano@exemplo.com",
      token: "fulaninho123",
      profileType: "ATLETICA",
    });
  });

  it("retorna null se currentUser é null", () => {
    const resultado = mergeStoredUser(null, { profileType: "TORCEDOR" });
    expect(resultado).toBeNull();
  });
});
