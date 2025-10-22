# 🧪 Como fazer os testes de API?

Este documento é o guia oficial para escrever testes no projeto. O objetivo é garantir a qualidade, estabilidade e manutenibilidade do código, estabelecendo padrões claros para todos os desenvolvedores.

Nossa estratégia de testes é baseada no **Jest** e se divide em três categorias principais:

1.  **Testes Unitários (Lógica Pura):** Testa funções ou classes isoladamente, sem I/O (rede, banco de dados).
2.  **Testes de API (Integração Mockada):** Testa o fluxo completo de uma rota de API (controller, service), mas "mocka" (simula) o banco de dados. Esta é a nossa principal forma de teste.
3.  **Testes E2E (Banco Real):** Testa o fluxo completo contra um banco de dados real. São mais lentos e reservados principalmente para o CI.

## 🛠️ Tecnologias de Teste

* **Framework:** [Jest](https://jestjs.io/)
* **Monorepo:** [Turborepo](https://turbo.build/repo) (para `turbo run test`)
* **Gerenciador:** `pnpm`
* **Testes de API:** [Supertest](https://github.com/ladjs/supertest) (para simular requisições HTTP)
* **Banco de Dados:** [Prisma](https://www.prisma.io/)
* **Mocks:** `jest.mock`

## 🚀 Como Executar os Testes

Todos os comandos devem ser executados a partir da **raiz do monorepo**.

### 1. Executar todos os testes
Roda os testes para todos os pacotes do workspace (definido no `turbo.json`).

```bash
pnpm test
````

### 2\. Executar testes de um pacote específico

Use o filtro `--filter` do `pnpm` (ex: para o backend `api`).

```bash
pnpm --filter api test
```

### 3\. Executar em Modo "Watch"

Muito útil durante o desenvolvimento. Roda os testes automaticamente a cada mudança em um pacote.

```bash
# O '--' extra passa o argumento '--watch' para o Jest
pnpm --filter api test -- --watch
```

-----

## 1\. Escrevendo Testes Unitários (Lógica Pura)

**Objetivo:** Testar uma "unidade" de lógica de negócios (ex: uma função de cálculo, um utilitário) de forma rápida e isolada.

  * **Local:** `src/__tests__/arquivo.test.ts`
  * **Mocks:** Mocke qualquer dependência que não seja a própria lógica.

### Exemplo: Testando um utilitário

Suponha um arquivo `src/utils/calculator.ts`:

```typescript
// src/utils/calculator.ts
export function add(a: number, b: number): number {
  return a + b;
}
```

O teste seria `src/__tests__/calculator.test.ts`:

```typescript
// src/__tests__/calculator.test.ts
import { add } from '../utils/calculator';

describe('Calculator Utils', () => {
  it('deve somar dois números corretamente', () => {
    // 1. Arrange (Arrumar)
    const a = 5;
    const b = 10;
    
    // 2. Act (Agir)
    const result = add(a, b);
    
    // 3. Assert (Verificar)
    expect(result).toBe(15);
  });
});
```

## 2\. Escrevendo Testes de API (Integração Mockada)

**Objetivo:** Testar o fluxo completo de uma rota (Requisição $\rightarrow$ Rota $\rightarrow$ Controller $\rightarrow$ Resposta), mas **mockando o banco de dados (Prisma)** para velocidade e isolamento. Esta é a nossa principal forma de teste para o backend.

### Exemplo: Testando um CRUD de Usuários

Este é o padrão para testar qualquer rota que interaja com o Prisma.

```typescript
// apps/api/src/__tests__/users.test.ts
import request from "supertest";
// Importamos o 'app' real, que usará o 'prisma' mockado
import app from "../app";
// Importamos o 'prisma' para ter uma referência ao mock
import { prisma } from "../prisma";

/**
 * Mocka o módulo do Prisma ANTES de qualquer import.
 * Quando o 'app' (e seus controllers) for importado,
 * ele já receberá este mock do Prisma em vez do real.
 */
jest.mock("../prisma", () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    // Mockamos $connect e $disconnect para não fazerem nada
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
}));

// Criamos uma referência tipada ao mock para facilitar o uso
const prismaMock = prisma as jest.Mocked<typeof prisma>;

describe("API /users", () => {
  // Limpa o estado dos mocks (ex: contadores de chamadas) antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET / - deve responder com o status do serviço", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("service", "api");
  });

  it("POST /users - deve criar um novo usuário e retornar 201", async () => {
    // 1. Arrange (Arrumar)
    const mockUser = {
      id: "mock-uuid-123",
      name: "Test",
      email: "test@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Configura o mock para retornar o usuário criado
    
    // --- IMPORTANTE ---
    // Usamos 'as jest.Mock' para forçar a tipagem do TypeScript,
    // já que a inferência automática pode falhar em objetos complexos.
    (prismaMock.user.create as jest.Mock).mockResolvedValue(mockUser);

    // 2. Act (Agir)
    const res = await request(app)
      .post("/users")
      .send({ name: "Test", email: "test@example.com" });

    // 3. Assert (Verificar)
    expect(res.status).toBe(201);
    // O 'app' (com express.json()) serializa datas para strings ISO
    expect(res.body).toEqual({
      ...mockUser,
      createdAt: mockUser.createdAt.toISOString(),
      updatedAt: mockUser.updatedAt.toISOString(),
    });
    // Verifica se o controller chamou o prisma com os dados corretos
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: { name: "Test", email: "test@example.com" },
    });
  });

  it("GET /users - deve retornar uma lista de usuários", async () => {
    // 1. Arrange
    const mockUsers = [
      { id: "mock-uuid-123", name: "Test 1", email: "test1@example.com" },
    ];
    (prismaMock.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

    // 2. Act
    const res = await request(app).get("/users");

    // 3. Assert
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockUsers);
    expect(prismaMock.user.findMany).toHaveBeenCalledTimes(1);
  });
});
```

## 3\. Escrevendo Testes E2E (com Banco Real)

**Objetivo:** Garantir que o `schema.prisma` está correto e que o código funciona com um banco de dados real.

Esses testes são executados automaticamente no pipeline de **CI (Integração Contínua)**, mas podem ser rodados localmente.

### Configuração Local (para rodar como o CI)

1.  **Inicie um banco de dados:** Garanta que um Postgres está rodando (ex: via Docker).
2.  **Crie um `.env` de teste:** Crie um arquivo em `apps/api/prisma/.env`.
    ```ini
    # apps/api/prisma/.env
    # ATENÇÃO: Use um banco de dados de TESTE, ele será limpo!
    DATABASE_URL="postgresql://postgres:password@localhost:5432/db_test"
    ```
3.  **Aplique as Migrações:** Sincronize seu banco de teste com o schema.
    ```bash
    pnpm --filter api prisma db push
    ```
4.  **Rode os Testes:** Os testes detectarão a `DATABASE_URL` e rodarão contra o banco real.
    ```bash
    pnpm --filter api test
    ```
    *(Nota: Seus testes devem ser escritos para limpar os dados que criam, usando `afterAll` ou `beforeEach` para deletar registros.)*