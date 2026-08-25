import { useEffect, useState } from "react";
import type { DadosOuvidoria } from "@/types/dados";
import { KpiCards } from "./kpi-cards";
import { ChartCards } from "./chart-cards";
import { SlaSection } from "./sla-section";

export function Dashboard() {
  const [dados, setDados] = useState<DadosOuvidoria | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/dados.json")
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao carregar dados.json");
        return res.json();
      })
      .then((data: DadosOuvidoria) => {
        setDados(data);

        // Update header badges
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
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !dados) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-destructive">
        <p className="text-lg font-medium">Erro ao carregar dados</p>
        <p className="text-sm text-muted-foreground mt-2">
          Execute: <code className="bg-accent px-2 py-1 rounded">python converter.py</code>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* KPIs */}
      <section id="secao-kpis">
        <KpiCards kpis={dados.kpis} />
      </section>

      {/* Evolução Mensal */}
      <section id="secao-mensal">
        <ChartCards
          section="mensal"
          title="Evolução Mensal"
          dados={dados}
        />
      </section>

      {/* Situação e Decisões */}
      <section id="secao-situacao">
        <ChartCards
          section="situacao"
          title="Situação e Decisões"
          dados={dados}
        />
      </section>

      {/* Formulários e Recursos */}
      <section id="secao-formulario">
        <ChartCards
          section="formulario"
          title="Tipos de Formulário e Recursos"
          dados={dados}
        />
      </section>

      {/* Perfil do Solicitante */}
      <section id="secao-perfil">
        <ChartCards
          section="perfil"
          title="Perfil do Solicitante"
          dados={dados}
        />
      </section>

      {/* SLA */}
      <section id="secao-sla">
        <SlaSection dados={dados} />
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground py-6 border-t border-border">
        Painel Ouvidoria — Ministério do Esporte (MESP) • Dados extraídos do Fala.BR
      </footer>
    </div>
  );
}
