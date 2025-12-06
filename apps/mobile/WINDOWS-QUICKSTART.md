# 🪟 Guia Rápido - Desenvolvedores Windows

## ⚡ Setup Inicial

**IMPORTANTE:** Execute estes comandos na raiz do monorepo primeiro!

```cmd
REM 1. Clonar repositório (se ainda não fez)
git clone https://github.com/fga-eps-mds/2025.2-Ra-Aton.git
cd 2025.2-Ra-Aton

REM 2. Instalar dependências do monorepo
pnpm install

REM 3. Configurar IP do mobile
cd apps\mobile
pnpm setup-ip:windows

REM 4. Verificar configuração
type .env.local
```

## 📱 Testar no Celular

**Importante:** Você precisa de 2 terminais abertos!

**Terminal 1 - Backend (na raiz do monorepo):**
```cmd
cd apps\api
pnpm dev
```

**Terminal 2 - Mobile:**
```cmd
cd apps\mobile
pnpm dev
```

**No celular:**
1. Instale o app **Expo Go** (Play Store)
2. Escaneie o QR code que apareceu no Terminal 2
3. Aguarde o app carregar

⚠️ Seu celular e PC devem estar na **mesma rede WiFi**!

## 🔧 Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `pnpm setup-ip:windows` | Detecta e configura IP automaticamente |
| `pnpm dev` | Inicia desenvolvimento |
| `pnpm dev --clear` | Limpa cache e inicia |
| `pnpm test` | Roda testes |
| `pnpm lint` | Verifica código |
| `type .env.local` | Ver configuração atual |

## ❓ Problemas Comuns

### "Não consegue conectar com a API"

1. Verifique se a API está rodando:
   ```cmd
   cd ..\api
   pnpm dev
   ```

2. Teste se a API está acessível no navegador:
   ```
   http://SEU_IP:4000
   ```

3. Verifique o firewall do Windows:
   - Windows Defender Firewall → Configurações avançadas
   - Regras de Entrada → Nova Regra
   - Porta → TCP → 4000 → Permitir conexão

### "IP errado no .env.local"

Execute novamente:
```cmd
pnpm setup-ip:windows
```

### "Usando Git Bash no Windows"

Use o script Linux:
```bash
pnpm setup-ip
```

## 📚 Documentação Completa

Ver [`CONFIG-IP-LOCAL.md`](./CONFIG-IP-LOCAL.md) para detalhes completos.
