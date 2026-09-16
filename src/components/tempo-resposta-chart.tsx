import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Clock } from "lucide-react";
import { formatMesLabel } from "@/lib/use-date-filter";

interface TempoRespostaChartProps {
  meses: string[];
  mediaDias: number[];
  title?: string;
}

const CustomDotTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl text-card-foreground text-xs">
      <p className="font-semibold mb-0.5">{label}</p>
      <p>{payload[0].value} dias</p>
    </div>
  );
};

export function TempoRespostaChart({ meses, mediaDias, title = "Tempo Médio de Resposta" }: TempoRespostaChartProps) {
  const chartData = meses.map((m, i) => ({ mes: formatMesLabel(m), dias: mediaDias[i] ?? 0 }));
  const maxValue = Math.max(0, ...mediaDias);
  const maxTick = Math.max(4, Math.ceil((maxValue || 1) / 4) * 4);
  const ticks = [0, maxTick / 4, maxTick / 2, (maxTick * 3) / 4, maxTick];

  return (
    <Card className="border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="mes"
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "var(--color-border)" }}
              />
              <YAxis
                domain={[0, maxTick]}
                ticks={ticks}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <Tooltip content={<CustomDotTooltip />} cursor={{ stroke: "var(--color-border)", strokeDasharray: "3 3" }} />
              <Line
                type="linear"
                dataKey="dias"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                dot={{ r: 6, fill: "var(--color-foreground)", strokeWidth: 0 }}
                activeDot={{ r: 7, fill: "var(--color-foreground)" }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <span className="text-sm text-muted-foreground font-medium pl-2 flex-shrink-0">Dias</span>
        </div>
      </CardContent>
    </Card>
  );
}
