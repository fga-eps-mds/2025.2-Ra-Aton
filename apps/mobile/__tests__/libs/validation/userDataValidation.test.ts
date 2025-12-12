import {
  verifyName,
  verifyEmail,
  verifyNickname,
  verifyPassword,
  verifyConfirmPassword,
} from '../../../libs/validation/userDataValidation';

describe('Libs: Validation - User Data', () => {
  
  // --- Testes de Nome ---
  describe('verifyName', () => {
    it('deve retornar erro se o nome ultrapassar 256 caracteres', () => {
      const longName = 'a'.repeat(257);
      expect(verifyName(longName)).toBe('O Nome não pode ultrapassar 256 caracteres');
    });

    it('deve retornar erro se não houver sobrenome (menos de 2 palavras)', () => {
      expect(verifyName('João')).toBe('Preencha nome e sobrenome');
      expect(verifyName('   João   ')).toBe('Preencha nome e sobrenome'); // Testa trim
    });

    it('deve retornar sucesso (string vazia) para nome válido', () => {
      expect(verifyName('João Silva')).toBe('');
      expect(verifyName('Maria de Souza')).toBe('');
    });
  });

  // --- Testes de Email ---
  describe('verifyEmail', () => {
    it('deve retornar erro se o email ultrapassar 256 caracteres', () => {
      const longEmail = 'a'.repeat(250) + '@test.com';
      expect(verifyEmail(longEmail)).toBe('O email não pode ultrapassar 256 caracteres');
    });

    it('deve retornar erro para formato de email inválido', () => {
      expect(verifyEmail('emailinvalido')).toBe('Insira um email válido');
      expect(verifyEmail('teste@')).toBe('Insira um email válido');
      expect(verifyEmail('teste@dominio')).toBe('Insira um email válido');
    });

    it('deve retornar sucesso (string vazia) para email válido', () => {
      expect(verifyEmail('teste@exemplo.com')).toBe('');
    });
  });

  // --- Testes de Nickname ---
  describe('verifyNickname', () => {
    it('deve retornar erro se tiver espaços', () => {
      expect(verifyNickname('user name')).toBe('Seu nome de usuário não pode ter espaços');
    });

    it('deve retornar erro se ultrapassar 45 caracteres', () => {
      const longNick = 'a'.repeat(46);
      expect(verifyNickname(longNick)).toBe('Seu nome de usuário não pode ultrapassar 45 caracteres');
    });

    it('deve retornar erro se for menor que 4 caracteres', () => {
      expect(verifyNickname('abc')).toBe('Seu nome de usuário deve ter pelo menos 4 caracteres');
    });

    it('deve retornar sucesso (string vazia) para nickname válido', () => {
      expect(verifyNickname('gamer123')).toBe('');
    });
  });

  // --- Testes de Senha ---
  describe('verifyPassword', () => {
    it('deve retornar erro se ultrapassar 50 caracteres', () => {
      const longPass = 'a'.repeat(51);
      expect(verifyPassword(longPass)).toBe('A senha não pode ultrapassar 50 caracteres');
    });

    it('deve retornar erro se for menor que 12 caracteres', () => {
      expect(verifyPassword('Ab1')).toBe('Sua senha deve possuir no mínimo 12 caracteres');
    });

    it('deve retornar erro se não contiver letras e números (regex)', () => {
      expect(verifyPassword('0123456789876543210')).toBe('A senha deve ter caracteres maiúsculos, minúsculos, números e símbolos'); // Só números
      expect(verifyPassword('abcdefghijklmnopqrst')).toBe('A senha deve ter caracteres maiúsculos, minúsculos, números e símbolos'); // Só letras
    });

    it('deve retornar sucesso (string vazia) para senha válida', () => {
      expect(verifyPassword('SenhaForte123_321')).toBe('');
    });
  });

  // --- Testes de Confirmar Senha ---
  describe('verifyConfirmPassword', () => {
    it('deve retornar erro se a confirmação ultrapassar 50 caracteres', () => {
      const pass = 'Senha123';
      const longConf = 'a'.repeat(51);
      expect(verifyConfirmPassword(pass, longConf)).toBe('A senha não pode ultrapassar 50 caracteres');
    });

    it('deve retornar erro se as senhas não coincidirem', () => {
      expect(verifyConfirmPassword('Senha123', 'Senha456')).toBe('As senhas não coincidem');
    });

    it('deve retornar sucesso (string vazia) se as senhas coincidirem', () => {
      expect(verifyConfirmPassword('Senha123', 'Senha123')).toBe('');
    });
  });
});