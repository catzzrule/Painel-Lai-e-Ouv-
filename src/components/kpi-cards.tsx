import type { KPIs } from "@/types/dados";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardsProps {
  kpis: KPIs;
}

const kpiConfig = [
  {
    key: "total" as const,
    label: "Total de Manifestações",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/20",
    format: (v: number) => v.toLocaleString("pt-BR"),
    sub: "Período acumulado",
  },
  {
    key: "concluidas" as const,
    label: "Concluídas",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/20",
    borderColor: "border-emerald-500/20",
    format: (v: number) => v.toLocaleString("pt-BR"),
    subKey: "percentual_concluidas" as const,
    subFormat: (v: number) => `${v}% do total`,
  },
  {
    key: "media_dias_resposta" as const,
    label: "Tempo Médio de Resposta",
    icon: Clock,
    color: "text-cyan-600",
    bgColor: "bg-cyan-500/20",
    borderColor: "border-cyan-500/20",
    format: (v: number) => `${v}`,
    suffix: "dias",
    sub: "Média geral",
  },
  {
    key: "taxa_no_prazo" as const,
    label: "Taxa no Prazo",
    icon: ShieldCheck,
    color: "text-green-600",
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500/20",
    format: (v: number) => `${v}%`,
    sub: "Das concluídas",
  },
  {
    key: "em_aberto" as const,
    label: "Em Aberto",
    icon: AlertCircle,
    color: "text-amber-600",
    bgColor: "bg-amber-500/20",
    borderColor: "border-amber-500/20",
    format: (v: number) => v.toLocaleString("pt-BR"),
    sub: "Encaminhadas",
  },
  {
    key: "cadastradas" as const,
    label: "Tratamento",
    icon: AlertCircle,
    color: "text-orange-600",
    bgColor: "bg-orange-500/20",
    borderColor: "border-orange-500/20",
    format: (v: number) => (v ?? 0).toLocaleString("pt-BR"),
    sub: "Situação Cadastrada",
  },
  {
    key: "com_recurso" as const,
    label: "Recursos Interpostos",
    icon: Scale,
    color: "text-violet-600",
    bgColor: "bg-violet-500/20",
    borderColor: "border-violet-500/20",
    format: (v: number) => v.toLocaleString("pt-BR"),
    sub: "Com recurso respondido",
  },
];

export function KpiCards({ kpis }: KpiCardsProps) {
  return (
    <div>
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
        <span className="h-1 w-1 rounded-full bg-primary" />
        Indicadores Gerais
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4">
        {kpiConfig.filter(item => kpis[item.key] !== undefined).map((item, index) => {
          const Icon = item.icon;
          const value = kpis[item.key] as number;
          const subText = item.subKey
            ? item.subFormat?.(kpis[item.subKey] as number) ?? ""
            : item.sub ?? "";

          return (
            <Card
              key={item.key}
              className={cn(
                "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
                item.borderColor,
                "animate-fade-in-up"
              )}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <CardContent className="p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-card-foreground/70 truncate pr-2">
                    {item.label}
                  </span>
                  <div className={cn("p-1.5 rounded-md shrink-0", item.bgColor, item.color)}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div>
                  <div className="text-xl font-bold tracking-tight text-card-foreground">
                    {item.format(value)}
                    {item.suffix && (
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        {item.suffix}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-card-foreground/60 truncate mt-0.5">
                    {subText}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
