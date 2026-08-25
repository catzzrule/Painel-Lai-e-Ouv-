import { useEffect, useState } from "react";
import type { DadosOuvidoria } from "@/types/dados";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Timer, Clock, CalendarCheck, ArrowUpRight } from "lucide-react";

interface SlaSectionProps {
  dados: DadosOuvidoria;
}

const formatMes = (m: string) => {
  const nomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const [ano, mes] = m.split("-");
  return nomes[parseInt(mes, 10) - 1] + "/" + ano.slice(2);
};

export function SlaSection({ dados }: SlaSectionProps) {
  const { kpis } = dados;
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setBarWidth(kpis.taxa_no_prazo), 500);
    return () => clearTimeout(timer);
  }, [kpis.taxa_no_prazo]);

  // Chart data for stacked bar
  const statusPorMes = dados.mensal.status_prazo_por_mes;
  const allStatus = new Set<string>();
  Object.values(statusPorMes).forEach((obj) => {
    Object.keys(obj).forEach((k) => allStatus.add(k));
  });
  const statusList = Array.from(allStatus);
  const statusColors: Record<string, string> = {
    "Respondida no prazo": "#10b981",       // Verde
    "Respondida com atraso": "#f59e0b",     // Laranja
    "Em aberto - no prazo": "#3b82f6",      // Azul
    "Em aberto - em atraso": "#ef4444",     // Vermelho
  };

  const stackedData = dados.mensal.meses.map((m) => {
    const entry: Record<string, string | number> = { mes: formatMes(m) };
    statusList.forEach((s) => {
      entry[s] = statusPorMes[m]?.[s] ?? 0;
    });
    return entry;
  });

  const slaStats = [
    {
      label: "Média Dias Resposta",
      value: kpis.media_dias_resposta,
      icon: Clock,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Média de Prazo e Nível de Serviço",
      value: kpis.media_dias_prazo_sla,
      icon: CalendarCheck,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
    },

  ];

  return (
    <div>
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
        <span className="h-1 w-1 rounded-full bg-primary" />
        Nível de Serviço
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SLA Progress */}
        <Card className="border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Timer className="h-4 w-4 text-muted-foreground" />
              Cumprimento do Prazo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span className="font-semibold text-emerald-400 text-sm">{kpis.taxa_no_prazo}%</span>
                <span>100%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-1500 ease-out shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                  style={{ width: `${barWidth}%`, transitionDuration: "1.5s" }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {kpis.respondidas_prazo} de {kpis.concluidas} concluídas respondidas no prazo
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {slaStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="flex flex-col items-center p-3 rounded-lg bg-secondary/50 border border-border/50"
                  >
                    <div className={`p-1.5 rounded-md ${stat.bgColor} mb-2`}>
                      <Icon className={`h-3.5 w-3.5 ${stat.color}`} />
                    </div>
                    <span className="text-lg font-bold">{stat.value}</span>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight mt-1">
                      {stat.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Stacked bar chart */}
        <Card className="border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Timer className="h-4 w-4 text-muted-foreground" />
              Status do Prazo por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stackedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="mes" tick={{ fill: "#000000ff", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "var(--color-card-foreground)",
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span className="text-xs text-muted-foreground">{value}</span>
                  )}
                />
                {statusList.map((status, i) => (
                  <Bar
                    key={status}
                    dataKey={status}
                    stackId="a"
                    fill={statusColors[status] || ["#3b82f6", "#f59e0b", "#ef4444"][i]}
                    radius={i === statusList.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
