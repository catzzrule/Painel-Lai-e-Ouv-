import { useEffect, useState } from "react";
import type { DadosLai } from "@/types/dados";
import { KpiCards } from "./kpi-cards";
import { ChartCards } from "./chart-cards";
import { SlaSection } from "./sla-section";
import { DateFilterBar } from "./date-filter-bar";
import { useDateFilterLai } from "@/lib/use-date-filter";
import { LaiTable } from "./lai-table";
import { ChevronDown } from "lucide-react";

interface LaiDashboardProps {
  onDataLoaded?: (data: DadosLai) => void;
}

export function LaiDashboard({ onDataLoaded }: LaiDashboardProps) {
  const [dados, setDados] = useState<DadosLai | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Tenta carregar dados_lai.json primeiro, com fallback para dados.json
    fetch("/dados_lai.json")
      .then((res) => {
        if (res.ok) return res.json();
        return fetch("/dados.json").then((r) => {
          if (!r.ok) throw new Error("Falha ao carregar dados_lai.json");
          return r.json();
        });
      })
      .then((data: DadosLai) => {
        setDados(data);
        if (onDataLoaded) {
          onDataLoaded(data);
        }

        // Update header badges if elements exist
        const meses = data.mensal.meses;
        if (meses.length > 0) {
          const fmt = (m: string) => {
            const nomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
            const [ano, mes] = m.split("-");
            return nomes[parseInt(mes, 10) - 1] + "/" + ano.slice(2);
          };
          const badge = document.getElementById("badge-periodo");
          if (badge) badge.textContent = `${fmt(meses[0])} — ${fmt(meses[meses.length - 1])}`;
        }

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
        <span className="text-sm text-muted-foreground">Carregando painel LAI...</span>
      </div>
    );
  }

  if (error || !dados) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-destructive">
        <p className="text-lg font-medium">Erro ao carregar dados do Painel LAI</p>
        <p className="text-sm text-muted-foreground mt-2">
          Execute: <code className="bg-accent px-2 py-1 rounded">python converter_auto_lai.py</code>
        </p>
      </div>
    );
  }

  return <LaiDashboardContent dados={dados} />;
}

/** Componente interno que usa o hook de filtro (precisa de dados já carregados) */
function LaiDashboardContent({ dados }: { dados: DadosLai }) {
    const {
      filteredData,
      dateRange,
      setDateRange,
    clearFilters,
    hasActiveFilter,
    getRecordsForExport,
  } = useDateFilterLai(dados);

  const [showLaiTable, setShowLaiTable] = useState(false);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto animate-fade-in-up">
      {/* KPIs no topo */}
      <section id="secao-kpis">
        <KpiCards kpis={filteredData.kpis} />
      </section>

      {/* Barra de Filtro por Período */}
      <DateFilterBar
        dateRange={dateRange}
        setDateRange={setDateRange}
        clearFilters={clearFilters}
        hasActiveFilter={hasActiveFilter}
        getRecordsForExport={getRecordsForExport}
        panelName="LAI"
        accentColor="blue"
      />

      {/* Tabela de Protocolos LAI colapsável */}
      <section id="secao-nups" className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <button
          onClick={() => setShowLaiTable(!showLaiTable)}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
        >
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            Registro de Protocolos LAI
          </h2>
          <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform ${showLaiTable ? "rotate-180" : ""}`} />
        </button>
        {showLaiTable && (
          <div className="p-4 border-t border-border">
            <LaiTable registros={(filteredData.registros as any) || []} />
          </div>
        )}
      </section>

      {/* Evolução Mensal */}
      <section id="secao-mensal">
        <ChartCards
          section="mensal"
          title="Evolução Mensal de Pedidos"
          dados={filteredData}
        />
      </section>

      {/* Situação e Decisões */}
      <section id="secao-situacao">
        <ChartCards
          section="situacao"
          title="Situação dos Pedidos e Decisões"
          dados={filteredData}
        />
      </section>

      {/* Formulários e Recursos */}
      <section id="secao-formulario">
        <ChartCards
          section="formulario"
          title="Tipos de Formulário e Recursos"
          dados={filteredData}
        />
      </section>

      {/* Perfil do Solicitante */}
      <section id="secao-perfil">
        <ChartCards
          section="perfil"
          title="Perfil do Solicitante"
          dados={filteredData}
        />
      </section>

      {/* SLA */}
      <section id="secao-sla">
        <SlaSection dados={filteredData} />
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground py-6 border-t border-border">
        Painel LAI — Ministério do Esporte (MESP) • Fonte: Fala.BR / CGU
      </footer>
    </div>
  );
}

// Exportação legado para manter compatibilidade
export const Dashboard = LaiDashboard;

