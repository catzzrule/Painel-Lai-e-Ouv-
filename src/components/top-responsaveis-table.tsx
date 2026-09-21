import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Award } from "lucide-react";
import type { ResponsavelStats } from "@/types/dados";

interface TopResponsaveisTableProps {
  dados: ResponsavelStats[];
}

function statusBadge(taxaConclusao: number) {
  if (taxaConclusao >= 90) {
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
        TOP
      </span>
    );
  }
  if (taxaConclusao >= 70) {
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30">
        OK
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30">
      ATENÇÃO
    </span>
  );
}

export function TopResponsaveisTable({ dados }: TopResponsaveisTableProps) {
  if (!dados?.length) return null;

  return (
    <Card className="border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Award className="h-4 w-4 text-muted-foreground" />
          Top {dados.length} Responsáveis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto max-h-96 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-card z-10 border-b border-border">
              <tr>
                <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2">
                  Responsável
                </th>
                <th className="text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2">
                  Total
                </th>
                <th className="text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2">
                  Taxa Concl.
                </th>
                <th className="text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2">
                  Dias Méd.
                </th>
                <th className="text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {dados.map((r) => (
                <tr key={r.nome} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-2 text-card-foreground max-w-[320px]">
                    <span className="line-clamp-1">{r.nome}</span>
                  </td>
                  <td className="px-2 py-2 text-right font-semibold text-card-foreground tabular-nums">
                    {r.total.toLocaleString("pt-BR")}
                  </td>
                  <td className="px-2 py-2 text-right text-muted-foreground tabular-nums">
                    {r.taxaConclusao.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                  </td>
                  <td className="px-2 py-2 text-right text-muted-foreground tabular-nums">
                    {r.diasMedio.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}d
                  </td>
                  <td className="px-4 py-2 text-right">
                    {statusBadge(r.taxaConclusao)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
