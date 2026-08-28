import { useEffect, useState } from "react";
import type { DadosPainelOuvidoria } from "@/types/dados";
import { OuvidoriaKpis } from "./ouvidoria-kpis";
import { OuvidoriaCharts } from "./ouvidoria-charts";
import { OuvidoriaAlerts } from "./ouvidoria-alerts";
import { SlaSection } from "./sla-section";
import { DateFilterBar } from "./date-filter-bar";
import { useDateFilterOuvidoria } from "@/lib/use-date-filter";
import { NupTable } from "./nup-table";

import {
  ChevronDown,
} from "lucide-react";
import { updatePeriodBadge } from "@/lib/utils";

interface OuvidoriaDashboardProps {
  onDataLoaded?: (data: DadosPainelOuvidoria) => void;
}

export function OuvidoriaDashboard({ onDataLoaded }: OuvidoriaDashboardProps) {
  const [dados, setDados] = useState<DadosPainelOuvidoria | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + "dados_ouvidoria.json")
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao carregar dados_ouvidoria.json");
        return res.json();
      })
      .then((data: DadosPainelOuvidoria) => {
        setDados(data);
        if (onDataLoaded) {
          onDataLoaded(data);
        }

        updatePeriodBadge(data.mensal?.meses ?? []);

        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [onDataLoaded]);


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm text-muted-foreground">Carregando painel de Ouvidoria...</span>
      </div>
    );
  }

  if (error || !dados) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-destructive">
        <p className="text-lg font-medium">Erro ao carregar dados da Ouvidoria</p>
        <p className="text-sm text-muted-foreground mt-2">
          Execute: <code className="bg-accent px-2 py-1 rounded">python converter_auto_ouvidoria.py</code>
        </p>
      </div>
    );
  }

  return <OuvidoriaDashboardContent dados={dados} />;
}


/** Componente interno que usa os hooks de filtro (precisa de dados já carregados) */
function OuvidoriaDashboardContent({
  dados,
}: {
  dados: DadosPainelOuvidoria;
}) {
  const {
    filteredData,
    dateRange,
    setDateRange,
    selectedYear,
    setSelectedYear,
    availableTags,
    selectedTags,
    toggleTag,
    clearFilters,
    hasActiveFilter,
    getRecordsForExport,
  } = useDateFilterOuvidoria(dados);

  const [showNupsTable, setShowNupsTable] = useState(false);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto animate-fade-in-up">
      {/* Indicadores Principais (KPIs) no topo */}
      <section id="secao-kpis">
        <OuvidoriaKpis kpis={filteredData.kpis} />
      </section>

      {/* Barra de Filtro por Período */}
      <DateFilterBar
        dateRange={dateRange}
        setDateRange={setDateRange}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        availableTags={availableTags}
        selectedTags={selectedTags}
        toggleTag={toggleTag}
        clearFilters={clearFilters}
        hasActiveFilter={hasActiveFilter}
        getRecordsForExport={getRecordsForExport}
        panelName="Ouvidoria"
        accentColor="blue"
      />

      {/* Tabela de NUPs colapsável */}
      <section id="secao-nups" className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <button
          onClick={() => setShowNupsTable(!showNupsTable)}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
        >
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            Registro dos NUPs
          </h2>
          <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform ${showNupsTable ? "rotate-180" : ""}`} />
        </button>
        {showNupsTable && (
          <div className="p-4 border-t border-border">
            <NupTable registros={(filteredData.registros as any) || []} />
          </div>
        )}
      </section>

      {/* Alertas Inteligentes (RECURSO NOVO) */}
      <section id="secao-alertas">
        <OuvidoriaAlerts alertas={filteredData.alertas} />
      </section>

      {/* Evolução Mensal */}
      <section id="secao-mensal">
        <OuvidoriaCharts
          section="mensal"
          title="Evolução Mensal de Manifestações"
          dados={filteredData}
        />
      </section>

      {/* Natureza e Tipos de Manifestação */}
      <section id="secao-natureza">
        <OuvidoriaCharts
          section="natureza"
          title="Natureza e Situação das Manifestações"
          dados={filteredData}
        />
      </section>

      {/* Decisões e Prazos */}
      <section id="secao-situacao">
        <OuvidoriaCharts
          section="situacao"
          title="Decisões e Cumprimento de Prazos"
          dados={filteredData}
        />
      </section>

      {/* Perfil do Cidadão */}
      <section id="secao-perfil">
        <OuvidoriaCharts
          section="perfil"
          title="Perfil do Solicitante / Cidadão"
          dados={filteredData}
        />
      </section>

      {/* SLA e Performance */}
      <section id="secao-sla">
        <SlaSection dados={filteredData as any} />
      </section>



      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground py-6 border-t border-border">
        Painel da Ouvidoria Geral — Ministério do Esporte (MESP) • Fonte: Fala.BR / CGU
      </footer>
    </div>
  );
}

