@echo off
:: ===========================================================
:: Atualizar Painel Ouvidoria - Agendador de Tarefas
:: Usa caminho absoluto do Python para evitar erro "arquivo nao encontrado"
:: ===========================================================

SET PYTHON="C:\Users\tavar\AppData\Local\Programs\Python\Python36\python.exe"
SET PASTA="C:\Users\tavar\Downloads\Painel Ouv"
SET LOG=%temp%\painel_ouvidoria_update.log

:: Muda para a pasta do projeto
cd /d %PASTA%

:: Registra hora de inicio no log
echo [%DATE% %TIME%] === Iniciando atualizacao Ouvidoria === > %LOG%

:: Verifica se o Python existe
if not exist %PYTHON% (
    echo [ERRO] Python nao encontrado em %PYTHON% >> %LOG%
    exit /b 1
)

:: Executa o conversor principal
echo [%DATE% %TIME%] Executando converter_auto_ouvidoria.py... >> %LOG%
%PYTHON% converter_auto_ouvidoria.py >> %LOG% 2>&1
if errorlevel 1 (
    echo [%DATE% %TIME%] FALHA no converter_auto_ouvidoria.py >> %LOG%
    exit /b 1
)

:: Executa o gerador de relatorio mensal
echo [%DATE% %TIME%] Executando gerar_relatorio_mensal.py... >> %LOG%
%PYTHON% gerar_relatorio_mensal.py >> %LOG% 2>&1

echo [%DATE% %TIME%] === Atualizacao concluida com sucesso === >> %LOG%
exit /b 0
