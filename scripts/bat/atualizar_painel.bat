@echo off
cd /d "C:\Users\tavar\Downloads\Painel Ouv"
python converter_auto.py > "%temp%\painel_ouvidoria_update.log" 2>&1
