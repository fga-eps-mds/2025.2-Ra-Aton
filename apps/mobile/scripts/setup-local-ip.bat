@echo off
REM Script para ajudar desenvolvedores Windows a configurar o IP local

echo.
echo Descobrindo o IP da sua maquina...
echo.

REM Detecta o IP usando PowerShell
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4" ^| findstr /v "127.0.0.1"') do (
    set IP=%%a
    goto :found
)

:found
REM Remove espacos em branco
set IP=%IP: =%

if "%IP%"=="" (
    echo Erro: Nao foi possivel detectar o IP automaticamente.
    echo.
    echo Descubra manualmente:
    echo   ipconfig
    echo.
    echo Procure por "IPv4 Address" que nao seja 127.0.0.1
    pause
    exit /b 1
)

echo IP detectado: %IP%
echo.
echo Configurando .env.local...

REM Cria o arquivo .env.local
(
echo # Configuracao Local do Desenvolvedor
echo # Gerado automaticamente em %date% %time%
echo.
echo # API URL - Usando o IP da sua maquina
echo EXPO_PUBLIC_API_URL=http://%IP%:4000
echo.
echo # Ambiente
echo EXPO_PUBLIC_ENV=development
) > .env.local

echo.
echo Arquivo .env.local criado com sucesso!
echo.
echo Configuracao para testar no celular:
echo    API URL: http://%IP%:4000
echo.
echo IMPORTANTE:
echo    1. Certifique-se de que o backend esta rodando na porta 4000
echo    2. Seu celular e computador devem estar na MESMA rede WiFi
echo    3. Desative qualquer firewall que possa bloquear a porta 4000
echo.
echo Pronto! Agora voce pode rodar:
echo    pnpm dev
echo    (e escanear o QR code com seu celular)
echo.
pause
