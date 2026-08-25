# Painel de Ouvidoria e LAI — MESP

Dashboard interativo para visualização e análise de dados de manifestações de Ouvidoria e pedidos LAI do Ministério do Esporte.

## Estrutura do Projeto

```
Painel Ouv/
├── src/                        # Código-fonte React
│   ├── components/             # Componentes da interface
│   ├── lib/                    # Utilitários e hooks
│   ├── types/                  # Tipos TypeScript
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/                     # Arquivos estáticos (GeoJSON, dados JSON)
├── scripts/                    # Scripts auxiliares
│   ├── python/                 # Conversores de dados
│   │   ├── converter_auto_lai.py
│   │   ├── converter_auto_ouvidoria.py
│   │   ├── converter_auto.py
│   │   ├── converter.py
│   │   └── gerar_relatorio_mensal.py
│   └── bat/                    # Atalhos de execução (Windows)
│       ├── atualizar_lai.bat
│       ├── atualizar_ouvidoria.bat
│       ├── atualizar_painel.bat
│       └── gerar_relatorio_mensal.bat
└── data/                       # Arquivos de dados exportados
```

## Como usar

### Instalar dependências
```bash
npm install
```

### Iniciar em desenvolvimento
```bash
npm run dev
```

### Atualizar dados LAI
```bat
scripts\bat\atualizar_lai.bat
```

### Atualizar dados Ouvidoria
```bat
scripts\bat\atualizar_ouvidoria.bat
```

### Gerar relatório mensal
```bat
scripts\bat\gerar_relatorio_mensal.bat
```
