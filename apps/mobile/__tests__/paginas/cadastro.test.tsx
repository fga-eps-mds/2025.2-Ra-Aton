const verifyName = (name: string) => {
  const verifyName = name.trim().split(" ").length >= 2;
  if (!verifyName) return "Preencha nome e sobrenome";
  else return "";
};
const verifyEmail = (email: string) => {
  const validEmail = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

  if (validEmail.test(email) == false) {
    return "Insira um email válido";
  } else {
    return "";
  }
};
const verifyNickname = (userName: string) => {
  if (userName.length < 4) return "Digite um apelido válido";
  else return "";
};

const verifyPassword = (password: string) => {
  const validPassword = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
  if (password.length < 8) {
    return "Sua senha deve possuir no mínimo 8 caracteres";
  }
  if (validPassword.test(password) == false) {
    return "Sua senha deve conter letras e números";
  } else {
    return "";
  }
};

const verifyConfirmPassword = (password: string, confirmPassword: string) => {
  if (password != confirmPassword) {
    return "As senhas não coincidem";
  } else {
    return "";
  }
};

describe("Testes Unitário para cada função de validaçõa do cadastro ", () => {
  describe("Valida email", () => {
    it("Deve retornar uma mensagem de erro para email no formato inválido", () => {
      const err = verifyEmail("fulanoEnviouErrado");
      expect(err).toBe("Insira um email válido");
    });

    it("Deve retornar vazio, representando que o EMAIL está no formato correto", () => {
      const accept = verifyEmail("fulanoNaoErrou@teste.com");
      expect(accept).toBe("");
    });
  });

  describe("Valida nome", () => {
    it("Deve retornar uma mensagem de erro pedindo nome e sobrenome", () => {
      const err = verifyName("Fulano");
      expect(err).toBe("Preencha nome e sobrenome");
    });

    it("Deve retornar vazio, representando que o NOME está no formato correto", () => {
      const accept = verifyName("Nome Sobrenome");
      expect(accept).toBe("");
    });
  });

  describe("Valida apelido", () => {
    it("Deve retornar uma mensagem de erro pedindo um apelido maior que 3 letras", () => {
      const err = verifyNickname("ful");
      expect(err).toBe("Digite um apelido válido");
    });

    it("Deve retornar vazio, representando que o NOME está no formato correto", () => {
      const accept = verifyNickname("gabro");
      expect(accept).toBe("");
    });
  });

  describe("Valida senha", () => {
    it("Deve retornar uma mensagem de erro pedindo uma senha com o MÍNIMO de caracteres", () => {
      const err = verifyPassword("senha12");
      expect(err).toBe("Sua senha deve possuir no mínimo 8 caracteres");
    });

    it("Deve retornar uma mensagem de erro para uma senha SEM NÚMEROS", () => {
      const err = verifyPassword("exemplinho");
      expect(err).toBe("Sua senha deve conter letras e números");
    });

    it("Deve retornar uma mensagem de erro para uma senha SEM LETRAS", () => {
      const err = verifyPassword("12345678");
      expect(err).toBe("Sua senha deve conter letras e números");
    });
    it("Deve retornar vazio, representando que é uma senha válida", () => {
      const err = verifyPassword("exemplinho123");
      expect(err).toBe("");
    });
  });

  describe("Valida confirmação de senha", () => {
    it("Deve retornar uma mensagem quando as senhas não são iguais", () => {
      const err = verifyConfirmPassword("exemplinho123", "ondeCrioSenha12");
      expect(err).toBe("As senhas não coincidem");
    });

    it("Deve retornar vazio, representando que as senahs são iguai", () => {
      const accept = verifyConfirmPassword("exemplinho123", "exemplinho123");
      expect(accept).toBe("");
    });
  });
});
