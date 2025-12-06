# 🌐 Configuração de IP Local para Desenvolvimento

## 🎯 Por que isso é necessário?

Quando você testa o app em um **celular físico**, ele precisa se conectar ao backend que está rodando no seu computador. Para isso, você precisa usar o **IP local** da sua máquina ao invés de `localhost`.

## ⚡ Configuração Rápida (Automática)

Execute este comando **uma vez** quando começar a desenvolver:

**Linux/Mac:**
```bash
cd apps/mobile
pnpm setup-ip
```

**Windows:**
```cmd
cd apps/mobile
pnpm setup-ip:windows
# OU execute diretamente:
# scripts\setup-local-ip.bat
```

Isso vai:
1. ✅ Detectar automaticamente o IP da sua máquina
2. ✅ Criar o arquivo `.env.local` com a configuração correta
3. ✅ Mostrar instruções de uso

## 🔧 Configuração Manual

Se preferir configurar manualmente:

### 1. Descubra seu IP:

**Linux/Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# ou
ip addr show | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```cmd
ipconfig | findstr IPv4
```

Exemplo de resultado: `192.168.1.100`

### 2. Crie o arquivo `.env.local`:

**Linux/Mac:**
```bash
cd apps/mobile
cp .env.example .env.local
```

**Windows CMD:**
```cmd
cd apps\mobile
copy .env.example .env.local
```

**Windows PowerShell:**
```powershell
cd apps\mobile
Copy-Item .env.example .env.local
```

### 3. Edite `.env.local`:

```env
EXPO_PUBLIC_API_URL=http://SEU_IP_AQUI:4000
EXPO_PUBLIC_ENV=development
```

Exemplo real:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:4000
EXPO_PUBLIC_ENV=development
```

## 📱 Como Testar no Celular

### 1. Certifique-se de que o backend está rodando:

**Na raiz do monorepo:**
```bash
# Terminal 1 - Backend
cd apps/api
pnpm dev
```

O backend deve estar acessível em `http://SEU_IP:4000`

**Testar se está acessível:**
```bash
# No seu computador
curl http://localhost:4000
# ou abra no navegador: http://localhost:4000
```

### 2. Inicie o Expo:

**Terminal 2 - Mobile:**
```bash
cd apps/mobile

# Se for a primeira vez, instale as dependências:
pnpm install

# Inicie o Expo:
pnpm dev
```

### 3. Escaneie o QR Code:

- **Android**: Use o app **Expo Go** e escaneie o QR code
- **iOS**: Abra a câmera e escaneie o QR code

### 4. Verifique os logs:

Quando o app abrir, você deve ver no terminal:
```
📝 Configurações do App:
  - API URL: http://192.168.1.100:4000
  - Ambiente: development
  - Versão: 1.0.0
```

Se ver `localhost`, o `.env.local` não foi carregado corretamente.

## ⚠️ Checklist de Problemas

Se o app não conectar com o backend:

- [ ] **Mesma rede WiFi**: Celular e computador devem estar na mesma rede
- [ ] **Backend rodando**: Verifique se a API está acessível em `http://SEU_IP:4000`
- [ ] **Firewall desabilitado**: Desative temporariamente ou libere a porta 4000
- [ ] **IP correto**: Verifique se o IP no `.env.local` está atualizado
- [ ] **Restart do Expo**: Feche e reabra o Expo após mudar o `.env.local`

### Testar se a API está acessível:

No navegador do seu celular, acesse:
```
http://SEU_IP:4000
```

Você deve ver uma resposta da API (ou erro 404, que está OK).

## 🔄 Quando Atualizar o IP?

Você precisa atualizar o `.env.local` quando:

- ✅ Mudar de rede WiFi (casa → trabalho → universidade)
- ✅ O IP do seu computador mudar (DHCP)
- ✅ Trocar de computador

**Comando rápido para atualizar:**

**Linux/Mac:**
```bash
cd apps/mobile
pnpm setup-ip
```

**Windows:**
```cmd
cd apps\mobile
pnpm setup-ip:windows
```

## 👥 Para Outros Desenvolvedores do Grupo

Cada desenvolvedor deve:

1. **Clonar o repositório**
   ```bash
   git clone https://github.com/fga-eps-mds/2025.2-Ra-Aton.git
   cd 2025.2-Ra-Aton
   ```

2. **Instalar dependências** (na raiz do monorepo)
   ```bash
   pnpm install
   ```

3. **Configurar IP local**
   ```bash
   cd apps/mobile
   
   # Linux/Mac:
   pnpm setup-ip
   
   # Windows:
   pnpm setup-ip:windows
   ```

4. **Verificar configuração**
   ```bash
   # Linux/Mac/Git Bash:
   cat .env.local
   
   # Windows CMD:
   type .env.local
   
   # Windows PowerShell:
   Get-Content .env.local
   ```
   
   Deve mostrar: `EXPO_PUBLIC_API_URL=http://SEU_IP:4000`

5. **NÃO commitar** o arquivo `.env.local` (já está no `.gitignore`)

### 🪟 Notas para Desenvolvedores Windows

- O script `.bat` funciona em **CMD** e **PowerShell**
- Se estiver usando **Git Bash no Windows**, use `pnpm setup-ip` (script .sh)
- O script detecta automaticamente o IP do adaptador de rede principal
- Se tiver múltiplos adaptadores (WiFi + Ethernet), o script escolhe o primeiro IPv4 válido

## 📋 Diferenças entre Ambientes

| Ambiente | Onde Roda | URL da API | Como Testar |
|----------|-----------|------------|-------------|
| **Emulador Android** | Computador | `http://10.0.2.2:4000` | Android Studio |
| **Simulador iOS** | Computador | `http://localhost:4000` | Xcode |
| **Expo Go (Celular)** | Celular físico | `http://SEU_IP:4000` | Escanear QR |
| **Development Build** | Celular físico | `http://SEU_IP:4000` | Instalar APK |
| **Produção** | Celular físico | `https://api.raaton.com` | App Store/Play Store |

## 🛠️ Comandos Úteis

```bash
# Configurar IP automaticamente (Linux/Mac)
pnpm setup-ip

# Configurar IP automaticamente (Windows)
pnpm setup-ip:windows

# Ver o conteúdo do .env.local
cat .env.local        # Linux/Mac/Git Bash
type .env.local       # Windows CMD
Get-Content .env.local # Windows PowerShell

# Iniciar desenvolvimento
pnpm dev

# Limpar cache e reiniciar
pnpm dev --clear
```

## 🔒 Segurança

- ✅ `.env.local` está no `.gitignore` - cada dev tem o seu
- ✅ `.env.example` está commitado - template para o time
- ✅ Variáveis públicas usam prefixo `EXPO_PUBLIC_*`
- ⚠️ Nunca coloque tokens/senhas em variáveis `EXPO_PUBLIC_*`

## 📚 Documentação Adicional

- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [React Native Networking](https://reactnative.dev/docs/network)
