export const verifyName = (name: string) => {
  if (name.length > 256) return "O Nome não pode ultrapassar 256 caracteres";

  const verifyName = name.trim().split(" ").length >= 2;
  if (!verifyName) return "Preencha nome e sobrenome";
  else return "";
};

export const verifyEmail = (email: string) => {
  if (email.length > 256) return "O email não pode ultrapassar 256 caracteres";

  const validEmail = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  if (validEmail.test(email) == false) {
    return "Insira um email válido";
  }
  return "";
};

export const verifyNickname = (userName: string) => {
  if (userName.includes(" ")) {
    return "Seu nome de usuário não pode ter espaços";
  }

  if (userName.length > 45)
    return "Seu nome de usuário não pode ultrapassar 45 caracteres";

  if (userName.length < 4)
    return "Seu nome de usuário deve ter pelo menos 4 caracteres";
  return "";
};

export const verifyPassword = (password: string) => {
  if (password.length > 50) return "A senha não pode ultrapassar 50 caracteres";

  const validPassword = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
  if (password.length < 8) {
    return "Sua senha deve possuir no mínimo 8 caracteres";
  }
  if (validPassword.test(password) == false) {
    return "Sua senha deve conter letras e números";
  }
  return "";
};

export const verifyConfirmPassword = (
  password: string,
  confirmPassword: string,
) => {
  if (confirmPassword.length > 50)
    return "A senha não pode ultrapassar 50 caracteres";

  if (password != confirmPassword) {
    return "As senhas não coincidem";
  }
  return "";
};
