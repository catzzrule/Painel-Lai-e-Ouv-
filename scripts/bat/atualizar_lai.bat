@echo off
cd /d "C:\Users\tavar\Downloads\Painel Ouv"
python converter_auto_lai.py > "%temp%\painel_lai_update.log" 2>&1
