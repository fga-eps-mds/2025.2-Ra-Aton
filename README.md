# Aton 

# Dependências necessárias
- pnpm 
- node 18+
- banco de dados Postgres rodando (local ou via Docker)

# rodar localmente
1. clonar o repo
```bash
git clone git@github.com:fga-eps-mds/2025.2-Ra-Aton.git
```
2. entrar na pasta do projeto
```bash
cd 2025.2-Ra-Aton
```
3. instalar dependências
```bash
pnpm install
```
4. configurar o banco de dados
- criar um banco de dados Postgres (local ou via Docker)
se o tiver o docker instalado, pode rodar o comando abaixo na raiz do projeto para criar um container com o Postgres:
```bash
docker-compose up -d
```

- criar um arquivo `.env` na pasta `apps/api` com a variável `DATABASE_URL` apontando para o banco de dados criado
ex: `DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco`

5. rodar o projeto
```bash
pnpm dev:api # gera o client do prisma e roda só o backend (apps/api)
# depois, para rodar o backend e o frontend juntos:
pnpm run dev # roda o backend (apps/api) e o frontend (apps/mobile) em paralelo
# ou
pnpm dev:mobile # roda só o frontend (apps/mobile)
```

6. acessar:

    http://localhost:4000 (API rodando com nodemon + ts-node-dev)
    ou
    http://localhost:8081 (frontend rodando com Expo)

# rodar testes
```bash
pnpm test:api # roda os testes do backend (apps/api)
pnpm test:mobile # roda os testes do frontend (apps/mobile)
pnpm test # roda os testes do backend e do frontend
```

