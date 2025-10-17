# 🚀 Guia de Contribuição - Aton

Olá, dev\! 👋

Ficamos muito felizes com seu interesse em contribuir com o projeto **Aton**. Este guia foi criado para que sua contribuição seja uma experiência tranquila e produtiva, garantindo a organização e a qualidade do nosso código.

Seguir estas diretrizes nos ajuda a manter o projeto saudável e fácil de manter.

## 📖 Antes de Começar

- **Tenha uma Issue:** Todo o trabalho deve começar a partir de uma `Issue`. Antes de codificar, certifique-se de que existe uma issue descrevendo a `feature` ou o `bug` e que **ela foi atribuída a você**. Isso evita trabalho duplicado.
- **Ambiente Configurado:** Garanta que você já tem o projeto clonado e rodando localmente na sua máquina.

## 💻 Passo a Passo da Contribuição

Aqui está o fluxo de trabalho que usamos, do início ao fim. Siga estes passos com atenção\!

### Passo 1: Sincronize com a Branch `develop`

Antes de criar sua branch, garanta que você está com a versão mais atualizada da `develop`, que é a nossa branch principal de desenvolvimento.

```bash
# 1. Vá para a branch develop
git checkout develop

# 2. Puxe as últimas atualizações do repositório remoto
git pull origin develop
```

### Passo 2: Crie sua Branch de Trabalho

Nunca trabalhe diretamente na `develop`. Crie uma nova branch a partir dela, seguindo nosso padrão de nomenclatura.

**Padrão de Nomenclatura:** `tipo/numero-da-issue-descricao-curta`

- **tipo:** O mesmo tipo do seu primeiro commit (`feat`, `fix`, `docs`, etc.).
- **numero-da-issue:** O número da issue que você está resolvendo.
- **descricao-curta:** Duas ou três palavras que resumem a issue.

**Exemplos:**

- `feat/42-tela-de-login`
- `fix/55-bug-no-botao-sair`
- `docs/12-atualizar-readme`

**Comando para criar sua branch:**

```bash
# Troque o nome abaixo pelo da sua branch
git checkout -b feat/42-tela-de-login
```

### Passo 3: Implemente, Teste e Commite

Agora é a hora de codificar\! 👨‍💻

- **Implemente a Funcionalidade:** Escreva o código necessário para resolver a issue.
- **Crie Testes Unitários:** Toda nova funcionalidade ou correção **deve** ser acompanhada de testes unitários que validem seu comportamento.
- **Teste Localmente:** Antes de commitar, rode a aplicação e os testes para garantir que tudo está funcionando como esperado e que você não quebrou nada.

Quando estiver pronto para salvar seu progresso, use commits que sigam o nosso padrão.

```bash
# 1. Adicione os arquivos que você modificou
git add .

# 2. Crie o commit seguindo o padrão (veja a seção abaixo)
git commit -m "feat(login): adicionar autenticação com e-mail e senha

issue associada: #42

Co-authored-by: Rodrigo <rodrigo@exemplo.com>
Co-authored-by: Giovana <giovana@exemplo.com>
"
```

### Passo 4: Abra um Pull Request (PR)

Quando sua implementação estiver completa e testada, é hora de enviá-la para o repositório.

```bash
# 1. Envie sua branch para o repositório remoto
# Troque "feat/42-tela-de-login" pelo nome da sua branch
git push origin feat/42-tela-de-login
```

2.  Acesse o [nosso repositório no GitHub](https://github.com/FGA0138-MDS-Ajax/2025.2-Ra). Você verá um aviso amarelo com o nome da sua branch e um botão **"Compare & pull request"**. Clique nele.
3.  **Preencha o PR:**
    - O título do PR já virá com o seu último commit, o que é ótimo\!
    - Na descrição, **link a issue que você está resolvendo**. Escreva `Closes #42` (troque `42` pelo número da sua issue). Isso fará com que o GitHub feche a issue automaticamente quando o PR for mergeado.
4.  Clique em **"Create pull request"**.

### Passo 5: Aguarde a Revisão (Code Review)

- **CI/CD em Ação:** Assim que você abrir o PR, nosso sistema de Integração Contínua (CI) irá rodar os testes automaticamente. Seu PR **precisa passar em todas as verificações** (ficar com o "check" verde ✅).
- **Revisão:** Um ou mais membros da equipe irão revisar seu código. Eles podem solicitar alterações. Fique atento aos comentários e faça os ajustes necessários.
- **Merge:** Após a aprovação e com todos os checks passando, sua branch será **mergeada na `develop`** por um dos mantenedores do projeto.

Parabéns, sua contribuição foi concluída\! 🎉

---

## ✍️ Padrão de Commits

Usamos um padrão para manter nosso histórico de commits limpo e legível. A estrutura é:

```bash
<tipo>(<escopo>): <assunto>


issue associada: #<numero-da-issue>

Co-authored-by: Nome do Primeiro Coautor <primeiro@exemplo.com>
Co-authored-by: Nome do Segundo Coautor <segundo@exemplo.com>
```

> **Use sempre aos Co-authors**, eles ajudam a identificar quem fez o commit. Atente-se à nomenclatura: `Co-authored-by: Nome do Coautor <email@exemplo.com>` sem isso não funciona.

- **Referência completa:** [Padrões de Commits do iuricode](https://github.com/iuricode/padroes-de-commits)

- **Co-authors:** [Github docs](https://docs.github.com/pt/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/creating-a-commit-with-multiple-authors)

#### **Tipos mais comuns:**

- `feat`: Uma nova funcionalidade (feature).
- `fix`: Uma correção de bug.
- `docs`: Alterações na documentação.
- `style`: Formatação, ponto e vírgula, etc. (sem alteração de lógica).
- `refactor`: Refatoração de código que não corrige um bug nem adiciona uma feature.
- `test`: Adição ou correção de testes.
- `chore`: Atualização de tarefas de build, pacotes, etc.

#### **Exemplos de bons commits:**

```bash
feat(auth): implementar fluxo de login com e-mail e senha

fix(feed): corrigir crash ao carregar evento sem imagem

docs(contributing): adicionar guia de contribuição

refactor(user): mover lógica de validação para um serviço separado

test(auth): adicionar testes unitários para o serviço de autenticação
```

---

## 🔀 Resolvendo Conflitos em Branches

Durante o desenvolvimento, é comum que ocorram **divergências entre o branch local e o remoto**.  
Para manter a consistência do histórico e evitar problemas, siga as recomendações abaixo.

### 1. Antes de fazer `git pull`

Sempre confira o histórico para entender a divergência:

```bash
git fetch origin
git log --oneline --graph --decorate --all
```

### 2. Estratégias permitidas no projeto

- **Rebase (`git pull --rebase`)**

  - Usar em _branches de feature_.
  - Mantém o histórico **linear** e facilita a leitura.
  - Exemplo:

    ```bash
    git pull --rebase origin <nome-do-branch>
    ```

- **Merge (`git pull --no-rebase`)**

  - Usar em _branches principais_ (`main` ou `dev`).
  - Preserva o histórico completo sem reescrever commits já compartilhados.
  - Exemplo:

    ```bash
    git pull origin <nome-do-branch>
    ```

- **Fast-forward only (`git pull --ff-only`)**

  - Usar como medida de segurança em branches protegidos.
  - Não cria merge commits automáticos.
  - Exemplo:

    ```bash
    git pull --ff-only origin <nome-do-branch>
    ```

### 3. Resolvendo conflitos

Se durante o `pull` houver conflito:

1. O Git marcará os arquivos em conflito com `<<<<<<<`, `=======`, `>>>>>>>`.
2. Edite manualmente os arquivos para escolher a versão correta.
3. Após resolver, marque o conflito como resolvido:

   ```bash
   git add <arquivo-resolvido>
   ```

4. Continue o processo:

   - Se estiver em rebase:

     ```bash
     git rebase --continue
     ```

   - Se estiver em merge:

   ```bash
    git commit
   ```

### 4. Boas práticas

- **Nunca faça `rebase` em commits já publicados** em `main` ou `dev`.
- **Sempre comunique ao time** se precisar resolver conflitos grandes.
- **Evite commits grandes e misturados** — quanto menores, mais fáceis de resolver.
- **Documente o que foi resolvido no commit** para facilitar auditoria no futuro.

---

## 🙋‍♂️ Dúvidas?

Qualquer dúvida, não hesite em perguntar no nosso canal de comunicação\!

**Obrigado por construir o Aton com a gente\!**
