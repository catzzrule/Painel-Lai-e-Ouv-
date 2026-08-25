import type { AlertaItem } from "@/types/dados";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

interface OuvidoriaAlertsProps {
  alertas: AlertaItem[];
}

export function OuvidoriaAlerts({ alertas }: OuvidoriaAlertsProps) {
  if (!alertas || alertas.length === 0) {
    return (
      <Card className="border-emerald-500/30 bg-card shadow-sm">
        <CardContent className="p-3 flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900">Tudo sob controle</h4>
            <p className="text-[11px] text-slate-700">Nenhum ponto crítico ou alerta operacional ativo no momento.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getEstilosAlerta = (tipo: string) => {
    switch (tipo) {
      case "danger":
        return {
          cardBorder: "border-red-500/50 bg-card hover:border-red-500/80 shadow-md shadow-red-950/10",
          iconBg: "bg-red-500/20 text-red-400 border border-red-500/30",
          badgeBg: "bg-red-500/25 text-red-300 border-red-500/40 font-semibold",
          badgeTexto: "Atenção Crítica",
          tituloCor: "text-red-400",
          Icon: AlertOctagon,
        };
      case "warning":
        return {
          cardBorder: "border-amber-500/50 bg-card hover:border-amber-500/80 shadow-md shadow-amber-950/10",
          iconBg: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
          badgeBg: "bg-amber-500/25 text-amber-300 border-amber-500/40 font-semibold",
          badgeTexto: "Alerta Operacional",
          tituloCor: "text-amber-400",
          Icon: AlertTriangle,
        };
      default:
        return {
          cardBorder: "border-blue-500/50 bg-card hover:border-blue-500/80 shadow-md shadow-blue-950/10",
          iconBg: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
          badgeBg: "bg-blue-500/25 text-blue-300 border-blue-500/40 font-semibold",
          badgeTexto: "Informativo",
          tituloCor: "text-blue-400",
          Icon: Info,
        };
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5 text-primary" />
          Sistema Inteligente de Alertas & Monitoramento
        </h3>
        <span className="text-[11px] font-medium text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-full">
          {alertas.length} {alertas.length === 1 ? "alerta ativo" : "alertas ativos"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {alertas.map((alerta) => {
          const { cardBorder, iconBg, badgeBg, badgeTexto, tituloCor, Icon } = getEstilosAlerta(alerta.tipo);

          return (
            <Card
              key={alerta.id}
              className={`transition-all duration-200 ${cardBorder}`}
            >
              <CardContent className="p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${iconBg}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badgeBg}`}>
                      {badgeTexto}
                    </span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <h4 className={`text-xs font-bold leading-snug ${tituloCor}`}>
                    {alerta.titulo}
                  </h4>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    {alerta.descricao}
                  </p>
                </div>

                {alerta.detalhes && (
                  <div className="pt-1.5 border-t border-border/50 text-[10px] text-slate-600 flex items-start gap-1">
                    <ChevronRight className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                    <span>{alerta.detalhes}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
