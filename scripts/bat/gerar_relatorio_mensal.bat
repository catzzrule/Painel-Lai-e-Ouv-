@echo off
cd /d "C:\Users\tavar\Downloads\Painel Ouv"
python gerar_relatorio_mensal.py > "%temp%\painel_relatorio_update.log" 2>&1
