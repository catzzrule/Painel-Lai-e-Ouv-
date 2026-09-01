import type { KPIs } from "@/types/dados";
import { Card, CardContent } from "@/components/ui/card";
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  ThumbsUp,
} from "lucide-react";

interface OuvidoriaKpisProps {
  kpis: KPIs;
}

export function OuvidoriaKpis({ kpis }: OuvidoriaKpisProps) {
  const cards = [
    {
      title: "Total de Manifestações",
      value: kpis.total.toLocaleString("pt-BR"),
      subtitle: "Período acumulado",
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Concluídas",
      value: kpis.concluidas.toLocaleString("pt-BR"),
      subtitle: `${kpis.percentual_concluidas}% de resolução`,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Em Tratamento",
      value: kpis.em_aberto.toLocaleString("pt-BR"),
      subtitle: "Aguardando resposta",
      icon: AlertCircle,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      title: "Taxa no Prazo (Nível de Serviço)",
      value: `${kpis.taxa_no_prazo}%`,
      subtitle: `${kpis.respondidas_prazo} atendidas no prazo`,
      icon: ShieldCheck,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
    {
      title: "Tempo Médio",
      value: `${kpis.media_dias_resposta}d`,
      subtitle: `Meta: ${kpis.media_dias_prazo_sla || 20}d`,
      icon: Clock,
      color: "text-cyan-600",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
    },
    {
      title: "Elogios & Destaques",
      value: (kpis.total_elogios ?? 0).toLocaleString("pt-BR"),
      subtitle: "Reconhecimento formal",
      icon: ThumbsUp,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <Card
            key={i}
            className={`group relative overflow-hidden border ${card.borderColor} bg-gradient-to-b from-white to-slate-50/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}
          >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-r from-transparent via-current to-transparent ${card.color}`} />
            <CardContent className="p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-card-foreground/70 truncate">
                  {card.title}
                </span>
                <div className={`p-1.5 rounded-md ${card.bgColor} ${card.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight text-card-foreground">
                  {card.value}
                </div>
                <p className="text-[10px] text-card-foreground/60 truncate mt-0.5">
                  {card.subtitle}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
