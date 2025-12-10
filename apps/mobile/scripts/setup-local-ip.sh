#!/bin/bash
# Script para ajudar desenvolvedores a configurar o IP local

echo "🔍 Descobrindo o IP da sua máquina..."
echo ""

if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    # Linux ou macOS
    if command -v ip &> /dev/null; then
        # Usando ip (Linux moderno)
        IP=$(ip addr show | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | cut -d/ -f1 | head -n1)
    else
        # Usando ifconfig (macOS ou Linux antigo)
        IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n1)
    fi
else
    # Windows (WSL ou Git Bash)
    IP=$(ipconfig.exe | grep "IPv4" | head -n1 | awk '{print $NF}' | tr -d '\r')
fi

if [ -z "$IP" ]; then
    echo "❌ Não foi possível detectar o IP automaticamente."
    echo ""
    echo "Descubra manualmente:"
    echo "  - Linux/Mac: ifconfig | grep 'inet '"
    echo "  - Windows: ipconfig"
    exit 1
fi

echo "✅ IP detectado: $IP"
echo ""
echo "📝 Configurando .env.local..."

# Cria ou atualiza o .env.local
cat > .env.local << EOF
# Configuração Local do Desenvolvedor
# Gerado automaticamente em $(date)

# API URL - Usando o IP da sua máquina
EXPO_PUBLIC_API_URL=http://$IP:4000

# Ambiente
EXPO_PUBLIC_ENV=development
EOF

echo "✅ Arquivo .env.local criado com sucesso!"
echo ""
echo "📱 Configuração para testar no celular:"
echo "   API URL: http://$IP:4000"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   1. Certifique-se de que o backend está rodando na porta 4000"
echo "   2. Seu celular e computador devem estar na MESMA rede WiFi"
echo "   3. Desative qualquer firewall que possa bloquear a porta 4000"
echo ""
echo "🚀 Pronto! Agora você pode rodar:"
echo "   pnpm dev"
echo "   (e escanear o QR code com seu celular)"
